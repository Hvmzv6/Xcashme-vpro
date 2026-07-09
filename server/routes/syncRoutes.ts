import type { Express, Request, Response } from "express";
import { buildSyncResponse } from "../services/sync";

export function registerSyncRoutes(app: Express) {
    app.post("/api/sync", (req: Request, res: Response) => {
        return res.json(buildSyncResponse(req.body));
    });
}
