import type { ViewDefinition } from "@record-platform/core";

export const aiProviderView: ViewDefinition[] = [
  { technicalName: "ai.provider.list", name: "Provider AI", model: "ai.provider", type: "list", architecture: { type: "list", model: "ai.provider", fields: ["name", "provider_type", "model_name", "api_key_env", "active"] } },
  {
    technicalName: "ai.provider.form",
    name: "Provider AI",
    model: "ai.provider",
    type: "form",
    architecture: {
      type: "form",
      model: "ai.provider",
      children: [{ type: "group", children: [{ type: "field", name: "name" }, { type: "field", name: "provider_type" }, { type: "field", name: "base_url" }, { type: "field", name: "api_key_env" }, { type: "field", name: "model_name" }, { type: "field", name: "temperature" }, { type: "field", name: "active" }] }]
    }
  }
];
