import type { ViewDefinition } from "@record-platform/core";

export const discussChannelMemberViews: ViewDefinition[] = [
  { technicalName: "discuss.channel.member.list", name: "Channel Members", model: "discuss.channel.member", type: "list", architecture: { type: "list", model: "discuss.channel.member", fields: ["channel_id", "user_id", "label", "active"] } },
  {
    technicalName: "discuss.channel.member.form",
    name: "Channel Member",
    model: "discuss.channel.member",
    type: "form",
    architecture: {
      type: "form",
      model: "discuss.channel.member",
      children: [{ type: "group", children: [{ type: "field", name: "channel_id" }, { type: "field", name: "user_id" }, { type: "field", name: "label" }, { type: "field", name: "active" }] }]
    }
  }
];