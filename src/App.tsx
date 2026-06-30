import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag,
  TrendingUp,
  Box,
  Users,
  CreditCard,
  Settings,
  Sparkles,
  Trash2,
  Plus,
  Minus,
  DollarSign,
  Check,
  RotateCcw,
  FileText,
  Printer,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  Globe,
  Sun,
  Moon,
  ChevronRight,
  Send,
  Lock,
  Database,
  Search,
  ShoppingCart,
  Percent,
  Layers,
  Award,
  BookOpen,
  CheckCircle2,
  X,
  FileCode,
  UserCheck
} from "lucide-react";

import { usePOSState } from "./hooks/usePOSState";
import {
  Product,
  CartItem,
  PaymentMethod,
  OrderStatus,
  Sale,
  UserRole
} from "./types/pos";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";

// Interactive translations dictionary for seamless Localization
const TRANSLATIONS = {
  ar: {
    title: "إكس كاش برو POS",
    subtitle: "نظام نقطة البيع الاحترافي وإدارة الفروع والمخزون",
    branchStatus: "فرع الرياض الرئيسي",
    activeUser: "المدير العام",
    active: "نشط",
    online: "متصل بالخيمة السحابية",
    syncSuccess: "تمت مزامنة جميع العمليات والمخازن مع الفروع البعيدة بنجاح!",
    searchBarcodePlaceholder: "ابحث بالاسم أو الباركود (مثال: 628...)",
    allCategories: "جميع الأقسام",
    addToCart: "إضافة للسلة",
    cart: "سلة المشتريات",
    suspendCart: "تعليق السلة",
    resumeCart: "استرجاع المعلقات",
    clearCart: "تفريغ السلة",
    quantity: "الكمية",
    priceType: "فئة السعر",
    retail: "قطاعي",
    wholesale: "جملة",
    superWholesale: "جملة الجملة",
    customPrice: "سعر مخصص",
    discount: "خصم",
    subtotal: "المجموع الفرعي",
    tax: "ضريبة القيمة المضافة (15%)",
    total: "الإجمالي النهائي",
    paymentMethod: "طريقة الدفع",
    cash: "نقدي",
    card: "شبكة/بطاقة",
    deferred: "آجل (ذمم للعميل)",
    checkout: "إتمام عملية البيع وطباعة الفاتورة",
    customerSelect: "اختيار عميل ولاء",
    noCustomer: "بدون عميل (نقدي عام)",
    invoiceNo: "رقم الفاتورة",
    productName: "اسم المنتج",
    stock: "المخزون المتوفر",
    minAlert: "حد الطلب",
    cost: "تكلفة الشراء",
    actions: "الإجراءات",
    save: "حفظ",
    edit: "تعديل",
    delete: "حذف",
    addNewProduct: "إضافة منتج جديد للمخزن",
    productBarcode: "رمز الباركود",
    productCategory: "القسم / التصنيف",
    hasExpiry: "تاريخ صلاحية",
    expiryDate: "تاريخ الانتهاء",
    serialNumber: "الرقم التسلسلي (إذا توفر)",
    alertLowStock: "المنتجات التي قاربت على النفاد",
    totalStockValue: "إجمالي قيمة المخزون",
    customerLoyalty: "العملاء ونقاط الولاء والمديونيات",
    customerName: "اسم العميل",
    phone: "رقم الجوال",
    debts: "المديونيات الحالية (ذمم)",
    loyaltyPoints: "نقاط الولاء",
    addCustomer: "تسجيل عميل ولاء جديد",
    receivePayment: "استلام دفعة سداد ديون",
    supplierManagement: "الموردون والحسابات",
    supplierName: "اسم المورد",
    supplierCompany: "الشركة",
    supplierDebt: "مستحقات للمورد",
    addSupplier: "تسجيل مورد جديد",
    paySupplier: "سداد دفعة للمورد",
    expensesManagement: "المصروفات التشغيلية ورواتب الموظفين",
    expenseCategory: "تصنيف المصروف",
    expenseAmount: "المبلغ",
    expenseNotes: "ملاحظات وتفاصيل",
    addExpense: "تسجيل مصروف جديد",
    salaryManagement: "مسيرات الرواتب والمكافآت",
    employeeName: "اسم الموظف",
    baseSalary: "الراتب الأساسي",
    bonus: "مكافآت",
    deductions: "خصومات واستقطاعات",
    addSalary: "صرف مرتب شهري",
    reportsDashboard: "لوحة تحكم التقارير المالية والتحليلات",
    totalSales: "إجمالي المبيعات",
    totalExpenses: "إجمالي المصروفات ورواتب الموظفين",
    netProfit: "صافي الأرباح المقدرة",
    salesByBranch: "مقارنة مبيعات الفروع",
    categoryShare: "حصة الأقسام من المبيعات",
    auditLogs: "سجل العمليات والتدقيق الأمني",
    syncStatusTitle: "مركز المزامنة السحابية والصلاحيات",
    userRole: "صلاحية المستخدم النشط",
    syncBranches: "مزامنة الفروع الآن",
    backupRestore: "النسخ الاحتياطي اليدوي",
    exportData: "تصدير قاعدة البيانات (JSON)",
    importData: "استيراد قاعدة البيانات",
    assistantTitle: "المساعد الذكي Xcash AI",
    assistantGreeting: "مرحباً! أنا مساعدك الذكي لتحليل مبيعات ومخازن Xcashme-vpro. يمكنني تحليل المبيعات، حساب الأرباح، تطبيق الخصومات، أو إضافة منتجات تجريبية. اطلب مني ما تريد!",
    assistantPlaceholder: "اسأل المساعد الذكي... (مثال: طبق خصم 10%، أو حلل أداء المتجر)",
    closeReceipt: "إغلاق نافذة الطباعة",
    printA4: "طباعة فاتورة A4 رئيسية",
    print58: "إيصال حراري 58 ملم",
    print80: "إيصال حراري 80 ملم",
    quickDemoTrigger: "تأكيد تنفيذ أمر ذكي",
    pos: "نقطة البيع (POS)",
    inventory: "إدارة المخزون",
    customers: "الشركاء والعملاء",
    expenses: "المصروفات والرواتب",
    salesReports: "التقارير والتحليلات",
    syncSettings: "المزامنة والأمان"
  },
  en: {
    title: "Xcashme-vpro POS",
    subtitle: "Professional Point of Sale, Multi-branch & Inventory System",
    branchStatus: "Riyadh Main Branch",
    activeUser: "General Admin",
    active: "Active",
    online: "Cloud Sync Connected",
    syncSuccess: "All transactions and stocks synchronized with remote branches successfully!",
    searchBarcodePlaceholder: "Search by name or barcode (e.g. 628...)",
    allCategories: "All Categories",
    addToCart: "Add to Cart",
    cart: "Shopping Cart",
    suspendCart: "Suspend Cart",
    resumeCart: "Resume Suspended",
    clearCart: "Clear Cart",
    quantity: "Qty",
    priceType: "Price Category",
    retail: "Retail",
    wholesale: "Wholesale",
    superWholesale: "Super Wholesale",
    customPrice: "Custom Price",
    discount: "Discount",
    subtotal: "Subtotal",
    tax: "VAT (15%)",
    total: "Grand Total",
    paymentMethod: "Payment Method",
    cash: "Cash",
    card: "Card/Network",
    deferred: "Deferred (On Account)",
    checkout: "Complete Sale & Print Invoice",
    customerSelect: "Select Loyalty Customer",
    noCustomer: "No Customer (General Cash)",
    invoiceNo: "Invoice No",
    productName: "Product Name",
    stock: "In Stock",
    minAlert: "Alert Level",
    cost: "Unit Cost",
    actions: "Actions",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    addNewProduct: "Add New Product to Stock",
    productBarcode: "Barcode Value",
    productCategory: "Category / Department",
    hasExpiry: "Has Expiry",
    expiryDate: "Expiry Date",
    serialNumber: "Serial Number (If available)",
    alertLowStock: "Low Stock Alert Items",
    totalStockValue: "Total Inventory Value",
    customerLoyalty: "Customers, Loyalty Points & Credit",
    customerName: "Customer Name",
    phone: "Phone Number",
    debts: "Current Debts",
    loyaltyPoints: "Loyalty Points",
    addCustomer: "Register New Loyalty Customer",
    receivePayment: "Receive Debt Payment",
    supplierManagement: "Suppliers & Accounts Payable",
    supplierName: "Supplier Name",
    supplierCompany: "Company",
    supplierDebt: "Our Debt to Supplier",
    addSupplier: "Register New Supplier",
    paySupplier: "Pay Supplier Balance",
    expensesManagement: "Operational Expenses & Payroll",
    expenseCategory: "Expense Category",
    expenseAmount: "Amount",
    expenseNotes: "Notes / Description",
    addExpense: "Record New Expense",
    salaryManagement: "Staff Payroll Sheets",
    employeeName: "Employee Name",
    baseSalary: "Base Salary",
    bonus: "Bonuses",
    deductions: "Deductions",
    addSalary: "Disburse Monthly Salary",
    reportsDashboard: "Financial Reports & Analytics Dashboard",
    totalSales: "Total Sales Revenue",
    totalExpenses: "Total Expenses & Payroll",
    netProfit: "Estimated Net Profit",
    salesByBranch: "Sales Comparison by Branch",
    categoryShare: "Category Share of Revenue",
    auditLogs: "Audit Trail & Operation Security Log",
    syncStatusTitle: "Cloud Synchronization & Security Center",
    userRole: "Active Operator Role",
    syncBranches: "Force Branch Sync Now",
    backupRestore: "Manual System Backups",
    exportData: "Export Database Schema (JSON)",
    importData: "Import Database Schema",
    assistantTitle: "Xcash AI Assistant",
    assistantGreeting: "Hello! I am your intelligent assistant designed to analyze sales, compute profits, apply discounts, or generate stock alerts. Tell me what you'd like to do!",
    assistantPlaceholder: "Ask the AI assistant... (e.g. Apply a 10% discount, or Analyze store profit margin)",
    closeReceipt: "Close Print window",
    printA4: "Print A4 Invoice Layout",
    print58: "Print 58mm Thermal Receipt",
    print80: "Print 80mm Thermal Receipt",
    quickDemoTrigger: "Confirm Intelligent Action",
    pos: "POS Terminal",
    inventory: "Inventory",
    customers: "Partners & Credit",
    expenses: "Expenses & Payroll",
    salesReports: "Reports & Analytics",
    syncSettings: "Sync & Security"
  }
};

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

  // Tabs state
  const [activeTab, setActiveTab] = useState<"pos" | "inventory" | "partners" | "payroll" | "reports" | "sync">("pos");

  // Local view triggers
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [overallDiscount, setOverallDiscount] = useState(0);

  // Print receipts simulation state
  const [activeReceipt, setActiveReceipt] = useState<Sale | null>(null);
  const [receiptSize, setReceiptSize] = useState<"A4" | "58mm" | "80mm">("80mm");

  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New forms states
  const [newProd, setNewProd] = useState({
    barcode: "",
    name: "",
    category: "",
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

  const [newCust, setNewCust] = useState({ name: "", phone: "", email: "", notes: "" });
  const [newSupp, setNewSupp] = useState({ name: "", phone: "", companyName: "", debtAmount: 0 });
  const [newExp, setNewExp] = useState({ category: "إيجار / Rent", amount: 0, notes: "" });
  const [newSal, setNewSal] = useState({ employeeName: "", baseSalary: 2500, bonuses: 0, deductions: 0, notes: "" });

  const [customerPayment, setCustomerPayment] = useState({ id: "", amount: 0 });
  const [supplierPayment, setSupplierPayment] = useState({ id: "", amount: 0 });

  // AI Assistant Chat state
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState<any[]>([
    { role: "assistant", content: t.assistantGreeting }
  ]);
  const [assistantInput, setAssistantInput] = useState("");
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<any | null>(null);

  // Trigger temporary notification
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Set initial category
  useEffect(() => {
    if (state.categories.length > 0) {
      setNewProd(prev => ({ ...prev, category: state.categories[0].name }));
    }
  }, [state.categories]);

  // Handle barcode scanner input mock
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSearch = searchQuery.trim();
    if (!cleanSearch) return;

    // Direct match check on barcode
    const found = state.products.find(p => p.barcode === cleanSearch || p.serialNumber === cleanSearch);
    if (found) {
      addToCart(found);
      setSearchQuery("");
      triggerToast(isAr ? `تم إضافة ${found.name} إلى السلة` : `Added ${found.name} to cart`);
    }
  };

  // Cart operations
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

  const updateCartCustomPrice = (prodId: string, price: number) => {
    setCart(prev => prev.map(item => item.product.id === prodId ? { ...item, customPrice: price } : item));
  };

  const removeFromCart = (prodId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== prodId));
  };

  // Suspended Carts operations
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

  const handleResume = (suspId: string) => {
    const resumed = resumeCart(suspId);
    if (resumed) {
      setCart(resumed.items);
      if (resumed.customerId) setSelectedCustomerId(resumed.customerId);
      triggerToast(isAr ? `تم استرجاع السلة بنجاح` : "Cart resumed successfully");
    }
  };

  // Checkout process
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
      taxRate: 0.15 // 15% Standard Saudi VAT
    });

    if (sale) {
      setActiveReceipt(sale);
      setCart([]);
      setSelectedCustomerId("");
      setOverallDiscount(0);
      triggerToast(isAr ? `تم تسجيل العملية بنجاح! رقم الفاتورة: ${sale.invoiceNumber}` : `Checkout complete! Invoice: ${sale.invoiceNumber}`);
    }
  };

  // Interactive AI request
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

  // Perform Gemini suggested actions
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
        costPrice: Number((demo.retailPrice * 0.6).toFixed(2)),
        retailPrice: demo.retailPrice,
        wholesalePrice: Number((demo.retailPrice * 0.85).toFixed(2)),
        superWholesalePrice: Number((demo.retailPrice * 0.75).toFixed(2)),
        stockQuantity: 100,
        minStockAlert: 10,
        hasExpiry: false
      });
      triggerToast(isAr ? "تم إضافة منتج تجريبي للمخزون!" : "Added demo product to inventory!");
    }

    setPendingAction(null);
  };

  // Manual Export local state to JSON
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

  // Manual Import local state from JSON file
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

  // Calculate high-level stats for reports and dashboards
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
  const estimatedNetProfit = totalSalesRevenue * 0.4 - totalExpensesCost; // Assuming 40% gross margin model

  // Charts mapping
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
    <div className={`min-h-screen ${state.theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"} font-sans transition-colors duration-300`} dir={isAr ? "rtl" : "ltr"}>
      
      {/* Dynamic Toast System */}
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

      {/* Top Application Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              {t.title} <span className="text-xs text-indigo-400 font-mono font-normal">v2.1 Pro</span>
            </h1>
            <p className="text-xs text-slate-400">{t.subtitle}</p>
          </div>
        </div>

        {/* Branch Live Sync and Identity Bar */}
        <div className="flex flex-wrap items-center gap-3.5">
          <div className="flex items-center gap-2 bg-slate-850 px-3.5 py-1.5 rounded-lg text-xs border border-slate-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-medium">{t.branchStatus}</span>
            <span className="text-slate-500 font-mono">| {t.online}</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-300">{t.activeUser} ({state.currentUser.role})</span>
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                syncBranches();
                triggerToast(t.syncSuccess);
              }}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors"
              title="Cloud Sync"
            >
              <RefreshCw className="w-4 h-4 text-emerald-400" />
            </button>
            <button
              onClick={toggleLanguage}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Change Language"
            >
              <Globe className="w-4 h-4 text-indigo-400" />
              <span>{isAr ? "English" : "عربي"}</span>
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors"
              title="Toggle Theme"
            >
              {state.theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-64 border-r lg:border-b-0 border-slate-800 bg-slate-900/50 p-4 space-y-2 shrink-0">
          <button
            onClick={() => setActiveTab("pos")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "pos" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/10" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{t.pos}</span>
          </button>

          <button
            onClick={() => setActiveTab("inventory")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "inventory" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/10" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
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
              activeTab === "partners" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/10" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t.customers}</span>
          </button>

          <button
            onClick={() => setActiveTab("payroll")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "payroll" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/10" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>{t.expenses}</span>
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "reports" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/10" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{t.salesReports}</span>
          </button>

          <button
            onClick={() => setActiveTab("sync")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "sync" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/10" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{t.syncSettings}</span>
          </button>

          <div className="pt-6 border-t border-slate-850 mt-4">
            <button
              onClick={() => setIsAssistantOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 animate-spin-slow text-amber-300" />
              <span>{t.assistantTitle}</span>
            </button>
          </div>
        </aside>

        {/* Main Content Pane */}
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
              
              {/* TAB 1: POS TERMINAL */}
              {activeTab === "pos" && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  
                  {/* Products Grid Pane */}
                  <div className="xl:col-span-7 space-y-4">
                    
                    {/* Fast Search & Category Filters */}
                    <div className="flex flex-col md:flex-row gap-3">
                      <form onSubmit={handleBarcodeSubmit} className="relative flex-1">
                        <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder={t.searchBarcodePlaceholder}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pr-10 pl-4 text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                        />
                      </form>

                      {/* Category Quick Filter */}
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
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
                              isLow ? "bg-amber-950/20 border-amber-500/30 hover:border-amber-500/60" : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <span className="text-xs text-slate-500 font-mono">{prod.category.split("/")[0]}</span>
                              {isLow && (
                                <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>{prod.stockQuantity}</span>
                                </span>
                              )}
                            </div>
                            <h3 className="font-semibold text-sm line-clamp-2 h-10">{prod.name.split("-")[0].trim()}</h3>
                            <div className="mt-4 flex items-baseline justify-between">
                              <span className="text-xs text-slate-400">{t.retail}:</span>
                              <span className="text-base font-bold text-indigo-400">{prod.retailPrice.toFixed(2)} $</span>
                            </div>
                            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                              <span>{t.wholesale}: {prod.wholesalePrice.toFixed(2)}</span>
                              <span>{t.stock}: {prod.stockQuantity}</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cart Summary Pane */}
                  <div className="xl:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-full space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-indigo-400" />
                        <h2 className="font-bold text-base">{t.cart}</h2>
                        <span className="bg-slate-800 text-slate-200 text-xs px-2 py-0.5 rounded-md font-bold">{cart.length}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSuspend}
                          className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-300"
                        >
                          {t.suspendCart}
                        </button>
                        <button
                          onClick={() => setCart([])}
                          className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-rose-950/40 hover:bg-rose-950/20 text-rose-400"
                        >
                          {t.clearCart}
                        </button>
                      </div>
                    </div>

                    {/* Cart Items list */}
                    <div className="flex-1 overflow-y-auto max-h-[350px] space-y-3">
                      {cart.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 text-sm">
                          {isAr ? "سلة المشتريات فارغة حالياً. اضغط على المنتجات لإضافتها!" : "Cart is currently empty. Click on products to add!"}
                        </div>
                      ) : (
                        cart.map(item => {
                          const itemPrice = item.selectedPriceType === "retail"
                            ? item.product.retailPrice
                            : item.selectedPriceType === "wholesale"
                              ? item.product.wholesalePrice
                              : item.product.superWholesalePrice;

                          return (
                            <div key={item.product.id} className="bg-slate-950/50 p-3 rounded-xl border border-slate-850 space-y-2">
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="font-semibold text-xs line-clamp-1">{item.product.name.split("-")[0]}</h4>
                                <button
                                  onClick={() => removeFromCart(item.product.id)}
                                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-rose-400"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                {/* Price Type Selector */}
                                <select
                                  value={item.selectedPriceType}
                                  onChange={(e) => updateCartPriceType(item.product.id, e.target.value as any)}
                                  className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300"
                                >
                                  <option value="retail">{t.retail} ({item.product.retailPrice})</option>
                                  <option value="wholesale">{t.wholesale} ({item.product.wholesalePrice})</option>
                                  <option value="superWholesale">{t.superWholesale} ({item.product.superWholesalePrice})</option>
                                </select>

                                {/* Quantity Adjuster */}
                                <div className="flex items-center gap-1.5 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                                  <button
                                    onClick={() => updateCartQty(item.product.id, -1)}
                                    className="p-1 hover:bg-slate-800 rounded text-slate-400"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  {/* Supports Decimal Quantities */}
                                  <span className="px-2 font-mono font-bold text-xs">{item.quantity}</span>
                                  <button
                                    onClick={() => updateCartQty(item.product.id, 1)}
                                    className="p-1 hover:bg-slate-800 rounded text-slate-400"
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
                    <div className="border-t border-slate-800 pt-3 space-y-3.5 text-sm">
                      
                      {/* Select Customer */}
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400">{t.customerSelect}</label>
                        <select
                          value={selectedCustomerId}
                          onChange={(e) => setSelectedCustomerId(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300"
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
                        <label className="text-xs text-slate-400 block mb-1.5">{t.paymentMethod}</label>
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
                                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                              }`}
                            >
                              {method.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Discount and Totals Calculations */}
                      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-850 space-y-2 font-mono">
                        <div className="flex justify-between items-center text-xs text-slate-400">
                          <span>{t.subtotal}:</span>
                          <span>
                            {cart.reduce((acc, item) => {
                              const itemPrice = item.selectedPriceType === "retail"
                                ? item.product.retailPrice
                                : item.selectedPriceType === "wholesale"
                                  ? item.product.wholesalePrice
                                  : item.product.superWholesalePrice;
                              return acc + (itemPrice * item.quantity);
                            }, 0).toFixed(2)} $
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-xs text-slate-400">
                          <span>{t.discount}:</span>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={overallDiscount}
                              onChange={(e) => setOverallDiscount(Number(e.target.value))}
                              className="w-16 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-center text-xs focus:outline-none"
                            />
                            <span>$</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs text-slate-400">
                          <span>{t.tax}:</span>
                          <span>
                            {(Math.max(0, cart.reduce((acc, item) => {
                              const itemPrice = item.selectedPriceType === "retail"
                                ? item.product.retailPrice
                                : item.selectedPriceType === "wholesale"
                                  ? item.product.wholesalePrice
                                  : item.product.superWholesalePrice;
                              return acc + (itemPrice * item.quantity);
                            }, 0) - overallDiscount) * 0.15).toFixed(2)} $
                          </span>
                        </div>

                        <div className="flex justify-between items-center font-bold text-sm text-indigo-400 pt-1.5 border-t border-slate-800/60">
                          <span>{t.total}:</span>
                          <span>
                            {(Math.max(0, cart.reduce((acc, item) => {
                              const itemPrice = item.selectedPriceType === "retail"
                                ? item.product.retailPrice
                                : item.selectedPriceType === "wholesale"
                                  ? item.product.wholesalePrice
                                  : item.product.superWholesalePrice;
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
              )}

              {/* TAB 2: INVENTORY MANAGER */}
              {activeTab === "inventory" && (
                <div className="space-y-6">
                  
                  {/* Stock Metrics summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400 font-medium mb-1">{t.alertLowStock}</p>
                        <h3 className="text-2xl font-bold text-amber-400">{lowStockProducts.length}</h3>
                      </div>
                      <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
                        <AlertTriangle className="w-6 h-6 animate-pulse" />
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400 font-medium mb-1">{t.totalStockValue}</p>
                        <h3 className="text-2xl font-bold text-indigo-400">{totalStockVal.toFixed(2)} $</h3>
                      </div>
                      <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                        <Layers className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400 font-medium mb-1">{isAr ? "أنواع وتصنيفات المنتجات" : "Categories Count"}</p>
                        <h3 className="text-2xl font-bold text-emerald-400">{state.categories.length}</h3>
                      </div>
                      <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                        <Box className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    
                    {/* Add New Product Form */}
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 h-fit">
                      <h2 className="font-bold text-base border-b border-slate-800 pb-2.5 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-indigo-400" />
                        <span>{t.addNewProduct}</span>
                      </h2>

                      <div className="space-y-3.5 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-slate-400 block mb-1">{t.productName}</label>
                            <input
                              type="text"
                              value={newProd.name}
                              onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100"
                            />
                          </div>
                          <div>
                            <label className="text-slate-400 block mb-1">{t.productBarcode}</label>
                            <input
                              type="text"
                              value={newProd.barcode}
                              onChange={(e) => setNewProd({ ...newProd, barcode: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-slate-400 block mb-1">{t.productCategory}</label>
                            <select
                              value={newProd.category}
                              onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300"
                            >
                              {state.categories.map(c => (
                                <option key={c.id} value={c.name}>{c.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-slate-400 block mb-1">{t.serialNumber}</label>
                            <input
                              type="text"
                              placeholder="e.g. SN-9821"
                              value={newProd.serialNumber}
                              onChange={(e) => setNewProd({ ...newProd, serialNumber: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 border-t border-slate-800/50 pt-2">
                          <div>
                            <label className="text-slate-400 block mb-1">{t.cost}</label>
                            <input
                              type="number"
                              value={newProd.costPrice}
                              onChange={(e) => setNewProd({ ...newProd, costPrice: Number(e.target.value) })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-slate-400 block mb-1">{t.retail}</label>
                            <input
                              type="number"
                              value={newProd.retailPrice}
                              onChange={(e) => setNewProd({ ...newProd, retailPrice: Number(e.target.value) })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-slate-400 block mb-1">{t.wholesale}</label>
                            <input
                              type="number"
                              value={newProd.wholesalePrice}
                              onChange={(e) => setNewProd({ ...newProd, wholesalePrice: Number(e.target.value) })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-slate-400 block mb-1">{t.superWholesale}</label>
                            <input
                              type="number"
                              value={newProd.superWholesalePrice}
                              onChange={(e) => setNewProd({ ...newProd, superWholesalePrice: Number(e.target.value) })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 border-t border-slate-800/50 pt-2">
                          <div>
                            <label className="text-slate-400 block mb-1">{t.stock}</label>
                            <input
                              type="number"
                              value={newProd.stockQuantity}
                              onChange={(e) => setNewProd({ ...newProd, stockQuantity: Number(e.target.value) })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-slate-400 block mb-1">{t.minAlert}</label>
                            <input
                              type="number"
                              value={newProd.minStockAlert}
                              onChange={(e) => setNewProd({ ...newProd, minStockAlert: Number(e.target.value) })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <input
                            type="checkbox"
                            checked={newProd.hasExpiry}
                            onChange={(e) => setNewProd({ ...newProd, hasExpiry: e.target.checked })}
                            className="rounded border-slate-800 bg-slate-950"
                          />
                          <label className="text-slate-300 font-medium">{t.hasExpiry}</label>
                        </div>

                        {newProd.hasExpiry && (
                          <div>
                            <label className="text-slate-400 block mb-1">{t.expiryDate}</label>
                            <input
                              type="date"
                              value={newProd.expiryDate}
                              onChange={(e) => setNewProd({ ...newProd, expiryDate: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono"
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
                    <div className="xl:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                        <h2 className="font-bold text-base">{isAr ? "قائمة رصيد المنتجات" : "Product Inventory List"}</h2>
                        <span className="text-xs text-slate-400 font-mono">{filteredProducts.length} {isAr ? "منتجات" : "items"}</span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                              <th className="py-2.5 px-3">{t.productName}</th>
                              <th className="py-2.5 px-3 font-mono">{t.productBarcode}</th>
                              <th className="py-2.5 px-3">{t.stock}</th>
                              <th className="py-2.5 px-3 font-mono">{t.retail}</th>
                              <th className="py-2.5 px-3 font-mono">{t.wholesale}</th>
                              <th className="py-2.5 px-3 font-mono">{t.cost}</th>
                              <th className="py-2.5 px-3 text-right">{t.actions}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/50">
                            {filteredProducts.map(p => {
                              const isLow = p.stockQuantity <= p.minStockAlert;
                              return (
                                <tr key={p.id} className="hover:bg-slate-850/30">
                                  <td className="py-3 px-3">
                                    <span className="font-semibold">{p.name.split("-")[0]}</span>
                                    {p.serialNumber && <div className="text-[10px] text-indigo-400 font-mono">S/N: {p.serialNumber}</div>}
                                  </td>
                                  <td className="py-3 px-3 font-mono text-slate-400">{p.barcode}</td>
                                  <td className="py-3 px-3">
                                    <span className={`px-2 py-0.5 rounded-full font-bold font-mono text-[11px] ${
                                      isLow ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                                    }`}>
                                      {p.stockQuantity}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 font-mono font-bold text-indigo-400">{p.retailPrice.toFixed(2)} $</td>
                                  <td className="py-3 px-3 font-mono text-slate-300">{p.wholesalePrice.toFixed(2)} $</td>
                                  <td className="py-3 px-3 font-mono text-slate-400">{p.costPrice.toFixed(2)} $</td>
                                  <td className="py-3 px-3 text-right">
                                    <button
                                      onClick={() => {
                                        const extra = prompt(isAr ? "أدخل الكمية الإضافية لتوريد المخزن:" : "Enter additional stock quantity to replenish:", "50");
                                        if (extra) {
                                          updateProduct(p.id, { stockQuantity: p.stockQuantity + Number(extra) });
                                          triggerToast(isAr ? `تم تحديث رصيد ${p.name.split("-")[0]}` : `Replenished ${p.name.split("-")[0]}`);
                                        }
                                      }}
                                      className="text-indigo-400 hover:text-indigo-300 mr-2 hover:underline text-[11px]"
                                    >
                                      {isAr ? "توريد" : "Replenish"}
                                    </button>
                                    <button
                                      onClick={() => deleteProduct(p.id)}
                                      className="text-rose-400 hover:text-rose-300 hover:underline text-[11px]"
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
              )}

              {/* TAB 3: CLIENTS & SUPPLIERS */}
              {activeTab === "partners" && (
                <div className="space-y-6">
                  
                  {/* Loyalty Overview and Add panels */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    
                    {/* Loyalty Customers Panel */}
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                        <h2 className="font-bold text-base flex items-center gap-2">
                          <Award className="w-5 h-5 text-indigo-400 animate-pulse" />
                          <span>{t.customerLoyalty}</span>
                        </h2>
                      </div>

                      {/* Add Customer Form */}
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="text-slate-400 mb-1 block">{t.customerName}</label>
                          <input
                            type="text"
                            value={newCust.name}
                            onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 mb-1 block">{t.phone}</label>
                          <input
                            type="text"
                            value={newCust.phone}
                            onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 font-mono"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={() => {
                              if (!newCust.name || !newCust.phone) {
                                triggerToast(isAr ? "الرجاء ملء الاسم والجوال!" : "Fill Name and Phone!");
                                return;
                              }
                              addCustomer(newCust);
                              setNewCust({ name: "", phone: "", email: "", notes: "" });
                              triggerToast(isAr ? "تم تسجيل عميل جديد" : "Loyalty customer registered!");
                            }}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 py-1.5 rounded font-bold transition-all cursor-pointer text-slate-100"
                          >
                            {t.addCustomer}
                          </button>
                        </div>
                      </div>

                      {/* Customers Table */}
                      <div className="overflow-x-auto max-h-[250px]">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400">
                              <th className="py-2 px-1">{t.customerName}</th>
                              <th className="py-2 px-1 font-mono">{t.phone}</th>
                              <th className="py-2 px-1 font-mono">{t.debts}</th>
                              <th className="py-2 px-1">{t.loyaltyPoints}</th>
                              <th className="py-2 px-1 text-right">{t.actions}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {state.customers.map(c => (
                              <tr key={c.id} className="border-b border-slate-850">
                                <td className="py-2.5 px-1 font-medium">{c.name}</td>
                                <td className="py-2.5 px-1 font-mono text-slate-400">{c.phone}</td>
                                <td className="py-2.5 px-1 font-mono text-rose-400 font-bold">{c.debtAmount.toFixed(2)} $</td>
                                <td className="py-2.5 px-1">
                                  <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-mono font-bold">
                                    {c.loyaltyPoints} PTS
                                  </span>
                                </td>
                                <td className="py-2.5 px-1 text-right">
                                  {c.debtAmount > 0 && (
                                    <button
                                      onClick={() => {
                                        const payment = prompt(isAr ? `تسديد من ديون ${c.name}:` : `Pay debts for ${c.name}:`, "50");
                                        if (payment) {
                                          recordCustomerPayment(c.id, Number(payment));
                                          triggerToast(isAr ? "تم قيد سداد الديون بنجاح" : "Debt payment recorded!");
                                        }
                                      }}
                                      className="text-emerald-400 hover:underline mr-2"
                                    >
                                      {isAr ? "سداد" : "Settle"}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Suppliers Accounts Panel */}
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                      <h2 className="font-bold text-base border-b border-slate-800 pb-3 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-400" />
                        <span>{t.supplierManagement}</span>
                      </h2>

                      {/* Add Supplier Form */}
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="text-slate-400 mb-1 block">{t.supplierName}</label>
                          <input
                            type="text"
                            value={newSupp.name}
                            onChange={(e) => setNewSupp({ ...newSupp, name: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 mb-1 block">{t.supplierCompany}</label>
                          <input
                            type="text"
                            value={newSupp.companyName}
                            onChange={(e) => setNewSupp({ ...newSupp, companyName: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={() => {
                              if (!newSupp.name) return;
                              addSupplier(newSupp);
                              setNewSupp({ name: "", phone: "", companyName: "", debtAmount: 0 });
                              triggerToast(isAr ? "تم تسجيل المورد الجديد" : "Supplier registered!");
                            }}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 py-1.5 rounded font-bold transition-all cursor-pointer text-slate-100"
                          >
                            {t.addSupplier}
                          </button>
                        </div>
                      </div>

                      {/* Suppliers Table */}
                      <div className="overflow-x-auto max-h-[250px]">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400">
                              <th className="py-2 px-1">{t.supplierName}</th>
                              <th className="py-2 px-1">{t.supplierCompany}</th>
                              <th className="py-2 px-1 font-mono">{t.supplierDebt}</th>
                              <th className="py-2 px-1 text-right">{t.actions}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {state.suppliers.map(s => (
                              <tr key={s.id} className="border-b border-slate-850">
                                <td className="py-2.5 px-1 font-medium">{s.name}</td>
                                <td className="py-2.5 px-1 text-slate-400">{s.companyName}</td>
                                <td className="py-2.5 px-1 font-mono text-amber-400 font-bold">{s.debtAmount.toFixed(2)} $</td>
                                <td className="py-2.5 px-1 text-right">
                                  {s.debtAmount > 0 && (
                                    <button
                                      onClick={() => {
                                        const payAmt = prompt(isAr ? `دفع دفعة مالية للمورد ${s.name}:` : `Pay balance to ${s.name}:`, "500");
                                        if (payAmt) {
                                          recordSupplierPayment(s.id, Number(payAmt));
                                          triggerToast(isAr ? "تم تسجيل سداد المورد" : "Supplier bill settled!");
                                        }
                                      }}
                                      className="text-emerald-400 hover:underline"
                                    >
                                      {isAr ? "تسديد" : "Settle Pay"}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: PAYROLL & OPERATIONAL EXPENSES */}
              {activeTab === "payroll" && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  
                  {/* Expense tracker panel */}
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <h2 className="font-bold text-base border-b border-slate-800 pb-3 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-indigo-400" />
                      <span>{t.expensesManagement}</span>
                    </h2>

                    {/* Record Expense Form */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3.5 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-400 block mb-1">{t.expenseCategory}</label>
                          <select
                            value={newExp.category}
                            onChange={(e) => setNewExp({ ...newExp, category: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-2 text-slate-300"
                          >
                            <option value="إيجار / Rent">إيجار / Rent</option>
                            <option value="فواتير / Utilities">فواتير / Utilities</option>
                            <option value="بضاعة ومشتريات / Raw Materials">بضاعة ومشتريات / Raw Materials</option>
                            <option value="أخرى / Others">أخرى / Others</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1">{t.expenseAmount}</label>
                          <input
                            type="number"
                            value={newExp.amount}
                            onChange={(e) => setNewExp({ ...newExp, amount: Number(e.target.value) })}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-2 text-slate-100 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">{t.expenseNotes}</label>
                        <input
                          type="text"
                          value={newExp.notes}
                          onChange={(e) => setNewExp({ ...newExp, notes: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-2"
                        />
                      </div>

                      <button
                        onClick={() => {
                          if (newExp.amount <= 0) return;
                          addExpense(newExp);
                          setNewExp({ category: "إيجار / Rent", amount: 0, notes: "" });
                          triggerToast(isAr ? "تم تقييد المصروف الجديد" : "Expense recorded successfully!");
                        }}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 font-bold rounded transition-colors cursor-pointer text-slate-100"
                      >
                        {t.addExpense}
                      </button>
                    </div>

                    {/* Expenses Table */}
                    <div className="overflow-x-auto max-h-[220px]">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400">
                            <th className="py-2 px-1">{t.expenseCategory}</th>
                            <th className="py-2 px-1 font-mono">{t.expenseAmount}</th>
                            <th className="py-2 px-1">{t.expenseNotes}</th>
                            <th className="py-2 px-1 font-mono">التاريخ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {state.expenses.map(exp => (
                            <tr key={exp.id} className="border-b border-slate-850">
                              <td className="py-2 px-1 font-semibold">{exp.category}</td>
                              <td className="py-2 px-1 font-mono text-indigo-400 font-bold">{exp.amount.toFixed(2)} $</td>
                              <td className="py-2 px-1 text-slate-400 max-w-[150px] truncate">{exp.notes}</td>
                              <td className="py-2 px-1 font-mono text-[10px] text-slate-500">{exp.timestamp.slice(0, 10)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Salaries payroll panel */}
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <h2 className="font-bold text-base border-b border-slate-800 pb-3 flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-400" />
                      <span>{t.salaryManagement}</span>
                    </h2>

                    {/* Add Salary payout Form */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3.5 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-400 block mb-1">{t.employeeName}</label>
                          <input
                            type="text"
                            value={newSal.employeeName}
                            onChange={(e) => setNewSal({ ...newSal, employeeName: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-2 text-slate-100"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1">{t.baseSalary}</label>
                          <input
                            type="number"
                            value={newSal.baseSalary}
                            onChange={(e) => setNewSal({ ...newSal, baseSalary: Number(e.target.value) })}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-2 text-slate-100 font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-400 block mb-1">{t.bonus}</label>
                          <input
                            type="number"
                            value={newSal.bonuses}
                            onChange={(e) => setNewSal({ ...newSal, bonuses: Number(e.target.value) })}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-2 text-slate-100 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1">{t.deductions}</label>
                          <input
                            type="number"
                            value={newSal.deductions}
                            onChange={(e) => setNewSal({ ...newSal, deductions: Number(e.target.value) })}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-2 text-slate-100 font-mono"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (!newSal.employeeName) return;
                          addSalaryPayout(newSal);
                          setNewSal({ employeeName: "", baseSalary: 2500, bonuses: 0, deductions: 0, notes: "" });
                          triggerToast(isAr ? "تم تسجيل صرف الراتب والمستحقات المعتمدة" : "Staff salary paid out successfully!");
                        }}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 font-bold rounded transition-colors cursor-pointer text-slate-100"
                      >
                        {t.addSalary}
                      </button>
                    </div>

                    {/* Payroll Table */}
                    <div className="overflow-x-auto max-h-[170px]">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400">
                            <th className="py-2 px-1">{t.employeeName}</th>
                            <th className="py-2 px-1 font-mono">الأساسي</th>
                            <th className="py-2 px-1 font-mono">مكافآت / خصومات</th>
                            <th className="py-2 px-1 font-mono">صافي الرواتب</th>
                          </tr>
                        </thead>
                        <tbody>
                          {state.salaries.map(sal => (
                            <tr key={sal.id} className="border-b border-slate-850">
                              <td className="py-2 px-1 font-medium">{sal.employeeName}</td>
                              <td className="py-2 px-1 font-mono text-slate-300">{sal.baseSalary} $</td>
                              <td className="py-2 px-1 font-mono text-slate-400">+{sal.bonuses} / -{sal.deductions}</td>
                              <td className="py-2 px-1 font-mono text-indigo-400 font-bold">
                                {(sal.baseSalary + sal.bonuses - sal.deductions).toFixed(2)} $
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 5: REPORTS & DATA ANALYTICS */}
              {activeTab === "reports" && (
                <div className="space-y-6">
                  
                  {/* Financial overview KPI blocks */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400 font-medium mb-1">{t.totalSales}</p>
                        <h3 className="text-2xl font-bold text-emerald-400">{totalSalesRevenue.toFixed(2)} $</h3>
                      </div>
                      <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400 font-medium mb-1">{t.totalExpenses}</p>
                        <h3 className="text-2xl font-bold text-rose-400">{totalExpensesCost.toFixed(2)} $</h3>
                      </div>
                      <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400">
                        <DollarSign className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400 font-medium mb-1">{t.netProfit}</p>
                        <h3 className="text-2xl font-bold text-indigo-400">{estimatedNetProfit.toFixed(2)} $</h3>
                      </div>
                      <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                        <Award className="w-6 h-6 animate-spin-slow text-indigo-300" />
                      </div>
                    </div>
                  </div>

                  {/* Interactive Charts Panel */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    
                    {/* Bar Chart: Sales Comparison by branch */}
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                      <h3 className="font-bold text-sm mb-4">{t.salesByBranch}</h3>
                      <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={branchSalesData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                            <YAxis stroke="#94a3b8" fontSize={11} />
                            <ChartTooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }} />
                            <Legend />
                            <Bar dataKey="Sales" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Visitors" fill="#10b981" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Sales trend hourly */}
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                      <h3 className="font-bold text-sm mb-4">{isAr ? "مخطط حركة البيع الزمني" : "Sales Transaction Timeline"}</h3>
                      <div className="h-72 w-full">
                        {salesTrendData.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                            {isAr ? "لا توجد حركات مبيعات كافية اليوم للمخطط" : "No sales data today"}
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesTrendData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                              <YAxis stroke="#94a3b8" fontSize={11} />
                              <ChartTooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }} />
                              <Line type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>

                    {/* Pie share of Categories */}
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                      <h3 className="font-bold text-sm mb-4">{t.categoryShare}</h3>
                      <div className="h-64 flex flex-col md:flex-row items-center justify-around gap-4">
                        <div className="h-48 w-48 shrink-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={categoryShareData}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={60}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {categoryShareData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="space-y-2 text-xs">
                          {categoryShareData.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                              <span className="text-slate-300 font-medium">{item.name}</span>
                              <span className="text-slate-500 font-mono">({item.value} $)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Audit Trail List in Reports */}
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3.5">
                      <h3 className="font-bold text-sm border-b border-slate-800 pb-2.5">{t.auditLogs}</h3>
                      <div className="space-y-2.5 max-h-[220px] overflow-y-auto">
                        {state.auditLogs.map(log => (
                          <div key={log.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 text-xs flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-slate-200">{log.action}</p>
                              <p className="text-slate-400 text-[11px]">{log.details}</p>
                            </div>
                            <div className="text-right font-mono">
                              <p className="text-slate-500 text-[10px]">{log.timestamp.slice(11, 19)}</p>
                              <p className="text-[10px] text-indigo-400">{log.userName.split(" ")[0]}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 6: SECURITY, MANIFEST & SYNC */}
              {activeTab === "sync" && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  
                  {/* Sync Settings */}
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-5">
                    <h2 className="font-bold text-base border-b border-slate-800 pb-3 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-indigo-400 animate-spin-slow" />
                      <span>{t.syncStatusTitle}</span>
                    </h2>

                    <div className="space-y-4 text-xs">
                      <div className="p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-xl space-y-2">
                        <h4 className="font-bold text-indigo-400">{isAr ? "مستوى الصلاحيات الفعال" : "Role Rights Mode"}</h4>
                        <p className="text-slate-300 leading-relaxed">
                          {isAr
                            ? "تتمتع صلاحية (Admin المدير العام) بجميع الحقوق لتعديل الأسعار وإجراء المردودات وتصدير قواعد البيانات."
                            : "General Admin role possesses full execution rights over modifying prices, exporting databases, and processing cash returns."}
                        </p>
                      </div>

                      <div className="space-y-2.5">
                        <label className="text-slate-400 font-medium block">{t.userRole}</label>
                        <div className="flex gap-2">
                          {[UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER].map(role => (
                            <button
                              key={role}
                              onClick={() => {
                                updateUserRole(state.currentUser.id, role);
                                triggerToast(isAr ? `تم تعديل الصلاحية الفعالة إلى ${role}` : `Role shifted to ${role}`);
                              }}
                              className={`px-3 py-1.5 rounded-lg font-bold border transition-all ${
                                state.currentUser.role === role
                                  ? "bg-indigo-600 border-indigo-500 text-white"
                                  : "bg-slate-950 border-slate-800 text-slate-400"
                              }`}
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Manual Sync Trigger */}
                      <div className="pt-4 border-t border-slate-800/50">
                        <button
                          onClick={() => {
                            syncBranches();
                            triggerToast(t.syncSuccess);
                          }}
                          className="w-full py-3.5 bg-gradient-to-tr from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-slate-100"
                        >
                          <RefreshCw className="w-4 h-4 animate-spin-slow" />
                          <span>{t.syncBranches}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Manual Backup and JSON restore */}
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <h2 className="font-bold text-base border-b border-slate-800 pb-3 flex items-center gap-2">
                      <Database className="w-5 h-5 text-indigo-400" />
                      <span>{t.backupRestore}</span>
                    </h2>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {isAr
                        ? "يتيح لك نظام إكس كاش سحب نسخة كاملة من قاعدة بيانات المحل للمبيعات والمخزن، لضمان السرية والأمان الكامل وعدم فقدان البيانات في حال تغيير المتصفح."
                        : "Xcash provides simple raw backup procedures that export your full invoices, stock registers, and payroll states to a local encrypted schema JSON file."}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 text-xs">
                      
                      {/* Export */}
                      <button
                        onClick={handleExportDB}
                        className="py-3 bg-slate-950 hover:bg-slate-850 text-slate-200 border border-slate-800 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <Download className="w-4 h-4 text-indigo-400" />
                        <span>{t.exportData}</span>
                      </button>

                      {/* Import */}
                      <label className="py-3 bg-slate-950 hover:bg-slate-850 text-slate-200 border border-slate-800 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors text-center">
                        <Upload className="w-4 h-4 text-emerald-400" />
                        <span>{t.importData}</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportDB}
                          className="hidden"
                        />
                      </label>

                    </div>
                  </div>

                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* RETAIL INVOICE PRINT SIMULATOR MODAL */}
      <AnimatePresence>
        {activeReceipt && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Size selectors */}
              <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[
                    { id: "58mm", label: "58mm (ريسيت)" },
                    { id: "80mm", label: "80mm (ريسيت)" },
                    { id: "A4", label: "A4 (رئيسي)" }
                  ].map(sz => (
                    <button
                      key={sz.id}
                      onClick={() => setReceiptSize(sz.id as any)}
                      className={`px-2.5 py-1 text-xs rounded font-bold border transition-colors ${
                        receiptSize === sz.id ? "bg-indigo-600 border-indigo-500 text-white" : "bg-slate-900 border-slate-800 text-slate-400"
                      }`}
                    >
                      {sz.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setActiveReceipt(null)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* simulated physical receipt container */}
              <div className="flex-1 p-6 overflow-y-auto max-h-[450px] bg-slate-950 flex justify-center">
                
                {/* Physical styled receipt body */}
                <div
                  className={`receipt-paper p-5 shadow-inner border border-slate-200 ${
                    receiptSize === "58mm" ? "w-[240px]" : receiptSize === "80mm" ? "w-[320px]" : "w-[440px]"
                  }`}
                >
                  <div className="text-center space-y-1 pb-4 border-b border-dashed border-gray-400">
                    <h3 className="font-bold text-sm tracking-tight">إكس كاش برو POS</h3>
                    <p className="text-[10px] text-gray-500">فرع الرياض الرئيسي</p>
                    <p className="text-[10px] text-gray-500">الرقم الضريبي: 300059218200003</p>
                  </div>

                  <div className="py-3 text-[10px] space-y-1 border-b border-dashed border-gray-400 font-mono">
                    <div className="flex justify-between">
                      <span>الفاتورة: {activeReceipt.invoiceNumber}</span>
                      <span>التاريخ: {activeReceipt.timestamp.slice(0,10)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>البائع: {activeReceipt.userName.split(" ")[0]}</span>
                      <span>العميل: {activeReceipt.customerName || "عميل نقدي عام"}</span>
                    </div>
                  </div>

                  {/* items list */}
                  <table className="w-full text-left text-[10px] py-3 font-mono border-b border-dashed border-gray-400">
                    <thead>
                      <tr className="border-b border-gray-300 font-bold">
                        <th className="py-1">{t.productName}</th>
                        <th className="py-1 text-center">{t.quantity}</th>
                        <th className="py-1 text-right">المجموع</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeReceipt.items.map((it, idx) => {
                        const price = it.selectedPriceType === "retail"
                          ? it.product.retailPrice
                          : it.selectedPriceType === "wholesale"
                            ? it.product.wholesalePrice
                            : it.product.superWholesalePrice;
                        return (
                          <tr key={idx} className="border-b border-gray-100">
                            <td className="py-1 max-w-[120px] truncate">{it.product.name.split("-")[0]}</td>
                            <td className="py-1 text-center">{it.quantity}</td>
                            <td className="py-1 text-right font-bold">{(price * it.quantity).toFixed(2)} $</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Pricing footer summary */}
                  <div className="py-3 text-[10px] font-mono space-y-1 text-right">
                    <div className="flex justify-between">
                      <span>{t.subtotal}:</span>
                      <span>{activeReceipt.subtotal.toFixed(2)} $</span>
                    </div>
                    {activeReceipt.discount > 0 && (
                      <div className="flex justify-between text-rose-600 font-bold">
                        <span>{t.discount}:</span>
                        <span>-{activeReceipt.discount.toFixed(2)} $</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>{t.tax}:</span>
                      <span>{activeReceipt.tax.toFixed(2)} $</span>
                    </div>
                    <div className="flex justify-between font-bold text-xs pt-1.5 border-t border-gray-300">
                      <span>{t.total}:</span>
                      <span>{activeReceipt.total.toFixed(2)} $</span>
                    </div>
                  </div>

                  {/* Simulated QR Code for VAT compliance (ZATCA requirement) */}
                  <div className="flex flex-col items-center justify-center pt-4 space-y-2">
                    <div className="w-20 h-20 bg-gray-100 border border-gray-300 p-1 rounded flex flex-wrap items-center justify-center opacity-85">
                      <div className="grid grid-cols-4 gap-0.5">
                        {Array.from({ length: 64 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 ${
                              (i * 3 + activeReceipt.total * 5) % 7 === 0 || i % 5 === 0 ? "bg-black" : "bg-white"
                            }`}
                          ></div>
                        ))}
                      </div>
                    </div>
                    <p className="text-[8px] text-gray-500 font-mono">فاتورة مبسطة معتمدة من هيئة الزكاة</p>
                  </div>

                </div>

              </div>

              {/* physical triggers */}
              <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-lg flex items-center gap-2 cursor-pointer text-slate-100"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t.printA4}</span>
                </button>
                <button
                  onClick={() => setActiveReceipt(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-bold rounded-lg"
                >
                  {t.closeReceipt}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING AI ASSISTANT PANEL */}
      <AnimatePresence>
        {isAssistantOpen && (
          <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
            
            {/* AI Assistant Title Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-spin-slow" />
                <h3 className="font-bold text-sm bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                  {t.assistantTitle}
                </h3>
              </div>
              <button
                onClick={() => setIsAssistantOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body messages list */}
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
                        : "bg-slate-950 text-slate-300 rounded-bl-none border border-slate-850"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isAssistantLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-950 text-slate-400 rounded-2xl rounded-bl-none border border-slate-850 px-3.5 py-2.5 text-xs flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}

              {/* Pending Interactive command confirmations */}
              {pendingAction && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-violet-950/20 border border-violet-500/20 rounded-xl space-y-2"
                >
                  <p className="text-[11px] text-violet-300 font-medium">
                    {isAr ? "مساعد الذكاء الاصطناعي يقترح إجراء الإجراء التالي:" : "AI suggests completing following action:"}
                  </p>
                  <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
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

            {/* AI Input Form */}
            <form onSubmit={handleAISend} className="p-3 border-t border-slate-800 bg-slate-950/80 flex gap-2">
              <input
                type="text"
                placeholder={t.assistantPlaceholder}
                value={assistantInput}
                onChange={(e) => setAssistantInput(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
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
