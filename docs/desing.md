# Design: Restaurant POS

<!-- This document answers HOW the system is built internally. -->
<!-- Generated from architecture.md. Update when modules, flows, data model, or contracts change. -->

---

## 1. Layer / Folder Convention

The project uses a **feature-based layered architecture**. Each domain feature is a self-contained vertical slice. Dependency direction is strictly top-down: components → hooks → service → repository → DB. No layer may import from a layer above it.

**Convention enforced:**

```
src/
├── features/
│   └── <feature>/
│       ├── components/           # React components scoped to this feature
│       │   └── table/
│       │       ├── <feature>-columns.tsx   # TanStack column definitions
│       │       ├── cells/        # Individual cell renderers
│       │       └── hooks/        # Table-specific hooks (e.g. useProductsTable)
│       ├── hooks/                # React hooks — call service, manage local state
│       ├── service/              # Pure TS — orchestrates repository calls, maps data
│       ├── repository/           # All SQL via tauri-plugin-sql. No React here.
│       ├── types/                # Domain types, Zod schemas, constants
│       └── index.ts              # Public barrel export for this feature
│
├── components/                   # Shared UI primitives (used by 2+ features)
│   ├── ui/                       # shadcn/ui + Radix wrappers (generated, do not edit)
│   ├── table/                    # Shared table utilities (CheckRow, etc.)
│   ├── Header.tsx
│   └── PaginationTable.tsx
│
├── pages/                        # Route-level entry points — thin wrappers only
│   ├── Products.tsx
│   ├── Registry.tsx
│   ├── Sales.tsx
│   └── login/
│       ├── Login.tsx
│       ├── SignUp.tsx
│       └── Token.tsx
│
├── store/                        # Zustand global stores
│   ├── userStore.ts              # Current user + role
│   ├── themeStore.ts
│   └── focusPreferenceStore.ts
│
├── hooks/                        # Shared hooks (used by 2+ features)
│   └── usePagination.ts
│
├── lib/                          # Pure utilities (no React, no DB)
│   ├── utils.ts                  # clsx/cn helper
│   ├── date.ts                   # date-fns wrappers
│   └── saveFile.ts               # Tauri FS write helper
│
├── database/                     # DB connection init + helpers
│   ├── db.ts                     # Opens and returns the SQLite connection
│   └── index.ts
│
├── constants/
│   └── config.ts                 # App-level constants (repo URL, GitHub link)
│
├── types/                        # Global type augmentations (e.g. react-table.d.ts)
│
└── app/                          # App shell + router bootstrap
    ├── App.tsx
    ├── App.css
    ├── Router.tsx
    ├── index.css
    └── main.tsx

src-tauri/
└── src/
    ├── main.rs                   # Tauri entry point
    ├── lib.rs                    # Plugin registration (SQL, FS, Dialog)
    ├── migrations.rs             # Loads and runs SQL migration files at startup
    └── migrations/
        ├── 001_create_products.sql
        ├── 002_create_sales.sql
        ├── 003_create_sale_items.sql
        ├── 004_create_users.sql
        └── 005_create_sale_reports.sql
```

**Cross-feature import rule:** A feature may import from `components/`, `hooks/`, `lib/`, `store/`, and `database/`. It must **never** import from another feature's folder. Shared logic must be promoted to the appropriate shared layer first.

---

## 2. Components and Modules

