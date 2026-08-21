# Contribution Rules

This project is an application platform, so changes should be treated as architecture changes unless they are clearly documentation-only.

## Required Change Workflow

Every change request must follow this workflow:

1. Analyze the request.
2. Re-evaluate the current architecture and affected code paths.
3. Identify the intended behavior and possible side effects.
4. Implement the smallest coherent change.
5. Verify with type checks, builds, API checks, or UI checks as appropriate.
6. Record the change in `CHANGELOG.md`.

## Changelog Rule

Every repository change must be documented in `CHANGELOG.md`.

Each changelog entry should include:

- what changed
- why it changed
- affected areas
- verification performed

Use the `Unreleased` section for active development.

## Record-Driven Rule

New features should preserve the record-driven architecture:

```text
Code
  -> Module Definition
  -> Metadata
  -> Database Records
  -> Runtime Registry
  -> Application
```

Avoid adding business-model-specific controllers, pages, routes, or forms unless there is a deliberate architecture reason.
