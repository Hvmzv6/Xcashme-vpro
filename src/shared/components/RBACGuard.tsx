/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ShieldAlert, Lock, UserCheck, ArrowLeft, KeySquare } from "lucide-react";
import { UserRole } from "../../types/pos";
import { Permission, getRequiredRoleLabel } from "../../core/security/rbac";
import { motion } from "motion/react";
import { SecurePinOverlay } from "./SecurePinOverlay";

interface RBACGuardProps {
  currentRole: UserRole;
  requiredPermission: Permission;
  moduleNameAr: string;
  moduleNameEn: string;
  isAr: boolean;
  styles: any;
  rolePins?: Record<UserRole, string>;
  onOverrideRole?: (newRole: UserRole) => void;
  onBackToPOS?: () => void;
}

export const RBACGuard: React.FC<RBACGuardProps> = ({
  currentRole,
  requiredPermission,
  moduleNameAr,
  moduleNameEn,
  isAr,
  styles,
  rolePins,
  onOverrideRole,
  onBackToPOS
}) => {
  const reqLabel = getRequiredRoleLabel(requiredPermission, isAr);
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);

  return (
    <>
      <SecurePinOverlay
        isOpen={!!pendingRole}
        actionTitleAr={`ترقية الصلاحية إلى (${pendingRole})`}
        actionTitleEn={`Authorize Shift to Role (${pendingRole})`}
        actionSubtitleAr={`للوصول إلى وحدة: ${moduleNameAr}`}
        actionSubtitleEn={`To unlock module: ${moduleNameEn}`}
        rolePins={rolePins}
        isAr={isAr}
        styles={styles}
        onAuthorized={(matchedRole) => {
          if (onOverrideRole) {
            onOverrideRole(matchedRole);
          }
          setPendingRole(null);
        }}
        onClose={() => setPendingRole(null)}
      />

      <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto my-12"
    >
      <div className={`${styles.card} p-8 rounded-3xl border-2 border-rose-500/30 relative overflow-hidden shadow-2xl`}>
        {/* Background decorative shield glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center text-center space-y-6 relative z-10">
          
          {/* Badge Icon */}
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 border border-rose-500/30 flex items-center justify-center text-rose-500 shadow-inner">
            <ShieldAlert className="w-10 h-10 animate-bounce" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              <span>RBAC SECURITY GUARD | حجب الصلاحيات الفعال</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">
              {isAr ? `الوصول محجوب: وحدة (${moduleNameAr})` : `Access Restricted: ${moduleNameEn}`}
            </h2>
          </div>

          {/* Explanation Banner */}
          <div className="w-full p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-start space-y-3">
            <div className="flex items-center justify-between text-xs font-bold border-b border-rose-500/10 pb-2">
              <span className="text-rose-400">
                {isAr ? "صلاحية الحساب الحالي:" : "Current User Role:"}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 font-mono">
                {currentRole}
              </span>
            </div>
            <p className="text-sm leading-relaxed font-medium">
              {isAr
                ? `عذراً، وظيفة (${currentRole}) لا تمتلك الصلاحيات الكافية لعرض أو إدارة ${moduleNameAr}. هذه العملية حساسة ومقيدة لضمان أمان البيانات المالية والمخزنية.`
                : `Your current session role (${currentRole}) does not have execution authorization for ${moduleNameEn}. This module requires privileged clearance to protect financial and inventory records.`}
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs font-semibold text-amber-400">
              <KeySquare className="w-4 h-4" />
              <span>
                {isAr ? `المستوى المطلوب:` : `Required Privilege:`} {reqLabel}
              </span>
            </div>
          </div>

          {/* Supervisor Override & Navigation Controls */}
          <div className="w-full pt-4 border-t border-slate-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            {onBackToPOS && (
              <button
                onClick={onBackToPOS}
                className="w-full sm:w-auto px-5 py-3 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isAr ? "العودة إلى شاشة الكاشير (POS)" : "Back to POS Checkout"}</span>
              </button>
            )}

            {onOverrideRole && (
              <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">
                  {isAr ? "تخطي مشرف:" : "Supervisor Override:"}
                </span>
                <div className="flex gap-1.5 w-full sm:w-auto justify-center">
                  {[UserRole.MANAGER, UserRole.ADMIN].map((role) => (
                    <button
                      key={role}
                      onClick={() => setPendingRole(role)}
                      className="px-3.5 py-2 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{isAr ? `ترقية إلى ${role}` : `Shift to ${role}`}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </motion.div>
    </>
  );
};
