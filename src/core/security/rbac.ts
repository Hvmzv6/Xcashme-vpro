/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserRole } from "../../types/pos";

export enum Permission {
  VIEW_POS = "VIEW_POS",
  PROCESS_SALE = "PROCESS_SALE",
  APPLY_HEAVY_DISCOUNT = "APPLY_HEAVY_DISCOUNT",
  CHANGE_PRICE_TIER = "CHANGE_PRICE_TIER",
  
  VIEW_INVENTORY = "VIEW_INVENTORY",
  MANAGE_INVENTORY = "MANAGE_INVENTORY",
  ADJUST_STOCK = "ADJUST_STOCK",
  
  VIEW_PARTNERS = "VIEW_PARTNERS",
  MANAGE_PARTNERS = "MANAGE_PARTNERS",
  
  VIEW_EXPENSES = "VIEW_EXPENSES",
  MANAGE_EXPENSES = "MANAGE_EXPENSES",
  
  VIEW_REPORTS = "VIEW_REPORTS",
  EXPORT_REPORTS = "EXPORT_REPORTS",
  
  VIEW_SETTINGS = "VIEW_SETTINGS",
  MANAGE_ROLES = "MANAGE_ROLES",
  DATABASE_IMPORT_RESET = "DATABASE_IMPORT_RESET",
}

export const ROLE_PERMISSIONS: Record<UserRole, Set<Permission>> = {
  [UserRole.ADMIN]: new Set([
    Permission.VIEW_POS,
    Permission.PROCESS_SALE,
    Permission.APPLY_HEAVY_DISCOUNT,
    Permission.CHANGE_PRICE_TIER,
    Permission.VIEW_INVENTORY,
    Permission.MANAGE_INVENTORY,
    Permission.ADJUST_STOCK,
    Permission.VIEW_PARTNERS,
    Permission.MANAGE_PARTNERS,
    Permission.VIEW_EXPENSES,
    Permission.MANAGE_EXPENSES,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,
    Permission.VIEW_SETTINGS,
    Permission.MANAGE_ROLES,
    Permission.DATABASE_IMPORT_RESET,
  ]),
  [UserRole.MANAGER]: new Set([
    Permission.VIEW_POS,
    Permission.PROCESS_SALE,
    Permission.APPLY_HEAVY_DISCOUNT,
    Permission.CHANGE_PRICE_TIER,
    Permission.VIEW_INVENTORY,
    Permission.MANAGE_INVENTORY,
    Permission.ADJUST_STOCK,
    Permission.VIEW_PARTNERS,
    Permission.MANAGE_PARTNERS,
    Permission.VIEW_EXPENSES,
    Permission.MANAGE_EXPENSES,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,
    Permission.VIEW_SETTINGS,
  ]),
  [UserRole.CASHIER]: new Set([
    Permission.VIEW_POS,
    Permission.PROCESS_SALE,
    Permission.VIEW_PARTNERS,
  ]),
};

/**
 * Evaluates whether a user role possesses a specific permission.
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.has(permission);
}

/**
 * Returns a bilingual explanation of the required role for a given permission.
 */
export function getRequiredRoleLabel(permission: Permission, isAr: boolean): string {
  switch (permission) {
    case Permission.VIEW_INVENTORY:
    case Permission.MANAGE_INVENTORY:
      return isAr ? "مدير الفرع (Manager) أو المسؤول (Admin)" : "Branch Manager or Administrator";
    case Permission.VIEW_EXPENSES:
    case Permission.MANAGE_EXPENSES:
      return isAr ? "المحاسب / مدير الفرع (Manager)" : "Branch Manager / Accountant";
    case Permission.VIEW_REPORTS:
    case Permission.EXPORT_REPORTS:
      return isAr ? "الإدارة العليا أو مسؤول التقارير (Manager/Admin)" : "Management or Admin";
    case Permission.VIEW_SETTINGS:
    case Permission.DATABASE_IMPORT_RESET:
      return isAr ? "مدير النظام العام (Administrator)" : "System Administrator";
    default:
      return isAr ? "صلاحية مشرف أعلى" : "Supervisor Role";
  }
}
