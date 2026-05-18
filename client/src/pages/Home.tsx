import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, Zap, Shield, Globe, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { LocalLoginButton } from "@/components/LocalLoginButton";

export default function Home() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold">{t.welcomeTo}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">{t.allProcessingLocal}</p>
      </div>

      {/* Local Login — shown when no session exists */}
      {!user && (
        <Card className="p-8 border-border bg-card border-dashed border-primary/40 text-center space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Offline Mode — No login required</h2>
            <p className="text-sm text-muted-foreground">
              GemmaCare runs 100% locally. Tap below to start a session — no internet or account needed.
            </p>
          </div>
          <LocalLoginButton />
        </Card>
      )}

      {/* Quick Start */}
      <Card className="p-8 border-border bg-card border-primary/30">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <h2 className="text-2xl font-semibold">{t.startATriage}</h2>
            <p className="text-muted-foreground">{t.patientAudio}. {t.uploadPhoto}.</p>
          </div>
          <Button onClick={() => setLocation("/triage")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-6 whitespace-nowrap">
            {t.startTriageAnalysis}<ArrowRight className="h-4 w-4 ml-2"/>
          </Button>
        </div>
      </Card>

      {/* How It Works */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">{t.howItWorks}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { n: 1, color: "bg-primary/10 text-primary", label: t.input, desc: t.uploadAudio },
            { n: 2, color: "bg-secondary/10 text-secondary", label: t.extract, desc: `${t.extract}: ${t.detectedLanguage}, ${t.medication}, ${t.symptoms}` },
            { n: 3, color: "bg-muted/30 text-muted-foreground", label: t.verify, desc: `${t.safetyCheck}: ${t.medicationMismatch}` },
            { n: 4, color: "bg-primary/10 text-primary", label: t.record, desc: `${t.clinicalRecord}: ${t.urgency}` },
          ].map(({ n, color, label, desc }) => (
            <Card key={n} className="p-6 border-border bg-card">
              <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${color} font-bold mb-4`}>{n}</div>
              <h3 className="font-semibold mb-2">{label}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Key Features */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">{t.keyFeatures}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: Activity, title: t.multimodalAnalysis, desc: `${t.patientAudio} + ${t.photo}` },
            { icon: Shield,   title: t.safetyVerification, desc: t.medicationWarning },
            { icon: Globe,    title: t.multilingualSupport, desc: `${t.detectedLanguage} — 35+` },
            { icon: Zap,      title: t.fastProcessing, desc: t.clinicalRecord },
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="p-6 border-border bg-card hover:border-primary/50 transition-colors">
              <div className="flex items-start gap-4">
                <Icon className="h-6 w-6 text-primary flex-shrink-0 mt-1"/>
                <div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Demo CTA */}
      <Card className="p-8 border-border bg-card border-secondary/30">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <h2 className="text-2xl font-semibold">{t.demoCases}</h2>
            <p className="text-muted-foreground">{t.demoCases}: Hindi, Swahili, Spanish, Arabic</p>
          </div>
          <Button onClick={() => setLocation("/demo")} variant="outline" className="h-12 px-6 whitespace-nowrap">
            {t.viewDemos}<ArrowRight className="h-4 w-4 ml-2"/>
          </Button>
        </div>
      </Card>

      {/* Disclaimer */}
      <div className="flex gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
        <Shield className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5"/>
        <div className="text-sm text-yellow-300">
          <strong>{t.importantDisclaimer}:</strong> {t.disclaimerText}
        </div>
      </div>
    </div>
  );
}
