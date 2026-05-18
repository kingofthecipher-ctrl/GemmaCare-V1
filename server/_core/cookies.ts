import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isLocalHost(req: Request): boolean {
  return LOCAL_HOSTS.has(req.hostname);
}

function isSecureRequest(req: Request): boolean {
  if (req.protocol === "https") return true;
  const fwd = req.headers["x-forwarded-proto"];
  if (!fwd) return false;
  const list = Array.isArray(fwd) ? fwd : fwd.split(",");
  return list.some((p) => p.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const local = isLocalHost(req);
  const secure = isSecureRequest(req);

  return {
    httpOnly: true,
    path: "/",
    // On localhost HTTP: use "lax" (no secure flag needed)
    // On HTTPS: use "none" with secure flag for cross-site embedding
    sameSite: local ? "lax" : "none",
    secure: local ? false : secure,
  };
}
