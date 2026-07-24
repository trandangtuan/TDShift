import type { ModulePlugin } from "../../core/types";
import { SyncConfig, SyncLog, SyncModelState, SyncRemoteField, SyncRemoteModel, SyncRemoteModule, SyncRemoteView } from "./models";

export const syncModule: ModulePlugin = {
  manifest: {
    name: "odoo_sync",
    displayName: "Đồng bộ Odoo",
    version: "1.1.0",
    summary: "Đồng bộ hai chiều dữ liệu offline với Odoo qua JSON-RPC",
    depends: ["base", "product"],
    autoInstall: true,
  },
  models: [SyncConfig, SyncModelState, SyncLog, SyncRemoteModule, SyncRemoteModel, SyncRemoteField, SyncRemoteView],
  menus: [
    { id: "sync.menu_root", name: "Đồng bộ Odoo", sequence: 80, icon: "cloud-done-outline" },
    { id: "sync.menu_dashboard", name: "Kết nối & Đồng bộ", parentId: "sync.menu_root", sequence: 10, screen: "odoo.sync" },
    { id: "sync.menu_logs", name: "Nhật ký", parentId: "sync.menu_root", sequence: 20, modelName: "sync.log" },
    { id: "sync.menu_states", name: "Trạng thái model", parentId: "sync.menu_root", sequence: 30, modelName: "sync.model.state" },
    { id: "sync.menu_metadata", name: "Dynamic Schema", parentId: "sync.menu_root", sequence: 40 },
    { id: "sync.menu_remote_modules", name: "Modules Odoo", parentId: "sync.menu_metadata", sequence: 10, modelName: "sync.remote.module" },
    { id: "sync.menu_remote_models", name: "Models Odoo", parentId: "sync.menu_metadata", sequence: 20, modelName: "sync.remote.model" },
    { id: "sync.menu_remote_fields", name: "Fields Odoo", parentId: "sync.menu_metadata", sequence: 30, modelName: "sync.remote.field" },
    { id: "sync.menu_remote_views", name: "Views Odoo", parentId: "sync.menu_metadata", sequence: 40, modelName: "sync.remote.view" },
  ],
  views: {
    "sync.config": {
      list: { type: "list", title: "Kết nối Odoo", fields: ["name", "url", "database", "last_sync_at", "schema_refreshed_at", "active"] },
      form: { type: "form", title: "Kết nối Odoo", fields: ["name", "url", "database", "username", "api_key", "enabled_models", "batch_size", "last_sync_at", "schema_refreshed_at", "last_error", "active"] },
    },
    "sync.model.state": {
      list: { type: "list", title: "Trạng thái đồng bộ", fields: ["model_name", "last_sync_at", "pushed_count", "pulled_count", "error_count"] },
      form: { type: "form", title: "Trạng thái đồng bộ", fields: ["config_id", "model_name", "last_server_write_date", "last_sync_at", "pushed_count", "pulled_count", "error_count", "active"] },
    },
    "sync.log": {
      list: { type: "list", title: "Nhật ký đồng bộ", fields: ["logged_at", "level", "operation", "model_name", "name"] },
      form: { type: "form", title: "Nhật ký đồng bộ", fields: ["name", "config_id", "model_name", "local_id", "server_id_value", "operation", "level", "details", "logged_at", "active"] },
    },
    "sync.remote.module": {
      list: { type: "list", title: "Modules Odoo", fields: ["technical_name", "display_name", "server_state", "server_version"] },
      form: { type: "form", title: "Module Odoo", fields: ["technical_name", "display_name", "server_module_id", "server_state", "server_version", "last_seen_at", "active"] },
    },
    "sync.remote.model": {
      list: { type: "list", title: "Models Odoo", fields: ["model_name", "display_name", "modules", "is_dynamic"] },
      form: { type: "form", title: "Model Odoo", fields: ["model_name", "display_name", "server_model_id", "modules", "table_name", "is_dynamic", "last_seen_at", "active"] },
    },
    "sync.remote.field": {
      list: { type: "list", title: "Fields Odoo", fields: ["model_name", "field_name", "field_label", "odoo_type", "relation_model"] },
      form: { type: "form", title: "Field Odoo", fields: ["model_name", "field_name", "field_label", "odoo_type", "relation_model", "relation_field", "selection_json", "required_value", "readonly_value", "last_seen_at", "active"] },
    },
    "sync.remote.view": {
      list: { type: "list", title: "Views Odoo", fields: ["model_name", "name", "view_type", "priority"] },
      form: { type: "form", title: "View Odoo", fields: ["model_name", "server_view_id", "name", "view_type", "priority", "arch_db", "field_names_json", "last_seen_at", "active"] },
    },
  },
};
