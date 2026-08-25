# Purchase Module Skill

Use this module when changing purchase orders, purchase order lines, vendor receipt creation, or vendor bill automation.

## Scope

- Owns `purchase.order` and `purchase.order.line`.
- Depends on `contacts`, `product`, `stock`, and `accounting`.
- Confirming a purchase order creates draft vendor receipt `stock.move` records from supplier location to internal stock.
- Extends `stock.move.done` so completing vendor receipt creates one draft vendor bill as `account.move` with `move_type = in_invoice`.
- Vendor bill lines currently debit account `156` and credit account `331`.

## User Workflows

- Create a purchase order from Purchases > Orders.
- Add order lines with product, quantity, unit price, and subtotal.
- Click Confirm. The order changes to confirmed and draft receipt `stock.move` records are created.
- Open Inventory > Stock Moves, find moves with `origin` equal to the purchase order, then Mark Done.
- Marking the vendor receipt done creates one draft vendor bill in Accounting > Journal Entries with `move_type = in_invoice`.

## Feature Map

- `purchase.order`: vendor, order date, state, computed total, one2many order lines.
- `purchase.order.line`: product, description, quantity, unit price, subtotal.
- `purchase.models.stock-move`: extension on `stock.move.done` that creates vendor bills after supplier receipts.

## Extension Guidance

- Add purchase header fields to `purchase.order` and line-level procurement fields to `purchase.order.line`.
- Keep receipt movement logic based on stock locations, not hard-coded stock move ids.
- Avoid duplicate vendor bills by preserving the `source_document` check on `account.move`.
- If costing or landed cost behavior is added, update receipt, bill, accounting, views, and seed data together.

## Verification

- Run `npm run check` and `npm run build` after code changes.
- Test: create purchase order, add lines, confirm, mark receipt done, verify draft vendor bill and journal items are created once.
- Test duplicate receipt completion does not create duplicate vendor bills.
