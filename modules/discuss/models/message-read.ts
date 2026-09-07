import type { ModelDefinition } from "@record-platform/core";
import { discussMessageReadAccessRule } from "../access";

export const discussMessageReadModel: ModelDefinition = {
  technicalName: "discuss.message.read",
  name: "Discuss Message Read Receipt",
  tableName: "discuss_message_read",
  accessRule: discussMessageReadAccessRule,
  fields: [
    { name: "message_id", label: "Message", type: "many2one", relationModel: "discuss.message", required: true, indexed: true, sequence: 10 },
    { name: "user_id", label: "Người dùng", type: "many2one", relationModel: "core.user", required: true, indexed: true, sequence: 20 },
    { name: "read_at", label: "Read At", type: "datetime", required: true, sequence: 30 }
  ]
};