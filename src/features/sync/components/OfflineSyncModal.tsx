import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  CloudLightning,
  Clock,
  Database
} from "lucide-react";
import { QueuedSyncItem } from "../../../core/database/useOfflineSyncQueue";

interface OfflineSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAr: boolean;
  offlineSync: {
    isOnline: boolean;
    syncQueue: QueuedSyncItem[];
    isSyncing: boolean;
    lastSyncTime: string | null;
    processQueue: () => Promise<{ syncedCount: number; failedCount: number }>;
    removeAction: (id: string) => void;
    clearQueue: () => void;
  };
  triggerToast: (msg: string) => void;
}

export const OfflineSyncModal: React.FC<OfflineSyncModalProps> = ({
  isOpen,
  onClose,
  isAr,
  offlineSync,
  triggerToast
}) => {
  if (!isOpen) return null;

  const handleSyncNow = async () => {
    triggerToast(isAr ? "بدء مزامنة قائمة الانتظار مع السيرفر..." : "Starting queue sync with server...");
    const res = await offlineSync.processQueue();
    if (res.syncedCount > 0) {
      triggerToast(isAr ? `تمت مزامنة ${res.syncedCount} عملية بنجاح!` : `Successfully synced ${res.syncedCount} items!`);
    } else if (res.failedCount > 0) {
      triggerToast(isAr ? `تعذرت مزامنة ${res.failedCount} عملية، تأكد من اتصال السيرفر.` : `Failed to sync ${res.failedCount} items. Check connection.`);
    } else {
      triggerToast(isAr ? "قائمة المزامنة فارغة أو النظام محدث بالكامل" : "Sync queue is empty or fully updated");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          dir={isAr ? "rtl" : "ltr"}
        >
          {/* Header */}
          <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${offlineSync.isOnline ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                {offlineSync.isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <span>{isAr ? "مركز المزامنة والعمليات غير المتصلة (Offline PWA Sync)" : "Offline PWA Sync Monitor"}</span>
                  <span className="px-2 py-0.5 text-xs font-mono rounded-full bg-indigo-500/20 text-indigo-300">
                    {offlineSync.syncQueue.length} {isAr ? "معلق" : "Pending"}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  {isAr
                    ? "يقوم المتصفح و Service Worker بتخزين المبيعات والعمليات محلياً ومزامنتها تلقائياً عند عودة الاتصال."
                    : "Service Worker caches sales locally offline and auto-syncs when online."}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status Banner */}
          <div className={`px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs font-medium ${
            offlineSync.isOnline ? "bg-emerald-950/30 border-emerald-800/40 text-emerald-300" : "bg-amber-950/30 border-amber-800/40 text-amber-300"
          }`}>
            <div className="flex items-center gap-2">
              {offlineSync.isOnline ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}
              <span>
                {offlineSync.isOnline
                  ? (isAr ? "الحالة: متصل بالشبكة (Online) - جاهز للمزامنة الفورية" : "Status: Online - Ready for immediate sync")
                  : (isAr ? "الحالة: دون اتصال (Offline Mode) - يتم حفظ المبيعات في المتصفح بأمان" : "Status: Offline Mode - Sales saved safely locally")}
              </span>
            </div>
            {offlineSync.lastSyncTime && (
              <span className="text-slate-400 font-mono text-[11px]">
                {isAr ? "آخر مزامنة:" : "Last synced:"} {offlineSync.lastSyncTime}
              </span>
            )}
          </div>

          {/* Queue List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {offlineSync.syncQueue.length === 0 ? (
              <div className="text-center py-12 space-y-3 border border-dashed border-slate-800 rounded-2xl bg-slate-900/50">
                <CloudLightning className="w-12 h-12 text-slate-600 mx-auto opacity-60" />
                <p className="text-sm font-medium text-slate-300">
                  {isAr ? "لا توجد عمليات معلقة في قائمة المزامنة" : "No pending actions in sync queue"}
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {isAr
                    ? "جميع فواتير المبيعات وتعديلات المخزون متزامنة بالكامل مع قاعدة البيانات والسحابة."
                    : "All sales invoices and stock updates are 100% synced with storage and cloud."}
                </p>
              </div>
            ) : (
              offlineSync.syncQueue.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl flex items-start justify-between gap-4 transition-all hover:border-slate-600"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {item.actionType}
                      </span>
                      <span className="text-xs font-semibold text-slate-200">
                        {isAr ? item.descriptionAr : item.descriptionEn}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                      {item.retries > 0 && (
                        <span className="text-amber-400">
                          ({item.retries} {isAr ? "محاولات إعادة" : "retries"})
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => offlineSync.removeAction(item.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title={isAr ? "حذف من القائمة" : "Remove from queue"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer actions */}
          <div className="px-6 py-4 bg-slate-800/60 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => {
                if (confirm(isAr ? "هل أنت متأكد من مسح جميع سجلات الانتظار؟" : "Are you sure you want to clear all queued actions?")) {
                  offlineSync.clearQueue();
                  triggerToast(isAr ? "تم مسح قائمة الانتظار" : "Sync queue cleared");
                }
              }}
              disabled={offlineSync.syncQueue.length === 0}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold rounded-xl transition-all flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isAr ? "مسح قائمة الانتظار" : "Clear Queue"}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all"
              >
                {isAr ? "إغلاق" : "Close"}
              </button>
              <button
                onClick={handleSyncNow}
                disabled={offlineSync.isSyncing || offlineSync.syncQueue.length === 0 || !offlineSync.isOnline}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${offlineSync.isSyncing ? "animate-spin" : ""}`} />
                <span>{offlineSync.isSyncing ? (isAr ? "جاري المزامنة..." : "Syncing...") : (isAr ? "مزامنة الآن (Sync Now)" : "Sync Now")}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
