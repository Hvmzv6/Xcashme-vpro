/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { TrendingUp, DollarSign, Award } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  Legend,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { POSState } from "../../../types/pos";

interface ReportsViewProps {
  state: POSState;
  t: any;
  styles: any;
  isAr: boolean;
  totalSalesRevenue: number;
  totalExpensesCost: number;
  estimatedNetProfit: number;
  branchSalesData: any[];
  salesTrendData: any[];
  categoryShareData: any[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  state,
  t,
  styles,
  isAr,
  totalSalesRevenue,
  totalExpensesCost,
  estimatedNetProfit,
  branchSalesData,
  salesTrendData,
  categoryShareData
}) => {
  return (
    <div className="space-y-6">
      
      {/* Financial overview KPI blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className={`${styles.card} p-5 rounded-2xl flex items-center justify-between`}>
          <div>
            <p className={`text-xs ${styles.textSecondary} font-medium mb-1`}>{t.totalSales}</p>
            <h3 className="text-2xl font-bold text-emerald-500">{totalSalesRevenue.toFixed(2)} $</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className={`${styles.card} p-5 rounded-2xl flex items-center justify-between`}>
          <div>
            <p className={`text-xs ${styles.textSecondary} font-medium mb-1`}>{t.totalExpenses}</p>
            <h3 className="text-2xl font-bold text-rose-500">{totalExpensesCost.toFixed(2)} $</h3>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className={`${styles.card} p-5 rounded-2xl flex items-center justify-between`}>
          <div>
            <p className={`text-xs ${styles.textSecondary} font-medium mb-1`}>{t.netProfit}</p>
            <h3 className="text-2xl font-bold text-indigo-500">{estimatedNetProfit.toFixed(2)} $</h3>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
            <Award className="w-6 h-6 animate-spin-slow text-indigo-300" />
          </div>
        </div>
      </div>

      {/* Interactive Charts Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Bar Chart: Sales Comparison by branch */}
        <div className={`${styles.card} p-5 rounded-2xl`}>
          <h3 className="font-bold text-sm mb-4">{t.salesByBranch}</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchSalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke={state.theme === "dark" ? "#1e293b" : "#e2e8f0"} />
                <XAxis dataKey="name" stroke={state.theme === "dark" ? "#94a3b8" : "#64748b"} fontSize={11} />
                <YAxis stroke={state.theme === "dark" ? "#94a3b8" : "#64748b"} fontSize={11} />
                <ChartTooltip contentStyle={{ backgroundColor: state.theme === "dark" ? "#0f172a" : "#ffffff", border: state.theme === "dark" ? "1px solid #1e293b" : "1px solid #e2e8f0", color: state.theme === "dark" ? "#f8fafc" : "#0f172a", borderRadius: "8px" }} />
                <Legend />
                <Bar dataKey="Sales" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Visitors" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales trend hourly */}
        <div className={`${styles.card} p-5 rounded-2xl`}>
          <h3 className="font-bold text-sm mb-4">{isAr ? "مخطط حركة البيع الزمني" : "Sales Transaction Timeline"}</h3>
          <div className="h-72 w-full">
            {salesTrendData.length === 0 ? (
              <div className={`h-full flex items-center justify-center ${styles.textTertiary} text-xs`}>
                {isAr ? "لا توجد حركات مبيعات كافية اليوم للمخطط" : "No sales data today"}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={state.theme === "dark" ? "#1e293b" : "#e2e8f0"} />
                  <XAxis dataKey="time" stroke={state.theme === "dark" ? "#94a3b8" : "#64748b"} fontSize={11} />
                  <YAxis stroke={state.theme === "dark" ? "#94a3b8" : "#64748b"} fontSize={11} />
                  <ChartTooltip contentStyle={{ backgroundColor: state.theme === "dark" ? "#0f172a" : "#ffffff", border: state.theme === "dark" ? "1px solid #1e293b" : "1px solid #e2e8f0", color: state.theme === "dark" ? "#f8fafc" : "#0f172a", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pie share of Categories */}
        <div className={`${styles.card} p-5 rounded-2xl`}>
          <h3 className="font-bold text-sm mb-4">{t.categoryShare}</h3>
          <div className="h-64 flex flex-col md:flex-row items-center justify-around gap-4">
            <div className="h-48 w-48 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryShareData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryShareData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 text-xs">
              {categoryShareData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className={`${styles.textPrimary} font-medium`}>{item.name}</span>
                  <span className={`${styles.textTertiary} font-mono`}>({item.value} $)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Audit Trail List in Reports */}
        <div className={`${styles.card} p-5 rounded-2xl space-y-3.5`}>
          <h3 className={`font-bold text-sm border-b ${styles.wellBorder} pb-2.5`}>{t.auditLogs}</h3>
          <div className="space-y-2.5 max-h-[220px] overflow-y-auto">
            {state.auditLogs.map(log => (
              <div key={log.id} className={`${styles.well} p-2.5 rounded-xl text-xs flex justify-between items-center`}>
                <div>
                  <p className={`font-semibold ${styles.textPrimary}`}>{log.action}</p>
                  <p className={`${styles.textSecondary} text-[11px]`}>{log.details}</p>
                </div>
                <div className="text-right font-mono">
                  <p className={`${styles.textTertiary} text-[10px]`}>{log.timestamp.slice(11, 19)}</p>
                  <p className="text-[10px] text-indigo-500 font-semibold">{log.userName.split(" ")[0]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
