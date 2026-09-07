import type { ViewDefinition } from "@record-platform/core";

export const aiMcpClientView: ViewDefinition[] = [
  { technicalName: "ai.mcp.client.list", name: "MCP client", model: "ai.mcp.client", type: "list", architecture: { type: "list", model: "ai.mcp.client", fields: ["name", "provider_id", "mcp_server_id", "enabled_tools", "active"] } },
  {
    technicalName: "ai.mcp.client.form",
    name: "MCP client",
    model: "ai.mcp.client",
    type: "form",
    architecture: {
      type: "form",
      model: "ai.mcp.client",
      children: [{ type: "group", children: [{ type: "field", name: "name" }, { type: "field", name: "provider_id" }, { type: "field", name: "mcp_server_id" }, { type: "field", name: "system_prompt" }, { type: "field", name: "enabled_tools" }, { type: "field", name: "active" }] }]
    }
  }
];
