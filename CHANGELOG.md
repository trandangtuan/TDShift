# Changelog

All notable changes to this project are documented here.

## Unreleased

### Changed

- Translated module-facing menus, actions, views, field labels, and web client controls to Vietnamese across the admin workspace.
- Changed first startup to install only the `base` module; all other modules are discovered and require explicit installation with their dependencies.
- Changed the public website presentation layer to a separate Next.js App Router app at `apps/site`, while keeping `modules/website` as the source of page and menu metadata.
- Changed new `ir.attachment` and gallery uploads to store file bytes on the local filesystem under `ATTACHMENT_STORAGE_PATH`, while retaining legacy MinIO reads.
- Changed `sale.order.amount_total` to a stored field and added Sale Order Line write hooks to refresh stored totals when order lines change.
- Changed Sale Order list totals to read from stored `amount_total`, so `search_read` no longer computes totals or queries `sale_order_line` for list rows.

### Added

- Added `farm_core` with shared farm, area, production unit, species, breed, production batch, movement, growth, and mortality models, metadata views, menus, seed species, and database-isolated installation guidance in `docs/farm-core-guide.md` and `modules/farm_core/SKILL.md`.
- Added 20 active demo products to the `product` module seed data for catalog and website_sale testing.
- Added `website_sale`, a website extension that publishes active `product.product` records through the Next.js catalog at `/products` and `/products/:slug`.
- Added module-owned Discuss access rules through the generic model access hook, so registry code no longer contains Discuss-specific model names or SQL.
- Added Discuss record rules so users can only read channels, messages, members, and read receipts belonging to channels where they are active members.
- Added inline label editing for individual Discuss channel members.
- Added `core.user.phone` and expanded Discuss user search to match names, phone numbers, and email addresses.
- Added Discuss channel deletion with dependent message/read-receipt cleanup, member removal, and user search that creates or reuses a private channel automatically.
- Added the `discuss` module with internal channels, messages, channel membership management, user assignment, member labels, and channel/member/message menus.
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
- Added a development guide covering how to create modules, models, views, actions, menus, seed data, methods, extensions, and install/upgrade workflows.
- Added a `website` module with `website.page`, admin page list/form views, Website menu, sample Home page, and public `/website` routes for published pages.
- Added a module refresh API and a `Refresh Modules` button on the Modules list so newly added code modules such as `website` can appear before install.
- Added a generated `url` field to `website.page` and clickable URL rendering in list/form views.
- Added `core.view.content_type` and `core.view.content` so views can store JSON, HTML, or XML content for future website templates.
- Added backend computed-field runtime support so non-stored fields with `computeMethod` are populated during `read` and `search_read`.
- Added `sale.order.compute_amount_total` and changed `sale.order.amount_total` to compute from order lines instead of storing a column.
- Updated sale order seed records to omit computed `amount_total` values.
- Added a basic `stock` module with stock locations, stock moves, inventory menus, stock move actions, seeded locations/moves, and computed `product.product.qty_available`.
- Added a basic `purchase` module with purchase orders, purchase order lines, menus, computed totals, seeded purchase data, and confirmation that creates done stock moves.
- Added form action buttons for confirming purchase orders and marking stock moves done.
- Restyled the list search control so the input and search button render as a compact aligned control.
- Added the `record-driven-module` Codex skill instructions to the source tree under `skills/record-driven-module/SKILL.md`.
- Changed generated website page URLs to use an absolute `WEBSITE_BASE_URL` so links open the backend public website route instead of the frontend app route.
- Changed production startup so the backend serves the built web app from `apps/web/dist`, allowing a single backend port after `npm run build`.
- Changed the production web client to call API routes on the same backend origin while keeping the Vite development fallback pointed at `http://localhost:3100`.
- Changed the server start command to run through `tsx` so the built web app can be served reliably from the backend port with the current TypeScript ESM setup.
- Changed public website routing to use direct slugs such as `/` and `/:slug` while keeping backend APIs under `/api`.
- Added `website.menu` records and admin views so website navigation items such as Home can be managed as data.
- Changed public website rendering to build navigation from published `website.menu` records.
- Changed `website.page` content rendering to load HTML from a referenced `core.view` record instead of storing page body HTML directly on the page record.
- Added a seeded `core.view` HTML page view for the Website Home page.
- Changed seed handling to backfill missing values on existing seed records without overwriting non-null user data.
- Changed the web client to use a more compact interface density with smaller controls, tighter tables, narrower sidebar, and reduced form spacing.
- Changed sidebar menus to start collapsed when the app first opens.
- Moved the current user and logout action to the bottom of the sidebar and removed the topbar brand text.
- Removed the global refresh button from the topbar and added contextual refresh actions to list and form views.
- Added an `ai` module with OpenAI/ChatGPT, Claude, and OpenRouter provider configuration, MCP server configuration, AI request logs, and `POST /api/ai/chat` for record-aware LLM answers through MCP tools.
- Added an AI MCP Client model/view/menu and an AI Chat client action so users can chat through a configured OpenRouter-backed MCP client from the web app.
- Removed the standalone Sales and Purchases `Order Lines` menu entries while keeping order-line models available inside order forms.
- Added per-column list-view filters for stored fields, with type-aware search operators for text, numeric, boolean, and relation fields.
- Added vertical and horizontal scrolling to list tables and made the left sidebar stay fixed while the workspace scrolls.
- Updated `search_read` to return many2one values as `[id, display_name]` and taught list views to render those labels without per-cell lookup requests.
- Reworked the seeded Website Home page into a modern product overview with feature sections for modules, AI/MCP, search, authentication, and module lifecycle capabilities.
- Updated the Website Home copy to Vietnamese and removed references to Odoo-style positioning.
- Added a Vietnamese public Features page with detailed feature sections and a right-side sticky table of contents, plus a Website menu entry for `/features`.
- Added a standalone `product` module for shared product master data, moved `product.product` model/views/data out of `sale`, and updated Sales, Purchases, and Inventory to depend on the shared product module.
- Added model ownership transfer support for code-defined full models so existing `product.product` metadata can move from `sale` to `product` during module upgrades without breaking extension-owned fields.
- Added configurable database backend support with SQLite as the default and a PostgreSQL adapter enabled by `DATABASE_CLIENT=postgres` and `DATABASE_URL`.
- Added a production Dockerfile and Docker Compose setup for running the app with PostgreSQL, including a Postgres service, healthcheck, persistent volume, and app environment wiring.
- Updated the public Home page branding to MetaFlow.
- Added server-side module lifecycle logging for refresh, install, upgrade, metadata sync, seed data, audit backfill, deactivated metadata, and dropped columns.
- Added an `accounting` module with TT99-oriented Vietnamese enterprise accounting basics: chart of accounts, journals, journal entries, journal items, Accounting menus, seed accounts, seed journals, and journal entry posting validation for balanced debit and credit totals.
- Added sales fulfillment automation so confirming a sale order creates draft customer delivery stock moves, and marking those delivery moves done creates one draft customer invoice backed by receivable and revenue journal items.
- Added purchase receipt automation so confirming a purchase order creates draft vendor receipt stock moves, and marking those receipt moves done creates one draft vendor bill backed by inventory and payable journal items.
- Added module-local `SKILL.md` documentation for every module so AI agents can understand each module's scope, extension points, lifecycle expectations, and verification checklist.
- Added `ir.attachment` to the `base` module for storing file metadata, base64 file data or URL references, related record links, and a technical Attachments menu.
- Added MinIO-backed attachment storage: `ir.attachment` uploads base64 `datas` payloads to MinIO, stores bucket/object metadata, exposes attachment download routes, and includes MinIO Docker Compose configuration.
- Added an upload control for `ir.attachment` forms so users can choose a local file, auto-fill attachment metadata, convert the file to base64, and submit it through the MinIO attachment pipeline.
- Changed attachment uploads to stream multipart file data directly to MinIO through `/api/attachments/upload`, avoiding large base64 JSON payloads and Fastify body-size failures.
- Updated module-local skills with user workflows, feature maps, extension guidance, and verification notes for each module.
- Added a public Website module guide page at `/module-guide` with a left-side module menu and Vietnamese usage instructions for each module.
- Updated the public Website Home page to introduce MetaFlow as a downloadable/editable business app, highlight current modules, and add download/edit guidance with CTAs to the app and module guide.
- Added a complete CRM module inspired by the Odoo CRM workflow, including leads/opportunities, sales teams, stages, tags, activities, activity types, lead sources, marketing media, campaigns, lost reasons, CRM-to-sales quotation creation, and CRM-owned `sale.order.opportunity_id`.
- Added generic notebook tab rendering and CRM form action buttons for Convert, Create Quotation, Won, Lost, Restore, and activity completion.
- Updated the public module guide with CRM usage instructions and left-menu navigation.
- Added CRM demo data with Vietnamese sample leads, opportunities, lost opportunity, and follow-up activities across the seeded pipeline stages.
- Restyled form notebook tabs and moved the form status bar into the same command row as action buttons.
- Changed CRM `Create Quotation` to open the created Sales Order form, added workspace URLs for list/form screens, and added breadcrumbs for returning to the previous CRM record.
- Added client-side action/model/view metadata caching so opening forms, breadcrumbs, and CRM quotation navigation no longer refetch unchanged metadata.
- Batched many2one label enrichment in backend `read` responses and stopped form many2one controls from issuing per-field label API calls on render.
- Changed notebook tabs to lazy-render only the active tab content so fields in inactive tabs do not trigger relation or line-data loading until selected.
- Moved the generic form Save action to the top actionbar beside Back/Reset/Delete and made those form actionbar buttons icon-only.
- Added CRM highlights to the public Website Home and Features pages, including pipeline, activities, quotation handoff, breadcrumbs, and lazy tab loading notes.
- Added the GitHub source repository link to the public Website Home download/edit section so users can clone, fork, customize, and run MetaFlow.
- Added short-lived public website HTML caching and schema capability caching so concurrent page visits avoid repeated SQLite metadata/page/menu/view lookups.
- Added optional SQL call logging through `SQL_LOG=true`, including operation type, elapsed time, row/change counts, and normalized SQL text.
- Added `in` domain support and optimized the Sales order list total computation so `sale.order.amount_total` batches raw order-line reads instead of querying and enriching lines per order.
- Added per-request authenticated user caching and stopped list views from firing an initial empty column-filter reload after the first record load.

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

