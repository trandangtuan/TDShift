import type { ModelDefinition } from "@record-platform/core";

export const aiMcpClientModel: ModelDefinition = {
  technicalName: "ai.mcp.client",
  name: "AI MCP Client",
  tableName: "ai_mcp_client",
  fields: [
    { name: "name", label: "Name", type: "char", required: true, sequence: 10 },
    { name: "provider_id", label: "Provider", type: "many2one", relationModel: "ai.provider", required: true, sequence: 20 },
    { name: "mcp_server_id", label: "MCP Server", type: "many2one", relationModel: "ai.mcp.server", required: true, sequence: 30 },
    { name: "system_prompt", label: "System Prompt", type: "text", sequence: 40 },
    { name: "enabled_tools", label: "Enabled Tools", type: "text", sequence: 50 },
    { name: "active", label: "Active", type: "boolean", defaultValue: true, sequence: 60 }
  ]
};
