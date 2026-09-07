import type { ViewDefinition } from "@record-platform/core";

export const aiRequestLogView: ViewDefinition[] = [
  { technicalName: "ai.request.log.list", name: "AI Nhật ký yêu cầu", model: "ai.request.log", type: "list", architecture: { type: "list", model: "ai.request.log", fields: ["name", "provider_id", "state", "create_date"] } },
  {
    technicalName: "ai.request.log.form",
    name: "Nhật ký yêu cầu AI",
    model: "ai.request.log",
    type: "form",
    architecture: {
      type: "form",
      model: "ai.request.log",
      children: [{ type: "group", children: [{ type: "field", name: "name" }, { type: "field", name: "provider_id" }, { type: "field", name: "prompt" }, { type: "field", name: "answer" }, { type: "field", name: "tool_calls" }, { type: "field", name: "state" }, { type: "field", name: "error" }] }]
    }
  }
];
