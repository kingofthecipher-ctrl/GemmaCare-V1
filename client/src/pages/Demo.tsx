/**
 * GemmaCare Demo Page
 *
 * Each demo button fetches the real audio/image files and passes them
 * through the FULL 6-call pipeline — identical to live triage.
 * No pre-written transcripts or image descriptions are used.
 *
 * Call 1 — Gemma 4 listens to real Hindi / Swahili / Spanish audio
 * Call 2 — Gemma 4 vision reads the real medication label or wound photo
 * Call 3 — Synthesizes both inputs (when both present)
 * Call 4 — Extracts structured clinical data
 * Call 5 — 4-layer sequential medication safety check
 * Call 6 — Generates bilingual patient instructions
 */

import { Card }   from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Play, Loader2, AlertTriangle, CheckCircle, AlertCircle,
  Mic, ImageIcon, Volume2, ChevronDown, ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { trpc }    from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { SUPPORTED_LANGUAGES } from "@shared/languages";

// ── Urgency styling ───────────────────────────────────────────────────────────
const URGENCY_COLORS: Record<number, string> = {
  1: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  2: "text-green-400 bg-green-500/10 border-green-500/30",
  3: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  4: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  5: "text-red-400 bg-red-500/10 border-red-500/30",
};
const URGENCY_LABEL = ["", "Routine", "Minor", "Moderate", "Urgent", "Emergency"];

// ── Demo case definitions ─────────────────────────────────────────────────────
// audioFile / imageFile are paths under /public/demos/ — fetched at run time
// and sent as base64 to the real pipeline. No shortcuts.
const demoSamples = [
  {
    id: 1,
    title: "Hindi — Fever & Matched Medication",
    flag: "🇮🇳",
    language: "Hindi",
    description:
      "A rural health worker in Rajasthan records a patient describing fever in Hindi, then holds up a Paracetamol bottle. Gemma listens to the audio, reads the label, and confirms the medication matches.",
    audioFile: "/demos/audio/hindi.mp3",
    imageFile: "/demos/images/paracetamol.png",
    imageAlt:  "Paracetamol 500mg Effervescent Tablets — Accord",
    audioPills: ["Fever (2 days)", "Headache", "Paracetamol", "Fatigue", "Loss of appetite"],
    imagePills: ["Paracetamol 500mg", "Effervescent — Accord"],
    expectedResult: "✅ No mismatch — medications match. Urgency 3/5.",
    clinicalNote: "Classic viral fever — medication appropriate, 2-day duration warrants monitoring.",
    mimeType: { audio: "audio/mpeg", image: "image/png" },
  },
  {
    id: 2,
    title: "Swahili — Severe Headache, No Medication",
    flag: "🇹🇿",
    language: "Swahili",
    description:
      "Audio only. A Tanzanian patient describes sudden severe headache, neck stiffness, photophobia, and high fever. No medication image. Gemma should flag meningitis red flags and escalate urgency.",
    audioFile: "/demos/audio/swahili.mp3",
    imageFile: undefined,
    imageAlt:  undefined,
    audioPills: ["Sudden severe headache", "Photophobia", "Nausea", "Neck stiffness", "Fever 39.5°C"],
    imagePills: [],
    expectedResult: "🔴 Urgency 4–5/5 — meningitis red flags. Emergency referral.",
    clinicalNote: "Neck stiffness + photophobia + sudden onset = emergency. Do not delay.",
    mimeType: { audio: "audio/mpeg", image: undefined },
  },
  {
    id: 3,
    title: "Spanish — Medication MISMATCH ⚠️",
    flag: "🇲🇽",
    language: "Spanish",
    description:
      "A Mexican health worker records the patient saying they're taking Ibuprofen, then photographs the bottle — which is actually Amoxicillin. Gemma listens, reads the label, and halts triage on a critical safety conflict.",
    audioFile: "/demos/audio/spanish.mp3",
    imageFile: "/demos/images/amoxicillin.png",
    imageAlt:  "Amoxicillin 500mg Tablets USP — Sandoz",
    audioPills: ["Fever 38.5°C", "Sore throat (3 days)", "Patient says: Ibuprofen"],
    imagePills: ["Amoxicillin 500mg", "Antibiotic — Sandoz", "Rx Only — NOT Ibuprofen"],
    expectedResult: "⚠️ CRITICAL MISMATCH: Patient says Ibuprofen — bottle is Amoxicillin 500mg. Completely different drug. Triage halted.",
    clinicalNote: "Wrong drug class — analgesic vs antibiotic. Safety halt prevents harm.",
    mimeType: { audio: "audio/mpeg", image: "image/png" },
  },
  {
    id: 4,
    title: "Arabic — Infected Hand Wound",
    flag: "🇸🇦",
    language: "Arabic",
    description:
      "A health worker types an Arabic wound description, then photographs the infected hand. Gemma reads the Arabic text, analyses the wound image — erythema, purulent discharge, swelling — and recommends urgent care.",
    audioFile: undefined,
    imageFile: "/demos/images/wound_infected.jpg",
    imageAlt:  "Infected laceration on dorsal hand with erythema and purulent discharge",
    // For case 4, text is typed (no audio file) — passed as audioTranscript
    textInput: "المريض عنده جرح في اليد اليمنى من ثلاثة أيام. الجرح أصبح أحمر ومتورم وفيه إفرازات صفراء. المريض عنده حمى 38.5 درجة وألم شديد في المنطقة. الجرح لم يُخاط وظل مفتوحاً.",
    audioPills: ["Infected wound (3 days)", "Redness + swelling", "Purulent discharge", "Fever 38.5°C", "Severe pain"],
    imagePills: [],
    expectedResult: "🟠 Urgency 3–4/5 — infected wound, systemic signs. Antibiotics + referral.",
    clinicalNote: "Open infected laceration with fever — cellulitis risk. Gemma reads the wound image directly.",
    mimeType: { audio: undefined, image: "image/jpeg" },
  },
] as const;

