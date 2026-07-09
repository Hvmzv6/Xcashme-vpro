# Xcashme-vpro POS — Comprehensive User Manual & Setup Guide

**Xcashme-vpro POS** is an enterprise-grade, offline-first Point of Sale (POS) and Retail Management System tailored for modern stores, supermarkets, and wholesale businesses. It features dual-language support (**Arabic & English**), multi-tier wholesale pricing, smart barcode scanning, Google Gemini AI analytics, and robust standalone desktop execution via **Electron + Express + SQLite**.

---

## 🌟 1. Core Features Overview

### 🛒 Point of Sale (POS) & Cashier Checkout
* **Smart Barcode & Quick Search**: Scan EAN-13/UPC barcodes instantly or search items by name, category, or SKU.
* **Multi-Tier Price Engine**: Dynamically switch item pricing between **Retail (سعر قطاعي)**, **Wholesale (سعر جملة)**, and **Super Wholesale (سعر سوبر جملة)** directly at checkout.
* **Weighing Scale Integration**: Built-in precision support for weighted items (e.g., meat, produce, spices) formatted to 3 decimal places (0.000 kg).
* **Order Hold & Resume (Tabs)**: Park active carts during busy rushes and resume them instantly without losing customer selections.
* **Multi-Payment Split**: Accept split settlements combining **Cash**, **Credit Card/POS Terminal**, and **Customer Store Credit**.
* **Thermal Receipt Printing**: Instant 80mm/58mm thermal printer formatting with bilingual VAT breakdowns, QR codes, and custom store headers.

### 📦 Inventory Management & Bulk CSV Import
* **Real-Time Stock Ledgers**: Automatic deduction upon sale completion with instant restocking on returns.
* **Low Stock Alerts**: Color-coded visual badges highlighting items approaching minimum safety stock thresholds.
* **Bulk CSV Spreadsheet Import**:
  * **Interactive Validator**: Upload standard CSV spreadsheets (`barcode, name, category, costPrice, retailPrice, stockQuantity`) to import hundreds of items at once.
  * **Pre-flight Error Checking**: Highlights missing barcodes, negative values, or formatting typos before committing data to the store database.
  * **Built-in Sample Template**: Downloadable sample CSV file right inside the app interface.
* **Serial Number Tracking**: Assign serial codes for electronics and high-value warranty items.

### 👥 Partners (Customers & Suppliers Ledger)
* **Customer Debt & Credit Accounts**: Maintain ongoing customer accounts with credit limit caps and debt repayment tracking.
* **Loyalty Points Engine**: Automatically reward frequent shoppers with points that can be redeemed as checkout discounts.
* **Supplier Billing**: Track purchase orders, supplier dues, and supplier contact histories.

### 💼 Payroll & Staff HR Management
* **Cashier & Operator Roles**: Role-based access guards (`Administrator`, `Manager`, `Cashier`) protecting sensitive reports and wholesale pricing toggles.
* **Shift Management**: Track cashier opening cash drawer balances, shift end totals, and cash variances.
* **Salaries & Advances**: Manage employee base salaries, advance loans, bonuses, and operational store expenses.

### 📈 Financial Reports & Analytics
* **Live Profit & Loss Dashboard**: Calculate gross revenue, net profit margins, and cost of goods sold (COGS) in real time.
* **Tax & VAT Summaries**: Automated compliance summaries for tax reporting.
* **Top Performing Categories**: Visual charts powered by Recharts identifying best-selling inventory categories.

### 🤖 Google Gemini AI Executive Assistant
* **AI Sales Insights**: Ask natural questions (*"What products should I restock before the weekend?"* or *"Summarize today's profit margin"*).
* **Smart Restock Suggestions**: AI-driven predictive order quantities based on historical sales velocity.

---

## 🚀 2. Setup & Installation Instructions

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **Git**: For cloning the codebase
* **Operating System**: Windows 10/11 (recommended for desktop cashier terminals), macOS, or Linux.

### Option A: Running in Web Development Mode (Cloud / Browser)
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-org/xcashme-vpro-pos.git
   cd xcashme-vpro-pos
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and insert your Gemini API Key if using AI features:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key_here
   PORT=3000
   ```
4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   *Open your browser and navigate to `http://localhost:3000`.*

---

### Option B: Building the Standalone Desktop Installer (.exe)
Xcashme-vpro POS embeds a self-contained Node Express backend and local SQLite engine directly inside Electron, ensuring **100% offline reliability** during internet outages.

1. **Build the Full-Stack Application**:
   ```bash
   npm run electron:build
   ```
2. **Locate the Installer**:
   Once finished, navigate to the `/dist-electron` directory. You will find:
   * `Xcashme-vpro POS Setup 1.0.0.exe` (Standard Windows Step-by-Step Wizard Installer)
   * `win-unpacked/` (Portable standalone folder)

3. **Install on Cashier Terminal**:
   Run the `.exe` installer. It creates desktop shortcuts and installs the bundled database server seamlessly without requiring Python, MySQL, or Node.js pre-installed on the cashier's computer.

---

## 📖 3. Step-by-Step User Guide

### Step 1: Selecting Store Language & Theme
* Look at the top navigation bar. Click the **AR / EN** toggle button to instantly switch the interface between **Arabic RTL (يمين إلى يسار)** and **English LTR**.
* Click the **Sun / Moon** icon to toggle between clean daylight high-contrast mode and eye-safe twilight dark mode.

### Step 2: Ringing Up a Customer Sale
1. Navigate to the **POS (نقطة البيع)** screen.
2. **Scan Item**: Point your USB/Bluetooth barcode scanner at the product. The item instantly pops into the right-hand cart.
3. **Manual Search**: Or type the product name/SKU into the search bar at the top of the item grid.
4. **Select Wholesale Tier**: If selling in bulk, click the price tier pill (`Retail`, `Wholesale`, `Super Wholesale`) inside the cart row to apply bulk discounts.
5. **Adjust Quantities**: Click `+` / `-` or enter exact decimal weights for produce (e.g., `1.450`).
6. **Checkout**:
   * Click **Pay / Complete Sale (إتمام الشراء)**.
   * Choose the payment method (**Cash نقدي**, **Card بطاقة**, or **Credit أجل**).
   * Enter the cash received; the app automatically calculates the **Change Due (الباقي)**.
   * A thermal receipt modal pops up ready for instant printing.

### Step 3: Bulk Importing Inventory via CSV
1. Click on **Inventory (المخزون)** in the main navigation bar.
2. Click the green **Import CSV (استيراد من ملف CSV)** button in the top right of the inventory list.
3. In the modal, click **Download Sample CSV (تحميل القالب النموذجي)** to save the pre-formatted Excel template to your computer.
4. Fill out your products in Excel using the exact column headings:
   `barcode, name, category, costPrice, retailPrice, wholesalePrice, superWholesalePrice, stockQuantity, minStockAlert`
5. Save as `.CSV` (UTF-8 encoded) and upload it into the import window.
6. Review the **Data Validation Preview**. Valid rows will display a green checkmark ✅. Fix any red validation errors ❌ in your file if highlighted.
7. Click **Confirm Import (تأكيد استيراد)** to commit all valid items to your store database immediately.

### Step 4: Managing Staff Shifts & Daily Closing
1. Go to **Staff & Payroll (شؤون الموظفين)**.
2. At the start of a shift, verify operator balances.
3. At the end of the day, navigate to **Reports (التقارير)** to review total cash drawers, gross tax collected, and inventory valuations.

---

---
*Built by HAMZUS .*
