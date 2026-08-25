# Accounting Module Skill

Use this module when changing Vietnamese accounting master data, journals, journal entries, invoices, vendor bills, or debit/credit posting behavior.

## Scope

- Owns `account.account`, `account.journal`, `account.move`, and `account.move.line`.
- Provides a TT99-oriented Vietnamese enterprise accounting baseline with seeded accounts and journals.
- `account.move` supports journal entries, customer invoices, and vendor bills through `move_type`.
- Posting validates that journal items have balanced debit and credit totals.
- Sales create draft customer invoices; purchases create draft vendor bills.

## User Workflows

- Chart of accounts: go to Accounting > Configuration > Chart of Accounts to review or add accounts. Seeded accounts provide a TT99-oriented baseline.
- Journals: go to Accounting > Configuration > Journals to configure general, sales, purchase, cash, and bank journals.
- Journal entries: go to Accounting > Journal Entries, add lines, then call `post` to validate balanced debit and credit totals.
- Customer invoices are generated automatically after sale delivery is marked done.
- Vendor bills are generated automatically after purchase receipt is marked done.

## Feature Map

- `account.account`: account code, name, type, parent, level, reconciliation flag.
- `account.journal`: accounting journals by type.
- `account.move`: journal entry, customer invoice, and vendor bill header using `move_type`.
- `account.move.line`: debit/credit lines connected to accounts and optional partners.

## Extension Guidance

- Treat seeded accounts as baseline chart-of-accounts data, not the full final implementation of every Vietnamese accounting requirement.
- Use `source_document` to connect accounting moves back to sale/purchase/stock origins and to prevent duplicate document creation.
- Add document-specific accounting fields to `account.move`; add debit/credit analytical details to `account.move.line`.
- When changing default account mapping, update sale and purchase automation together.
- Keep posting validation conservative: posted moves must balance and have meaningful debit/credit lines.

## Verification

- Run `npm run check` and `npm run build` after code changes.
- Test posting balanced and unbalanced entries.
- Test sales invoice and vendor bill creation after delivery/receipt.
- Verify default account mappings if account codes `131`, `331`, `511`, or `156` are changed.
