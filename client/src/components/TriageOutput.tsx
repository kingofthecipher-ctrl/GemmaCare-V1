/**
 * TriageOutput — used in History page to display a saved triage record.
 *
 * The "Care Instructions" panel now live-translates via Gemma 4 whenever the
 * clinician picks a different language from the selector — exactly matching the
 * behaviour of the Triage page's ResultPanel.
 */

import { Card }           from "@/components/ui/card";
import { Button }         from "@/components/ui/button";
import { AlertCircle, Download, Copy, CheckCircle, Loader2 } from "lucide-react";
import { useState }       from "react";
import { LanguageSelector } from "./LanguageSelector";
import { type LanguageCode, SUPPORTED_LANGUAGES } from "@/../../shared/languages";
import { trpc }           from "@/lib/trpc";

interface TriageOutputProps {
  record: {
    id:                 number;
    chiefComplaint:     string;
    symptomList:        string[];
    urgencyLevel:       number;
    medicationFound:    string | null;
    recommendedAction:  string;
    patientLanguage:    string;
    exportLanguage?:    string;
    confidence:         number;
    audioImageMatch:    boolean;
    patientInstructions: string;
    createdAt:          Date;
  };
  onSave?: () => void;
}

const urgencyColors: Record<number, { bg: string; text: string; border: string; label: string }> = {
  1: { bg: "bg-blue-500/10",   text: "text-blue-400",   border: "border-blue-500/30",   label: "Routine"   },
  2: { bg: "bg-green-500/10",  text: "text-green-400",  border: "border-green-500/30",  label: "Minor"     },
  3: { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30", label: "Moderate"  },
  4: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30", label: "Urgent"    },
  5: { bg: "bg-red-500/10",    text: "text-red-400",    border: "border-red-500/30",    label: "Emergency" },
};

export default function TriageOutput({ record, onSave }: TriageOutputProps) {
  const [copied, setCopied]           = useState(false);
  const [displayLang, setDisplayLang] = useState<LanguageCode>(
    (record.exportLanguage as LanguageCode) || "en",
  );
  const [instructions, setInstructions] = useState(record.patientInstructions);
  const [translating, setTranslating]   = useState(false);

  const translateMut = trpc.triage.translateInstructions.useMutation();

  const urgencyColor  = urgencyColors[record.urgencyLevel] ?? urgencyColors[3];
  const confidenceColor =
    record.confidence >= 80 ? "text-green-400"  :
    record.confidence >= 60 ? "text-yellow-400" : "text-red-400";

  const handleLanguageChange = async (lang: LanguageCode) => {
    if (lang === displayLang) return;
    setDisplayLang(lang);

    if (lang === "en") {
      setInstructions(record.patientInstructions);
      return;
    }

    setTranslating(true);
    try {
      const langInfo = (SUPPORTED_LANGUAGES as any)[lang];
      const langName = langInfo ? `${langInfo.name} (${langInfo.nativeName})` : lang;
      const res = await translateMut.mutateAsync({
        recordId:       record.id,
        targetLanguage: langName,
      });
      setInstructions(res.instructions);
    } catch (e) {
      console.error("Translation failed", e);
    } finally {
      setTranslating(false);
    }
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify({
      chief_complaint:    record.chiefComplaint,
      symptom_list:       record.symptomList,
      urgency_level:      record.urgencyLevel,
      medication_found:   record.medicationFound,
      recommended_action: record.recommendedAction,
      patient_language:   record.patientLanguage,
      confidence:         record.confidence,
      audio_image_match:  record.audioImageMatch,
      created_at:         record.createdAt,
    }, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportTxt = () => {
    const langInfo = (SUPPORTED_LANGUAGES as any)[displayLang];
    const content = [
      "=== GEMMACARE TRIAGE RECORD ===",
      `Date: ${new Date(record.createdAt).toLocaleString()}`,
      `Chief Complaint: ${record.chiefComplaint}`,
      `Symptoms: ${record.symptomList.join(", ")}`,
      `Urgency: ${record.urgencyLevel}/5 — ${urgencyColor.label}`,
      `Medication: ${record.medicationFound ?? "None"}`,
      `Recommended Action: ${record.recommendedAction}`,
      `Patient Language: ${record.patientLanguage}`,
      `Confidence: ${record.confidence}%`,
      "",
      `=== PATIENT INSTRUCTIONS (${langInfo?.name ?? displayLang}) ===`,
      instructions,
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
    a.download = `triage-${record.id}-${displayLang}.txt`;
    a.click();
  };

  const uiLangInfo = (SUPPORTED_LANGUAGES as any)[displayLang];

  return (
    <div className="space-y-6">
      {/* Mismatch Warning */}
      {!record.audioImageMatch && (
        <div className="flex gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-sm text-red-300">
            <strong>Medication Mismatch:</strong> Audio and image medications did not match.
            Clinician review was required before this record was saved.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clinical Record */}
        <Card className="p-6 border-border bg-card">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Clinical Record</h3>
              <Button onClick={handleCopyJSON} variant="outline" size="sm" className="h-8">
                {copied
                  ? <><CheckCircle className="h-3 w-3 mr-1 text-green-400"/>Copied</>
                  : <><Copy className="h-3 w-3 mr-1"/>Copy JSON</>}
              </Button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-1">Chief Complaint</p>
                <p>{record.chiefComplaint}</p>
              </div>
              {record.symptomList.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-1">Symptoms</p>
                  <ul className="space-y-0.5">
                    {record.symptomList.map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-primary mt-0.5">•</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-1">Urgency</p>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${urgencyColor.bg} ${urgencyColor.text} ${urgencyColor.border}`}>
                  {record.urgencyLevel}/5 — {urgencyColor.label}
                </span>
              </div>
              {record.medicationFound && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-1">Medication</p>
                  <p className="font-medium">{record.medicationFound}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-1">Recommended Action</p>
                <p>{record.recommendedAction}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-1">Confidence</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted/30 rounded-full h-2 overflow-hidden">
                    <div className="bg-primary h-full transition-all" style={{ width: `${record.confidence}%` }} />
                  </div>
                  <span className={`text-xs font-bold ${confidenceColor}`}>{record.confidence}%</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-1">Patient Language</p>
                <p className="font-medium">{record.patientLanguage}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Patient Instructions — live-translated */}
        <Card className="p-6 border-border bg-card">
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-lg font-semibold">Care Instructions</h3>
              <LanguageSelector
                selectedLanguage={displayLang}
                onLanguageChange={handleLanguageChange}
              />
            </div>

            {translating ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
                <Loader2 className="h-4 w-4 animate-spin"/>
                Translating with Gemma 4…
              </div>
            ) : (
              <div className="prose prose-sm text-foreground max-w-none overflow-y-auto max-h-80">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{instructions}</p>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Auto-generated by Gemma 4 · select language above to re-translate
            </p>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        {onSave && (
          <Button
            onClick={onSave}
            className="flex-1 min-w-32 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Save Record
          </Button>
        )}
        <Button onClick={handleExportTxt} variant="outline" className="flex-1 min-w-32">
          <Download className="h-4 w-4 mr-2" />
          Export ({uiLangInfo?.name ?? displayLang})
        </Button>
      </div>

      <div className="text-xs text-muted-foreground text-center">
        Record created: {new Date(record.createdAt).toLocaleString()}
      </div>
    </div>
  );
}