// ── Fetch a public file and convert to base64 data URI ───────────────────────
async function fetchAsBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  const blob   = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ── Media preview component ───────────────────────────────────────────────────
function MediaPreview({ sample }: { sample: typeof demoSamples[number] }) {
  const [audioOpen, setAudioOpen] = useState(false);
  const [imgOpen,   setImgOpen]   = useState(false);

  const hasAudio = !!(sample as any).audioFile;
  const hasImage = !!(sample as any).imageFile;
  if (!hasAudio && !hasImage) return null;

  return (
    <div className="space-y-2">
      {hasAudio && (
        <div>
          <button
            onClick={() => setAudioOpen(v => !v)}
            className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Volume2 className="h-3.5 w-3.5"/>
            {audioOpen ? "Hide audio" : "▶ Play patient audio"}
            {audioOpen ? <ChevronUp className="h-3 w-3"/> : <ChevronDown className="h-3 w-3"/>}
          </button>
          {audioOpen && (
            <audio src={(sample as any).audioFile} controls className="w-full h-9 mt-2 rounded"/>
          )}
        </div>
      )}
      {hasImage && (
        <div>
          <button
            onClick={() => setImgOpen(v => !v)}
            className="flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            <ImageIcon className="h-3.5 w-3.5"/>
            {imgOpen ? "Hide image" : "🔍 View photo submitted"}
            {imgOpen ? <ChevronUp className="h-3 w-3"/> : <ChevronDown className="h-3 w-3"/>}
          </button>
          {imgOpen && (
            <img
              src={(sample as any).imageFile}
              alt={(sample as any).imageAlt}
              className="mt-2 w-full max-h-52 object-contain rounded border border-border bg-black/20 p-1"
            />
          )}
        </div>
      )}
    </div>
  );
}


