import { afterEach, describe, expect, it, vi } from "vitest";
import { SignJWT } from "jose";
import express from "express";
import type { Server } from "node:http";
import { COOKIE_NAME } from "../shared/const";

vi.mock("./db", () => ({
  getUserByOpenId: vi.fn(), upsertUser: vi.fn(), getUserTriageRecords: vi.fn(),
  getTriageRecordById: vi.fn(), createTriageRecord: vi.fn(), createSessionHistory: vi.fn(),
}));
vi.mock("./_core/llm", () => ({ invokeLLM: vi.fn(), transcribeAudio: vi.fn(), describeImage: vi.fn() }));
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { sdk } from "./_core/sdk";
import { ENV } from "./_core/env";
import { createContext, type TrpcContext } from "./_core/context";
import { appRouter } from "./routers";
import { registerOAuthRoutes } from "./_core/oauth";
import { emitTriageProgress, registerTriageProgressSSE } from "./_core/triageProgress";

const servers: Server[] = [];
afterEach(async () => {
  await Promise.all(servers.splice(0).map(server => new Promise<void>(resolve => {
    server.close(() => resolve()); server.closeAllConnections();
  })));
  vi.resetAllMocks(); vi.unstubAllEnvs();
});
const user = {
  id: 2, openId: "synthetic-user-two", name: "Synthetic User", email: null,
  loginMethod: "local", role: "user" as const,
  createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
};
const context = (cookie = "") => ({ req: { headers: { cookie } }, res: {} }) as Parameters<typeof createContext>[0];
async function testServer() {
  const app = express();
  registerOAuthRoutes(app);
  registerTriageProgressSSE(app);
  const server = await new Promise<Server>(resolve => {
    const listening = app.listen(0, "127.0.0.1", () => resolve(listening));
  });
  servers.push(server);
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing test listener");
  return `http://127.0.0.1:${address.port}`;
}

describe("session and record security", () => {
  it("rejects sessions signed using the old public default", async () => {
    const forged = await new SignJWT({ openId: user.openId, appId: ENV.appId, name: user.name })
      .setProtectedHeader({ alg: "HS256" }).setExpirationTime("1h")
      .sign(new TextEncoder().encode("gemmacare-v1-local-secret"));
    expect(await sdk.verifySession(forged)).toBeNull();
  });

  it("accepts valid sessions only for this application", async () => {
    const valid = await sdk.createSessionToken(user.openId, { name: user.name });
    expect((await sdk.verifySession(valid))?.openId).toBe(user.openId);
    const otherApp = await sdk.signSession({ openId: user.openId, name: user.name, appId: "another-app" });
    expect(await sdk.verifySession(otherApp)).toBeNull();
    const expired = await sdk.createSessionToken(user.openId, { name: user.name, expiresInMs: -1000 });
    expect(await sdk.verifySession(expired)).toBeNull();
  });

  it("parses valid sessions despite an unrelated malformed cookie", async () => {
    vi.mocked(db.getUserByOpenId).mockResolvedValue(user);
    const token = await sdk.createSessionToken(user.openId, { name: user.name });
    expect((await createContext(context(`broken=%; ${COOKIE_NAME}=${token}`))).user?.id).toBe(2);
  });

  it("never grants user ID 1 when local bypass encounters a database failure", async () => {
    vi.stubEnv("LOCAL_DEV_BYPASS_AUTH", "true");
    vi.mocked(db.upsertUser).mockRejectedValue(new Error("Synthetic database failure"));
    expect((await createContext(context())).user).toBeNull();
  });

  it("denies anonymous record access and cross-user reads/translations", async () => {
    const caller = appRouter.createCaller({ ...context(), user } as TrpcContext);
    vi.mocked(db.getTriageRecordById).mockResolvedValue({ id: 1, userId: 1 } as never);
    await expect(caller.triage.getRecord({ id: 1 })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(caller.triage.translateInstructions({ recordId: 1, targetLanguage: "en" })).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(invokeLLM).not.toHaveBeenCalled();
    const anonymous = appRouter.createCaller({ ...context(), user: null } as TrpcContext);
    await expect(anonymous.triage.getHistory()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("scopes history queries to the authenticated user", async () => {
    vi.mocked(db.getUserTriageRecords).mockResolvedValue([]);
    const caller = appRouter.createCaller({ ...context(), user } as TrpcContext);
    await expect(caller.triage.getHistory()).resolves.toEqual([]);
    expect(db.getUserTriageRecords).toHaveBeenCalledWith(2);
  });

  it("preserves offline local login and refuses unsolicited external OAuth codes", async () => {
    const base = await testServer();
    const response = await fetch(`${base}/api/auth/local-login?noRedirect=1`);
    expect(response.status).toBe(200);
    const cookie = response.headers.get("set-cookie")!;
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    const token = cookie.split(";")[0].slice(COOKIE_NAME.length + 1);
    expect((await sdk.verifySession(token))?.openId).toBe(ENV.ownerOpenId);
    expect((await fetch(`${base}/api/oauth/callback?code=synthetic&state=synthetic`)).status).toBe(404);
  });

  it("authenticates progress polling and isolates the same job ID between users", async () => {
    vi.stubEnv("LOCAL_DEV_BYPASS_AUTH", "false");
    const base = await testServer();
    vi.mocked(db.getUserByOpenId).mockImplementation(async openId => ({ ...user, id: openId === "one" ? 1 : 2, openId }));
    emitTriageProgress("synthetic-job", "extract", 1);
    const tokenOne = await sdk.createSessionToken("one", { name: "Synthetic One" });
    const tokenTwo = await sdk.createSessionToken("two", { name: "Synthetic Two" });
    const url = `${base}/api/triage/status/synthetic-job`;
    expect((await fetch(url)).status).toBe(401);
    expect(await (await fetch(url, { headers: { Cookie: `${COOKIE_NAME}=${tokenOne}` } })).json()).toEqual({ step: "extract" });
    expect(await (await fetch(url, { headers: { Cookie: `${COOKIE_NAME}=${tokenTwo}` } })).json()).toEqual({ step: "waiting" });
  });
});
