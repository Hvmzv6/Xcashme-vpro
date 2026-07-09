/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Xcashme-vpro POS - Main Electron Process Entry Point
 * Initializes native desktop window, embedded better-sqlite3 database connection,
 * and IPC handlers for direct ESC/POS thermal printing.
 */

import Database from 'better-sqlite3';
import { fork } from 'child_process';
import { app, BrowserWindow, ipcMain } from 'electron';
import updaterPkg from 'electron-updater';
import fs from 'fs';
import { createRequire } from 'module';
import net from 'net';
import path from 'path';
import { fileURLToPath } from 'url';

const { autoUpdater } = updaterPkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

let mainWindow = null;
let backendProcess = null;
let db = null;
let dbPath = '';

const PORT = process.env.PORT || 3000;

function getLoadingPage() {
  const spinner = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Loading Xcashme-vpro POS</title>
        <style>
          :root {
            color-scheme: dark;
            --bg-1: #020617;
            --bg-2: #0f172a;
            --bg-3: #1e293b;
            --accent: #6366f1;
            --text: #e2e8f0;
            --muted: #94a3b8;
          }
          * { box-sizing: border-box; }
          html, body {
            width: 100%;
            height: 100%;
            margin: 0;
            font-family: Inter, Segoe UI, Arial, sans-serif;
            background:
              radial-gradient(circle at top, rgba(99, 102, 241, 0.24), transparent 40%),
              linear-gradient(160deg, var(--bg-1), var(--bg-2) 55%, var(--bg-3));
            color: var(--text);
            overflow: hidden;
          }
          .wrap {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
          }
          .card {
            width: min(460px, 100%);
            border: 1px solid rgba(148, 163, 184, 0.2);
            background: rgba(15, 23, 42, 0.72);
            backdrop-filter: blur(16px);
            border-radius: 24px;
            padding: 28px 26px;
            box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
            text-align: center;
          }
          .brand {
            font-size: 13px;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: var(--muted);
            margin-bottom: 16px;
          }
          .title {
            font-size: 24px;
            line-height: 1.2;
            margin: 0 0 10px;
          }
          .subtitle {
            margin: 0;
            color: var(--muted);
            font-size: 14px;
            line-height: 1.6;
          }
          .spinner {
            width: 52px;
            height: 52px;
            margin: 0 auto 20px;
            border-radius: 999px;
            border: 4px solid rgba(148, 163, 184, 0.2);
            border-top-color: var(--accent);
            animation: spin 0.9s linear infinite;
          }
          .dots {
            display: inline-flex;
            gap: 8px;
            margin-top: 18px;
          }
          .dots span {
            width: 8px;
            height: 8px;
            border-radius: 999px;
            background: var(--accent);
            opacity: 0.45;
            animation: pulse 1.2s infinite ease-in-out;
          }
          .dots span:nth-child(2) { animation-delay: 0.15s; }
          .dots span:nth-child(3) { animation-delay: 0.3s; }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes pulse {
            0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
            40% { transform: translateY(-4px); opacity: 1; }
          }
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="card">
            <div class="spinner"></div>
            <div class="brand">Xcashme-vpro POS</div>
            <h1 class="title">Starting the local backend</h1>
            <p class="subtitle">Preparing SQLite, sync services, and the desktop interface. The app will open automatically when ready.</p>
            <div class="dots" aria-hidden="true"><span></span><span></span><span></span></div>
          </div>
        </div>
      </body>
    </html>
  `;

  return `data:text/html;charset=utf-8,${encodeURIComponent(spinner)}`;
}

async function waitForBackendReady(maxAttempts = 60, delayMs = 250) {
  const targetUrl = `http://127.0.0.1:${PORT}/api/db/load`;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(targetUrl, { cache: 'no-store' });
      if (response.ok) {
        return true;
      }
    } catch (_) {
      // Keep retrying until the backend is listening.
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  return false;
}

