# CRM Module Skill

Use this module when changing lead capture, opportunity pipeline, sales activities, sales teams, CRM source attribution, lost/won handling, or CRM-to-sales quotation handoff.

## Scope

- Owns CRM models: `crm.lead`, `crm.activity`, `crm.team`, `crm.stage`, `crm.tag`, `crm.activity.type`, `crm.lost.reason`, `crm.source`, `crm.medium`, and `crm.campaign`.
- Depends on `contacts` for customers/prospects and `sale` for quotation creation.
- Implements an Odoo-inspired workflow: capture lead, qualify into opportunity, manage pipeline stages, schedule activities, create quotation, mark won or lost, and analyze expected revenue fields.
- Demo data includes Vietnamese sample leads/opportunities across New, Qualified, Proposition, and Lost states with planned/done activities.

## User Workflows

- Go to CRM > Leads to create or qualify new prospects.
- Use `Convert` on a lead to turn it into an opportunity and move it into the qualified pipeline.
- Go to CRM > Pipeline to work active opportunities by stage, salesperson, team, revenue, probability, and expected closing date.
- Add Activities on the opportunity form to schedule calls, emails, meetings, and follow-ups.
- Use `Create Quotation` from an opportunity to create a draft `sale.order` and schedule a follow-up activity.
- Use `Won`, `Lost`, or `Restore` to close or reopen opportunities.
- Go to CRM > Configuration to maintain stages, sales teams, activity types, lead sources, media, campaigns, tags, and lost reasons.
- After installing CRM on a fresh database, review the seeded demo pipeline to test qualification, follow-up, quotation, won/lost, and lost reason flows.

## Feature Map

- `crm.lead`: central lead/opportunity record with contact details, pipeline fields, marketing attribution, activities, lost reason, and quotation count.
- `crm.activity`: planned/done/cancelled follow-up tasks linked to a lead or opportunity.
- `crm.stage`: ordered pipeline stages with probability and stage type.
- `crm.team`: sales team ownership and target revenue.
- `crm.source`, `crm.medium`, `crm.campaign`: marketing attribution.
- `crm.lost.reason`: structured loss reporting.
- `crm.activity.type`: reusable follow-up categories.
- Demo records: factory ERP opportunity, retail distribution proposal, website inquiry lead, and lost agency CRM opportunity.

## Extension Guidance

- Keep CRM-specific commercial qualification fields on `crm.lead`.
- Put reusable customer/vendor master data on `res.partner` in the contacts module.
- Add automation as model methods or extensions before adding bespoke routes.
- When adding new pipeline actions, expose them through generic form buttons only if the client can call the method consistently.
- Preserve the Odoo-style lead/opportunity distinction using `type = lead` or `type = opportunity`.

## Verification

- Run `npm run check` and `npm run build` after code changes.
- Refresh Modules, install CRM, and confirm CRM menus/actions/views appear.
- Test lead creation, Convert, Create Quotation, Won, Lost, Restore, and activity Mark Done.
- Test demo records after install/upgrade and confirm their activities point to the expected CRM records.
- Test that Create Quotation creates a draft `sale.order` and follow-up activity.
