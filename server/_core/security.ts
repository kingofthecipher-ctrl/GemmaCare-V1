import { createHash, timingSafeEqual } from "node:crypto";
import type { RequestHandler } from "express";

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

export function getAccessConfig(env: NodeJS.ProcessEnv = process.env) {
  const host = env.HOST || "127.0.0.1";
  const password = env.APP_ACCESS_PASSWORD || "";
  if (password && password.length < 16) {
    throw new Error("APP_ACCESS_PASSWORD must contain at least 16 characters");
  }
  if (!LOOPBACK_HOSTS.has(host) && !password) {
    throw new Error("Non-loopback HOST requires APP_ACCESS_PASSWORD (at least 16 characters)");
  }
  if (env.NODE_ENV === "development" && !LOOPBACK_HOSTS.has(host)) {
    throw new Error("Network access requires a production build; keep the development server on loopback");
  }
  const origin = env.APP_ORIGIN ? new URL(env.APP_ORIGIN) : undefined;
  if (origin && (!['http:', 'https:'].includes(origin.protocol) || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash)) {
    throw new Error("APP_ORIGIN must be an HTTP(S) origin without a path or credentials");
  }
  return { host, password, origin: origin?.origin };
}

// The application has one shared local owner. Protect the entire application,
// including local-login and static assets, before any request body is parsed.
export function accessBoundary(config = getAccessConfig()): RequestHandler {
  const expected = createHash("sha256").update(`gemmacare:${config.password}`).digest();
  return (req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("X-Frame-Options", "DENY");
    if (req.path.startsWith("/api/")) res.setHeader("Cache-Control", "no-store");

    let requestOrigin: string;
    try {
      const host = req.headers.host;
      if (!host || /[\s/@\\?#]/.test(host)) throw new Error("Invalid Host");
      const url = new URL(`${req.protocol}://${host}`);
      const configured = config.origin ? new URL(config.origin) : undefined;
      if (configured ? url.host !== configured.host : !LOOPBACK_HOSTS.has(url.hostname)) {
        throw new Error("Untrusted Host");
      }
      requestOrigin = config.origin ?? url.origin;
    } catch {
      res.status(403).json({ error: "Untrusted Host" });
      return;
    }
    // Covers GET auto-login as well as mutations; prevents local-service CSRF
    // and DNS rebinding. No forwarded headers are trusted implicitly.
    if (req.headers["sec-fetch-site"] === "cross-site" ||
        (req.headers.origin !== undefined && req.headers.origin !== requestOrigin)) {
      res.status(403).json({ error: "Cross-origin requests are not allowed" });
      return;
    }
    if (config.password) {
      const auth = req.headers.authorization ?? "";
      const credential = /^Basic /i.test(auth) && auth.length <= 1024
        ? Buffer.from(auth.slice(6), "base64").toString("utf8") : "";
      const actual = createHash("sha256").update(credential).digest();
      if (!timingSafeEqual(expected, actual)) {
        res.setHeader("WWW-Authenticate", 'Basic realm="GemmaCare", charset="UTF-8"');
        res.status(401).json({ error: "Application access credentials required" });
        return;
      }
    }
    next();
  };
}
