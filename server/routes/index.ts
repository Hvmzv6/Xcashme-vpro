import type { Express } from "express";
import { registerAssistantRoutes } from "./assistantRoutes";
import { registerPersistenceRoutes } from "./persistenceRoutes";
import { registerPrintRoutes } from "./printRoutes";
import { registerSyncRoutes } from "./syncRoutes";

export function registerApiRoutes(app: Express) {
    registerAssistantRoutes(app);
    registerSyncRoutes(app);
    registerPersistenceRoutes(app);
    registerPrintRoutes(app);
}