| Module                         | Responsibility                                                                                                                                         | Does NOT handle                         |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- |
| **products/repository**        | All SQL for products: SELECT, INSERT, UPDATE, DELETE, bulk insert from import                                                                          | CSV/XLSX parsing, UI state              |
| **products/service**           | Orchestrates CRUD; calls `parseProductsFile` for imports; calls export services for CSV/XLSX output                                                    | React state, DB connection              |
| **products/components**        | `ProductsPage`, `ProductsTable`, `ProductDialog` (add/edit), `ProductImportDialog`, `ProductExportDialog`, `ProductsOptions`                           | Business logic, direct DB access        |
| **products/hooks**             | `useProducts` — fetches product list, exposes CRUD callbacks to components                                                                             | SQL queries, file I/O                   |
| **registry/service**           | Builds a sale payload from registry rows; deduplicates product entries; delegates to sales repository for persist                                      | React state, focus management           |
| **registry/components**        | `RegistryPage`, `RegistryTable`, inline-editable row cells (`CodeRow`, `NameRow`, `QuantityRow`), autocomplete via `combobox`                          | Persisting to DB, product data fetching |
| **registry/hooks**             | `useRegistryState` (row data), `useRegistryActions` (add/remove/update row), `useRegistryFocus` (keyboard nav), `useSubmitRegistry` (triggers service) | SQL, file I/O, sales history            |
| **sales/repository**           | All SQL for sales and sale_items: INSERT with items, SELECT with filters, aggregation totals (excluding reported sales), report actions                | Business logic, UI state                |
| **sales/service**              | Builds query filters from UI params; maps raw DB rows to typed Sale objects; delegates export to CSV/XLSX services                                     | React state, focus management           |
| **sales/components**           | `SalesPage`, `SalesTable`, `SaleDialog` (detail view + admin actions), `ReportSaleDialog` (flag form), `SalesExportDialog`, `SalesOptions`             | DB access, export I/O                   |
| **sales/hooks**                | `useSales` — fetches filtered/paginated sales list, exposes report and delete callbacks                                                                | SQL queries, file I/O                   |
| **users/repository**           | SELECT/INSERT/UPDATE for the users table; credential lookup for login                                                                                  | Auth logic, session management          |
| **users/service**              | Validates credentials; returns user object on success; used by login flow                                                                              | React state, routing                    |
| **users/components**           | `UserMenu` (header dropdown), `UserSettings` (profile edit dialog)                                                                                     | Auth flow, routing                      |
| **store/userStore**            | Holds current user (id, name, role) in Zustand; persisted across navigation; cleared on logout                                                         | DB access, credential validation        |
| **store/themeStore**           | Holds light/dark preference in Zustand                                                                                                                 | UI rendering                            |
| **store/focusPreferenceStore** | Holds user's keyboard focus mode preference for the registry table                                                                                     | Business logic                          |
| **database/db**                | Opens the SQLite connection via `tauri-plugin-sql`; returns a singleton `Database` instance                                                            | Schema, migrations (handled by Rust)    |
| **lib/saveFile**               | Wraps Tauri `plugin-fs` + `plugin-dialog` to write a file to a user-chosen path                                                                        | Content generation (CSV/XLSX)           |
| **lib/date**                   | `date-fns` wrappers for formatting and parsing dates consistently across features                                                                      | Business logic                          |

---

## 3. Pages and Screens

| Page                | Route                   | Who can access                                             | Key components                                                          |
| ------------------- | ----------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| Login               | `/login`                | Public (unauthenticated)                                   | `Login.tsx` → `users/service`                                           |
| Sign Up             | `/signup`               | Public (first-run or admin invite)                         | `SignUp.tsx` → `users/service`                                          |
| Token               | `/token`                | Public (PIN entry step)                                    | `Token.tsx` → `userStore`                                               |
| Registry (new sale) | `/` or `/registry`      | Any logged-in user                                         | `RegistryPage`, `RegistryTable`, `Header`                               |
| Products            | `/products`             | Any logged-in user                                         | `ProductsPage`, `ProductsTable`, `ProductDialog`, import/export dialogs |
| Sales History       | `/sales`                | Any logged-in user                                         | `SalesPage`, `SalesTable`, `SalesOptions`, `SalesExportDialog`          |
| Sale Detail         | `/sales` (modal/dialog) | Cashier: view + flag. Admin: view + cancel report + delete | `SaleDialog`, `ReportSaleDialog`                                        |

> Route definitions live in `src/app/Router.tsx`. Protected routes check `userStore` for an authenticated user and redirect to `/login` if absent.

---

## 4. Roles and Permissions

**Cashier (any logged-in non-admin user)**
- Register new sales via the Registry page
- View sales history (read-only)
- Flag a sale as anomalous (opens `ReportSaleDialog`; reason ≥ 20 chars required)
- View and manage Products (CRUD + import/export)

