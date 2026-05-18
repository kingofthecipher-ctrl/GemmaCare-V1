import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, AlertCircle, Eye, Download, Loader2, X } from "lucide-react";
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { SUPPORTED_LANGUAGES } from "@shared/languages";

type SortBy = "date" | "urgency" | "language";

const URGENCY_COLORS: Record<number, string> = {
  1: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
  2: "bg-green-500/10 text-green-400 border border-green-500/30",
  3: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30",
  4: "bg-orange-500/10 text-orange-400 border border-orange-500/30",
  5: "bg-red-500/10 text-red-400 border border-red-500/30",
};
const URGENCY_LABEL = ["","Routine","Minor","Moderate","Urgent","Emergency"];

function getPatientDetails(recordId: number) {
  try {
    const details = JSON.parse(localStorage.getItem("gemmacare_patient_details") || "[]");
    return details.find((d: any) => d.recordId === recordId) || null;
  } catch { return null; }
}

function renderMarkdown(text: string): React.ReactNode[] {
  return text.split("\n").map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-1"/>;
    if (line.startsWith("## ")) return <h3 key={i} className="font-bold mt-3 mb-1">{line.slice(3)}</h3>;
    if (line.startsWith("# ")) return <h2 key={i} className="font-bold text-lg mt-3 mb-1">{line.slice(2)}</h2>;
    if (line.match(/^[*-] /)) return <p key={i} className="flex gap-1"><span className="text-primary">•</span>{line.slice(2)}</p>;
    return <p key={i} className="mb-0.5">{line}</p>;
  });
}

