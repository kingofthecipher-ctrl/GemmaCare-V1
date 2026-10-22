import { afterEach, describe, expect, it } from "vitest";
import express from "express";
import type { Server } from "node:http";
import { request } from "node:http";
import { accessBoundary, getAccessConfig } from "./_core/security";

const servers: Server[] = [];
afterEach(async () => {
  await Promise.all(servers.splice(0).map(server => new Promise<void>((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
    server.closeAllConnections();
  })));
});

async function boundaryServer(password = "") {
  const app = express();
  app.use(accessBoundary({ host: "127.0.0.1", password, origin: undefined }));
  // Malformed JSON must never be parsed before access is authorized.
  app.use(express.json());
  app.all("/api/probe", (_req, res) => res.json({ ok: true }));
  const server = await new Promise<Server>(resolve => {
    const listening = app.listen(0, "127.0.0.1", () => resolve(listening));
  });
  servers.push(server);
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing test listener");
  return `http://127.0.0.1:${address.port}/api/probe`;
}

describe("single-owner access boundary", () => {
  it("defaults to loopback and refuses unprotected network listeners", () => {
    expect(getAccessConfig({}).host).toBe("127.0.0.1");
    expect(() => getAccessConfig({ HOST: "0.0.0.0" })).toThrow(/APP_ACCESS_PASSWORD/);
    expect(() => getAccessConfig({ HOST: "0.0.0.0", APP_ACCESS_PASSWORD: "short" })).toThrow();
    expect(() => getAccessConfig({ HOST: "0.0.0.0", APP_ACCESS_PASSWORD: "synthetic-password", NODE_ENV: "development" })).toThrow(/production/);
    expect(() => getAccessConfig({ APP_ORIGIN: "https://example.test/path" })).toThrow();
  });

  it("allows same-origin local clients and marks API responses private", async () => {
    const url = await boundaryServer();
    const response = await fetch(url, { headers: { Origin: new URL(url).origin } });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
  });

  it("rejects DNS rebinding Hosts and hostile origins, including GET requests", async () => {
    const url = await boundaryServer();
    for (const headers of [
      { Host: "attacker.test" },
      { Origin: "https://attacker.test" },
      { "Sec-Fetch-Site": "cross-site" },
    ]) {
      const status = await new Promise<number | undefined>((resolve, reject) => {
        request(url, { headers }, response => {
          response.resume();
          resolve(response.statusCode);
        }).on("error", reject).end();
      });
      expect(status, JSON.stringify(headers)).toBe(403);
    }
  });

  it("requires the application password before body parsing", async () => {
    const url = await boundaryServer("synthetic-password");
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{" });
    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toContain("GemmaCare");
    const auth = "Basic " + Buffer.from("gemmacare:synthetic-password").toString("base64");
    expect((await fetch(url, { headers: { Authorization: auth } })).status).toBe(200);
  });
});
