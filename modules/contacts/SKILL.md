# Contacts Module Skill

Use this module when changing customers, vendors, or generic partner/contact data shared by sales, purchases, accounting, and other business modules.

## Scope

- Owns `res.partner`.
- Current contact fields are `name`, `email`, `phone`, and `active`.
- Seed data provides sample contacts used by relational pickers and demo orders.

## User Workflows

- Go to Contacts to create customers, vendors, or general business partners.
- Select contacts as customers on sale orders.
- Select contacts as vendors on purchase orders.
- Select contacts as partners on accounting moves and journal items.

## Feature Map

- `res.partner`: name, email, phone, active flag.
- `name` is the display value in many2one search/select controls.

## Extension Guidance

- Add broadly reusable partner fields here, not inside sale or purchase, when both customer and vendor workflows could need them.
- Keep `name` as the primary display field because many2one pickers rely on it.
- Use extension modules for domain-specific partner fields when the data only belongs to one domain.
- Update partner list/form views and seed data when fields become user-facing.

## Verification

- Run `npm run check` and `npm run build` after code changes.
- Test many2one partner selection from sales, purchases, and accounting forms after changing display or required fields.
- Test both customer and vendor flows after making partner fields required.
