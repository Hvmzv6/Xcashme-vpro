/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AlertTriangle, Layers, Box, Plus } from "lucide-react";
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
            <h2 className="font-bold text-base">{isAr ? "قائمة رصيد المنتجات" : "Product Inventory List"}</h2>
            <span className={`text-xs ${styles.textSecondary} font-mono`}>{filteredProducts.length} {isAr ? "منتجات" : "items"}</span>
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
    </div>
  );
};
