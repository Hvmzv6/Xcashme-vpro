import fs from "fs";
import path from "path";
import initSqlJs from "sql.js";

let dbInstance: any = null;
let sqliteDbPath = "";

export interface SQLiteStoreStateResult {
    status: "success" | "empty" | "error";
    data?: unknown;
    timestamp?: string;
    sizeBytes?: number;
    dbPath?: string;
    message?: string;
}

export async function getSQLiteDatabase() {
    if (dbInstance) {
        return { db: dbInstance, path: sqliteDbPath };
    }

    const SQL = await initSqlJs();
    const dataDir = process.env.USER_DATA_PATH || path.join(process.cwd(), "data");

    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    sqliteDbPath = path.join(dataDir, "xcash_pos.sqlite");

    if (fs.existsSync(sqliteDbPath)) {
        const fileBuffer = fs.readFileSync(sqliteDbPath);
        dbInstance = new SQL.Database(fileBuffer);
    } else {
        dbInstance = new SQL.Database();
    }

    dbInstance.run(`
    CREATE TABLE IF NOT EXISTS store_state (
      id TEXT PRIMARY KEY,
      json_data TEXT,
      updated_at TEXT
    );
  `);

    return { db: dbInstance, path: sqliteDbPath };
}

export async function readStoreState(id = "main"): Promise<SQLiteStoreStateResult> {
    const { db, path: dbPath } = await getSQLiteDatabase();
    const safeId = id.replace(/'/g, "''");
    const result = db.exec(`SELECT json_data FROM store_state WHERE id = '${safeId}'`);

    if (result && result.length > 0 && result[0].values.length > 0) {
        const jsonStr = result[0].values[0][0] as string;
        return { status: "success", data: JSON.parse(jsonStr), dbPath };
    }

    return { status: "empty", dbPath };
}

export async function saveStoreState(state: unknown, id = "main"): Promise<SQLiteStoreStateResult> {
    const { db, path: dbPath } = await getSQLiteDatabase();
    const jsonStr = JSON.stringify(state);
    const now = new Date().toISOString();

    const stmt = db.prepare(`
    INSERT INTO store_state (id, json_data, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      json_data = excluded.json_data,
      updated_at = excluded.updated_at
  `);
    stmt.bind([id, jsonStr, now]);
    stmt.step();
    stmt.free();

    const binaryArray = db.export();
    fs.writeFileSync(dbPath, Buffer.from(binaryArray));

    return { status: "success", timestamp: now, sizeBytes: binaryArray.length, dbPath };
}

export function resetSQLiteCacheForTests() {
    dbInstance = null;
    sqliteDbPath = "";
}
