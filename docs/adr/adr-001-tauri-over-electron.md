# ADR-001: Use Tauri Instead of Electron

## Status
Accepted

## Context
The app needs to be packaged as a native desktop binary on Windows. It requires local filesystem access (for SQLite) and must ship as a self-contained installer without Node.js on the target machine. The frontend is already React + Vite. The developer needs a desktop shell that integrates with that stack with minimal overhead.

## Decision
Use Tauri 2.x (Rust backend + WebView frontend) as the desktop runtime. The Rust layer is kept minimal: app bootstrap, plugin registration, and migration runner only. All business logic stays in TypeScript.

## Alternatives Considered

| Option                      | Why it was discarded                                                                                                                                                       |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Electron**                | Bundles a full Chromium + Node.js runtime — installer size is typically 80–150 MB vs Tauri's ~10 MB. Higher memory footprint is unnecessary for a single-window local app. |
| **NW.js**                   | Similar size/overhead to Electron. Less ecosystem momentum and fewer maintained plugins for SQLite.                                                                        |
| **Native (WinForms / WPF)** | Would require rewriting the entire frontend in a non-web stack. The developer's skills and existing code are React-based.                                                  |

## Consequences

**Positive**
- Installer is ~10 MB; no Chromium bundled — uses the OS WebView (WebView2 on Windows)
- Access to native OS APIs and filesystem through Tauri's plugin system
- `tauri-plugin-sql` provides a typed, async bridge to SQLite without custom Rust commands
- Rust compile-time safety for the thin backend layer

**Negative / Trade-offs**
- Requires a Rust toolchain installed on the developer's machine (build-time only, not runtime)
- WebView2 is the rendering engine on Windows — minor CSS/JS behavior differences vs Chrome are possible
- Tauri 2.x API surface changed significantly from v1; community examples may be outdated

**Neutral / To Monitor**
- `tauri-plugin-sql` transaction support — verify it covers the multi-table insert needed for `sales` + `sale_items` in a single atomic operation

## Impact on Architecture
- Technology Stack (section 2): defines the desktop runtime and DB access bridge
- Technical Risks (section 12): WebView2 rendering edge cases

## Date
2026-03-25