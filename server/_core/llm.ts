import { execSync } from "child_process";
import { writeFileSync, readFileSync, unlinkSync, statSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { ENV } from "./env";

const OLLAMA_BASE = ENV.ollamaBaseUrl;
const GEMMA_MODEL = ENV.ollamaModel;

export type Role = "system" | "user" | "assistant";
export type TextContent  = { type: "text"; text: string };
export type ImageContent = { type: "image_url"; image_url: { url: string } };
export type MessageContent = string | TextContent | ImageContent;
export type Message = { role: Role; content: MessageContent | MessageContent[]; name?: string };

export type InvokeParams = {
  messages: Message[];
  maxTokens?: number;
  responseFormat?: { type: "json_object" | "text" };
  response_format?: { type: "json_object" | "text" };
  outputSchema?: unknown;
  output_schema?: unknown;
  tools?: unknown[];
  toolChoice?: unknown;
  tool_choice?: unknown;
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: { role: Role; content: string };
    finish_reason: string | null;
  }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
};

function contentToString(content: MessageContent | MessageContent[]): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content))
    return content.map(c => (typeof c === "string" ? c : c.type === "text" ? c.text : "")).join("\n");
  if (content.type === "text") return content.text;
  return "";
}

function extractImages(content: MessageContent | MessageContent[]): string[] {
  const parts = Array.isArray(content) ? content : [content];
  return parts
    .filter(p => typeof p !== "string" && (p as ImageContent).type === "image_url")
    .map(p => (p as ImageContent).image_url.url.replace(/^data:image\/[^;]+;base64,/, ""));
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function withRetry<T>(fn: () => Promise<T>, attempts = 3, delayMs = 1200): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === attempts - 1) throw e;
      console.warn(`[Gemma] Attempt ${i + 1} failed, retrying in ${delayMs}ms…`, e);
      await sleep(delayMs);
    }
  }
  throw new Error("unreachable");
}

// ── Convert any audio format → 16kHz mono WAV using ffmpeg ───────────────────
// Browser records as WebM/Opus (Chrome) or MP4/AAC (Safari).
// Ollama's Gemma 4 audio encoder requires WAV.
// ffmpeg is installed in the Docker image via: apk add --no-cache ffmpeg

function stripDataUri(b64: string): string {
  // Handles any MIME type including audio/webm;codecs=opus (has ; in MIME)
  // so we match up to the first comma, not the first semicolon
  return b64.replace(/^data:[^,]+,/, "");
}

function convertToWav(audioBase64: string): string {
  const ts   = Date.now();
  const rand = Math.random().toString(36).slice(2);
  const inPath  = join(tmpdir(), `gc_in_${ts}_${rand}`);
  const outPath = join(tmpdir(), `gc_out_${ts}_${rand}.wav`);

  try {
    const raw = stripDataUri(audioBase64);
    writeFileSync(inPath, Buffer.from(raw, "base64"));

    const inSize = statSync(inPath).size;
    if (inSize === 0) throw new Error("Audio buffer is empty — nothing was recorded");

    // Capture stderr for diagnosis; don't suppress it
    const log = execSync(
      `ffmpeg -i "${inPath}" -ar 16000 -ac 1 -f wav "${outPath}" -y 2>&1 || true`,
      { timeout: 30_000, encoding: "utf8" },
    );

    let outSize = 0;
    try { outSize = statSync(outPath).size; } catch { /* not created */ }

    if (outSize === 0) {
      console.error(`[ffmpeg] Failed. Input ${inSize}B. Log:\n${log.slice(-600)}`);
      throw new Error(`ffmpeg produced empty output. Input size: ${inSize}B`);
    }

    console.log(`[ffmpeg] OK — ${inSize}B → ${outSize}B WAV`);
    return readFileSync(outPath).toString("base64");
  } finally {
    try { unlinkSync(inPath);  } catch { /* ignore */ }
    try { unlinkSync(outPath); } catch { /* ignore */ }
  }
}

// ── Ollama chat ───────────────────────────────────────────────────────────────

