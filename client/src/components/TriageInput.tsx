import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, Camera, Loader2, Mic, Upload, X, Wifi, WifiOff } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result as string);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

// Pick the best MIME type Chrome/Firefox/Safari all support
function getBestAudioMimeType(): string {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/ogg",
    "audio/mp4",
  ];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
}

// ── Camera modal ──────────────────────────────────────────────────────────────
interface CameraModalProps {
  onCapture: (file: File) => void;
  onClose: () => void;
  strings: {
    takePhoto: string;
    capturePhoto: string;
    retakePhoto: string;
    useThisPhoto: string;
    cameraAccessDenied: string;
    pointAtLabel: string;
  };
}

function CameraModal({ onCapture, onClose, strings }: CameraModalProps) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream,   setStream]   = useState<MediaStream | null>(null);
  const [error,    setError]    = useState<string | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);

  useEffect(() => {
    let s: MediaStream;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then((ms) => {
        s = ms;
        setStream(ms);
        if (videoRef.current) {
          videoRef.current.srcObject = ms;
          videoRef.current.play();
        }
      })
      .catch(() => setError(strings.cameraAccessDenied));
    return () => { if (s) s.getTracks().forEach((t) => t.stop()); };
  }, [strings.cameraAccessDenied]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current, c = canvasRef.current;
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d")?.drawImage(v, 0, 0);
    setCaptured(c.toDataURL("image/jpeg", 0.92));
    if (stream) stream.getTracks().forEach((t) => t.stop());
  };

  const handleUse = () => {
    if (!captured) return;
    const byteString = atob(captured.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    const blob = new Blob([ab], { type: "image/jpeg" });
    onCapture(new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" }));
    onClose();
  };

  const handleRetake = () => {
    setCaptured(null);
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then((ms) => {
        setStream(ms);
        if (videoRef.current) { videoRef.current.srcObject = ms; videoRef.current.play(); }
      });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-lg space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Camera className="h-4 w-4 text-primary"/>{strings.takePhoto}
          </h3>
          <button onClick={() => { if (stream) stream.getTracks().forEach((t) => t.stop()); onClose(); }}>
            <X className="h-5 w-5 text-muted-foreground hover:text-foreground"/>
          </button>
        </div>
        {error ? (
          <div className="text-center py-8 space-y-3">
            <p className="text-sm text-red-400">{error}</p>
            <Button onClick={onClose} variant="outline" size="sm">✕</Button>
          </div>
        ) : captured ? (
          <div className="space-y-3">
            <img src={captured} alt="Captured" className="w-full rounded-lg border border-border"/>
            <div className="flex gap-2">
              <Button onClick={handleRetake} variant="outline" className="flex-1">{strings.retakePhoto}</Button>
              <Button onClick={handleUse} className="flex-1 bg-primary hover:bg-primary/90">
                ✓ {strings.useThisPhoto}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <video ref={videoRef} className="w-full rounded-lg border border-border bg-black" playsInline muted/>
            <canvas ref={canvasRef} className="hidden"/>
            <p className="text-xs text-muted-foreground text-center">{strings.pointAtLabel}</p>
            <Button onClick={handleCapture} className="w-full bg-primary hover:bg-primary/90">
              <Camera className="h-4 w-4 mr-2"/>{strings.capturePhoto}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface TriageInputProps {
  onSubmit: (audioFile: File | null, imageFile: File | null) => Promise<void>;
  isLoading?: boolean;
}

export default function TriageInput({ onSubmit, isLoading = false }: TriageInputProps) {
  const { t } = useLanguage();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [audioPreview, setAudioPreview] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const ollamaStatus = trpc.triage.checkOllama.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const handleAudioUpload = (file: File) => {
    if (!file.type.startsWith("audio/")) { alert("Please upload a valid audio file (.wav or .mp3)"); return; }
    setAudioFile(file);
    setAudioPreview(URL.createObjectURL(file));
  };

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith("image/")) { alert("Please upload a valid image file (.jpg or .png)"); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const startRecording = async () => {
    setMicError(null);

    // navigator.mediaDevices is undefined on HTTP non-localhost in Chrome
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicError("Microphone access requires a secure (HTTPS) connection.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Detect the best supported MIME type for this browser
      const mimeType = getBestAudioMimeType();
      const options = mimeType ? { mimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        // Use the actual recorded MIME type — not a hardcoded wav
        const recordedType = mediaRecorder.mimeType || mimeType || "audio/webm";
        const ext = recordedType.includes("ogg") ? "ogg"
          : recordedType.includes("mp4") ? "mp4"
          : "webm";
        const blob = new Blob(audioChunksRef.current, { type: recordedType });
        handleAudioUpload(new File([blob], `recording.${ext}`, { type: recordedType }));
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start(100); // collect chunks every 100ms
      setIsRecording(true);
    } catch (err: any) {
      const name = err?.name ?? "";
      const msg =
        name === "NotAllowedError" || name === "PermissionDeniedError"
          ? "Microphone permission denied. Please allow access in your browser settings."
          : name === "NotFoundError" || name === "DevicesNotFoundError"
          ? "No microphone found. Please connect a microphone and try again."
          : name === "NotReadableError" || name === "TrackStartError"
          ? "Microphone is in use by another app. Please close it and try again."
          : `Unable to access microphone: ${err?.message ?? "Unknown error"}`;
      setMicError(msg);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const clearAudio = () => {
    setAudioFile(null);
    setMicError(null);
    if (audioPreview) URL.revokeObjectURL(audioPreview);
    setAudioPreview("");
  };
  const clearImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview("");
  };

  const handleSubmit = async () => {
    if (!audioFile) { alert("Please upload or record audio"); return; }
    await onSubmit(audioFile, imageFile);
  };

  const ollama = ollamaStatus.data;

  const cameraStrings = {
    takePhoto: t.takePhoto,
    capturePhoto: t.capturePhoto,
    retakePhoto: t.retakePhoto,
    useThisPhoto: t.useThisPhoto,
    cameraAccessDenied: t.cameraAccessDenied,
    pointAtLabel: t.pointAtLabel,
  };

  return (
    <div className="space-y-6">

      {/* Ollama Status Banner */}
      <div className={`flex items-center gap-3 p-3 rounded-lg border text-sm ${
        ollamaStatus.isLoading ? "bg-muted/20 border-muted" :
        ollama?.ok && ollama?.found ? "bg-green-500/10 border-green-500/30 text-green-400" :
        ollama?.ok && !ollama?.found ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" :
        "bg-red-500/10 border-red-500/30 text-red-400"
      }`}>
        {ollamaStatus.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> :
         ollama?.ok ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
        <span>
          {ollamaStatus.isLoading && "Checking Ollama / Gemma 4 E4B status…"}
          {ollama?.ok && ollama?.found && `✅ Gemma 4 E4B ready (${ollama.model})`}
          {ollama?.ok && !ollama?.found && `⚠️ Ollama reachable but model not found. Run: ollama pull ${ollama.model}`}
          {!ollamaStatus.isLoading && !ollama?.ok && `❌ Ollama not reachable. Start Ollama then run: ollama pull gemma4:e4b`}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audio Input */}
        <Card className="p-6 border-border bg-card">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t.patientAudio}</h3>
            <p className="text-sm text-muted-foreground">{t.audioSubtitle}</p>
            {!audioFile ? (
              <div className="space-y-3">
                <div
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-surface transition-colors"
                  onClick={() => document.getElementById("audio-input")?.click()}
                >
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">{t.uploadAudio}</p>
                  <p className="text-xs text-muted-foreground mt-1">.wav or .mp3</p>
                </div>
                <input id="audio-input" type="file" accept=".wav,.mp3,.webm,.ogg,audio/*"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAudioUpload(f); }}
                  className="hidden" />

                {micError && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{micError}</span>
                  </div>
                )}

                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  variant={isRecording ? "destructive" : "outline"}
                  className="w-full"
                >
                  <Mic className="h-4 w-4 mr-2" />
                  {isRecording ? t.stopRecording : t.recordAudio}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-surface rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">{audioFile.name}</p>
                  <audio src={audioPreview} controls className="w-full h-10 rounded" />
                </div>
                <Button onClick={clearAudio} variant="outline" className="w-full">
                  <X className="h-4 w-4 mr-2" />{t.clearAudio}
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Image Input */}
        <Card className="p-6 border-border bg-card">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {t.photo} <span className="text-muted-foreground font-normal text-sm">({t.optional})</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Medication label or wound photo — Gemma 4 Vision
            </p>
            {!imageFile ? (
              <div className="space-y-2">
                <div
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-surface transition-colors"
                  onClick={() => document.getElementById("image-input")?.click()}
                >
                  <Upload className="h-7 w-7 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">{t.uploadPhoto}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t.selectFromGallery}</p>
                </div>
                <div
                  className="border-2 border-dashed border-primary/40 rounded-lg p-6 text-center cursor-pointer hover:bg-primary/5 transition-colors"
                  onClick={() => setShowCamera(true)}
                >
                  <Camera className="h-7 w-7 text-primary/60 mx-auto mb-2" />
                  <p className="text-sm text-primary/80 font-medium">{t.takePhoto}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t.cameraSubtitle}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-surface rounded-lg p-4 overflow-hidden">
                  <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded" />
                  <p className="text-sm font-medium mt-2">{imageFile.name}</p>
                </div>
                <Button onClick={clearImage} variant="outline" className="w-full">
                  <X className="h-4 w-4 mr-2" />{t.clearImage}
                </Button>
              </div>
            )}
            <input id="image-input" type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }}
              className="hidden" />
            <input id="image-capture" type="file" accept="image/*" capture="environment"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }}
              className="hidden" />
            {showCamera && (
              <CameraModal
                strings={cameraStrings}
                onCapture={(f) => { handleImageUpload(f); setShowCamera(false); }}
                onClose={() => setShowCamera(false)}
              />
            )}
          </div>
        </Card>
      </div>

      <div className="flex gap-3 p-4 rounded-lg bg-info/10 border border-info/30">
        <AlertCircle className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
        <div className="text-sm text-info">
          <strong>Local processing:</strong> {t.allProcessingLocal}
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={!audioFile || isLoading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-semibold">
        {isLoading ? (
          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t.analyzing}</>
        ) : t.startTriageAnalysis}
      </Button>
    </div>
  );
}
