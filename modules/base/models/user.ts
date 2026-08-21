import type { ModelDefinition } from "@record-platform/core";

export const userModel: ModelDefinition = {
  technicalName: "core.user",
  name: "User",
  tableName: "core_user",
  fields: [
    { name: "login", label: "Login", type: "char", required: true, indexed: true, sequence: 10 },
    { name: "name", label: "Name", type: "char", required: true, sequence: 20 },
    { name: "email", label: "Email", type: "char", sequence: 30 },
    { name: "password", label: "Password", type: "char", required: true, stored: false, sequence: 40 },
    { name: "password_hash", label: "Password Hash", type: "char", required: true, readonly: true, sequence: 50 },
    { name: "token_version", label: "Token Version", type: "integer", readonly: true, sequence: 60 },
    { name: "api_token", label: "API Token", type: "char", readonly: true, sequence: 70 },
    { name: "active", label: "Active", type: "boolean", defaultValue: true, sequence: 80 }
  ]
};
