import type { ModelDefinition } from "@record-platform/core";
import { discussMessageAccessRule } from "../access";

export const discussMessageModel: ModelDefinition = {
  technicalName: "discuss.message",
  name: "Discuss Message",
  tableName: "discuss_message",
  accessRule: discussMessageAccessRule,
  fields: [
    { name: "channel_id", label: "Channel", type: "many2one", relationModel: "discuss.channel", required: true, indexed: true, sequence: 10 },
    { name: "author_id", label: "Author", type: "many2one", relationModel: "core.user", required: true, indexed: true, sequence: 20 },
    { name: "body", label: "Message", type: "text", required: true, sequence: 30 },
    { name: "sent_at", label: "Sent At", type: "datetime", sequence: 40 },
    { name: "active", label: "Activity", type: "boolean", defaultValue: true, sequence: 50 }
  ]
};