- Fixed Discuss Socket.IO message and read-receipt inserts to use the platform's `create_date`/`write_date` audit columns, preventing backend restarts and browser connection resets.
- Fixed initial data seeding for models without a `name` column, such as `sale.order.line`.
- Restored the `sale_discount` module manifest required by the module registry and install/uninstall POC.
- Fixed missing technical views for `core.menu`.
- Fixed manual `core.menu` creation failing because required metadata ownership fields were missing.
- Fixed public website rendering when existing `website.menu` records have missing `label` or `url` values.
- Fixed generic form URL rendering so editable URL fields such as `website.menu.url` use an input, while readonly generated URLs remain clickable links.
- Fixed generic record writes so readonly audit fields returned as many2one display tuples are ignored, and many2one tuple values normalize back to ids before database writes.
- Fixed inline one2many editors so audit metadata columns are hidden from order and journal line tables.
- Fixed form line editing so one2many fields wait for visible column metadata, hide audit fields reliably, and keep many2one product dropdowns selectable above compact line tables.
- Changed form views to render `state`/`status` selection fields as a status bar and moved reset/delete actions next to the back-to-list action.
- Changed generic form field rendering to use Ant Design controls, including Checkbox for boolean fields and searchable Select controls for many2one relations.

### Verification

- Ran `npm run check`.
- Ran `npm run build`.
- Validated the local `record-driven-module` Codex skill.
- Verified module uninstall on a temporary SQLite database removes `sale_discount` metadata and drops its stored columns from `sale_order`.
- Verified fresh bootstrap creates `core.user`, seeds the administrator, issues JWTs, and invalidates old JWTs after token reset.
- Verified fresh bootstrap adds audit columns to every active model table and create/write operations populate audit user and timestamp values.
- Verified authenticated API behavior on a temporary server: menus return 401 without a token and 200 with a login JWT.
- Verified public registration and admin-created users can both log in with hashed passwords.
- Verified the `website` module installs on a temporary server and renders the published Home page through `/website` and `/website/home`.
- Verified module refresh discovers `website` in `core_module`.
- Verified `website.page.url` is generated from `slug` on create and write.
- Verified generated website page URLs use `WEBSITE_BASE_URL` as absolute backend URLs.
- Verified a production build is served from a single backend port, including `/`, `/assets/...`, `/api/health`, and direct website slugs.
- Verified direct website routing on a fresh database: `/` renders Home with record-driven navigation, `/web` serves the admin app, `/api/health` stays under API, and `/website/home` returns 404.
- Verified public Home renders without a 500 after making website menu HTML escaping null-safe.
- Verified `core.view` metadata exposes `content_type` and `content`, and runtime views return `contentType/content` from the API.
- Verified Website Home renders HTML from the seeded `core.view` content record on a fresh database.
- Verified `sale.order.amount_total` is populated by the backend compute method through `search_read` on a fresh database.
- Verified fresh bootstrap exposes Sales, Purchases, and Inventory menus; purchase totals compute from lines; confirming a purchase order creates stock moves and increases computed product on-hand quantity.
- Verified `sale` module upgrade removes stale `sale.order.product_id` metadata and the physical `sale_order.product_id` column while keeping `sale.order.line.product_id` active.
- Verified menu, view, CRUD, and module lifecycle APIs during POC implementation.
