# Hướng dẫn sử dụng TDshift

## 1. Chức năng hiện có

Ứng dụng là một ORM offline chạy hoàn toàn trên thiết bị. Phiên bản hiện tại có:

- SQLite làm cơ sở dữ liệu local.
- Model được định nghĩa bằng class và có thể kế thừa.
- Các field `Integer`, `Float`, `Char`, `Text`, `Boolean`, `Date`, `Many2one`,
  `One2many` và `Many2many`.
- Màn hình List và Form được sinh từ metadata.
- CRUD: tạo, xem, sửa và xóa bản ghi.
- Module plugin có thể cài đặt, nâng cấp và gỡ.
- Module Product mẫu gồm mẫu sản phẩm, biến thể, danh mục và thẻ.

Dữ liệu hiện chỉ nằm trên thiết bị. Phần đồng bộ với Odoo server chưa được triển
khai, nhưng mỗi record đã có `server_id` và `sync_status` để dùng cho bước đó.

## 2. Chạy bằng Expo Go

### Yêu cầu

- Node.js đã được cài trên máy phát triển.
- Expo Go mới nhất trên iPhone hoặc Android.
- Điện thoại và máy tính nên dùng cùng mạng Wi-Fi.

### Khởi động

Tại thư mục dự án:

```bash
npm install
npx expo start --clear
```

Sau đó quét QR code bằng Expo Go. Trên iPhone có thể quét bằng Camera hoặc trong
Expo Go. Trên Android nên dùng chức năng quét QR trong Expo Go.

Nếu điện thoại không kết nối được với máy tính qua LAN:

```bash
npx expo start --clear --tunnel
```

Dự án sử dụng Expo SDK 54 để tương thích với Expo Go trên thiết bị vật lý.

## 3. Giao diện ứng dụng

Ứng dụng có hai khu vực chính ở thanh điều hướng dưới cùng:

Nút ba gạch trên header mở danh sách menu dạng cây. Menu có thể lồng tối đa 4
cấp; nhấn menu nhóm để mở/đóng menu con và nhấn menu có model để mở list view.

### Dữ liệu

Hiển thị các model của những module đã cài đặt. Thanh model ở phía trên cho phép
chọn:

- Danh mục sản phẩm.
- Thẻ sản phẩm.
- Mẫu sản phẩm.
- Biến thể sản phẩm.

### Ứng dụng

Hiển thị danh sách plugin có trong source code và trạng thái cài đặt của chúng.
Mỗi module hỗ trợ các thao tác:

- **Cài đặt:** tạo bảng, index, bảng quan hệ và dữ liệu mẫu.
- **Nâng cấp:** cập nhật schema theo version model mới.
- **Gỡ:** xóa bảng và toàn bộ dữ liệu local thuộc module.

Gỡ module là thao tác mất dữ liệu local. Ứng dụng sẽ yêu cầu xác nhận trước khi
thực hiện.

## 4. Thao tác CRUD

### Xem và tìm kiếm

1. Chọn tab **Dữ liệu**.
2. Chọn model trên thanh ngang phía trên.
3. Danh sách record được đọc trực tiếp từ SQLite.
4. Nhập từ khóa vào ô **Tìm kiếm** để lọc các field dạng `Char` hoặc `Text`.
5. Kéo danh sách xuống để tải lại dữ liệu.

### Tạo record

1. Nhấn nút **Tạo**.
2. Điền các field trên form.
3. Với `Many2one`, chọn một record liên quan.
4. Với `Many2many`, có thể chọn nhiều giá trị.
5. Nhấn **Lưu offline**.

Record mới có trạng thái `created` và được hiển thị là **Chờ đồng bộ**.

### Sửa record

1. Nhấn vào một record trong danh sách.
2. Thay đổi dữ liệu trên form.
3. Nhấn **Lưu offline**.

Record đang ở trạng thái `created` sẽ tiếp tục giữ trạng thái đó. Record đã đồng
bộ trước đây sẽ chuyển sang `updated`.

### Xóa record

1. Nhấn biểu tượng thùng rác trên record.
2. Xác nhận thao tác xóa.

Record mới chỉ tồn tại local sẽ bị xóa khỏi SQLite. Record đã có `server_id` sẽ
được soft-delete bằng trạng thái `deleted` để Sync Engine gửi thao tác xóa lên
server sau này.

## 5. Cấu trúc source code

```text
src/
├── core/
│   ├── fields.ts          # Field descriptors
│   ├── Model.ts           # Base Model class
│   ├── ORM.ts             # CRUD và schema engine
│   ├── Registry.ts        # Model/view/plugin registry
│   ├── Environment.ts     # Truy cập model qua env
│   ├── ModuleManager.ts   # Install/update/uninstall
│   └── types.ts
├── database/
│   └── connection.ts      # SQLite và core metadata tables
├── modules/
│   └── product/           # Plugin Product mẫu
├── runtime/
│   └── runtime.ts         # Đăng ký plugin và bootstrap
└── ui/
    ├── GenericList.tsx
    ├── GenericForm.tsx
    └── ModuleScreen.tsx
```

## 6. Sử dụng ORM trong code

Lấy model từ environment:

```ts
const ProductTemplate = env.model("product.template");
```

### Tạo

```ts
const product = await ProductTemplate.create({
  name: "Bàn làm việc mới",
  list_price: 4500000,
  standard_price: 3000000,
  active: true,
});
```

### Đọc danh sách

```ts
const products = await ProductTemplate.searchRead({
  search: "Bàn",
  limit: 50,
  offset: 0,
});
```

### Đọc một record

```ts
const product = await ProductTemplate.read(localId);
```

