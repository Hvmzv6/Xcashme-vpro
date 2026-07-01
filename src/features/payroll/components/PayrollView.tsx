/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { DollarSign, Users } from "lucide-react";
import { POSState } from "../../../types/pos";

interface PayrollViewProps {
  state: POSState;
  t: any;
  styles: any;
  isAr: boolean;
  addExpense: (expense: any) => void;
  addSalaryPayout: (salary: any) => void;
  triggerToast: (msg: string) => void;
}

export const PayrollView: React.FC<PayrollViewProps> = ({
  state,
  t,
  styles,
  isAr,
  addExpense,
  addSalaryPayout,
  triggerToast
}) => {
  // Local form states
  const [newExp, setNewExp] = useState({ category: "إيجار / Rent", amount: 0, notes: "" });
  const [newSal, setNewSal] = useState({ employeeName: "", baseSalary: 2500, bonuses: 0, deductions: 0, notes: "" });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      
      {/* Expense tracker panel */}
      <div className={`${styles.card} p-5 rounded-2xl space-y-4`}>
        <h2 className={`font-bold text-base border-b ${styles.wellBorder} pb-3 flex items-center gap-2`}>
          <DollarSign className="w-5 h-5 text-indigo-400" />
          <span>{t.expensesManagement}</span>
        </h2>

        {/* Record Expense Form */}
        <div className={`${styles.well} p-4 rounded-xl space-y-3.5 text-xs`}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`text-xs ${styles.textSecondary} block mb-1`}>{t.expenseCategory}</label>
              <select
                value={newExp.category}
                onChange={(e) => setNewExp({ ...newExp, category: e.target.value })}
                className={`w-full ${styles.inputSecondary} rounded px-2.5 py-2`}
              >
                <option value="إيجار / Rent">إيجار / Rent</option>
                <option value="فواتير / Utilities">فواتير / Utilities</option>
                <option value="بضاعة ومشتريات / Raw Materials">بضاعة ومشتريات / Raw Materials</option>
                <option value="أخرى / Others">أخرى / Others</option>
              </select>
            </div>
            <div>
              <label className={`text-xs ${styles.textSecondary} block mb-1`}>{t.expenseAmount}</label>
              <input
                type="number"
                value={newExp.amount}
                onChange={(e) => setNewExp({ ...newExp, amount: Number(e.target.value) })}
                className={`w-full ${styles.inputSecondary} rounded px-2.5 py-2 font-mono`}
              />
            </div>
          </div>

          <div>
            <label className={`text-xs ${styles.textSecondary} block mb-1`}>{t.expenseNotes}</label>
            <input
              type="text"
              value={newExp.notes}
              onChange={(e) => setNewExp({ ...newExp, notes: e.target.value })}
              className={`w-full ${styles.inputSecondary} rounded px-2.5 py-2`}
            />
          </div>

          <button
            onClick={() => {
              if (newExp.amount <= 0) return;
              addExpense(newExp);
              setNewExp({ category: "إيجار / Rent", amount: 0, notes: "" });
              triggerToast(isAr ? "تم تقييد المصروف الجديد" : "Expense recorded successfully!");
            }}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 font-bold rounded transition-colors cursor-pointer text-slate-100"
          >
            {t.addExpense}
          </button>
        </div>

        {/* Expenses Table */}
        <div className="overflow-x-auto max-h-[220px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b ${styles.wellBorder} ${styles.textSecondary}`}>
                <th className="py-2 px-1">{t.expenseCategory}</th>
                <th className="py-2 px-1 font-mono">{t.expenseAmount}</th>
                <th className="py-2 px-1">{t.expenseNotes}</th>
                <th className="py-2 px-1 font-mono">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {state.expenses.map(exp => (
                <tr key={exp.id} className={`border-b ${styles.wellBorder}`}>
                  <td className={`py-2 px-1 font-semibold ${styles.textPrimary}`}>{exp.category}</td>
                  <td className="py-2 px-1 font-mono text-indigo-500 font-bold">{(exp.amount ?? 0).toFixed(2)} $</td>
                  <td className={`py-2 px-1 ${styles.textSecondary} max-w-[150px] truncate`}>{exp.notes}</td>
                  <td className={`py-2 px-1 font-mono text-[10px] ${styles.textTertiary}`}>{exp.timestamp.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Salaries payroll panel */}
      <div className={`${styles.card} p-5 rounded-2xl space-y-4`}>
        <h2 className={`font-bold text-base border-b ${styles.wellBorder} pb-3 flex items-center gap-2`}>
          <Users className="w-5 h-5 text-indigo-400" />
          <span>{t.salaryManagement}</span>
        </h2>

        {/* Add Salary payout Form */}
        <div className={`${styles.well} p-4 rounded-xl space-y-3.5 text-xs`}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`text-xs ${styles.textSecondary} block mb-1`}>{t.employeeName}</label>
              <input
                type="text"
                value={newSal.employeeName}
                onChange={(e) => setNewSal({ ...newSal, employeeName: e.target.value })}
                className={`w-full ${styles.inputSecondary} rounded px-2.5 py-2`}
              />
            </div>
            <div>
              <label className={`text-xs ${styles.textSecondary} block mb-1`}>{t.baseSalary}</label>
              <input
                type="number"
                value={newSal.baseSalary}
                onChange={(e) => setNewSal({ ...newSal, baseSalary: Number(e.target.value) })}
                className={`w-full ${styles.inputSecondary} rounded px-2.5 py-2 font-mono`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`text-xs ${styles.textSecondary} block mb-1`}>{t.bonus}</label>
              <input
                type="number"
                value={newSal.bonuses}
                onChange={(e) => setNewSal({ ...newSal, bonuses: Number(e.target.value) })}
                className={`w-full ${styles.inputSecondary} rounded px-2.5 py-2 font-mono`}
              />
            </div>
            <div>
              <label className={`text-xs ${styles.textSecondary} block mb-1`}>{t.deductions}</label>
              <input
                type="number"
                value={newSal.deductions}
                onChange={(e) => setNewSal({ ...newSal, deductions: Number(e.target.value) })}
                className={`w-full ${styles.inputSecondary} rounded px-2.5 py-2 font-mono`}
              />
            </div>
          </div>

          <button
            onClick={() => {
              if (!newSal.employeeName) return;
              addSalaryPayout(newSal);
              setNewSal({ employeeName: "", baseSalary: 2500, bonuses: 0, deductions: 0, notes: "" });
              triggerToast(isAr ? "تم تسجيل صرف الراتب والمستحقات المعتمدة" : "Staff salary paid out successfully!");
            }}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 font-bold rounded transition-colors cursor-pointer text-slate-100"
          >
            {t.addSalary}
          </button>
        </div>

        {/* Payroll Table */}
        <div className="overflow-x-auto max-h-[170px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b ${styles.wellBorder} ${styles.textSecondary}`}>
                <th className="py-2 px-1">{t.employeeName}</th>
                <th className="py-2 px-1 font-mono">الأساسي</th>
                <th className="py-2 px-1 font-mono">مكافآت / خصومات</th>
                <th className="py-2 px-1 font-mono">صافي الرواتب</th>
              </tr>
            </thead>
            <tbody>
              {state.salaries.map(sal => (
                <tr key={sal.id} className={`border-b ${styles.wellBorder}`}>
                  <td className={`py-2 px-1 font-medium ${styles.textPrimary}`}>{sal.employeeName}</td>
                  <td className={`py-2 px-1 font-mono ${styles.textSecondary}`}>{sal.baseSalary} $</td>
                  <td className={`py-2 px-1 font-mono ${styles.textTertiary}`}>+{sal.bonuses} / -{sal.deductions}</td>
                  <td className="py-2 px-1 font-mono text-indigo-500 font-bold">
                    {((sal.baseSalary ?? 0) + (sal.bonuses ?? 0) - (sal.deductions ?? 0)).toFixed(2)} $
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
