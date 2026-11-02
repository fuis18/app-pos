# App POS

![Tauri](https://img.shields.io/badge/Tauri-2.x-blue)
![pnpm](https://img.shields.io/badge/pnpm-12.x-f69220)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)

[Español](./README.es.md)

**Desktop POS app** for a restaurant: inventory/registry + sales tracking, built with **React + Vite** and packaged as a **Tauri** app (SQLite).

## Video

https://github.com/user-attachments/assets/fd2cc6ef-93e7-41e5-ad91-8fbb90d41433

## Features

- **Registry / inventory** management
- **Products** CRUD + import/export (CSV/XLSX)
- **Sales** tracking and filtering
- **Sales reports** by non-logged users (flag icon + reason, min 20 chars)
- **Admin report actions** in sale detail: cancel report or delete sale
- **Totals exclude reported sales** from the main Sales summary
- **Local database** via SQLite (Tauri SQL plugin)

## UX Highlights

- **Autocomplete search** — typing in the name field shows matching products in a dropdown; click or press Enter to select
- **Code lookup** — enter a product code and press Enter/Tab to fill the row automatically
- **Duplicate detection** — selecting an already-added product increments its quantity instead of creating a duplicate row
- **Quick submit** — press Enter on an empty row to submit the sale (works from both code and name fields)
- **Auto-focus** — after confirming a product, a new empty row is created and focused automatically

## Tech Stack

- **Frontend**
	- React + TypeScript
	- Vite
	- Tailwind CSS
	- shadcn/ui (Radix)
- **Desktop**
	- Tauri (Rust)
	- SQLite via `tauri-plugin-sql`

## Project Structure

```text
src/
	app/            App shell + router entry
	components/     Shared components (Header, ui/*)
	constants/      App-level configuration (e.g. GitHub links)
	database/       DB helpers / initialization
	features/       Domain modules (products, registry, sales, users)
	pages/          Route-level pages (Products, Registry, Sales, login/*)
	store/          Global stores (userStore)
src-tauri/        Tauri (Rust) backend + app packaging
assets/           Screenshots
```

## Requirements

- pnpm
- Rust toolchain (for Tauri builds)
- OS supported by Tauri (Windows/macOS/Linux)

## Quick Start (Desktop)

```sh
pnpm install
pnpm exec tauri dev
```

## Scripts

```sh
# web dev
pnpm dev

# typecheck + web build
pnpm run build

# desktop dev
pnpm exec tauri dev
```

## Database (SQLite)

This app uses SQLite through Tauri.

Recent schema additions include `sale_reports` to persist:

- `sale_id` (unique per sale)
- `reason`
- `reported_at` timestamp

If you need to add the SQL plugin (already included in this repo):

```sh
cd ./src-tauri/
cargo add tauri-plugin-sql --features sqlite
```

## Credits / Source

Inside the app, the Login screen shows links to:

- Repo
- GitHub profile

You can edit them in `src/constants/config.ts`.

## Setup notes (how this project was created)

The following is a reference of the steps/packages used when scaffolding the project.

```sh
pnpm create vite app-pos
cd ./app-pos

pnpm add -D tailwindcss @tailwindcss/vite --save-exact
pnpm add -D shadcn-ui --save-exact

pnpm add react-hook-form zod --save-exact
pnpm add react-router-dom --save-exact
pnpm add @tauri-apps/plugin-sql --save-exact
pnpm add papaparse @types/papaparse --save-exact
```

```sh
pnpm dlx shadcn init
pnpm dlx shadcn@latest add form input button checkbox
pnpm dlx shadcn@latest add table pagination
pnpm dlx shadcn@latest add dialog button-group
pnpm dlx shadcn@latest add popover dropdown-menu
pnpm dlx shadcn@latest add combobox calendar
```

```sh
pnpm add -D @tauri-apps/cli@latest
pnpm add @tauri-apps/api

pnpm exec tauri init
```