// ── Full result panel — identical output to main triage page ─────────────────
function DemoResult({ result, isMismatch, rec, onClear, t }: {
  result: any; isMismatch: boolean; rec: any; onClear: () => void; t: any;
}) {
  const translateMut       = trpc.triage.translateInstructions.useMutation();
  const translateRecordMut = trpc.triage.translateClinicalRecord.useMutation();

  const [displayLang, setDisplayLang]         = useState("en");
  const [instructions, setInstructions]       = useState<string>(rec?.patientInstructions || "");
  const [translatedRecord, setTranslatedRecord] = useState<any>(null);
  const [translating, setTranslating]         = useState(false);
  const [transcriptOpen, setTranscriptOpen]   = useState(false);

  const handleLangChange = async (lang: string) => {
    if (lang === displayLang) return;
    setDisplayLang(lang);
    if (lang === "en") { setInstructions(rec?.patientInstructions || ""); setTranslatedRecord(null); return; }
    setTranslating(true);
    try {
      const langInfo = (SUPPORTED_LANGUAGES as any)[lang];
      const langName = langInfo ? `${langInfo.name} (${langInfo.nativeName})` : lang;

      // Translate instructions
      if (rec?.id) {
        const res = await translateMut.mutateAsync({ recordId: rec.id, targetLanguage: langName });
        setInstructions(res.instructions);
      } else {
        // No saved record yet — translate the instruction text directly
        const res = await fetch("/api/trpc/triage.translateClinicalRecord", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ json: {
            chiefComplaint:    rec?.chiefComplaint || "",
            symptoms:          rec?.symptomList || [],
            recommendedAction: rec?.recommendedAction || "",
            targetLanguage:    langName,
          }}),
        });
        if (res.ok) {
          const data = await res.json();
          const tr = data?.result?.data?.json;
          if (tr) setTranslatedRecord(tr);
        }
      }

      // Translate clinical record fields
      const tr = await translateRecordMut.mutateAsync({
        chiefComplaint:    rec?.chiefComplaint || "",
        symptoms:          rec?.symptomList || [],
        recommendedAction: rec?.recommendedAction || "",
        targetLanguage:    langName,
      });
      if (tr) setTranslatedRecord(tr);
    } catch (e) { console.error("Translation failed", e); }
    finally { setTranslating(false); }
  };

  const u = URGENCY_COLORS[rec?.urgencyLevel] || URGENCY_COLORS[3];
  const uLabel = URGENCY_LABEL[rec?.urgencyLevel] || "Moderate";
  const detectedLangName = (SUPPORTED_LANGUAGES as any)[rec?.patientLanguage]?.name || rec?.patientLanguage || "Unknown";
  const displayComplaint = translatedRecord?.chiefComplaint || rec?.chiefComplaint;
  const displaySymptoms  = translatedRecord?.symptoms       || rec?.symptomList || [];
  const displayAction    = translatedRecord?.recommendedAction || rec?.recommendedAction;

  if (isMismatch) {
    const langName = (SUPPORTED_LANGUAGES as any)[result.patientLanguage]?.name || result.patientLanguage;
    const [mismatchLang, setMismatchLang]             = useState("en");
    const [mismatchClinicianText, setMismatchClinician] = useState<string>(result.clinicianSummary || "");
    const [mismatchPatientText, setMismatchPatient]     = useState<string>(result.patientSummary || "");
    const [mismatchTranslating, setMismatchTranslating] = useState(false);
    const translateMismatchMut = trpc.triage.translateInstructions.useMutation();

    const handleMismatchLang = async (lang: string) => {
      if (lang === mismatchLang) return;
      setMismatchLang(lang);
      if (lang === "en") {
        setMismatchClinician(result.clinicianSummary || "");
        setMismatchPatient(result.patientSummary || "");
        return;
      }
      setMismatchTranslating(true);
      try {
        const langInfo = (SUPPORTED_LANGUAGES as any)[lang];
        const langName = langInfo ? `${langInfo.name} (${langInfo.nativeName})` : lang;
        const combined = `CLINICIAN SUMMARY:
${result.clinicianSummary || ""}

PATIENT WARNING:
${result.patientSummary || ""}`;
        const res = await translateMismatchMut.mutateAsync({ text: combined, targetLanguage: langName } as any);
        const translated = (res as any).instructions || (res as any).text || combined;
        const parts = translated.split(/PATIENT WARNING:/i);
        setMismatchClinician(parts[0]?.replace(/CLINICIAN SUMMARY:/i, "").trim() || translated);
        setMismatchPatient(parts[1]?.trim() || "");
      } catch (e) { console.error("Mismatch translation failed", e); }
      finally { setMismatchTranslating(false); }
    };

    return (
      <Card className="p-4 border-border bg-card space-y-3">
        {/* Language selector for mismatch card */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Translate warning:</span>
          {["en","es","hi","sw","ar","fr","pt","zh"].map(code => {
            const info = (SUPPORTED_LANGUAGES as any)[code];
            return (
              <button key={code} onClick={() => handleMismatchLang(code)}
                className={`px-2 py-0.5 rounded text-xs border transition-colors ${mismatchLang === code ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
                {info?.nativeName || code}
              </button>
            );
          })}
          {mismatchTranslating && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground"/>}
        </div>

        <div className="flex gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/40">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5"/>
          <div className="text-sm text-red-200 space-y-2 w-full">
            <p className="font-bold text-red-400">🚨 Medication Safety Halt</p>
            {result.conflicts?.map((c: any, i: number) => (
              <p key={i} className="text-xs text-red-300">
                <strong className="uppercase">{c.layer?.replace(/_/g, " ")}:</strong> {c.description}
              </p>
            ))}
            {/* Clinician summary */}
            {mismatchClinicianText && (
              <div className="pt-2 border-t border-red-500/20">
                <p className="text-xs text-red-400/70 font-semibold uppercase tracking-wide mb-0.5">⚕ For the Clinician</p>
                <p className="text-xs text-red-200 italic">{mismatchClinicianText}</p>
              </div>
            )}
            {/* Patient warning — translatable */}
            {mismatchPatientText && (
              <div className="pt-2 border-t border-red-500/20">
                <p className="text-xs text-red-400/70 font-semibold uppercase tracking-wide mb-0.5">⚕ For the Patient ({langName})</p>
                <p className="text-xs text-red-200 italic">{mismatchPatientText}</p>
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Triage halted — clinician must verify the medication discrepancy before the record can be saved.</p>
          {result.patientInstructions && (
            <div className="border-t border-red-500/20 pt-3 mt-1">
              <p className="text-xs text-orange-400 font-semibold uppercase tracking-wide mb-2">
                Patient guidance — bilingual (generated despite halt)
              </p>
              <div className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap max-h-52 overflow-y-auto bg-muted/20 rounded p-2">
                {result.patientInstructions}
              </div>
            </div>
          )}
        <Button onClick={onClear} variant="outline" size="sm" className="w-full text-xs mt-2">Clear Result</Button>
      </Card>
    );
  }

  if (!rec) return null;

  return (
    <div className="space-y-4">
      {/* Language selector — controls both panels */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-1">
        <p className="text-xs text-muted-foreground font-medium">Translate result to:</p>
        <select
          value={displayLang}
          onChange={e => handleLangChange(e.target.value)}
          className="text-xs bg-muted/30 border border-border rounded px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {Object.entries(SUPPORTED_LANGUAGES as any).map(([code, info]: [string, any]) => (
            <option key={code} value={code}>{info.name} — {info.nativeName}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Clinical Record */}
        <Card className="p-4 border-border bg-card space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-400"/>
            <span className="font-semibold text-green-400">Triage Complete ✓</span>
            <span className="text-xs text-muted-foreground ml-auto">{detectedLangName}</span>
          </div>
          {translating ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <Loader2 className="h-4 w-4 animate-spin"/>Translating with Gemma 4…
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-0.5">Chief Complaint</p>
                <p className="font-medium">{displayComplaint}</p>
              </div>
              {displaySymptoms.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-0.5">Symptoms</p>
                  <ul className="space-y-0.5">
                    {displaySymptoms.map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5 text-sm"><span className="text-primary mt-0.5">•</span>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-0.5">Urgency</p>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold border ${u}`}>
                  {rec.urgencyLevel}/5 — {uLabel}
                </span>
              </div>
              {rec.medicationFound && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-0.5">Medication</p>
                  <p className="font-medium">{rec.medicationFound}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-0.5">Recommended Action</p>
                <p>{displayAction}</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-0.5">Confidence</p>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-muted/30 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-primary h-full" style={{width:`${rec.confidence}%`}}/>
                    </div>
                    <span className="text-xs font-bold">{rec.confidence}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-0.5">Audio/Image</p>
                  <p className={`text-xs font-medium ${rec.audioImageMatch ? "text-green-400" : "text-red-400"}`}>
                    {rec.audioImageMatch ? "✅ Match" : "⚠️ Mismatch"}
                  </p>
                </div>
              </div>
              {/* Transcript */}
              {rec.audioTranscript && (
                <div className="pt-2 border-t border-border">
                  <button
                    onClick={() => setTranscriptOpen(v => !v)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {transcriptOpen ? <ChevronUp className="h-3 w-3"/> : <ChevronDown className="h-3 w-3"/>}
                    {transcriptOpen ? "Hide" : "Show"} what Gemma transcribed
                  </button>
                  {transcriptOpen && (
                    <p className="mt-2 text-xs text-foreground/70 leading-relaxed font-mono bg-muted/20 rounded p-2">
                      {rec.audioTranscript}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Patient Instructions */}
        <Card className="p-4 border-border bg-card space-y-3">
          <h3 className="font-semibold text-sm">Patient Instructions</h3>
          {translating ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin"/>Translating…
            </div>
          ) : (
            <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto">
              {instructions || rec.patientInstructions || "Instructions will appear here after triage."}
            </div>
          )}
          <p className="text-xs text-muted-foreground">Change language above to re-translate both panels with Gemma 4</p>
        </Card>
      </div>

      <Button onClick={onClear} variant="outline" size="sm" className="w-full text-xs">
        Clear Result
      </Button>
    </div>
  );
}

// ── Individual demo card ──────────────────────────────────────────────────────
function DemoCard({
  sample, onRun, running, result, error, onClear, uiLang,
}: {
  sample: typeof demoSamples[number];
  onRun: () => void;
  running: boolean;
  result: any;
  error: string;
  onClear: () => void;
  uiLang: string;
}) {
  const { t } = useLanguage();
  const [textOpen, setTextOpen] = useState(false);

  const isMismatch = result?.error === "medication_safety_critical" || result?.error === "medication_mismatch";
  const rec = result?.triageRecord ?? (!isMismatch ? result : null);
  const hasAudio = !!(sample as any).audioFile;
  const hasImage = !!(sample as any).imageFile;
  const hasText  = !!(sample as any).textInput;

  return (
    <div className="flex flex-col gap-3">
      <Card className="p-5 border-border bg-card flex flex-col gap-4">

        {/* Header */}
        <div className="flex items-start gap-3">
          <span className="text-2xl">{sample.flag}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base">{sample.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{sample.description}</p>
          </div>
        </div>

        {/* Input type badges */}
        <div className="flex gap-2 flex-wrap">
          <span className="px-2.5 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
            {sample.language}
          </span>
          {hasAudio && (
            <span className="px-2.5 py-1 text-xs rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
              <Mic className="h-3 w-3"/>Audio
            </span>
          )}
          {hasText && !hasAudio && (
            <span className="px-2.5 py-1 text-xs rounded-full bg-muted/40 text-muted-foreground border border-border flex items-center gap-1">
              📝 Text
            </span>
          )}
          {hasImage && (
            <span className="px-2.5 py-1 text-xs rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
              <ImageIcon className="h-3 w-3"/>Image
            </span>
          )}
        </div>

        {/* Clinical note */}
        <div className="bg-muted/20 rounded-lg p-3 text-xs text-muted-foreground border border-border">
          <span className="font-semibold text-foreground">🩺 Clinical note: </span>
          {sample.clinicalNote}
        </div>

        {/* Real audio player + image viewer */}
        <MediaPreview sample={sample}/>

        {/* What the inputs contain */}
        <div className="space-y-2">
          {sample.audioPills.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1.5 font-semibold">
                {hasAudio ? "🎙 Audio mentions:" : "📝 Typed symptoms:"}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {sample.audioPills.map(p => (
                  <span key={p} className="text-xs px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20">{p}</span>
                ))}
              </div>
            </div>
          )}
          {sample.imagePills.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1.5 font-semibold">📷 Image shows:</p>
              <div className="flex flex-wrap gap-1.5">
                {sample.imagePills.map(p => (
                  <span key={p} className="text-xs px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">{p}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Text input toggle (case 4) */}
        {hasText && (
          <div>
            <button
              onClick={() => setTextOpen(v => !v)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {textOpen ? <ChevronUp className="h-3 w-3"/> : <ChevronDown className="h-3 w-3"/>}
              {textOpen ? "Hide" : "Show"} Arabic text input
            </button>
            {textOpen && (
              <div className="mt-2 p-3 rounded-lg bg-muted/30 border border-border text-xs text-foreground/80 leading-relaxed font-mono" dir="rtl">
                {(sample as any).textInput}
              </div>
            )}
          </div>
        )}

        {/* Expected outcome */}
        <div className="text-xs font-medium text-muted-foreground border-t border-border pt-3">
          Expected: <span className="text-foreground">{sample.expectedResult}</span>
        </div>

        <Button onClick={onRun} disabled={running} className="w-full bg-primary hover:bg-primary/90">
          {running
            ? <><Loader2 className="h-4 w-4 mr-2 animate-spin"/>Gemma 4 running full pipeline…</>
            : <><Play className="h-4 w-4 mr-2"/>Run Demo — Full Pipeline</>
          }
        </Button>
      </Card>

      {/* Error */}
      {error && (
        <div className="flex gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5"/>{error}
        </div>
      )}

      {/* Full result — same output as main triage page */}
      {result && <DemoResult result={result} isMismatch={isMismatch} rec={rec} onClear={onClear} t={t} />}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Demo() {
  const { t, uiLang } = useLanguage();
  const [runningId, setRunningId] = useState<number | null>(null);
  const [results,   setResults]   = useState<Record<number, any>>({});
  const [errors,    setErrors]    = useState<Record<number, string>>({});
  const processMutation = trpc.triage.processTriage.useMutation();

  const handleRun = async (sample: typeof demoSamples[number]) => {
    setRunningId(sample.id);
    setErrors(e  => ({ ...e,  [sample.id]: "" }));
    setResults(r => { const n = { ...r }; delete n[sample.id]; return n; });

    try {
      // Build payload using real files — same as live triage
      const payload: Record<string, any> = { uiLanguage: uiLang };

      const s = sample as any;

      if (s.audioFile) {
        // Fetch real MP3, convert to base64 — Gemma 4 will transcribe it
        const b64 = await fetchAsBase64(s.audioFile);
        payload.audioBase64  = b64;
        payload.audioMimeType = s.mimeType.audio;
      } else if (s.textInput) {
        // Text-only input (case 4)
        payload.audioTranscript = s.textInput;
      }

      if (s.imageFile) {
        // Fetch real image, convert to base64 — Gemma 4 vision will read it
        const b64 = await fetchAsBase64(s.imageFile);
        payload.imageBase64  = b64;
        payload.imageMimeType = s.mimeType.image;
      }

      const res = await processMutation.mutateAsync(payload as any);
      setResults(r => ({ ...r, [sample.id]: res }));

    } catch (err: any) {
      // Medication mismatch halts — comes back as structured error not a throw
      const structured = err?.shape?.data ?? err?.data;
      if (structured?.error === "medication_safety_critical" || structured?.conflicts) {
        setResults(r => ({ ...r, [sample.id]: structured }));
      } else {
        const msg = err?.message || err?.data?.message || "Failed — is Ollama running with gemma4:e4b?";
        setErrors(e => ({ ...e, [sample.id]: msg }));
      }
    } finally {
      setRunningId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">{t.demoCases}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Four real clinical scenarios. Each demo runs the same full 6-call Gemma 4 pipeline as a live triage —
          real audio files are transcribed, real images are analysed by Gemma vision, safety checks run identically.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {demoSamples.map(sample => (
          <DemoCard
            key={sample.id}
            sample={sample}
            onRun={() => handleRun(sample)}
            running={runningId === sample.id}
            result={results[sample.id]}
            error={errors[sample.id] || ""}
            onClear={() => setResults(r => { const n = { ...r }; delete n[sample.id]; return n; })}
            uiLang={uiLang}
          />
        ))}
      </div>

      {/* Pipeline transparency note */}
      <div className="flex gap-2 p-4 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-primary"/>
        <div className="space-y-1">
          <p className="font-semibold text-foreground">Same pipeline as live triage</p>
          <p>
            Call 1 — Gemma 4 transcribes the real audio file &nbsp;·&nbsp;
            Call 2 — Gemma 4 vision reads the real image &nbsp;·&nbsp;
            Call 3 — Synthesizes inputs &nbsp;·&nbsp;
            Call 4 — Extracts structured data &nbsp;·&nbsp;
            Call 5 — 4-layer sequential safety check &nbsp;·&nbsp;
            Call 6 — Bilingual patient instructions.
            Everything runs 100% locally via Ollama — nothing sent to the cloud.
          </p>
        </div>
      </div>
    </div>
  );
}
