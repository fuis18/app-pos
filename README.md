# App POS

![Tauri](https://img.shields.io/badge/Tauri-2.x-blue)
![Bun](https://img.shields.io/badge/Bun-runtime-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)

[Español](./README.es.md)

**Desktop POS app** for a restaurant: inventory/registry + sales tracking, built with **React + Vite** and packaged as a **Tauri** app (SQLite).

## Video

<video controls>
	<source src="./assets/vid-1.mp4" type="video/mp4" />
</video>

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

- Bun
- Rust toolchain (for Tauri builds)
- OS supported by Tauri (Windows/macOS/Linux)

## Quick Start (Desktop)

```sh
bun install
bun tauri dev
```

## Scripts

```sh
# web dev
bun dev

# typecheck + web build
bun run build

# desktop dev
bun tauri dev
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
bun create vite restaurant-pos
cd ./restaurant-pos

bun add -D esbuild standard -E
bun add -D tailwindcss @tailwindcss/vite -E
bun add -D shadcn-ui -E

bun add @tanstack/react-form -E
bun add react-hook-form zod -E
bun add react-router-dom -E
bun add @tauri-apps/plugin-sql -E
bun add papaparse @types/papaparse -E
```

```sh
bun add -D @types/node

bunx shadcn init
bunx --bun shadcn@latest add form input button checkbox
bunx --bun shadcn@latest add table pagination
bunx --bun shadcn@latest add dialog button-group
bunx --bun shadcn@latest add popover dropdown-menu
bunx --bun shadcn@latest add combobox calendar
```

```sh
bun add -D @tauri-apps/cli@latest
bun add @tauri-apps/api

bun tauri init
```
