# Sale Module Skill

Use this module when changing sales orders, sales order lines, customer delivery creation, or customer invoice automation.

## Scope

- Owns `sale.order` and `sale.order.line`.
- Depends on `contacts`, `product`, `stock`, and `accounting`.
- Confirming a sale order creates draft customer delivery `stock.move` records from internal stock to customer location.
- Extends `stock.move.done` so completing customer delivery creates one draft customer invoice as `account.move` with `move_type = out_invoice`.
- Customer invoice lines currently debit account `131` and credit account `511`.

## User Workflows

- Create a sale order from Sales > Orders.
- Add order lines with product, quantity, unit price, and subtotal.
- Click Confirm. The order changes to confirmed and draft delivery `stock.move` records are created.
- Open Inventory > Stock Moves, find moves with `origin` equal to the sale order, then Mark Done.
- Marking the customer delivery done creates one draft customer invoice in Accounting > Journal Entries with `move_type = out_invoice`.

## Feature Map

- `sale.order`: customer, order date, state, computed total, one2many order lines.
- `sale.order.line`: product, description, quantity, unit price, subtotal.
- `sale.models.stock-move`: extension on `stock.move.done` that creates customer invoices after customer deliveries.

## Extension Guidance

- Add sale header fields to `sale.order` and line-level commercial fields to `sale.order.line`.
- Keep delivery-specific stock behavior generic enough to work through `stock.move` records.
- Avoid duplicate invoices by preserving the `source_document` check on `account.move`.
- If totals or line pricing change, update `compute_amount_total`, line editor behavior, invoice generation, views, and seed data together.
- Use model extensions for optional sale behavior, as `sale_discount` does.

## Verification

- Run `npm run check` and `npm run build` after code changes.
- Test: create sale order, add lines, confirm, mark delivery done, verify draft customer invoice and journal items are created once.
- Test duplicate delivery completion does not create duplicate invoices.
