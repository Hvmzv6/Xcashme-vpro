import fs from "fs";
import path from "path";

export function resolveProjectRoot() {
    return path.resolve(__dirname, "..");
}

export function resolveDistPath() {
    const projectRoot = resolveProjectRoot();
    const distPath = path.join(projectRoot, "dist");
    return fs.existsSync(distPath) ? distPath : projectRoot;
}

export function shouldServeCompiledAssets() {
    return process.env.NODE_ENV === "production"
        || process.env.IS_ELECTRON === "true"
        || __filename.endsWith(".cjs")
        || __filename.endsWith(".js");
}
