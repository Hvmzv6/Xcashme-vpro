/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from "react";
import { useOfflineSyncQueue } from "./useOfflineSyncQueue";
import {
  POSState,
  Product,
  Category,
  Customer,
  Supplier,
  Sale,
  CartItem,
  PaymentMethod,
  OrderStatus,
  Expense,
  SalaryPayout,
  AuditLog,
  Branch,
  User,
  UserRole
} from "../../types/pos";

// Generate guaranteed unique IDs across rapid loops and bulk operations
const generateUniqueId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
};

// High-quality bilingual mock initial data
const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    barcode: "6281100112233",
    name: "Premium Mineral Water 330ml",
    category: "Beverages",
    costPrice: 0.25,
    retailPrice: 0.50,
    wholesalePrice: 0.40,
    superWholesalePrice: 0.35,
    stockQuantity: 450,
    minStockAlert: 50,
    hasExpiry: true,
    expiryDate: "2027-12-01"
  },
  {
    id: "prod-2",
    barcode: "6281100445566",
    name: "Dark Chocolate 100g",
    category: "Confectionery",
    costPrice: 1.50,
    retailPrice: 3.00,
    wholesalePrice: 2.50,
    superWholesalePrice: 2.20,
    stockQuantity: 12, // Critical alert!
    minStockAlert: 20,
    hasExpiry: true,
    expiryDate: "2026-11-15"
  },
  {
    id: "prod-3",
    barcode: "6281100998877",
    name: "Olive Oil Extra Virgin 1L",
    category: "Groceries",
    costPrice: 6.00,
    retailPrice: 12.00,
    wholesalePrice: 10.00,
    superWholesalePrice: 9.00,
    stockQuantity: 80,
    minStockAlert: 15,
    hasExpiry: false
  },
  {
    id: "prod-4",
    barcode: "6281101223344",
    name: "Arabic Coffee Ground 500g",
    category: "Groceries",
    costPrice: 4.50,
    retailPrice: 8.50,
    wholesalePrice: 7.20,
    superWholesalePrice: 6.80,
    stockQuantity: 110,
    minStockAlert: 25,
    hasExpiry: true,
    expiryDate: "2027-03-10"
  },
  {
    id: "prod-5",
    barcode: "SN-9821849",
    name: "Wireless Headphones Pro",
    category: "Electronics",
    costPrice: 35.00,
    retailPrice: 59.00,
    wholesalePrice: 50.00,
    superWholesalePrice: 46.00,
    stockQuantity: 15,
    minStockAlert: 5,
    hasExpiry: false,
    serialNumber: "XHP-2026-0091"
  }
];

const INITIAL_CATEGORIES: Category[] = [
  { id: "cat-1", name: "مواد غذائية / Groceries", description: "المواد الغذائية والتموينية الأساسية" },
  { id: "cat-2", name: "مشروبات / Beverages", description: "العصائر، المياه، المياه الغازية والساخنة" },
  { id: "cat-3", name: "حلويات / Confectionery", description: "البسكويت، الشوكولاتة، والمسليات" },
  { id: "cat-4", name: "إلكترونيات / Electronics", description: "الأجهزة الإلكترونية الصغيرة والملحقات" }
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "cust-1",
    name: "أحمد بن علي - Ahmed Bin Ali",
    phone: "0501122334",
    email: "ahmed@example.com",
    debtAmount: 120.50, // Has some debt
    loyaltyPoints: 340,
    branchId: "branch-riyadh",
    notes: "عميل متميز - تفضيل السداد الآجل"
  },
  {
    id: "cust-2",
    name: "سارة الشمري - Sara Al-Shammari",
    phone: "0559988776",
    email: "sara@example.com",
    debtAmount: 0.00,
    loyaltyPoints: 850,
    branchId: "branch-riyadh",
    notes: "نقاط ولاء عالية"
  }
];

const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: "supp-1",
    name: "شركة المراعي المحدودة - Almarai Co",
    phone: "920000222",
    companyName: "Almarai Company",
    debtAmount: 4500.00, // We owe them money
    branchId: "branch-riyadh"
  },
  {
    id: "supp-2",
    name: "موزع الإلكترونيات المعتمد - ElectroDist",
    phone: "0114050607",
    companyName: "ElectroDist Arabia",
    debtAmount: 0.00,
    branchId: "branch-riyadh"
  }
];