export default function History() {
  const { t, uiLang } = useLanguage();
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [selectedRecord, setSelectedRecord] = useState<number | null>(null);
  const [translating, setTranslating] = useState(false);
  const [translatedInstructions, setTranslatedInstructions] = useState<string | null>(null);
  const [displayLang, setDisplayLang] = useState(uiLang);

  const { data: records, isLoading } = trpc.triage.getHistory.useQuery();
  const { data: recordDetail } = trpc.triage.getRecord.useQuery(
    { id: selectedRecord! },
    { enabled: selectedRecord !== null }
  );
  const translateMut = trpc.triage.translateInstructions.useMutation();

  const sortedRecords = useMemo(() => {
    if (!records) return [];
    const sorted = [...records];
    if (sortBy === "date") sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (sortBy === "urgency") sorted.sort((a, b) => b.urgencyLevel - a.urgencyLevel);
    else sorted.sort((a, b) => a.patientLanguage.localeCompare(b.patientLanguage));
    return sorted;
  }, [records, sortBy]);

  const openRecord = (id: number) => {
    setSelectedRecord(id);
    setTranslatedInstructions(null);
    setDisplayLang(uiLang);
  };

  const handleTranslate = async (lang: string) => {
    if (!recordDetail) return;
    setDisplayLang(lang);
    if (lang === recordDetail.patientLanguage) { setTranslatedInstructions(null); return; }
    setTranslating(true);
    try {
      const langInfo = (SUPPORTED_LANGUAGES as any)[lang];
      const langName = langInfo ? `${langInfo.name} (${langInfo.nativeName})` : lang;
      const res = await translateMut.mutateAsync({ recordId: recordDetail.id, targetLanguage: langName });
      setTranslatedInstructions(res.instructions);
    } catch { setTranslatedInstructions(null); }
    setTranslating(false);
  };

  const exportRecord = () => {
    if (!recordDetail) return;
    const details = getPatientDetails(recordDetail.id);
    const langInfo = (SUPPORTED_LANGUAGES as any)[displayLang];
    const instructions = translatedInstructions || recordDetail.patientInstructions || "";
    const txt = [
      "=== GEMMACARE TRIAGE RECORD ===",
      `Date: ${new Date(recordDetail.createdAt).toLocaleString()}`,
      details?.patientName ? `Patient: ${details.patientName}` : "",
      details?.patientLocation ? `Location: ${details.patientLocation}` : "",
      `Chief Complaint: ${recordDetail.chiefComplaint}`,
      `Symptoms: ${recordDetail.symptomList?.join(", ")}`,
      `Urgency: ${recordDetail.urgencyLevel}/5 — ${URGENCY_LABEL[recordDetail.urgencyLevel]}`,
      `Medication: ${recordDetail.medicationFound || "None"}`,
      `Recommended Action: ${recordDetail.recommendedAction}`,
      `Patient Language: ${recordDetail.patientLanguage}`,
      `Confidence: ${recordDetail.confidence}%`,
      "",
      `=== PATIENT INSTRUCTIONS (${langInfo?.name || displayLang}) ===`,
      instructions,
    ].filter(Boolean).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([txt], { type: "text/plain" }));
    a.download = `triage-${recordDetail.id}-${displayLang}.txt`;
    a.click();
  };

  const details = selectedRecord ? getPatientDetails(selectedRecord) : null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">{t.history}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t.clinicalRecord}</p>
      </div>

      {records && records.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          {(["date","urgency","language"] as const).map(s => (
            <Button key={s} onClick={() => setSortBy(s)} variant={sortBy===s?"default":"outline"} size="sm" className="capitalize">{s}</Button>
          ))}
          <span className="ml-auto text-xs text-muted-foreground">{records.length} {t.clinicalRecord}s</span>
        </div>
      )}

      {isLoading ? (
        <Card className="p-12 border-border bg-card text-center">
          <Loader2 className="h-8 w-8 text-muted-foreground mx-auto mb-3 animate-spin"/>
          <p className="text-muted-foreground">Loading…</p>
        </Card>
      ) : !records || records.length === 0 ? (
        <Card className="p-12 border-border bg-card text-center border-dashed">
          <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50"/>
          <p className="font-semibold text-muted-foreground">No triage records yet</p>
          <p className="text-sm text-muted-foreground mt-1">Complete a triage to see records here</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedRecords.map(record => {
            const pd = getPatientDetails(record.id);
            return (
              <Card key={record.id} onClick={() => openRecord(record.id)}
                className="p-4 border-border bg-card hover:border-primary/50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{record.chiefComplaint}</h3>
                      {!record.audioImageMatch && <AlertCircle className="h-4 w-4 text-destructive shrink-0"/>}
                    </div>
                    {pd?.patientName && <p className="text-xs text-primary font-medium mb-1">👤 {pd.patientName}{pd.patientLocation ? ` · ${pd.patientLocation}` : ""}</p>}
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-2">
                      <span>{new Date(record.createdAt).toLocaleDateString()} {new Date(record.createdAt).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</span>
                      <span>·</span>
                      <span>{(SUPPORTED_LANGUAGES as any)[record.patientLanguage]?.name || record.patientLanguage}</span>
                      <span>·</span>
                      <span>{t.confidence}: {record.confidence}%</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${URGENCY_COLORS[record.urgencyLevel]}`}>
                        {record.urgencyLevel}/5 — {URGENCY_LABEL[record.urgencyLevel]}
                      </span>
                      {record.symptomList.length > 0 && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-muted/30 text-muted-foreground">
                          {record.symptomList.length} {t.symptoms}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0" onClick={e => { e.stopPropagation(); openRecord(record.id); }}>
                    <Eye className="h-4 w-4"/>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-border bg-card">
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{t.clinicalRecord}</h3>
                <button onClick={() => setSelectedRecord(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5"/></button>
              </div>

              {!recordDetail ? (
                <div className="flex items-center gap-2 py-8 justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground"/></div>
              ) : (
                <>
                  {/* Patient details */}
                  {details && (
                    <div className="p-3 rounded-lg bg-muted/20 border border-border text-sm space-y-0.5">
                      {details.patientName && <p><span className="text-muted-foreground text-xs uppercase font-semibold">Patient: </span><strong>{details.patientName}</strong></p>}
                      {details.patientLocation && <p><span className="text-muted-foreground text-xs uppercase font-semibold">Location: </span>{details.patientLocation}</p>}
                      {details.patientNotes && <p><span className="text-muted-foreground text-xs uppercase font-semibold">Notes: </span>{details.patientNotes}</p>}
                    </div>
                  )}

                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-1">{t.chiefComplaint}</p>
                      <p className="font-medium">{recordDetail.chiefComplaint}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-1">{t.symptoms}</p>
                      <ul className="space-y-0.5">
                        {recordDetail.symptomList?.map((s: string, i: number) => (
                          <li key={i} className="flex gap-1.5"><span className="text-primary">•</span>{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-1">{t.urgency}</p>
                        <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${URGENCY_COLORS[recordDetail.urgencyLevel]}`}>
                          {recordDetail.urgencyLevel}/5 — {URGENCY_LABEL[recordDetail.urgencyLevel]}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-1">{t.confidence}</p>
                        <p className="font-medium">{recordDetail.confidence}%</p>
                      </div>
                      {recordDetail.medicationFound && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-1">{t.medication}</p>
                          <p className="font-medium">{recordDetail.medicationFound}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-1">{t.detectedLanguage}</p>
                        <p className="font-medium">{(SUPPORTED_LANGUAGES as any)[recordDetail.patientLanguage]?.name || recordDetail.patientLanguage}</p>
                      </div>
                    </div>
                    {recordDetail.recommendedAction && (
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-1">{t.recommendedAction}</p>
                        <p>{recordDetail.recommendedAction}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-1">Created</p>
                      <p>{new Date(recordDetail.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Patient Instructions with language selector */}
                  {recordDetail.patientInstructions && (
                    <div className="border-t border-border pt-4 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">{t.patientInstructions}</p>
                        <select value={displayLang} onChange={e => handleTranslate(e.target.value)}
                          className="text-xs bg-muted/20 border border-border rounded px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                          {Object.entries(SUPPORTED_LANGUAGES).map(([code, info]) => (
                            <option key={code} value={code}>{(info as any).nativeName} — {(info as any).name}</option>
                          ))}
                        </select>
                      </div>
                      {translating ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                          <Loader2 className="h-4 w-4 animate-spin"/>Translating with Gemma 4…
                        </div>
                      ) : (
                        <div className="text-sm text-foreground leading-relaxed bg-muted/10 rounded-lg p-3 max-h-48 overflow-y-auto">
                          {renderMarkdown(translatedInstructions || recordDetail.patientInstructions)}
                        </div>
                      )}
                    </div>
                  )}

                  {!recordDetail.audioImageMatch && (
                    <div className="flex gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                      <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5"/>
                      <p className="text-sm text-destructive"><strong>{t.medicationMismatch}</strong> — {t.medicationWarning}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button onClick={() => setSelectedRecord(null)} variant="outline" className="flex-1">Close</Button>
                    <Button onClick={exportRecord} variant="outline" className="flex-1">
                      <Download className="h-4 w-4 mr-2"/>{t.exportRecord} ({(SUPPORTED_LANGUAGES as any)[displayLang]?.name || displayLang})
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
