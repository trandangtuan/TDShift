# Stock Module Skill

Use this module when changing inventory locations, stock moves, quantity computations, or generic receipt/delivery movement behavior.

## Scope

- Owns `stock.location` and `stock.move`.
- Extends `product.product` with inventory quantity behavior.
- Seed locations include supplier, internal stock, and customer locations.
- `stock.move.done` marks stock moves as done. Sales and purchases extend this method to create invoices/bills after delivery or receipt.

## User Workflows

- Locations: go to Inventory > Locations to maintain supplier, internal, customer, or inventory locations.
- Stock moves: go to Inventory > Stock Moves to inspect draft/done/cancelled inventory movements.
- Delivery: sale confirmation creates internal-to-customer moves; Mark Done completes delivery and triggers sale invoicing through the sale extension.
- Receipt: purchase confirmation creates supplier-to-internal moves; Mark Done completes receipt and triggers vendor billing through the purchase extension.
- Product availability is computed from done stock moves.

## Feature Map

- `stock.location`: location name, usage, active flag.
- `stock.move`: product, quantity, source/destination locations, state, origin, date.
- `product.product` extension: computed available quantity.

## Extension Guidance

- Keep stock generic. Do not embed sale invoice or purchase bill logic directly in stock; use module extensions like `sale.models.stock-move` or `purchase.models.stock-move`.
- Location `usage` drives business classification: `supplier`, `internal`, `customer`, `inventory`.
- When adding new stock states or movement types, update stock views and any downstream extensions that inspect movement direction.
- Be careful with computed product quantities because sale, purchase, and inventory modules can all create moves.

## Verification

- Run `npm run check` and `npm run build` after code changes.
- Test marking stock moves done and verify sale/purchase extensions still run correctly.
- Test product quantity after supplier receipt, customer delivery, and cancelled moves.
