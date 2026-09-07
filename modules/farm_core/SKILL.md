# Farm Core Module Skill

Use this module when changing shared farm and production data used by livestock, poultry, and aquaculture modules.

## Scope

- Owns `farm.farm`, `farm.area`, and `farm.production.unit` for physical farm structure.
- Owns `farm.species` and `farm.breed` for reusable biological master data.
- Owns `farm.batch` as the central production-cycle object.
- Owns `farm.movement`, `farm.growth`, and `farm.mortality` for shared production records.
- Does not own feed, medicine, vaccination, environment, costing, sales, or species-specific workflows.

## Dependencies

- Depends on `base` for users, metadata, menus, and generic runtime behavior.
- Depends on `contacts` for suppliers and partners.
- Install `farm_core` separately in each database. Installation in one database must not modify another database.

## User Workflows

1. Create a Farm and select its production type.
2. Create Areas belonging to that Farm.
3. Create Production Units belonging to an Area. Use `unit_type` such as Barn, House, Pond, Tank, or Cage instead of hard-coding a livestock term.
4. Create Species and Breeds.
5. Create a Production Batch with species, breed, farm, area, production unit, start date, quantity, and initial weight.
6. Record Batch Movements when animals or aquatic stock move between production units.
7. Record Growth Measurements with sample quantity, total weight, average weight, and ADG.
8. Record Mortality with quantity, date, production unit, cause, and weight.

## Feature Map

- `farm.farm`: company production site, manager, area, production type, and status.
- `farm.area`: subdivision of a farm.
- `farm.production.unit`: physical holding unit such as barn, pond, tank, or cage.
- `farm.species`: reusable species configuration, including production type and tracking flags.
- `farm.breed`: breed linked to a species and optional supplier.
- `farm.batch`: production-cycle master record and integration point for future modules.
- `farm.movement`: transfer history between production units.
- `farm.growth`: periodic weight and ADG measurements.
- `farm.mortality`: death/loss records and causes.

## Extension Guidance

- Add shared fields and workflows to `farm_core` only when they apply to every production type.
- Add pig, chicken, cattle, aquaculture, or shrimp behavior in a specialized module such as `farm_pig` or `farm_aquaculture`.
- Use `farm.batch` as the foreign-key target for feed, health, costing, growth, mortality, and sales extensions.
- Keep `Production Unit` generic. Do not add `barn_id`, `pond_id`, or species-specific location fields to core.
- Keep `name` as the display field for every model because many2one pickers use it.
- Add model, view, and seed data changes together. Preserve stable external IDs for seed records.
- Do not assume record IDs are shared across databases; every database has its own metadata and record IDs.

## Current MVP Limitations

- Movement, growth, and mortality are currently generic CRUD records.
- Quantity balance, mortality rate, ADG, and FCR are not yet computed automatically.
- State transitions and confirmation buttons are not yet implemented.
- Feed, health, environment, costing, dashboard, reporting, and mobile workflows belong to later modules.

## Verification

- Run `npm run check -w @record-platform/server` and `npm run check -w @record-platform/web` after code changes.
- Build the server so module discovery loads the new definition.
- Install `farm_core` in a test database and verify its nine models and tables.
- Verify another database has no `farm.*` models until the module is installed there.
- Test many2one fields from Batch to Farm, Area, Production Unit, Species, Breed, and User.
- For module lifecycle changes, follow `skills/record-driven-module/SKILL.md` and run the module upgrade on an installed database.
