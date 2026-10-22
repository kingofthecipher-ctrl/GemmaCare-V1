import { randomBytes } from "node:crypto";

const configuredSecret = process.env.JWT_SECRET;
if (configuredSecret && (configuredSecret.length < 32 || /change[-_ ]?me|change[-_ ]?in[-_ ]?prod|before[-_ ]?production/i.test(configuredSecret))) {
  throw new Error("JWT_SECRET must be a random secret of at least 32 characters; remove placeholder values");
}

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "local-dev",
  // No shared signing key. Without a configured key, sessions expire on restart.
  cookieSecret: configuredSecret || randomBytes(32).toString("hex"),
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "http://localhost:8080",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "local-owner-id",
  ownerName: process.env.OWNER_NAME ?? "Local User",
  isProduction: process.env.NODE_ENV === "production",
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
  ollamaModel: process.env.OLLAMA_MODEL ?? "gemma4:e4b",
};
