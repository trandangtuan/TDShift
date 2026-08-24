# Record Platform MCP Server

MCP client adapter for reading and editing records through the authenticated Record Platform API.

The Record Platform server also exposes the same tools through Streamable HTTP at `http://localhost:3100/mcp`.

## Run locally

Start the Record Platform server first, then export a Bearer token returned by `/api/auth/login`:

```bash
export RECORD_PLATFORM_API_URL=http://localhost:3100
export RECORD_PLATFORM_TOKEN='your-bearer-token'
npm run start -w @record-platform/mcp
```

This adapter uses stdio transport. Add the same command and environment variables to Claude Desktop, VS Code MCP, or another local MCP client. The workspace includes `.vscode/mcp.json`; VS Code prompts for the token without storing it in the file.

For ChatGPT or a remote MCP client, deploy the Record Platform server behind HTTPS and configure the MCP URL as:

```text
https://your-domain.example/mcp
```

The HTTP endpoint uses the `Authorization: Bearer <token>` header and keeps stateful sessions in server memory. Restarting the server invalidates active sessions.

## Tools

- `list_models`: discover models and fields
- `read_records`: search and read records
- `create_record`: create a record
- `update_records`: update records by ID
- `delete_records`: delete records by ID

All operations use the existing Record Platform API and Bearer-token authorization.
