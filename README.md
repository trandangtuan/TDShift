# Record Platform

Record Platform is a TypeScript proof of concept for a record-driven business application framework inspired by Odoo.

The core idea is:

```text
Code
  -> Module Definition
  -> Metadata
  -> Database Records
  -> Runtime Registry
  -> Application
```

Models, fields, menus, actions, and views are represented as records in the database first. The web client does not hard-code business pages such as Sales Orders or Contacts. It renders menus, actions, list views, form views, and fields from runtime metadata.

## Current POC

Implemented modules:

- `base`: core metadata models, technical menus, model/field/view/action/menu definitions.
- `contacts`: `res.partner` model with list/form views.
- `sale`: `sale.order` model with generic CRUD and `confirm`/`cancel` methods.
- `sale_discount`: extends `sale.order` with discount fields and a form view extension.
- `website`: public website page records with admin page management and HTML rendering through Next.js.
- `website_sale`: public product catalog backed by the shared `product.product` model.

Implemented runtime:

- Fastify backend.
- SQLite dev database.
- Core user model with JWT login and token reset APIs.
- Runtime model registry.
- Generic record CRUD API.
- Dynamic menu/action/view APIs.
- React/Vite web client.
- Next.js public website with App Router, shared layout, dynamic slug pages, and SEO metadata.
- Generic list renderer.
- Generic form renderer.
- Generic field renderer.

## Requirements

- Node.js 22+
- npm 10+

## Install

```bash
npm install
```

## Run

Start backend and web together:

```bash
npm run dev
```

Or run them separately:

```bash
npm run server
npm run web
npm run site
```

When using `npm run dev`, public website requests are proxied through `http://localhost:3100`; Next.js itself listens internally on port `3101`.

After building, run only the backend. It serves both API and the built web app from one port:

```bash
npm run build
npm run start
```

### Docker multi-database mode

The default Docker Compose configuration uses PostgreSQL as one configured database. To use the database selector, creation, and deletion flow, create a `.env` file from `.env.example` and set:

```dotenv
DATABASE_CLIENT=sqlite
SQLITE_DATABASE_PATH=/app/storage/databases/record-platform.sqlite
DATABASE_CATALOG_PATH=/app/storage/databases/record-platform.sqlite.catalog.sqlite
DATABASE_DIRECTORY=/app/storage/databases
```

Then start the stack:

```bash
DATABASE_CLIENT=sqlite \
SQLITE_DATABASE_PATH=/app/storage/databases/record-platform.sqlite \
DATABASE_CATALOG_PATH=/app/storage/databases/record-platform.sqlite.catalog.sqlite \
DATABASE_DIRECTORY=/app/storage/databases \
docker compose up -d --build
```

Open `http://localhost:3100/web`. The database catalog and every created SQLite database are stored in the persistent `databases_data` volume. Log in as the configured administrator, then use the database settings button to create or delete databases. The default `main` database cannot be deleted.

#### Odoo-style host selection

Set `DB_FILTER` to select databases from the request hostname. `%d` means the first hostname label and `%h` means the full hostname:

```dotenv
DB_FILTER=^%d$
```

With this setting, `main.example.com` selects `main` and `demo.example.com` selects `demo`. Only matching databases are shown on the login screen and accepted by login/API requests. To lock the server to one database, use:

```dotenv
DB_NAME=main
```

When `DB_NAME` is set, only that database is selectable and database creation/deletion is disabled.

Default URLs:

```text
Backend: http://localhost:3100
Web:     http://localhost:5173
Built admin app: http://localhost:3100/web
Website: http://localhost:3100
Next website (through app): http://localhost:3100
```

In development mode, the Next website reads published pages from the backend website API at `http://localhost:3100`. Set `WEBSITE_API_URL` when the backend runs at another address. In Docker, Fastify exposes the single public port `3100` and proxies website requests to the internal Next.js service.

On a new database, only `base` is installed automatically. Other modules are discovered and can be installed from Settings; dependencies are installed automatically with the selected module.

## Docker Compose with PostgreSQL

The repository includes a production-oriented `Dockerfile` and `docker-compose.yml` that run the app with PostgreSQL.

```bash
cp .env.example .env
docker compose up -d --build
```

Default services:

```text
App:        http://localhost:3100
Website:    http://localhost:3100
PostgreSQL: db:5432 inside the compose network
```

The app container sets:

```text
DATABASE_CLIENT=postgres
DATABASE_URL=postgres://record_platform:record_platform@db:5432/record_platform
```

