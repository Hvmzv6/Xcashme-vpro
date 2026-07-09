import type { Express, Request, Response } from "express";
import { generateAssistantReply } from "../services/assistant";

export function registerAssistantRoutes(app: Express) {
    app.post("/api/gemini", async (req: Request, res: Response) => {
        const { messages, storeState } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: "Invalid messages array." });
        }

        try {
            const reply = await generateAssistantReply(messages, storeState);
            return res.json({
                choices: [{
                    message: {
                        role: "assistant",
                        content: reply.content,
                        suggestedAction: reply.suggestedAction
                    }
                }]
            });
        } catch (error: any) {
            console.error("Gemini API call failed:", error);
            return res.status(500).json({ error: "Failed to communicate with AI Assistant." });
        }
    });
}
