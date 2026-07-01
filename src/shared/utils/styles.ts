/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function getStyles(isDark: boolean) {
  return {
    bg: isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900",
    hoverBg: isDark ? "bg-slate-850/30" : "bg-slate-100/50",
    header: isDark ? "border-b border-slate-800 bg-slate-900/80 backdrop-blur-md" : "border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-sm text-slate-900",
    headerTitle: isDark ? "text-xl font-bold font-display tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent" : "text-xl font-bold font-display tracking-tight text-slate-900",
    headerSubtitle: isDark ? "text-xs text-slate-400" : "text-xs text-slate-500",
    badgeWell: isDark ? "bg-slate-850 border-slate-700 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-700",
    badgeActive: isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700",
    btnGhost: isDark ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-200/60 text-slate-700",
    sidebar: isDark ? "w-full lg:w-64 border-r lg:border-b-0 border-slate-800 bg-slate-900/50 p-4 space-y-2 shrink-0" : "w-full lg:w-64 border-r lg:border-b-0 border-slate-200 bg-white p-4 space-y-2 shrink-0 shadow-sm",
    sidebarBtnUnselected: isDark ? "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    card: isDark ? "bg-slate-900 border border-slate-800" : "bg-white border border-slate-200 shadow-sm",
    well: isDark ? "bg-slate-950 border border-slate-850" : "bg-slate-100/60 border border-slate-200/60",
    wellInner: isDark ? "bg-slate-950" : "bg-slate-50",
    wellText: isDark ? "text-slate-300" : "text-slate-700",
    wellTextMuted: isDark ? "text-slate-400" : "text-slate-500",
    wellBorder: isDark ? "border-slate-850" : "border-slate-200/60",
    input: isDark ? "bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500" : "bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500 shadow-sm",
    inputLabel: isDark ? "text-slate-300" : "text-slate-700",
    inputSecondary: isDark ? "bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500" : "bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500 shadow-sm",
    th: isDark ? "border-b border-slate-800 text-slate-400 font-semibold text-xs" : "border-b border-slate-200 text-slate-500 font-semibold text-xs bg-slate-50/50",
    tr: isDark ? "border-b border-slate-850" : "border-b border-slate-100",
    tdText: isDark ? "text-slate-100" : "text-slate-800",
    tdMuted: isDark ? "text-slate-400" : "text-slate-500",
    modal: isDark ? "bg-slate-900 border border-slate-800 shadow-2xl" : "bg-white border border-slate-200 shadow-2xl",
    modalHeader: isDark ? "border-b border-slate-800 bg-slate-950/80" : "border-b border-slate-200 bg-slate-50/90",
    modalInner: isDark ? "bg-slate-950" : "bg-slate-50",
    modalFooter: isDark ? "p-4 bg-slate-950 border-t border-slate-800" : "p-4 bg-slate-50 border-t border-slate-200",
    modalOverlay: isDark ? "bg-slate-950/80" : "bg-slate-900/40",
    textPrimary: isDark ? "text-slate-100" : "text-slate-900",
    textSecondary: isDark ? "text-slate-400" : "text-slate-600",
    textTertiary: isDark ? "text-slate-500" : "text-slate-400",
    btnSec: isDark ? "bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700" : "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200",
    btnOutline: isDark ? "border border-slate-800 hover:border-slate-700 text-slate-300" : "border border-slate-200 hover:bg-slate-50 text-slate-700",
    catBtnActive: "bg-indigo-600 text-white shadow-lg shadow-indigo-500/10",
    catBtnInactive: isDark ? "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
  };
}
