/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag,
  TrendingUp,
  Box,
  Users,
  CreditCard,
  Settings,
  Sparkles,
  Globe,
  Sun,
  Moon,
  Send,
  Check,
  CheckCircle2,
  X,
  RefreshCw,
  UserCheck
} from "lucide-react";

import { usePOSState } from "./core/database/usePOSState";
import {
  Product,
  CartItem,
  PaymentMethod,
  Sale,
  UserRole
} from "./types/pos";

// Import modularized utility files
import { TRANSLATIONS } from "./shared/utils/translations";
import { getStyles } from "./shared/utils/styles";

// Import modularized feature components
import { POSView } from "./features/cart/components/POSView";
import { InventoryView } from "./features/inventory/components/InventoryView";
import { PartnersView } from "./features/partners/components/PartnersView";
import { PayrollView } from "./features/payroll/components/PayrollView";
import { ReportsView } from "./features/reports/components/ReportsView";
import { SettingsView } from "./features/settings/components/SettingsView";
import { ReceiptModal } from "./features/checkout/components/ReceiptModal";

export default function App() {
  const {
    state,
    toggleLanguage,
    toggleTheme,
    addProduct,
    updateProduct,
    deleteProduct,
    addCustomer,
    recordCustomerPayment,
    addSupplier,
    recordSupplierPayment,
    completeCheckout,
    addExpense,
    addSalaryPayout,
    suspendCart,
    resumeCart,
    updateUserRole,
    syncBranches,
    logAction
  } = usePOSState();

  const isAr = state.language === "ar";
  const t = isAr ? TRANSLATIONS.ar : TRANSLATIONS.en;
  const isDark = state.theme === "dark";
  const styles = getStyles(isDark);

  // Active tab state
  const [activeTab, setActiveTab] = useState<"pos" | "inventory" | "partners" | "payroll" | "reports" | "sync">("pos");

  // Local view triggers
  const [searchQuery, setSearchQuery] = useState("");
  const [barcodeSuccess, setBarcodeSuccess] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [overallDiscount, setOverallDiscount] = useState(0);

  // Simulated printing states
  const [activeReceipt, setActiveReceipt] = useState<Sale | null>(null);
  const [receiptSize, setReceiptSize] = useState<"A4" | "58mm" | "80mm">("80mm");

  // Temporary toast system state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // AI Assistant chatbot integration state
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState<any[]>([]);
  const [assistantInput, setAssistantInput] = useState("");
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<any | null>(null);

  // Initialize greeting on language shifts
  useEffect(() => {
    setAssistantMessages([{ role: "assistant", content: t.assistantGreeting }]);
  }, [state.language]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Barcode Submission Helper
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSearch = searchQuery.trim();
    if (!cleanSearch) return;

    const found = state.products.find(p => p.barcode === cleanSearch || p.serialNumber === cleanSearch);
    if (found) {
      addToCart(found);
      setSearchQuery("");
      triggerToast(isAr ? `تم إضافة ${found.name} إلى السلة` : `Added ${found.name} to cart`);
      setBarcodeSuccess(true);
      setTimeout(() => setBarcodeSuccess(false), 1000);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const match = prev.find(item => item.product.id === product.id);
      if (match) {
        if (match.quantity + 1 > product.stockQuantity) {
          triggerToast(isAr ? "عذراً، غير متوفر كمية كافية في المخزن!" : "Sorry, insufficient stock!");
          return prev;
        }
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1, selectedPriceType: "retail", discountAmount: 0 }];
    });
  };

  const updateCartQty = (prodId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === prodId) {
          const targetQty = item.quantity + delta;
          if (targetQty <= 0) return null;
          if (targetQty > item.product.stockQuantity) {
            triggerToast(isAr ? "الكمية المطلوبة تتجاوز الرصيد المتاح!" : "Requested quantity exceeds available stock!");
            return item;
          }
          return { ...item, quantity: targetQty };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const updateCartPriceType = (prodId: string, type: "retail" | "wholesale" | "superWholesale") => {
    setCart(prev => prev.map(item => item.product.id === prodId ? { ...item, selectedPriceType: type } : item));
  };

  const removeFromCart = (prodId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== prodId));
  };

  const handleSuspend = () => {
    if (cart.length === 0) return;
    const label = prompt(isAr ? "أدخل اسماً أو رقماً لتعليق السلة الحالية:" : "Enter label for suspended cart:");
    if (label) {
      suspendCart(label, cart, selectedCustomerId || undefined);
      setCart([]);
      setSelectedCustomerId("");
      triggerToast(isAr ? `تم تعليق السلة باسم: ${label}` : `Cart suspended as: ${label}`);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      triggerToast(isAr ? "السلة فارغة!" : "Cart is empty!");
      return;
    }

    const sale = completeCheckout({
      items: cart,
      paymentMethod,
      customerId: selectedCustomerId || undefined,
      discount: overallDiscount,
      taxRate: 0.15
    });

    if (sale) {
      setActiveReceipt(sale);
      setCart([]);
      setSelectedCustomerId("");
      setOverallDiscount(0);
      triggerToast(isAr ? `تم تسجيل العملية بنجاح! رقم الفاتورة: ${sale.invoiceNumber}` : `Checkout complete! Invoice: ${sale.invoiceNumber}`);
    }
  };

  // AI Assistant interaction loop
  const handleAISend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const input = assistantInput.trim();
    if (!input) return;

    const newMsgs = [...assistantMessages, { role: "user", content: input }];
    setAssistantMessages(newMsgs);
    setAssistantInput("");
    setIsAssistantLoading(true);
    setPendingAction(null);

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMsgs,
          storeState: state
        })
      });

      if (!response.ok) throw new Error("API server error");
      const data = await response.json();
      const aiMsg = data.choices?.[0]?.message;

      if (aiMsg) {
        setAssistantMessages(prev => [...prev, { role: "assistant", content: aiMsg.content }]);
        if (aiMsg.suggestedAction && aiMsg.suggestedAction.type !== "NONE") {
          setPendingAction(aiMsg.suggestedAction);
        }
      }
    } catch (error) {
      console.error(error);
      setAssistantMessages(prev => [
        ...prev,
        { role: "assistant", content: isAr ? "عذراً، واجهت مشكلة في الاتصال بالمخدم الذكي." : "Sorry, I encountered an issue connecting to the AI server." }
      ]);
    } finally {
      setIsAssistantLoading(false);
    }
  };

  const executePendingAction = () => {
    if (!pendingAction) return;

    if (pendingAction.type === "APPLY_DISCOUNT") {
      const p = pendingAction.payload?.percent || 10;
      setOverallDiscount(p);
      triggerToast(isAr ? `تم تطبيق خصم ${p}% من قبل المساعد الذكي!` : `Applied ${p}% discount via AI!`);
    } else if (pendingAction.type === "ADD_PRODUCT_DEMO") {
      const demo = pendingAction.payload;
      addProduct({
        barcode: `628${Math.floor(Math.random() * 900000) + 100000}`,
        name: demo.name,
        category: demo.category,
        costPrice: Number(((demo.retailPrice || 0) * 0.6).toFixed(2)),
        retailPrice: demo.retailPrice || 0,
        wholesalePrice: Number(((demo.retailPrice || 0) * 0.85).toFixed(2)),
        superWholesalePrice: Number(((demo.retailPrice || 0) * 0.75).toFixed(2)),
        stockQuantity: 100,
        minStockAlert: 10,
        hasExpiry: false
      });
      triggerToast(isAr ? "تم إضافة منتج تجريبي للمخزون!" : "Added demo product to inventory!");
    }

    setPendingAction(null);
  };

  const handleExportDB = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `xcash_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    logAction("تصدير نسخة احتياطية", "تم تصدير قاعدة البيانات يدوياً كملف JSON");
    triggerToast(isAr ? "تم تصدير ملف النسخة الاحتياطية بنجاح" : "Database exported successfully as JSON file!");
  };

  const handleImportDB = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.products && parsed.sales) {
            localStorage.setItem("xcash_pos_state", JSON.stringify(parsed));
            logAction("استعادة نسخة احتياطية", "تم استعادة قاعدة بيانات كاملة من ملف خارجي");
            triggerToast(isAr ? "تم استيراد قاعدة البيانات بنجاح! جاري تحديث الصفحة..." : "Database imported successfully! Reloading...");
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          } else {
            alert(isAr ? "ملف غير صالح!" : "Invalid database file schema!");
          }
        } catch {
          alert(isAr ? "خطأ في قراءة ملف JSON" : "Error reading JSON backup file");
        }
      };
    }
  };

  // Calculations for KPI cards & metrics
  const filteredProducts = state.products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.barcode.includes(searchQuery);
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = state.products.filter(p => p.stockQuantity <= p.minStockAlert);
  const totalStockVal = state.products.reduce((acc, p) => acc + (p.costPrice * p.stockQuantity), 0);

  const totalSalesRevenue = state.sales.reduce((acc, s) => acc + s.total, 0);
  const totalExpensesCost = state.expenses.reduce((acc, e) => acc + e.amount, 0) +
    state.salaries.reduce((acc, s) => acc + (s.baseSalary + s.bonuses - s.deductions), 0);
  const estimatedNetProfit = totalSalesRevenue * 0.4 - totalExpensesCost;

  // Recharts structured mapping
  const branchSalesData = [
    { name: isAr ? "الرياض" : "Riyadh", Sales: totalSalesRevenue * 0.7, Visitors: 340 },
    { name: isAr ? "جدة" : "Jeddah", Sales: totalSalesRevenue * 0.2, Visitors: 120 },
    { name: isAr ? "الدمام" : "Dammam", Sales: totalSalesRevenue * 0.1, Visitors: 45 }
  ];

  const categoryShareData = state.categories.map((c, i) => {
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];
    return {
      name: c.name.split("/")[0].trim(),
      value: Math.floor(Math.random() * 300) + 100,
      color: colors[i % colors.length]
    };
  });

  const salesTrendData = state.sales.map(s => ({
    time: s.timestamp.slice(11, 16),
    Revenue: s.total
  })).reverse();

  return (
    <div className={`min-h-screen ${styles.bg} font-sans transition-colors duration-300`} dir={isAr ? "rtl" : "ltr"}>
      
      {/* Toast system alerts */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 16, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 font-medium border border-emerald-500/20"
          >
            <CheckCircle2 className="w-5 h-5 animate-bounce" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header element bar */}
      <header className={`${styles.header} sticky top-0 z-40 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`${styles.headerTitle} font-display tracking-tight`}>
              {t.title} <span className="text-xs text-indigo-400 font-mono font-normal">v2.1 Pro</span>
            </h1>
            <p className={styles.headerSubtitle}>{t.subtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3.5">
          <div className={`flex items-center gap-2 ${styles.badgeWell} px-3.5 py-1.5 rounded-lg text-xs`}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium">{t.branchStatus}</span>
            <span className={`${styles.textSecondary} font-mono`}>| {t.online}</span>
          </div>

          <div className={`flex items-center gap-2 ${styles.badgeActive} px-3 py-1.5 rounded-lg text-xs font-mono`}>
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>{t.activeUser} ({state.currentUser.role})</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                syncBranches();
                triggerToast(t.syncSuccess);
              }}
              className={`p-2 ${styles.btnGhost} rounded-lg transition-colors`}
              title="Cloud Sync"
            >
              <RefreshCw className="w-4 h-4 text-emerald-400" />
            </button>
            <button
              onClick={toggleLanguage}
              className={`p-2 ${styles.btnGhost} rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold`}
              title="Change Language"
            >
              <Globe className="w-4 h-4 text-indigo-400" />
              <span>{isAr ? "English" : "عربي"}</span>
            </button>
            <button
              onClick={toggleTheme}
              className={`p-2 ${styles.btnGhost} rounded-lg transition-colors`}
              title="Toggle Theme"
            >
              {state.theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        
        {/* Navigation panel */}
        <aside className={styles.sidebar}>
          <button
            onClick={() => setActiveTab("pos")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "pos" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/10" : styles.sidebarBtnUnselected
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t.pos}</span>
          </button>

          <button
            onClick={() => setActiveTab("inventory")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "inventory" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/10" : styles.sidebarBtnUnselected
            }`}
          >
            <Box className="w-4 h-4" />
            <span>{t.inventory}</span>
            {lowStockProducts.length > 0 && (
              <span className="ms-auto bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                {lowStockProducts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("partners")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "partners" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/10" : styles.sidebarBtnUnselected
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t.customers}</span>
          </button>

          <button
            onClick={() => setActiveTab("payroll")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "payroll" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/10" : styles.sidebarBtnUnselected
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>{t.expenses}</span>
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "reports" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/10" : styles.sidebarBtnUnselected
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{t.salesReports}</span>
          </button>

          <button
            onClick={() => setActiveTab("sync")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "sync" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/10" : styles.sidebarBtnUnselected
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{t.syncSettings}</span>
          </button>

          <div className={`pt-6 border-t ${styles.wellBorder} mt-4`}>
            <button
              onClick={() => setIsAssistantOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 animate-spin-slow text-amber-300" />
              <span>{t.assistantTitle}</span>
            </button>
          </div>
        </aside>

        {/* Content Section switcher */}
        <main className="flex-1 p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {activeTab === "pos" && (
                <POSView
                  state={state}
                  cart={cart}
                  setCart={setCart}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  barcodeSuccess={barcodeSuccess}
                  selectedCustomerId={selectedCustomerId}
                  setSelectedCustomerId={setSelectedCustomerId}
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  overallDiscount={overallDiscount}
                  setOverallDiscount={setOverallDiscount}
                  handleBarcodeSubmit={handleBarcodeSubmit}
                  addToCart={addToCart}
                  updateCartQty={updateCartQty}
                  updateCartPriceType={updateCartPriceType}
                  removeFromCart={removeFromCart}
                  handleSuspend={handleSuspend}
                  handleCheckout={handleCheckout}
                  t={t}
                  styles={styles}
                  isAr={isAr}
                  isDark={isDark}
                  filteredProducts={filteredProducts}
                />
              )}

              {activeTab === "inventory" && (
                <InventoryView
                  state={state}
                  t={t}
                  styles={styles}
                  isAr={isAr}
                  isDark={isDark}
                  addProduct={addProduct}
                  updateProduct={updateProduct}
                  deleteProduct={deleteProduct}
                  triggerToast={triggerToast}
                  filteredProducts={filteredProducts}
                  lowStockProducts={lowStockProducts}
                  totalStockVal={totalStockVal}
                />
              )}

              {activeTab === "partners" && (
                <PartnersView
                  state={state}
                  t={t}
                  styles={styles}
                  isAr={isAr}
                  addCustomer={addCustomer}
                  recordCustomerPayment={recordCustomerPayment}
                  addSupplier={addSupplier}
                  recordSupplierPayment={recordSupplierPayment}
                  triggerToast={triggerToast}
                />
              )}

              {activeTab === "payroll" && (
                <PayrollView
                  state={state}
                  t={t}
                  styles={styles}
                  isAr={isAr}
                  addExpense={addExpense}
                  addSalaryPayout={addSalaryPayout}
                  triggerToast={triggerToast}
                />
              )}

              {activeTab === "reports" && (
                <ReportsView
                  state={state}
                  t={t}
                  styles={styles}
                  isAr={isAr}
                  totalSalesRevenue={totalSalesRevenue}
                  totalExpensesCost={totalExpensesCost}
                  estimatedNetProfit={estimatedNetProfit}
                  branchSalesData={branchSalesData}
                  salesTrendData={salesTrendData}
                  categoryShareData={categoryShareData}
                />
              )}

              {activeTab === "sync" && (
                <SettingsView
                  state={state}
                  t={t}
                  styles={styles}
                  isAr={isAr}
                  updateUserRole={updateUserRole}
                  syncBranches={syncBranches}
                  handleExportDB={handleExportDB}
                  handleImportDB={handleImportDB}
                  triggerToast={triggerToast}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* simulated active Receipt print popup dialog */}
      <AnimatePresence>
        {activeReceipt && (
          <ReceiptModal
            activeReceipt={activeReceipt}
            receiptSize={receiptSize}
            setReceiptSize={setReceiptSize}
            setActiveReceipt={setActiveReceipt}
            t={t}
            styles={styles}
            isAr={isAr}
          />
        )}
      </AnimatePresence>

      {/* Floating AI chat window drawer */}
      <AnimatePresence>
        {isAssistantOpen && (
          <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 ${styles.card} border-l ${styles.wellBorder} shadow-2xl flex flex-col`}>
            
            <div className={`p-4 border-b ${styles.wellBorder} ${styles.well} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500 animate-spin-slow" />
                <h3 className="font-bold text-sm bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
                  {t.assistantTitle}
                </h3>
              </div>
              <button
                onClick={() => setIsAssistantOpen(false)}
                className={`p-1.5 hover:${styles.hoverBg} rounded-lg ${styles.textSecondary}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {assistantMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : `${styles.well} ${styles.textPrimary} border ${styles.wellBorder} rounded-bl-none`
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isAssistantLoading && (
                <div className="flex justify-start">
                  <div className={`${styles.well} ${styles.textSecondary} rounded-2xl rounded-bl-none border ${styles.wellBorder} px-3.5 py-2.5 text-xs flex items-center gap-2`}>
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}

              {pendingAction && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl space-y-2"
                >
                  <p className="text-[11px] text-violet-500 font-medium">
                    {isAr ? "مساعد الذكاء الاصطناعي يقترح إجراء الإجراء التالي:" : "AI suggests completing following action:"}
                  </p>
                  <div className={`text-xs font-bold ${styles.textPrimary} flex items-center gap-1.5`}>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{pendingAction.type === "APPLY_DISCOUNT" ? `تطبيق خصم ${pendingAction.payload.percent}%` : `إضافة منتج ${pendingAction.payload.name}`}</span>
                  </div>
                  <button
                    onClick={executePendingAction}
                    className="w-full py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-slate-100 text-xs font-bold rounded hover:from-violet-500 hover:to-indigo-500 cursor-pointer transition-all"
                  >
                    {t.quickDemoTrigger}
                  </button>
                </motion.div>
              )}
            </div>

            <form onSubmit={handleAISend} className={`p-3 border-t ${styles.wellBorder} ${styles.well} flex gap-2`}>
              <input
                type="text"
                placeholder={t.assistantPlaceholder}
                value={assistantInput}
                onChange={(e) => setAssistantInput(e.target.value)}
                className={`flex-1 ${styles.inputSecondary} rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500`}
              />
              <button
                type="submit"
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
