/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Xcashme-vpro POS - Main Electron Process Entry Point
 * Initializes native desktop window, embedded better-sqlite3 database connection,
 * and IPC handlers for direct ESC/POS thermal printing.
 */

import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import net from 'net';
import { fileURLToPath } from 'url';
import { fork } from 'child_process';
import Database from 'better-sqlite3';
import updaterPkg from 'electron-updater';

const { autoUpdater } = updaterPkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;
let backendProcess = null;
let db = null;
let dbPath = '';

const PORT = process.env.PORT || 3000;

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
  const serverPath = path.join(__dirname, '../dist/server.cjs');

  const env = {
    ...process.env,
    NODE_ENV: isPackaged ? 'production' : 'development',
    PORT: PORT.toString(),
    USER_DATA_PATH: app.getPath('userData')
  };

  if (fs.existsSync(serverPath)) {
    console.log(`[Electron POS] Spawning backend from: ${serverPath}`);
    backendProcess = fork(serverPath, [], { env, stdio: 'inherit' });
  } else {
    console.log('[Electron POS] Dev mode detected: Ensure dev server is running.');
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

  // Robust retry mechanism to wait for Express initialization
  const loadApp = (attempts = 1) => {
    if (!mainWindow) return;
    const targetUrl = `http://localhost:${PORT}`;
    mainWindow.loadURL(targetUrl).then(() => {
      console.log(`[Electron POS] Successfully loaded ${targetUrl}`);
      mainWindow.show();
    }).catch((err) => {
      if (attempts < 25) {
        console.warn(`[Electron POS] Server loading attempt ${attempts} failed (${err.message}). Retrying in 300ms...`);
        setTimeout(() => loadApp(attempts + 1), 300);
      } else {
        console.error(`[Electron POS] Failed to connect to local POS backend after ${attempts} attempts.`);
        mainWindow.show(); // Show window so user doesn't stay stuck
      }
    });
  };

  setTimeout(() => loadApp(1), 400);

  // Safety net: Ensure window always shows within 3.5 seconds
  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show();
    }
  }, 3500);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
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
