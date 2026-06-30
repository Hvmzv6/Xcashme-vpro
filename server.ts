/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

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

// Branch Sync Simulation API
app.post("/api/sync", (req, res) => {
  const { branchId, localEvents } = req.body;
  console.log(`Received ${localEvents?.length || 0} events from branch: ${branchId}`);
  return res.json({
    status: "success",
    timestamp: new Date().toISOString(),
    globalSequence: Date.now()
  });
});

// Serve Vite Assets and SPAs
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Xcashme-vpro backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
