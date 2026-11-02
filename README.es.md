# App POS

![Tauri](https://img.shields.io/badge/Tauri-2.x-blue)
![pnpm](https://img.shields.io/badge/pnpm-12.x-f69220)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)

[English](./README.md)

**Aplicación POS de escritorio** para restaurante: inventario/registro + control de ventas, hecha con **React + Vite** y empaquetada como app con **Tauri** (SQLite).

## Video

https://github.com/user-attachments/assets/fd2cc6ef-93e7-41e5-ad91-8fbb90d41433

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

- pnpm
- Toolchain de Rust (para builds de Tauri)
- OS soportado por Tauri (Windows/macOS/Linux)

## Inicio rápido (Desktop)

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
pnpm create vite restaurant-pos
cd ./restaurant-pos

pnpm add -D esbuild standard --save-exact
pnpm add -D tailwindcss @tailwindcss/vite --save-exact
pnpm add -D shadcn-ui --save-exact

pnpm add react-hook-form zod --save-exact
pnpm add react-router-dom --save-exact
pnpm add @tauri-apps/plugin-sql --save-exact
pnpm add papaparse @types/papaparse --save-exact
```

```sh
pnpm add -D @types/node

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
