/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { Search, ShoppingCart, Trash2, Minus, Plus, Printer, AlertTriangle } from "lucide-react";
import { Product, CartItem, PaymentMethod, POSState } from "../../../types/pos";

interface POSViewProps {
  state: POSState;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  barcodeSuccess: boolean;
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  overallDiscount: number;
  setOverallDiscount: (discount: number) => void;
  handleBarcodeSubmit: (e: React.FormEvent) => void;
  addToCart: (prod: Product) => void;
  updateCartQty: (prodId: string, delta: number) => void;
  updateCartPriceType: (prodId: string, type: "retail" | "wholesale" | "superWholesale") => void;
  removeFromCart: (prodId: string) => void;
  handleSuspend: () => void;
  handleCheckout: () => void;
  t: any;
  styles: any;
  isAr: boolean;
  isDark: boolean;
  filteredProducts: Product[];
}

export const POSView: React.FC<POSViewProps> = ({
  state,
  cart,
  setCart,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  barcodeSuccess,
  selectedCustomerId,
  setSelectedCustomerId,
  paymentMethod,
  setPaymentMethod,
  overallDiscount,
  setOverallDiscount,
  handleBarcodeSubmit,
  addToCart,
  updateCartQty,
  updateCartPriceType,
  removeFromCart,
  handleSuspend,
  handleCheckout,
  t,
  styles,
  isAr,
  isDark,
  filteredProducts
}) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      
      {/* Products Grid Pane */}
      <div className="xl:col-span-7 space-y-4">
        
        {/* Fast Search & Category Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <form onSubmit={handleBarcodeSubmit} className="relative flex-1">
            <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <motion.input
              type="text"
              placeholder={t.searchBarcodePlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              animate={barcodeSuccess ? {
                borderColor: ["#1e293b", "#10b981", "#10b981", "#1e293b"],
                boxShadow: [
                  "0 0 0 0px rgba(16, 185, 129, 0)",
                  "0 0 0 6px rgba(16, 185, 129, 0.45)",
                  "0 0 0 6px rgba(16, 185, 129, 0.45)",
                  "0 0 0 0px rgba(16, 185, 129, 0)"
                ],
                scale: [1, 1.015, 1.015, 1]
              } : {}}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className={`w-full ${styles.input} rounded-xl py-3 pr-10 pl-4 text-sm focus:outline-none`}
            />
          </form>

          {/* Category Quick Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`${styles.input} rounded-xl px-4 py-3 text-sm focus:outline-none`}
          >
            <option value="all">{t.allCategories}</option>
            {state.categories.map(c => (
              <option key={c.id} value={c.name}>{c.name.split("/")[0]}</option>
            ))}
          </select>
        </div>

        {/* Products Grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredProducts.map(prod => {
            const isLow = prod.stockQuantity <= prod.minStockAlert;
            return (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => addToCart(prod)}
                key={prod.id}
                className={`p-4 rounded-xl cursor-pointer border transition-all ${
                  isLow 
                    ? (isDark ? "bg-amber-950/20 border-amber-500/30 hover:border-amber-500/60 text-amber-400" : "bg-amber-50 border-amber-200 hover:border-amber-400 text-amber-800") 
                    : `${styles.card} hover:border-indigo-500`
                }`}
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className={`text-xs ${styles.textSecondary} font-mono`}>{prod.category.split("/")[0]}</span>
                  {isLow && (
                    <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{prod.stockQuantity}</span>
                    </span>
                  )}
                </div>
                <h3 className={`font-semibold text-sm line-clamp-2 h-10 ${styles.textPrimary}`}>{prod.name.split("-")[0].trim()}</h3>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className={`text-xs ${styles.textSecondary}`}>{t.retail}:</span>
                  <span className="text-base font-bold text-indigo-500">{(prod.retailPrice ?? 0).toFixed(2)} $</span>
                </div>
                <div className={`mt-1 flex items-center justify-between text-[11px] ${styles.textSecondary}`}>
                  <span>{t.wholesale}: {(prod.wholesalePrice ?? 0).toFixed(2)}</span>
                  <span>{t.stock}: {prod.stockQuantity}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Cart Summary Pane */}
      <div className={`xl:col-span-5 ${styles.card} rounded-2xl p-4 flex flex-col h-full space-y-4`}>
        <div className={`flex items-center justify-between border-b ${styles.wellBorder} pb-3`}>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold text-base">{t.cart}</h2>
            <span className={`${styles.badgeActive} text-xs px-2 py-0.5 rounded-md font-bold`}>{cart.length}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSuspend}
              className={`text-xs font-medium px-2.5 py-1.5 rounded-lg ${styles.btnOutline}`}
            >
              {t.suspendCart}
            </button>
            <button
              onClick={() => setCart([])}
              className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-rose-950/40 hover:bg-rose-950/20 text-rose-500"
            >
              {t.clearCart}
            </button>
          </div>
        </div>

        {/* Cart Items list */}
        <div className="flex-1 overflow-y-auto max-h-[350px] space-y-3">
          {cart.length === 0 ? (
            <div className={`text-center py-12 ${styles.textTertiary} text-sm`}>
              {isAr ? "سلة المشتريات فارغة حالياً. اضغط على المنتجات لإضافتها!" : "Cart is currently empty. Click on products to add!"}
            </div>
          ) : (
            cart.map(item => {
              const itemPrice = (item.selectedPriceType === "retail"
                 ? item.product.retailPrice
                 : item.selectedPriceType === "wholesale"
                   ? item.product.wholesalePrice
                   : item.product.superWholesalePrice) ?? 0;

              return (
                <div key={item.product.id} className={`${styles.well} p-3 rounded-xl space-y-2`}>
                  <div className="flex justify-between items-start gap-2">
                    <h4 className={`font-semibold text-xs line-clamp-1 ${styles.textPrimary}`}>{item.product.name.split("-")[0]}</h4>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className={`p-1 ${styles.btnGhost} rounded-lg text-slate-500 hover:text-rose-500`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    {/* Price Type Selector */}
                    <select
                      value={item.selectedPriceType}
                      onChange={(e) => updateCartPriceType(item.product.id, e.target.value as any)}
                      className={`${styles.inputSecondary} rounded-lg px-2 py-1 text-[11px]`}
                    >
                      <option value="retail">{t.retail} ({item.product.retailPrice})</option>
                      <option value="wholesale">{t.wholesale} ({item.product.wholesalePrice})</option>
                      <option value="superWholesale">{t.superWholesale} ({item.product.superWholesalePrice})</option>
                    </select>

                    {/* Quantity Adjuster */}
                    <div className={`flex items-center gap-1.5 ${styles.inputSecondary} p-0.5 rounded-lg border`}>
                      <button
                        onClick={() => updateCartQty(item.product.id, -1)}
                        className={`p-1 ${styles.btnGhost} rounded`}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 font-mono font-bold text-xs">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQty(item.product.id, 1)}
                        className={`p-1 ${styles.btnGhost} rounded`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="font-mono font-bold text-indigo-400">
                      {(itemPrice * item.quantity).toFixed(2)} $
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Checkout Details & Loyalty Select */}
        <div className={`border-t ${styles.wellBorder} pt-3 space-y-3.5 text-sm`}>
          
          {/* Select Customer */}
          <div className="space-y-1">
            <label className={`text-xs ${styles.textSecondary}`}>{t.customerSelect}</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className={`w-full ${styles.input} rounded-xl px-3 py-2 text-xs`}
            >
              <option value="">{t.noCustomer}</option>
              {state.customers.map(cust => (
                <option key={cust.id} value={cust.id}>
                  {cust.name} ({t.loyaltyPoints}: {cust.loyaltyPoints})
                </option>
              ))}
            </select>
          </div>

          {/* Select Payment Method */}
          <div>
            <label className={`text-xs ${styles.textSecondary} block mb-1.5`}>{t.paymentMethod}</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: PaymentMethod.CASH, label: t.cash },
                { id: PaymentMethod.CARD, label: t.card },
                { id: PaymentMethod.DEFERRED, label: t.deferred }
              ].map(method => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    paymentMethod === method.id
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : styles.catBtnInactive
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          {/* Discount and Totals Calculations */}
          <div className={`${styles.well} p-3.5 rounded-xl space-y-2 font-mono`}>
            <div className={`flex justify-between items-center text-xs ${styles.textSecondary}`}>
              <span>{t.subtotal}:</span>
              <span>
                {cart.reduce((acc, item) => {
                  const itemPrice = (item.selectedPriceType === "retail"
                    ? item.product.retailPrice
                    : item.selectedPriceType === "wholesale"
                      ? item.product.wholesalePrice
                      : item.product.superWholesalePrice) ?? 0;
                  return acc + (itemPrice * item.quantity);
                }, 0).toFixed(2)} $
              </span>
            </div>

            <div className={`flex justify-between items-center text-xs ${styles.textSecondary}`}>
              <span>{t.discount}:</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={overallDiscount}
                  onChange={(e) => setOverallDiscount(Number(e.target.value))}
                  className={`w-16 ${styles.inputSecondary} rounded px-1.5 py-0.5 text-center text-xs focus:outline-none`}
                />
                <span>$</span>
              </div>
            </div>

            <div className={`flex justify-between items-center text-xs ${styles.textSecondary}`}>
              <span>{t.tax}:</span>
              <span>
                {(Math.max(0, cart.reduce((acc, item) => {
                  const itemPrice = (item.selectedPriceType === "retail"
                    ? item.product.retailPrice
                    : item.selectedPriceType === "wholesale"
                      ? item.product.wholesalePrice
                      : item.product.superWholesalePrice) ?? 0;
                  return acc + (itemPrice * item.quantity);
                }, 0) - overallDiscount) * 0.15).toFixed(2)} $
              </span>
            </div>

            <div className={`flex justify-between items-center font-bold text-sm text-indigo-500 pt-1.5 border-t ${styles.wellBorder}`}>
              <span>{t.total}:</span>
              <span>
                {(Math.max(0, cart.reduce((acc, item) => {
                  const itemPrice = (item.selectedPriceType === "retail"
                    ? item.product.retailPrice
                    : item.selectedPriceType === "wholesale"
                      ? item.product.wholesalePrice
                      : item.product.superWholesalePrice) ?? 0;
                  return acc + (itemPrice * item.quantity);
                }, 0) - overallDiscount) * 1.15).toFixed(2)} $
              </span>
            </div>
          </div>

          {/* Main Checkout Trigger */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/10 cursor-pointer flex items-center justify-center gap-2 text-slate-100"
          >
            <Printer className="w-4 h-4" />
            <span>{t.checkout}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
