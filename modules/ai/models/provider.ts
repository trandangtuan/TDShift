import type { ModelDefinition } from "@record-platform/core";

export const aiProviderModel: ModelDefinition = {
  technicalName: "ai.provider",
  name: "Provider AI",
  tableName: "ai_provider",
  fields: [
    { name: "name", label: "Tên", type: "char", required: true, sequence: 10 },
    {
      name: "provider_type",
      label: "Nhà cung cấp",
      type: "selection",
      required: true,
      defaultValue: "openai",
      selectionOptions: [
        { label: "OpenAI / ChatGPT", value: "openai" },
        { label: "Claude", value: "anthropic" },
        { label: "OpenRouter", value: "openrouter" }
      ],
      sequence: 20
    },
    { name: "base_url", label: "Nền tảng URL", type: "char", sequence: 30 },
    { name: "api_key_env", label: "Biến API key", type: "char", required: true, sequence: 40 },
    { name: "model_name", label: "Model", type: "char", required: true, sequence: 50 },
    { name: "temperature", label: "Nhiệt độ", type: "decimal", defaultValue: 0.1, sequence: 60 },
    { name: "active", label: "Activity", type: "boolean", defaultValue: true, sequence: 70 }
  ]
};
