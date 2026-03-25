# ADR-003: Feature-Based Folder Structure Over Flat or Layer-Based Structure

## Status
Accepted

## Context
The project has four domains: `products`, `registry` (sale registration), `sales` (history + reports), and `users`. Each domain has its own components, state, data access, and types. The developer is working alone. The structure must make it easy to find everything related to a feature in one place and to add or remove a feature without touching unrelated code.

## Decision
Organize `src/` by feature-first, with an internal layered structure inside each feature folder:

```
features/<domain>/
  components/
  hooks/
  service/
  repository/
  types/
```

Shared UI primitives go in `src/components/`. Cross-feature utilities go in `src/lib/`. Global reactive state goes in `src/store/`.

## Alternatives Considered

| Option | Why it was discarded |
|---|---|
| **Layer-based (all components together, all hooks together, etc.)** | Works for 1–2 features. At 4+ features with their own table columns, dialogs, and focus hooks, navigating `src/hooks/useRegistryFocus.ts` alongside `src/hooks/useSales.ts` becomes noisy and context-switching heavy. |
| **Flat structure** | No separation at all — everything in `src/`. Unworkable beyond a prototype. |
| **Clean Architecture (Entities / Use Cases / Adapters)** | Introduces interfaces, dependency injection, and inversion layers that add ceremony without payoff for a solo developer on a single-platform local app. |
| **Modular monorepo (packages/)** | Overkill — there's only one deployable target. The feature boundary here is a folder convention, not a package boundary. |

## Consequences

**Positive**
- Every file related to `sales` is under `features/sales/` — no cross-feature hunting
- Features can be added, modified, or deleted without touching sibling features
- The layer inside each feature (components → hooks → service → repository) enforces a natural dependency direction: UI depends on hooks, hooks depend on services, services depend on repositories
- New contributors can understand one feature without reading the whole codebase

**Negative / Trade-offs**
- Shared logic between features (e.g., a product selector used in both `registry` and `products`) requires a judgment call: duplicate it or promote it to `components/` — this boundary must be maintained consciously
- The `repository/` layer talks directly to `tauri-plugin-sql`; if the DB access mechanism changes, all four repository files need updating (acceptable given the stable plugin API)

**Neutral / To Monitor**
- The `registry` feature has significantly more hooks than others (`useRegistryActions`, `useRegistryFocus`, `useRegistryState`, `useSubmitRegistry`) — if it grows further, consider an internal sub-folder

## Impact on Architecture
- Architectural Style (section 5): defines the pattern
- Testing Strategy (section 10): unit tests live inside each feature folder alongside the files they test

## Date
2026-03-25