async function callOllama(params: InvokeParams, extraImages?: string[]): Promise<InvokeResult> {
  const wantsJson =
    params.responseFormat?.type === "json_object" ||
    params.response_format?.type === "json_object" ||
    params.outputSchema != null || params.output_schema != null;

  const ollamaMessages = params.messages.map(m => {
    const text   = contentToString(m.content);
    const images = [...extractImages(m.content), ...(extraImages ?? [])];
    const msg: Record<string, unknown> = { role: m.role, content: text };
    if (images.length > 0) msg.images = images;
    return msg;
  });

  const body: Record<string, unknown> = {
    model: GEMMA_MODEL,
    messages: ollamaMessages,
    stream: false,
    options: { num_predict: params.maxTokens ?? 4096, temperature: 0.2 },
  };
  if (wantsJson) body.format = "json";

  const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Ollama error ${res.status}: ${await res.text()}`);

  const data = await res.json() as {
    message: { role: string; content: string };
    model: string;
    done: boolean;
    prompt_eval_count?: number;
    eval_count?: number;
  };

  return {
    id: `ollama-${Date.now()}`,
    created: Date.now(),
    model: data.model,
    choices: [{ index: 0, message: { role: "assistant", content: data.message.content }, finish_reason: data.done ? "stop" : null }],
    usage: {
      prompt_tokens:     data.prompt_eval_count ?? 0,
      completion_tokens: data.eval_count ?? 0,
      total_tokens:      (data.prompt_eval_count ?? 0) + (data.eval_count ?? 0),
    },
  };
}

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  return callOllama(params);
}

// ── Audio transcription ───────────────────────────────────────────────────────

export type TranscriptionResult = {
  transcript: string;
  detectedLanguage: string;
  languageCode: string;
};

export async function transcribeAudio(audioBase64: string): Promise<TranscriptionResult> {
  return withRetry(async () => {
    // Convert to WAV — Ollama's Gemma 4 audio encoder requires WAV format
    const wavBase64 = convertToWav(audioBase64);

    const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: GEMMA_MODEL,
        stream: false,
        messages: [{
          role: "user",
          images: [wavBase64],
          content: `Listen to this audio recording of a patient or health worker speaking. Transcribe what is said — write the transcription out once completely in the speaker's original language. Do not repeat any sentence. Do not loop.

Return ONLY a JSON object:
{"transcript":"<full transcription written out once>","detected_language":"<English name e.g. Hindi, Swahili, Spanish>","language_code":"<ISO 639-1 e.g. hi, sw, es, ar>"}

Rules: valid JSON only, no markdown, no explanation, transcript written once in full.`,
        }],
        format: "json",
        options: { temperature: 0.1, num_predict: 1024 },
      }),
    });

    if (!res.ok) throw new Error(`Ollama audio error ${res.status}: ${await res.text()}`);

    const data = await res.json() as { message: { content: string } };
    const content = data.message?.content ?? "";

    let parsed: { transcript?: string; detected_language?: string; language_code?: string };
    try {
      parsed = JSON.parse(content.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim());
    } catch {
      return { transcript: content.trim(), detectedLanguage: "Unknown", languageCode: "und" };
    }

    return {
      transcript:       parsed.transcript?.trim()        ?? content.trim(),
      detectedLanguage: parsed.detected_language?.trim() ?? "Unknown",
      languageCode:     parsed.language_code?.trim()     ?? "und",
    };
  });
}

// ── Image description ─────────────────────────────────────────────────────────

export async function describeImage(imageBase64: string, _mimeType = "image/jpeg"): Promise<string> {
  const b64 = imageBase64.replace(/^data:image\/[^;]+;base64,/, "");
  return withRetry(async () => {
    const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: GEMMA_MODEL,
        messages: [{
          role: "user",
          images: [b64],
          content: `You are a clinical imaging assistant. Describe this image in detail focusing on:
- Medications or drug labels (name, dosage, instructions)
- Wounds or injuries (location, severity, signs of infection)
- Any other clinically relevant information
Be precise and concise.`,
        }],
        stream: false,
        options: { temperature: 0.1, num_predict: 1024 },
      }),
    });
    if (!res.ok) throw new Error(`Gemma vision error ${res.status}: ${await res.text()}`);
    const data = await res.json() as { message: { content: string } };
    return data.message.content.trim();
  });
}

// ── Translation ───────────────────────────────────────────────────────────────

export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || targetLang === "en") return text;
  const res = await callOllama({
    messages: [
      { role: "system", content: `Translate the following text into ${targetLang}. Return ONLY the translated text.` },
      { role: "user", content: text },
    ],
  });
  return res.choices[0]?.message?.content?.trim() ?? text;
}
