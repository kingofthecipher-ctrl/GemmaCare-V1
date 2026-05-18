import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import path from "path";

export async function setupVite(app: Express, server: Server) {
  const { nanoid } = await import("nanoid");
  const { createServer: createViteServer } = await import("vite");
  const { default: viteConfig } = await import("../../vite.config");

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: { middlewareMode: true, hmr: { server }, allowedHosts: true as const },
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path.resolve(process.cwd(), "client", "index.html");
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(`src="/src/main.tsx"`, `src="/src/main.tsx?v=${nanoid()}"`);
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Vite builds the frontend into dist/public
  // The server bundle lands in dist/index.js
  // So from dist/index.js, "public" is at dist/public = path.join(__dirname, "public")
  const distPath = path.join(process.cwd(), "dist", "public");
  const fallback = path.join(process.cwd(), "public");

  const staticPath = fs.existsSync(distPath) ? distPath : fallback;

  if (!fs.existsSync(staticPath)) {
    console.error(`[serveStatic] Could not find frontend build at: ${staticPath}`);
    // Serve a helpful error page instead of crashing
    app.use("*", (_req, res) => {
      res.status(503).send("<h1>GemmaCare V1</h1><p>Frontend build not found. Check Docker logs.</p>");
    });
    return;
  }

  console.log(`[serveStatic] Serving frontend from: ${staticPath}`);
  app.use(express.static(staticPath));
  app.use("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });
}
