/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Award, Users } from "lucide-react";
import { POSState } from "../../../types/pos";

interface PartnersViewProps {
  state: POSState;
  t: any;
  styles: any;
  isAr: boolean;
  addCustomer: (cust: any) => void;
  recordCustomerPayment: (customerId: string, amount: number) => void;
  addSupplier: (supp: any) => void;
  recordSupplierPayment: (supplierId: string, amount: number) => void;
  triggerToast: (msg: string) => void;
}

export const PartnersView: React.FC<PartnersViewProps> = ({
  state,
  t,
  styles,
  isAr,
  addCustomer,
  recordCustomerPayment,
  addSupplier,
  recordSupplierPayment,
  triggerToast
}) => {
  // Local form states
  const [newCust, setNewCust] = useState({ name: "", phone: "", email: "", notes: "" });
  const [newSupp, setNewSupp] = useState({ name: "", phone: "", companyName: "", debtAmount: 0 });

  return (
    <div className="space-y-6">
      
      {/* Loyalty Overview and Add panels */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Loyalty Customers Panel */}
        <div className={`${styles.card} p-5 rounded-2xl space-y-4`}>
          <div className={`flex justify-between items-center border-b ${styles.wellBorder} pb-3`}>
            <h2 className="font-bold text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400 animate-pulse" />
              <span>{t.customerLoyalty}</span>
            </h2>
          </div>

          {/* Add Customer Form */}
          <div className={`${styles.well} p-3.5 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-3 text-xs`}>
            <div>
              <label className={`${styles.textSecondary} mb-1 block`}>{t.customerName}</label>
              <input
                type="text"
                value={newCust.name}
                onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                className={`w-full ${styles.inputSecondary} rounded px-2.5 py-1.5`}
              />
            </div>
            <div>
              <label className={`${styles.textSecondary} mb-1 block`}>{t.phone}</label>
              <input
                type="text"
                value={newCust.phone}
                onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                className={`w-full ${styles.inputSecondary} rounded px-2.5 py-1.5 font-mono`}
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
                <tr className={`border-b ${styles.wellBorder} ${styles.textSecondary}`}>
                  <th className="py-2 px-1">{t.customerName}</th>
                  <th className="py-2 px-1 font-mono">{t.phone}</th>
                  <th className="py-2 px-1 font-mono">{t.debts}</th>
                  <th className="py-2 px-1">{t.loyaltyPoints}</th>
                  <th className="py-2 px-1 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {state.customers.map(c => (
                  <tr key={c.id} className={`border-b ${styles.wellBorder}`}>
                    <td className={`py-2.5 px-1 font-medium ${styles.textPrimary}`}>{c.name}</td>
                    <td className="py-2.5 px-1 font-mono text-slate-400">{c.phone}</td>
                    <td className="py-2.5 px-1 font-mono text-rose-400 font-bold">{(c.debtAmount ?? 0).toFixed(2)} $</td>
                    <td className="py-2.5 px-1">
                      <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-mono font-bold">
                        {c.loyaltyPoints} PTS
                      </span>
                    </td>
                    <td className="py-2.5 px-1 text-right font-medium">
                      {c.debtAmount > 0 && (
                        <button
                          onClick={() => {
                            const payment = prompt(isAr ? `تسديد من ديون ${c.name}:` : `Pay debts for ${c.name}:`, "50");
                            if (payment) {
                              recordCustomerPayment(c.id, Number(payment));
                              triggerToast(isAr ? "تم قيد سداد الديون بنجاح" : "Debt payment recorded!");
                            }
                          }}
                          className="text-emerald-400 hover:underline mr-2 cursor-pointer"
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
        <div className={`${styles.card} p-5 rounded-2xl space-y-4`}>
          <h2 className={`font-bold text-base border-b ${styles.wellBorder} pb-3 flex items-center gap-2`}>
            <Users className="w-5 h-5 text-indigo-400" />
            <span>{t.supplierManagement}</span>
          </h2>

          {/* Add Supplier Form */}
          <div className={`${styles.well} p-3.5 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-3 text-xs`}>
            <div>
              <label className={`${styles.textSecondary} mb-1 block`}>{t.supplierName}</label>
              <input
                type="text"
                value={newSupp.name}
                onChange={(e) => setNewSupp({ ...newSupp, name: e.target.value })}
                className={`w-full ${styles.inputSecondary} rounded px-2.5 py-1.5`}
              />
            </div>
            <div>
              <label className={`${styles.textSecondary} mb-1 block`}>{t.supplierCompany}</label>
              <input
                type="text"
                value={newSupp.companyName}
                onChange={(e) => setNewSupp({ ...newSupp, companyName: e.target.value })}
                className={`w-full ${styles.inputSecondary} rounded px-2.5 py-1.5`}
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
                <tr className={`border-b ${styles.wellBorder} ${styles.textSecondary}`}>
                  <th className="py-2 px-1">{t.supplierName}</th>
                  <th className="py-2 px-1">{t.supplierCompany}</th>
                  <th className="py-2 px-1 font-mono">{t.supplierDebt}</th>
                  <th className="py-2 px-1 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {state.suppliers.map(s => (
                  <tr key={s.id} className={`border-b ${styles.wellBorder}`}>
                    <td className={`py-2.5 px-1 font-medium ${styles.textPrimary}`}>{s.name}</td>
                    <td className={`py-2.5 px-1 ${styles.textSecondary}`}>{s.companyName}</td>
                    <td className="py-2.5 px-1 font-mono text-amber-500 font-bold">{(s.debtAmount ?? 0).toFixed(2)} $</td>
                    <td className="py-2.5 px-1 text-right font-medium">
                      {s.debtAmount > 0 && (
                        <button
                          onClick={() => {
                            const payAmt = prompt(isAr ? `دفع دفعة مالية للمورد ${s.name}:` : `Pay balance to ${s.name}:`, "500");
                            if (payAmt) {
                              recordSupplierPayment(s.id, Number(payAmt));
                              triggerToast(isAr ? "تم تسجيل سداد المورد" : "Supplier bill settled!");
                            }
                          }}
                          className="text-emerald-500 hover:underline font-medium cursor-pointer"
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
  );
};
