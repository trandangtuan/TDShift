# AI Module Skill

Use this module when changing AI provider configuration, MCP client/server configuration, request logging, or record-aware AI chat behavior.

## Scope

- Owns AI provider, MCP client, MCP server, and AI request log models.
- Provides AI menus and an AI Chat client action.
- Routes expose record-aware chat behavior through configured providers and MCP tools.
- Seed data provides initial AI/MCP configuration records.

## User Workflows

- Configure providers under AI provider menus. API keys should come from environment variables or secure config, not source code.
- Configure MCP servers and MCP clients.
- Open the AI Chat action to ask record-aware questions through configured MCP tools.
- Review request logs to debug provider, model, latency, and error behavior.

## Feature Map

- AI providers: provider name, base configuration, active flag.
- MCP clients and servers: connection/config records for AI tool access.
- AI request logs: observability for prompts, responses, errors, and timing.

## Extension Guidance

- Keep provider credentials/configuration in data records or environment-backed configuration, never hard-code secrets.
- Log enough request metadata for debugging without storing sensitive content unnecessarily.
- Prefer reusable MCP tools for record access rather than module-specific ad hoc APIs.
- When adding provider support, update models, views, data, route handling, and changelog together.

## Verification

- Run `npm run check` and `npm run build` after code changes.
- Test AI chat with a configured provider and verify request logs are written.
- Test failure paths when provider keys are missing or a provider API returns an error.
