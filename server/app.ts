import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";
import { registerApiRoutes } from "./routes";
import { resolveDistPath, shouldServeCompiledAssets } from "./utils/runtime";

export function createServerApp() {
    const app = express();
    app.use(express.json());
    registerApiRoutes(app);
    return app;
}

export async function startServer() {
    const app = createServerApp();

    const isProdOrCompiled = shouldServeCompiledAssets();
    const distPath = resolveDistPath();
    const hasDistIndex = fs.existsSync(path.join(distPath, "index.html"));

    if (!isProdOrCompiled && !hasDistIndex && process.env.NODE_ENV !== "production") {
        console.log("[POS Server] Starting Vite middleware mode for development...");
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: "spa"
        });
        app.use(vite.middlewares);
    } else {
        console.log(`[POS Server] Serving static production files from: ${distPath}`);
        app.use((_req, res, next) => {
            res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");
            next();
        });
        app.use(express.static(distPath));
        app.get("*", (_req, res) => {
            res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
            res.sendFile(path.join(distPath, "index.html"));
        });
    }

    const port = Number(process.env.PORT || 3000);
    const server = app.listen(port, "0.0.0.0", () => {
        console.log(`Xcashme-vpro backend running on http://0.0.0.0:${port}`);
    });

    server.on("error", (err: any) => {
        console.error(`[POS Server] Server error on port ${port}:`, err.message);
    });

    return { app, server };
}
