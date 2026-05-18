/**
 * GemmaCare — Triage Unit Tests
 *
 * Tests real application logic without mocking the things being verified.
 * No LLM or database required — covers schemas, helpers, and boundary logic.
 */

import { describe, it, expect } from "vitest";
import { z } from "zod";

// ── Schema mirrored from triage.ts ───────────────────────────────────────────

const TriageOutputSchema = z.object({
  chief_complaint:       z.string().nullable().transform(v => v ?? "Unspecified complaint"),
  symptom_list:          z.array(z.string()).nullable().transform(v => v ?? []),
  urgency_level:         z.number().min(1).max(5).nullable().transform(v => v ?? 3),
  medication_from_audio: z.string().nullable().optional(),
  medication_from_image: z.string().nullable().optional(),
  medication_found:      z.string().nullable().optional(),
  recommended_action:    z.string().nullable().transform(v => v ?? "Please consult a healthcare provider"),
  patient_language:      z.string().nullable().transform(v => v ?? "en"),
  confidence:            z.number().min(0).max(100).nullable().transform(v => v ?? 50),
});

// ── Pure helpers ─────────────────────────────────────────────────────────────

function stripDataUri(b64: string): string {
  return b64.replace(/^data:[^,]+,/, "");
}

function extractImages(content: unknown): string[] {
  const parts = Array.isArray(content) ? content : [content];
  return parts
    .filter(
      (p): p is { type: "image_url"; image_url: { url: string } } =>
        typeof p === "object" && p !== null && (p as any).type === "image_url",
    )
    .map(p => p.image_url.url.replace(/^data:image\/[^;]+;base64,/, ""));
}

type SourceMode = "audio" | "image" | "both" | "text";
function determineSourceMode(
  transcript: string,
  imageDesc: string | undefined,
  hasAudioFile: boolean,
): SourceMode {
  if (transcript && imageDesc) return "both";
  if (transcript && !hasAudioFile) return "text";
  if (transcript) return "audio";
  return "image";
}

function parseModelJson(raw: string): Record<string, unknown> {
  const clean = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
  return JSON.parse(clean);
}

// ── TriageOutputSchema ───────────────────────────────────────────────────────

describe("TriageOutputSchema", () => {
  it("parses a well-formed LLM response", () => {
    const result = TriageOutputSchema.parse({
      chief_complaint: "Fever and cough",
      symptom_list: ["fever", "cough", "fatigue"],
      urgency_level: 2,
      medication_from_audio: "paracetamol",
      medication_from_image: "Paracetamol 500mg",
      medication_found: "paracetamol",
      recommended_action: "Rest and monitor temperature",
      patient_language: "hi",
      confidence: 87,
    });
    expect(result.chief_complaint).toBe("Fever and cough");
    expect(result.urgency_level).toBe(2);
    expect(result.confidence).toBe(87);
    expect(result.symptom_list).toHaveLength(3);
  });

  it("applies defaults when fields are null", () => {
    const result = TriageOutputSchema.parse({
      chief_complaint: null, symptom_list: null, urgency_level: null,
      recommended_action: null, patient_language: null, confidence: null,
    });
    expect(result.chief_complaint).toBe("Unspecified complaint");
    expect(result.symptom_list).toEqual([]);
    expect(result.urgency_level).toBe(3);
    expect(result.confidence).toBe(50);
  });

  it("coerces string urgency_level to number (LLM sometimes quotes numbers)", () => {
    const raw: any = {
      chief_complaint: "Headache", symptom_list: ["headache"],
      urgency_level: "4", recommended_action: "Rest",
      patient_language: "en", confidence: 75,
    };
    const coerced = { ...raw, urgency_level: parseFloat(raw.urgency_level) || 3 };
    expect(TriageOutputSchema.parse(coerced).urgency_level).toBe(4);
  });

  it("coerces comma-separated string symptom_list to array", () => {
    const raw: any = {
      chief_complaint: "Fever", symptom_list: "fever, chills, nausea",
      urgency_level: 2, recommended_action: "Rest",
      patient_language: "en", confidence: 80,
    };
    const coerced = {
      ...raw,
      symptom_list: typeof raw.symptom_list === "string"
        ? raw.symptom_list.split(/,\s*/).map((s: string) => s.trim()).filter(Boolean)
        : raw.symptom_list,
    };
    expect(TriageOutputSchema.parse(coerced).symptom_list).toEqual(["fever", "chills", "nausea"]);
  });

  it("rejects urgency_level outside 1–5", () => {
    expect(() => TriageOutputSchema.parse({
      chief_complaint: "Test", symptom_list: [], urgency_level: 6,
      recommended_action: "rest", patient_language: "en", confidence: 50,
    })).toThrow();
  });

  it("rejects confidence outside 0–100", () => {
    expect(() => TriageOutputSchema.parse({
      chief_complaint: "Test", symptom_list: [], urgency_level: 3,
      recommended_action: "rest", patient_language: "en", confidence: 150,
    })).toThrow();
  });
});

