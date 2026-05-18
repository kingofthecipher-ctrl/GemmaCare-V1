import { useEffect, useState } from "react";
import { CheckCircle, Circle, Loader2, Mic, Camera, GitMerge, ClipboardList, ShieldCheck, FileText, Database } from "lucide-react";

type StepStatus = "waiting" | "active" | "done";

interface StepDef {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
}

interface TriageProcessingProps {
  hasAudio: boolean;
  hasImage: boolean;
  hasText: boolean;
  /** Current step id driven by SSE — matches emit() ids in triage router */
  currentStep?: string;
  /** True once server emits "done" — marks all steps complete */
  allDone?: boolean;
}

export default function TriageProcessing({
  hasAudio,
  hasImage,
  hasText,
  currentStep,
  allDone = false,
}: TriageProcessingProps) {
  const buildStepDefs = (): StepDef[] => {
    const defs: StepDef[] = [];

    if (hasAudio && !hasText) {
      defs.push({
        id: "audio",
        label: "Transcribing audio",
        sublabel: "Converting to WAV · detecting language · Gemma 4 native audio",
        icon: <Mic className="h-4 w-4" />,
      });
    }

    if (hasText && !hasAudio) {
      defs.push({
        id: "langdetect",
        label: "Detecting language",
        sublabel: "Identifying the language of typed text",
        icon: <Mic className="h-4 w-4" />,
      });
    }

    if (hasImage) {
      defs.push({
        id: "image",
        label: "Analysing image",
        sublabel: "Reading medication labels · wounds · clinical observations",
        icon: <Camera className="h-4 w-4" />,
      });
    }

    if ((hasAudio || hasText) && hasImage) {
      defs.push({
        id: "synthesis",
        label: "Weighing audio vs image",
        sublabel: "Cross-referencing both inputs · surfacing contradictions",
        icon: <GitMerge className="h-4 w-4" />,
      });
    }

    defs.push({
      id: "extraction",
      label: "Extracting clinical data",
      sublabel: "Complaint · symptoms · urgency · medications · language",
      icon: <ClipboardList className="h-4 w-4" />,
    });

    defs.push({
      id: "safety",
      label: "Medication safety check",
      sublabel: "Name · category · route · semantic — 4-layer verification",
      icon: <ShieldCheck className="h-4 w-4" />,
    });

    defs.push({
      id: "instructions",
      label: "Generating patient instructions",
      sublabel: "Bilingual · urgency-matched · plain language",
      icon: <FileText className="h-4 w-4" />,
    });

    defs.push({
      id: "save",
      label: "Saving triage record",
      sublabel: "Writing to local SQLite · session history",
      icon: <Database className="h-4 w-4" />,
    });

    return defs;
  };

  const stepDefs = buildStepDefs();

  const getStatuses = (activeId: string | undefined, done: boolean): StepStatus[] => {
    if (done) return stepDefs.map(() => "done");
    if (!activeId) return stepDefs.map((_, i) => (i === 0 ? "active" : "waiting"));
    const activeIdx = stepDefs.findIndex(s => s.id === activeId);
    if (activeIdx === -1) return stepDefs.map((_, i) => (i === 0 ? "active" : "waiting"));
    return stepDefs.map((_, i) =>
      i < activeIdx ? "done" : i === activeIdx ? "active" : "waiting"
    );
  };

  const [statuses, setStatuses] = useState<StepStatus[]>(() => getStatuses(currentStep, allDone));
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    setStatuses(getStatuses(currentStep, allDone));
  }, [currentStep, allDone]);

  // Real elapsed clock — not used for progress, just for display
  useEffect(() => {
    const iv = setInterval(() => setElapsedSec(s => s + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  const doneCount = statuses.filter(s => s === "done").length;
  const activeIdx = statuses.findIndex(s => s === "active");
  const progressPct = Math.min(
    99,
    Math.round(((doneCount + (activeIdx >= 0 ? 0.5 : 0)) / stepDefs.length) * 100)
  );

  const activeStepDef = stepDefs[activeIdx];

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
          <Loader2 className="h-5 w-5 text-primary animate-spin" />
        </div>
        <div>
          <p className="font-medium text-sm text-foreground">Gemma 4 E4B Analysing</p>
          <p className="text-xs text-muted-foreground">
            100% local via Ollama · {elapsedSec}s elapsed
          </p>
        </div>
        <div className="ml-auto text-xs font-mono text-muted-foreground">{progressPct}%</div>
      </div>

      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="space-y-1">
        {stepDefs.map((step, i) => {
          const status = statuses[i];
          return (
            <div
              key={step.id}
              className={`flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${
                status === "active"
                  ? "bg-primary/8 border border-primary/20"
                  : status === "done"
                  ? "opacity-60"
                  : "opacity-30"
              }`}
            >
              <div className={`mt-0.5 flex-shrink-0 ${
                status === "active" ? "text-primary" :
                status === "done" ? "text-green-500" : "text-muted-foreground"
              }`}>
                {status === "done" ? (
                  <CheckCircle className="h-4 w-4" />
                ) : status === "active" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </div>

              <div className="min-w-0">
                <p className={`text-sm font-medium leading-tight ${
                  status === "active" ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {step.label}
                </p>
                {status === "active" && (
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                    {step.sublabel}
                  </p>
                )}
              </div>

              <div className="ml-auto flex-shrink-0 text-xs text-muted-foreground opacity-50">
                {i + 1}/{stepDefs.length}
              </div>
            </div>
          );
        })}
      </div>

      {activeStepDef && (
        <div className="rounded-lg bg-muted/50 px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">currently running</p>
          <p className="text-sm font-medium text-foreground">{activeStepDef.label}</p>
          <p className="text-xs text-muted-foreground mt-1">{activeStepDef.sublabel}</p>
        </div>
      )}

      <p className="text-xs text-center text-muted-foreground">
        Each Gemma call takes 10–30s on CPU · do not close this tab
      </p>
    </div>
  );
}