const INITIAL_BRANCHES: Branch[] = [
  { id: "branch-riyadh", name: "فرع الرياض الرئيسي - Riyadh Main", location: "الرياض، العليا", status: "online", lastSyncTime: "الآن" },
  { id: "branch-jeddah", name: "فرع جدة - Jeddah Branch", location: "جدة، الروضة", status: "online", lastSyncTime: "قبل دقيقة" },
  { id: "branch-dammam", name: "فرع الدمام - Dammam Branch", location: "الدمام، الشاطئ", status: "offline", lastSyncTime: "قبل ساعتين" }
];

const INITIAL_USER: User = {
  id: "user-active",
  name: "حمزة الصفصفي - Operator",
  username: "admin_hamza",
  role: UserRole.ADMIN,
  branchId: "branch-riyadh",
  isActive: true
};

const INITIAL_SALES: Sale[] = [
  {
    id: "sale-101",
    invoiceNumber: "INV-2026-0001",
    items: [
      {
        product: INITIAL_PRODUCTS[2],
        quantity: 2,
        selectedPriceType: "retail",
        discountAmount: 0
      },
      {
        product: INITIAL_PRODUCTS[0],
        quantity: 6,
        selectedPriceType: "wholesale",
        discountAmount: 0
      }
    ],
    subtotal: 26.40,
    discount: 2.00,
    tax: 3.66,
    total: 28.06,
    paymentMethod: PaymentMethod.CASH,
    customerId: "cust-1",
    customerName: "أحمد بن علي",
    status: OrderStatus.COMPLETED,
    branchId: "branch-riyadh",
    userId: "user-active",
    userName: "حمزة الصفصفي",
    timestamp: "2026-06-29T14:30:00-07:00"
  }
];

const INITIAL_EXPENSES: Expense[] = [
  { id: "exp-1", category: "إيجار / Rent", amount: 1500, notes: "دفعة إيجار المستودع الشهري", timestamp: "2026-06-25T10:00:00-07:00", branchId: "branch-riyadh" },
  { id: "exp-2", category: "فواتير / Utilities", amount: 245.50, notes: "فاتورة الكهرباء والإنترنت", timestamp: "2026-06-28T18:15:00-07:00", branchId: "branch-riyadh" }
];

const INITIAL_SALARIES: SalaryPayout[] = [
  { id: "sal-1", employeeName: "خالد المحسن - Cashier 1", baseSalary: 1200, bonuses: 150, deductions: 50, notes: "راتب شهر يونيو مع مكافأة كفاءة مبيعات", payoutDate: "2026-06-28", branchId: "branch-riyadh" }
];

const INITIAL_LOGS: AuditLog[] = [
  { id: "log-1", userId: "user-active", userName: "حمزة الصفصفي", userRole: UserRole.ADMIN, action: "تسجيل الدخول / Login", details: "تم الدخول بنجاح للنظام من فرع الرياض", timestamp: "2026-06-29T17:03:00-07:00", branchId: "branch-riyadh" }
];

const INITIAL_ROLE_PINS: Record<UserRole, string> = {
  [UserRole.ADMIN]: "9999",
  [UserRole.MANAGER]: "1234",
  [UserRole.CASHIER]: "0000"
};