**Admin**
- All cashier permissions
- In `SaleDialog`: cancel a report on a flagged sale
- In `SaleDialog`: permanently delete a sale
- Access `UserSettings` to manage user profile

> Role is stored in `userStore.role`. UI components check this value to conditionally render admin-only actions. There is no server-side enforcement — this is a trusted local app.

---

## 5. Main Flows

### 5.1 Register a Sale (happy path — keyboard-driven)

```
User types product code in CodeRow
  → onKeyDown (Enter/Tab)
    → useRegistryActions.lookupByCode(code)
      → products.service.findByCode(code)
        → products.repository.getByCode(code)   [SQL: SELECT * FROM products WHERE code = ?]
          → returns Product
      → if product already in rows → increment quantity (duplicate detection)
      → if new → append row, auto-focus next CodeRow

User presses Enter on empty row
  → useSubmitRegistry.submit()
    → registry.service.buildSalePayload(rows)   [maps rows → { items[], total }]
      → sales.repository.insertSale(payload)
        → BEGIN TRANSACTION
          INSERT INTO sales (total, created_at)
          INSERT INTO sale_items (sale_id, product_id, quantity, unit_price) × N
          COMMIT
        → returns sale_id
    → clears registry rows, resets focus to first CodeRow
```

### 5.2 Autocomplete Product Lookup (name field)

```
User types in NameRow input (≥1 char)
  → useRegistryActions.searchByName(query)
    → products.service.search(query)
      → products.repository.search(query)   [SQL: SELECT * FROM products WHERE name LIKE ?]
        → returns Product[]
    → renders Combobox dropdown with results
User clicks or presses Enter on a result
  → same duplicate-detection + row-fill logic as 5.1
```

### 5.3 Flag a Sale as Anomalous (cashier)

```
User opens SaleDialog (clicks a sale row)
  → SaleDialog renders sale detail + "Report" button (visible to all roles)
User clicks "Report"
  → ReportSaleDialog opens
    → User enters reason (min 20 chars, validated by Zod on submit)
      → sales.service.reportSale(saleId, reason)
        → sales.repository.insertReport(saleId, reason)
          [SQL: INSERT INTO sale_reports (sale_id, reason, reported_at) VALUES (?, ?, ?)]
        → returns void
    → dialog closes, sales list refreshes
    → totals re-query (SELECT excludes reported sale_ids via LEFT JOIN + WHERE sr.id IS NULL)
```

### 5.4 Admin: Cancel Report or Delete Sale

```
Admin opens SaleDialog on a reported sale
  → SaleDialog renders admin-only action buttons: "Cancel Report" | "Delete Sale"

Cancel Report:
  → sales.service.cancelReport(saleId)
    → sales.repository.deleteReport(saleId)
      [SQL: DELETE FROM sale_reports WHERE sale_id = ?]
    → sale no longer flagged; totals re-include it

Delete Sale:
  → sales.service.deleteSale(saleId)
    → sales.repository.deleteSale(saleId)
      [SQL: DELETE FROM sales WHERE id = ?]   (cascade deletes sale_items + sale_reports)
    → sale removed from history entirely
```

### 5.5 Import Products from CSV/XLSX

```
User clicks "Import" in ProductsOptions
  → ProductImportDialog opens, user selects file (Tauri dialog plugin)
    → products.service.importFile(filePath)
      → parseProductsFile(filePath)
        [PapaParse for .csv | SheetJS for .xlsx]
        → returns { valid: Product[], skipped: number }
      → products.repository.bulkInsert(valid)
        [SQL: INSERT OR REPLACE INTO products (...) VALUES ...]
      → returns { inserted: number, skipped: number }
    → dialog shows result summary (e.g. "42 imported, 3 skipped")
```

### 5.6 Login Flow

```
User enters credentials on Login page
  → users.service.authenticate(username, password)
    → users.repository.findByUsername(username)
      [SQL: SELECT * FROM users WHERE username = ?]
    → validates credential (PIN/token match — see Open Assumptions in architecture.md)
    → returns User | null
  → on success: userStore.setUser(user), navigate to /registry
  → on failure: inline error shown, no redirect
```

---

## 6. Data Model

