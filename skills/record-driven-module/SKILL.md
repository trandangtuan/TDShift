---
name: record-driven-module
description: Work on the local record-driven/Odoo-like platform modules, including model/view/data file organization and install/upgrade/uninstall metadata lifecycle behavior.
---

# Record Driven Module

Use this skill when changing modules in the local record-driven platform, especially requests involving Odoo-like models, fields, views, data, module install/update/uninstall, or generic metadata behavior.

## Required Workflow

- Analyze the requested change before editing. Re-evaluate how it affects module metadata, physical database schema, runtime registry behavior, UI views, existing data, and extension modules.
- Record every implemented change in the project `CHANGELOG.md`.
- Keep changes aligned with existing TypeScript types in `packages/core/src/index.ts`.
- Preserve user/custom metadata. Lifecycle cleanup should only remove or deactivate records owned by the module being changed, and should avoid touching records with `is_custom = 1`.
- Verify with `npm run check` and `npm run build` when code is changed.

## Module Layout

Prefer splitting feature modules into focused files:

```text
modules/<module>/
|-- module.ts
|-- models/
|   |-- index.ts
|   `-- <model-name>.ts
|-- views/
|   |-- index.ts
|   `-- <model-name>.ts
`-- data/
    |-- index.ts
    `-- <records-name>.ts
```

Use `module.ts` only as the manifest composer: module identity, dependencies, actions, menus, and arrays imported from `models`, `views`, and `data`.

Model files should export typed `ModelDefinition` values. View files should export typed `ViewDefinition[]` or `ViewExtensionDefinition[]`. Data files should export typed `DataRecordDefinition[]`.

For example, in a `sale` module:

- `models/sale-order.ts` defines `sale.order`.
- `models/sale-order-line.ts` defines `sale.order.line`.
- `views/sale-order.ts` defines the order list/form views.
- `data/orders.ts` defines order seed records.

## Lifecycle Semantics

When updating install or upgrade behavior:

- Fields present in code should be inserted/reactivated in `core_model_field` and added to the physical business table when stored.
- Module-owned stored fields removed from code should be deactivated in metadata and dropped from the business table.
- Module-owned views, view extensions, actions, and menus removed from code should be deactivated rather than silently left active.
- Extension modules may define fields on another module's model. Do not transfer model ownership or remove extension-owned fields when upgrading the base module.
- Startup discovery should not apply code metadata changes unless the project explicitly chooses that behavior; module install/upgrade should be the intentional point where metadata changes are applied.

## View And Data Consistency

When moving a field from one model to another, update all related views and seed data in the same change. For example, if `product_id` moves from `sale.order` to `sale.order.line`, remove it from `sale.order` views/data and keep it in `sale.order.line` views/data.

After changing module files, consider whether an installed development database needs a module upgrade to reconcile metadata and schema.
