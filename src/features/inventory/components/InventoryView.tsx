/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AlertTriangle, Layers, Box, Plus, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Download, X } from "lucide-react";
import { Product, POSState } from "../../../types/pos";

interface InventoryViewProps {
  state: POSState;
  t: any;
  styles: any;
  isAr: boolean;
  isDark: boolean;
  addProduct: (product: any) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  triggerToast: (msg: string) => void;
  filteredProducts: Product[];
  lowStockProducts: Product[];
  totalStockVal: number;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  state,
  t,
  styles,
  isAr,
  isDark,
  addProduct,
  updateProduct,
  deleteProduct,
  triggerToast,
  filteredProducts,
  lowStockProducts,
  totalStockVal
}) => {
  // Keep form state local for cleaner modular separation
  const [newProd, setNewProd] = useState({
    barcode: "",
    name: "",
    category: state.categories[0]?.name || "",
    costPrice: 0,
    retailPrice: 0,
    wholesalePrice: 0,
    superWholesalePrice: 0,
    stockQuantity: 100,
    minStockAlert: 10,
    hasExpiry: false,
    expiryDate: "",
    serialNumber: ""
  });

  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvRecords, setCsvRecords] = useState<{ valid: boolean; errors: string[]; data: any }[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r\n|\n/).map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length <= 1) {
        triggerToast(isAr ? "الملف فارغ أو لا يحتوي على بيانات أزيل من العنوان" : "CSV file is empty or contains only headers");
        return;
      }

      // Detect separator (, or ; or \t)
      const headerLine = lines[0];
      const separator = headerLine.includes(";") ? ";" : headerLine.includes("\t") ? "\t" : ",";
      const headers = headerLine.split(separator).map(h => h.trim().replace(/^["']|["']$/g, "").toLowerCase());

      const parsed = lines.slice(1).map(line => {
        const values = line.split(separator).map(v => v.trim().replace(/^["']|["']$/g, ""));
        const rowData: any = {};
        headers.forEach((h, idx) => {
          rowData[h] = values[idx] || "";
        });

        const errors: string[] = [];
        const barcode = rowData["barcode"] || rowData["الباركود"] || "";
        const name = rowData["name"] || rowData["الاسم"] || rowData["productname"] || "";
        const category = rowData["category"] || rowData["التصنيف"] || state.categories[0]?.name || "General";
        const costPrice = parseFloat(rowData["costprice"] || rowData["cost"] || rowData["سعر التكلفة"] || "0");
        const retailPrice = parseFloat(rowData["retailprice"] || rowData["retail"] || rowData["سعر البيع"] || "0");
        const wholesalePrice = parseFloat(rowData["wholesaleprice"] || rowData["wholesale"] || rowData["سعر الجملة"] || "0");
        const superWholesalePrice = parseFloat(rowData["superwholesaleprice"] || rowData["superwholesale"] || rowData["سعر سوبر جملة"] || "0");
        const stockQuantity = parseInt(rowData["stockquantity"] || rowData["stock"] || rowData["الكمية"] || "10", 10);
        const minStockAlert = parseInt(rowData["minstockalert"] || rowData["minalert"] || rowData["حد التنبيه"] || "5", 10);

        if (!barcode) errors.push(isAr ? "الباركود مفقود" : "Missing Barcode");
        if (!name) errors.push(isAr ? "اسم المنتج مفقود" : "Missing Name");
        if (isNaN(costPrice) || costPrice < 0) errors.push(isAr ? "سعر التكلفة غير صالح" : "Invalid Cost");
        if (isNaN(retailPrice) || retailPrice < 0) errors.push(isAr ? "سعر البيع غير صالح" : "Invalid Retail Price");
        if (isNaN(stockQuantity)) errors.push(isAr ? "الكمية غير صالحة" : "Invalid Stock Quantity");

        return {
          valid: errors.length === 0,
          errors,
          data: {
            barcode,
            name,
            category,
            costPrice: isNaN(costPrice) ? 0 : costPrice,
            retailPrice: isNaN(retailPrice) ? 0 : retailPrice,
            wholesalePrice: isNaN(wholesalePrice) ? 0 : wholesalePrice,
            superWholesalePrice: isNaN(superWholesalePrice) ? 0 : superWholesalePrice,
            stockQuantity: isNaN(stockQuantity) ? 0 : stockQuantity,
            minStockAlert: isNaN(minStockAlert) ? 5 : minStockAlert
          }
        };
      });

      setCsvRecords(parsed);
    };
    reader.readAsText(file);
  };

  const downloadSampleCsv = () => {
    const csvContent = "barcode,name,category,costPrice,retailPrice,wholesalePrice,superWholesalePrice,stockQuantity,minStockAlert\n" +
      "84392011001,Organic Fresh Milk 1L,Dairy,1.20,1.80,1.50,1.40,50,5\n" +
      "84392011002,Whole Grain Bread 500g,Bakery,0.80,1.50,1.20,1.10,30,5\n" +
      "84392011003,Arabic Roasted Coffee 250g,Beverages,3.50,5.00,4.50,4.20,20,3";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "sample_products.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkImport = () => {
    const validRows = csvRecords.filter(r => r.valid);
    if (validRows.length === 0) return;
    validRows.forEach(row => {
      addProduct(row.data);
    });
    triggerToast(isAr ? `تم استيراد ${validRows.length} منتج بنجاح في رصيد المخزن` : `Successfully imported ${validRows.length} products`);
    setCsvRecords([]);
    setShowCsvModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Stock Metrics summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className={`${styles.card} p-5 rounded-2xl flex items-center justify-between`}>
          <div>
            <p className={`text-xs ${styles.textSecondary} font-medium mb-1`}>{t.alertLowStock}</p>
            <h3 className="text-2xl font-bold text-amber-500">{lowStockProducts.length}</h3>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className={`${styles.card} p-5 rounded-2xl flex items-center justify-between`}>
          <div>
            <p className={`text-xs ${styles.textSecondary} font-medium mb-1`}>{t.totalStockValue}</p>
            <h3 className="text-2xl font-bold text-indigo-500">{totalStockVal.toFixed(2)} $</h3>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className={`${styles.card} p-5 rounded-2xl flex items-center justify-between`}>
          <div>
            <p className={`text-xs ${styles.textSecondary} font-medium mb-1`}>{isAr ? "أنواع وتصنيفات المنتجات" : "Categories Count"}</p>
            <h3 className="text-2xl font-bold text-emerald-500">{state.categories.length}</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
            <Box className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Add New Product Form */}
        <div className={`${styles.card} p-5 rounded-2xl space-y-4 h-fit`}>
          <h2 className={`font-bold text-base border-b ${styles.wellBorder} pb-2.5 flex items-center gap-2`}>
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>{t.addNewProduct}</span>
          </h2>

          <div className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`text-xs ${styles.textSecondary} block mb-1`}>{t.productName}</label>
                <input
                  type="text"
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  className={`w-full ${styles.inputSecondary} rounded-lg px-3 py-2`}
                />
              </div>
              <div>
                <label className={`text-xs ${styles.textSecondary} block mb-1`}>{t.productBarcode}</label>
                <input
                  type="text"
                  value={newProd.barcode}
                  onChange={(e) => setNewProd({ ...newProd, barcode: e.target.value })}
                  className={`w-full ${styles.inputSecondary} rounded-lg px-3 py-2 font-mono`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`text-xs ${styles.textSecondary} block mb-1`}>{t.productCategory}</label>
                <select
                  value={newProd.category}
                  onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                  className={`w-full ${styles.inputSecondary} rounded-lg px-3 py-2`}
                >
                  {state.categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`text-xs ${styles.textSecondary} block mb-1`}>{t.serialNumber}</label>
                <input
                  type="text"
                  placeholder="e.g. SN-9821"
                  value={newProd.serialNumber}
                  onChange={(e) => setNewProd({ ...newProd, serialNumber: e.target.value })}
                  className={`w-full ${styles.inputSecondary} rounded-lg px-3 py-2 font-mono`}
                />
              </div>
            </div>

            <div className={`grid grid-cols-2 gap-3 border-t ${styles.wellBorder} pt-2`}>
              <div>
                <label className={`text-xs ${styles.textSecondary} block mb-1`}>{t.cost}</label>
                <input
                  type="number"
                  value={newProd.costPrice}
                  onChange={(e) => setNewProd({ ...newProd, costPrice: Number(e.target.value) })}
                  className={`w-full ${styles.inputSecondary} rounded-lg px-3 py-2 font-mono`}
                />
              </div>
              <div>
                <label className={`text-xs ${styles.textSecondary} block mb-1`}>{t.retail}</label>
                <input
                  type="number"
                  value={newProd.retailPrice}
                  onChange={(e) => setNewProd({ ...newProd, retailPrice: Number(e.target.value) })}
                  className={`w-full ${styles.inputSecondary} rounded-lg px-3 py-2 font-mono`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`text-xs ${styles.textSecondary} block mb-1`}>{t.wholesale}</label>
                <input
                  type="number"
                  value={newProd.wholesalePrice}
                  onChange={(e) => setNewProd({ ...newProd, wholesalePrice: Number(e.target.value) })}
                  className={`w-full ${styles.inputSecondary} rounded-lg px-3 py-2 font-mono`}
                />
              </div>
              <div>
                <label className={`text-xs ${styles.textSecondary} block mb-1`}>{t.superWholesale}</label>
                <input
                  type="number"
                  value={newProd.superWholesalePrice}
                  onChange={(e) => setNewProd({ ...newProd, superWholesalePrice: Number(e.target.value) })}
                  className={`w-full ${styles.inputSecondary} rounded-lg px-3 py-2 font-mono`}
                />
              </div>
            </div>

            <div className={`grid grid-cols-2 gap-3 border-t ${styles.wellBorder} pt-2`}>
              <div>
                <label className={`text-xs ${styles.textSecondary} block mb-1`}>{t.stock}</label>
                <input
                  type="number"
                  value={newProd.stockQuantity}
                  onChange={(e) => setNewProd({ ...newProd, stockQuantity: Number(e.target.value) })}
                  className={`w-full ${styles.inputSecondary} rounded-lg px-3 py-2 font-mono`}
                />
              </div>
              <div>
                <label className={`text-xs ${styles.textSecondary} block mb-1`}>{t.minAlert}</label>
                <input
                  type="number"
                  value={newProd.minStockAlert}
                  onChange={(e) => setNewProd({ ...newProd, minStockAlert: Number(e.target.value) })}
                  className={`w-full ${styles.inputSecondary} rounded-lg px-3 py-2 font-mono`}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                checked={newProd.hasExpiry}
                onChange={(e) => setNewProd({ ...newProd, hasExpiry: e.target.checked })}
                className={`rounded border ${styles.wellBorder} ${isDark ? "bg-slate-950 text-indigo-500" : "bg-white text-indigo-600"} focus:ring-indigo-500 w-4 h-4 cursor-pointer`}
              />
              <label className={`font-medium ${styles.textPrimary} cursor-pointer select-none`}>{t.hasExpiry}</label>
            </div>

            {newProd.hasExpiry && (
              <div>
                <label className={`text-xs ${styles.textSecondary} block mb-1`}>{t.expiryDate}</label>
                <input
                  type="date"
                  value={newProd.expiryDate}
                  onChange={(e) => setNewProd({ ...newProd, expiryDate: e.target.value })}
                  className={`w-full ${styles.inputSecondary} rounded-lg px-3 py-2 font-mono`}
                />
              </div>
            )}

            <button
              onClick={() => {
                if (!newProd.name || !newProd.barcode) {
                  triggerToast(isAr ? "الرجاء إدخال اسم المنتج والباركود!" : "Please fill required fields!");
                  return;
                }
                addProduct(newProd);
                setNewProd({
                  barcode: "",
                  name: "",
                  category: state.categories[0]?.name || "",
                  costPrice: 0,
                  retailPrice: 0,
                  wholesalePrice: 0,
                  superWholesalePrice: 0,
                  stockQuantity: 100,
                  minStockAlert: 10,
                  hasExpiry: false,
                  expiryDate: "",
                  serialNumber: ""
                });
                triggerToast(isAr ? "تم تسجيل المنتج في المخازن" : "Product registered successfully");
              }}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-lg transition-colors cursor-pointer text-slate-100"
            >
              {t.save}
            </button>
          </div>
        </div>

        {/* Stock Inventory Master list */}
        <div className={`xl:col-span-2 ${styles.card} p-5 rounded-2xl`}>
          <div className={`flex items-center justify-between border-b ${styles.wellBorder} pb-3 mb-4`}>
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-base">{isAr ? "قائمة رصيد المنتجات" : "Product Inventory List"}</h2>
              <span className={`text-xs ${styles.textSecondary} font-mono`}>({filteredProducts.length} {isAr ? "منتج" : "items"})</span>
            </div>
            <button
              onClick={() => setShowCsvModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{isAr ? "استيراد من ملف CSV" : "Import CSV"}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b ${styles.wellBorder} ${styles.textSecondary} text-[11px] uppercase tracking-wider`}>
                  <th className="py-2.5 px-3">{t.productName}</th>
                  <th className="py-2.5 px-3 font-mono">{t.productBarcode}</th>
                  <th className="py-2.5 px-3">{t.stock}</th>
                  <th className="py-2.5 px-3 font-mono">{t.retail}</th>
                  <th className="py-2.5 px-3 font-mono">{t.wholesale}</th>
                  <th className="py-2.5 px-3 font-mono">{t.cost}</th>
                  <th className="py-2.5 px-3 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${styles.wellBorder}`}>
                {filteredProducts.map(p => {
                  const isLow = p.stockQuantity <= p.minStockAlert;
                  return (
                    <tr key={p.id} className={`hover:${styles.hoverBg} transition-colors`}>
                      <td className="py-3 px-3">
                        <span className={`font-semibold ${styles.textPrimary}`}>{p.name.split("-")[0]}</span>
                        {p.serialNumber && <div className="text-[10px] text-indigo-500 font-mono">S/N: {p.serialNumber}</div>}
                      </td>
                      <td className={`py-3 px-3 font-mono ${styles.textSecondary}`}>{p.barcode}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold font-mono text-[11px] ${
                          isLow ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                        }`}>
                          {p.stockQuantity}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-indigo-500">{(p.retailPrice ?? 0).toFixed(2)} $</td>
                      <td className={`py-3 px-3 font-mono ${styles.textPrimary}`}>{(p.wholesalePrice ?? 0).toFixed(2)} $</td>
                      <td className={`py-3 px-3 font-mono ${styles.textSecondary}`}>{(p.costPrice ?? 0).toFixed(2)} $</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            const extra = prompt(isAr ? "أدخل الكمية الإضافية لتوريد المخزن:" : "Enter additional stock quantity to replenish:", "50");
                            if (extra) {
                              updateProduct(p.id, { stockQuantity: p.stockQuantity + Number(extra) });
                              triggerToast(isAr ? `تم تحديث رصيد ${p.name.split("-")[0]}` : `Replenished ${p.name.split("-")[0]}`);
                            }
                          }}
                          className="text-indigo-500 hover:text-indigo-400 mr-2 hover:underline text-[11px] font-medium"
                        >
                          {isAr ? "توريد" : "Replenish"}
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="text-rose-500 hover:text-rose-400 hover:underline text-[11px] font-medium"
                        >
                          {t.delete}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CSV Bulk Import Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`${styles.card} max-w-4xl w-full max-h-[85vh] rounded-2xl flex flex-col shadow-2xl border ${styles.wellBorder} overflow-hidden animate-in fade-in zoom-in duration-200`}>
            {/* Header */}
            <div className={`p-5 border-b ${styles.wellBorder} flex items-center justify-between`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-bold text-base ${styles.textPrimary}`}>{isAr ? "استيراد المنتجات جماعياً عبر ملف CSV" : "Bulk Product Import (CSV)"}</h3>
                  <p className={`text-xs ${styles.textSecondary}`}>{isAr ? "قم بتحميل ملف أكسل أو CSV لإضافة مئات الأصناف دفعة واحدة بأسعارها ورصيدها" : "Upload an Excel/CSV spreadsheet to add hundreds of items with pricing and stock"}</p>
                </div>
              </div>
              <button
                onClick={() => { setShowCsvModal(false); setCsvRecords([]); }}
                className={`p-1.5 rounded-lg hover:${styles.hoverBg} ${styles.textSecondary} transition-colors`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* Upload area & Template button */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="md:col-span-2">
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-emerald-500/40 hover:border-emerald-500 rounded-2xl p-6 cursor-pointer bg-emerald-500/5 hover:bg-emerald-500/10 transition-all text-center">
                    <Upload className="w-8 h-8 text-emerald-500 mb-2 animate-bounce" />
                    <span className={`font-bold text-sm ${styles.textPrimary}`}>{isAr ? "اختر ملف أو اسحبه إلى هنا (.CSV)" : "Select or Drop CSV File Here"}</span>
                    <span className={`text-[11px] ${styles.textSecondary} mt-1`}>{isAr ? "الأعمدة المطلوبة: barcode, name, costPrice, retailPrice, stockQuantity" : "Required columns: barcode, name, costPrice, retailPrice, stockQuantity"}</span>
                    <input type="file" accept=".csv, text/csv" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                <div className={`${styles.card} p-4 rounded-2xl border ${styles.wellBorder} flex flex-col justify-between h-full`}>
                  <div>
                    <h4 className={`font-bold text-xs ${styles.textPrimary} mb-1 flex items-center gap-1.5`}>
                      <Download className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{isAr ? "نموذج استرشادى" : "CSV Template Guide"}</span>
                    </h4>
                    <p className={`text-[11px] ${styles.textSecondary} leading-relaxed`}>
                      {isAr ? "حمّل نموذج الجدول الجاهز لتعبئته بالباركود والأسعار مباشرة لتجنب أخطاء التنسيق." : "Download the sample spreadsheet template to see proper headings and formatting."}
                    </p>
                  </div>
                  <button
                    onClick={downloadSampleCsv}
                    className="mt-3 w-full py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-500 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isAr ? "تحميل القالب النموذجي" : "Download Sample CSV"}</span>
                  </button>
                </div>
              </div>

              {/* Validation Preview Table */}
              {csvRecords.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-bold text-xs ${styles.textPrimary}`}>
                      {isAr ? "معاينة وفحص البيانات المستوردة" : "Data Validation Preview"} ({csvRecords.length} {isAr ? "صف" : "rows"})
                    </h4>
                    <div className="flex items-center gap-3 text-xs font-semibold">
                      <span className="text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {csvRecords.filter(r => r.valid).length} {isAr ? "صالح للاستيراد" : "Valid"}
                      </span>
                      <span className="text-rose-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {csvRecords.filter(r => !r.valid).length} {isAr ? "به أخطاء" : "Invalid"}
                      </span>
                    </div>
                  </div>

                  <div className="border border-slate-700/50 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead className="bg-slate-800/80 sticky top-0 text-slate-300">
                        <tr>
                          <th className="py-2 px-3">{isAr ? "الحالة" : "Status"}</th>
                          <th className="py-2 px-3 font-mono">{t.productBarcode}</th>
                          <th className="py-2 px-3">{t.productName}</th>
                          <th className="py-2 px-3">{t.productCategory}</th>
                          <th className="py-2 px-3">{t.cost}</th>
                          <th className="py-2 px-3">{t.retail}</th>
                          <th className="py-2 px-3">{t.stock}</th>
                          <th className="py-2 px-3">{isAr ? "ملاحظات الفحص" : "Validation Errors"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {csvRecords.map((r, idx) => (
                          <tr key={idx} className={r.valid ? "bg-emerald-500/5" : "bg-rose-500/10"}>
                            <td className="py-2 px-3">
                              {r.valid ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-rose-500" />
                              )}
                            </td>
                            <td className="py-2 px-3 font-mono font-bold">{r.data.barcode || "---"}</td>
                            <td className="py-2 px-3 font-semibold">{r.data.name || "---"}</td>
                            <td className="py-2 px-3">{r.data.category}</td>
                            <td className="py-2 px-3 font-mono">{r.data.costPrice} $</td>
                            <td className="py-2 px-3 font-mono text-indigo-400 font-bold">{r.data.retailPrice} $</td>
                            <td className="py-2 px-3 font-mono font-bold">{r.data.stockQuantity}</td>
                            <td className="py-2 px-3 text-rose-400 font-medium">{r.errors.join(", ")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className={`p-4 border-t ${styles.wellBorder} flex items-center justify-end gap-3 bg-slate-900/40`}>
              <button
                onClick={() => { setShowCsvModal(false); setCsvRecords([]); }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold ${styles.textSecondary} hover:${styles.hoverBg} transition-colors cursor-pointer`}
              >
                {t.cancel}
              </button>
              <button
                disabled={csvRecords.filter(r => r.valid).length === 0}
                onClick={handleBulkImport}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isAr 
                    ? `تأكيد استيراد (${csvRecords.filter(r => r.valid).length}) منتج صالح` 
                    : `Confirm Import (${csvRecords.filter(r => r.valid).length} Valid Products)`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
