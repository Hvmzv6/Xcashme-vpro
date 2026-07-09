import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { createServerApp } from "../../server/app.ts";
import { buildMockAssistantReply } from "../../server/services/assistant.ts";
import { resetSQLiteCacheForTests } from "../../server/services/sqlite.ts";
import { buildSyncResponse, resetSyncStateForTests } from "../../server/services/sync.ts";
import { buildThermalReceiptBuffer } from "../../server/services/thermalPrint.ts";

const tempDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "xcashme-vpro-tests-"));
process.env.USER_DATA_PATH = tempDataDir;

test.beforeEach(() => {
    resetSyncStateForTests();
    resetSQLiteCacheForTests();
});

async function withServer(run: (baseUrl: string) => Promise<void>) {
    const app = createServerApp();
    const server = app.listen(0);

    await new Promise<void>((resolve) => server.once("listening", () => resolve()));
    const address = server.address();
    if (!address || typeof address === "string") {
        server.close();
        throw new Error("Test server did not expose a port");
    }

    const baseUrl = `http://127.0.0.1:${address.port}`;

    try {
        await run(baseUrl);
    } finally {
        await new Promise<void>((resolve) => server.close(() => resolve()));
    }
}

test("buildMockAssistantReply suggests a discount action", () => {
    const reply = buildMockAssistantReply([
        { role: "user", content: "Apply a 10% discount please" }
    ]);

    assert.equal(reply.suggestedAction?.type, "APPLY_DISCOUNT");
    assert.equal(reply.suggestedAction?.payload.percent, 10);
});

test("buildMockAssistantReply suggests a demo product action", () => {
    const reply = buildMockAssistantReply([
        { role: "user", content: "Add product demo" }
    ]);

    assert.equal(reply.suggestedAction?.type, "ADD_PRODUCT_DEMO");
    assert.equal(reply.content.includes("إضافة منتج جديد بسرعة"), true);
});

test("buildSyncResponse is idempotent for the same requestId", () => {
    const first = buildSyncResponse({ actionType: "SALE", requestId: "req-1", timestamp: new Date().toISOString() });
    const second = buildSyncResponse({ actionType: "SALE", requestId: "req-1", timestamp: new Date().toISOString() });

    assert.equal(first.status, "success");
    assert.equal(second.duplicate, true);
});

test("buildSyncResponse returns retryable conflict metadata", () => {
    const response = buildSyncResponse({
        actionType: "SALE",
        requestId: "req-conflict",
        retryCount: 2,
        payload: { conflict: true }
    });

    assert.equal(response.status, "conflict");
    assert.equal(response.retryable, true);
    assert.equal(response.retryAfterMs, 6000);
});

test("/api/sync processes queued actions and /api/db/save and /api/db/load round-trip state", async () => {
    await withServer(async (baseUrl) => {
        const syncRes = await fetch(`${baseUrl}/api/sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                actionType: "SALE",
                requestId: "route-sync-1",
                timestamp: new Date().toISOString(),
                payload: { invoiceNumber: "INV-2001" }
            })
        });

        const syncData = await syncRes.json();
        assert.equal(syncRes.status, 200);
        assert.equal(syncData.status, "success");
        assert.equal(syncData.syncedAction, "SALE");

        const saveRes = await fetch(`${baseUrl}/api/db/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                state: {
                    products: [{ id: "p-1", name: "Water", stockQuantity: 12 }],
                    currentUser: { id: "u-1" },
                    activeBranchId: "branch-riyadh"
                }
            })
        });

        const saveData = await saveRes.json();
        assert.equal(saveRes.status, 200);
        assert.equal(saveData.status, "success");

        const loadRes = await fetch(`${baseUrl}/api/db/load`);
        const loadData = await loadRes.json();
        assert.equal(loadRes.status, 200);
        assert.equal(loadData.status, "success");
        assert.equal(loadData.data.products[0].name, "Water");
    });
});

test("buildThermalReceiptBuffer includes the invoice and total lines", () => {
    const buffer = buildThermalReceiptBuffer({
        invoiceNumber: "INV-1001",
        timestamp: "2026-07-07T12:00:00Z",
        items: [{ product: { name: "Water", retailPrice: 1.5 }, quantity: 2 }],
        total: 3
    });

    const text = buffer.toString("latin1");
    assert.equal(text.includes("INV-1001"), true);
    assert.equal(text.includes("TOTAL: 3 SAR"), true);
});
