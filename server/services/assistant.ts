import { GoogleGenAI } from "@google/genai";

export interface AssistantMessage {
    role: "assistant" | "user";
    content: string;
}

export interface StoreStateSummary {
    products?: Array<{ name?: string; stockQuantity?: number; minStockAlert?: number }>;
    sales?: unknown[];
    activeBranchId?: string;
    categories?: unknown[];
    customers?: Array<{ debtAmount?: number }>;
}

export interface AssistantAction {
    type: "APPLY_DISCOUNT" | "ADD_PRODUCT_DEMO";
    payload: any;
}

export interface AssistantReply {
    content: string;
    suggestedAction: AssistantAction | null;
}

let aiClient: GoogleGenAI | null = null;

export function getAIClient() {
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

export function buildAssistantSystemInstruction(storeState: StoreStateSummary = {}): string {
    return `
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
  "suggestedAction": { "type": "APPLY_DISCOUNT" | "ADD_PRODUCT_DEMO" } | null
}
`;
}

export function buildMockAssistantReply(messages: AssistantMessage[], storeState?: StoreStateSummary): AssistantReply {
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const lowerMessage = lastUserMessage.toLowerCase();

    let responseText = "مرحباً! أنا مساعد Xcash الذكي لمساعدتك في إدارة متجرك. (وضع محاكاة محلي)";
    let suggestedAction: AssistantAction | null = null;

    if (lowerMessage.includes("خصم") || lowerMessage.includes("discount")) {
        responseText = "لقد قمت بتحليل طلبك، يمكنني تطبيق خصم 10% على السلة الحالية. هل تؤكد هذا الإجراء؟";
        suggestedAction = { type: "APPLY_DISCOUNT", payload: { percent: 10 } };
    } else if (lowerMessage.includes("منتج") || lowerMessage.includes("product") || lowerMessage.includes("إضافة")) {
        responseText = "يمكنني مساعدتك في إضافة منتج جديد بسرعة. لقد صممت نموذج منتج تجريبي باسم 'هاتف ذكي' بسعر 1200. هل ترغب في تأكيد الإضافة للمخزون؟";
        suggestedAction = {
            type: "ADD_PRODUCT_DEMO",
            payload: { name: "هاتف ذكي - Smart Phone", retailPrice: 1200, category: "إلكترونيات / Electronics" }
        };
    } else if (lowerMessage.includes("تحليل") || lowerMessage.includes("تقرير") || lowerMessage.includes("report") || lowerMessage.includes("sales")) {
        const productCount = storeState?.products?.length || 0;
        const salesCount = storeState?.sales?.length || 0;
        responseText = `مرحباً حمزة، بناءً على البيانات المتوفرة: لديك ${productCount} منتجات في المخزون، و ${salesCount} فواتير بيع مسجلة. هناك منتج 'شوكولاتة داكنة' شارف على النفاد (الكمية الحالية: 12)، أقترح إعادة طلب كميات جديدة لتفادي انقطاع المبيعات!`;
    } else {
        responseText = "أنا جاهز لتحليل المخزون، أو تطبيق الخصومات، أو مراجعة أداء الفروع. جرب أن تطلب مني: 'حلل أداء المبيعات والمنتجات الناقصة' أو 'طبق خصم 10%'!";
    }

    return {
        content: responseText,
        suggestedAction
    };
}

export async function generateAssistantReply(messages: AssistantMessage[], storeState?: StoreStateSummary): Promise<AssistantReply> {
    const ai = getAIClient();

    if (!ai) {
        return buildMockAssistantReply(messages, storeState);
    }

    const systemInstruction = buildAssistantSystemInstruction(storeState);
    const contents = messages.map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }]
    }));

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
    try {
        const parsedResult = JSON.parse(text || "{}");
        return {
            content: parsedResult.content || "حدث خطأ في معالجة الرد.",
            suggestedAction: parsedResult.suggestedAction || null
        };
    } catch {
        return {
            content: text || "حدث خطأ في معالجة الرد.",
            suggestedAction: null
        };
    }
}