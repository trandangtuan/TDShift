# Changelog

All notable changes to this project are documented here.

## Unreleased

### Added

- Added contribution rules requiring every change request to be analyzed, re-evaluated against the architecture, verified, and recorded in this changelog.
- Added `CONTRIBUTING.md` to document the required change workflow and record-driven development rule.
- Added Phase 1 record-driven platform POC with a TypeScript monorepo, Fastify backend, SQLite dev database, runtime registry, generic model CRUD APIs, and React/Vite web client.
- Added `base`, `contacts`, `sale`, and `sale_discount` module definitions.
- Added dynamic menu, action, list view, and form view rendering from metadata records.
- Added technical views for Models, Fields, Views, Menus, and Modules.
- Added POC module install/uninstall APIs and UI actions for `core.module`.
- Added `product.product` as a second model inside the `sale` module, with product list/form views, a Products menu, sample data, and a `sale.order.product_id` relation field.
- Added explicit module upgrade support through `POST /api/modules/upgrade` and an Upgrade button on installed module forms.
- Added `sale.order.line` to the `sale` module with order/product relations, quantity, unit price, subtotal fields, list/form views, an Order Lines menu, and sample order line records.
- Added generic inline `one2many` tree rendering so `sale.order` can show and add `sale.order.line` records directly in its form view.
- Added generic `many2one` UI rendering so relational fields display related record names and can be selected from a dropdown instead of editing raw ids.
- Added searchable `many2one` pickers that query related records on demand and show at most 8 results for large datasets.
- Added 20 additional sample contacts to the `contacts` module for testing searchable relation fields.
- Added generic `search_read` model runtime method and `POST /api/model/search_read` endpoint.
- Added generic list/tree pagination with a default page size of 30 rows and editable page-size controls.
- Added the `required` flag to the `core.model.field` technical list/form views so required markers can be controlled from field metadata.
- Added module install/upgrade reconciliation so code-defined fields are added to database tables and removed module-owned stored fields are dropped from database tables.
- Added split module file organization for `sale`, `contacts`, and `sale_discount`, separating model, view, and data definitions into module subfolders.
- Added a local Codex skill at `~/.codex/skills/record-driven-module` so AI agents can reuse the project's record-driven module conventions.
- Added split file organization for the `base` module, separating core model, view, action, and menu definitions from the module manifest.
- Added `core.user` to the `base` module with technical user views, action, and menu.
- Added JWT login, current-user, logout, and token-reset APIs backed by `.env` configuration and a seeded administrator user.
- Added `.env.example` and `.gitignore` entries for local environment and SQLite development files.
- Added generic audit columns to every model table: `create_uid`, `write_uid`, `create_date`, and `write_date`.
- Added automatic audit value handling so record create/write operations store the current session user and timestamps.
- Added a login screen, logout action, client-side JWT storage, and authenticated API requests in the web client.
- Added backend authentication enforcement for all `/api/*` routes except health, login, and registration, removing the unauthenticated environment-user fallback.
- Added public user registration from the login screen and `POST /api/auth/register`.
- Added transient `core.user.password` handling so admins can create or change users from the Users menu without storing plaintext passwords.
- Added a prominent Users menu directly under Settings for easier user administration.
- Changed sidebar menus to start collapsed when the app first opens.
- Moved the current user and logout action to the bottom of the sidebar and removed the topbar brand text.
- Removed the global refresh button from the topbar and added contextual refresh actions to list and form views.

### Changed

- Changed generic form save behavior to stay on the saved form record instead of returning to the list; newly created records remain open after creation.
- Changed generic form fields to render labels and inputs on the same row, with required fields marked by `*`.
- Changed generic list/tree rows to open the form when the row is clicked, removing the separate open button from the final column.
- Changed the generic model search API to accept an optional `limit` for bounded lookup queries.
- Changed generic model search and `search_read` APIs to accept `offset` for paginated list views.
- Changed list, one2many inline tree, and many2one picker loading to use `search_read` where ids and records are needed together.
- Changed module uninstall behavior to drop physical database columns for stored fields owned by the uninstalled module, such as `sale_discount.discount_percent` and `sale_discount.discount_amount` on `sale_order`.
- Changed module install/upgrade to reactivate and refresh module-owned metadata from code, including fields, views, view extensions, actions, and menus.
- Changed module uninstall to remove module-owned field, view, view extension, action, menu, and model metadata instead of only deactivating it.
- Changed `sale.order` views and sample data so products live on `sale.order.line` instead of the order header.
- Changed startup bootstrap to discover module records only. Code metadata changes no longer update database metadata or schema until the module is installed or upgraded explicitly.
- Updated bootstrap behavior so module records are not forced back to `INSTALLED` on every server restart.
- Updated generic metadata record creation to provide default ownership and system fields for manually created core records.

### Fixed

- Fixed initial data seeding for models without a `name` column, such as `sale.order.line`.
- Restored the `sale_discount` module manifest required by the module registry and install/uninstall POC.
- Fixed missing technical views for `core.menu`.
- Fixed manual `core.menu` creation failing because required metadata ownership fields were missing.

### Verification

- Ran `npm run check`.
- Ran `npm run build`.
- Validated the local `record-driven-module` Codex skill.
- Verified module uninstall on a temporary SQLite database removes `sale_discount` metadata and drops its stored columns from `sale_order`.
- Verified fresh bootstrap creates `core.user`, seeds the administrator, issues JWTs, and invalidates old JWTs after token reset.
- Verified fresh bootstrap adds audit columns to every active model table and create/write operations populate audit user and timestamp values.
- Verified authenticated API behavior on a temporary server: menus return 401 without a token and 200 with a login JWT.
- Verified public registration and admin-created users can both log in with hashed passwords.
- Verified `sale` module upgrade removes stale `sale.order.product_id` metadata and the physical `sale_order.product_id` column while keeping `sale.order.line.product_id` active.
- Verified menu, view, CRUD, and module lifecycle APIs during POC implementation.
