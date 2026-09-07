import type { ModelDefinition } from "@record-platform/core";

export const userModel: ModelDefinition = {
  technicalName: "core.user",
  name: "Người dùng",
  tableName: "core_user",
  fields: [
    { name: "login", label: "Đăng nhập", type: "char", required: true, indexed: true, sequence: 10 },
    { name: "name", label: "Tên", type: "char", required: true, sequence: 20 },
    { name: "email", label: "Email", type: "char", sequence: 30 },
    { name: "phone", label: "Điện thoại", type: "char", sequence: 40 },
    { name: "password", label: "Mật khẩu", type: "char", required: true, stored: false, sequence: 50 },
    { name: "password_hash", label: "Hash mật khẩu", type: "char", required: true, readonly: true, sequence: 60 },
    { name: "token_version", label: "Token Phiên bản", type: "integer", readonly: true, sequence: 70 },
    { name: "api_token", label: "API token", type: "char", readonly: true, sequence: 80 },
    { name: "active", label: "Activity", type: "boolean", defaultValue: true, sequence: 90 }
  ]
};
