# Website Module Skill

Use this module when changing public website pages, website navigation, HTML page views, or public website routing.

## Scope

- Owns `website.page` and `website.menu`.
- Public routes render published website pages from `core.view` HTML content.
- Seed data includes Vietnamese Home and Features-style public content and website menus.
- `website.page.url` is generated from `slug` and `WEBSITE_BASE_URL`.

## User Workflows

- Go to Website > Pages to create or publish pages.
- Create or edit HTML content in a linked `core.view` record.
- Go to Website > Menus to control public navigation.
- Visit public routes such as `/`, `/features`, or the page slug to render published pages.

## Feature Map

- `website.page`: page name, slug, generated URL, published flag, linked HTML view.
- `website.menu`: navigation label, URL, parent, sequence, active flag.
- Public routes render from database metadata rather than hard-coded React pages.

## Extension Guidance

- Keep public page body content in `core.view` HTML records and link pages to those views.
- Keep routing under public website paths while preserving `/api/*` for backend APIs.
- When changing slug or URL behavior, update generated URL compute/write behavior and seed data.
- Use published website menu records for navigation rather than hard-coded nav links.

## Verification

- Run `npm run check` and `npm run build` after code changes.
- Test public routes such as `/`, `/features`, and backend API routes after routing changes.
- Test generated URLs when `WEBSITE_BASE_URL` changes.
