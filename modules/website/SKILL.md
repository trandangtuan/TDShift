# Website Module Skill

Use this module when changing public website pages, website navigation, HTML page views, or public website routing.

## Scope

- Owns `website.page` and `website.menu`.
- Public routes render published website pages from `core.view` HTML content.
- Seed data includes Vietnamese Home, Features, and Module Guide public content and website menus.
- Home introduces the application, core business modules, and a "Tải về & chỉnh sửa" section for editing through the admin app or extending source modules.
- `website.page.url` is generated from `slug` and `WEBSITE_BASE_URL`.

## User Workflows

- Go to Website > Pages to create or publish pages.
- Create or edit HTML content in a linked `core.view` record.
- Go to Website > Menus to control public navigation.
- Visit public routes such as `/`, `/features`, `/module-guide`, or the page slug to render published pages.
- Use `/` as the public product overview with CTAs to `/web`, `/features`, `/module-guide`, and the download/edit guidance section.
- Use `/module-guide` as the public user guide for module-by-module usage. It has a left-side sticky module menu and detailed usage cards, including CRM lead/opportunity workflows.

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
- Test Home CTAs and the `#download` anchor after changing product overview copy.
- Test `/module-guide` and its left-side anchor menu after changing module documentation content.
- Test generated URLs when `WEBSITE_BASE_URL` changes.
