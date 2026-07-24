import { fields, type FieldMap } from "../../core/fields";
import { Model } from "../../core/Model";

export class SyncConfig extends Model {
  static override modelName = "sync.config";
  static override description = "Cấu hình đồng bộ Odoo";
  static override tableName = "sync_config";
  static override fields: FieldMap = {
    name: fields.Char({ string: "Tên kết nối", required: true, default: "Odoo chính" }),
    url: fields.Char({ string: "URL Odoo", required: true }),
    database: fields.Char({ string: "Database", required: true }),
    username: fields.Char({ string: "Tài khoản", required: true }),
    api_key: fields.Char({ string: "API key / mật khẩu", required: true }),
    enabled_models: fields.Text({ string: "Model đồng bộ" }),
    batch_size: fields.Integer({ string: "Số bản ghi mỗi lượt", default: 50 }),
    active: fields.Boolean({ string: "Hoạt động", default: true, index: true }),
    last_sync_at: fields.Datetime({ string: "Lần đồng bộ cuối" }),
    schema_refreshed_at: fields.Datetime({ string: "Cập nhật schema cuối" }),
    last_error: fields.Text({ string: "Lỗi gần nhất" }),
  };
}

export class SyncModelState extends Model {
  static override modelName = "sync.model.state";
  static override description = "Trạng thái đồng bộ model";
  static override tableName = "sync_model_state";
  static override fields: FieldMap = {
    config_id: fields.Many2one("sync.config", { string: "Kết nối", required: true, index: true }),
    model_name: fields.Char({ string: "Model", required: true, index: true }),
    last_server_write_date: fields.Datetime({ string: "Mốc pull gần nhất" }),
    last_sync_at: fields.Datetime({ string: "Lần chạy gần nhất" }),
    pushed_count: fields.Integer({ string: "Đã đẩy", default: 0 }),
    pulled_count: fields.Integer({ string: "Đã tải", default: 0 }),
    error_count: fields.Integer({ string: "Số lỗi", default: 0 }),
    active: fields.Boolean({ string: "Hoạt động", default: true }),
  };
}

export class SyncLog extends Model {
  static override modelName = "sync.log";
  static override description = "Nhật ký đồng bộ";
  static override tableName = "sync_log";
  static override fields: FieldMap = {
    name: fields.Char({ string: "Nội dung", required: true }),
    config_id: fields.Many2one("sync.config", { string: "Kết nối", index: true }),
    model_name: fields.Char({ string: "Model", index: true }),
    local_id: fields.Char({ string: "Local ID", index: true }),
    server_id_value: fields.Integer({ string: "Odoo ID", index: true }),
    operation: fields.Selection([["connect", "Kết nối"], ["push", "Đẩy"], ["pull", "Tải"], ["sync", "Đồng bộ"]], { string: "Thao tác", required: true }),
    level: fields.Selection([["info", "Thông tin"], ["success", "Thành công"], ["error", "Lỗi"]], { string: "Mức độ", required: true, default: "info" }),
    details: fields.Text({ string: "Chi tiết" }),
    logged_at: fields.Datetime({ string: "Thời gian", default: () => new Date().toISOString(), index: true }),
    active: fields.Boolean({ string: "Hoạt động", default: true }),
  };
}

export class SyncRemoteModule extends Model {
  static override modelName = "sync.remote.module";
  static override description = "Module Odoo remote";
  static override tableName = "sync_remote_module";
  static override fields: FieldMap = {
    config_id: fields.Many2one("sync.config", { string: "Kết nối", required: true, index: true }),
    technical_name: fields.Char({ string: "Tên kỹ thuật", required: true, index: true }),
    display_name: fields.Char({ string: "Tên module" }),
    server_module_id: fields.Integer({ string: "Odoo ID", index: true }),
    server_state: fields.Char({ string: "Trạng thái" }),
    server_version: fields.Char({ string: "Phiên bản" }),
    last_seen_at: fields.Datetime({ string: "Cập nhật metadata" }),
    active: fields.Boolean({ string: "Hoạt động", default: true }),
  };
}

export class SyncRemoteModel extends Model {
  static override modelName = "sync.remote.model";
  static override description = "Model Odoo remote";
  static override tableName = "sync_remote_model";
  static override fields: FieldMap = {
    config_id: fields.Many2one("sync.config", { string: "Kết nối", required: true, index: true }),
    model_name: fields.Char({ string: "Tên model", required: true, index: true }),
    display_name: fields.Char({ string: "Tên hiển thị" }),
    server_model_id: fields.Integer({ string: "Odoo ID", index: true }),
    modules: fields.Text({ string: "Modules" }),
    table_name: fields.Char({ string: "Bảng SQLite", required: true }),
    is_dynamic: fields.Boolean({ string: "Model động", default: true }),
    last_seen_at: fields.Datetime({ string: "Cập nhật metadata" }),
    active: fields.Boolean({ string: "Hoạt động", default: true }),
  };
}

export class SyncRemoteField extends Model {
  static override modelName = "sync.remote.field";
  static override description = "Field Odoo remote";
  static override tableName = "sync_remote_field";
  static override fields: FieldMap = {
    config_id: fields.Many2one("sync.config", { string: "Kết nối", required: true, index: true }),
    model_name: fields.Char({ string: "Model", required: true, index: true }),
    field_name: fields.Char({ string: "Tên field", required: true, index: true }),
    field_label: fields.Char({ string: "Nhãn" }),
    odoo_type: fields.Char({ string: "Kiểu Odoo", required: true }),
    relation_model: fields.Char({ string: "Model quan hệ" }),
    relation_field: fields.Char({ string: "Field ngược" }),
    selection_json: fields.Text({ string: "Selection JSON" }),
    required_value: fields.Boolean({ string: "Bắt buộc", default: false }),
    readonly_value: fields.Boolean({ string: "Chỉ đọc", default: false }),
    last_seen_at: fields.Datetime({ string: "Cập nhật metadata" }),
    active: fields.Boolean({ string: "Hoạt động", default: true }),
  };
}

export class SyncRemoteView extends Model {
  static override modelName = "sync.remote.view";
  static override description = "View Odoo remote";
  static override tableName = "sync_remote_view";
  static override fields: FieldMap = {
    config_id: fields.Many2one("sync.config", { string: "Kết nối", required: true, index: true }),
    model_name: fields.Char({ string: "Model", required: true, index: true }),
    server_view_id: fields.Integer({ string: "Odoo ID", required: true, index: true }),
    name: fields.Char({ string: "Tên view", required: true }),
    view_type: fields.Char({ string: "Loại view", required: true, index: true }),
    priority: fields.Integer({ string: "Ưu tiên", default: 16 }),
    arch_db: fields.Text({ string: "Kiến trúc XML" }),
    field_names_json: fields.Text({ string: "Danh sách field" }),
    last_seen_at: fields.Datetime({ string: "Cập nhật metadata" }),
    active: fields.Boolean({ string: "Hoạt động", default: true }),
  };
}
