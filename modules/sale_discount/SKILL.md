# Sales Discount Module Skill

Use this module when changing optional discount behavior on sales orders.

## Scope

- Extends `sale.order` with `discount_percent` and `discount_amount`.
- Adds view extensions to show discount fields on sale order forms.
- Extends `sale.order.confirm` to validate discount percent before confirmation.

## User Workflows

- Install or upgrade `sale_discount` after `sale`.
- Open a sale order and set Discount %.
- Confirm the sale order. Confirmation rejects discount values greater than 100.

## Feature Map

- `discount_percent`: editable percentage on `sale.order`.
- `discount_amount`: readonly amount placeholder on `sale.order`.
- View extension injects discount fields into the sale order form.

## Extension Guidance

- Keep this module optional and dependent only on `sale` unless a new feature truly needs more dependencies.
- Do not move base sale fields here. This module should contain only discount-specific fields, validation, compute behavior, and views.
- If discounts affect invoice totals, update sale invoice generation and accounting behavior deliberately.
- Preserve extension ownership so uninstalling this module removes only discount metadata and columns.

## Verification

- Run `npm run check` and `npm run build` after code changes.
- Test sale order confirm with valid and invalid discount percentages.
- If invoice totals begin using discounts, test sale total, delivery, and customer invoice creation together.
