import type { ModelDefinition } from "@record-platform/core";
import { discussChannelMemberAccessRule } from "../access";

export const discussChannelMemberModel: ModelDefinition = {
  technicalName: "discuss.channel.member",
  name: "Discuss Channel Member",
  tableName: "discuss_channel_member",
  accessRule: discussChannelMemberAccessRule,
  fields: [
    { name: "channel_id", label: "Channel", type: "many2one", relationModel: "discuss.channel", required: true, indexed: true, sequence: 10 },
    { name: "user_id", label: "User", type: "many2one", relationModel: "core.user", required: true, indexed: true, sequence: 20 },
    { name: "label", label: "Label", type: "char", sequence: 30 },
    { name: "active", label: "Active", type: "boolean", defaultValue: true, sequence: 40 }
  ]
};