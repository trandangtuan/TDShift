import type { ModelDefinition } from "@record-platform/core";
import { discussChannelAccessRule } from "../access";

export const discussChannelModel: ModelDefinition = {
  technicalName: "discuss.channel",
  name: "Discuss Channel",
  tableName: "discuss_channel",
  accessRule: discussChannelAccessRule,
  fields: [
    { name: "name", label: "Channel Name", type: "char", required: true, sequence: 10 },
    { name: "description", label: "Description", type: "text", sequence: 20 },
    { name: "member_ids", label: "Members", type: "one2many", relationModel: "discuss.channel.member", inverseField: "channel_id", stored: false, sequence: 30 },
    { name: "message_ids", label: "Messages", type: "one2many", relationModel: "discuss.message", inverseField: "channel_id", stored: false, sequence: 40 },
    { name: "active", label: "Active", type: "boolean", defaultValue: true, sequence: 50 }
  ]
};