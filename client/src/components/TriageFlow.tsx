import { useState, useRef, useCallback, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import TriageInput from "./TriageInput";
import TriageOutput from "./TriageOutput";
import TriageProcessing from "./TriageProcessing";
import MedicationMismatchModal from "./MedicationMismatchModal";
import { trpc } from "@/lib/trpc";

type TriageStep = "input" | "processing" | "mismatch" | "output";

// Must match the emit() ids in triage.ts AND the step ids in TriageProcessing
const STEP_ORDER = [
  "audio", "langdetect", "image", "synthesis",
  "extraction", "safety", "instructions", "save",
] as const;

type StepId = (typeof STEP_ORDER)[number];

/** Minimum ms each step stays highlighted — ensures no step looks skipped */
const MIN_STEP_MS = 450;

function makeJobId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function TriageFlow({ onComplete }: { onComplete?: () => void }) {
  const [step, setStep]               = useState<TriageStep>("input");
  const [hasAudio, setHasAudio]       = useState(false);
  const [hasImage, setHasImage]       = useState(false);
  const [hasText, setHasText]         = useState(false);
  const [displayedStep, setDisplayedStep] = useState<StepId | undefined>();
  const [allDone, setAllDone]         = useState(false);
  const [mismatchData, setMismatchData] = useState<any>(null);
  const [triageResult, setTriageResult] = useState<any>(null);
  const [error, setError]             = useState<string | null>(null);

  // Queue of step ids waiting to be displayed
  const [stepQueue, setStepQueue]     = useState<StepId[]>([]);

  const pollRef          = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const displayedStepRef = useRef<StepId | undefined>();
  const lastQueuedRef    = useRef<StepId | undefined>();
  const serverDoneRef    = useRef(false);
  const resultRef        = useRef<any>(null);
  const mutDoneRef       = useRef(false);

  // ── KEY FIX: ref that always reflects real queue length inside callbacks ──
  // stepQueue state is stale inside setInterval closures; this ref is not.
  const stepQueueRef     = useRef<StepId[]>([]);

  const processMutation = trpc.triage.processTriage.useMutation();
  const proceedMutation = trpc.triage.proceedWithConflicts.useMutation();

  // ── Step queue processor ────────────────────────────────────────────────
  useEffect(() => {
    if (stepQueue.length === 0) return;

    // If no step is showing yet, show the first one immediately
    if (!displayedStepRef.current) {
      const first = stepQueue[0];
      setDisplayedStep(first);
      displayedStepRef.current = first;
      const next = stepQueue.slice(1);
      stepQueueRef.current = next;
      setStepQueue(next);
      return;
    }

    // Otherwise wait MIN_STEP_MS then advance
    const t = setTimeout(() => {
      const next = stepQueue[0];
      setDisplayedStep(next);
      displayedStepRef.current = next;
      const remaining = stepQueue.slice(1);
      stepQueueRef.current = remaining;
      setStepQueue(remaining);

      // If this was the last queued step AND server already marked done, finish
      if (remaining.length === 0 && serverDoneRef.current && mutDoneRef.current) {
        setTimeout(() => finishNow(resultRef.current), 400);
      }
    }, MIN_STEP_MS);

    stepTimerRef.current = t;
    return () => clearTimeout(t);
  }, [stepQueue]);

  // ── Enqueue server step ─────────────────────────────────────────────────
  const enqueueStep = useCallback((serverStep: StepId) => {
    const lastQueued = lastQueuedRef.current;
    const lastIdx    = lastQueued ? STEP_ORDER.indexOf(lastQueued) : -1;
    const newIdx     = STEP_ORDER.indexOf(serverStep);
    if (newIdx < 0 || newIdx <= lastIdx) return;

    const toAdd = STEP_ORDER.slice(lastIdx + 1, newIdx + 1) as StepId[];
    lastQueuedRef.current = serverStep;
    // Update both state (for rendering) and ref (for callbacks)
    stepQueueRef.current = [...stepQueueRef.current, ...toAdd];
    setStepQueue(q => [...q, ...toAdd]);
  }, []);

  // ── Navigate to output ──────────────────────────────────────────────────
  const finishNow = useCallback((result: any) => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (stepTimerRef.current) { clearTimeout(stepTimerRef.current); stepTimerRef.current = null; }
    setAllDone(true);
    setTimeout(() => {
      if (result?.success) {
        setTriageResult(result.triageRecord);
        setStep("output");
        toast.success("Triage completed");
      } else if (result?.error === "medication_safety_critical") {
        setMismatchData({
          audioMedication:  result.audioMedication ?? "Unknown",
          imageMedication:  result.imageMedication ?? "Unknown",
          conflicts:        result.conflicts ?? [],
          transcript:       result.transcript,
          imageDescription: result.imageDescription,
        });
        setStep("mismatch");
        toast.error("Critical medication conflict detected — clinician review required");
      }
    }, 700);
  }, []);

  // ── Polling ─────────────────────────────────────────────────────────────
  const startPolling = useCallback((jobId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      try {
        const r    = await fetch(`/api/triage/status/${jobId}`);
        const data = await r.json() as { step: string };
        const s    = data.step;

        if (!s || s === "waiting") return;

        if (s === "done") {
          serverDoneRef.current = true;
          clearInterval(pollRef.current!);
          pollRef.current = null;

          // Use stepQueueRef (not stale stepQueue state) to check real queue length
          if (stepQueueRef.current.length === 0 && mutDoneRef.current) {
            setTimeout(() => finishNow(resultRef.current), MIN_STEP_MS);
          }
          // Otherwise queue effect will call finishNow once it drains
          return;
        }

        enqueueStep(s as StepId);
      } catch {
        // server busy — retry next tick
      }
    }, 100);
  }, [enqueueStep, finishNow]);  // no stepQueue.length dependency — we use the ref

  // ── Reset helpers ───────────────────────────────────────────────────────
  const resetState = useCallback(() => {
    if (pollRef.current)      { clearInterval(pollRef.current);  pollRef.current = null; }
    if (stepTimerRef.current) { clearTimeout(stepTimerRef.current); stepTimerRef.current = null; }
    displayedStepRef.current = undefined;
    lastQueuedRef.current    = undefined;
    serverDoneRef.current    = false;
    mutDoneRef.current       = false;
    resultRef.current        = null;
    stepQueueRef.current     = [];
    setDisplayedStep(undefined);
    setStepQueue([]);
    setAllDone(false);
  }, []);

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleTriageSubmit = async (
    audio: File | null,
    image: File | null,
    textTranscript?: string,
  ) => {
    const hasAudioInput = !!audio;
    const hasImageInput = !!image;
    const hasTextInput  = !!textTranscript && !audio;

    if (!hasAudioInput && !hasImageInput && !hasTextInput) {
      toast.error("Please provide audio, a photo, or type your symptoms");
      return;
    }

    resetState();
    setHasAudio(hasAudioInput);
    setHasImage(hasImageInput);
    setHasText(hasTextInput);
    setError(null);
    setStep("processing");

    const jobId = makeJobId();
    startPolling(jobId);

    try {
      const toBase64 = (f: File): Promise<string> =>
        new Promise((res, rej) => {
          const r = new FileReader();
          r.onload  = () => res((r.result as string).split(",")[1] ?? "");
          r.onerror = () => rej(new Error("File read failed"));
          r.readAsDataURL(f);
        });

      const result = await processMutation.mutateAsync({
        jobId,
        audioBase64:     audio ? await toBase64(audio) : undefined,
        audioMimeType:   audio?.type ?? "audio/wav",
        imageBase64:     image ? await toBase64(image) : undefined,
        imageMimeType:   image?.type,
        audioTranscript: textTranscript,
      });

      resultRef.current  = result;
      mutDoneRef.current = true;

      // If server already finished and queue is drained, finish now
      if (serverDoneRef.current && stepQueueRef.current.length === 0) {
        setTimeout(() => finishNow(result), MIN_STEP_MS);
      }

    } catch (err) {
      resetState();
      const msg = err instanceof Error ? err.message : "Failed to process triage";
      setError(msg);
      toast.error(msg);
      setStep("input");
    }
  };

  const handleProceedWithConflicts = async () => {
    if (!mismatchData?.transcript) return;
    try {
      const result = await proceedMutation.mutateAsync({
        audioTranscript:  mismatchData.transcript,
        imageDescription: mismatchData.imageDescription,
        conflicts:        mismatchData.conflicts,
      });
      if (result.success) {
        setTriageResult(result.triageRecord);
        setStep("output");
        toast.success("Triage completed (conflicts acknowledged)");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to process triage";
      setError(msg);
      toast.error(msg);
    }
  };

  const handleReset = () => {
    resetState();
    setStep("input");
    setHasAudio(false);
    setHasImage(false);
    setHasText(false);
    setMismatchData(null);
    setTriageResult(null);
    setError(null);
    onComplete?.();
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-3 p-4 rounded-lg bg-warning/10 border border-warning/30">
        <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
        <div className="text-sm text-warning">
          <strong>Clinical AI Aid:</strong> This tool assists healthcare workers in
          triage. It is not a substitute for professional medical judgment. Always
          consult qualified healthcare professionals for diagnosis and treatment.
        </div>
      </div>

      {error && (
        <div className="flex gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="text-sm text-destructive"><strong>Error:</strong> {error}</div>
        </div>
      )}

      {step === "input" && (
        <TriageInput onSubmit={handleTriageSubmit} isLoading={false} />
      )}

      {step === "processing" && (
        <TriageProcessing
          hasAudio={hasAudio}
          hasImage={hasImage}
          hasText={hasText}
          currentStep={displayedStep}
          allDone={allDone}
        />
      )}

      {step === "output" && triageResult && (
        <>
          <TriageOutput record={triageResult} onSave={handleReset} />
          <div className="text-center">
            <button onClick={handleReset} className="text-sm text-primary hover:underline">
              Start new triage
            </button>
          </div>
        </>
      )}

      {step === "mismatch" && mismatchData && (
        <MedicationMismatchModal
          audioMedication={mismatchData.audioMedication}
          imageMedication={mismatchData.imageMedication}
          safetyConflicts={
            Array.isArray(mismatchData.conflicts) && mismatchData.conflicts.length > 0
              ? mismatchData.conflicts.join("\n\n")
              : typeof mismatchData.conflicts === "string"
              ? mismatchData.conflicts
              : null
          }
          onProceed={handleProceedWithConflicts}
          onCancel={() => { setStep("input"); setMismatchData(null); }}
          isLoading={proceedMutation.isPending}
        />
      )}
    </div>
  );
}
