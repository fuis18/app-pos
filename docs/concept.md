# Concept: Restaurant POS

## 1. Project Type

Desktop App

## 2. Idea

A desktop point-of-sale app for restaurants that handles product inventory and sales tracking, with reporting and anomaly flagging, running fully offline.

## 3. Users and Actors

- **Cashier (non-logged user)**: register sales, flag sales as anomalous with a reason
- **Admin**: manage products, review and act on flagged sales, access full reports

## 4. Problem

Restaurant staff need a simple, offline-capable tool to register sales and manage inventory without depending on web connectivity or expensive SaaS POS solutions. Without it, tracking is done manually (spreadsheets or paper), making it error-prone and hard to audit.

## 5. Objective

A standalone desktop app where cashiers can complete a sale in under 30 seconds and admins can review daily totals and flagged anomalies from a single screen.

## 6. Value Proposition

Fully local (no server, no subscription), fast product lookup via code or autocomplete, and a lightweight audit trail through the sales report/flag system — suited for small restaurants that want control without complexity.

## 7. Main Features

- [ ] Product CRUD with CSV/XLSX import and export
- [ ] Sales registration with autocomplete and code-based product lookup
- [ ] Duplicate detection: selecting an existing product increments quantity
- [ ] Quick keyboard-driven submission (Enter on empty row submits the sale)
- [ ] Sales history with filtering
- [ ] Non-admin users can flag a sale as anomalous (reason required, min 20 chars)
- [ ] Admin can cancel a report or delete a flagged sale
- [ ] Sales summary excludes reported sales from totals
- [ ] All data stored locally via SQLite

## 8. Out of Scope

- Does not include user authentication or role-based login (admin vs cashier is not session-based)
- Does not support multi-location or networked/cloud sync
- Does not generate fiscal receipts or integrate with fiscal printers
- Does not handle payments, tips, or cash drawer management
- Does not support multiple currencies or tax rules
- Does not include customer management or loyalty programs

## 9. Restrictions

- **Technical**: must run offline; data must persist locally via SQLite
- **Platform**: Windows desktop (Tauri); no browser or mobile version required
- **Business**: no external services or subscriptions

## 10. Success

- [ ] A cashier can register a complete sale (multiple products) in under 30 seconds using keyboard only
- [ ] Admin can view daily sales total and identify flagged sales without navigating more than 2 screens
- [ ] Products can be imported from CSV/XLSX and immediately appear in the sales lookup
- [ ] Reported sales are visibly excluded from totals in the summary view

## 11. Risks

- [ ] Keyboard-driven UX (autocomplete, code lookup, quick submit) is high-complexity to implement consistently — partial implementation degrades the main value prop
- [ ] No login system means there's no audit trail of _who_ performed an action, which may limit trust in the report system
- [ ] SQLite migrations must be handled carefully; corrupt or missing local DB has no recovery path without backups

## 12. Next step

- Preferred stack (already decided): React + TypeScript + Vite + Tailwind + shadcn/ui (Radix), packaged with Tauri (Rust), SQLite via tauri-plugin-sql
- Open questions:
  - Is there a distinction between "admin" and "cashier" beyond UI access? Is there any login or PIN, or is it purely a view/mode switch?
  - Should flagged sales be recoverable (restore to normal) or is cancel-report the only action?
  - Is CSV/XLSX export scoped to products only, or also to sales history?
