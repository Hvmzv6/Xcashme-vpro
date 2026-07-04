/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Xcashme-vpro POS - Electron Desktop Entry Point
 */

const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { fork } = require('child_process');

let mainWindow = null;
let backendProcess = null;

const PORT = process.env.PORT || 3000;

function startBackendServer() {
  const env = {
    ...process.env,
    NODE_ENV: 'production',
    IS_ELECTRON: 'true',
    PORT: PORT.toString(),
    USER_DATA_PATH: app.getPath('userData')
  };

  const possiblePaths = [
    path.join(__dirname, 'dist', 'server.cjs'),
    path.join(__dirname, 'server.cjs'),
    path.join(process.resourcesPath || '', 'app.asar.unpacked/dist/server.cjs')
  ];

  let serverPath = possiblePaths.find(p => fs.existsSync(p));

  if (serverPath) {
    console.log(`[Electron] Loading standalone POS backend server directly inside main process: ${serverPath}`);
    try {
      require(serverPath);
      console.log('[Electron] Standalone backend server initialized successfully.');
    } catch (err) {
      console.error('[Electron] Direct require failed, attempting Electron-node fork:', err);
      try {
        backendProcess = fork(serverPath, [], {
          env: { ...env, ELECTRON_RUN_AS_NODE: '1' },
          execPath: process.execPath,
          stdio: 'inherit'
        });
      } catch (forkErr) {
        console.error('[Electron] Fork fallback also failed:', forkErr);
      }
    }
  } else {
    const tsServerPath = path.join(__dirname, 'server.ts');
    if (fs.existsSync(tsServerPath)) {
      console.log(`[Electron] Spawning source server.ts in dev mode...`);
      env.NODE_ENV = 'development';
      backendProcess = fork(tsServerPath, [], {
        execArgv: ['--import', 'tsx'],
        env,
        stdio: 'inherit'
      });
    } else {
      console.error('[Electron] Critical: Server entry point not found.');
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
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    }
  });

  mainWindow.setMenuBarVisibility(false);

  const loadApp = (attempts = 1) => {
    if (!mainWindow) return;
    const targetUrl = `http://localhost:${PORT}`;
    mainWindow.loadURL(targetUrl).then(() => {
      console.log(`[Electron POS] Successfully loaded ${targetUrl}`);
      mainWindow.show();
    }).catch((err) => {
      if (attempts < 35) {
        setTimeout(() => loadApp(attempts + 1), 200);
      } else {
        const indexPath = path.join(__dirname, 'dist', 'index.html');
        if (fs.existsSync(indexPath)) {
          mainWindow.loadFile(indexPath).then(() => mainWindow.show()).catch(() => mainWindow.show());
        } else {
          mainWindow.show();
        }
      }
    });
  };

  setTimeout(() => loadApp(1), 300);

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
