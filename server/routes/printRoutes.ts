import type { Express, Request, Response } from "express";
import { printThermalReceipt } from "../services/thermalPrint";

export function registerPrintRoutes(app: Express) {
    app.post("/api/print/thermal", async (req: Request, res: Response) => {
        try {
            const result = await printThermalReceipt(req.body);
            return res.json(result);
        } catch (error: any) {
            console.error("Thermal printing error:", error);
            return res.status(500).json({ status: "error", message: error.message });
        }
    });
}
