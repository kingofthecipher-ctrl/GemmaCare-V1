/**
 * Simple in-memory step tracker for triage progress.
 * Polling-based — no SSE buffering issues.
 *
 * The triage router calls setStep(jobId, stepId) at the start of each step.
 * The client polls GET /api/triage/status/:jobId every 300ms.
 */
import type { Express } from "express";
import { createContext } from "./context";

// jobId → current stepId
const steps = new Map<string, { step: string; expires: number }>();

// How long to keep a jobId in memory after "done" (2 minutes)
const RETENTION_MS = 15 * 60 * 1000;
const MAX_JOBS = 1000;
const keyFor = (userId: number, jobId: string) => `${userId}:${jobId}`;

export function emitTriageProgress(jobId: string, step: string, userId: number) {
  const key = keyFor(userId, jobId);
  steps.forEach((value, id) => {
    if (value.expires <= Date.now()) steps.delete(id);
  });
  if (!steps.has(key) && steps.size >= MAX_JOBS) steps.delete(steps.keys().next().value!);
  steps.set(key, { step, expires: Date.now() + RETENTION_MS });
}

export function registerTriageProgressSSE(app: Express) {
  app.get("/api/triage/status/:jobId", async (req, res) => {
    try {
      const { user } = await createContext({ req, res });
      if (!user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }
      const value = steps.get(keyFor(user.id, req.params.jobId));
      res.setHeader("Cache-Control", "no-store");
      res.json({ step: value && value.expires > Date.now() ? value.step : "waiting" });
    } catch {
      res.status(503).json({ error: "Progress unavailable" });
    }
  });
}
