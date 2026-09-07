import type { ModelDefinition } from "@record-platform/core";

export const aiRequestLogModel: ModelDefinition = {
  technicalName: "ai.request.log",
  name: "Nhật ký yêu cầu AI",
  tableName: "ai_request_log",
  fields: [
    { name: "name", label: "Tên", type: "char", required: true, sequence: 10 },
    { name: "provider_id", label: "Nhà cung cấp", type: "many2one", relationModel: "ai.provider", sequence: 20 },
    { name: "prompt", label: "Prompt", type: "text", sequence: 30 },
    { name: "answer", label: "Câu trả lời", type: "text", sequence: 40 },
    { name: "tool_calls", label: "Lượt gọi công cụ", type: "json", sequence: 50 },
    { name: "state", label: "Trạng thái", type: "selection", selectionOptions: [{ label: "Hoàn tất", value: "done" }, { label: "Failed", value: "failed" }], sequence: 60 },
    { name: "error", label: "Lỗi", type: "text", sequence: 70 }
  ]
};
