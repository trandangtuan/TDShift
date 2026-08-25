# Product Module Skill

Use this module when changing shared product master data used by sales, purchases, inventory, and accounting flows.

## Scope

- Owns `product.product`.
- Current product fields include `name`, `default_code`, `list_price`, and `active`.
- Product records are used by sale order lines, purchase order lines, and stock moves.

## User Workflows

- Go to Products to create or maintain shared products.
- Use `default_code` for SKU/internal reference.
- Use `list_price` as the default commercial reference price.
- Products appear in sale order lines, purchase order lines, and stock moves through searchable many2one fields.

## Feature Map

- `product.product`: product name, internal code, list price, active flag.
- Stock extends products with inventory quantity behavior.

## Extension Guidance

- Keep product master data here when it is shared across modules.
- Add inventory-only computed or extension fields from `stock`, not directly here, unless the field is part of the core product definition.
- Preserve `name` as the display field for many2one product pickers.
- Update product views and seed data when adding required product fields.

## Verification

- Run `npm run check` and `npm run build` after code changes.
- Test product selection inside sale/purchase order line editors and stock moves.
- Test inactive products if UI filtering by active is introduced later.
