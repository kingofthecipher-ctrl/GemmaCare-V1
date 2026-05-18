import { AlertCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface MedicationMismatchModalProps {
  audioMedication: string;
  imageMedication: string;
  onProceed: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  safetyConflicts?: string | null;
}

export default function MedicationMismatchModal({
  audioMedication,
  imageMedication,
  onProceed,
  onCancel,
  isLoading = false,
  safetyConflicts,
}: MedicationMismatchModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <Card className="w-full max-w-md border-destructive/50 bg-card flex flex-col rounded-b-none sm:rounded-b-lg rounded-t-2xl sm:rounded-t-lg max-h-[92dvh] sm:max-h-[90vh]">

        {/* ── Scrollable content area ── */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">

          {/* Header */}
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-destructive">
                Medication Mismatch Detected
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Audio and image report different medications. Verify before proceeding.
              </p>
            </div>
          </div>

          {/* Audio vs Image */}
          <div className="bg-surface rounded-lg p-4 space-y-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Audio Mentions
              </p>
              <p className="text-lg font-semibold text-foreground mt-1">
                {audioMedication}
              </p>
            </div>
            <div className="border-t border-border pt-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Image Shows
              </p>
              <p className="text-lg font-semibold text-foreground mt-1">
                {imageMedication}
              </p>
            </div>
          </div>

          {/* Safety conflicts — rendered only when present */}
          {safetyConflicts && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-xs font-semibold text-destructive uppercase tracking-wide mb-2">
                Safety Conflicts Detected
              </p>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {safetyConflicts}
              </p>
            </div>
          )}

          {/* Action required banner */}
          <div className="flex gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="text-sm text-destructive">
              <strong>Action Required:</strong> Verify with the patient which medication is correct before proceeding.
            </div>
          </div>

          {/* Acknowledgment — inside scroll so it's readable before acting */}
          <p className="text-xs text-muted-foreground text-center pb-1">
            By proceeding, you acknowledge the discrepancy and take responsibility for verifying the correct medication with the patient.
          </p>
        </div>

        {/* ── Sticky action buttons — always visible ── */}
        <div className="flex gap-3 p-4 border-t border-border bg-card flex-shrink-0 rounded-b-none sm:rounded-b-lg">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1"
            disabled={isLoading}
          >
            Cancel & Verify
          </Button>
          <Button
            onClick={onProceed}
            className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Proceed Anyway"}
          </Button>
        </div>

      </Card>
    </div>
  );
}

