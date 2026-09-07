import type { ModelDefinition } from "@record-platform/core";

export const aiMcpClientModel: ModelDefinition = {
  technicalName: "ai.mcp.client",
  name: "AI MCP client",
  tableName: "ai_mcp_client",
  fields: [
    { name: "name", label: "Tên", type: "char", required: true, sequence: 10 },
    { name: "provider_id", label: "Nhà cung cấp", type: "many2one", relationModel: "ai.provider", required: true, sequence: 20 },
    { name: "mcp_server_id", label: "Máy chủ MCP", type: "many2one", relationModel: "ai.mcp.server", required: true, sequence: 30 },
    { name: "system_prompt", label: "System prompt", type: "text", sequence: 40 },
    { name: "enabled_tools", label: "Công cụ bật", type: "text", sequence: 50 },
    { name: "active", label: "Activity", type: "boolean", defaultValue: true, sequence: 60 }
  ]
};
