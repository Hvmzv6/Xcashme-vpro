/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Settings, RefreshCw, Database, Download, Upload, Lock, KeyRound, Check, Edit3 } from "lucide-react";
import { UserRole, POSState } from "../../../types/pos";
import { Permission, hasPermission } from "../../../core/security/rbac";
import { SecurePinOverlay } from "../../../shared/components/SecurePinOverlay";

interface SettingsViewProps {
  state: POSState;
  t: any;
  styles: any;
  isAr: boolean;
  updateUserRole: (id: string, role: UserRole) => void;
  updateRolePin?: (role: UserRole, newPin: string) => void;
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
  updateRolePin,
  syncBranches,
  handleExportDB,
  handleImportDB,
  triggerToast
}) => {
  const [pendingRoleShift, setPendingRoleShift] = useState<UserRole | null>(null);
  const [editingPinRole, setEditingPinRole] = useState<UserRole | null>(null);
  const [newPinValue, setNewPinValue] = useState("");

  const getRolePin = (role: UserRole) => {
    return state.rolePins?.[role] || (role === UserRole.ADMIN ? "9999" : role === UserRole.MANAGER ? "1234" : "0000");
  };

  const handleSavePin = (role: UserRole) => {
    if (!newPinValue || newPinValue.length < 4) {
      triggerToast(isAr ? "يجب أن يتكون الرمز من 4 أرقام على الأقل!" : "PIN must be at least 4 digits!");
      return;
    }
    if (updateRolePin) {
      updateRolePin(role, newPinValue);
      triggerToast(isAr ? `تم تحديث رمز أمان صلاحية (${role}) بنجاح` : `Updated PIN for (${role}) successfully`);
    }
    setEditingPinRole(null);
    setNewPinValue("");
  };

  return (
    <>
      <SecurePinOverlay
        isOpen={!!pendingRoleShift}
        actionTitleAr={`تبديل الصلاحية إلى (${pendingRoleShift})`}
        actionTitleEn={`Shift Clearance to (${pendingRoleShift})`}
        actionSubtitleAr="أدخل رمز الـ PIN الخاص بهذه الصلاحية للمصادقة والدخول"
        actionSubtitleEn="Enter PIN for this clearance level to verify identity"
        rolePins={state.rolePins}
        isAr={isAr}
        styles={styles}
        onAuthorized={(matchedRole) => {
          if (pendingRoleShift) {
            updateUserRole(state.currentUser.id, pendingRoleShift);
            triggerToast(isAr ? `تم تعديل الصلاحية الفعالة إلى ${pendingRoleShift}` : `Role shifted to ${pendingRoleShift}`);
          }
          setPendingRoleShift(null);
        }}
        onClose={() => setPendingRoleShift(null)}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Sync & Role Settings */}
        <div className={`${styles.card} p-5 rounded-2xl space-y-5`}>
          <h2 className={`font-bold text-base border-b ${styles.wellBorder} pb-3 flex items-center gap-2`}>
            <Settings className="w-5 h-5 text-indigo-400 animate-spin-slow" />
            <span>{t.syncStatusTitle}</span>
          </h2>

          <div className="space-y-4 text-xs">
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-2">
              <h4 className="font-bold text-indigo-500">{isAr ? "مستوى الصلاحيات الفعال والأمان" : "Role Rights & PIN Mode"}</h4>
              <p className={`${styles.textSecondary} leading-relaxed`}>
                {isAr
                  ? "تغيير الصلاحية أو تخطي الحجب يتطلب إدخال رمز الأمان (PIN) المحمي لمنع وصول الموظفين غير المصرح لهم."
                  : "Shifting sessions or overriding restricted views requires entering the supervisor verification PIN code."}
              </p>
            </div>

            <div className="space-y-2.5">
              <label className={`${styles.textSecondary} font-medium block`}>
                {t.userRole} ({isAr ? "انقر للتبديل مع التحقق برمز الـ PIN" : "Click to switch with PIN Auth"})
              </label>
              <div className="flex gap-2">
                {[UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER].map(role => (
                  <button
                    key={role}
                    onClick={() => {
                      if (state.currentUser.role === role) return;
                      // Prompt PIN before changing role
                      setPendingRoleShift(role);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold border transition-all flex items-center gap-1.5 ${
                      state.currentUser.role === role
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-sm"
                        : `${styles.well} border-transparent ${styles.textSecondary} hover:${styles.hoverBg}`
                    }`}
                  >
                    <span>{role}</span>
                    {state.currentUser.role !== role && <Lock className="w-3 h-3 text-slate-400" />}
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

        {/* Role PIN Codes Management Card */}
        <div className={`${styles.card} p-5 rounded-2xl space-y-4`}>
          <h2 className={`font-bold text-base border-b ${styles.wellBorder} pb-3 flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-400" />
              <span>{isAr ? "أكواد أمان الترقية (Supervisor PINs)" : "Role Security PIN Codes"}</span>
            </div>
            {state.currentUser.role !== UserRole.ADMIN && (
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-mono">Admin Only</span>
            )}
          </h2>

          <p className={`text-xs ${styles.textSecondary} leading-relaxed`}>
            {isAr
              ? "الرموز المستخدمة في عمليات تخطي الحجب (Supervisor Override) أو عند تبديل صلاحيات الموظف على شاشة نقطة البيع."
              : "PIN codes verified during supervisor authorization overrides or active operator clearance switching."}
          </p>

          <div className="space-y-3 pt-2">
            {[UserRole.ADMIN, UserRole.MANAGER].map(role => {
              const currentPin = getRolePin(role);
              const isEditing = editingPinRole === role;

              return (
                <div key={role} className={`p-3.5 rounded-xl ${styles.well} border ${styles.wellBorder} flex flex-wrap items-center justify-between gap-3`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                      {role[0]}
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-slate-200">{isAr ? `صلاحية: ${role}` : `${role} Clearance`}</h5>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {isAr ? "رمز التحقق: " : "Auth PIN: "}
                        <span className="text-amber-400 font-bold">••••</span> ({currentPin})
                      </p>
                    </div>
                  </div>

                  {state.currentUser.role === UserRole.ADMIN ? (
                    isEditing ? (
                      <div className="flex items-center gap-1.5 w-full sm:w-auto mt-2 sm:mt-0">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="4-6 digits"
                          value={newPinValue}
                          onChange={e => setNewPinValue(e.target.value.replace(/[^0-9]/g, ""))}
                          className={`w-24 ${styles.inputSecondary} px-2 py-1 rounded-lg text-xs font-mono text-center font-bold focus:outline-none`}
                        />
                        <button
                          onClick={() => handleSavePin(role)}
                          className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all"
                          title={isAr ? "حفظ الرمز الجديد" : "Save new PIN"}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingPinRole(role);
                          setNewPinValue(currentPin);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isAr ? "تعديل الرمز" : "Change PIN"}</span>
                      </button>
                    )
                  ) : (
                    <span className="text-[10px] text-slate-500 italic">{isAr ? "مقيد للمسؤول" : "Locked"}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Manual Backup and JSON restore */}
        <div className={`${styles.card} p-5 rounded-2xl space-y-4 xl:col-span-2`}>
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
            <label className={`py-3 ${styles.well} ${hasPermission(state.currentUser.role, Permission.DATABASE_IMPORT_RESET) ? `hover:${styles.hoverBg} cursor-pointer` : 'opacity-60 cursor-not-allowed'} ${styles.textPrimary} border ${styles.wellBorder} rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-center`}
              title={!hasPermission(state.currentUser.role, Permission.DATABASE_IMPORT_RESET) ? (isAr ? 'استعادة قاعدة البيانات تتطلب صلاحية مدير عام (Admin)' : 'Database restore requires General Admin role') : undefined}
            >
              <Upload className="w-4 h-4 text-emerald-500" />
              <span>{t.importData}</span>
              {!hasPermission(state.currentUser.role, Permission.DATABASE_IMPORT_RESET) && (
                <Lock className="w-3.5 h-3.5 text-rose-400" />
              )}
              <input
                type="file"
                accept=".json"
                disabled={!hasPermission(state.currentUser.role, Permission.DATABASE_IMPORT_RESET)}
                onChange={handleImportDB}
                className="hidden"
              />
            </label>

          </div>
        </div>

      </div>
    </>
  );
};
