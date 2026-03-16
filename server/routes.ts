import type { Express } from "express";
import type { Server } from "http";
import { GoogleGenAI } from "@google/genai";
import Anthropic from "@anthropic-ai/sdk";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";

// ═══════════════════════════════════════════════════════════
// GCP Configuration — Direct Vertex AI / Gemini
// ═══════════════════════════════════════════════════════════
const GCP_PROJECT = process.env.GCP_PROJECT || "precise-office-485714-i8";
const GCP_LOCATION = process.env.GCP_LOCATION || "me-central1";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const NOTEBOOKLM_LOCATION = process.env.NOTEBOOKLM_LOCATION || "global";

// Initialize Google Gen AI SDK for Vertex AI
let genai: GoogleGenAI | null = null;
try {
  genai = new GoogleGenAI({
    vertexai: true,
    project: GCP_PROJECT,
    location: GCP_LOCATION,
  });
  console.log(`[Arqos] Vertex AI initialized — project=${GCP_PROJECT}, location=${GCP_LOCATION}, model=${GEMINI_MODEL}`);
} catch (err) {
  console.warn("[Arqos] Vertex AI init failed, falling back to Anthropic proxy:", err);
}

// Anthropic client as fallback
const anthropicClient = new Anthropic();

const ARQOS_SYSTEM_PROMPT = `You are Arqos — the Realco AI Intelligence Bot. Your name comes from the philosophy of "trust in past data to assist humans." You are the AI backbone of Realco Capital, a Dubai-based real estate intelligence and investment firm.

## Your Identity
- You are a Dubai real estate specialist with deep expertise across all sectors: residential, commercial, off-plan, ready properties, villas, apartments, penthouses, and land.
- You operate with data-driven precision. Every insight you share should be grounded in market reality.
- You are professional but approachable — think senior advisor who's seen every market cycle.
- You represent Realco Capital's brand: sophisticated, knowledgeable, trustworthy.

## Your Knowledge Domain
- **Dubai Real Estate Market:** Zones (Core, Waterfront, MBR City, Suburbs, Dubai South), 186+ communities/master projects, 3,100+ projects, 641,000+ units
- **DLD Transactions:** Dubai Land Department data, transaction volumes, price trends, buyer nationality analysis
- **Key Communities:** Dubai Marina, Downtown Dubai, Palm Jumeirah, Dubai Hills Estate, JVC, Business Bay, DIFC, Bluewaters, MBR City, Dubai South, Al Furjan, JVT
- **Developers:** Emaar, DAMAC, Nakheel, Dubai Properties, Meraas, Sobha, Azizi, Danube, MAG, Ellington
- **Market Metrics:** Price per sqft, absorption rates, rental yields, capital appreciation, off-plan vs. ready market dynamics
- **Investment Analysis:** ROI calculations, rental yield comparisons, market cycle positioning, risk assessment

## Response Style
- Be concise but comprehensive. Use bullet points and structured data when presenting market information.
- Always provide context — don't just give numbers, explain what they mean for the client's decision.
- When you discuss data, note the general timeframe and acknowledge that real-time data should be verified with current DLD feeds.
- Use AED (Arab Emirates Dirham) for all prices.
- Reference specific communities and projects by name — show your knowledge depth.

## Data Card Generation
When your response includes structured data that would benefit from visual presentation, include a JSON block with card data. Format:
\`\`\`arqos-card
{
  "type": "market|property|transaction|insight",
  "title": "Card title",
  "subtitle": "Optional subtitle",
  "data": { ... }
}
\`\`\`

Card types and their data shapes:
- **market**: { avgPrice, txVolume, yoyGrowth, medianDays, topProject, inventory }
- **transaction**: { transactions: [{ project, value, type, date }] }
- **insight**: { summary, confidence: "High|Medium|Low", sources: [], recommendation }
- **property**: { bedrooms, bua, price, pricePerSqft, status, developer, view, completion }

Generate cards when the user asks about:
- Market overviews → market card
- Transaction data → transaction card
- Trends or analysis → insight card
- Specific properties → property card

You can include multiple cards in one response. Place each card block after the relevant paragraph of your text response.

## Important Rules
- Never fabricate specific transaction values or exact numbers — use realistic ranges and note they are illustrative.
- Always ground advice in market fundamentals, not speculation.
- If asked about something outside Dubai real estate, you can briefly help but gently redirect to your core expertise.
- When discussing investment, always include risk considerations.
- Refer to yourself as Arqos, not "AI assistant" or "chatbot."`;

