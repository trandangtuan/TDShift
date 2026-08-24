import type { ModelDefinition } from "@record-platform/core";

export const aiMcpServerModel: ModelDefinition = {
  technicalName: "ai.mcp.server",
  name: "AI MCP Server",
  tableName: "ai_mcp_server",
  fields: [
    { name: "name", label: "Name", type: "char", required: true, sequence: 10 },
    { name: "url", label: "URL", type: "char", required: true, sequence: 20 },
    { name: "auth_token_env", label: "Auth Token Env", type: "char", sequence: 30 },
    { name: "enabled_tools", label: "Enabled Tools", type: "text", sequence: 40 },
    { name: "active", label: "Active", type: "boolean", defaultValue: true, sequence: 50 }
  ]
};
