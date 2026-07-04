/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Shield, KeyRound, AlertCircle, X, Delete, Check, Lock, UserCheck } from "lucide-react";
import { UserRole } from "../../types/pos";
import { motion, AnimatePresence } from "motion/react";

interface SecurePinOverlayProps {
  isOpen: boolean;
  actionTitleAr: string;
  actionTitleEn: string;
  actionSubtitleAr?: string;
  actionSubtitleEn?: string;
  rolePins?: Record<UserRole, string>;
  isAr: boolean;
  styles: any;
  onAuthorized: (matchedRole: UserRole) => void;
  onClose: () => void;
}

export const SecurePinOverlay: React.FC<SecurePinOverlayProps> = ({
  isOpen,
  actionTitleAr,
  actionTitleEn,
  actionSubtitleAr,
  actionSubtitleEn,
  rolePins,
  isAr,
  styles,
  onAuthorized,
  onClose
}) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  // Fallback default pins if rolePins not yet initialized
  const effectivePins: Record<UserRole, string> = {
    [UserRole.ADMIN]: rolePins?.[UserRole.ADMIN] || "9999",
    [UserRole.MANAGER]: rolePins?.[UserRole.MANAGER] || "1234",
    [UserRole.CASHIER]: rolePins?.[UserRole.CASHIER] || "0000"
  };

  useEffect(() => {
    if (isOpen) {
      setPin("");
      setError(false);
      setShake(false);
    }
  }, [isOpen]);

  // Handle keyboard physical input
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        if (pin.length < 6) {
          setPin(prev => prev + e.key);
          setError(false);
        }
      } else if (e.key === "Backspace") {
        setPin(prev => prev.slice(0, -1));
        setError(false);
      } else if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Enter") {
        handleSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, pin, effectivePins]);

  const handleDigitClick = (digit: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + digit);
      setError(false);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin("");
    setError(false);
  };

  const handleSubmit = () => {
    if (!pin) return;

    // Check against Admin PIN first, then Manager PIN
    if (pin === effectivePins[UserRole.ADMIN]) {
      setError(false);
      onAuthorized(UserRole.ADMIN);
      onClose();
    } else if (pin === effectivePins[UserRole.MANAGER]) {
      setError(false);
      onAuthorized(UserRole.MANAGER);
      onClose();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPin("");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          className={`w-full max-w-md ${styles.card} rounded-3xl border-2 ${error ? "border-rose-500 shadow-rose-500/20" : "border-indigo-500/50 shadow-indigo-500/20"} shadow-2xl overflow-hidden ${shake ? "animate-shake" : ""}`}
        >
          {/* Header Banner */}
          <div className="p-5 border-b border-slate-500/20 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-inner">
                <Shield className="w-6 h-6 animate-pulse text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                    {isAr ? "تحقق أمني مطلوب" : "Security Verification Required"}
                  </span>
                </div>
                <h3 className="font-black text-base tracking-tight text-white mt-0.5">
                  {isAr ? actionTitleAr : actionTitleEn}
                </h3>
                <p className="text-[11px] text-slate-300 font-medium">
                  {isAr
                    ? (actionSubtitleAr || "أدخل رمز المشرف أو المدير للمصادقة وتخطي الحجب")
                    : (actionSubtitleEn || "Enter Supervisor or Manager PIN to authorize access")}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* PIN Display Area */}
          <div className="p-6 flex flex-col items-center space-y-4">
            <div className={`w-full py-4 px-6 rounded-2xl ${styles.inputSecondary} border border-slate-700/60 flex items-center justify-center gap-3 text-2xl font-mono font-bold tracking-widest min-h-[64px] shadow-inner bg-slate-950/40`}>
              {pin.length === 0 ? (
                <span className="text-slate-500 text-sm font-sans tracking-normal flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-slate-500" />
                  <span>{isAr ? "أدخل رمز الـ PIN السري..." : "Enter access PIN..."}</span>
                </span>
              ) : (
                Array.from({ length: pin.length }).map((_, idx) => (
                  <span key={idx} className="w-4 h-4 rounded-full bg-indigo-400 shadow-md shadow-indigo-500/50 animate-scale-up" />
                ))
              )}
            </div>

            {/* Error Banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  {isAr
                    ? `رمز الأمان غير صالح الصلاحية! تحقّق من رمز المشرف/المدير.`
                    : `Invalid security PIN! Please verify Supervisor/Manager PIN.`}
                </span>
              </motion.div>
            )}

            {/* Quick Helper info */}
            {!error && (
              <div className="w-full flex items-center justify-between px-2 text-[11px] text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {isAr ? "الصلاحيات المقبولة: مدير / مسؤول" : "Accepted: Manager / Admin"}
                </span>
                <span className="font-mono text-indigo-300">
                  {isAr ? "الافتراضي: 1234 / 9999" : "Default: 1234 / 9999"}
                </span>
              </div>
            )}

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-3 w-full pt-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleDigitClick(digit)}
                  className={`h-14 rounded-2xl ${styles.well} hover:${styles.hoverBg} border ${styles.wellBorder} font-mono font-bold text-2xl active:scale-95 transition-all shadow-md flex items-center justify-center text-slate-100`}
                >
                  {digit}
                </button>
              ))}

              <button
                onClick={handleClear}
                className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-slate-600/40 text-slate-300 font-bold text-sm active:scale-95 transition-all flex items-center justify-center shadow"
              >
                {isAr ? "مسح" : "Clear"}
              </button>

              <button
                onClick={() => handleDigitClick("0")}
                className={`h-14 rounded-2xl ${styles.well} hover:${styles.hoverBg} border ${styles.wellBorder} font-mono font-bold text-2xl active:scale-95 transition-all shadow-md flex items-center justify-center text-slate-100`}
              >
                0
              </button>

              <button
                onClick={handleBackspace}
                className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-slate-600/40 text-rose-400 font-bold active:scale-95 transition-all flex items-center justify-center shadow"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {/* Submit Authorization */}
            <button
              onClick={handleSubmit}
              disabled={pin.length === 0}
              className="w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-500/25 disabled:opacity-40 disabled:cursor-not-allowed active:scale-98 transition-all flex items-center justify-center gap-2 mt-2 text-base cursor-pointer"
            >
              <Check className="w-5 h-5" />
              <span>{isAr ? "تأكيد المصادقة وفتح الصلاحية" : "Verify PIN & Authorize"}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