// ==========================================
// 1. SQLite Database Setup (better-sqlite3)
// ==========================================
function initSQLiteDatabase() {
  try {
    const userDataDir = app.getPath('userData');
    if (!fs.existsSync(userDataDir)) {
      fs.mkdirSync(userDataDir, { recursive: true });
    }

    dbPath = path.join(userDataDir, 'xcash_pos_vpro.sqlite');
    console.log(`[Electron POS] Initializing better-sqlite3 database at: ${dbPath}`);

    db = new Database(dbPath, { verbose: console.log });
    
    // WAL (Write-Ahead Logging) improves concurrency and write performance
    db.pragma('journal_mode = WAL');

    // Create primary state store table
    db.exec(`
      CREATE TABLE IF NOT EXISTS pos_state (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create ESC/POS thermal print audit log table
    db.exec(`
      CREATE TABLE IF NOT EXISTS print_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT,
        printer_address TEXT,
        status TEXT,
        bytes_sent INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('[Electron POS] better-sqlite3 schema initialized successfully.');
  } catch (error) {
    console.error('[Electron POS] better-sqlite3 initialization error:', error);
  }
}

// ==========================================
// 2. Configure IPC Handlers
// ==========================================
function setupIpcHandlers() {
  // Load state from SQLite database
  ipcMain.handle('db-get-state', async (event, key = 'main') => {
    if (!db) {
      return { status: 'error', message: 'SQLite database not initialized or failed to open' };
    }
    try {
      const row = db.prepare('SELECT value FROM pos_state WHERE key = ?').get(key);
      if (row && row.value) {
        return { status: 'success', data: JSON.parse(row.value), dbPath };
      }
      return { status: 'empty', dbPath };
    } catch (error) {
      console.error('[IPC db-get-state Error]:', error);
      return { status: 'error', message: error.message };
    }
  });

  // Save state to SQLite database
  ipcMain.handle('db-save-state', async (event, { key = 'main', state }) => {
    if (!db) {
      return { status: 'error', message: 'SQLite database not initialized' };
    }
    try {
      const jsonStr = JSON.stringify(state);
      const stmt = db.prepare(`
        INSERT INTO pos_state (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
      `);
      stmt.run(key, jsonStr);
      return { status: 'success', timestamp: new Date().toISOString(), dbPath };
    } catch (error) {
      console.error('[IPC db-save-state Error]:', error);
      return { status: 'error', message: error.message };
    }
  });

  // Direct ESC/POS Thermal Receipt Printing IPC Handler
  ipcMain.handle('print-thermal', async (event, options = {}) => {
    const {
      receipt,
      printerType = 'network',
      printerAddress = '192.168.1.100:9100',
      paperSize = '80mm'
    } = options;

    if (!receipt) {
      return { status: 'error', message: 'No receipt payload provided' };
    }

    try {
      const ESC = 0x1B;
      const GS = 0x1D;
      const LF = 0x0A;

      // Construct ESC/POS command stream
      const buffer = [
        ESC, 0x40,           // Initialize printer
        ESC, 0x61, 0x01,     // Center align
        ESC, 0x45, 0x01      // Bold ON
      ];

      const appendStr = (str) => {
        for (let i = 0; i < str.length; i++) {
          buffer.push(str.charCodeAt(i));
        }
      };

      appendStr(`Xcashme-vpro POS (${paperSize})\r\n`);
      buffer.push(ESC, 0x45, 0x00); // Bold OFF
      appendStr('--------------------------------\r\n');

      buffer.push(ESC, 0x61, 0x00); // Left align
      appendStr(`Invoice: #${receipt.invoiceNumber || 'INV-000'}\r\n`);
      appendStr(`Date: ${receipt.timestamp || new Date().toLocaleString()}\r\n`);
      appendStr('--------------------------------\r\n');

      if (receipt.items && Array.isArray(receipt.items)) {
        receipt.items.forEach(item => {
          const name = item.product?.name || 'Item';
          const price = (item.product?.retailPrice || 0) * item.quantity;
          appendStr(`${name} x${item.quantity}  ${price.toFixed(2)} SAR\r\n`);
        });
      }
      appendStr('--------------------------------\r\n');

      buffer.push(ESC, 0x45, 0x01); // Bold ON
      appendStr(`TOTAL: ${receipt.total || 0} SAR\r\n`);
      buffer.push(ESC, 0x45, 0x00); // Bold OFF

      buffer.push(LF, LF, LF);
      buffer.push(GS, 0x56, 0x41, 0x03); // Auto-cutter command

      const finalBuffer = Buffer.from(buffer);

      // Record print attempt in SQLite log
      if (db) {
        try {
          db.prepare('INSERT INTO print_logs (invoice_number, printer_address, status, bytes_sent) VALUES (?, ?, ?, ?)')
            .run(receipt.invoiceNumber || 'N/A', printerAddress, printerType, finalBuffer.length);
        } catch (logErr) {
          console.warn('[Electron POS] Could not record print log:', logErr.message);
        }
      }

      if (printerType === 'network') {
        return new Promise((resolve) => {
          const [host, portStr] = printerAddress.split(':');
          const port = parseInt(portStr || '9100', 10);

          const client = new net.Socket();
          client.setTimeout(4500);

          client.connect(port, host, () => {
            client.write(finalBuffer, () => {
              client.destroy();
              resolve({
                status: 'success',
                mode: 'network',
                target: `${host}:${port}`,
                bytesSent: finalBuffer.length
              });
            });
          });

          client.on('timeout', () => {
            client.destroy();
            resolve({ status: 'error', message: `Timeout connecting to printer at ${host}:${port}` });
          });

          client.on('error', (err) => {
            client.destroy();
            resolve({ status: 'error', message: err.message });
          });
        });
      }

      console.log(`[ESC/POS Simulated Print] Successfully compiled ${finalBuffer.length} bytes for ${paperSize}.`);
      return { status: 'success', mode: 'simulated', bytesFormatted: finalBuffer.length };
    } catch (error) {
      console.error('[IPC print-thermal Error]:', error);
      return { status: 'error', message: error.message };
    }
  });

  // Auto-Updater IPC Handlers
  ipcMain.handle('check-for-updates', async () => {
    try {
      if (!app.isPackaged) {
        console.log('[Electron POS Updater] Running in development mode. Simulated update check.');
        return { status: 'dev-mode', message: 'Update checks only execute in packaged production builds.' };
      }
      const result = await autoUpdater.checkForUpdates();
      return { status: 'success', updateInfo: result?.updateInfo };
    } catch (err) {
      console.error('[Electron POS Updater] Check failed:', err);
      return { status: 'error', message: err.message };
    }
  });

  ipcMain.handle('install-update-now', () => {
    try {
      autoUpdater.quitAndInstall(false, true);
      return { status: 'installing' };
    } catch (err) {
      console.error('[Electron POS Updater] Install failed:', err);
      return { status: 'error', message: err.message };
    }
  });
}

// ==========================================
// 3. Auto Updater Setup (electron-updater)
// ==========================================
function initAutoUpdater() {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  const sendStatus = (status, payload = {}) => {
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('update-status', { status, ...payload });
    }
  };

  autoUpdater.on('checking-for-update', () => {
    console.log('[Electron POS Updater] Checking for background updates...');
    sendStatus('checking');
  });

  autoUpdater.on('update-available', (info) => {
    console.log(`[Electron POS Updater] Update available: v${info.version}`);
    sendStatus('available', { version: info.version, releaseNotes: info.releaseNotes });
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('[Electron POS Updater] Application is up to date.');
    sendStatus('up-to-date', { version: info?.version });
  });

  autoUpdater.on('error', (err) => {
    console.warn('[Electron POS Updater] Error in auto-updater:', err.message);
    sendStatus('error', { message: err.message });
  });

  autoUpdater.on('download-progress', (progressObj) => {
    sendStatus('downloading', {
      percent: Math.round(progressObj.percent),
      bytesPerSecond: progressObj.bytesPerSecond,
      transferred: progressObj.transferred,
      total: progressObj.total
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log(`[Electron POS Updater] Update downloaded v${info.version}. Ready to install on restart.`);
    sendStatus('downloaded', { version: info.version });
  });

  // Automatically initiate background check 3 seconds after app boots up
  setTimeout(() => {
    if (app.isPackaged) {
      autoUpdater.checkForUpdates().catch((err) => {
        console.warn('[Electron POS Updater] Initial check error:', err.message);
      });
    } else {
      console.log('[Electron POS Updater] Dev build detected: Skipping automatic release update pull.');
    }
  }, 3000);
}

// ==========================================
// 4. Start Express Backend & Electron Window
// ==========================================
function startBackendServer() {
  const isPackaged = app.isPackaged;
  
  process.env.NODE_ENV = 'production';
  process.env.IS_ELECTRON = 'true';
  process.env.PORT = PORT.toString();
  if (!process.env.USER_DATA_PATH) {
    process.env.USER_DATA_PATH = app.getPath('userData');
  }

  const possiblePaths = [
    path.join(__dirname, '../dist/server.cjs'),
    path.join(__dirname, 'dist/server.cjs'),
    path.join(process.resourcesPath || '', 'app.asar.unpacked/dist/server.cjs')
  ];

  let serverPath = possiblePaths.find(p => fs.existsSync(p));

  if (serverPath) {
    console.log(`[Electron POS] Loading backend Express server directly inside main process: ${serverPath}`);
    try {
      // Running inside Electron's main process ensures Electron's patched fs module
      // allows Express and res.sendFile to seamlessly serve static files out of app.asar/dist.
      require(serverPath);
      console.log('[Electron POS] Standalone backend server initialized successfully.');
    } catch (err) {
      console.error('[Electron POS] Direct require failed, attempting Electron-node fork:', err);
      try {
        backendProcess = fork(serverPath, [], {
          env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
          execPath: process.execPath,
          stdio: 'inherit'
        });
      } catch (forkErr) {
        console.error('[Electron POS] Fork fallback also failed:', forkErr);
      }
    }
  } else {
    const tsServerPath = path.join(__dirname, '../server.ts');
    if (fs.existsSync(tsServerPath)) {
      console.log(`[Electron POS] Compiled dist/server.cjs not found. Automatically spawning source server.ts via tsx...`);
      process.env.NODE_ENV = 'development';
      backendProcess = fork(tsServerPath, [], {
        execArgv: ['--import', 'tsx'],
        env: process.env,
        stdio: 'inherit'
      });
    } else {
      console.error('[Electron POS] Critical: Backend server entry point not found.');
    }
  }
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 868,
    minWidth: 1024,
    minHeight: 700,
    title: 'Xcashme-vpro POS Desktop',
    show: false,
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    }
  });

  mainWindow.setMenuBarVisibility(false);

  mainWindow.loadURL(getLoadingPage()).then(() => {
    mainWindow.show();
  }).catch(() => {
    mainWindow.show();
  });

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error(`[Electron POS] Failed to load ${validatedURL} (${errorCode}): ${errorDescription}`);
  });

  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    console.error('[Electron POS] Renderer process gone:', details);
  });

  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    console.log(`[Electron Renderer] [${level}] ${message} (${sourceId}:${line})`);
  });

  // Robust retry mechanism with local file fallback
  const loadApp = async () => {
    if (!mainWindow) return;

    const backendReady = await waitForBackendReady();
    if (!backendReady) {
      console.error('[Electron POS] Backend did not become ready in time. Falling back to local file load...');
    }

    const targetUrl = `http://localhost:${PORT}/?boot=${Date.now()}`;
    try {
      await mainWindow.loadURL(targetUrl);
      console.log(`[Electron POS] Successfully loaded ${targetUrl}`);
      mainWindow.show();
      return;
    } catch (err) {
      console.warn(`[Electron POS] HTTP load failed (${err.message}). Falling back to local file load...`);
    }

    const possibleIndexPaths = [
      path.join(__dirname, '../dist/index.html'),
      path.join(__dirname, 'dist/index.html')
    ];
    const indexPath = possibleIndexPaths.find(p => fs.existsSync(p));
    if (indexPath) {
      await mainWindow.loadFile(indexPath);
      console.log('[Electron POS] Successfully loaded index.html fallback.');
    }

    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show();
    }
  };

  setTimeout(() => {
    loadApp().catch((err) => {
      console.error('[Electron POS] Startup load failed:', err);
      if (mainWindow && !mainWindow.isVisible()) {
        mainWindow.show();
      }
    });
  }, 300);

  // Safety net: Ensure window always shows within 3.5 seconds
  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show();
    }
  }, 3500);

  mainWindow.once('ready-to-show', () => {
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ==========================================
// 4. Electron Application Lifecycle
// ==========================================
app.whenReady().then(() => {
  initSQLiteDatabase();
  setupIpcHandlers();
  startBackendServer();
  createMainWindow();
  initAutoUpdater();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  if (db) {
    try { db.close(); } catch (_) {}
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  if (db) {
    try { db.close(); } catch (_) {}
  }
});