The app image installs `postgresql-client` because the current PostgreSQL adapter uses the `psql` CLI while preserving the existing synchronous database API.

By default, the dev database is SQLite and is created at:

```text
record-platform.sqlite
```

PostgreSQL can be enabled with `DATABASE_CLIENT=postgres` and `DATABASE_URL`. The current adapter keeps the existing synchronous runtime API and uses the `psql` CLI, so the `psql` executable must be available to the server process.

Example:

```text
PORT=3100
WEBSITE_BASE_URL=http://localhost:3100
DATABASE_CLIENT=postgres
DATABASE_URL=postgres://record_platform:record_platform@localhost:5432/record_platform
JWT_SECRET=change-me
JWT_EXPIRES_SECONDS=28800
ADMIN_LOGIN=admin
ADMIN_PASSWORD=admin
ADMIN_NAME=Administrator
ADMIN_EMAIL=admin@example.local
```

## Verify

Run type checks:

```bash
npm run check
```

Build all packages/apps:

```bash
npm run build
```

Check backend health:

```bash
curl http://localhost:3100/api/health
```

Check dynamic menus:

```bash
curl http://localhost:3100/api/ui/menus
```

Check the composed sale order form view. It should include fields injected by `sale_discount`:

```bash
curl "http://localhost:3100/api/ui/views?model=sale.order&type=form"
```

Call a model method through the generic model API:

```bash
curl -X POST http://localhost:3100/api/model/call \
  -H "Content-Type: application/json" \
  -d '{"model":"sale.order","method":"confirm","ids":[1]}'
```

## Project Structure

```text
apps/
  server/
    src/
      db.ts
      main.ts
      modules.ts
      registry.ts
  web/
    src/
      App.tsx
      index.css

packages/
  core/
    src/
      index.ts

modules/
  base/
  contacts/
  sale/
  sale_discount/
```

## Main API

Authentication:

```text
GET /api/databases
POST /api/auth/login
POST /api/auth/register
POST /api/databases
DELETE /api/databases/:name
GET /api/auth/me
POST /api/auth/reset-token
POST /api/auth/logout
```

`GET /api/databases` is public so the login screen can offer a database selector. Login and registration accept `database` together with the credentials. The JWT is bound to that database, so each database has its own users, modules, metadata, and records.

`POST /api/databases` and `DELETE /api/databases/:name` require the configured administrator login. Database management currently supports SQLite files; PostgreSQL remains supported as a single configured database.

`POST /api/auth/login` returns a JWT token. Send it as:

```text
Authorization: Bearer <token>
```

All `/api/*` routes except `/api/health`, `/api/databases`, `/api/auth/login`, and `/api/auth/register` require a valid bearer token.

UI metadata:

```text
GET /api/ui/menus
GET /api/ui/actions/:externalId
GET /api/ui/views?model=:model&type=:type
```

Model metadata:

```text
GET /api/model/:model/metadata
```

Generic record API:

```text
POST /api/model/search
POST /api/model/read
POST /api/model/create
POST /api/model/write
POST /api/model/unlink
POST /api/model/call
```

Website:

```text
GET /
GET /:slug
```

## Design Rules

Project contribution rules are documented in `CONTRIBUTING.md`. Every change request must be analyzed, re-evaluated against the architecture, verified, and recorded in `CHANGELOG.md`.

Reusable Codex skill instructions for this project are stored in:

```text
skills/record-driven-module/SKILL.md
```

Programming instructions for creating modules, models, views, actions, menus, seed data, methods, and extensions are documented in `docs/development-guide.md`.

This POC intentionally avoids:

- business-model-specific controllers
- business-model-specific React pages
- hard-coded sidebar items
- hard-coded sales/contact forms

The frontend knows only:

```text
Menu
Action
Model
Field
View
Record
```

## Roadmap

Phase 1, current:

- metadata core
- runtime registry
- generic CRUD
- dynamic menus/actions/views
- generic React renderers

Phase 2:

- real module install/upgrade commands
- schema migration planning
- model extension ordering
- safer view inheritance
- module disable/uninstall

Phase 3:

- groups
- ACL
- record rules
- developer mode
- custom fields
- custom views

Phase 4:

- computed fields
- related fields
- one2many/many2many
- search views
- advanced domains

Phase 5:

- Electron/Tauri wrapper
- platform service adapters
- native print/files/notifications
- offline preparation

## Notes

SQLite remains the easiest local development option. PostgreSQL support is available for deployments that need a server database, stronger JSON/search capabilities, and a production-oriented storage engine.
