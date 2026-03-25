# Tasks: Restaurant POS

<!-- This project is at v1.2.0 — core features are implemented. -->
<!-- Tasks marked ✅ are complete. Open tasks cover gaps identified in architecture.md and design.md. -->
<!-- Priority applies only to open tasks. -->

---

## 0. Minimum Deliverable

The following smoke test must pass end-to-end without errors:

```
1. App launches → Login screen visible in < 3 seconds
2. Login with valid credentials → redirected to Registry
3. Type a product code → row fills automatically
4. Type a product name (partial) → autocomplete dropdown appears
5. Select a second product → new row created, focus moves to next code field
6. Select a product already in the list → quantity increments, no duplicate row
7. Press Enter on empty row → sale submitted, registry clears
8. Navigate to Sales → submitted sale appears in the list
9. Open sale → flag as reported (reason ≥ 20 chars) → sale disappears from totals
10. Log in as admin → open reported sale → cancel report → sale reappears in totals
11. Admin deletes a sale → sale removed from history entirely
12. Navigate to Products → add a product, edit it, delete it
13. Import products from a valid CSV → success summary shown, products appear
14. Export products to CSV → file saved to chosen path
15. App closes and reopens → all data persists
```

All 🔴 CRITICAL tasks must be complete for this to pass.

---

## Priority Legend

- 🔴 **CRITICAL**: Must be done. Without it, the project doesn't work or data is at risk.
- 🟡 **IMPORTANT**: Should be done. The project works without it, but is incomplete.
- 🟢 **NICE-TO-HAVE**: Can be done later. Not essential for MVP.

---

## 1. Project Preparation

**Status:** Mostly complete. Gaps: no test runner, no pre-commit hooks.

