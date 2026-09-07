import type { ViewDefinition } from "@record-platform/core";

export const discussMessageView: ViewDefinition[] = [
  { technicalName: "discuss.message.list", name: "Messages", model: "discuss.message", type: "list", architecture: { type: "list", model: "discuss.message", fields: ["channel_id", "author_id", "body", "sent_at", "active"] } },
  {
    technicalName: "discuss.message.form",
    name: "Discuss Message",
    model: "discuss.message",
    type: "form",
    architecture: {
      type: "form",
      model: "discuss.message",
      children: [{ type: "group", children: [{ type: "field", name: "channel_id" }, { type: "field", name: "author_id" }, { type: "field", name: "body" }, { type: "field", name: "sent_at" }, { type: "field", name: "active" }] }]
    }
  }
];