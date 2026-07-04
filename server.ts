/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import net from "net";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import initSqlJs from "sql.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily to avoid startup crashes if key is missing.
let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY is missing. AI features will run in mock simulation mode.");
      return null;
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

// Xcash Assistant API Endpoint
app.post("/api/gemini", async (req, res) => {
  const { messages, storeState } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages array." });
  }

  const ai = getAIClient();

  // If no API key, return a highly realistic simulated response
  if (!ai) {
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const lowerMessage = lastUserMessage.toLowerCase();

    let responseText = "مرحباً! أنا مساعد Xcash الذكي لمساعدتك في إدارة متجرك. (وضع محاكاة محلي)";
    let action = null;

    if (lowerMessage.includes("خصم") || lowerMessage.includes("discount")) {
      responseText = "لقد قمت بتحليل طلبك، يمكنني تطبيق خصم 10% على السلة الحالية. هل تؤكد هذا الإجراء؟";
      action = { type: "APPLY_DISCOUNT", payload: { percent: 10 } };
    } else if (lowerMessage.includes("منتج") || lowerMessage.includes("product") || lowerMessage.includes("إضافة")) {
      responseText = "يمكنني مساعدتك في إضافة منتج جديد بسرعة. لقد صممت نموذج منتج تجريبي باسم 'هاتف ذكي' بسعر 1200. هل ترغب في تأكيد الإضافة للمخزون؟";
      action = { type: "ADD_PRODUCT_DEMO", payload: { name: "هاتف ذكي - Smart Phone", retailPrice: 1200, category: "إلكترونيات / Electronics" } };
    } else if (lowerMessage.includes("تحليل") || lowerMessage.includes("تقرير") || lowerMessage.includes("report") || lowerMessage.includes("sales")) {
      const productCount = storeState?.products?.length || 0;
      const salesCount = storeState?.sales?.length || 0;
      responseText = `مرحباً حمزة، بناءً على البيانات المتوفرة: لديك ${productCount} منتجات في المخزون، و ${salesCount} فواتير بيع مسجلة. هناك منتج 'شوكولاتة داكنة' شارف على النفاد (الكمية الحالية: 12)، أقترح إعادة طلب كميات جديدة لتفادي انقطاع المبيعات!`;
    } else {
      responseText = "أنا جاهز لتحليل المخزون، أو تطبيق الخصومات، أو مراجعة أداء الفروع. جرب أن تطلب مني: 'حلل أداء المبيعات والمنتجات الناقصة' أو 'طبق خصم 10%'!";
    }

    return res.json({
      choices: [{
        message: {
          role: "assistant",
          content: responseText,
          suggestedAction: action
        }
      }]
    });
  }

  try {
    const systemInstruction = `
You are the "Xcash Assistant", an extremely powerful, professional Arabic/English AI manager embedded directly within the Xcashme-vpro POS desktop application.
You help programmers, business owners, and cashiers analyze store analytics, perform safe state operations, and answer store management queries.

Store State Metadata available to you:
- Products list count: ${storeState?.products?.length || 0}
- Current sales count: ${storeState?.sales?.length || 0}
- Active branch: ${storeState?.activeBranchId || "branch-riyadh"}
- Categories count: ${storeState?.categories?.length || 0}
- Total debts of customers: ${storeState?.customers?.reduce((acc: number, c: any) => acc + (c.debtAmount || 0), 0) || 0}
- Low stock items: ${JSON.stringify(storeState?.products?.filter((p: any) => p.stockQuantity <= p.minStockAlert).map((p: any) => ({ name: p.name, quantity: p.stockQuantity })) || [])}

Rules:
1. Always respond in the language of the user's query (Arabic preferred as per default store theme, but support English natively).
2. Keep your answer highly professional, concise, and focused on business value. Avoid technical/coding details unless explicitly asked.
3. If the user asks to perform an action (like apply a discount, add a test/demo product, or clear the cart), you can suggest a structural command action. Include a "suggestedAction" field in your JSON output.
4. Format your output as a valid JSON object matching this schema so the frontend can handle both the rich conversational content and executable state actions:
{
  "content": "Your rich text response goes here",
  "suggestedAction": { "type": "APPLY_DISCOUNT" | "ADD_PRODUCT_DEMO" | "NONE", "payload": any } | null
}
`;

    // Map messages array to Gemini SDK format
    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    // Call Gemini using the modern model alias gemini-2.5-flash
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.7
      }
    });

    const text = response.text;
    let parsedResult;
    try {
      parsedResult = JSON.parse(text || "{}");
    } catch {
      parsedResult = { content: text, suggestedAction: null };
    }

    return res.json({
      choices: [{
        message: {
          role: "assistant",
          content: parsedResult.content || "حدث خطأ في معالجة الرد.",
          suggestedAction: parsedResult.suggestedAction || null
        }
      }]
    });

  } catch (error: any) {
    console.error("Gemini API call failed:", error);
    return res.status(500).json({ error: "Failed to communicate with AI Assistant." });
  }
});

// Branch Sync Simulation & Offline Queue API
app.post("/api/sync", (req, res) => {
  const { branchId, localEvents, actionType, payload, timestamp } = req.body;
  if (actionType) {
    console.log(`[POS Server Sync] Processed offline queued action: [${actionType}] at ${timestamp}`);
  } else {
    console.log(`[POS Server Sync] Received batch sync (${localEvents?.length || 0} events) from branch: ${branchId || "Main"}`);
  }
  return res.json({
    status: "success",
    timestamp: new Date().toISOString(),
    syncedAction: actionType || "BATCH",
    globalSequence: Date.now()
  });
});

