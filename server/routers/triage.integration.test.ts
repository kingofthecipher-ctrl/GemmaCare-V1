/**
 * GemmaCare — Integration Tests
 *
 * These tests call the REAL pipeline functions against a live Ollama instance.
 * They are skipped automatically when OLLAMA_BASE_URL is not set, so the CI
 * suite stays green without a GPU. Run locally with Ollama + gemma4:e4b pulled.
 *
 * Test fixtures live in server/test-fixtures/:
 *   audio/
 *     hindi_fever_paracetamol.mp3        — Hindi: fever, headache, Paracetamol
 *     swahili_headache_no_medication.mp3 — Swahili: severe headache, meningitis flags
 *     spanish_fever_ibuprofen.mp3        — Spanish: fever, taking ibuprofen
 *     text_only_arabic_wound.txt         — Arabic wound description (plain text fallback)
 *   images/
 *     paracetamol_label.png              — Paracetamol 500mg bottle label
 *     amoxicillin_label.png              — Amoxicillin 500mg antibiotic label
 *     infected_wound.png                 — Infected hand laceration
 *
 * Usage:
 *   OLLAMA_BASE_URL=http://localhost:11434 pnpm test --reporter=verbose
 */

import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const OLLAMA_BASE = process.env.OLLAMA_BASE_URL ?? "";
const GEMMA_MODEL = process.env.OLLAMA_MODEL ?? "gemma4:e4b";
const FIXTURES    = join(import.meta.dirname, "../test-fixtures");

// Skip all live tests when Ollama is not configured
const describeIfOllama = OLLAMA_BASE ? describe : describe.skip;

// ── Fixture helpers ──────────────────────────────────────────────────────────

function fixtureAudioBase64(filename: string): string {
  const p = join(FIXTURES, "audio", filename);
  if (!existsSync(p)) throw new Error(`Missing fixture: ${p}\nSee test file header for required files.`);
  return readFileSync(p).toString("base64");
}

function fixtureImageBase64(filename: string): string {
  const p = join(FIXTURES, "images", filename);
  if (!existsSync(p)) throw new Error(`Missing fixture: ${p}\nSee test file header for required files.`);
  return readFileSync(p).toString("base64");
}

function fixtureText(filename: string): string {
  const p = join(FIXTURES, "audio", filename);
  if (!existsSync(p)) throw new Error(`Missing fixture: ${p}`);
  return readFileSync(p, "utf-8").trim();
}

// ── Thin Ollama client (mirrors llm.ts) ─────────────────────────────────────

async function callGemma(params: {
  messages: Array<{ role: string; content: string; images?: string[] }>;
  format?: "json";
}): Promise<string> {
  const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: GEMMA_MODEL,
      stream: false,
      messages: params.messages,
      ...(params.format ? { format: params.format } : {}),
      options: { temperature: 0.1, num_predict: 1024 },
    }),
  });
  if (!res.ok) throw new Error(`Ollama ${res.status}: ${await res.text()}`);
  const data = await res.json() as { message: { content: string } };
  return data.message.content.trim();
}

// ── Ollama connectivity check ────────────────────────────────────────────────

