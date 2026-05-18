import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2, MonitorCheck } from "lucide-react";

/**
 * One-click local login for fully offline deployments.
 * Hits /api/auth/local-login, which sets the session cookie,
 * then redirects to /triage. No OAuth, no network required.
 */
export function LocalLoginButton({ redirectTo = "/triage" }: { redirectTo?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const handleLocalLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/local-login", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Server returned ${res.status}`);
      }
      // Cookie is set — navigate into the app
      setLocation(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onClick={handleLocalLogin}
        disabled={loading}
        className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
      >
        {loading ? (
          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Starting session…</>
        ) : (
          <><MonitorCheck className="h-4 w-4 mr-2" />Continue as Local User</>
        )}
      </Button>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      <p className="text-xs text-muted-foreground">
        100% offline · no account needed · session stored locally
      </p>
    </div>
  );
}
