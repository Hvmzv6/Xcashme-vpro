import fs from 'fs';
import path from 'path';

console.log("==========================================================");
console.log("🚀 STARTING XCASHME POS OFFLINE & PERSISTENCE TEST SUITE");
console.log("==========================================================\n");

let passed = 0;
let failed = 0;

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    if (details) console.log(`          └─ ${details}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${testName}`);
    if (details) console.error(`          └─ ${details}`);
    failed++;
  }
}

// 1. Verify PWA Manifest & Service Worker build artifacts
console.log("--- Test Group 1: PWA Static Assets Verification ---");
const manifestPath = path.resolve("dist/manifest.json");
const swPath = path.resolve("dist/sw.js");
const indexHtmlPath = path.resolve("dist/index.html");

assert(fs.existsSync(manifestPath), "dist/manifest.json exists");
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert(manifest.name === "Xcashme-vpro POS Cloud & Desktop" && manifest.display === "standalone",
    "manifest.json has correct standalone PWA configuration");
}

assert(fs.existsSync(swPath), "dist/sw.js exists");
if (fs.existsSync(swPath)) {
  const swContent = fs.readFileSync(swPath, 'utf8');
  assert(swContent.includes("xcashme-pos-v2-offline-cache") && swContent.includes("/api/"),
    "sw.js implements static asset cache & offline API interception");
}

if (fs.existsSync(indexHtmlPath)) {
  const htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
  assert(htmlContent.includes("manifest.json") && htmlContent.includes("theme-color"),
    "index.html references web app manifest and theme-color");
}

console.log("\n--- Test Group 2: Live Backend Sync & Persistence API Verification ---");

const SERVER_URL = "http://127.0.0.1:3000";

async function runApiTests() {
  try {
    // Test 1: Single offline queued action synchronization
    const salePayload = {
      actionType: "SALE",
      payload: { invoiceNumber: "INV-9999", total: 450, paymentMethod: "cash" },
      timestamp: new Date().toISOString()
    };
    
    const syncRes = await fetch(`${SERVER_URL}/api/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(salePayload)
    });
    
    const syncData = await syncRes.json();
    assert(syncRes.status === 200 && syncData.status === "success" && syncData.syncedAction === "SALE",
      "POST /api/sync processes queued offline action successfully", JSON.stringify(syncData));
      
    // Test 2: SQLite database save endpoint
    const savePayload = {
      state: {
        lastSync: new Date().toISOString(),
        testReceipt: "TEST_RECEIPT_OFFLINE"
      }
    };
    const saveRes = await fetch(`${SERVER_URL}/api/db/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(savePayload)
    });
    const saveData = await saveRes.json();
    assert(saveRes.status === 200 && saveData.status === "success",
      "POST /api/db/save persists offline state backup to SQLite file", JSON.stringify(saveData));

    // Test 3: SQLite database load endpoint
    const loadRes = await fetch(`${SERVER_URL}/api/db/load`);
    const loadData = await loadRes.json();
    assert(loadRes.status === 200 && loadData.status === "success" && loadData.data?.testReceipt === "TEST_RECEIPT_OFFLINE",
      "GET /api/db/load loads saved state successfully");

  } catch (err) {
    assert(false, "API Communication error", err.message);
  }

  console.log("\n==========================================================");
  console.log(`📊 TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log("==========================================================");
  
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("✨ ALL OFFLINE & PERSISTENCE TESTS PASSED SUCCESSFULLY! ✨");
    process.exit(0);
  }
}

runApiTests();
