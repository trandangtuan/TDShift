import type { ViewDefinition } from "@record-platform/core";

export const aiMcpServerView: ViewDefinition[] = [
  { technicalName: "ai.mcp.server.list", name: "Máy chủ MCP", model: "ai.mcp.server", type: "list", architecture: { type: "list", model: "ai.mcp.server", fields: ["name", "url", "auth_token_env", "active"] } },
  {
    technicalName: "ai.mcp.server.form",
    name: "Máy chủ MCP",
    model: "ai.mcp.server",
    type: "form",
    architecture: {
      type: "form",
      model: "ai.mcp.server",
      children: [{ type: "group", children: [{ type: "field", name: "name" }, { type: "field", name: "url" }, { type: "field", name: "auth_token_env" }, { type: "field", name: "enabled_tools" }, { type: "field", name: "active" }] }]
    }
  }
];
