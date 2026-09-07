import type { ModelDefinition } from "@record-platform/core";

export const aiMcpServerModel: ModelDefinition = {
  technicalName: "ai.mcp.server",
  name: "AI Máy chủ MCP",
  tableName: "ai_mcp_server",
  fields: [
    { name: "name", label: "Tên", type: "char", required: true, sequence: 10 },
    { name: "url", label: "URL", type: "char", required: true, sequence: 20 },
    { name: "auth_token_env", label: "Auth Token Env", type: "char", sequence: 30 },
    { name: "enabled_tools", label: "Công cụ bật", type: "text", sequence: 40 },
    { name: "active", label: "Activity", type: "boolean", defaultValue: true, sequence: 50 }
  ]
};