// SQLite Database Persistence Engine (Desktop %APPDATA% or ./data)
let dbInstance: any = null;
let sqliteDbPath = "";

async function getSQLiteDatabase() {
  if (dbInstance) return { db: dbInstance, path: sqliteDbPath };
  
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

// Load state from local SQLite
app.get("/api/db/load", async (req, res) => {
  try {
    const { db, path: dbPath } = await getSQLiteDatabase();
    const result = db.exec("SELECT json_data FROM store_state WHERE id = 'main'");
    if (result && result.length > 0 && result[0].values.length > 0) {
      const jsonStr = result[0].values[0][0] as string;
      return res.json({ status: "success", data: JSON.parse(jsonStr), dbPath });
    }
    return res.json({ status: "empty", dbPath });
  } catch (error: any) {
    console.error("Error loading SQLite DB:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
});

// Save state to local SQLite
app.post("/api/db/save", async (req, res) => {
  try {
    const { state } = req.body;
    if (!state) return res.status(400).json({ error: "Missing state payload" });
    
    const { db, path: dbPath } = await getSQLiteDatabase();
    const jsonStr = JSON.stringify(state);
    const now = new Date().toISOString();
    
    db.run("INSERT OR REPLACE INTO store_state (id, json_data, updated_at) VALUES (?, ?, ?)", [
      "main",
      jsonStr,
      now
    ]);
    
    const binaryArray = db.export();
    fs.writeFileSync(dbPath, Buffer.from(binaryArray));
    
    return res.json({ status: "success", timestamp: now, sizeBytes: binaryArray.length, dbPath });
  } catch (error: any) {
    console.error("Error saving SQLite DB:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
});

// Direct ESC/POS Thermal Receipt Printing API
app.post("/api/print/thermal", async (req, res) => {
  try {
    const { receipt, printerType = "simulated", printerAddress = "192.168.1.100:9100", paperSize = "80mm" } = req.body;
    if (!receipt) return res.status(400).json({ error: "No receipt payload provided" });
    
    const ESC = 0x1B;
    const GS = 0x1D;
    const LF = 0x0A;
    
    const buffer: number[] = [
      ESC, 0x40,
      ESC, 0x61, 0x01,
      ESC, 0x45, 0x01,
    ];
    
    const storeHeader = `Xcashme-vpro POS (${paperSize})\r\n`;
    for (let i = 0; i < storeHeader.length; i++) buffer.push(storeHeader.charCodeAt(i));
    buffer.push(ESC, 0x45, 0x00);
    
    const lineStr = "--------------------------------\r\n";
    for (let i = 0; i < lineStr.length; i++) buffer.push(lineStr.charCodeAt(i));
    
    buffer.push(ESC, 0x61, 0x00);
    const invLine = `Invoice: #${receipt.invoiceNumber || "INV-000"}\r\nDate: ${receipt.timestamp || new Date().toLocaleString()}\r\n`;
    for (let i = 0; i < invLine.length; i++) buffer.push(invLine.charCodeAt(i));
    for (let i = 0; i < lineStr.length; i++) buffer.push(lineStr.charCodeAt(i));
    
    if (receipt.items && Array.isArray(receipt.items)) {
      receipt.items.forEach((item: any) => {
        const itemLine = `${item.product?.name || "Item"} x${item.quantity}  ${(item.product?.retailPrice || 0) * item.quantity} SAR\r\n`;
        for (let i = 0; i < itemLine.length; i++) buffer.push(itemLine.charCodeAt(i));
      });
    }
    
    for (let i = 0; i < lineStr.length; i++) buffer.push(lineStr.charCodeAt(i));
    
    buffer.push(ESC, 0x45, 0x01);
    const totalLine = `TOTAL: ${receipt.total || 0} SAR\r\n`;
    for (let i = 0; i < totalLine.length; i++) buffer.push(totalLine.charCodeAt(i));
    buffer.push(ESC, 0x45, 0x00);
    
    buffer.push(LF, LF, LF);
    buffer.push(GS, 0x56, 0x41, 0x03);
    
    const finalBuffer = Buffer.from(buffer);
    
    if (printerType === "network") {
      const [host, portStr] = printerAddress.split(":");
      const port = parseInt(portStr || "9100", 10);
      
      const client = new net.Socket();
      client.connect(port, host, () => {
        client.write(finalBuffer, () => {
          client.destroy();
        });
      });
      
      client.on("error", (err) => {
        console.error("ESC/POS Network Printer Error:", err);
      });
      
      return res.json({ status: "success", mode: "network", bytesSent: finalBuffer.length, target: `${host}:${port}` });
    }
    
    console.log(`[ESC/POS Thermal Print Simulated] Size: ${paperSize}, Bytes formatted: ${finalBuffer.length}`);
    return res.json({ status: "success", mode: "simulated", bytesFormatted: finalBuffer.length });
  } catch (error: any) {
    console.error("Thermal printing error:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
});

// Serve Vite Assets and SPAs
async function startServer() {
  const isProdOrCompiled = process.env.NODE_ENV === "production" || process.env.IS_ELECTRON === "true" || __filename.endsWith(".cjs") || __filename.endsWith(".js");
  const distPath = fs.existsSync(path.join(__dirname, "dist"))
    ? path.join(__dirname, "dist")
    : __dirname;
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
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Xcashme-vpro backend running on http://0.0.0.0:${PORT}`);
  });

  server.on("error", (err: any) => {
    console.error(`[POS Server] Server error on port ${PORT}:`, err.message);
  });
}

startServer();