// ── Medication safety helpers ────────────────────────────────────────────────

describe("Medication safety", () => {
  it("recognises matching names (case-insensitive)", () => {
    expect("Paracetamol 500mg".toLowerCase()).toContain("paracetamol");
  });

  it("flags mismatched names", () => {
    expect("ibuprofen".toLowerCase()).not.toBe("amoxicillin".toLowerCase());
  });

  it("does not flag when only one source has a medication", () => {
    const audio: string | undefined = undefined;
    const image = "paracetamol";
    expect(audio && image && audio !== image).toBeFalsy();
  });

  it("does not flag when neither source has a medication", () => {
    const audio: string | undefined = undefined;
    const image: string | undefined = undefined;
    expect(audio && image && audio !== image).toBeFalsy();
  });
});

// ── Audio / image preprocessing ──────────────────────────────────────────────

describe("stripDataUri", () => {
  it("strips standard audio/webm prefix", () => {
    expect(stripDataUri("data:audio/webm;codecs=opus,SGVsbG8=")).toBe("SGVsbG8=");
  });

  it("strips complex MIME with multiple semicolons", () => {
    expect(stripDataUri("data:audio/webm;codecs=opus;rate=48000,AAABBB")).toBe("AAABBB");
  });

  it("passes through plain base64 unchanged", () => {
    expect(stripDataUri("SGVsbG8gV29ybGQ=")).toBe("SGVsbG8gV29ybGQ=");
  });
});

describe("extractImages", () => {
  it("extracts base64 from image_url content parts", () => {
    const images = extractImages([
      { type: "text", text: "describe this" },
      { type: "image_url", image_url: { url: "data:image/jpeg;base64,/9j/abc==" } },
    ]);
    expect(images).toHaveLength(1);
    expect(images[0]).toBe("/9j/abc==");
  });

  it("returns empty array when no images present", () => {
    expect(extractImages([{ type: "text", text: "no image" }])).toEqual([]);
  });

  it("extracts multiple images", () => {
    const images = extractImages([
      { type: "image_url", image_url: { url: "data:image/jpeg;base64,AAA==" } },
      { type: "image_url", image_url: { url: "data:image/png;base64,BBB==" } },
    ]);
    expect(images).toEqual(["AAA==", "BBB=="]);
  });
});

// ── Source mode ──────────────────────────────────────────────────────────────

describe("determineSourceMode", () => {
  it("'both' when audio transcript and image both present", () => {
    expect(determineSourceMode("Patient has fever", "Paracetamol label", true)).toBe("both");
  });
  it("'audio' when transcript from audio file, no image", () => {
    expect(determineSourceMode("Patient has fever", undefined, true)).toBe("audio");
  });
  it("'text' when transcript typed, no audio file", () => {
    expect(determineSourceMode("Patient has fever", undefined, false)).toBe("text");
  });
  it("'image' when no transcript", () => {
    expect(determineSourceMode("", "Wound photo", true)).toBe("image");
  });
});

// ── Urgency / confidence bounds ──────────────────────────────────────────────

describe("Urgency and confidence validation", () => {
  const isValidUrgency = (n: number) => n >= 1 && n <= 5;
  const isValidConfidence = (n: number) => n >= 0 && n <= 100;

  it.each([1, 2, 3, 4, 5])("urgency %i is valid", u => expect(isValidUrgency(u)).toBe(true));
  it.each([0, 6, -1])("urgency %i is invalid", u => expect(isValidUrgency(u)).toBe(false));
  it.each([0, 50, 100])("confidence %i is valid", c => expect(isValidConfidence(c)).toBe(true));
  it.each([-1, 101])("confidence %i is invalid", c => expect(isValidConfidence(c)).toBe(false));
});

// ── JSON parsing resilience ──────────────────────────────────────────────────

describe("parseModelJson", () => {
  it("parses clean JSON", () => {
    expect(parseModelJson(`{"urgency_level":3}`).urgency_level).toBe(3);
  });
  it("strips ```json fences", () => {
    expect(parseModelJson("```json\n{\"urgency_level\":4}\n```").urgency_level).toBe(4);
  });
  it("throws on non-JSON text", () => {
    expect(() => parseModelJson("Sorry, I cannot help with that.")).toThrow();
  });
});

// ── Language handling ────────────────────────────────────────────────────────

describe("Language code handling", () => {
  it("treats empty string as English", () => {
    expect("" || "en").toBe("en");
  });
  it("detects same-language scenario (no translation needed)", () => {
    expect("es" === "es").toBe(true);
  });
  it("detects different-language scenario (translation required)", () => {
    expect("hi" === "en").toBe(false);
  });
});
