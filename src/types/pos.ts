/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = "Admin",
  MANAGER = "Manager",
  CASHIER = "Cashier"
}

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  branchId: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: string;
  costPrice: number;
  retailPrice: number;        // قطاعي
  wholesalePrice: number;     // جملة
  superWholesalePrice: number;// جملة الجملة
  stockQuantity: number;
  minStockAlert: number;      // حد إعادة الطلب
  hasExpiry: boolean;
  expiryDate?: string;
  serialNumber?: string;      // الرقم التسلسلي
  imageUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  debtAmount: number;         // مديونية
  loyaltyPoints: number;      // نقاط العملاء
  branchId: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  companyName: string;
  debtAmount: number;         // مديونيات للمورد
  branchId: string;
}

export enum PaymentMethod {
  CASH = "Cash",              // نقدي
  CARD = "Card",              // شبكة/بطاقة
  DEFERRED = "Deferred"       // آجل / ذمم
}

export enum OrderStatus {
  COMPLETED = "Completed",
  SUSPENDED = "Suspended",    // معلق
  REFUNDED = "Refunded"       // مرتجع
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedPriceType: "retail" | "wholesale" | "superWholesale";
  customPrice?: number;
  discountAmount: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;      // رقم الفاتورة
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  customerId?: string;        // العميل
  customerName?: string;
  status: OrderStatus;
  branchId: string;
  userId: string;
  userName: string;
  timestamp: string;
  qrCode?: string;            // QR code data
}

export interface Expense {
  id: string;
  category: string;           // تصنيف المصروفات
  amount: number;
  notes: string;
  timestamp: string;
  attachmentName?: string;
  branchId: string;
}

export interface SalaryPayout {
  id: string;
  employeeName: string;
  baseSalary: number;
  bonuses: number;            // مكافآت
  deductions: number;         // خصومات
  notes: string;
  payoutDate: string;
  branchId: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;             // الحدث
  details: string;
  timestamp: string;
  branchId: string;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  status: "online" | "offline";
  lastSyncTime: string;
}

export interface POSState {
  products: Product[];
  categories: Category[];
  customers: Customer[];
  suppliers: Supplier[];
  sales: Sale[];
  expenses: Expense[];
  salaries: SalaryPayout[];
  auditLogs: AuditLog[];
  branches: Branch[];
  suspendedCarts: { id: string; name: string; items: CartItem[]; customerId?: string; timestamp: string }[];
  currentUser: User;
  activeBranchId: string;
  language: "ar" | "en";
  theme: "light" | "dark";
  rolePins?: Record<UserRole, string>;
}
