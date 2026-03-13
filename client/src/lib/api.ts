/**
 * Arqos API client — connects frontend to Gemini/Perplexity-powered backend
 */

const API_BASE = "__PORT_5000__".startsWith("__") ? "" : "__PORT_5000__";

export interface StreamCallbacks {
  onText: (text: string) => void;
  onCards: (cards: any[]) => void;
  onDone: () => void;
  onError: (message: string) => void;
}

/**
 * Generic SSE stream reader — shared by chat and perplexity routes
 */
async function streamResponse(
  url: string,
  body: Record<string, any>,
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    callbacks.onError(`Request failed: ${errorText}`);
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    callbacks.onError("No response stream available");
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            switch (data.type) {
              case "text":
                callbacks.onText(data.content);
                break;
              case "cards":
                callbacks.onCards(data.cards);
                break;
              case "done":
                callbacks.onDone();
                break;
              case "error":
                callbacks.onError(data.message);
                break;
            }
          } catch {
            // Skip malformed lines
          }
        }
      }
    }
  } catch (err: any) {
    if (err.name !== "AbortError") {
      callbacks.onError("Stream connection lost");
    }
  }
}

/**
 * Send a chat message to Gemini backend via SSE
 */
export async function sendChatMessage(
  message: string,
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  return streamResponse(`${API_BASE}/api/chat`, { message }, callbacks, signal);
}

/**
 * Send a chat message to Perplexity (Sonar) backend via SSE
 */
export async function sendPerplexityMessage(
  message: string,
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  return streamResponse(`${API_BASE}/api/chat/perplexity`, { message }, callbacks, signal);
}

/**
 * Generate an image from a text prompt
 */
export async function generateImage(
  prompt: string,
  aspectRatio: string = "1:1"
): Promise<string> {
  const res = await fetch(`${API_BASE}/api/generate-image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, aspect_ratio: aspectRatio }),
  });

  if (!res.ok) throw new Error("Image generation failed");
  const data = await res.json();
  return data.image;
}

/**
 * Convert text to speech audio
 */
export async function textToSpeech(
  text: string,
  voice: string = "kore"
): Promise<string> {
  const res = await fetch(`${API_BASE}/api/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice }),
  });

  if (!res.ok) throw new Error("TTS generation failed");
  const data = await res.json();
  return data.audio;
}

/**
 * Transcribe audio to text
 */
export async function transcribeAudio(audioBase64: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/transcribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ audio: audioBase64 }),
  });

  if (!res.ok) throw new Error("Transcription failed");
  const data = await res.json();
  return data.text;
}

/**
 * Clear conversation history
 */
export async function clearChat(): Promise<void> {
  await fetch(`${API_BASE}/api/chat/clear`, { method: "POST" });
}
