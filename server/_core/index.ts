import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { runMigrations } from "./migrate";

async function startServer() {
  const app = express();
  const server = createServer(app);

  // ── CSP header — allow inline scripts/eval needed by the React bundle ──
  app.use((_req, res, next) => {
    res.setHeader(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "media-src 'self' blob:",
        "connect-src 'self' http://localhost:11434 http://host.docker.internal:11434",
        "font-src 'self' data:",
        "worker-src 'self' blob:",
      ].join("; ")
    );
    next();
  });

  // Increase payload limits for base64 audio/image uploads
  app.use(express.json({ limit: "150mb" }));
  app.use(express.urlencoded({ limit: "150mb", extended: true }));

  // Run DB migrations automatically on startup
  try {
    await runMigrations();
    console.log("✅ Database migrations complete");
  } catch (err) {
    console.error("⚠️  Migration warning (may already be applied):", String(err));
  }

  registerStorageProxy(app);
  registerOAuthRoutes(app);

  // SSE progress stream for real-time triage step updates
  const { registerTriageProgressSSE } = await import("./triageProgress");
  registerTriageProgressSSE(app);

  app.use(
    "/api/trpc",
    createExpressMiddleware({ router: appRouter, createContext })
  );

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT ?? "8080");

  server.listen(port, "0.0.0.0", () => {
    const B2 = "\x1b[38;5;39m";
    const T1 = "\x1b[38;5;43m";
    const G1 = "\x1b[38;5;78m";
    const G2 = "\x1b[38;5;82m";
    const W  = "\x1b[1;97m";
    const DIM = "\x1b[2m";
    const BOLD = "\x1b[1m";
    const RST = "\x1b[0m";

    console.log("");
    console.log(`${W}${BOLD}  ██████╗ ███████╗███╗   ███╗███╗   ███╗ █████╗  ██████╗ █████╗ ██████╗ ███████╗${RST}`);
    console.log(`${W}${BOLD} ██╔════╝ ██╔════╝████╗ ████║████╗ ████║██╔══██╗██╔════╝██╔══██╗██╔══██╗██╔════╝${RST}`);
    console.log(`${B2}${BOLD} ██║  ███╗█████╗  ██╔████╔██║██╔████╔██║███████║██║     ███████║██████╔╝█████╗  ${RST}`);
    console.log(`${T1}${BOLD} ██║   ██║██╔══╝  ██║╚██╔╝██║██║╚██╔╝██║██╔══██║██║     ██╔══██║██╔══██╗██╔══╝  ${RST}`);
    console.log(`${G1}${BOLD} ╚██████╔╝███████╗██║ ╚═╝ ██║██║ ╚═╝ ██║██║  ██║╚██████╗██║  ██║██║  ██║███████╗${RST}`);
    console.log(`${G2}${BOLD}  ╚═════╝ ╚══════╝╚═╝     ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝${RST}`);
    console.log("");
    console.log(`${DIM}  AI-assisted triage for frontline clinicians in low-resource settings${RST}`);
    console.log(`${DIM}  Developed by: Chris Golden${RST}`);
    console.log("");
    console.log(`${W}  Powered by:${RST}`);
    console.log(`${G1}    🤖 Google Gemma 4 E4B${RST}       ${DIM}— multimodal LLM (audio · vision · reasoning · translation)${RST}`);
    console.log(`${G1}    🦙 Ollama${RST}                   ${DIM}— local model serving (no cloud, no data leaves device)${RST}`);
    console.log(`${G1}    🗄️  SQLite${RST}                   ${DIM}— local patient record storage${RST}`);
    console.log(`${G1}    🎞️  FFmpeg${RST}                   ${DIM}— audio transcoding (WebM/MP3 → 16kHz WAV)${RST}`);
    console.log(`${G1}    ⚡ tRPC + React + Tailwind${RST}   ${DIM}— type-safe API, dark UI${RST}`);
    console.log("");
    const ollamaUrl = process.env.OLLAMA_BASE_URL ?? "http://host.docker.internal:11434";
    const ollamaModel = process.env.OLLAMA_MODEL ?? "gemma4:e4b";
    const rows = [
      `${G2}♥${RST}${B2}  Server ready`,
      `${W}App   :${RST}${B2} ${G1}http://localhost:${port}`,
      `${W}Model :${RST}${B2} ${G1}${ollamaModel}`,
      `${W}Ollama:${RST}${B2} ${G1}${ollamaUrl}`,
    ];
    // Measure visible length (strip ANSI codes)
    const visLen = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, "").length;
    const inner  = Math.max(...rows.map(r => visLen(r))) + 2; // 1 space each side
    const bar    = "═".repeat(inner + 2);
    console.log(`${B2}  ╔${bar}╗${RST}`);
    for (const row of rows) {
      const pad = inner + 2 - visLen(row) - 1;
      console.log(`${B2}  ║ ${RST}${row}${B2}${" ".repeat(pad)}║${RST}`);
    }
    console.log(`${B2}  ╚${bar}╝${RST}`);
    console.log("");
  });
}

startServer().catch(console.error);
