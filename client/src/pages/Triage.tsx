import { trpc } from "@/lib/trpc";
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, AlertTriangle, Camera, Mic, MicOff, Upload, X, Loader2, CheckCircle, Copy, Download, Globe, Wifi, WifiOff, RotateCcw } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "@shared/languages";
import { useLanguage } from "@/contexts/LanguageContext";

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

const URGENCY: Record<number, { bg: string; text: string; border: string; label: string }> = {
  1: { bg: "bg-blue-500/10",   text: "text-blue-400",   border: "border-blue-500/30",   label: "Routine"   },
  2: { bg: "bg-green-500/10",  text: "text-green-400",  border: "border-green-500/30",  label: "Minor"     },
  3: { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30", label: "Moderate"  },
  4: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30", label: "Urgent"    },
  5: { bg: "bg-red-500/10",    text: "text-red-400",    border: "border-red-500/30",    label: "Emergency" },
};

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { nodes.push(<div key={`b${i}`} className="h-2" />); i++; continue; }
    if (line.startsWith("### ")) { nodes.push(<h3 key={i} className="text-base font-bold mt-4 mb-1">{line.slice(4)}</h3>); i++; continue; }
    if (line.startsWith("## "))  { nodes.push(<h2 key={i} className="text-lg font-bold mt-5 mb-2 border-b border-border pb-1">{line.slice(3)}</h2>); i++; continue; }
    if (line.startsWith("# "))   { nodes.push(<h1 key={i} className="text-xl font-bold mt-5 mb-2">{line.slice(2)}</h1>); i++; continue; }
    if (line.trim() === "---" || line.trim() === "***") { nodes.push(<hr key={i} className="border-border my-3" />); i++; continue; }
    if (line.match(/^[*•\-] /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^[*•\-] /)) { items.push(lines[i].replace(/^[*•\-] /, "")); i++; }
      nodes.push(<ul key={`ul${i}`} className="space-y-1 my-2">{items.map((item, j) => <li key={j} className="flex gap-2"><span className="text-primary shrink-0">•</span><span>{inlineMd(item)}</span></li>)}</ul>);
      continue;
    }
    if (line.match(/^\d+\. /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) { items.push(lines[i].replace(/^\d+\. /, "")); i++; }
      nodes.push(<ol key={`ol${i}`} className="space-y-1 my-2">{items.map((item, j) => <li key={j} className="flex gap-2"><span className="text-primary font-bold shrink-0 w-5">{j+1}.</span><span>{inlineMd(item)}</span></li>)}</ol>);
      continue;
    }
    nodes.push(<p key={i} className="mb-1 leading-relaxed">{inlineMd(line)}</p>);
    i++;
  }
  return nodes;
}

function inlineMd(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return <>{parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2,-2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={i}>{part.slice(1,-1)}</em>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={i} className="bg-muted px-1 rounded text-xs font-mono">{part.slice(1,-1)}</code>;
    return part;
  })}</>;
}

function LangSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useLanguage();
  const groups = Object.entries(SUPPORTED_LANGUAGES).reduce<Record<string, Array<[string, any]>>>((acc, [code, info]) => {
    const region = (info as any).region ?? "Other";
    if (!acc[region]) acc[region] = [];
    acc[region].push([code, info]);
    return acc;
  }, {});

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
      <select value={value} onChange={e => onChange(e.target.value)}
        className="text-sm bg-card border border-border rounded-md px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-w-[180px]">
        {Object.entries(groups).map(([region, langs]) => (
          <optgroup key={region} label={region}>
            {langs.map(([code, info]) => (
              <option key={code} value={code}>{info.nativeName} — {info.name}</option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

function Steps({ current }: { current: number }) {
  const { t } = useLanguage();
  const steps = [t.triage, t.analyzing.replace("…",""), "✓"];
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold border-2 transition-all ${
            i < current ? "bg-primary border-primary text-primary-foreground" :
            i === current ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>
            {i < current ? <CheckCircle className="h-4 w-4" /> : i + 1}
          </div>
          <span className={`text-sm font-medium ${i === current ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
          {i < steps.length - 1 && <div className={`h-px w-8 ${i < current ? "bg-primary" : "bg-border"}`} />}
        </div>
      ))}
    </div>
  );
}

function Waveform({ stream }: { stream: MediaStream | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const ctxRef    = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (!stream) return;
    const ac = new AudioContext();
    const src = ac.createMediaStreamSource(stream);
    const analyser = ac.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    src.connect(analyser);
    ctxRef.current = ac;
    analyserRef.current = analyser;

    const canvas = canvasRef.current!;
    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      const buf = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(buf);
      const ctx2d = canvas.getContext("2d")!;
      const W = canvas.width; const H = canvas.height;
      ctx2d.clearRect(0, 0, W, H);
      const barW = (W / buf.length) * 2.2;
      let x = 0;
      for (let i = 0; i < buf.length; i++) {
        const barH = (buf[i] / 255) * H * 0.9;
        // Gradient bar: bright at top, dimmer at base
        const grad = ctx2d.createLinearGradient(0, H - barH, 0, H);
        grad.addColorStop(0, "rgba(99,102,241,0.95)");
        grad.addColorStop(1, "rgba(99,102,241,0.25)");
        ctx2d.fillStyle = grad;
        ctx2d.beginPath();
        ctx2d.roundRect(x, H - barH, barW - 1, barH, 2);
        ctx2d.fill();
        x += barW + 1;
      }
    };
    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      ac.close();
    };
  }, [stream]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={56}
      className="w-full rounded-lg bg-black/20"
    />
  );
}

function InputPanel({ onSubmit }: { onSubmit: (audio: File | null, image: File | null, text: string, name: string, location: string, notes: string) => void }) {
  const { t } = useLanguage();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [patientName, setPatientName] = useState("");
  const [patientLocation, setPatientLocation] = useState("");
  const [patientNotes, setPatientNotes] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [textInput, setTextInput] = useState("");
  const [recording, setRecording] = useState(false);
  const [recDuration, setRecDuration] = useState(0);
  const [inputMode, setInputMode] = useState<"audio" | "text">("audio");
  const [liveStream, setLiveStream] = useState<MediaStream | null>(null);
  const mediaRef  = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const setAudio = (f: File, url: string) => { setAudioFile(f); setAudioUrl(url); };
  const setImage = (f: File) => { setImageFile(f); setImageUrl(URL.createObjectURL(f)); };
  const clearAudio = () => {
    setAudioFile(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl("");
  };
  const clearImage = () => { setImageFile(null); setImageUrl(""); };

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setLiveStream(stream);
      setRecDuration(0);

      // Use the browser's native mimeType — NOT hardcoded audio/wav
      // Chrome records webm/opus, Safari records mp4/aac. ffmpeg handles both.
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const mr = new MediaRecorder(stream, { mimeType });
      mediaRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        setLiveStream(null);
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        // Use real mimeType so browser can play it back
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const ext  = mimeType.includes("mp4") ? "mp4" : "webm";
        const url  = URL.createObjectURL(blob);
        const file = new File([blob], `recording.${ext}`, { type: mimeType });
        setAudio(file, url);
        // Server receives the raw webm/mp4 and ffmpeg converts it to WAV
      };
      mr.start(100); // 100ms chunks for smooth waveform
      setRecording(true);
      timerRef.current = setInterval(() => setRecDuration(d => d + 1), 1000);
    } catch { alert("Microphone access denied — check browser permissions."); }
  };

  const stopRec = () => {
    mediaRef.current?.stop();
    setRecording(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const canSubmit = !!audioFile || textInput.trim().length > 5 || !!imageFile;
  const fmtDuration = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  return (
    <div className="space-y-5">
      <div className="flex rounded-lg border border-border overflow-hidden w-fit">
        <button onClick={() => setInputMode("audio")} className={`px-4 py-2 text-sm font-medium transition-colors ${inputMode==="audio" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}>🎙 {t.patientAudio}</button>
        <button onClick={() => setInputMode("text")}  className={`px-4 py-2 text-sm font-medium transition-colors ${inputMode==="text"  ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}>✏️ {t.typeSymptoms}</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-5 border-border bg-card">
          {inputMode === "audio" ? (
            <div className="space-y-4">
              <div><h3 className="font-semibold">{t.patientAudio}</h3><p className="text-xs text-muted-foreground mt-0.5">{t.audioSubtitle}</p></div>
              {!audioFile ? (
                <div className="space-y-3">
                  <div onClick={() => document.getElementById("audio-upload")?.click()} className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
                    <Upload className="h-7 w-7 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-muted-foreground">{t.uploadAudio}</p>
                  </div>
                  <input id="audio-upload" type="file" accept="audio/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setAudio(f, URL.createObjectURL(f)); } e.target.value = ""; }} />

                  {/* Live waveform — shown while recording */}
                  {recording && (
                    <div className="space-y-2">
                      <Waveform stream={liveStream} />
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2 text-destructive text-sm">
                          <span className="h-2 w-2 rounded-full bg-destructive animate-pulse"/>
                          Recording
                        </div>
                        <span className="text-sm font-mono text-muted-foreground">{fmtDuration(recDuration)}</span>
                      </div>
                    </div>
                  )}

                  <Button onClick={recording ? stopRec : startRec} variant={recording ? "destructive" : "outline"} className="w-full">
                    {recording ? <><MicOff className="h-4 w-4 mr-2"/>{t.stopRecording}</> : <><Mic className="h-4 w-4 mr-2"/>{t.recordAudio}</>}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                    <p className="text-sm font-medium truncate">{audioFile.name}</p>
                    <audio src={audioUrl} controls className="w-full h-9"/>
                    <p className="text-xs text-muted-foreground">Format: {audioFile.type} · {(audioFile.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <Button onClick={clearAudio} variant="outline" size="sm" className="w-full"><X className="h-3 w-3 mr-1"/>{t.clearAudio}</Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div><h3 className="font-semibold">Symptom Description</h3><p className="text-xs text-muted-foreground mt-0.5">Type in any language — Gemma 4 understands 35+ languages</p></div>
              <textarea value={textInput} onChange={e => setTextInput(e.target.value)}
                placeholder={"Describe symptoms in any language…\n\nHindi: मरीज को बुखार है और सिर दर्द है।\nSwahili: Mgonjwa ana homa na maumivu ya kichwa.\nEnglish: Patient has fever of 39°C and fatigue."}
                className="w-full h-44 text-sm bg-muted/20 border border-border rounded-lg p-3 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"/>
            </div>
          )}
        </Card>

        <Card className="p-5 border-border bg-card">
          <div className="space-y-4">
            <div><h3 className="font-semibold">{t.photo} <span className="text-muted-foreground font-normal text-sm">({t.optional})</span></h3><p className="text-xs text-muted-foreground mt-0.5">Medication label or wound photo — Gemma 4 Vision</p></div>
            {!imageFile ? (
              <div className="space-y-2">
                <div onClick={() => document.getElementById("image-upload")?.click()} className="border-2 border-dashed border-border rounded-lg p-5 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-1">
                  <Upload className="h-6 w-6 text-muted-foreground"/><p className="text-sm text-muted-foreground">{t.uploadPhoto}</p>
                  <p className="text-xs text-muted-foreground/60">Select from gallery</p>
                </div>
                <div onClick={() => setShowCamera(true)} className="border-2 border-dashed border-primary/40 rounded-lg p-5 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-1">
                  <Camera className="h-6 w-6 text-primary/60"/><p className="text-sm text-primary/80 font-medium">Take Photo</p>
                  <p className="text-xs text-muted-foreground/60">Opens camera — requests permission</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-muted/30 rounded-lg p-2 overflow-hidden">
                  <img src={imageUrl} alt="Preview" className="w-full h-36 object-cover rounded"/>
                  <p className="text-xs text-muted-foreground mt-1 truncate px-1">{imageFile.name}</p>
                </div>
                <Button onClick={clearImage} variant="outline" size="sm" className="w-full"><X className="h-3 w-3 mr-1"/>Clear Image</Button>
              </div>
            )}
            <input id="image-upload"  type="file" accept="image/*"                     className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setImage(f); e.target.value = ""; }}/>
            {/* image-capture kept as mobile fallback */}
            <input id="image-capture" type="file" accept="image/*" capture="environment" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setImage(f); e.target.value = ""; }}/>
            {showCamera && <CameraModal onCapture={f => { setImage(f); setShowCamera(false); }} onClose={() => setShowCamera(false)}/>}
          </div>
        </Card>
      </div>

      {/* Patient details */}
      <Card className="p-4 border-border bg-card">
        <h3 className="font-semibold text-sm mb-3">{t.patientDetails} <span className="text-muted-foreground font-normal">({t.optional})</span></h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{t.patientName}</label>
            <input value={patientName} onChange={e => setPatientName(e.target.value)}
              placeholder={t.patientName}
              className="w-full mt-1 bg-muted/20 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"/>
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{t.location}</label>
            <input value={patientLocation} onChange={e => setPatientLocation(e.target.value)}
              placeholder={t.locationPlaceholder}
              className="w-full mt-1 bg-muted/20 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"/>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{t.clinicalNotes}</label>
            <textarea value={patientNotes} onChange={e => setPatientNotes(e.target.value)}
              placeholder={t.clinicalNotes}
              className="w-full mt-1 bg-muted/20 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none h-16"/>
          </div>
        </div>
      </Card>

      <div className="flex gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-300">
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0"/>{t.allProcessingLocal}
      </div>
      <Button onClick={() => onSubmit(audioFile, imageFile, textInput, patientName, patientLocation, patientNotes)} disabled={!canSubmit} className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90">
        {t.startTriageAnalysis}
      </Button>
    </div>
  );
}

function AnalyzingPanel({ hasAudio, hasImage, hasText, uiLang, jobId }: {
  hasAudio: boolean; hasImage: boolean; hasText: boolean; uiLang: string; jobId: string;
}) {
  const clinicianLangInfo = (SUPPORTED_LANGUAGES as any)[uiLang];
  const clinicianLangName = clinicianLangInfo ? `${clinicianLangInfo.nativeName} (${clinicianLangInfo.name})` : uiLang || "English";
  const [detectedPatientLang, setDetectedPatientLang] = useState<string | null>(null);

  type StepDef = { id: string; label: string; sub: string; tech: string };
  const allSteps: StepDef[] = [
    ...(hasAudio ? [{ id:"audio",   label:"Transcribing audio",           sub:`ffmpeg → 16kHz WAV → Gemma 4 native audio encoder · detecting patient language`, tech:"ffmpeg · Gemma 4" }] : []),
    ...(hasImage ? [{ id:"image",   label:"Analysing image",              sub:"Gemma 4 vision — medication labels, wounds, clinical detail",                      tech:"Gemma 4 Vision" }] : []),
    ...(hasAudio && hasImage ? [{ id:"synthesis", label:"Weighing audio vs image", sub:"Cross-referencing both inputs, surfacing contradictions",                 tech:"Gemma 4" }] : []),
    { id:"extraction",   label:"Extracting clinical data",        sub:`Complaint · symptoms · urgency · medications · ${detectedPatientLang ? `patient language: ${detectedPatientLang}` : "language detection"}`, tech:"Gemma 4 · tRPC" },
    { id:"safety",       label:"Medication safety check",         sub:"4 sequential calls — name · category · route · semantic — RAM-friendly for low-resource devices", tech:"Gemma 4 ×4" },
    { id:"instructions", label:"Generating patient instructions", sub:`Clinician: ${clinicianLangName} · Patient: ${detectedPatientLang ?? "detected language"}`, tech:"Gemma 4 multilingual" },
    { id:"save",         label:"Saving triage record",            sub:"Persisting to local SQLite · writing session history",                                     tech:"SQLite · Drizzle ORM" },
  ];

  // ── Real server polling ──────────────────────────────────────────────────
  const MIN_STEP_MS = 450;
  const [activeIdx, setActiveIdx]   = useState(0);
  const [stepQueue, setStepQueue]   = useState<number[]>([]);
  const [elapsedMs, setElapsedMs]   = useState(0);

  // Refs so interval callbacks always see current values (no stale closure)
  const activeIdxRef       = useRef(0);
  const stepQueueRef       = useRef<number[]>([]);
  const lastEnqueuedRef    = useRef(-1);
  const pollRef            = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepTimerRef       = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Elapsed clock — display only, not used for step progression
  useEffect(() => {
    const iv = setInterval(() => setElapsedMs(e => e + 500), 500);
    return () => clearInterval(iv);
  }, []);

  // Map server step id → index in allSteps (-1 = skip/not visible)
  const serverIdToIdx = (serverId: string): number => {
    const map: Record<string, string> = {
      audio: "audio", langdetect: "audio",
      image: "image", synthesis: "synthesis",
      extraction: "extraction", safety: "safety",
      instructions: "instructions", save: "save",
    };
    const panelId = map[serverId];
    if (!panelId) return -1;
    return allSteps.findIndex(s => s.id === panelId);
  };

  // Queue processor: show each step for MIN_STEP_MS before advancing
  useEffect(() => {
    if (stepQueue.length === 0) return;
    const t = setTimeout(() => {
      const next      = stepQueue[0];
      const remaining = stepQueue.slice(1);
      activeIdxRef.current  = next;
      stepQueueRef.current  = remaining;
      setActiveIdx(next);
      setStepQueue(remaining);
      // Reveal patient language once audio step passes
      const audioIdx = allSteps.findIndex(s => s.id === "audio");
      if (audioIdx >= 0 && next > audioIdx && !detectedPatientLang) {
        setDetectedPatientLang("detected from audio");
      }
    }, MIN_STEP_MS);
    stepTimerRef.current = t;
    return () => clearTimeout(t);
  }, [stepQueue]);

  // Poll /api/triage/status/:jobId every 100ms
  useEffect(() => {
    if (!jobId) return;
    pollRef.current = setInterval(async () => {
      try {
        const r    = await fetch(`/api/triage/status/${jobId}`);
        const data = await r.json() as { step: string };
        const s    = data.step;
        if (!s || s === "waiting" || s === "done") return;

        const newIdx = serverIdToIdx(s);
        if (newIdx < 0 || newIdx <= lastEnqueuedRef.current) return;

        // Enqueue all steps from (lastEnqueued+1) to newIdx that are past activeIdx
        const toAdd: number[] = [];
        for (let i = lastEnqueuedRef.current + 1; i <= newIdx; i++) {
          if (i > activeIdxRef.current) toAdd.push(i);
        }
        lastEnqueuedRef.current = newIdx;
        if (toAdd.length > 0) {
          stepQueueRef.current = [...stepQueueRef.current, ...toAdd];
          setStepQueue(q => [...q, ...toAdd]);
        }
      } catch { /* server busy, retry */ }
    }, 100);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [jobId]);

  const pct    = Math.min(99, Math.round(((activeIdx + 0.5) / allSteps.length) * 100));
  const secs   = Math.floor(elapsedMs / 1000);
  const active = allSteps[Math.min(activeIdx, allSteps.length - 1)];

  return (
    <Card className="p-6 border-border bg-card space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 shrink-0">
          <div className="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin absolute"/>
          <span className="text-lg relative">🦙</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Gemma 4 E4B analysing</p>
          <p className="text-xs text-muted-foreground">100% local via Ollama · {secs}s elapsed</p>
        </div>
        <span className="text-sm font-mono font-bold text-primary shrink-0">{pct}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{width:`${pct}%`}}/>
      </div>

      {/* Language status */}
      <div className="flex gap-3 text-xs rounded-lg bg-muted/30 px-3 py-2">
        <span className="text-muted-foreground shrink-0">🌐 Languages:</span>
        <span className="font-medium text-foreground/80 shrink-0">
          Clinician → <span className="text-primary">{clinicianLangName}</span>
        </span>
        <span className="text-muted-foreground/40 shrink-0">·</span>
        <span className="font-medium text-foreground/80">
          Patient → {detectedPatientLang
            ? <span className="text-primary">{detectedPatientLang}</span>
            : hasAudio
              ? <span className="text-muted-foreground italic animate-pulse">detecting from audio…</span>
              : <span className="text-muted-foreground italic">same as clinician</span>
          }
        </span>
      </div>

      {/* Step checklist */}
      <div className="space-y-1">
        {allSteps.map((s, i) => {
          const done   = i < activeIdx;
          const active = i === activeIdx;
          return (
            <div key={s.id} className={`flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${active ? "bg-primary/8 border border-primary/20" : done ? "opacity-55" : "opacity-25"}`}>
              <div className={`mt-0.5 shrink-0 text-sm ${done ? "text-green-500" : active ? "text-primary" : "text-muted-foreground"}`}>
                {done ? "✓" : active ? <span className="inline-block animate-spin">◌</span> : "○"}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium leading-tight ${active ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</p>
                {active && <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{s.sub}</p>}
              </div>
              <span className={`text-xs shrink-0 mt-0.5 font-mono ${active ? "text-primary/70" : "text-muted-foreground/40"}`}>{s.tech}</span>
            </div>
          );
        })}
      </div>

      {/* Active step callout */}
      <div className="rounded-lg bg-muted/40 px-4 py-3 space-y-1">
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">currently running</p>
        <p className="text-sm font-medium text-foreground">{active?.label}</p>
        <p className="text-xs text-muted-foreground">{active?.sub}</p>
        <p className="text-xs font-mono text-primary/60 mt-1">{active?.tech}</p>
      </div>

      <p className="text-xs text-center text-muted-foreground">Each Gemma call takes 10–30s on CPU · do not close this tab</p>
    </Card>
  );
}




// ── Camera modal — uses getUserMedia for real camera access on desktop + mobile ──
function CameraModal({ onCapture, onClose }: { onCapture: (file: File) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);

  useEffect(() => {
    let s: MediaStream;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then(mediaStream => {
        s = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      })
      .catch(err => {
        setError("Camera access denied or unavailable. Please upload a photo instead.");
        console.error("Camera error:", err);
      });
    return () => { if (s) s.getTracks().forEach(t => t.stop()); };
  }, []);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCaptured(dataUrl);
    if (stream) stream.getTracks().forEach(t => t.stop());
  };

  const handleUse = () => {
    if (!captured) return;
    // Convert base64 data URL directly to File without fetch (avoids browser security block)
    const byteString = atob(captured.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    const blob = new Blob([ab], { type: "image/jpeg" });
    const file = new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" });
    onCapture(file);
    onClose();
  };

  const handleRetake = () => {
    setCaptured(null);
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then(mediaStream => {
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-lg space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Camera className="h-4 w-4 text-primary"/>Take Photo
          </h3>
          <button onClick={() => { if (stream) stream.getTracks().forEach(t => t.stop()); onClose(); }}
            className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5"/></button>
        </div>

        {error ? (
          <div className="text-center py-8 space-y-2">
            <p className="text-sm text-red-400">{error}</p>
            <Button onClick={onClose} variant="outline" size="sm">Close</Button>
          </div>
        ) : captured ? (
          <div className="space-y-3">
            <img src={captured} alt="Captured" className="w-full rounded-lg border border-border"/>
            <div className="flex gap-2">
              <Button onClick={handleRetake} variant="outline" className="flex-1">Retake</Button>
              <Button onClick={handleUse} className="flex-1 bg-primary hover:bg-primary/90">
                <CheckCircle className="h-4 w-4 mr-2"/>Use This Photo
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <video ref={videoRef} className="w-full rounded-lg border border-border bg-black" playsInline muted/>
            <canvas ref={canvasRef} className="hidden"/>
            <p className="text-xs text-muted-foreground text-center">
              Point camera at medication label or wound, then tap capture
            </p>
            <Button onClick={handleCapture} className="w-full bg-primary hover:bg-primary/90">
              <Camera className="h-4 w-4 mr-2"/>Capture Photo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Bilingual transcript card ─────────────────────────────────────────────────
function TranscriptCard({ transcript, patientLang, detectedLangName }: {
  transcript: string; patientLang: string; detectedLangName: string;
}) {
  const [expanded, setExpanded]         = useState(false);
  const [translation, setTranslation]   = useState<string | null>(null);
  const [translating, setTranslating]   = useState(false);
  const isEnglish = !patientLang || patientLang === "en";

  const handleExpand = async () => {
    setExpanded(v => !v);
    // Auto-translate to English if patient language is not English
    if (!expanded && !isEnglish && !translation) {
      setTranslating(true);
      try {
        const res = await fetch("/api/trpc/triage.translateClinicalRecord", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ json: {
            chiefComplaint: transcript,
            symptoms: [],
            recommendedAction: "",
            targetLanguage: "English",
          }}),
        });
        if (res.ok) {
          const data = await res.json();
          const tr = data?.result?.data?.json;
          if (tr?.chiefComplaint) setTranslation(tr.chiefComplaint);
        }
      } catch { /* non-fatal */ }
      finally { setTranslating(false); }
    }
  };

  return (
    <Card className="p-4 border-border bg-card">
      <button
        onClick={handleExpand}
        className="w-full flex items-center justify-between text-left"
      >
        <div>
          <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">What the patient said</p>
          {!expanded && <p className="text-sm text-foreground/70 mt-0.5 truncate">{transcript.slice(0, 80)}…</p>}
        </div>
        <span className="text-xs text-primary ml-2 shrink-0">{expanded ? "Hide ▲" : "Show ▼"}</span>
      </button>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-border space-y-3">
          {/* Original in patient language */}
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
              {detectedLangName} (original)
            </p>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{transcript}</p>
          </div>
          {/* English translation if patient speaks another language */}
          {!isEnglish && (
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                English (translation)
              </p>
              {translating ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin"/>Translating…
                </div>
              ) : translation ? (
                <p className="text-sm text-foreground/80 leading-relaxed italic">{translation}</p>
              ) : (
                <p className="text-xs text-muted-foreground/60">Translation unavailable</p>
              )}
            </div>
          )}
          <p className="text-xs text-muted-foreground/60">Transcribed by Gemma 4 E4B — {detectedLangName}</p>
        </div>
      )}
    </Card>
  );
}

function ResultPanel({ result, onReset, audioUrl, imageUrl }: { result: any; onReset: () => void; audioUrl?: string; imageUrl?: string }) {
  const { uiLang, t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [displayLang, setDisplayLang] = useState<string>(
    (SUPPORTED_LANGUAGES as any)[uiLang] ? uiLang : ((SUPPORTED_LANGUAGES as any)[result.patientLanguage] ? result.patientLanguage : "en")
  );
  const [instructions, setInstructions] = useState<string>(result.patientInstructions || "");
  const [translatedRecord, setTranslatedRecord] = useState<{chiefComplaint:string;symptoms:string[];recommendedAction:string}|null>(null);
  const [recordTranslating, setRecordTranslating] = useState(false);
  const [warningEn] = useState<string | null>(result.verificationWarning ?? null);
  const [warningForClinician, setWarningForClinician] = useState<string | null>(result.verificationWarningForClinician ?? null);
  const [warningForPatient, setWarningForPatient] = useState<string | null>(result.verificationWarningForPatient ?? null);
  const [translating, setTranslating] = useState(false);
  const [clinicianNotes, setClinicianNotes] = useState<string>(result.patientNotes || "");
  const [transcriptExpanded, setTranscriptExpanded] = useState(false);
  const translateMut = trpc.triage.translateInstructions.useMutation();
  const translateRecordMut = trpc.triage.translateClinicalRecord.useMutation();
  const u = URGENCY[result.urgencyLevel] || URGENCY[3];

  const doTranslate = async (lang: string) => {
    if (lang === "en") {
      setInstructions(result.patientInstructions || "");
      setTranslatedRecord(null);
      return;
    }
    setTranslating(true);
    setRecordTranslating(true);
    try {
      const langInfo = (SUPPORTED_LANGUAGES as any)[lang];
      const langName = langInfo ? `${langInfo.name} (${langInfo.nativeName})` : lang;
      const res = await translateMut.mutateAsync({ recordId: result.id, targetLanguage: langName });
      setInstructions(res.instructions);
      if ((res as any).warningForClinician) setWarningForClinician((res as any).warningForClinician);
      if ((res as any).warningForPatient) setWarningForPatient((res as any).warningForPatient);
      // Translate clinical record fields via tRPC
      const tr = await translateRecordMut.mutateAsync({
        chiefComplaint: result.chiefComplaint,
        symptoms: result.symptomList || [],
        recommendedAction: result.recommendedAction,
        targetLanguage: langName,
      });
      if (tr) setTranslatedRecord(tr);
    } catch (e) { console.error("Translation failed", e); }
    finally { setTranslating(false); setRecordTranslating(false); }
  };

  const handleLangChange = (lang: string) => {
    if (lang === displayLang) return;
    setDisplayLang(lang);
    doTranslate(lang);
  };

  const prevUiLang = useRef(uiLang);
  useEffect(() => {
    if (prevUiLang.current === uiLang) return;
    prevUiLang.current = uiLang;
    const newLang = (SUPPORTED_LANGUAGES as any)[uiLang] ? uiLang : "en";
    setDisplayLang(newLang);
    doTranslate(newLang);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiLang]);

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify({
      chief_complaint: result.chiefComplaint, symptom_list: result.symptomList,
      urgency_level: result.urgencyLevel, medication_found: result.medicationFound,
      recommended_action: result.recommendedAction, patient_language: result.patientLanguage,
      confidence: result.confidence, patient_instructions: instructions,
      clinician_notes: clinicianNotes || undefined,
      audio_transcript: result.audioTranscript || undefined,
    }, null, 2));
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const exportTxt = () => {
    const langInfo = (SUPPORTED_LANGUAGES as any)[displayLang];
    const rec = translatedRecord;
    const content = [
      "=== GEMMACARE TRIAGE RECORD ===",
      `Date: ${new Date(result.createdAt).toLocaleString()}`,
      result.patientName     ? `Patient: ${result.patientName}`      : null,
      result.patientLocation ? `Location: ${result.patientLocation}` : null,
      clinicianNotes         ? `Clinician Notes: ${clinicianNotes}`  : null,
      `Chief Complaint: ${rec?.chiefComplaint || result.chiefComplaint}`,
      `Symptoms: ${(rec?.symptoms || result.symptomList||[]).join(", ")}`,
      `Urgency: ${result.urgencyLevel}/5 — ${u.label}`,
      `Medication: ${result.medicationFound || "None"}`,
      `Recommended Action: ${rec?.recommendedAction || result.recommendedAction}`,
      `Language: ${result.patientLanguage}`, `Confidence: ${result.confidence}%`,
      result.audioTranscript ? `\n=== PATIENT TRANSCRIPT ===\n${result.audioTranscript}` : null,
      `\n=== PATIENT INSTRUCTIONS (${langInfo?.name || displayLang}) ===`, instructions,
    ].filter(Boolean).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
    a.download = `triage-${result.id}-${displayLang}.txt`; a.click();
  };

  const uiLangInfo       = (SUPPORTED_LANGUAGES as any)[displayLang];
  const detectedLangInfo = (SUPPORTED_LANGUAGES as any)[result.patientLanguage];
  const displayComplaint        = translatedRecord?.chiefComplaint     || result.chiefComplaint;
  const displaySymptoms         = translatedRecord?.symptoms           || result.symptomList || [];
  const displayRecommendedAction = translatedRecord?.recommendedAction || result.recommendedAction;

  return (
    <div className="space-y-5">
      {/* Mismatch warning */}
      {!result.audioImageMatch && (
        <div className="flex gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5"/>
          <div className="text-sm text-red-300"><strong>Medication Mismatch:</strong> Audio and image show different medications. Verify with patient before proceeding.</div>
        </div>
      )}

      {/* Bilingual medication warning */}
      {warningEn && result.audioImageMatch && (() => {
        const clinicianLangInfo = (SUPPORTED_LANGUAGES as any)[displayLang];
        const patientLangInfo = (SUPPORTED_LANGUAGES as any)[result.patientLanguage];
        const clinicianIsEnglish = !displayLang || displayLang === "en";
        const patientIsEnglish = !result.patientLanguage || result.patientLanguage === "en";
        const twoLanguages = displayLang !== result.patientLanguage;
        const clinicianText = clinicianIsEnglish ? warningEn : (warningForClinician || warningEn);
        const patientText = patientIsEnglish ? warningEn : (warningForPatient || warningEn);
        return (
          <div className="flex gap-3 p-4 rounded-lg bg-orange-500/10 border border-orange-500/40">
            <AlertTriangle className="h-6 w-6 text-orange-400 shrink-0 mt-0.5"/>
            <div className="space-y-3 w-full">
              <div>
                <p className="text-[10px] font-bold text-orange-400/70 uppercase tracking-wider mb-1">⚠️ {clinicianLangInfo?.nativeName || "English"} ({t.clinician})</p>
                <p className="text-sm text-orange-200 font-medium">{clinicianText}</p>
              </div>
              {twoLanguages && (
                <div className="pt-2 border-t border-orange-500/20">
                  <p className="text-[10px] font-bold text-orange-400/70 uppercase tracking-wider mb-1">⚠️ {patientLangInfo?.nativeName || result.patientLanguage} ({t.patient})</p>
                  {translating ? <div className="flex items-center gap-2 text-xs text-orange-300/60"><Loader2 className="h-3 w-3 animate-spin"/>Translating…</div>
                    : <p className="text-sm text-orange-200 font-medium">{patientText}</p>}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Patient banner */}
      {(result.patientName || result.patientLocation) && (
        <div className="flex gap-3 p-3 rounded-lg bg-muted/20 border border-border text-sm">
          <div className="space-y-0.5">
            {result.patientName     && <p><span className="text-muted-foreground text-xs uppercase font-semibold tracking-wide">Patient: </span><strong>{result.patientName}</strong></p>}
            {result.patientLocation && <p><span className="text-muted-foreground text-xs uppercase font-semibold tracking-wide">Location: </span>{result.patientLocation}</p>}
          </div>
        </div>
      )}

      {/* Clinician notes — editable after result */}
      <Card className="p-4 border-border bg-card">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">Clinician Notes</p>
          <span className="text-xs text-muted-foreground">Optional — saved with export</span>
        </div>
        <textarea
          value={clinicianNotes}
          onChange={e => setClinicianNotes(e.target.value)}
          placeholder="Add clinical observations, follow-up instructions, or referral notes…"
          className="w-full bg-muted/20 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary h-20"
        />
      </Card>

      {/* Patient transcript — collapsible, bilingual */}
      {result.audioTranscript && (
        <TranscriptCard transcript={result.audioTranscript} patientLang={result.patientLanguage} detectedLangName={detectedLangInfo?.name || result.patientLanguage} />
      )}

      {/* Media previews */}
      {(audioUrl || imageUrl) && (
        <div className="flex gap-3 flex-wrap">
          {audioUrl && <div className="flex-1 min-w-48"><p className="text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wide">Audio Submitted</p><audio src={audioUrl} controls className="w-full h-9 rounded"/></div>}
          {imageUrl && <div className="shrink-0"><p className="text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wide">Image Submitted</p><img src={imageUrl} alt="Submitted" className="h-20 w-32 object-cover rounded border border-border"/></div>}
        </div>
      )}

      {/* Language selector — controls BOTH panels */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-1">
        <p className="text-xs text-muted-foreground">Translate clinical record + instructions to:</p>
        <LangSelect value={displayLang} onChange={handleLangChange}/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Clinical Record — translatable */}
        <Card className="p-5 border-border bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{t.clinicalRecord}</h3>
            <Button onClick={copyJSON} variant="outline" size="sm">{copied ? <><CheckCircle className="h-3 w-3 mr-1 text-green-400"/>Copied</> : <><Copy className="h-3 w-3 mr-1"/>Copy JSON</>}</Button>
          </div>
          {recordTranslating ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2"><Loader2 className="h-4 w-4 animate-spin"/>Translating record…</div>
          ) : (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-1">{t.chiefComplaint}</p>
                <p>{displayComplaint}</p>
              </div>
              {displaySymptoms.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-1">{t.symptoms}</p>
                  <ul className="space-y-0.5">{displaySymptoms.map((s: string, i: number) => <li key={i} className="flex items-start gap-1.5"><span className="text-primary mt-0.5">•</span>{s}</li>)}</ul>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-1">{t.urgency}</p>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${u.bg} ${u.text} ${u.border}`}>{result.urgencyLevel}/5 — {u.label}</span>
              </div>
              {result.medicationFound && <div><p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-1">{t.medication}</p><p className="font-medium">{result.medicationFound}</p></div>}
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-1">{t.recommendedAction}</p>
                <p>{displayRecommendedAction}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-1">{t.confidence}</p>
                <div className="flex items-center gap-2"><div className="flex-1 bg-muted/30 rounded-full h-2 overflow-hidden"><div className="bg-primary h-full" style={{width:`${result.confidence}%`}}/></div><span className="text-xs font-bold">{result.confidence}%</span></div>
              </div>
              <div><p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-1">{t.detectedLanguage}</p><p className="font-medium">{detectedLangInfo?.name || result.patientLanguage}</p></div>
            </div>
          )}
        </Card>

        {/* Patient Instructions */}
        <Card className="p-5 border-border bg-card space-y-4">
          <h3 className="font-semibold">{t.patientInstructions}</h3>
          {translating ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4"><Loader2 className="h-4 w-4 animate-spin"/>Translating with Gemma 4…</div>
          ) : (
            <div className="text-sm text-foreground leading-relaxed overflow-y-auto max-h-80">{renderMarkdown(instructions)}</div>
          )}
          <p className="text-xs text-muted-foreground">Auto-generated by Gemma 4 · change language above to re-translate both panels</p>
        </Card>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Button onClick={onReset} variant="outline" className="flex-1 min-w-32"><RotateCcw className="h-4 w-4 mr-2"/>{t.newTriage}</Button>
        <Button onClick={exportTxt} variant="outline" className="flex-1 min-w-32"><Download className="h-4 w-4 mr-2"/>Export ({uiLangInfo?.name || displayLang})</Button>
      </div>
    </div>
  );
}


function MismatchModal({ data, onProceed, onCancel, loading }: { data: any; onProceed: () => void; onCancel: () => void; loading: boolean }) {
  const langName = (SUPPORTED_LANGUAGES as any)[data.patientLanguage]?.name || data.patientLanguage || "";
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border-red-500/40 bg-card p-6 space-y-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-red-400 shrink-0 mt-0.5"/>
          <div>
            <h2 className="text-lg font-bold text-red-400">⚠️ Medication Mismatch</h2>
            <p className="text-sm text-muted-foreground mt-1">Audio and image report different medications. Verify before proceeding.</p>
          </div>
        </div>
        <div className="bg-muted/20 rounded-lg p-4 space-y-3 text-sm">
          <div><p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">Audio mentions</p><p className="text-base font-semibold mt-0.5">{data.audioMedication}</p></div>
          <div className="border-t border-border pt-3"><p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">Image shows</p><p className="text-base font-semibold mt-0.5">{data.imageMedication}</p></div>
          {data.imageUrl && <img src={data.imageUrl} alt="Submitted" className="w-full h-32 object-cover rounded border border-border"/>}
          {/* Safety conflict details */}
          {data.conflicts?.length > 0 && (
            <div className="border-t border-border pt-3 space-y-1">
              <p className="text-xs text-red-400 uppercase font-semibold tracking-wide">Safety conflicts detected</p>
              {data.conflicts.map((c: any, i: number) => (
                <p key={i} className="text-xs text-red-300"><strong className="uppercase">{c.layer?.replace(/_/g," ")}:</strong> {c.description}</p>
              ))}
            </div>
          )}
          {/* Bilingual warning */}
          {data.clinicianSummary && (
            <div className="border-t border-border pt-3 space-y-2">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-0.5">⚕ Clinician note</p>
                <p className="text-xs text-foreground/80 italic">{data.clinicianSummary}</p>
              </div>
              {data.patientSummary && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-0.5">⚕ Patient note ({langName})</p>
                  <p className="text-xs text-foreground/80 italic">{data.patientSummary}</p>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <Button onClick={onCancel} variant="outline" className="flex-1" disabled={loading}>Cancel & Verify</Button>
          <Button onClick={onProceed} className="flex-1 bg-red-500 hover:bg-red-600 text-white" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-1 animate-spin"/>Processing…</> : "Proceed Anyway"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function Triage() {
  const [step, setStep] = useState(0);
  const [analyzingStep, setAnalyzingStep] = useState("");
  const [currentJobId, setCurrentJobId] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [mismatch, setMismatch] = useState<any>(null);
  const [pendingTranscript, setPending] = useState("");
  const [pendingImgDesc, setPendingImg] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [submittedAudioUrl, setSubmittedAudioUrl] = useState<string | undefined>();
  const [submittedImageUrl, setSubmittedImageUrl] = useState<string | undefined>();

  const processTriage   = trpc.triage.processTriage.useMutation();
  const proceedMismatch = trpc.triage.proceedWithConflicts.useMutation();
  const ollamaStatus    = trpc.triage.checkOllama.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const { uiLang, t } = useLanguage();

  const handleSubmit = async (audioFile: File | null, imageFile: File | null, textInput: string, patientName = "", patientLocation = "", patientNotes = "") => {
    setError(null);
    const jobId = Math.random().toString(36).slice(2, 10);
    setCurrentJobId(jobId);
    setStep(1);
    setSubmittedAudioUrl(audioFile ? URL.createObjectURL(audioFile) : undefined);
    setSubmittedImageUrl(imageFile ? URL.createObjectURL(imageFile) : undefined);

    try {
      const audioBase64 = audioFile ? await fileToBase64(audioFile) : undefined;
      const imageBase64 = imageFile ? await fileToBase64(imageFile) : undefined;

      const payload: any = { jobId, audioMimeType: audioFile?.type ?? "audio/wav" };
      if (audioBase64) payload.audioBase64 = audioBase64;
      if (imageBase64) { payload.imageBase64 = imageBase64; payload.imageMimeType = imageFile?.type; }
      if (!audioFile && textInput.trim()) payload.audioTranscript = textInput.trim();
      if (!payload.audioBase64 && !payload.audioTranscript) {
        if (imageBase64) payload.audioTranscript = "Please analyze the image provided. Identify any medications, wounds, or clinically relevant information.";
        else throw new Error("Please provide audio, type symptoms, or upload an image.");
      }

      payload.uiLanguage = uiLang;
      const res = await processTriage.mutateAsync(payload);
      if (res.success) {
        // Save patient details locally keyed by record ID
        if (patientName || patientLocation || patientNotes) {
          const details = { patientName, patientLocation, patientNotes, recordId: res.triageRecord.id };
          const existing = JSON.parse(localStorage.getItem("gemmacare_patient_details") || "[]");
          existing.unshift(details);
          localStorage.setItem("gemmacare_patient_details", JSON.stringify(existing.slice(0, 100)));
        }
        setResult({ ...res.triageRecord, patientName, patientLocation, patientNotes });
        setStep(2);
      }
      else if (res.error === "medication_safety_critical") {
        setPending(res.transcript ?? textInput);
        setPendingImg(res.imageDescription);
        setMismatch({ ...res, imageUrl: submittedImageUrl });
        setStep(0);
      }
    } catch (err: any) {
      setError(err?.message || "Analysis failed. Check Ollama is running with gemma4:e4b pulled.");
      setStep(0);
    }
  };

  const handleMismatchProceed = async () => {
    setMismatch(null); setStep(1); setAnalyzingStep("Proceeding with acknowledged mismatch…");
    try {
      const res = await proceedMismatch.mutateAsync({ audioTranscript: pendingTranscript, imageDescription: pendingImgDesc });
      if (res.success) {
        // Save patient details locally keyed by record ID
        if (patientName || patientLocation || patientNotes) {
          const details = { patientName, patientLocation, patientNotes, recordId: res.triageRecord.id };
          const existing = JSON.parse(localStorage.getItem("gemmacare_patient_details") || "[]");
          existing.unshift(details);
          localStorage.setItem("gemmacare_patient_details", JSON.stringify(existing.slice(0, 100)));
        }
        setResult({ ...res.triageRecord, patientName, patientLocation, patientNotes });
        setStep(2);
      }
    } catch (err: any) { setError(err?.message || "Failed."); setStep(0); }
  };

  const ollama = ollamaStatus.data;

  return (
    <div className="space-y-5 max-w-4xl">
      <div><h1 className="text-2xl font-bold">{t.triage}</h1><p className="text-muted-foreground text-sm mt-1">{t.patientAudio}.</p></div>

      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${
        ollamaStatus.isLoading ? "bg-muted/20 border-border text-muted-foreground" :
        ollama?.ok && ollama?.found ? "bg-green-500/10 border-green-500/30 text-green-400" :
        ollama?.ok ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
        {ollamaStatus.isLoading ? <Loader2 className="h-3 w-3 animate-spin"/> : ollama?.ok ? <Wifi className="h-3 w-3"/> : <WifiOff className="h-3 w-3"/>}
        {ollamaStatus.isLoading && "Checking Gemma 4 E4B…"}
        {ollama?.ok && ollama?.found && `✅ ${t.ollamaReady} (${ollama.model})`}
        {ollama?.ok && !ollama?.found && `⚠️ ${t.ollamaNotFound}`}
        {!ollamaStatus.isLoading && !ollama?.ok && t.ollamaOffline}
      </div>

      {error && <div className="flex gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm"><AlertCircle className="h-4 w-4 shrink-0 mt-0.5"/>{error}</div>}

      <Steps current={step}/>
      {step === 0 && <InputPanel onSubmit={handleSubmit}/>}
      {step === 1 && <AnalyzingPanel hasAudio={!!submittedAudioUrl} hasImage={!!submittedImageUrl} hasText={!submittedAudioUrl} uiLang={uiLang} jobId={currentJobId}/>}
      {step === 2 && result && <ResultPanel result={result} onReset={() => { setResult(null); setStep(0); }} audioUrl={submittedAudioUrl} imageUrl={submittedImageUrl}/>}
      {mismatch && <MismatchModal data={mismatch} onProceed={handleMismatchProceed} onCancel={() => setMismatch(null)} loading={proceedMismatch.isPending}/>}
    </div>
  );
}
