import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";

export function registerOAuthRoutes(app: Express) {
  // ── Local dev auto-login ──────────────────────────────────────────────────
  // Running fully locally — no external OAuth server required.
  // this endpoint creates a session for the local owner automatically.
  app.get("/api/auth/local-login", async (req: Request, res: Response) => {
    try {
      const openId = ENV.ownerOpenId || "local-owner-id";
      const name = ENV.ownerName || "Local User";

      // Upsert the local user — silently skip if no database is configured.
      // The triage pipeline works without a DB; only history/save features need it.
      try {
        await db.upsertUser({
          openId,
          name,
          email: "local@gemmacare.local",
          loginMethod: "local",
          lastSignedIn: new Date(),
        });
      } catch (dbErr) {
        console.warn("[LocalAuth] DB unavailable — running without persistence");
      }

      // Create a session token (JWT — no DB needed)
      const sessionToken = await sdk.createSessionToken(openId, {
        name,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // noRedirect=1: return JSON so SPA auto-login works without full page reload
      if (req.query.noRedirect === "1") {
        res.json({ ok: true, user: { name, openId } });
      } else {
        res.redirect(302, "/");
      }
    } catch (error) {
      console.error("[LocalAuth] Login failed");
      res.status(500).json({ error: "Local login failed" });
    }
  });

  app.get("/api/oauth/callback", (_req: Request, res: Response) => {
    // This scaffold has no server-generated, browser-bound OAuth state flow.
    // Local login is the supported path; fail closed instead of accepting an
    // unsolicited authorization code as a session for an arbitrary browser.
    res.status(404).json({ error: "External OAuth login is not configured" });
  });
}
