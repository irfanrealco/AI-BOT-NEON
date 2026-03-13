import type { Express } from "express";
import type { Server } from "http";
import Anthropic from "@anthropic-ai/sdk";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";

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

  // ── Streaming Chat ─────────────────────────────────────
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "message is required" });
      }

      const visitorId = (req.headers["x-visitor-id"] as string) || "default";
      const history = getHistory(visitorId);

      // Add user message to history
      history.push({ role: "user", content: message });

      // Keep last 20 messages for context
      if (history.length > 20) {
        history.splice(0, history.length - 20);
      }

      const client = new Anthropic();

      // Set up SSE
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = client.messages.stream({
        model: "gemini_3_flash",
        max_tokens: 4096,
        system: ARQOS_SYSTEM_PROMPT,
        messages: history.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      let fullResponse = "";
      let ended = false;

      const safeWrite = (data: string) => {
        if (!ended && !res.destroyed) {
          try { res.write(data); } catch (e) { /* ignore write errors */ }
        }
      };

      const safeEnd = () => {
        if (!ended && !res.destroyed) {
          ended = true;
          try { res.end(); } catch (e) { /* ignore end errors */ }
        }
      };

      stream.on("text", (text) => {
        fullResponse += text;
        safeWrite(`data: ${JSON.stringify({ type: "text", content: text })}\n\n`);
      });

      stream.on("end", () => {
        // Save assistant response to history
        history.push({ role: "assistant", content: fullResponse });

        // Parse any arqos-card blocks from the response
        const cards = parseCards(fullResponse);
        if (cards.length > 0) {
          safeWrite(`data: ${JSON.stringify({ type: "cards", cards })}\n\n`);
        }

        safeWrite(`data: ${JSON.stringify({ type: "done" })}\n\n`);
        safeEnd();
      });

      stream.on("error", (err) => {
        console.error("Stream error:", err);
        safeWrite(`data: ${JSON.stringify({ type: "error", message: "AI service temporarily unavailable" })}\n\n`);
        safeEnd();
      });

      res.on("close", () => { ended = true; });

    } catch (err: any) {
      console.error("Chat error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Chat service error" });
      }
    }
  });

  // ── Image Generation (Python helper) ──────────────────
  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt, aspect_ratio } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "prompt is required" });
      }

      const scriptPath = path.join(process.cwd(), "server", "generate_image_bridge.py");
      const result = await runPythonScript(scriptPath, {
        prompt,
        aspect_ratio: aspect_ratio || "1:1",
      });

      res.json({ image: result.image });
    } catch (err: any) {
      console.error("Image generation error:", err);
      res.status(500).json({ error: "Image generation failed" });
    }
  });

  // ── Text-to-Speech (Python helper) ────────────────────
  app.post("/api/tts", async (req, res) => {
    try {
      const { text, voice } = req.body;
      if (!text) {
        return res.status(400).json({ error: "text is required" });
      }

      const scriptPath = path.join(process.cwd(), "server", "tts_bridge.py");
      const result = await runPythonScript(scriptPath, {
        text,
        voice: voice || "kore",
      });

      res.json({ audio: result.audio });
    } catch (err: any) {
      console.error("TTS error:", err);
      res.status(500).json({ error: "TTS generation failed" });
    }
  });

  // ── Audio Transcription (Python helper) ────────────────
  app.post("/api/transcribe", async (req, res) => {
    try {
      const { audio } = req.body; // base64 audio data
      if (!audio) {
        return res.status(400).json({ error: "audio data is required" });
      }

      const scriptPath = path.join(process.cwd(), "server", "transcribe_bridge.py");
      const result = await runPythonScript(scriptPath, { audio });

      res.json({ text: result.text });
    } catch (err: any) {
      console.error("Transcription error:", err);
      res.status(500).json({ error: "Transcription failed" });
    }
  });

  // ── Clear conversation history ────────────────────────
  app.post("/api/chat/clear", (req, res) => {
    const visitorId = (req.headers["x-visitor-id"] as string) || "default";
    conversationHistory.delete(visitorId);
    res.json({ success: true });
  });

  // ── Perplexity (Sonar) Streaming Chat ───────────────
  app.post("/api/chat/perplexity", async (req, res) => {
    try {
      const { message } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "message is required" });
      }

      const visitorId = (req.headers["x-visitor-id"] as string) || "default";
      const history = getHistory(visitorId);

      history.push({ role: "user", content: message });

      if (history.length > 20) {
        history.splice(0, history.length - 20);
      }

      const client = new Anthropic();

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = client.messages.stream({
        model: "sonar",
        max_tokens: 4096,
        system: ARQOS_SYSTEM_PROMPT,
        messages: history.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      let fullResponse = "";
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

      stream.on("text", (text) => {
        fullResponse += text;
        safeWrite(`data: ${JSON.stringify({ type: "text", content: text })}\n\n`);
      });

      stream.on("end", () => {
        history.push({ role: "assistant", content: fullResponse });

        const cards = parseCards(fullResponse);
        if (cards.length > 0) {
          safeWrite(`data: ${JSON.stringify({ type: "cards", cards })}\n\n`);
        }

        safeWrite(`data: ${JSON.stringify({ type: "done" })}\n\n`);
        safeEnd();
      });

      stream.on("error", (err) => {
        console.error("Perplexity stream error:", err);
        safeWrite(`data: ${JSON.stringify({ type: "error", message: "Perplexity AI service temporarily unavailable" })}\n\n`);
        safeEnd();
      });

      res.on("close", () => { ended = true; });

    } catch (err: any) {
      console.error("Perplexity chat error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Perplexity chat service error" });
      }
    }
  });

  // ── Podcast Generation ──────────────────────────────
  app.post("/api/podcast/generate", async (req, res) => {
    try {
      const { topic, voice1, voice2 } = req.body;
      if (!topic || typeof topic !== "string") {
        return res.status(400).json({ error: "topic is required" });
      }

      const client = new Anthropic();

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

      const response = await client.messages.create({
        model: "gemini_3_flash",
        max_tokens: 4096,
        messages: [{ role: "user", content: podcastPrompt }],
      });

      const responseText = response.content
        .filter((block): block is { type: "text"; text: string } => block.type === "text")
        .map((block) => block.text)
        .join("");

      // Try to parse JSON from response
      let parsed;
      try {
        // Extract JSON from potential markdown code blocks
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);
      } catch {
        parsed = { script: [], duration: "~8:00" };
      }

      res.json({
        script: parsed.script || [],
        duration: parsed.duration || "~8:00",
      });
    } catch (err: any) {
      console.error("Podcast generation error:", err);
      res.status(500).json({ error: "Podcast generation failed" });
    }
  });

  // ── Admin: Get Audit Log ────────────────────────────
  app.get("/api/admin/audit", (_req, res) => {
    // Return mock audit data — in production this would query a database
    res.json({
      entries: [
        { id: "a1", timestamp: new Date().toISOString(), user: "Irfan", query: "Market overview Palm Jumeirah", model: "gemini_3_flash", tokensUsed: 2340, responseTime: 1200, status: "success" },
        { id: "a2", timestamp: new Date().toISOString(), user: "Talha", query: "Generate podcast: Q1 Review", model: "gemini_3_flash", tokensUsed: 4120, responseTime: 3400, status: "success" },
        { id: "a3", timestamp: new Date().toISOString(), user: "Qasim", query: "JVC rental yields 2024", model: "sonar", tokensUsed: 1890, responseTime: 980, status: "success" },
      ],
    });
  });

  // ── Admin: Save Config ──────────────────────────────
  app.post("/api/admin/config", (req, res) => {
    const { systemPrompt, model, temperature, maxTokens } = req.body;
    // In production, persist to database. For now, acknowledge.
    console.log("Admin config updated:", { model, temperature, maxTokens, promptLength: systemPrompt?.length });
    res.json({ success: true });
  });

  // ── Health / Status ────────────────────────────────
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "healthy",
      service: "arqos-bot",
      version: "2.0.0",
      timestamp: new Date().toISOString(),
      engines: {
        gemini: { status: "active", model: "gemini_3_flash", provider: "Google Vertex AI" },
        perplexity: { status: "active", model: "sonar", provider: "Perplexity AI" },
      },
      gcp: {
        organization: "realco.ai",
        project: "precise-office-485714-i8",
        vertexAI: "enabled",
        region: "me-central1",
      },
    });
  });

  // ── GCP / Vertex AI Status ─────────────────────────
  app.get("/api/admin/gcp-status", (_req, res) => {
    res.json({
      organization: {
        name: "realco.ai",
        id: "283312001950",
      },
      projects: [
        { name: "My First Project", id: "precise-office-485714-i8", active: true, vertexAI: true },
        { name: "RealCo Intelligence Hub", id: "black-alpha-484817-q3", active: false, vertexAI: false },
        { name: "Realco ChatBot Maps", id: "realco-chatbot-maps", active: false, vertexAI: false },
        { name: "realco-intelligence-hub", id: "realco-intelligence-hub", active: false, vertexAI: false },
      ],
      activeProject: "precise-office-485714-i8",
      vertexAI: {
        enabled: true,
        models: ["gemini-2.0-flash", "gemini-1.5-pro", "imagen-3.0"],
        features: ["Model Garden", "Vertex AI Studio", "Agent Builder", "RAG Engine", "Vector Search", "Notebooks"],
        region: "me-central1",
      },
      cloudRun: {
        ready: true,
        deployPackage: "/arqos-gcp-deploy",
      },
    });
  });

  // ── CRUD Operations ─────────────────────────────────
  app.post("/api/crud/:action", (req, res) => {
    const { action } = req.params;
    const { data } = req.body;

    // Mock CRUD responses
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

// ── Helpers ──────────────────────────────────────────────

function parseCards(text: string): any[] {
  const cards: any[] = [];
  const cardRegex = /```arqos-card\n([\s\S]*?)```/g;
  let match;
  while ((match = cardRegex.exec(text)) !== null) {
    try {
      const card = JSON.parse(match[1].trim());
      card.id = `card-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      cards.push(card);
    } catch {
      // Skip invalid JSON
    }
  }
  return cards;
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
        try {
          resolve(JSON.parse(stdout));
        } catch {
          reject(new Error(`Invalid JSON output: ${stdout}`));
        }
      }
    });

    // 60s timeout
    setTimeout(() => {
      proc.kill();
      reject(new Error("Python script timed out"));
    }, 60000);
  });
}
