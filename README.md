# TDshift Offline ORM

Framework React Native/Expo mô phỏng kiến trúc module của Odoo trên client:

- Model khai báo bằng class, hỗ trợ kế thừa class và mở rộng registry.
- Field: Integer, Float, Char, Text, Boolean, Date, Datetime, Selection, Binary, Many2one, One2many, Many2many.
- SQLite schema được sinh tự động từ model metadata.
- Module plugin có manifest, dependencies, models, views, seed và version.
- Module Manager hỗ trợ install, update và uninstall.
- Plugin Kho vận dùng tên model/field gần Odoo để thuận tiện đồng bộ.
- Plugin POS có giao diện bán hàng, đơn giá, thanh toán và xuất kho offline.
- List/Form renderer dùng metadata, không phụ thuộc model cụ thể.
- CRUD offline với `sync_status` dành sẵn cho Sync Engine.

## Chạy

```bash
npm install
npm run android
```

Xem tài liệu đầy đủ tại [Hướng dẫn sử dụng](docs/HUONG_DAN_SU_DUNG.md).

## Viết model

```ts
export class ProductTemplate extends ProductBase {
  static override modelName = "product.template";
  static override tableName = "product_template";
  static override fields = {
    name: fields.Char({ string: "Tên", required: true }),
    price: fields.Float({ string: "Giá", default: 0 }),
    category_id: fields.Many2one("product.category"),
  };
}
```

Field trên `ProductBase` được `collectFields()` hợp nhất vào model con. Có thể dùng
`registry.extendModel(modelName, extraFields)` để module khác bổ sung field khi
không muốn kế thừa trực tiếp.

## Viết plugin

Xem `src/modules/product/index.ts`. Plugin khai báo manifest, model class,
list/form view và hook seed. Đăng ký plugin qua `ModuleManager.register()`; schema
được tạo hoặc nâng cấp khi người dùng cài/nâng cấp module.

> Gỡ module sẽ xóa bảng và dữ liệu local thuộc module sau bước xác nhận trên UI.