### Cập nhật

```ts
await ProductTemplate.write(localId, {
  list_price: 4900000,
});
```

### Xóa

```ts
await ProductTemplate.unlink(localId);
```

## 7. Khai báo model mới

Tạo model bằng cách kế thừa `Model` hoặc một base model có sẵn:

```ts
import { fields } from "../../core/fields";
import { Model } from "../../core/Model";

export class SaleOrder extends Model {
  static override modelName = "sale.order";
  static override description = "Đơn bán hàng";
  static override tableName = "sale_order";
  static override modelVersion = 1;

  static override fields = {
    name: fields.Char({
      string: "Mã đơn",
      required: true,
      index: true,
    }),
    amount_total: fields.Float({
      string: "Tổng tiền",
      default: 0,
    }),
    order_date: fields.Date({
      string: "Ngày đặt hàng",
    }),
    partner_id: fields.Many2one("res.partner", {
      string: "Khách hàng",
      required: true,
    }),
    line_ids: fields.One2many("sale.order.line", "order_id", {
      string: "Chi tiết đơn hàng",
      readonly: true,
    }),
    tag_ids: fields.Many2many("sale.tag", {
      string: "Thẻ",
      relation: "sale_order_tag_rel",
    }),
  };
}
```

Ý nghĩa các thuộc tính thường dùng:

- `string`: nhãn hiển thị trên form/list.
- `required`: field bắt buộc.
- `readonly`: không cho chỉnh sửa trên generic form.
- `default`: giá trị hoặc hàm trả về giá trị mặc định.
- `index`: tạo SQLite index khi cài module.
- `help`: mô tả field dành cho UI sau này.

## 8. Kế thừa model

Field trên class cha được tự động hợp nhất vào class con:

```ts
export class BusinessModel extends Model {
  static override fields = {
    active: fields.Boolean({ string: "Hoạt động", default: true }),
  };
}

export class Customer extends BusinessModel {
  static override modelName = "res.partner";
  static override tableName = "res_partner";
  static override fields = {
    name: fields.Char({ string: "Tên", required: true }),
  };
}
```

`Customer` sẽ có cả `name` và `active`.

Một module khác cũng có thể bổ sung metadata field vào model đã đăng ký:

```ts
registry.extendModel("product.template", {
  warranty_months: fields.Integer({
    string: "Số tháng bảo hành",
    default: 0,
  }),
});
```

Sau khi bổ sung field, cần gọi update schema của model hoặc nâng version module.

## 9. Tạo module plugin

Mỗi module export một `ModulePlugin`:

```ts
export const saleModule: ModulePlugin = {
  manifest: {
    name: "sale",
    displayName: "Bán hàng",
    version: "1.0.0",
    summary: "Quản lý báo giá và đơn bán hàng",
    depends: ["product"],
  },
  models: [SaleOrder, SaleOrderLine],
  views: {
    "sale.order": {
      list: {
        type: "list",
        title: "Đơn bán hàng",
        fields: ["name", "order_date", "amount_total"],
      },
      form: {
        type: "form",
        title: "Đơn bán hàng",
        fields: ["name", "partner_id", "order_date", "line_ids"],
      },
    },
  },
};
```

Đăng ký module tại `src/runtime/runtime.ts`:

```ts
moduleManager.register(productModule);
moduleManager.register(saleModule);
```

Sau đó module xuất hiện trong tab **Ứng dụng**. Người dùng có thể cài module từ
giao diện. `depends` bảo đảm dependency được cài trước.

## 10. Nâng cấp module

Khi thêm field mới:

1. Thêm field vào model class.
2. Tăng `modelVersion`.
3. Tăng `manifest.version` của module.
4. Mở tab **Ứng dụng**.
5. Nhấn **Nâng cấp**.

Schema engine sẽ:

- Giữ nguyên bảng và dữ liệu hiện có.
- Tạo các cột chưa tồn tại.
- Tạo index và bảng Many2many mới.
- Cập nhật version trong `ir_module_module` và `ir_model`.

Phiên bản hiện tại chưa tự động xóa hoặc đổi tên cột khi nâng cấp vì đây là thao
tác có nguy cơ mất dữ liệu. Các migration phức tạp sẽ cần migration hook riêng ở
giai đoạn tiếp theo.

## 11. Xử lý lỗi thường gặp

### Project is incompatible with this version of Expo Go

Dừng server Expo cũ và chạy:

```bash
npx expo start --clear
```

Đảm bảo đang mở đúng QR code của project SDK 54 và Expo Go đã được cập nhật từ
App Store hoặc Play Store.

### Expo Go không kết nối được

```bash
npx expo start --clear --tunnel
```

Kiểm tra firewall và bảo đảm máy tính có kết nối Internet.

### Muốn tạo lại dữ liệu từ đầu

Cách an toàn nhất trong giai đoạn phát triển là xóa dữ liệu ứng dụng Expo Go trên
thiết bị hoặc gỡ module Product rồi cài lại. Lưu ý thao tác này xóa dữ liệu local.

### Không thấy model sau khi tạo plugin

Kiểm tra lần lượt:

1. Plugin đã được `moduleManager.register()` chưa.
2. Model đã có trong `plugin.models` chưa.
3. Model đã có cả list view và form view chưa.
4. Module đã được cài hoặc nâng cấp từ màn hình **Ứng dụng** chưa.

## 12. Kiểm tra project

Chạy TypeScript và Expo Doctor:

```bash
npm run typecheck
npx expo-doctor
```

Kết quả mong đợi hiện tại:

```text
TypeScript: không có lỗi
Expo Doctor: 18/18 checks passed
```
