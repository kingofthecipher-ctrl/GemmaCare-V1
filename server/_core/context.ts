import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { parse } from "cookie";
import { sdk } from "./sdk";
import { ENV } from "./env";
import { COOKIE_NAME } from "@shared/const";
import * as db from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: NonNullable<Awaited<ReturnType<typeof db.getUserByOpenId>>> | null;
};

export async function createContext(
  opts: Pick<CreateExpressContextOptions, "req" | "res">
): Promise<TrpcContext> {
  let user: TrpcContext["user"] = null;

  // ── Step 1: try JWT cookie (works 100% offline — pure local crypto) ────────
  try {
    const raw = opts.req.headers.cookie ?? "";
    const cookies = parse(raw);
    const token = cookies[COOKIE_NAME];
    if (token) {
      const session = await sdk.verifySession(token);
      if (session) {
        user = await db.getUserByOpenId(session.openId) ?? null;
        // Cookie is valid but user not in DB yet — create them
        if (!user) {
          await db.upsertUser({
            openId: session.openId,
            name: session.name || "Local User",
            email: "local@gemmacare.local",
            loginMethod: "local",
            lastSignedIn: new Date(),
          });
          user = await db.getUserByOpenId(session.openId) ?? null;
        }
      }
    }
  } catch {
    user = null;
  }

  // ── Step 2: LOCAL_DEV_BYPASS_AUTH fallback — no cookie needed ─────────────
  // If LOCAL_DEV_BYPASS_AUTH=true and we still have no user (cookie missing or
  // expired), synthesise a local user so triage works fully offline without
  // requiring the login screen at all.
  if (!user && process.env.LOCAL_DEV_BYPASS_AUTH === "true") {
    const openId = ENV.ownerOpenId || "local-owner-id";
    const name = ENV.ownerName || "Local User";
    try {
      await db.upsertUser({
        openId,
        name,
        email: "local@gemmacare.local",
        loginMethod: "local",
        lastSignedIn: new Date(),
      });
      user = await db.getUserByOpenId(openId) ?? null;
    } catch {
      // Never guess a persistent user ID when the database cannot verify it.
      user = null;
    }
  }

  return { req: opts.req, res: opts.res, user };
}
