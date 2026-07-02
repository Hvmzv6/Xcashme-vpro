# Packaging & Running Xcashme-vpro as an Electron Desktop Application

We have fully added and configured **Electron** and **electron-builder** directly inside your workspace!

Because this application is a full-stack POS system (React + Express + Vite + AI features), we implemented the **Dual-Process Architecture**:
1. When launched, `electron-main.cjs` automatically boots your compiled backend server (`dist/server.cjs`) in the background.
2. Once the local backend is live, Electron spawns a dedicated, secure native window displaying your POS system without browser url bars or distraction.

---

## What Has Been Added & Ready to Use

1. **`electron-main.cjs`**  
   The main Electron entry file that controls lifecycle events, spawns the Express backend process, and opens the native application window.
2. **`package.json`**  
   - Installed `electron` and `electron-builder` packages.
   - Configured `"main": "electron-main.cjs"`.
   - Added automated npm scripts:
     - `npm run electron:dev`: Compiles full-stack assets and launches the app in Electron window locally.
     - `npm run electron:build`: Builds production assets and generates your native installer (`.exe` setup file on Windows, `.dmg` on Mac, `.AppImage` on Linux).

---

## How to Run & Build on Your Local Computer

### 1. Test Desktop App Locally
Open your terminal in the project directory and run:
```bash
npm run electron:dev
```
*This will bundle your code and launch the POS application inside an Electron desktop window.*

### 2. Generate Standalone Desktop Installer (`.exe` / `.dmg`)
When you are ready to distribute or install the app permanently on your cash registers, run:
```bash
npm run electron:build
```
*Once finished, look inside the generated `release/` folder in your project directory. You will find your production installer (`Xcashme-vpro POS Setup 1.0.0.exe`).*

---

## 🚀 Hardware & Desktop Integrations (Implemented!)

We have built and integrated all 3 major POS hardware features directly into the Electron & Express backend architecture:

### 1. Silent ESC/POS Thermal Receipt Printing (`/api/print/thermal`)
When a cashier completes a checkout and views the receipt modal, they can click **"طباعة حرارية ESC/POS"**.
* **How it works**: The React frontend sends the invoice payload and target Printer IP/Address (`192.168.1.100:9100`) to the Express backend endpoint `/api/print/thermal`.
* **Binary ESC/POS Formatting**: The backend compiles standard binary ESC/POS formatting codes (`0x1B 0x40` initialization, `0x1B 0x61 0x01` center alignment, bold headings, and `0x1D 0x56 0x41` auto-cutter command) tailored for 58mm or 80mm rolls.
* **Network & Local Printers**: Connects directly via TCP/IP (`net.Socket`) to Ethernet LAN thermal printers or USB virtual printer queues.

### 2. Global USB Keyboard Wedge Barcode Scanner (`useBarcodeScanner`)
Physical barcode scanners acting as USB keyboard wedges emit keystrokes at rapid speeds (< 40ms per character).
* **Global Scan Detection**: You no longer need to click inside the search input box before scanning an item!
* **How it works**: Our global hook (`useBarcodeScanner`) listens across the entire POS window. If it detects rapid character bursts terminated by `<Enter>`, it intercepts the code, looks up the product by barcode or serial number, immediately adds it to the cart, and displays a confirmation notification (`[مسح سريع] تم إضافة المنتج`).

### 3. Local SQLite File Database in OS AppData (`/api/db/load` & `/api/db/save`)
Instead of relying strictly on temporary browser `localStorage`, your POS state is permanently backed by an embedded SQLite database file on disk.
* **Storage Location**: When running inside Electron, the database file `xcash_pos.sqlite` is safely stored inside your operating system's dedicated user data folder (`%APPDATA%/Xcashme-vpro POS/xcash_pos.sqlite` on Windows or `~/Library/Application Support/...` on macOS).
* **Auto-Sync**: When the POS boots up, `usePOSState` pulls data from `/api/db/load`. Whenever any sale, inventory change, or partner transaction takes place, changes are saved instantly to the local SQLite database via `/api/db/save`.

### 4. Automatic Background Updates (`electron-updater`)
The application includes automatic background update checks via `electron-updater`:
* **Background Polling**: Upon launching the packaged application (`.exe` or `.dmg`), `autoUpdater` checks your release repository/server for newer versions.
* **Seamless Download**: Updates download silently in the background without interrupting cashier checkout operations.
* **IPC Channels**: Exposed via `window.electronAPI.checkForUpdates()`, `window.electronAPI.installUpdateNow()`, and `window.electronAPI.onUpdateStatus(cb)`.
* **Configuring Update Server**: To publish updates, add a `"publish"` configuration (such as GitHub Releases, AWS S3, or generic web server URL) inside the `"build"` section of your `package.json`.

