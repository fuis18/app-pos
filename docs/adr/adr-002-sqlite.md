# ADR-002: Use SQLite as the Local Database

## Status
Accepted

## Context
The app is fully offline and single-user. It needs to persist products, sales, sale items, users, and sale reports across sessions. There is no server, no network, and no requirement for concurrent access from multiple machines. Data must survive app restarts and must be queryable with filtering and aggregation (e.g., totals excluding reported sales).

## Decision
Use SQLite via `tauri-plugin-sql`. The schema is versioned through numbered SQL migration files (`001_*.sql` → `005_*.sql`) loaded at startup by `migrations.rs`.

## Alternatives Considered

| Option | Why it was discarded |
|---|---|
| **localStorage / IndexedDB** | No SQL query support; aggregations and joins would have to be done in JavaScript. Not suitable for relational data with foreign keys. |
| **PGlite (Postgres in WASM)** | Interesting option but adds WASM bundle size and complexity for a use case SQLite handles trivially. |
| **JSON files on disk** | No transactions, no queries, no referential integrity. Would require loading entire dataset into memory for every operation. |
| **PostgreSQL / MySQL** | Requires a running server process. Incompatible with the "no setup, just run the installer" constraint. |

## Consequences

**Positive**
- Zero-setup: the SQLite file is created automatically by Tauri on first run
- Full SQL support: JOINs, aggregations, and WHERE clauses work as expected
- Migration system provides a safe, versioned schema evolution path
- The `.db` file is portable — users can copy it for backups manually

**Negative / Trade-offs**
- No migration rollback: if a migration ships with a bug, there is no automated recovery
- `tauri-plugin-sql` wraps SQLite through Tauri's IPC bridge — every query is async and crosses the Rust/JS boundary, adding a small latency overhead
- No GUI tooling integrated — developers must use an external SQLite viewer (e.g., DB Browser) to inspect data during development

**Neutral / To Monitor**
- Confirm `tauri-plugin-sql` supports explicit transactions for the `INSERT INTO sales` + `INSERT INTO sale_items` multi-step write
- Consider adding a "backup DB" button in admin settings if data portability becomes a user request

## Impact on Architecture
- Technology Stack (section 2): database engine and access method
- Technical Risks (section 12): migration versioning with no rollback
- Open Assumptions (section 13): sale hard delete vs soft delete affects query design

## Date
2026-03-25