- [x] ✅ Repository structure matches design.md Section 1 convention
- [x] ✅ ESLint configured (`eslint.config.js` + standard preset)
- [x] ✅ TypeScript strict config (`tsconfig.app.json`)
- [x] ✅ Vite + Tailwind + shadcn/ui configured
- [x] ✅ Bun as package manager and runtime
- [x] ✅ `@/` path alias configured in `vite.config.ts`
- [ ] 🔴 **1.1** Install and configure Vitest (`bun add -D vitest @vitest/ui jsdom`) — add `test` script to `package.json` and a `vitest.config.ts` that resolves the `@/` alias
- [ ] 🟡 **1.2** Add `@testing-library/react` and `@testing-library/user-event` for component tests (depends on: #1.1)
- [ ] 🟡 **1.3** Configure pre-commit hook (Husky or simple Bun script) to run `tsc --noEmit` + `eslint` before every commit
- [ ] 🟢 **1.4** Add `vitest --coverage` to CI script and set minimum coverage threshold (60% lines to start)

---

## 2. Database / Migrations

**Module Deliverable:** App launches, SQLite file is created automatically, all 5 tables exist with correct schema, and data survives restarts.

- [x] ✅ `tauri-plugin-sql` registered in `lib.rs`
- [x] ✅ `migrations.rs` loads and runs all SQL files at startup
- [x] ✅ All 5 migration files exist and are ordered correctly
- [x] ✅ `database/db.ts` opens the connection and exports a singleton
- [ ] 🔴 **2.1** Verify `sale_items` has `ON DELETE CASCADE` from `sales.id` — if missing, a deleted sale will leave orphan rows; add `006_fix_cascade.sql` if needed
- [ ] 🔴 **2.2** Verify `sale_reports.sale_id` is `UNIQUE` (one report per sale constraint is in the schema, not just application layer) — add migration if missing
- [ ] 🟡 **2.3** Document the migration convention in `docs/` (file naming, never edit existing files, always add a new numbered file) — prevents future mistakes
- [ ] 🟢 **2.4** Add a "Backup database" admin action that copies the `.db` file to a user-chosen path via `tauri-plugin-dialog` + `tauri-plugin-fs`

---

## 3. Products Feature

**Module Deliverable:** Admin can create, edit, delete, import from CSV/XLSX, and export to CSV/XLSX. All products appear in registry autocomplete and code lookup.

- [x] ✅ `products.repository.ts` — CRUD queries implemented
- [x] ✅ `products.service.ts` — orchestrates CRUD and delegates to export/import services
- [x] ✅ `parseProductsFile.ts` — handles CSV (PapaParse) and XLSX (SheetJS)
- [x] ✅ `exportProductsCsv.ts` / `exportProductsExcel.ts` — write via `lib/saveFile`
- [x] ✅ `ProductsPage`, `ProductsTable`, `ProductDialog`, import/export dialogs
- [ ] 🔴 **3.1** Write unit tests for `parseProductsFile`: valid CSV, valid XLSX, missing required columns, empty file, malformed rows — assert `{ valid[], skipped }` counts (depends on: #1.1)
- [ ] 🔴 **3.2** Write unit tests for `products.service`: createProduct, updateProduct, deleteProduct — mock repository, assert calls and error propagation (depends on: #1.1)
- [ ] 🟡 **3.3** Handle the case where a CSV import has duplicate `code` values within the file itself (not just vs. the DB) — current `INSERT OR REPLACE` silently overwrites; surface a warning
- [ ] 🟡 **3.4** Validate that `price` is a positive number and `code` is non-empty in the Zod schema before any DB call — confirm these constraints are enforced
- [ ] 🟡 **3.5** Write component test for `ProductDialog`: submit with valid data calls service, submit with invalid data shows field errors (depends on: #1.2)
- [ ] 🟢 **3.6** Add column visibility toggle to `ProductsTable` (show/hide `code`, `price`, `active`) using TanStack column visibility API

---

## 4. Registry Feature

**Module Deliverable:** Cashier can register a complete multi-product sale in under 30 seconds using only the keyboard, with autocomplete, code lookup, duplicate detection, and quick submit.

- [x] ✅ `useRegistryState` — row array management
- [x] ✅ `useRegistryActions` — add/remove/update rows, code lookup, name search
- [x] ✅ `useRegistryFocus` — keyboard navigation between cells
- [x] ✅ `useSubmitRegistry` — builds payload and calls `registry.service.submitSale`
- [x] ✅ `RegistryTable` with inline-editable `CodeRow`, `NameRow`, `QuantityRow`
- [x] ✅ `registry.service.ts` — builds sale payload, delegates to `sales.repository`
- [ ] 🔴 **4.1** Write unit tests for `useRegistryActions`: code lookup hit, code lookup miss, duplicate product increments quantity, remove row, update quantity (depends on: #1.1)
- [ ] 🔴 **4.2** Write unit tests for `useRegistryFocus`: Enter on CodeRow moves to NameRow, Enter on NameRow after product selected creates new row, Enter on empty CodeRow triggers submit (depends on: #1.1)
- [ ] 🔴 **4.3** Write unit tests for `registry.service.buildSalePayload`: correct total calculation, item deduplication, empty row list throws (depends on: #1.1)
- [ ] 🟡 **4.4** Add a "clear registry" confirmation dialog — currently unclear if navigating away mid-sale silently discards rows
- [ ] 🟡 **4.5** Show a success toast or visual feedback after a sale is submitted (currently unclear if there is any confirmation beyond the table clearing)
- [ ] 🟡 **4.6** Handle `registry.service.submitSale` failure in `useSubmitRegistry` — show an error message, do not clear rows if the DB write failed
- [ ] 🟢 **4.7** Add a row-level "remove" button as a fallback for non-keyboard users

---

## 5. Sales Feature

**Module Deliverable:** Any user can view and filter sales history. Totals exclude reported sales. Cashiers can flag sales. Admins can cancel reports or delete sales.

- [x] ✅ `sales.repository.ts` — insertSale (with items), getAll with filters, getTotals, report CRUD
- [x] ✅ `sales.service.ts` — filter mapping, report/cancel/delete orchestration
- [x] ✅ `exportSalesCsv.ts` / `exportSalesExcel.ts`
- [x] ✅ `SalesPage`, `SalesTable`, `SaleDialog`, `ReportSaleDialog`, `SalesOptions`, `SalesExportDialog`
- [ ] 🔴 **5.1** Write unit tests for `sales.repository.getTotals`: assert reported sales are excluded from the sum — use an in-memory SQLite instance or mock the DB call (depends on: #1.1)
- [ ] 🔴 **5.2** Write unit tests for `sales.service`: reportSale calls repository with correct args, cancelReport calls deleteReport, deleteSale calls repository (depends on: #1.1)
- [ ] 🔴 **5.3** Confirm `deleteSale` cascades to `sale_items` and `sale_reports` — if `ON DELETE CASCADE` is missing (see #2.1), this will leave orphans; test it explicitly
- [ ] 🟡 **5.4** Write unit tests for `ReportSaleDialog`: submit with reason < 20 chars shows Zod error, submit with valid reason calls service (depends on: #1.2)
- [ ] 🟡 **5.5** Resolve Open Assumption: is `deleteSale` a hard DELETE or a soft-delete flag? Document the decision in `architecture.md` Section 13 and update `005_` migration or add `006_` if a soft-delete column is added
- [ ] 🟡 **5.6** Verify the totals aggregation query uses `LEFT JOIN sale_reports ... WHERE sr.id IS NULL` and not an application-layer filter — confirm in `sales.repository.ts`
- [ ] 🟢 **5.7** Add date-range preset buttons to `SalesOptions` (Today, This Week, This Month) to speed up filtering

---

## 6. Users / Auth Feature

**Module Deliverable:** A user can log in, be identified as admin or cashier, and the role gates admin-only actions correctly. The auth mechanism is documented and consistent.

- [x] ✅ `users.repository.ts` — findByUsername, insert, update
- [x] ✅ `users.service.ts` — authenticate
- [x] ✅ `userStore.ts` — holds current user + role in Zustand
- [x] ✅ Login, SignUp, Token pages exist
- [ ] 🔴 **6.1** Resolve Open Assumption: document what `credential` stores — PIN (plain integer), hashed PIN, or one-time token. If stored plain, add a note in `users.types.ts`; if hashed, confirm the hash function and update `users.service.authenticate` accordingly
- [ ] 🔴 **6.2** Confirm `Router.tsx` has a protected route guard that redirects unauthenticated users to `/login` — if not, add it (any route except `/login`, `/signup`, `/token` should require `userStore.user !== null`)
- [ ] 🔴 **6.3** Write unit tests for `users.service.authenticate`: valid credentials return User, invalid credentials return null, unknown username returns null (depends on: #1.1)
- [ ] 🟡 **6.4** Resolve Open Assumption: can only one admin exist (seeded on first run via SignUp), or can multiple admins be created? Update `SignUp.tsx` and `users.service` to enforce the rule
- [ ] 🟡 **6.5** Confirm `SaleDialog` and all admin-only action buttons check `userStore.role === 'admin'` — audit all three admin actions (cancel report, delete sale, any user management) and add role guards where missing
- [ ] 🟡 **6.6** Write component test for Login: submit with wrong credentials shows error, submit with valid credentials sets `userStore` and redirects (depends on: #1.2)
- [ ] 🟢 **6.7** Add a logout action in `UserMenu` that clears `userStore` and redirects to `/login`
- [ ] 🟢 **6.8** Show the current user's name and role badge in the `Header` via `UserMenu`

---

## 7. Shared Infrastructure

**Module Deliverable:** Error handling is consistent across all modules. The app does not silently crash when a DB call fails.

- [x] ✅ `lib/utils.ts` (clsx/cn), `lib/date.ts`, `lib/saveFile.ts` implemented
- [x] ✅ `usePagination.ts` shared hook
- [ ] 🔴 **7.1** Add a React error boundary (`src/app/ErrorBoundary.tsx`) that wraps the router — catches any uncaught runtime error and shows a recovery screen instead of a blank page
- [ ] 🔴 **7.2** Audit all hooks that call services: confirm every async call has a `try/catch` that sets local error state — look specifically at `useProducts`, `useSales`, `useSubmitRegistry`
- [ ] 🟡 **7.3** Add a global toast/notification component (shadcn `Sonner` or similar) — replace any `alert()` or silent failures with toast messages for success and error feedback
- [ ] 🟡 **7.4** Write unit tests for `lib/saveFile`: confirm it calls the Tauri FS plugin with correct path and content — mock `@tauri-apps/plugin-fs` (depends on: #1.1)
- [ ] 🟢 **7.5** Add a `focusPreferenceStore` UI toggle in `UserSettings` (if not already present) so users can disable the keyboard-auto-focus behavior in the registry

---

## 8. Integration

**Module Deliverable:** The complete register-a-sale → view-in-history → flag → admin-action flow works end-to-end without errors.

### Critical Path

- [ ] 🔴 **8.1** Integration test: insert 2 products via `products.repository`, submit a sale via `registry.service.submitSale`, query via `sales.repository.getAll` — assert sale and items exist (depends on: #3, #4, #5)
- [ ] 🔴 **8.2** Integration test: submit a sale, report it via `sales.repository.insertReport`, call `sales.repository.getTotals` — assert total is 0; cancel the report, call totals again — assert total is restored (depends on: #5.1)
- [ ] 🔴 **8.3** Manual smoke test of the full scenario in Section 0 on a clean install (no existing `.db` file)

### Important Features

- [ ] 🟡 **8.4** Integration test: import a CSV, then look up one of the imported products by code in the registry flow — confirms import → lookup pipeline works (depends on: #3, #4)
- [ ] 🟡 **8.5** Test that `sale_items` are deleted when a sale is deleted (cascade integrity test) (depends on: #2.1, #5.3)

### Polish

- [ ] 🟢 **8.6** Run the full smoke test with a 500-product dataset — verify autocomplete response stays under 200ms

---

## 9. Documentation

### Critical

- [ ] 🔴 **9.1** Update `README.md` to reflect current v1.2.0 features (the existing README appears up to date — verify the Quick Start commands still work on a clean clone)
- [ ] 🔴 **9.2** Add `docs/concept.md`, `docs/architecture.md`, `docs/design.md` to the repository under `docs/` — confirm the folder referenced in architecture.md exists

### Important

- [ ] 🟡 **9.3** Create `docs/adr/` and move the three ADR files there — update cross-references in `architecture.md`
- [ ] 🟡 **9.4** Document the auth/credential mechanism (once resolved in #6.1) in a `docs/adr/adr-004-auth-mechanism.md`
- [ ] 🟡 **9.5** Document the soft vs hard delete decision (once resolved in #5.5) in `architecture.md` Section 13

### Nice-to-Have

- [ ] 🟢 **9.6** Add a `CONTRIBUTING.md` with: how to run locally, how to add a migration, the cross-feature import rule, the layer dependency direction
- [ ] 🟢 **9.7** Add architecture diagram (Mermaid) to `docs/architecture.md` showing the feature → service → repository → SQLite flow

---

## 10. Final Validation

### Critical

- [ ] 🔴 **10.1** Verify all items in Section 0 smoke test pass on a fresh Windows machine (clean install, no dev tools)
- [ ] 🔴 **10.2** Verify all Technical Acceptance Criteria from `architecture.md` Section 14:
  - [ ] Sale with 5 items registered in < 30 seconds keyboard-only
  - [ ] Reported sale excluded from totals — verified by direct DB query
  - [ ] 100-row CSV import shows correct inserted/skipped counts
  - [ ] App reaches Login in < 3 seconds on target hardware
  - [ ] `bun tauri dev` from clean clone starts without manual DB setup
- [ ] 🔴 **10.3** Resolve all 5 Open Assumptions from `architecture.md` Section 13 — each must be either documented or closed with a decision

### Important

- [ ] 🟡 **10.4** Run `eslint` and `tsc --noEmit` with zero errors/warnings on the full codebase
- [ ] 🟡 **10.5** Code review of `registry` feature — highest complexity, highest regression risk

### Nice-to-Have

- [ ] 🟢 **10.6** Run the app for a simulated 8-hour shift (100+ sales) and check for memory leaks or slow queries
- [ ] 🟢 **10.7** Verify the app bundles and installs correctly via `bun tauri build` — test the `.msi` or `.exe` installer on a clean machine

---

## Quick Reference: What's MVP?

**To ship the Minimum Viable Product**, complete all 🔴 tasks.
That means: test runner configured, critical unit tests written, auth mechanism documented and working, error boundary in place, DB cascades verified, and the Section 0 smoke test passing.

**To ship a solid 1.0**, add all 🟡 tasks.
That means: edge cases handled (import duplicates, failed submissions), admin role fully gated, toast notifications, full integration tests, and all open assumptions closed.

**To ship a polished product**, complete all tasks including 🟢.
That means: backup DB feature, column visibility, date presets, logout, performance validated at scale.

---

## Open Assumptions Tracker

These must be resolved before 10.3 can be checked off:

| #   | Assumption                                     | Task | Owner |
| --- | ---------------------------------------------- | ---- | ----- |
| A1  | Auth credential format (PIN vs hash vs token)  | #6.1 | —     |
| A2  | Single admin vs multiple admins                | #6.4 | —     |
| A3  | Sale deletion: hard DELETE vs soft-delete flag | #5.5 | —     |
| A4  | Test tooling: Vitest confirmed                 | #1.1 | —     |
| A5  | Data backup/export in scope                    | #2.4 | —     |