**products**
- `id` INTEGER PK AUTOINCREMENT
- `code` TEXT UNIQUE — product barcode / internal code
- `name` TEXT NOT NULL
- `price` REAL NOT NULL
- `active` INTEGER (0/1) — soft-disable without deletion
- Relationships: referenced by `sale_items.product_id`

**sales**
- `id` INTEGER PK AUTOINCREMENT
- `total` REAL NOT NULL — sum of (quantity × unit_price) at time of sale
- `created_at` TEXT — ISO 8601 timestamp
- Relationships: has many `sale_items`; may have one `sale_reports`

**sale_items**
- `id` INTEGER PK AUTOINCREMENT
- `sale_id` INTEGER FK → `sales.id` ON DELETE CASCADE
- `product_id` INTEGER FK → `products.id`
- `quantity` INTEGER NOT NULL
- `unit_price` REAL NOT NULL — snapshotted at sale time (decoupled from product price changes)

**users**
- `id` INTEGER PK AUTOINCREMENT
- `username` TEXT UNIQUE NOT NULL
- `credential` TEXT NOT NULL — PIN or token (exact format: see Open Assumptions)
- `role` TEXT — `'admin'` | `'cashier'`
- `created_at` TEXT

**sale_reports**
- `id` INTEGER PK AUTOINCREMENT
- `sale_id` INTEGER UNIQUE FK → `sales.id` ON DELETE CASCADE — one report per sale
- `reason` TEXT NOT NULL — minimum 20 chars enforced at application layer
- `reported_at` TEXT — ISO 8601 timestamp

**Key query: totals excluding reported sales**
```sql
SELECT COALESCE(SUM(s.total), 0) AS total
FROM sales s
LEFT JOIN sale_reports sr ON sr.sale_id = s.id
WHERE sr.id IS NULL
  AND s.created_at BETWEEN ? AND ?
```

---

## 7. Contracts and Public Interfaces

This app has no HTTP API. All "contracts" are TypeScript function signatures between layers. These are the critical boundaries each developer must not break.

### Repository layer contracts (called by service layer only)

```typescript
// products.repository.ts
getAll(): Promise<Product[]>
getByCode(code: string): Promise<Product | null>
search(query: string): Promise<Product[]>           // LIKE %query%
insert(data: NewProduct): Promise<number>            // returns new id
update(id: number, data: Partial<NewProduct>): Promise<void>
remove(id: number): Promise<void>
bulkInsert(products: NewProduct[]): Promise<number>  // returns inserted count

// sales.repository.ts
insertSale(payload: NewSalePayload): Promise<number> // transactional; returns sale_id
getAll(filters: SaleFilters): Promise<Sale[]>
getTotals(filters: SaleFilters): Promise<SaleTotals> // excludes reported
insertReport(saleId: number, reason: string): Promise<void>
deleteReport(saleId: number): Promise<void>
deleteSale(saleId: number): Promise<void>

// users.repository.ts
findByUsername(username: string): Promise<User | null>
insert(data: NewUser): Promise<number>
update(id: number, data: Partial<User>): Promise<void>
```

### Service layer contracts (called by hooks only)

```typescript
// products.service.ts
getProducts(): Promise<Product[]>
createProduct(data: NewProduct): Promise<void>
updateProduct(id: number, data: Partial<NewProduct>): Promise<void>
deleteProduct(id: number): Promise<void>
importFile(path: string): Promise<{ inserted: number; skipped: number }>
exportCsv(products: Product[]): Promise<void>    // writes file via lib/saveFile
exportExcel(products: Product[]): Promise<void>

// registry.service.ts
buildSalePayload(rows: RegistryRow[]): NewSalePayload
submitSale(rows: RegistryRow[]): Promise<number>  // returns sale_id

// sales.service.ts
getSales(filters: SaleFilters): Promise<Sale[]>
getSaleTotals(filters: SaleFilters): Promise<SaleTotals>
reportSale(saleId: number, reason: string): Promise<void>
cancelReport(saleId: number): Promise<void>
deleteSale(saleId: number): Promise<void>
exportCsv(sales: Sale[]): Promise<void>
exportExcel(sales: Sale[]): Promise<void>

// users.service.ts
authenticate(username: string, credential: string): Promise<User | null>
createUser(data: NewUser): Promise<void>
updateUser(id: number, data: Partial<User>): Promise<void>
```

