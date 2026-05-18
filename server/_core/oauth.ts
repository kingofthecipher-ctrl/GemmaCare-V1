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
        console.warn("[LocalAuth] DB unavailable — running without persistence:", (dbErr as Error).message);
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
      console.error("[LocalAuth] Login failed", error);
      res.status(500).json({ error: String(error) });
    }
  });

  // ── Original OAuth callback (kept for future use) ────────────────────────
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = typeof req.query.code === "string" ? req.query.code : undefined;
    const state = typeof req.query.state === "string" ? req.query.state : undefined;

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "User",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
