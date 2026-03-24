# Restaurant App POS

![Tauri](https://img.shields.io/badge/Tauri-2.x-blue)
![Bun](https://img.shields.io/badge/Bun-runtime-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)

[English](./README.md)

**Aplicación POS de escritorio** para restaurante: inventario/registro + control de ventas, hecha con **React + Vite** y empaquetada como app con **Tauri** (SQLite).

## Capturas

<img src="./assets/img-1.png" alt="img-1">
<img src="./assets/img-2.png" alt="img-2">
<img src="./assets/img-3.png" alt="img-3">
<img src="./assets/img-4.png" alt="img-4">

## Funcionalidades

- Gestión de **registro / inventario**
- CRUD de **productos** + importación/exportación (CSV/XLSX)
- Seguimiento de **ventas** y filtros
- **Reportes de ventas** para usuarios no logeados (ícono bandera + motivo, mínimo 20 caracteres)
- **Acciones admin** en detalle de venta: anular reporte o eliminar venta
- El **total de ventas excluye ventas reportadas** en el resumen principal
- **Base de datos local** con SQLite (Tauri SQL plugin)

## UX del Registro

- **Búsqueda autocompletada** — al escribir en el campo nombre se muestran productos coincidentes; clic o Enter para seleccionar
- **Búsqueda por código** — ingresa un código de producto y presiona Enter/Tab para llenar la fila automáticamente
- **Detección de duplicados** — si el producto ya existe en la tabla, se incrementa su cantidad en vez de duplicarlo
- **Envío rápido** — presiona Enter en una fila vacía para enviar la venta (funciona desde código y nombre)
- **Auto-focus** — al confirmar un producto se crea y enfoca una nueva fila vacía automáticamente

## Stack

- **Frontend**
  - React + TypeScript
  - Vite
  - Tailwind CSS
  - shadcn/ui (Radix)
- **Desktop**
  - Tauri (Rust)
  - SQLite vía `tauri-plugin-sql`

## Estructura del proyecto

```txt
src/
  app/            App base + router
  components/     Componentes compartidos (Header, ui/*)
  constants/      Configuración de la app (p.ej links a GitHub)
  database/       Helpers / inicialización de DB
  features/       Módulos por dominio (products, registry, sales, users)
  pages/          Páginas por ruta (Products, Registry, Sales, login/*)
  store/          Stores globales (userStore)
src-tauri/        Backend/packaging de Tauri (Rust)
assets/           Capturas
```

## Requisitos

- Bun
- Toolchain de Rust (para builds de Tauri)
- OS soportado por Tauri (Windows/macOS/Linux)

## Inicio rápido (Desktop)

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

## Base de datos (SQLite)

Esta app usa SQLite a través de Tauri.

Adiciones recientes del esquema incluyen `sale_reports` para persistir:

- `sale_id` (único por venta)
- `reason`
- `reported_at` (timestamp)

Si necesitas agregar el plugin de SQL (en este repo ya está incluido):

```sh
cd ./src-tauri/
cargo add tauri-plugin-sql --features sqlite
```

## Créditos / Código fuente

Dentro de la app, en la pantalla de Login se muestran links a:

- Repo
- Perfil de GitHub

Se configuran en `src/constants/config.ts`.

## Notas de setup (cómo se creó este proyecto)

Esto es una referencia de los pasos/paquetes usados al crear el proyecto.

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
