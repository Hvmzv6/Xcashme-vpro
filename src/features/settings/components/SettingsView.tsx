/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Settings, RefreshCw, Database, Download, Upload } from "lucide-react";
import { UserRole, POSState } from "../../../types/pos";

interface SettingsViewProps {
  state: POSState;
  t: any;
  styles: any;
  isAr: boolean;
  updateUserRole: (id: string, role: UserRole) => void;
  syncBranches: () => void;
  handleExportDB: () => void;
  handleImportDB: (e: React.ChangeEvent<HTMLInputElement>) => void;
  triggerToast: (msg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  state,
  t,
  styles,
  isAr,
  updateUserRole,
  syncBranches,
  handleExportDB,
  handleImportDB,
  triggerToast
}) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      
      {/* Sync Settings */}
      <div className={`${styles.card} p-5 rounded-2xl space-y-5`}>
        <h2 className={`font-bold text-base border-b ${styles.wellBorder} pb-3 flex items-center gap-2`}>
          <Settings className="w-5 h-5 text-indigo-400 animate-spin-slow" />
          <span>{t.syncStatusTitle}</span>
        </h2>

        <div className="space-y-4 text-xs">
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-2">
            <h4 className="font-bold text-indigo-500">{isAr ? "مستوى الصلاحيات الفعال" : "Role Rights Mode"}</h4>
            <p className={`${styles.textSecondary} leading-relaxed`}>
              {isAr
                ? "تتمتع صلاحية (Admin المدير العام) بجميع الحقوق لتعديل الأسعار وإجراء المردودات وتصدير قواعد البيانات."
                : "General Admin role possesses full execution rights over modifying prices, exporting databases, and processing cash returns."}
            </p>
          </div>

          <div className="space-y-2.5">
            <label className={`${styles.textSecondary} font-medium block`}>{t.userRole}</label>
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
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-sm"
                      : `${styles.well} border-transparent ${styles.textSecondary} hover:${styles.hoverBg}`
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Manual Sync Trigger */}
          <div className={`pt-4 border-t ${styles.wellBorder}`}>
            <button
              onClick={() => {
                syncBranches();
                triggerToast(t.syncSuccess);
              }}
              className="w-full py-3.5 bg-gradient-to-tr from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-slate-100 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              <span>{t.syncBranches}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Manual Backup and JSON restore */}
      <div className={`${styles.card} p-5 rounded-2xl space-y-4`}>
        <h2 className={`font-bold text-base border-b ${styles.wellBorder} pb-3 flex items-center gap-2`}>
          <Database className="w-5 h-5 text-indigo-400" />
          <span>{t.backupRestore}</span>
        </h2>

        <p className={`text-xs ${styles.textSecondary} leading-relaxed`}>
          {isAr
            ? "يتيح لك نظام إكس كاش سحب نسخة كاملة من قاعدة بيانات المحل للمبيعات والمخزن، لضمان السرية والأمان الكامل وعدم فقدان البيانات في حال تغيير المتصفح."
            : "Xcash provides simple raw backup procedures that export your full invoices, stock registers, and payroll states to a local encrypted schema JSON file."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 text-xs">
          
          {/* Export */}
          <button
            onClick={handleExportDB}
            className={`py-3 ${styles.well} hover:${styles.hoverBg} ${styles.textPrimary} border ${styles.wellBorder} rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors`}
          >
            <Download className="w-4 h-4 text-indigo-500" />
            <span>{t.exportData}</span>
          </button>

          {/* Import */}
          <label className={`py-3 ${styles.well} hover:${styles.hoverBg} ${styles.textPrimary} border ${styles.wellBorder} rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors text-center`}>
            <Upload className="w-4 h-4 text-emerald-500" />
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
  );
};
