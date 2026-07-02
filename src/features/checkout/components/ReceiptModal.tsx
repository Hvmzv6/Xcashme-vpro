/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { X, Printer } from "lucide-react";
import { Sale } from "../../../types/pos";

interface ReceiptModalProps {
  activeReceipt: Sale;
  receiptSize: "A4" | "58mm" | "80mm";
  setReceiptSize: (size: "A4" | "58mm" | "80mm") => void;
  setActiveReceipt: (sale: Sale | null) => void;
  t: any;
  styles: any;
  isAr: boolean;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  activeReceipt,
  receiptSize,
  setReceiptSize,
  setActiveReceipt,
  t,
  styles,
  isAr
}) => {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${styles.modalOverlay}`}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={`${styles.card} max-w-lg w-full overflow-hidden shadow-2xl flex flex-col`}
      >
        {/* Size selectors */}
        <div className={`p-4 border-b ${styles.wellBorder} ${styles.well} flex items-center justify-between`}>
          <div className="flex items-center gap-1">
            {[
              { id: "58mm", label: "58mm (ريسيت)" },
              { id: "80mm", label: "80mm (حراري)" },
              { id: "A4", label: "A4 (فواتير)" }
            ].map(sz => (
              <button
                key={sz.id}
                onClick={() => setReceiptSize(sz.id as any)}
                className={`px-2.5 py-1 text-xs rounded font-bold border transition-colors ${
                  receiptSize === sz.id
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : `${styles.well} border-transparent ${styles.textSecondary} hover:${styles.hoverBg}`
                }`}
              >
                {sz.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setActiveReceipt(null)}
            className={`p-1.5 hover:${styles.hoverBg} rounded-lg ${styles.textSecondary}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* simulated physical receipt container */}
        <div className={`flex-1 p-6 overflow-y-auto max-h-[450px] ${styles.well} flex justify-center`}>
          
          {/* Physical styled receipt body */}
          <div
            className={`receipt-paper p-5 shadow-inner border border-slate-200 bg-white text-gray-800 rounded-lg ${
              receiptSize === "58mm" ? "w-[240px]" : receiptSize === "80mm" ? "w-[320px]" : "w-[440px]"
            }`}
          >
            <div className="text-center pb-3 border-b border-gray-300">
              <h3 className="font-bold text-sm tracking-tight">إكس كاش برو POS</h3>
              <p className="text-[10px] text-gray-500 font-medium">فرع الرياض الرئيسي</p>
              <p className="text-[10px] text-gray-500">الرقم الضريبي: 300059218200003</p>
            </div>

            <div className="py-3 text-[10px] space-y-1 border-b border-dashed border-gray-400 font-mono text-gray-700">
              <div className="flex justify-between">
                <span>الفاتورة: {activeReceipt.invoiceNumber}</span>
                <span>التاريخ: {activeReceipt.timestamp.slice(0,10)}</span>
              </div>
              <div className="flex justify-between">
                <span>العميل: {activeReceipt.customerName || t.noCustomer}</span>
                <span>الفرع: الرياض</span>
              </div>
            </div>

            {/* items list */}
            <table className="w-full text-left text-[10px] py-3 font-mono border-b border-dashed border-gray-400 text-gray-700">
              <thead>
                <tr className="border-b border-gray-300 font-bold text-gray-800">
                  <th className="py-1">{t.productName}</th>
                  <th className="py-1 text-center">{t.quantity}</th>
                  <th className="py-1 text-right">المجموع</th>
                </tr>
              </thead>
              <tbody>
                {activeReceipt.items.map((it, idx) => {
                  const price = (it.selectedPriceType === "retail"
                    ? it.product.retailPrice
                    : it.selectedPriceType === "wholesale"
                      ? it.product.wholesalePrice
                      : it.product.superWholesalePrice) ?? 0;

                  return (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-1 max-w-[120px] truncate">{it.product.name.split("-")[0]}</td>
                      <td className="py-1 text-center">{it.quantity}</td>
                      <td className="py-1 text-right font-bold text-gray-850">{(price * it.quantity).toFixed(2)} $</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pricing footer summary */}
            <div className="py-3 text-[10px] font-mono space-y-1 text-right text-gray-700">
              <div className="flex justify-between">
                <span>{t.subtotal}:</span>
                <span>{activeReceipt.subtotal.toFixed(2)} $</span>
              </div>
              <div className="flex justify-between">
                <span>الخصم:</span>
                <span>{activeReceipt.discount.toFixed(2)} $</span>
              </div>
              <div className="flex justify-between">
                <span>{t.tax}:</span>
                <span>{activeReceipt.tax.toFixed(2)} $</span>
              </div>
              <div className="flex justify-between font-bold text-xs pt-1.5 border-t border-gray-300 text-gray-900">
                <span>{t.total}:</span>
                <span>{activeReceipt.total.toFixed(2)} $</span>
              </div>
            </div>

            <div className="text-center pt-3 text-[9px] text-gray-400 border-t border-dashed border-gray-300">
              <p>شكراً لزيارتكم - يسعدنا خدمتكم دائماً</p>
              <p className="mt-1 font-mono">{activeReceipt.timestamp}</p>
            </div>
          </div>

        </div>

        {/* physical triggers */}
        <div className={`p-4 ${styles.well} border-t ${styles.wellBorder} flex flex-wrap justify-between items-center gap-2.5`}>
          <div className="flex items-center gap-2 text-[11px]">
            <span className={styles.textSecondary}>طابعة ESC/POS:</span>
            <input
              type="text"
              id="thermal-printer-ip"
              defaultValue="192.168.1.100:9100"
              placeholder="IP / COM Port"
              className={`w-32 px-2 py-1 text-xs font-mono rounded border ${styles.wellBorder} ${styles.bg} ${styles.textPrimary}`}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                const ipInput = (document.getElementById("thermal-printer-ip") as HTMLInputElement)?.value || "192.168.1.100:9100";
                try {
                  const res = await fetch("/api/print/thermal", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      receipt: activeReceipt,
                      printerType: "network",
                      printerAddress: ipInput,
                      paperSize: receiptSize
                    })
                  });
                  const data = await res.json();
                  if (data.status === "success") {
                    alert(isAr ? `تم إرسال أمر الطباعة الحرارية بنجاح إلى الطابعة (${data.target || ipInput})` : `Thermal print command sent successfully to (${data.target || ipInput})`);
                  } else {
                    alert(isAr ? `خطأ في الطباعة: ${data.message}` : `Print error: ${data.message}`);
                  }
                } catch (e: any) {
                  alert(isAr ? `تعذر الاتصال بطابعة ESC/POS الحرارية: ${e.message}` : `Could not connect to thermal printer: ${e.message}`);
                }
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/10"
              title="طباعة مباشرة للطابعة الحرارية ESC/POS"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة حرارية ESC/POS</span>
            </button>

            <button
              onClick={() => {
                window.print();
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-500/10"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة نظام</span>
            </button>

            <button
              onClick={() => setActiveReceipt(null)}
              className={`px-3 py-2 ${styles.btnOutline} text-xs font-bold rounded-lg`}
            >
              {t.closeReceipt}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
