import type { ModelDefinition } from "@record-platform/core";

export const aiRequestLogModel: ModelDefinition = {
  technicalName: "ai.request.log",
  name: "AI Request Log",
  tableName: "ai_request_log",
  fields: [
    { name: "name", label: "Name", type: "char", required: true, sequence: 10 },
    { name: "provider_id", label: "Provider", type: "many2one", relationModel: "ai.provider", sequence: 20 },
    { name: "prompt", label: "Prompt", type: "text", sequence: 30 },
    { name: "answer", label: "Answer", type: "text", sequence: 40 },
    { name: "tool_calls", label: "Tool Calls", type: "json", sequence: 50 },
    { name: "state", label: "State", type: "selection", selectionOptions: [{ label: "Done", value: "done" }, { label: "Failed", value: "failed" }], sequence: 60 },
    { name: "error", label: "Error", type: "text", sequence: 70 }
  ]
};
