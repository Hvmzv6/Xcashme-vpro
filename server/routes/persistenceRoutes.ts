import type { Express, Request, Response } from "express";
import { readStoreState, saveStoreState } from "../services/sqlite";

export function registerPersistenceRoutes(app: Express) {
    app.get("/api/db/load", async (_req: Request, res: Response) => {
        try {
            const result = await readStoreState();
            return res.json(result);
        } catch (error: any) {
            console.error("Error loading SQLite DB:", error);
            return res.status(500).json({ status: "error", message: error.message });
        }
    });

    app.post("/api/db/save", async (req: Request, res: Response) => {
        try {
            const { state } = req.body;
            if (!state) {
                return res.status(400).json({ error: "Missing state payload" });
            }

            const result = await saveStoreState(state);
            return res.json(result);
        } catch (error: any) {
            console.error("Error saving SQLite DB:", error);
            return res.status(500).json({ status: "error", message: error.message });
        }
    });
}
