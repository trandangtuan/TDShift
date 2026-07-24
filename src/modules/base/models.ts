import { fields, type FieldMap } from "../../core/fields";
import { Model } from "../../core/Model";

export class IrAttachment extends Model {
  static override modelName = "ir.attachment";
  static override description = "Tệp đính kèm";
  static override tableName = "ir_attachment";
  static override modelVersion = 1;
  static override fields: FieldMap = {
    name: fields.Char({ string: "Tên tệp", required: true, index: true }),
    mimetype: fields.Char({ string: "MIME type", index: true }),
    file_size: fields.Integer({ string: "Kích thước", default: 0 }),
    local_uri: fields.Char({ string: "Đường dẫn local", required: true }),
    original_uri: fields.Char({ string: "Đường dẫn gốc" }),
    res_model: fields.Char({ string: "Model liên kết", index: true }),
    res_id: fields.Char({ string: "Record liên kết", index: true }),
    checksum: fields.Char({ string: "Checksum" }),
    active: fields.Boolean({ string: "Hoạt động", default: true }),
  };
}