### Key domain types

```typescript
type Product = {
  id: number; code: string; name: string; price: number; active: boolean
}

type Sale = {
  id: number; total: number; createdAt: string;
  items: SaleItem[]; report: SaleReport | null
}

type SaleFilters = {
  from?: string; to?: string; reportedOnly?: boolean; page: number; pageSize: number
}

type SaleTotals = { total: number; count: number }  // reported sales excluded

type User = { id: number; username: string; role: 'admin' | 'cashier' }
```

---

## 8. Repository Structure

```
app-pos/
├── src/
│   ├── app/                        # App shell, router, global CSS
│   │   ├── App.tsx
│   │   ├── Router.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   │
│   ├── features/
│   │   ├── products/
│   │   │   ├── components/
│   │   │   │   ├── table/
│   │   │   │   │   ├── cells/      # ActionsRow, StateRow
│   │   │   │   │   ├── hooks/      # useProductsTable
│   │   │   │   │   └── products-columns.tsx
│   │   │   │   ├── ProductDialog.tsx
│   │   │   │   ├── ProductImportDialog.tsx
│   │   │   │   ├── ProductExportDialog.tsx
│   │   │   │   ├── ProductsOptions.tsx
│   │   │   │   ├── ProductsPage.tsx
│   │   │   │   └── ProductsTable.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useProducts.ts
│   │   │   ├── repository/
│   │   │   │   └── products.repository.ts
│   │   │   ├── service/
│   │   │   │   ├── products.service.ts
│   │   │   │   ├── exportProductsCsv.ts
│   │   │   │   ├── exportProductsExcel.ts
│   │   │   │   └── parseProductsFile.ts
│   │   │   ├── types/
│   │   │   │   └── products.types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── registry/
│   │   │   ├── components/
│   │   │   │   ├── table/
│   │   │   │   │   ├── cells/      # CheckRow, CodeRow, NameRow, QuantityRow
│   │   │   │   │   ├── hooks/      # useFocusableCell, useRegistryTable
│   │   │   │   │   └── registry-columns.tsx
│   │   │   │   ├── RegistryOptions.tsx
│   │   │   │   ├── RegistryPage.tsx
│   │   │   │   └── RegistryTable.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useRegistryActions.ts   # add/remove/update rows, lookup
│   │   │   │   ├── useRegistryFocus.ts     # keyboard nav between cells
│   │   │   │   ├── useRegistryState.ts     # row array state
│   │   │   │   └── useSubmitRegistry.ts    # triggers service.submitSale
│   │   │   ├── service/
│   │   │   │   └── registry.service.ts
│   │   │   ├── types/
│   │   │   │   ├── registry.types.ts
│   │   │   │   ├── focus.types.ts
│   │   │   │   ├── submit.types.ts
│   │   │   │   └── constants.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── sales/
│   │   │   ├── components/
│   │   │   │   ├── table/
│   │   │   │   │   ├── DayRow.tsx
│   │   │   │   │   └── sales-columns.tsx
│   │   │   │   ├── ReportSaleDialog.tsx
│   │   │   │   ├── SaleDialog.tsx
│   │   │   │   ├── SalesExportDialog.tsx
│   │   │   │   ├── SalesOptions.tsx
│   │   │   │   ├── SalesPage.tsx
│   │   │   │   └── SalesTable.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useSales.ts
│   │   │   ├── repository/
│   │   │   │   └── sales.repository.ts
│   │   │   ├── service/
│   │   │   │   ├── sales.service.ts
│   │   │   │   ├── exportSalesCsv.ts
│   │   │   │   └── exportSalesExcel.ts
│   │   │   ├── types/
│   │   │   │   └── sales.types.ts
│   │   │   └── index.ts
│   │   │
│   │   └── users/
│   │       ├── components/
│   │       │   ├── UserMenu.tsx
│   │       │   └── UserSettings.tsx
│   │       ├── repository/
│   │       │   └── users.repository.ts
│   │       ├── service/
│   │       │   └── users.service.ts
│   │       └── types/
│   │           ├── users.types.ts
│   │           └── userSchema.ts      # Zod schema for login/signup validation
│   │
│   ├── components/                    # Shared UI (used by 2+ features)
│   │   ├── ui/                        # shadcn/ui generated components — do not edit manually
│   │   ├── table/
│   │   │   └── CheckRow.tsx
│   │   ├── Header.tsx
│   │   └── PaginationTable.tsx
│   │
│   ├── pages/                         # Route-level thin wrappers
│   │   ├── Products.tsx
│   │   ├── Registry.tsx
│   │   ├── Sales.tsx
│   │   └── login/
│   │       ├── Login.tsx
│   │       ├── SignUp.tsx
│   │       └── Token.tsx
│   │
│   ├── store/
│   │   ├── userStore.ts
│   │   ├── themeStore.ts
│   │   └── focusPreferenceStore.ts
│   │
│   ├── hooks/
│   │   └── usePagination.ts
│   │
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── date.ts
│   │   └── saveFile.ts
│   │
│   ├── database/
│   │   ├── db.ts
│   │   └── index.ts
│   │
│   ├── constants/
│   │   └── config.ts
│   │
│   └── types/
│       └── react-table.d.ts
│
├── src-tauri/
│   ├── src/
│   │   ├── main.rs
│   │   ├── lib.rs
│   │   ├── migrations.rs
│   │   └── migrations/
│   │       ├── 001_create_products.sql
│   │       ├── 002_create_sales.sql
│   │       ├── 003_create_sale_items.sql
│   │       ├── 004_create_users.sql
│   │       └── 005_create_sale_reports.sql
│   ├── capabilities/
│   ├── icons/
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── docs/
│   ├── concept.md
│   ├── architecture.md
│   ├── design.md                      # this file
│   └── adr/
│       ├── adr-001-tauri-over-electron.md
│       ├── adr-002-sqlite.md
│       └── adr-003-feature-based-structure.md
│
├── assets/                            # Screenshots for README
├── index.html
├── vite.config.ts
├── package.json
├── components.json                    # shadcn/ui config
├── tsconfig.app.json
└── README.md
```

