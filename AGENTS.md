# Xcashme-vpro POS - Engineering Guidelines & Architectural Patterns

This document defines the SOLID principles, clean architecture patterns, data flows, and coding standards for scaling the Xcashme-vpro Point of Sale (POS) system.

---

## 1. Architectural Blueprint (Clean & Modular)

To maintain long-term agility and scale across multiple retail branches, the system decouples presentation, state orchestration, business domains, and persistence layers.

```
+-------------------------------------------------------------+
|                      Presentation (UI)                      |
|       React + Tailwind CSS + Lucide Icons + Framer Motion    |
+------------------------------+------------------------------+
                               | Dispatches Actions
                               v
+-------------------------------------------------------------+
|               State Orchestration & Sync (Hooks)            |
|       usePOSState (Event-driven flow, LocalStorage fallback) |
+------------------------------+------------------------------+
                               |
       +-----------------------+-----------------------+
       | Synchronizes State                            | Emits Audit Logs
       v                                               v
+------------------------------+        +------------------------------+
|   Multi-Branch Sync Handler  |        |    Security & Audit Logger   |
|   /api/sync REST Proxy       |        |    Role-based guards / Audit |
+------------------------------+        +------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                   Durable Store (Backend)                    |
|       Express Server + Client-side Fallback (Local DB)       |
+-------------------------------------------------------------+
```

---

## 2. SOLID Design Principles Applied

### Single Responsibility Principle (SRP)
* **Components**: Each view (e.g., `CartPanel`, `InventoryList`, `ReportDashboard`) has a single job.
* **Hooks**: State mutations reside strictly in dedicated hooks (e.g., `usePOSState`), while API communication is kept isolated.

### Open/Closed Principle (OCP)
* **Tax and Discounts**: Pricing engines use plugin-style strategies. You can register new tax models or loyalty multipliers without refactoring core checkout loops.

### Liskov Substitution Principle (LSP)
* **Storage Provider**: Standardized interfaces allow hot-swapping localStorage adapters, Firestore adapters, or Cloud SQL endpoints transparently.

### Interface Segregation Principle (ISP)
* Interfaces are highly specialized. A `Customer` model does not carry internal authentication payload details; an `AuditLogEntry` is kept separate from transaction logs.

### Dependency Inversion Principle (DIP)
* High-level views depend on state hooks rather than directly accessing network sockets. State synchronizers inject storage adapters.

---

## 3. Persistent Event-Driven Flows

State updates trigger localized events that are synchronized back to the server and local storage. This preserves the user's data during intermittent network drops and streams changes smoothly.

1. **User Action**: Cashier completes a sale.
2. **Event Dispatch**: `SALE_COMPLETED` is fired with standard payload.
3. **State Mutation**: Reducer appends the sale, updates product quantities, increments customer loyalty points.
4. **Local Backup**: State is stored to `localStorage`.
5. **Branch Sync**: Event is pushed to the `/api/sync` queue to update other branches.
6. **Audit Logging**: Logs the action under the active operator's user session.

---

## 4. Secure Authentication & Multi-Branch Schema

* **Roles**: `Administrator`, `Manager`, `Cashier`.
* **Permissions**: Access reports, modify price categories, process returns, handle expenses.
* **Multi-Branch Identifier**: All records are stamped with a `branchId` and a sequential conflict-free logical clock for synchronization.

---

## 5. Coding Standards

* **Bilingual Design (AR/EN)**: English as standard system logic, Arabized UI terms for easy regional usage (bilingual tooltips and toggles).
* **Defensive Calculations**: Round decimals to 3 points for exact decimal weights (e.g., fruits, weight-based inventory).
* **Server-Side API Keys**: The Gemini API keys must remain strictly server-side in `server.ts` or `/api/*`. Do not expose them to the browser.