export function usePOSState() {
  const offlineSync = useOfflineSyncQueue();

  const [state, setState] = useState<POSState>(() => {
    const saved = localStorage.getItem("xcash_pos_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure robustness against undefined values in localStorage and deduplicate duplicate product IDs
        const seenIds = new Set<string>();
        const sanitizedProducts = (parsed.products || []).map((p: any, idx: number) => {
          let id = p.id || `prod-${idx}`;
          if (seenIds.has(id)) {
            id = `${id}-${idx}-${Math.random().toString(36).substring(2, 6)}`;
          }
          seenIds.add(id);
          return {
            ...p,
            id,
            costPrice: typeof p.costPrice === "number" ? p.costPrice : 0,
            retailPrice: typeof p.retailPrice === "number" ? p.retailPrice : 0,
            wholesalePrice: typeof p.wholesalePrice === "number" ? p.wholesalePrice : 0,
            superWholesalePrice: typeof p.superWholesalePrice === "number" ? p.superWholesalePrice : 0,
            stockQuantity: typeof p.stockQuantity === "number" ? p.stockQuantity : 0,
            minStockAlert: typeof p.minStockAlert === "number" ? p.minStockAlert : 0,
            hasExpiry: !!p.hasExpiry,
          };
        });
        
        const sanitizedCustomers = (parsed.customers || []).map((c: any) => ({
          ...c,
          debtAmount: typeof c.debtAmount === "number" ? c.debtAmount : 0,
          loyaltyPoints: typeof c.loyaltyPoints === "number" ? c.loyaltyPoints : 0,
        }));

        const sanitizedSuppliers = (parsed.suppliers || []).map((s: any) => ({
          ...s,
          debtAmount: typeof s.debtAmount === "number" ? s.debtAmount : 0,
        }));

        const sanitizedSales = (parsed.sales || []).map((s: any) => ({
          ...s,
          subtotal: typeof s.subtotal === "number" ? s.subtotal : 0,
          discount: typeof s.discount === "number" ? s.discount : 0,
          tax: typeof s.tax === "number" ? s.tax : 0,
          total: typeof s.total === "number" ? s.total : 0,
          items: (s.items || []).map((item: any) => ({
            ...item,
            quantity: typeof item.quantity === "number" ? item.quantity : 1,
            discountAmount: typeof item.discountAmount === "number" ? item.discountAmount : 0,
            product: item.product ? {
              ...item.product,
              costPrice: typeof item.product.costPrice === "number" ? item.product.costPrice : 0,
              retailPrice: typeof item.product.retailPrice === "number" ? item.product.retailPrice : 0,
              wholesalePrice: typeof item.product.wholesalePrice === "number" ? item.product.wholesalePrice : 0,
              superWholesalePrice: typeof item.product.superWholesalePrice === "number" ? item.product.superWholesalePrice : 0,
              stockQuantity: typeof item.product.stockQuantity === "number" ? item.product.stockQuantity : 0,
            } : {}
          }))
        }));

        const sanitizedExpenses = (parsed.expenses || []).map((e: any) => ({
          ...e,
          amount: typeof e.amount === "number" ? e.amount : 0,
        }));

        const sanitizedSalaries = (parsed.salaries || []).map((s: any) => ({
          ...s,
          baseSalary: typeof s.baseSalary === "number" ? s.baseSalary : 0,
          bonuses: typeof s.bonuses === "number" ? s.bonuses : 0,
          deductions: typeof s.deductions === "number" ? s.deductions : 0,
        }));

        return {
          ...parsed,
          products: sanitizedProducts,
          categories: parsed.categories || INITIAL_CATEGORIES,
          customers: sanitizedCustomers,
          suppliers: sanitizedSuppliers,
          sales: sanitizedSales,
          expenses: sanitizedExpenses,
          salaries: sanitizedSalaries,
          auditLogs: parsed.auditLogs || INITIAL_LOGS,
          branches: parsed.branches || INITIAL_BRANCHES,
          suspendedCarts: parsed.suspendedCarts || [],
          currentUser: parsed.currentUser || INITIAL_USER,
          activeBranchId: parsed.activeBranchId || "branch-riyadh",
          language: parsed.language || "ar",
          theme: parsed.theme || "dark",
          rolePins: parsed.rolePins || INITIAL_ROLE_PINS
        };
      } catch (e) {
        console.error("Failed to parse saved POS state", e);
      }
    }
    return {
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      customers: INITIAL_CUSTOMERS,
      suppliers: INITIAL_SUPPLIERS,
      sales: INITIAL_SALES,
      expenses: INITIAL_EXPENSES,
      salaries: INITIAL_SALARIES,
      auditLogs: INITIAL_LOGS,
      branches: INITIAL_BRANCHES,
      suspendedCarts: [],
      currentUser: INITIAL_USER,
      activeBranchId: "branch-riyadh",
      language: "ar",
      theme: "dark",
      rolePins: INITIAL_ROLE_PINS
    };
  });

  // Load state from local SQLite file on desktop app initialization
  useEffect(() => {
    fetch("/api/db/load")
      .then(res => res.json())
      .then(data => {
        if (data.status === "success" && data.data) {
          setState(prev => {
            const seenIds = new Set<string>();
            const dedupedProducts = (data.data.products || []).map((p: any, idx: number) => {
              let id = p.id || `prod-${idx}`;
              if (seenIds.has(id)) {
                id = `${id}-${idx}-${Math.random().toString(36).substring(2, 6)}`;
              }
              seenIds.add(id);
              return { ...p, id };
            });
            return {
              ...prev,
              ...data.data,
              products: dedupedProducts
            };
          });
          console.log("[Desktop POS] Loaded database from local SQLite:", data.dbPath);
        }
      })
      .catch(err => {
        console.warn("[Desktop POS] Local SQLite API not available (running browser-only mode):", err);
      });
  }, []);

  // Keep localStorage and desktop SQLite database in sync
  useEffect(() => {
    localStorage.setItem("xcash_pos_state", JSON.stringify(state));
    // Asynchronously save to desktop SQLite
    fetch("/api/db/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state })
    }).catch(() => {
      // Ignore network errors in offline browser mode
    });
  }, [state]);

  const toggleLanguage = useCallback(() => {
    setState(prev => ({
      ...prev,
      language: prev.language === "ar" ? "en" : "ar"
    }));
  }, []);

  const toggleTheme = useCallback(() => {
    setState(prev => ({
      ...prev,
      theme: prev.theme === "dark" ? "light" : "dark"
    }));
  }, []);

  // Log action helper
  const logAction = useCallback((action: string, details: string) => {
    const newLog: AuditLog = {
      id: generateUniqueId("log"),
      userId: state.currentUser.id,
      userName: state.currentUser.name,
      userRole: state.currentUser.role,
      action,
      details,
      timestamp: new Date().toISOString(),
      branchId: state.activeBranchId
    };
    setState(prev => ({
      ...prev,
      auditLogs: [newLog, ...prev.auditLogs]
    }));
  }, [state.currentUser, state.activeBranchId]);

  // Product Operations
  const addProduct = useCallback((product: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...product,
      id: generateUniqueId("prod")
    };
    setState(prev => ({
      ...prev,
      products: [newProduct, ...prev.products]
    }));
    logAction("إضافة منتج", `تم إضافة المنتج: ${newProduct.name} بسعر قطاعي ${newProduct.retailPrice}`);
  }, [logAction]);

  const addProductsBulk = useCallback((productsList: Omit<Product, "id">[]) => {
    if (productsList.length === 0) return;
    const newProducts: Product[] = productsList.map((product, idx) => ({
      ...product,
      id: generateUniqueId(`prod-${idx}`)
    }));
    setState(prev => {
      const seen = new Set(prev.products.map(p => p.id));
      const dedupedNew = newProducts.map((p, idx) => {
        let id = p.id;
        if (seen.has(id)) {
          id = generateUniqueId(`prod-dup-${idx}`);
        }
        seen.add(id);
        return { ...p, id };
      });
      return {
        ...prev,
        products: [...dedupedNew, ...prev.products]
      };
    });
    logAction("استيراد منتجات جماعي", `تم استيراد ${productsList.length} منتج دفعة واحدة عبر ملف CSV`);
  }, [logAction]);

  const updateProduct = useCallback((id: string, updated: Partial<Product>) => {
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === id ? { ...p, ...updated } : p)
    }));
    const originalName = state.products.find(p => p.id === id)?.name || id;
    logAction("تحديث منتج", `تم تحديث بيانات المنتج: ${originalName}`);
  }, [state.products, logAction]);

  const deleteProduct = useCallback((id: string) => {
    const originalName = state.products.find(p => p.id === id)?.name || id;
    setState(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id)
    }));
    logAction("حذف منتج", `تم حذف المنتج: ${originalName}`);
  }, [state.products, logAction]);

  // Customer Operations
  const addCustomer = useCallback((customer: Omit<Customer, "id" | "branchId" | "loyaltyPoints">) => {
    const newCustomer: Customer = {
      debtAmount: 0,
      ...customer,
      id: generateUniqueId("cust"),
      loyaltyPoints: 0,
      branchId: state.activeBranchId
    };
    setState(prev => ({
      ...prev,
      customers: [newCustomer, ...prev.customers]
    }));
    logAction("إضافة عميل", `تم تسجيل العميل الجديد: ${newCustomer.name}`);
    return newCustomer;
  }, [state.activeBranchId, logAction]);

  const recordCustomerPayment = useCallback((customerId: string, amount: number) => {
    setState(prev => ({
      ...prev,
      customers: prev.customers.map(c => {
        if (c.id === customerId) {
          const newDebt = Math.max(0, c.debtAmount - amount);
          return { ...c, debtAmount: Number(newDebt.toFixed(2)) };
        }
        return c;
      })
    }));
    const customerName = state.customers.find(c => c.id === customerId)?.name || customerId;
    logAction("سداد عميل", `تم استلام دفعة مالية بقيمة ${amount} من العميل ${customerName}`);
  }, [state.customers, logAction]);

  // Supplier Operations
  const addSupplier = useCallback((supplier: Omit<Supplier, "id" | "branchId">) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: generateUniqueId("supp"),
      branchId: state.activeBranchId
    };
    setState(prev => ({
      ...prev,
      suppliers: [newSupplier, ...prev.suppliers]
    }));
    logAction("إضافة مورد", `تم تسجيل المورد: ${newSupplier.name}`);
  }, [state.activeBranchId, logAction]);

  const recordSupplierPayment = useCallback((supplierId: string, amount: number) => {
    setState(prev => ({
      ...prev,
      suppliers: prev.suppliers.map(s => {
        if (s.id === supplierId) {
          const newDebt = Math.max(0, s.debtAmount - amount);
          return { ...s, debtAmount: Number(newDebt.toFixed(2)) };
        }
        return s;
      })
    }));
    const supplierName = state.suppliers.find(s => s.id === supplierId)?.name || supplierId;
    logAction("سداد مورد", `تم دفع مبلغ بقيمة ${amount} للمورد ${supplierName}`);
  }, [state.suppliers, logAction]);

  // Sales and Transactions (Checkout)
  const completeCheckout = useCallback((params: {
    items: CartItem[];
    paymentMethod: PaymentMethod;
    customerId?: string;
    discount: number;
    taxRate: number; // e.g. 0.15 for 15% VAT
  }) => {
    const { items, paymentMethod, customerId, discount, taxRate } = params;
    if (items.length === 0) return null;

    const subtotal = items.reduce((acc, item) => {
      let price = item.product.retailPrice;
      if (item.selectedPriceType === "wholesale") price = item.product.wholesalePrice;
      if (item.selectedPriceType === "superWholesale") price = item.product.superWholesalePrice;
      if (item.customPrice !== undefined) price = item.customPrice;
      return acc + (price * item.quantity);
    }, 0);

    const afterDiscount = Math.max(0, subtotal - discount);
    const tax = Number((afterDiscount * taxRate).toFixed(2));
    const total = Number((afterDiscount + tax).toFixed(2));

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const customer = state.customers.find(c => c.id === customerId);

    const newSale: Sale = {
      id: generateUniqueId("sale"),
      invoiceNumber,
      items,
      subtotal: Number(subtotal.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      tax,
      total,
      paymentMethod,
      customerId,
      customerName: customer?.name,
      status: OrderStatus.COMPLETED,
      branchId: state.activeBranchId,
      userId: state.currentUser.id,
      userName: state.currentUser.name,
      timestamp: new Date().toISOString()
    };

    // Update product quantities & alert triggers
    const updatedProducts = state.products.map(product => {
      const cartMatch = items.find(item => item.product.id === product.id);
      if (cartMatch) {
        return {
          ...product,
          stockQuantity: Math.max(0, product.stockQuantity - cartMatch.quantity)
        };
      }
      return product;
    });

    // Update Customer loyalty (e.g., 1 loyalty point per 10 currency spent) and debt if deferred
    const updatedCustomers = state.customers.map(cust => {
      if (cust.id === customerId) {
        const pointsEarned = Math.floor(total / 10);
        const debtAdded = paymentMethod === PaymentMethod.DEFERRED ? total : 0;
        return {
          ...cust,
          loyaltyPoints: cust.loyaltyPoints + pointsEarned,
          debtAmount: Number((cust.debtAmount + debtAdded).toFixed(2))
        };
      }
      return cust;
    });

    setState(prev => ({
      ...prev,
      products: updatedProducts,
      customers: updatedCustomers,
      sales: [newSale, ...prev.sales]
    }));

    logAction("عملية بيع", `تم إصدار الفاتورة ${invoiceNumber} بمبلغ ${total} دفع: ${paymentMethod}`);
    if (!offlineSync.isOnline) {
      offlineSync.enqueueAction(
        "SALE",
        newSale,
        `عملية بيع دون اتصال - فاتورة رقم ${invoiceNumber}`,
        `Offline sale transaction - Invoice ${invoiceNumber}`
      );
    }
    return newSale;
  }, [state.products, state.customers, state.activeBranchId, state.currentUser, logAction, offlineSync]);

  // Expenses & Salary
  const addExpense = useCallback((expense: Omit<Expense, "id" | "timestamp" | "branchId">) => {
    const newExpense: Expense = {
      ...expense,
      id: generateUniqueId("exp"),
      timestamp: new Date().toISOString(),
      branchId: state.activeBranchId
    };
    setState(prev => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses]
    }));
    logAction("تسجيل مصروفات", `تم تسجيل مصروف: ${expense.category} بقيمة ${expense.amount}`);
  }, [state.activeBranchId, logAction]);

  const addSalaryPayout = useCallback((payout: Omit<SalaryPayout, "id" | "branchId">) => {
    const newPayout: SalaryPayout = {
      ...payout,
      id: generateUniqueId("sal"),
      branchId: state.activeBranchId
    };
    setState(prev => ({
      ...prev,
      salaries: [newPayout, ...prev.salaries]
    }));
    logAction("تسجيل مرتبات", `تم صرف مرتب للموظف: ${payout.employeeName} صافي ${payout.baseSalary + payout.bonuses - payout.deductions}`);
  }, [state.activeBranchId, logAction]);

  // Carts Suspension
  const suspendCart = useCallback((name: string, items: CartItem[], customerId?: string) => {
    const newSuspended = {
      id: generateUniqueId("susp"),
      name,
      items,
      customerId,
      timestamp: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      suspendedCarts: [...prev.suspendedCarts, newSuspended]
    }));
    logAction("تعليق السلة", `تم تعليق سلة مبيعات: ${name}`);
  }, [logAction]);

  const resumeCart = useCallback((id: string) => {
    const match = state.suspendedCarts.find(c => c.id === id);
    setState(prev => ({
      ...prev,
      suspendedCarts: prev.suspendedCarts.filter(c => c.id !== id)
    }));
    if (match) {
      logAction("استرجاع السلة", `تم استرجاع السلة المعلقة: ${match.name}`);
    }
    return match;
  }, [state.suspendedCarts, logAction]);

  // User Management
  const updateUserRole = useCallback((userId: string, role: UserRole) => {
    setState(prev => {
      if (prev.currentUser.id === userId) {
        return {
          ...prev,
          currentUser: { ...prev.currentUser, role },
          auditLogs: prev.auditLogs // trigger safe
        };
      }
      return prev;
    });
    logAction("تحديث صلاحية", `تم تغيير صلاحية الموظف إلى ${role}`);
  }, [logAction]);

  const updateRolePin = useCallback((role: UserRole, newPin: string) => {
    setState(prev => ({
      ...prev,
      rolePins: {
        ...(prev.rolePins || INITIAL_ROLE_PINS),
        [role]: newPin
      }
    }));
    logAction("تحديث رمز الأمان", `تم تحديث رمز الدخول/الترقية الخاص بصلاحية (${role})`);
  }, [logAction]);

  // Branch Synchronization & Offline Queue Flush
  const syncBranches = useCallback(async () => {
    if (!offlineSync.isOnline) {
      offlineSync.enqueueAction(
        "BRANCH_SYNC",
        { timestamp: new Date().toISOString() },
        "مزامنة السحابية معلقة لعدم توفر اتصال بالإنترنت",
        "Cloud branch sync queued due to offline status"
      );
      logAction("مزامنة الفروع (معلقة)", "تم إدراج طلب المزامنة في قائمة انتظار العمليات غير المتصلة");
      return false;
    }

    const { syncedCount } = await offlineSync.processQueue();
    setState(prev => ({
      ...prev,
      branches: prev.branches.map(b => ({
        ...b,
        status: b.id === "branch-dammam" && Math.random() > 0.3 ? "online" : b.status,
        lastSyncTime: "الآن"
      }))
    }));
    logAction("مزامنة الفروع", syncedCount > 0 ? `تم مزامنة البيانات وتفريغ ${syncedCount} عملية معلقة بنجاح` : "تم مزامنة البيانات والعمليات مع السيرفر الرئيسي بنجاح");
    return true;
  }, [offlineSync, logAction]);

  return {
    state,
    toggleLanguage,
    toggleTheme,
    addProduct,
    addProductsBulk,
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
    updateRolePin,
    syncBranches,
    logAction,
    offlineSync
  };
}
