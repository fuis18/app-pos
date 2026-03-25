# Architecture: Restaurant POS

## 1. Context

Desktop POS app for a single restaurant. Cashiers register sales; admins manage products and act on flagged anomalies. All data is local — no server, no auth service, no network dependency. The main constraints are: fully offline, Windows-first, keyboard-driven UX, and a lean stack the solo developer already knows.

## 1.5 Concept Assumptions That Changed

| Assumption from concept                 | What changed                                                  | Why                                                                   | Impact on architecture                                                                |
| --------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| "Admin vs Cashier is not session-based" | A `users` table and a login/signup flow exist in the codebase | The app does use persisted user records to distinguish the admin role | The `users` feature and `userStore` are load-bearing; role checks gate admin UI paths |
| "No authentication"                     | There is a Login, SignUp, and Token page                      | Likely a PIN/token flow rather than a password hash                   | Auth state lives in `userStore`; login pages are real routes, not just a UI toggle    |
| Export scope was unclear                | Sales also have export (CSV/XLSX)                             | Discovered from `SalesExportDialog` and service files                 | Export logic is duplicated across features; both need their own service layer         |

If this section is empty: Either the concept was perfect, or you haven't validated assumptions yet. Neither happens often.

---

## 2. Technology Stack

### Frontend

- **Framework:** React 18 + TypeScript 5
- **Build tool:** Vite
- **Styling:** Tailwind CSS + shadcn/ui (Radix primitives)
- **Routing:** React Router DOM
- **Forms:** React Hook Form + Zod
- **Tables:** TanStack Table (inferred from column/hook patterns)
- **File parsing:** PapaParse (CSV), SheetJS/xlsx (XLSX)

### Desktop

- **Runtime:** Tauri 2.x (Rust)
- **Package manager / runtime:** Bun
- **DB access from frontend:** `@tauri-apps/plugin-sql`

### Database

- **Type:** Relational
- **Engine:** SQLite (embedded, managed by Tauri SQL plugin)
- **Migrations:** SQL files loaded via `migrations.rs` at app startup

### Infrastructure

- **Hosting:** Local machine only (no cloud)
- **Containers:** None
- **CI/CD:** None defined

### Tools

- **Linting:** ESLint (standard config)
- **Type checking:** `tsc` (via `bun run build`)
- **Testing:** Not yet defined — see Open Assumptions
- **Observability:** None (local app)

---

## 3. Technical Objectives

- [ ] All reads and writes go through SQLite — no in-memory state is the source of truth for persisted data
- [ ] Each feature (`products`, `registry`, `sales`, `users`) is self-contained: its own components, hooks, service, repository, and types
- [ ] The Tauri layer (Rust) is kept minimal: app bootstrap, plugin registration, migration runner — no custom commands unless the plugin can't handle it
- [ ] Product lookup (autocomplete + code) completes a round-trip to SQLite and renders results in under 200ms on target hardware
- [ ] Reported sales are excluded from totals at the query layer, not filtered in the UI

---

## 4. Design Principles

- **Feature isolation**: cross-feature imports are a code smell; shared code lives in `components/`, `hooks/`, or `lib/`
- **Thin Rust layer**: business logic stays in TypeScript; Rust does only what the web layer can't (file system, native packaging, plugin bridge)
- **Repository pattern**: all SQL lives in `*.repository.ts` files — no raw queries in components or hooks
- **Service as orchestrator**: `*.service.ts` composes repository calls and maps data; it knows nothing about React
- **Keyboard-first UX**: every interactive flow must be completable without a mouse; focus management is a first-class concern

---

## 5. Architectural Style

**Pattern:** Feature-based layered architecture

Each domain (`products`, `registry`, `sales`, `users`) owns a vertical slice:

```
features/<domain>/
  components/   ← React UI, knows about hooks
  hooks/        ← React state + side effects, calls service
  service/      ← pure logic + orchestration, calls repository
  repository/   ← all SQL queries via tauri-plugin-sql
  types/        ← domain types and Zod schemas
```

Shared primitives (Header, table utilities, pagination, shadcn wrappers) live in `components/` and `hooks/` at the root of `src/`. Global state (current user, theme, focus preference) lives in `store/`.

**Brief Justification:** The team is one developer. Feature-based slicing keeps each domain independently navigable without requiring understanding of the whole codebase. It's not Clean Architecture (too much ceremony for this scope) and not a flat structure (too hard to navigate past 4 features). This is the simplest thing that keeps concerns separated.

> See [`docs/design.md`](./design.md) → **Section 1** for the folder/file convention this pattern enforces.

---

> See [`docs/design.md`](./design.md) for modules, roles, flows, data model, contracts, and repository structure.

---

## 6. Error Handling

There is no network layer, so there are no HTTP error codes. Errors fall into two categories:

**SQLite errors** (via tauri-plugin-sql):
- Repository functions `throw` on failure; services catch and re-throw with context
- UI hooks catch at the boundary and set local error state for display
- No global error boundary is defined yet — see Open Assumptions

**Validation errors:**
- Zod schemas validate form input before any DB call
- Errors are surfaced inline via React Hook Form field errors

**Import errors (CSV/XLSX):**
- `parseProductsFile.ts` returns a result object, not a throw — invalid rows are collected and reported to the user after parse

---

## 7. Environment Variables and Configuration

This is a local desktop app with no `.env` file. Runtime configuration lives in:

| Location                    | Purpose                                                                  |
| --------------------------- | ------------------------------------------------------------------------ |
| `src/constants/config.ts`   | App-level constants (GitHub links, repo URL shown on Login)              |
| `src-tauri/tauri.conf.json` | App identifier, window config, bundle settings                           |
| `src-tauri/Cargo.toml`      | Rust dependencies and feature flags (e.g., `sqlite` on tauri-plugin-sql) |

No secrets. No environment switching. No `.env` needed.

---

## 8. Observability

None at this time. This is a single-user local app.

If errors need to be surfaced post-release, options are:
- Tauri's `log` plugin writing to a local file
- A simple in-app error log panel

> Mark as Open Assumption until user feedback indicates this is needed.

---

## 9. Security

- **Authentication:** A token/PIN-based login flow exists (`Login.tsx`, `SignUp.tsx`, `Token.tsx`). The mechanism is not fully defined — see Open Assumptions.
- **Authorization:** Role distinction (admin vs cashier) is enforced at the UI level via `userStore`. No backend enforcement exists because there is no backend.
- **Data:** All data is local to the machine. No encryption at rest is configured.
- **No network surface:** The app makes no outbound requests. There is no CORS, no API keys, no rate limiting to configure.

---

## 10. Testing Strategy

- **Unit tests:** Service and repository functions (pure logic, DB query construction) — not yet implemented
- **Integration tests:** Repository layer against a real in-memory SQLite instance — not yet implemented
- **Component tests:** Focus management hooks (`useFocusableCell`, `useRegistryFocus`) and autocomplete logic are candidates
- **E2E:** Tauri supports WebDriver-based E2E; not yet configured
- **Contract tests:** Not applicable (no external API)

> See Open Assumptions — testing tooling is not yet decided.

---

## 11. Related ADRs

- [ADR-001: Use Tauri instead of Electron](./adr/adr-001-tauri-over-electron.md)
- [ADR-002: Use SQLite as the local database](./adr/adr-002-sqlite.md)
- [ADR-003: Feature-based folder structure](./adr/adr-003-feature-based-structure.md)

---

## 12. Technical Risks

- [ ] **No test coverage**: the focus management system (`registry` feature) is complex and stateful — regressions are invisible without tests
- [ ] **Migration versioning**: SQLite migrations run at startup via `migrations.rs`; there is no rollback mechanism if a migration is shipped broken
- [ ] **Role enforcement is UI-only**: a user who edits `userStore` state in devtools can access admin actions — acceptable for a trusted local app, but worth noting
- [ ] **Import robustness**: CSV/XLSX files from external sources may have unexpected encodings or column layouts; `parseProductsFile.ts` needs defensive handling
- [ ] **Tauri plugin-sql API surface**: `tauri-plugin-sql` is the sole bridge for all DB access; if it has limitations (e.g., no transaction support), the repository layer will need workarounds

---

## 13. Open Assumptions

- [ ] **Auth mechanism**: is the token flow a PIN stored in the `users` table, or a hashed password, or a one-time setup token? This affects `users.repository.ts` design.
- [ ] **Test tooling**: Vitest is the natural choice with Vite, but nothing is configured. Decision needed before any feature is considered "done."
- [ ] **Admin role source of truth**: is there a single admin (seeded on first run), or can multiple admins exist? Affects `SignUp.tsx` flow.
- [ ] **Sale deletion vs soft delete**: `delete sale` in admin actions — is this a hard `DELETE FROM sales` or a soft delete flag? Affects reporting queries.
- [ ] **Backup / data portability**: no mechanism exists to export or back up the SQLite file. Is this in scope?

---

## 14. Technical Acceptance Criteria

- [ ] A sale with 5 line items can be registered from first keystroke to DB commit in under 30 seconds using only the keyboard
- [ ] Reported sales do not appear in the totals shown on the Sales summary — verified by inserting a report record and checking the aggregation query
- [ ] Importing a 100-row CSV creates all valid products and surfaces a count of skipped rows — no silent data loss
- [ ] App launches and reaches the Login screen in under 3 seconds on the target machine
- [ ] Running `bun tauri dev` from a clean clone (after `bun install`) starts the app without manual DB setup