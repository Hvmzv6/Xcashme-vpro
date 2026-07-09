/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, ShoppingCart, Trash2, Minus, Plus, Printer, AlertTriangle, Lock, UserPlus, X } from "lucide-react";
import { Product, CartItem, PaymentMethod, POSState, UserRole } from "../../../types/pos";
import { Permission, hasPermission } from "../../../core/security/rbac";

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
  onTriggerPinAuth?: (titleAr: string, titleEn: string, onSuccess: (role: UserRole) => void) => void;
  addCustomer?: (customer: any) => any;
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
  filteredProducts,
  onTriggerPinAuth,
  addCustomer
}) => {
  const [showQuickAddCustomer, setShowQuickAddCustomer] = useState(false);
  const [quickName, setQuickName] = useState("");
  const [quickPhone, setQuickPhone] = useState("");

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim() || !quickPhone.trim()) return;
    if (addCustomer) {
      const newCust = addCustomer({
        name: quickName.trim(),
        phone: quickPhone.trim(),
        email: "",
        notes: isAr ? "إضافة سريعة من شاشة نقطة البيع" : "Quick add from POS checkout"
      });
      if (newCust && newCust.id) {
        setSelectedCustomerId(newCust.id);
      }
    }
    setQuickName("");
    setQuickPhone("");
    setShowQuickAddCustomer(false);
  };

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
                    <div className="flex items-center gap-1">
                      <select
                        value={item.selectedPriceType}
                        disabled={!hasPermission(state.currentUser.role, Permission.CHANGE_PRICE_TIER)}
                        onChange={(e) => updateCartPriceType(item.product.id, e.target.value as any)}
                        className={`${styles.inputSecondary} rounded-lg px-2 py-1 text-[11px] ${!hasPermission(state.currentUser.role, Permission.CHANGE_PRICE_TIER) ? 'opacity-60 cursor-not-allowed' : ''}`}
                        title={!hasPermission(state.currentUser.role, Permission.CHANGE_PRICE_TIER) ? (isAr ? 'تغيير فئة السعر يتطلب صلاحية مدير' : 'Changing price tier requires Manager role') : undefined}
                      >
                        <option value="retail">{t.retail} ({item.product.retailPrice})</option>
                        <option value="wholesale">{t.wholesale} ({item.product.wholesalePrice})</option>
                        <option value="superWholesale">{t.superWholesale} ({item.product.superWholesalePrice})</option>
                      </select>
                      {!hasPermission(state.currentUser.role, Permission.CHANGE_PRICE_TIER) && (
                        <button
                          type="button"
                          onClick={() => {
                            if (onTriggerPinAuth) {
                              onTriggerPinAuth(
                                "تخطي حجب تعديل فئة السعر",
                                "Authorize Price Tier Override",
                                (role) => {
                                  // Re-trigger update after role upgrade
                                  updateCartPriceType(item.product.id, "wholesale");
                                }
                              );
                            }
                          }}
                          className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                          title={isAr ? "انقر لإدخال رمز المشرف وفتح التعديل" : "Click to enter supervisor PIN"}
                        >
                          <Lock className="w-3 h-3" />
                        </button>
                      )}
                    </div>

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
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className={`text-xs font-semibold ${styles.textSecondary}`}>{t.customerSelect}</label>
              <button
                type="button"
                onClick={() => setShowQuickAddCustomer(true)}
                className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isAr ? "+ عميل سريع" : "+ Quick Add"}</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className={`flex-1 ${styles.input} rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-indigo-500`}
              >
                <option value="">{t.noCustomer}</option>
                {state.customers.map(cust => (
                  <option key={cust.id} value={cust.id}>
                    {cust.name} ({t.loyaltyPoints}: {cust.loyaltyPoints})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowQuickAddCustomer(true)}
                title={isAr ? "إضافة عميل جديد سريعاً" : "Quick Add Customer"}
                className="p-2.5 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>
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
              <span className="flex items-center gap-1">
                <span>{t.discount}:</span>
                {!hasPermission(state.currentUser.role, Permission.APPLY_HEAVY_DISCOUNT) && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onTriggerPinAuth) {
                        onTriggerPinAuth(
                          "صلاحية تطبيق الخصم المالي اليدوي",
                          "Authorize Manual Financial Discount",
                          (role) => {
                            // Upgrades session so discount input is unlocked
                          }
                        );
                      }
                    }}
                    className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                    title={isAr ? "انقر لإدخال رمز المشرف وفتح الخصم" : "Click to enter supervisor PIN to unlock discount"}
                  >
                    <Lock className="w-3 h-3" />
                  </button>
                )}
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={overallDiscount}
                  disabled={!hasPermission(state.currentUser.role, Permission.APPLY_HEAVY_DISCOUNT)}
                  onChange={(e) => setOverallDiscount(Number(e.target.value))}
                  className={`w-16 ${styles.inputSecondary} rounded px-1.5 py-0.5 text-center text-xs focus:outline-none ${!hasPermission(state.currentUser.role, Permission.APPLY_HEAVY_DISCOUNT) ? 'opacity-60 cursor-not-allowed' : ''}`}
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

      {/* Quick Add Customer Modal */}
      <AnimatePresence>
        {showQuickAddCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`w-full max-w-md ${styles.card} rounded-3xl border border-indigo-500/30 shadow-2xl overflow-hidden`}
            >
              <div className="p-4 border-b border-slate-700/60 flex items-center justify-between bg-indigo-500/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">
                      {isAr ? "إضافة عميل سريع" : "Quick Add Customer"}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {isAr ? "تسجيل بيانات العميل على الفور أثناء الفاتورة" : "Register customer on the fly during transaction"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQuickAddCustomer(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleQuickAddSubmit} className="p-5 space-y-4">
                <div>
                  <label className={`text-xs font-semibold ${styles.textSecondary} block mb-1.5`}>
                    {isAr ? "اسم العميل الكامل *" : "Full Customer Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isAr ? "مثال: أحمد محمد" : "e.g. John Doe"}
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    className={`w-full ${styles.input} rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500`}
                    autoFocus
                  />
                </div>

                <div>
                  <label className={`text-xs font-semibold ${styles.textSecondary} block mb-1.5`}>
                    {isAr ? "رقم الهاتف *" : "Phone Number *"}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder={isAr ? "مثال: 0501234567" : "e.g. +966501234567"}
                    value={quickPhone}
                    onChange={(e) => setQuickPhone(e.target.value)}
                    className={`w-full ${styles.input} rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-indigo-500`}
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQuickAddCustomer(false)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold ${styles.btnOutline}`}
                  >
                    {isAr ? "إلغاء" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isAr ? "حفظ واختيار العميل" : "Save & Select"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