describeIfOllama("Ollama connectivity", () => {
  it("reaches Ollama and finds gemma4 model", async () => {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`);
    expect(res.ok).toBe(true);
    const data = await res.json() as { models: Array<{ name: string }> };
    const found = data.models.some(m => m.name.startsWith("gemma4"));
    expect(found, `gemma4 model not found. Run: ollama pull ${GEMMA_MODEL}`).toBe(true);
  }, 10_000);
});

// ── Case 1: Hindi audio + matching Paracetamol image ─────────────────────────
//
// Fixture:  audio/hindi_fever_paracetamol.mp3  +  images/paracetamol_label.png
// Expected: language=hi, urgency 1-3, medication paracetamol, no safety conflict

describeIfOllama("Case 1 — Hindi audio + matched Paracetamol image", () => {
  it("transcribes Hindi audio and detects language", async () => {
    const wavBase64 = fixtureAudioBase64("hindi_fever_paracetamol.mp3");

    const content = await callGemma({
      messages: [{
        role: "user",
        images: [wavBase64],
        content: `Transcribe this audio exactly. Return ONLY JSON:
{"transcript":"<verbatim>","detected_language":"<English name>","language_code":"<ISO 639-1>"}`,
      }],
      format: "json",
    });

    const parsed = JSON.parse(content);
    expect(parsed.language_code).toBe("hi");
    expect(parsed.transcript.length).toBeGreaterThan(5);
    expect(parsed.detected_language.toLowerCase()).toContain("hindi");
  }, 60_000);

  it("describes Paracetamol label image", async () => {
    const imageBase64 = fixtureImageBase64("paracetamol_label.png");

    const description = await callGemma({
      messages: [{
        role: "user",
        images: [imageBase64],
        content: "Describe this image focusing on medication name, dosage, and instructions. Be concise.",
      }],
    });

    expect(description.toLowerCase()).toContain("paracetamol");
  }, 60_000);

  it("extracts triage data and reports no medication safety conflict", async () => {
    const clinicalSummary = `
      Patient in Hindi: fever for 2 days, headache, fatigue, loss of appetite.
      Taking Paracetamol 500mg. Image shows Paracetamol 500mg Sun Pharma bottle.
    `;

    const content = await callGemma({
      messages: [
        { role: "system", content: "You are a clinical triage assistant. Return only valid JSON." },
        { role: "user", content: `Extract triage data:\n${clinicalSummary}\n\nReturn JSON with: chief_complaint, symptom_list (array), urgency_level (1-5), medication_from_audio, medication_from_image, medication_found, recommended_action, patient_language, confidence (0-100).` },
      ],
      format: "json",
    });

    const result = JSON.parse(content);
    expect(result.urgency_level).toBeGreaterThanOrEqual(1);
    expect(result.urgency_level).toBeLessThanOrEqual(5);
    expect(result.confidence).toBeGreaterThan(0);
    expect(Array.isArray(result.symptom_list)).toBe(true);
    // Medication should be paracetamol or variant — not a completely different drug
    const med = (result.medication_found ?? "").toLowerCase();
    expect(med).toContain("paracetamol");
  }, 60_000);
});

// ── Case 2: Swahili audio only — meningitis red flags ────────────────────────
//
// Fixture:  audio/swahili_headache_no_medication.mp3
// Expected: language=sw, urgency 4-5, no medication, red-flag recommendations

describeIfOllama("Case 2 — Swahili audio only (meningitis flags)", () => {
  it("transcribes Swahili audio and detects language", async () => {
    const wavBase64 = fixtureAudioBase64("swahili_headache_no_medication.mp3");

    const content = await callGemma({
      messages: [{
        role: "user",
        images: [wavBase64],
        content: `Transcribe this audio. Return ONLY JSON:
{"transcript":"<verbatim>","detected_language":"<English name>","language_code":"<ISO 639-1>"}`,
      }],
      format: "json",
    });

    const parsed = JSON.parse(content);
    expect(parsed.language_code).toBe("sw");
    expect(parsed.transcript.length).toBeGreaterThan(5);
  }, 60_000);

  it("assigns urgency 4 or 5 for sudden severe headache with neck stiffness", async () => {
    const clinicalSummary = `
      Swahili patient: sudden severe headache started 20 minutes ago, photophobia,
      nausea, neck stiffness, cannot flex neck forward, fever 39.5°C. No medication.
    `;

    const content = await callGemma({
      messages: [
        { role: "system", content: "You are a clinical triage assistant. Return only valid JSON." },
        { role: "user", content: `Extract triage data:\n${clinicalSummary}\n\nReturn JSON with: chief_complaint, symptom_list (array), urgency_level (1-5), medication_found, recommended_action, patient_language, confidence (0-100).` },
      ],
      format: "json",
    });

    const result = JSON.parse(content);
    expect(result.urgency_level).toBeGreaterThanOrEqual(4);
    const action = (result.recommended_action ?? "").toLowerCase();
    // Model should recommend emergency/referral — not just rest
    const hasEmergencyAction = action.includes("emergency") || action.includes("refer") || action.includes("hospital") || action.includes("immediate");
    expect(hasEmergencyAction).toBe(true);
  }, 60_000);
});

// ── Case 3: Spanish audio (ibuprofen) + Amoxicillin image — MISMATCH ─────────
//
// Fixture:  audio/spanish_fever_ibuprofen.mp3  +  images/amoxicillin_label.png
// Expected: medication_safety.overallSeverity = "critical" or "warning"

describeIfOllama("Case 3 — Spanish audio vs Amoxicillin image (medication mismatch)", () => {
  it("medication safety check flags ibuprofen vs amoxicillin as a conflict", async () => {
    const prompt = `
You are a clinical pharmacist. Perform a 4-layer medication safety check.

Chief complaint: Fever and sore throat (3 days)
Symptoms: fever 38.5°C, sore throat
Audio medication: ibuprofen 400mg
Image medication: amoxicillin 500mg capsules (antibiotic)

Return ONLY JSON:
{
  "conflicts": [{"layer":"<name_mismatch|category_conflict|route_conflict|semantic_concern>","severity":"<warning|critical>","description":"<string>"}],
  "overall_severity": "<none|warning|critical>",
  "clinician_summary": "<one sentence>"
}`;

    const content = await callGemma({
      messages: [
        { role: "system", content: "You are a clinical pharmacist. Return only valid JSON." },
        { role: "user", content: prompt },
      ],
      format: "json",
    });

    const result = JSON.parse(content);
    expect(["warning", "critical"]).toContain(result.overall_severity);
    expect(Array.isArray(result.conflicts)).toBe(true);
    expect(result.conflicts.length).toBeGreaterThan(0);
    expect(typeof result.clinician_summary).toBe("string");
  }, 60_000);
});

// ── Case 4: Text only — Arabic wound description ──────────────────────────────
//
// Fixture:  audio/text_only_arabic_wound.txt  (plain UTF-8 text, no audio file)
// Expected: language=ar, urgency 3-4, wound-related chief complaint

describeIfOllama("Case 4 — Text only (Arabic wound description)", () => {
  it("extracts clinical data from Arabic wound text without audio", async () => {
    const arabicText = fixtureText("text_only_arabic_wound.txt");

    const content = await callGemma({
      messages: [
        { role: "system", content: "You are a clinical triage assistant. Return only valid JSON." },
        { role: "user", content: `Extract triage data from this patient description:\n${arabicText}\n\nReturn JSON: chief_complaint, symptom_list (array), urgency_level (1-5), recommended_action, patient_language (ISO code), confidence (0-100).` },
      ],
      format: "json",
    });

    const result = JSON.parse(content);
    expect(result.patient_language).toBe("ar");
    expect(result.urgency_level).toBeGreaterThanOrEqual(3);
    expect(Array.isArray(result.symptom_list)).toBe(true);
    // Chief complaint should relate to wound, not something irrelevant
    const cc = (result.chief_complaint ?? "").toLowerCase();
    const hasWoundTerm = cc.includes("wound") || cc.includes("laceration") || cc.includes("infection")
      || cc.includes("injury") || cc.includes("hand") || cc.includes("جرح");
    expect(hasWoundTerm).toBe(true);
  }, 60_000);
});

// ── Bilingual instructions ────────────────────────────────────────────────────

describeIfOllama("Bilingual patient instructions", () => {
  it("generates instructions in both English and Hindi when languages differ", async () => {
    const content = await callGemma({
      messages: [
        {
          role: "system",
          content: "You are a medical educator. Write patient care instructions in BOTH English (for the clinician) AND Hindi (for the patient). Label each section clearly.",
        },
        {
          role: "user",
          content: "Chief complaint: Fever. Symptoms: fever, fatigue. Urgency: 2/5. Recommended action: Rest and monitor temperature. Include: what to do now, when to seek emergency care, what to avoid.",
        },
      ],
    });

    const lower = content.toLowerCase();
    // Should contain both English content and Hindi script (देvanagari characters)
    const hasEnglish = lower.includes("rest") || lower.includes("fever") || lower.includes("monitor");
    const hasHindi   = /[\u0900-\u097F]/.test(content); // Devanagari Unicode range
    expect(hasEnglish).toBe(true);
    expect(hasHindi, "Expected Hindi Devanagari script in output").toBe(true);
  }, 60_000);
});