---

## 9. Error Handling

There is no HTTP layer. Errors propagate through three boundaries:

**Repository → Service**
Repository functions `throw` on any SQLite error (the plugin rejects the promise). Service functions catch, add context, and re-throw:
```typescript
// Pattern used in all service files
try {
  return await productsRepository.insert(data)
} catch (err) {
  throw new Error(`products.service.createProduct failed: ${err}`)
}
```

**Service → Hook**
Hooks catch at their boundary and set local error state for UI display. They do not re-throw.
```typescript
const [error, setError] = useState<string | null>(null)
try {
  await productsService.createProduct(data)
} catch (err) {
  setError('Could not save product. Please try again.')
}
```

**Validation (Zod — before any service call)**
Form inputs are validated by Zod schemas in `types/` before submission. Errors are surfaced inline via React Hook Form field errors. A service call is never made with invalid input.

**Import parse errors**
`parseProductsFile` returns `{ valid: Product[], skipped: number }` — it never throws on malformed rows. The caller (service) decides what to do with the skipped count.

**No global error boundary** is currently defined. Runtime errors that escape hook boundaries will crash the component subtree silently. This is a known gap — see Open Assumptions in `architecture.md`.

---

## Notes

- `registry` has no `repository/` folder — it delegates persistence to `sales.repository`. This is intentional: the registry is a UI concept (a staging area), not a data entity.
- `components/ui/` is generated by the shadcn CLI and must not be hand-edited. Customizations go into wrapper components in `components/` or feature-level components.
- The `vite.config.ts` splits the bundle into `vendor-react` and `ui-components` chunks. This is a build optimization only — it has no impact on module boundaries at dev time.
- `@/` is aliased to `src/` via Vite config. All imports within `src/` should use `@/` rather than relative paths beyond one level.
- The `registry` feature has significantly more hooks than others. If it grows further, consider a `registry/hooks/focus/` sub-folder to separate focus-management hooks from action hooks.