import type { ViewDefinition } from "@record-platform/core";

export const discussChannelView: ViewDefinition[] = [
  { technicalName: "discuss.channel.list", name: "Channels", model: "discuss.channel", type: "list", architecture: { type: "list", model: "discuss.channel", fields: ["name", "description", "active"] } },
  {
    technicalName: "discuss.channel.form",
    name: "Discuss Channel",
    model: "discuss.channel",
    type: "form",
    architecture: {
      type: "form",
      model: "discuss.channel",
      children: [{ type: "group", children: [{ type: "field", name: "name" }, { type: "field", name: "description" }, { type: "field", name: "active" }, { type: "field", name: "member_ids" }] }]
    }
  }
];