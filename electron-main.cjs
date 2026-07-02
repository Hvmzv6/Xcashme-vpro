/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Xcashme-vpro POS - Electron Desktop Entry Point
 */

const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { fork } = require('child_process');

let mainWindow = null;
let backendProcess = null;

const PORT = process.env.PORT || 3000;

function startBackendServer() {
  const isPackaged = app.isPackaged;
  
  // In production desktop app, run the bundled server.cjs
  // In dev mode, we can point to dist/server.cjs or use tsx
  const serverPath = isPackaged 
    ? path.join(__dirname, 'dist', 'server.cjs') 
    : path.join(__dirname, 'dist', 'server.cjs');

  const env = {
    ...process.env,
    NODE_ENV: isPackaged ? 'production' : 'development',
    PORT: PORT.toString(),
    USER_DATA_PATH: app.getPath('userData')
  };

  console.log(`[Electron] Booting POS backend server on port ${PORT}...`);
  console.log(`[Electron] SQLite DB Path: ${path.join(app.getPath('userData'), 'xcash_pos.sqlite')}`);

  backendProcess = fork(serverPath, [], {
    env,
    stdio: 'inherit'
  });

  backendProcess.on('error', (err) => {
    console.error('[Electron] Backend Process Error:', err);
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 868,
    minWidth: 1024,
    minHeight: 700,
    title: 'Xcashme-vpro POS Desktop',
    show: false, // Show gracefully when ready
    backgroundColor: '#0f172a', // Slate-900 background to prevent white flashes
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    }
  });

  // Remove default menu bar for POS kiosk feel (optional, can press Alt to show)
  mainWindow.setMenuBarVisibility(false);

  // Give backend 1.2s to initialize Express + static server before loading
  setTimeout(() => {
    if (mainWindow) {
      mainWindow.loadURL(`http://localhost:${PORT}`);
      mainWindow.once('ready-to-show', () => {
        mainWindow.show();
      });
    }
  }, 1200);

  // Open external web links (like Gemini documentation or support) in default OS browser
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

app.whenReady().then(() => {
  startBackendServer();
  createMainWindow();

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
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});