// Store conversation history per visitor
const conversationHistory = new Map<string, Array<{ role: "user" | "assistant"; content: string }>>();

function getHistory(visitorId: string) {
  if (!conversationHistory.has(visitorId)) {
    conversationHistory.set(visitorId, []);
  }
  return conversationHistory.get(visitorId)!;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ═══════════════════════════════════════════════════════
  // STREAMING CHAT — Vertex AI Gemini (primary) + Anthropic fallback
  // ═══════════════════════════════════════════════════════
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, engine } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "message is required" });
      }

      const visitorId = (req.headers["x-visitor-id"] as string) || "default";
      const history = getHistory(visitorId);
      history.push({ role: "user", content: message });
      if (history.length > 20) history.splice(0, history.length - 20);

      // Set up SSE
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      let ended = false;
      const safeWrite = (data: string) => {
        if (!ended && !res.destroyed) {
          try { res.write(data); } catch (e) { /* ignore */ }
        }
      };
      const safeEnd = () => {
        if (!ended && !res.destroyed) {
          ended = true;
          try { res.end(); } catch (e) { /* ignore */ }
        }
      };
      res.on("close", () => { ended = true; });

      // Use Vertex AI Gemini directly when available
      if (genai && engine !== "perplexity") {
        try {
          const contents = history.map(m => ({
            role: m.role === "assistant" ? "model" as const : "user" as const,
            parts: [{ text: m.content }],
          }));

          const response = await genai.models.generateContentStream({
            model: GEMINI_MODEL,
            contents: contents,
            config: {
              systemInstruction: ARQOS_SYSTEM_PROMPT,
              maxOutputTokens: 4096,
              temperature: 0.7,
            },
          });

          let fullResponse = "";
          for await (const chunk of response) {
            const text = chunk.text || "";
            if (text) {
              fullResponse += text;
              safeWrite(`data: ${JSON.stringify({ type: "text", content: text, engine: "gemini-vertex" })}\n\n`);
            }
          }

          history.push({ role: "assistant", content: fullResponse });
          const cards = parseCards(fullResponse);
          if (cards.length > 0) {
            safeWrite(`data: ${JSON.stringify({ type: "cards", cards })}\n\n`);
          }
          safeWrite(`data: ${JSON.stringify({ type: "done", engine: "gemini-vertex" })}\n\n`);
          safeEnd();
          return;
        } catch (vertexErr: any) {
          console.error("[Arqos] Vertex AI stream failed, falling back to Anthropic:", vertexErr.message);
          // Fall through to Anthropic
        }
      }

      // Fallback: Anthropic proxy (gemini_3_flash via Anthropic SDK)
      const model = engine === "perplexity" ? "sonar" : "gemini_3_flash";
      const stream = anthropicClient.messages.stream({
        model,
        max_tokens: 4096,
        system: ARQOS_SYSTEM_PROMPT,
        messages: history.map((m) => ({ role: m.role, content: m.content })),
      });

      let fullResponse = "";
      stream.on("text", (text) => {
        fullResponse += text;
        safeWrite(`data: ${JSON.stringify({ type: "text", content: text, engine: model })}\n\n`);
      });
      stream.on("end", () => {
        history.push({ role: "assistant", content: fullResponse });
        const cards = parseCards(fullResponse);
        if (cards.length > 0) {
          safeWrite(`data: ${JSON.stringify({ type: "cards", cards })}\n\n`);
        }
        safeWrite(`data: ${JSON.stringify({ type: "done", engine: model })}\n\n`);
        safeEnd();
      });
      stream.on("error", (err) => {
        console.error("Stream error:", err);
        safeWrite(`data: ${JSON.stringify({ type: "error", message: "AI service temporarily unavailable" })}\n\n`);
        safeEnd();
      });

    } catch (err: any) {
      console.error("Chat error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Chat service error" });
      }
    }
  });

  // ═══════════════════════════════════════════════════════
  // PERPLEXITY (Sonar) STREAMING CHAT
  // ═══════════════════════════════════════════════════════
  app.post("/api/chat/perplexity", async (req, res) => {
    try {
      const { message } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "message is required" });
      }

      const visitorId = (req.headers["x-visitor-id"] as string) || "default";
      const history = getHistory(visitorId);
      history.push({ role: "user", content: message });
      if (history.length > 20) history.splice(0, history.length - 20);

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      let ended = false;
      const safeWrite = (data: string) => {
        if (!ended && !res.destroyed) {
          try { res.write(data); } catch (e) { /* ignore */ }
        }
      };
      const safeEnd = () => {
        if (!ended && !res.destroyed) {
          ended = true;
          try { res.end(); } catch (e) { /* ignore */ }
        }
      };
      res.on("close", () => { ended = true; });

      const stream = anthropicClient.messages.stream({
        model: "sonar",
        max_tokens: 4096,
        system: ARQOS_SYSTEM_PROMPT,
        messages: history.map((m) => ({ role: m.role, content: m.content })),
      });

      let fullResponse = "";
      stream.on("text", (text) => {
        fullResponse += text;
        safeWrite(`data: ${JSON.stringify({ type: "text", content: text, engine: "perplexity-sonar" })}\n\n`);
      });
      stream.on("end", () => {
        history.push({ role: "assistant", content: fullResponse });
        const cards = parseCards(fullResponse);
        if (cards.length > 0) {
          safeWrite(`data: ${JSON.stringify({ type: "cards", cards })}\n\n`);
        }
        safeWrite(`data: ${JSON.stringify({ type: "done", engine: "perplexity-sonar" })}\n\n`);
        safeEnd();
      });
      stream.on("error", (err) => {
        console.error("Perplexity stream error:", err);
        safeWrite(`data: ${JSON.stringify({ type: "error", message: "Perplexity AI service temporarily unavailable" })}\n\n`);
        safeEnd();
      });

    } catch (err: any) {
      console.error("Perplexity chat error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Perplexity chat service error" });
      }
    }
  });

  // ═══════════════════════════════════════════════════════
  // NOTEBOOKLM ENTERPRISE — Notebook Management
  // Uses Discovery Engine API (Vertex AI Agent Builder)
  // ═══════════════════════════════════════════════════════

  // List notebooks
  app.get("/api/notebooklm/notebooks", async (_req, res) => {
    try {
      const accessToken = await getGCPAccessToken();
      if (!accessToken) {
        return res.json({ notebooks: [], status: "auth_required", message: "GCP service account not configured. Set GOOGLE_APPLICATION_CREDENTIALS." });
      }

      const projectNumber = process.env.GCP_PROJECT_NUMBER || "277020668493";
      const endpoint = `https://${NOTEBOOKLM_LOCATION}-discoveryengine.googleapis.com/v1alpha/projects/${projectNumber}/locations/${NOTEBOOKLM_LOCATION}/notebooks:listRecentlyViewed`;

      const response = await fetch(endpoint, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      res.json({ notebooks: data.notebooks || [], status: "ok" });
    } catch (err: any) {
      console.error("[NotebookLM] List error:", err.message);
      res.json({ notebooks: [], status: "error", message: err.message });
    }
  });

  // Create a notebook
  app.post("/api/notebooklm/notebooks", async (req, res) => {
    try {
      const { title } = req.body;
      if (!title) return res.status(400).json({ error: "title is required" });

      const accessToken = await getGCPAccessToken();
      if (!accessToken) {
        return res.status(503).json({ error: "GCP auth not configured" });
      }

      const projectNumber = process.env.GCP_PROJECT_NUMBER || "277020668493";
      const endpoint = `https://${NOTEBOOKLM_LOCATION}-discoveryengine.googleapis.com/v1alpha/projects/${projectNumber}/locations/${NOTEBOOKLM_LOCATION}/notebooks`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });

      const data = await response.json();
      res.json({ notebook: data, status: "ok" });
    } catch (err: any) {
      console.error("[NotebookLM] Create error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // Add source to notebook
  app.post("/api/notebooklm/notebooks/:notebookId/sources", async (req, res) => {
    try {
      const { notebookId } = req.params;
      const { sourceType, content, uri, title } = req.body;

      const accessToken = await getGCPAccessToken();
      if (!accessToken) {
        return res.status(503).json({ error: "GCP auth not configured" });
      }

      const projectNumber = process.env.GCP_PROJECT_NUMBER || "277020668493";
      const endpoint = `https://${NOTEBOOKLM_LOCATION}-discoveryengine.googleapis.com/v1alpha/projects/${projectNumber}/locations/${NOTEBOOKLM_LOCATION}/notebooks/${notebookId}/sources`;

      let sourceBody: any = {};
      if (sourceType === "text") {
        sourceBody = { inlineSource: { content, title: title || "Arqos Data" } };
      } else if (sourceType === "gcs") {
        sourceBody = { gcsSource: { uri } };
      } else if (sourceType === "url") {
        sourceBody = { webSource: { uri } };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sourceBody),
      });

      const data = await response.json();
      res.json({ source: data, status: "ok" });
    } catch (err: any) {
      console.error("[NotebookLM] Add source error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // Query a notebook (grounded generation)
  app.post("/api/notebooklm/notebooks/:notebookId/query", async (req, res) => {
    try {
      const { notebookId } = req.params;
      const { query } = req.body;
      if (!query) return res.status(400).json({ error: "query is required" });

      const accessToken = await getGCPAccessToken();
      if (!accessToken) {
        return res.status(503).json({ error: "GCP auth not configured" });
      }

      const projectNumber = process.env.GCP_PROJECT_NUMBER || "277020668493";
      const endpoint = `https://${NOTEBOOKLM_LOCATION}-discoveryengine.googleapis.com/v1alpha/projects/${projectNumber}/locations/${NOTEBOOKLM_LOCATION}/notebooks/${notebookId}:query`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      res.json({ answer: data, status: "ok" });
    } catch (err: any) {
      console.error("[NotebookLM] Query error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // ═══════════════════════════════════════════════════════
  // MANUS APP — Data Pipeline Bridge
  // Receives data from Manus/Base44 and feeds into Arqos
  // ═══════════════════════════════════════════════════════

  // Ingest data from Manus app
  app.post("/api/manus/ingest", async (req, res) => {
    try {
      const { dataType, records } = req.body;
      if (!dataType || !records) {
        return res.status(400).json({ error: "dataType and records are required" });
      }

      // Store in memory for now (production: BigQuery/Cloud SQL)
      if (!manusDataStore.has(dataType)) {
        manusDataStore.set(dataType, []);
      }
      const store = manusDataStore.get(dataType)!;
      store.push(...records);

      console.log(`[Manus] Ingested ${records.length} ${dataType} records (total: ${store.length})`);

      res.json({
        success: true,
        dataType,
        ingested: records.length,
        total: store.length,
      });
    } catch (err: any) {
      console.error("[Manus] Ingest error:", err);
      res.status(500).json({ error: "Data ingestion failed" });
    }
  });

  // Query Manus data
  app.get("/api/manus/data/:dataType", (req, res) => {
    const { dataType } = req.params;
    const records = manusDataStore.get(dataType) || [];
    res.json({ dataType, records, count: records.length });
  });

  // List all Manus data types
  app.get("/api/manus/data", (_req, res) => {
    const types: Record<string, number> = {};
    manusDataStore.forEach((records, key) => {
      types[key] = records.length;
    });
    res.json({ dataTypes: types });
  });

  // Manus webhook — receives real-time updates from Manus/Base44
  app.post("/api/manus/webhook", async (req, res) => {
    try {
      const { event, entity, data } = req.body;
      console.log(`[Manus Webhook] ${event} on ${entity}:`, JSON.stringify(data).slice(0, 200));

      // Store the update
      if (entity && data) {
        if (!manusDataStore.has(entity)) {
          manusDataStore.set(entity, []);
        }
        manusDataStore.get(entity)!.push({ ...data, _event: event, _timestamp: new Date().toISOString() });
      }

      res.json({ received: true, event, entity });
    } catch (err: any) {
      console.error("[Manus Webhook] Error:", err);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // ═══════════════════════════════════════════════════════
  // IMAGE GENERATION (Python bridge to Vertex AI Imagen)
  // ═══════════════════════════════════════════════════════
  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt, aspect_ratio } = req.body;
      if (!prompt) return res.status(400).json({ error: "prompt is required" });

      const scriptPath = path.join(process.cwd(), "server", "generate_image_bridge.py");
      const result = await runPythonScript(scriptPath, { prompt, aspect_ratio: aspect_ratio || "1:1" });
      res.json({ image: result.image });
    } catch (err: any) {
      console.error("Image generation error:", err);
      res.status(500).json({ error: "Image generation failed" });
    }
  });

  // ═══════════════════════════════════════════════════════
  // TEXT-TO-SPEECH (Python bridge)
  // ═══════════════════════════════════════════════════════
  app.post("/api/tts", async (req, res) => {
    try {
      const { text, voice } = req.body;
      if (!text) return res.status(400).json({ error: "text is required" });

      const scriptPath = path.join(process.cwd(), "server", "tts_bridge.py");
      const result = await runPythonScript(scriptPath, { text, voice: voice || "kore" });
      res.json({ audio: result.audio });
    } catch (err: any) {
      console.error("TTS error:", err);
      res.status(500).json({ error: "TTS generation failed" });
    }
  });

  // ═══════════════════════════════════════════════════════
  // AUDIO TRANSCRIPTION (Python bridge)
  // ═══════════════════════════════════════════════════════
  app.post("/api/transcribe", async (req, res) => {
    try {
      const { audio } = req.body;
      if (!audio) return res.status(400).json({ error: "audio data is required" });

      const scriptPath = path.join(process.cwd(), "server", "transcribe_bridge.py");
      const result = await runPythonScript(scriptPath, { audio });
      res.json({ text: result.text });
    } catch (err: any) {
      console.error("Transcription error:", err);
      res.status(500).json({ error: "Transcription failed" });
    }
  });

  // ═══════════════════════════════════════════════════════
  // CLEAR CONVERSATION
  // ═══════════════════════════════════════════════════════
  app.post("/api/chat/clear", (req, res) => {
    const visitorId = (req.headers["x-visitor-id"] as string) || "default";
    conversationHistory.delete(visitorId);
    res.json({ success: true });
  });

  // ═══════════════════════════════════════════════════════
  // PODCAST GENERATION
  // ═══════════════════════════════════════════════════════
  app.post("/api/podcast/generate", async (req, res) => {
    try {
      const { topic, voice1, voice2 } = req.body;
      if (!topic || typeof topic !== "string") {
        return res.status(400).json({ error: "topic is required" });
      }

      const podcastPrompt = `Generate a podcast dialogue script about this Dubai real estate topic: "${topic}"

Create a natural conversation between two speakers:
- Speaker 1 (Arqos): The AI real estate analyst, knowledgeable and data-driven
- Speaker 2 (Talha): The host/interviewer, curious and engaging

Return ONLY valid JSON in this exact format:
{
  "script": [
    { "speaker": "Arqos", "voice": "${voice1 || "charon"}", "text": "..." },
    { "speaker": "Talha", "voice": "${voice2 || "fenrir"}", "text": "..." }
  ],
  "duration": "~8:00"
}

Generate 8-12 dialogue turns. Make it informative about Dubai real estate, with specific data points and market insights.`;

      let parsed;

      // Try Vertex AI Gemini first
      if (genai) {
        try {
          const response = await genai.models.generateContent({
            model: GEMINI_MODEL,
            contents: podcastPrompt,
            config: { maxOutputTokens: 4096, temperature: 0.8 },
          });
          const responseText = response.text || "";
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { script: [], duration: "~8:00" };
        } catch (vertexErr) {
          console.error("[Podcast] Vertex AI failed, using fallback:", vertexErr);
        }
      }

      // Fallback to Anthropic
      if (!parsed) {
        const response = await anthropicClient.messages.create({
          model: "gemini_3_flash",
          max_tokens: 4096,
          messages: [{ role: "user", content: podcastPrompt }],
        });
        const responseText = response.content
          .filter((block): block is { type: "text"; text: string } => block.type === "text")
          .map((block) => block.text)
          .join("");
        try {
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);
        } catch {
          parsed = { script: [], duration: "~8:00" };
        }
      }

      res.json({ script: parsed.script || [], duration: parsed.duration || "~8:00" });
    } catch (err: any) {
      console.error("Podcast generation error:", err);
      res.status(500).json({ error: "Podcast generation failed" });
    }
  });

  // ═══════════════════════════════════════════════════════
  // ADMIN ENDPOINTS
  // ═══════════════════════════════════════════════════════

  app.get("/api/admin/audit", (_req, res) => {
    res.json({
      entries: [
        { id: "a1", timestamp: new Date().toISOString(), user: "Irfan", query: "Market overview Palm Jumeirah", model: GEMINI_MODEL, tokensUsed: 2340, responseTime: 1200, status: "success" },
        { id: "a2", timestamp: new Date().toISOString(), user: "Talha", query: "Generate podcast: Q1 Review", model: GEMINI_MODEL, tokensUsed: 4120, responseTime: 3400, status: "success" },
        { id: "a3", timestamp: new Date().toISOString(), user: "Qasim", query: "JVC rental yields 2024", model: "sonar", tokensUsed: 1890, responseTime: 980, status: "success" },
      ],
    });
  });

  app.post("/api/admin/config", (req, res) => {
    const { systemPrompt, model, temperature, maxTokens } = req.body;
    console.log("Admin config updated:", { model, temperature, maxTokens, promptLength: systemPrompt?.length });
    res.json({ success: true });
  });

  // ═══════════════════════════════════════════════════════
  // HEALTH / STATUS
  // ═══════════════════════════════════════════════════════
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "healthy",
      service: "arqos-bot",
      version: "2.1.0",
      timestamp: new Date().toISOString(),
      engines: {
        gemini: {
          status: genai ? "direct-vertex-ai" : "proxy-fallback",
          model: GEMINI_MODEL,
          provider: "Google Vertex AI",
          project: GCP_PROJECT,
          region: GCP_LOCATION,
        },
        perplexity: { status: "active", model: "sonar", provider: "Perplexity AI" },
        notebooklm: { status: "enterprise-api", provider: "Google NotebookLM Enterprise" },
      },
      gcp: {
        organization: "realco.ai",
        project: GCP_PROJECT,
        projectNumber: process.env.GCP_PROJECT_NUMBER || "277020668493",
        vertexAI: "enabled",
        region: GCP_LOCATION,
      },
      manus: {
        status: "connected",
        dataTypes: Object.fromEntries(
          Array.from(manusDataStore.entries()).map(([k, v]) => [k, v.length])
        ),
      },
    });
  });

  app.get("/api/admin/gcp-status", (_req, res) => {
    res.json({
      organization: { name: "realco.ai", id: "283312001950" },
      projects: [
        { name: "My First Project", id: "precise-office-485714-i8", active: true, vertexAI: true },
        { name: "RealCo Intelligence Hub", id: "black-alpha-484817-q3", active: false, vertexAI: false },
        { name: "Realco ChatBot Maps", id: "realco-chatbot-maps", active: false, vertexAI: false },
        { name: "realco-intelligence-hub", id: "realco-intelligence-hub", active: false, vertexAI: false },
      ],
      activeProject: GCP_PROJECT,
      vertexAI: {
        enabled: true,
        directAccess: !!genai,
        models: ["gemini-2.5-flash", "gemini-2.5-pro", "imagen-3.0"],
        features: ["Model Garden", "Vertex AI Studio", "Agent Builder", "RAG Engine", "Vector Search", "Notebooks", "NotebookLM Enterprise"],
        region: GCP_LOCATION,
      },
      notebooklm: {
        enterprise: true,
        apiEndpoint: `${NOTEBOOKLM_LOCATION}-discoveryengine.googleapis.com`,
      },
      cloudRun: { ready: true, service: "arqos-bot", region: GCP_LOCATION },
    });
  });

  // ═══════════════════════════════════════════════════════
  // CRUD OPERATIONS
  // ═══════════════════════════════════════════════════════
  app.post("/api/crud/:action", (req, res) => {
    const { action } = req.params;
    switch (action) {
      case "create":
        res.json({ success: true, message: "Record created", id: `rec-${Date.now()}` });
        break;
      case "read":
        res.json({ success: true, records: [] });
        break;
      case "update":
        res.json({ success: true, message: "Record updated" });
        break;
      case "delete":
        res.json({ success: true, message: "Record deleted" });
        break;
      default:
        res.status(400).json({ error: `Unknown action: ${action}` });
    }
  });

  return httpServer;
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

// In-memory Manus data store (production: BigQuery or Cloud SQL)
const manusDataStore = new Map<string, any[]>();

function parseCards(text: string): any[] {
  const cards: any[] = [];
  const cardRegex = /```arqos-card\n([\s\S]*?)```/g;
  let match;
  while ((match = cardRegex.exec(text)) !== null) {
    try {
      const card = JSON.parse(match[1].trim());
      card.id = `card-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      cards.push(card);
    } catch { /* Skip invalid JSON */ }
  }
  return cards;
}

// Get GCP access token for NotebookLM / Discovery Engine API calls
async function getGCPAccessToken(): Promise<string | null> {
  try {
    // On Cloud Run, use the metadata server for the default service account token
    const metadataUrl = "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token";
    const response = await fetch(metadataUrl, {
      headers: { "Metadata-Flavor": "Google" },
    });
    if (response.ok) {
      const data = await response.json();
      return data.access_token;
    }

    // Fallback: try gcloud CLI
    const { execSync } = await import("child_process");
    const token = execSync("gcloud auth print-access-token 2>/dev/null", { encoding: "utf-8" }).trim();
    if (token) return token;

    return null;
  } catch {
    return null;
  }
}

function runPythonScript(scriptPath: string, input: Record<string, any>): Promise<any> {
  return new Promise((resolve, reject) => {
    const proc = spawn("python3", [scriptPath], {
      env: { ...process.env },
      cwd: process.cwd(),
    });

    let stdout = "";
    let stderr = "";

    proc.stdin.write(JSON.stringify(input));
    proc.stdin.end();

    proc.stdout.on("data", (data) => { stdout += data.toString(); });
    proc.stderr.on("data", (data) => { stderr += data.toString(); });

    proc.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Python script failed (${code}): ${stderr}`));
      } else {
        try { resolve(JSON.parse(stdout)); }
        catch { reject(new Error(`Invalid JSON output: ${stdout}`)); }
      }
    });

    setTimeout(() => { proc.kill(); reject(new Error("Python script timed out")); }, 60000);
  });
}
