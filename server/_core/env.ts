export const ENV = {
  appId: process.env.VITE_APP_ID ?? "local-dev",
  cookieSecret: process.env.JWT_SECRET ?? "gemmacare-v1-local-secret",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "http://localhost:8080",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "local-owner-id",
  ownerName: process.env.OWNER_NAME ?? "Local User",
  isProduction: process.env.NODE_ENV === "production",
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
  ollamaModel: process.env.OLLAMA_MODEL ?? "gemma4:e4b",
};
