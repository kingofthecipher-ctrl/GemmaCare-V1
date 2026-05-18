/**
 * Simple in-memory step tracker for triage progress.
 * Polling-based — no SSE buffering issues.
 *
 * The triage router calls setStep(jobId, stepId) at the start of each step.
 * The client polls GET /api/triage/status/:jobId every 300ms.
 */
import type { Request, Response, Express } from "express";

// jobId → current stepId
const steps = new Map<string, string>();

// How long to keep a jobId in memory after "done" (2 minutes)
const CLEANUP_MS = 2 * 60 * 1000;

export function emitTriageProgress(jobId: string, stepId: string) {
  steps.set(jobId, stepId);
  if (stepId === "done") {
    setTimeout(() => steps.delete(jobId), CLEANUP_MS);
  }
}

export function registerTriageProgressSSE(app: Express) {
  app.get("/api/triage/status/:jobId", (req: Request, res: Response) => {
    const { jobId } = req.params;
    const step = steps.get(jobId) ?? "waiting";
    res.json({ step });
  });
}
