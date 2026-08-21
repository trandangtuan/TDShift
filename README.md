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

Implemented runtime:

- Fastify backend.
- SQLite dev database.
- Core user model with JWT login and token reset APIs.
- Runtime model registry.
- Generic record CRUD API.
- Dynamic menu/action/view APIs.
- React/Vite web client.
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
```

Default URLs:

```text
Backend: http://localhost:3100
Web:     http://localhost:5173
```

The dev database is created at:

```text
record-platform.sqlite
```

Server environment variables can be set in `apps/server/.env`:

```text
PORT=3100
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
POST /api/auth/login
POST /api/auth/register
GET /api/auth/me
POST /api/auth/reset-token
POST /api/auth/logout
```

`POST /api/auth/login` accepts `login` and `password`, then returns a JWT token. Send it as:

```text
Authorization: Bearer <token>
```

All `/api/*` routes except `/api/health`, `/api/auth/login`, and `/api/auth/register` require a valid bearer token.

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

## Design Rules

Project contribution rules are documented in `CONTRIBUTING.md`. Every change request must be analyzed, re-evaluated against the architecture, verified, and recorded in `CHANGELOG.md`.

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

SQLite is used only to make the POC easy to run locally. The intended production direction is PostgreSQL with a schema reconciliation engine that compares `core_model_field` records against the physical database schema.
