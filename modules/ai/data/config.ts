import type { DataRecordDefinition } from "@record-platform/core";

export const aiConfigData: DataRecordDefinition[] = [
  {
    externalId: "ai_provider_openai",
    model: "ai.provider",
    values: { name: "OpenAI", provider_type: "openai", base_url: "https://api.openai.com/v1", api_key_env: "OPENAI_API_KEY", model_name: "gpt-4.1-mini", temperature: 0.1, active: true }
  },
  {
    externalId: "ai_provider_claude",
    model: "ai.provider",
    values: { name: "Claude", provider_type: "anthropic", base_url: "https://api.anthropic.com/v1", api_key_env: "ANTHROPIC_API_KEY", model_name: "claude-3-5-sonnet-latest", temperature: 0.1, active: true }
  },
  {
    externalId: "ai_provider_openrouter",
    model: "ai.provider",
    values: { name: "OpenRouter", provider_type: "openrouter", base_url: "https://openrouter.ai/api/v1", api_key_env: "OPENROUTER_API_KEY", model_name: "openai/gpt-4.1-mini", temperature: 0.1, active: true }
  },
  {
    externalId: "ai_mcp_server_local",
    model: "ai.mcp.server",
    values: { name: "Local Record MCP", url: "http://localhost:3100/mcp", auth_token_env: "RECORD_PLATFORM_TOKEN", enabled_tools: "list_models,read_records", active: true }
  },
  {
    externalId: "ai_mcp_client_openrouter",
    model: "ai.mcp.client",
    values: {
      name: "OpenRouter Record Assistant",
      provider_id: 3,
      mcp_server_id: 1,
      system_prompt: "You are an AI assistant inside a record-driven Odoo-like application. Use MCP tools to inspect models and search/read records before answering questions about application data. Prefer concise answers and include record ids when useful.",
      enabled_tools: "list_models,read_records",
      active: true
    }
  }
];
