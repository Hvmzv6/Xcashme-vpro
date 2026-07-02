/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Xcashme-vpro POS - Electron Preload Script
 * Exposes secure IPC channels to the React frontend renderer window.
 */

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // SQLite Database Operations via better-sqlite3
  getState: (key = 'main') => ipcRenderer.invoke('db-get-state', key),
  saveState: (state, key = 'main') => ipcRenderer.invoke('db-save-state', { key, state }),

  // Direct ESC/POS Thermal Receipt Printing
  printThermal: (options) => ipcRenderer.invoke('print-thermal', options),

  // Automatic Background Updater (electron-updater)
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  installUpdateNow: () => ipcRenderer.invoke('install-update-now'),
  onUpdateStatus: (callback) => {
    ipcRenderer.on('update-status', (event, data) => callback(data));
  },

  // Platform & Environment info
  isElectron: true,
  platform: process.platform
});
