# MCP Module Skill

Use this module when changing Model Context Protocol routes or tools that expose the record platform to external AI clients.

## Scope

- Provides MCP route registration and tools for interacting with platform records.
- Depends on platform registry and environment behavior from server/core.
- Intended to let AI clients inspect metadata and operate on records through controlled tool interfaces.

## User Workflows

- Use MCP tools when an external AI client needs to inspect models, fields, menus, or records.
- Prefer metadata-aware read/search tools before write tools.
- Use authenticated request context so tool calls execute with a real platform user.

## Feature Map

- MCP routes expose record-platform capabilities to AI clients.
- Tools should map to safe generic model operations and avoid bypassing the registry.

## Extension Guidance

- Keep MCP tools generic and metadata-aware where possible.
- Validate model names, domains, ids, and write payloads before executing record operations.
- Do not expose secrets, raw database handles, or unrestricted filesystem/network operations through MCP tools.
- When adding tools, update route registration, tool definitions, and documentation together.

## Verification

- Run `npm run check` and `npm run build` after code changes.
- Test tool schemas and at least one successful call path for each new MCP tool.
- Test rejected inputs for invalid models, invalid ids, and unsafe write payloads.
