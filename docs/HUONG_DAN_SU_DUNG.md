# Hướng dẫn sử dụng TDshift

## 1. Chức năng hiện có

Ứng dụng là một ORM offline chạy hoàn toàn trên thiết bị. Phiên bản hiện tại có:

- SQLite làm cơ sở dữ liệu local.
- Model được định nghĩa bằng class và có thể kế thừa.
- Các field `Integer`, `Float`, `Char`, `Text`, `Boolean`, `Date`, `Datetime`,
  `Selection`, `Binary`, `Many2one`, `One2many` và `Many2many`.
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

### Plugin Kho vận

Plugin `stock` phụ thuộc `base` và `product`, cung cấp các model tương thích tên
kỹ thuật Odoo:

- `stock.warehouse`: kho hàng.
- `stock.location`: vị trí vật lý và vị trí ảo.
- `stock.picking.type`: loại hoạt động nhập, xuất, điều chuyển.
- `stock.picking`: phiếu kho.
- `stock.move`: từng dòng dịch chuyển sản phẩm.
- `stock.quant`: số lượng tồn và số lượng giữ theo sản phẩm/vị trí.

Lần cài đầu, plugin tạo kho `WH`, vị trí nhà cung cấp/khách hàng/tồn kho, ba loại
hoạt động, một phiếu nhập mẫu và tồn đầu kỳ. Các field dùng tên Odoo như
`picking_type_id`, `location_id`, `location_dest_id`, `product_uom_qty`,
`reserved_quantity` và `state` để giảm công sức mapping khi viết Sync Engine.

### Plugin Điểm bán hàng

Plugin `point_of_sale` phụ thuộc `base`, `product` và `stock`. Menu **Điểm bán
hàng → Bán hàng** mở giao diện POS riêng:

1. Tìm sản phẩm theo tên, mã nội bộ hoặc barcode.
2. Nhấn sản phẩm để thêm vào giỏ.
3. Mở giỏ để chỉnh số lượng, đơn giá và phần trăm giảm giá.
4. Nhập tên khách hàng nếu cần.
5. Chọn Tiền mặt hoặc Chuyển khoản.
6. Nhấn **Thanh toán**.

Một lần checkout tạo `pos.order`, `pos.order.line`, `pos.payment`, phiếu
`stock.picking`, các dòng `stock.move` và điều chỉnh `stock.quant` ở cả vị trí
nguồn/đích. Các model POS dùng tên gần Odoo:

- `pos.config`: cấu hình điểm bán.
- `pos.session`: ca bán hàng.
- `pos.order`: đơn POS.
- `pos.order.line`: dòng hàng, gồm `qty`, `price_unit`, `discount`.
- `pos.payment.method`: phương thức thanh toán.
- `pos.payment`: khoản thanh toán.

Record đều có local ID, `server_id` và `sync_status`; `uuid` trên `pos.order`
được dùng làm khóa idempotency khi xây Sync Engine để tránh tạo trùng đơn.

#### Quét QR/mã vạch để nhập và xuất kho

1. Trong màn hình POS, chọn **Quét nhập kho** hoặc **Quét xuất kho**.
2. Cho phép TDshift dùng camera rồi đưa QR, EAN, Code 128 hoặc Code 39 vào khung.
3. Nếu không dùng camera, nhập trực tiếp `barcode` hoặc `default_code` của sản phẩm.
4. Mỗi lần quét cộng một đơn vị; có thể chỉnh số lượng hoặc xóa dòng.
5. Xác nhận để tạo `stock.picking`, `stock.move` và cập nhật `stock.quant` offline.

Xuất kho kiểm tra tồn khả dụng tại vị trí nguồn trước khi tạo phiếu. Phiếu quét
dùng các field chuẩn hóa theo Odoo như `picking_type_id`, `location_id`,
`location_dest_id`, `product_uom_qty`, `quantity` và trạng thái `done` để thuận
tiện đồng bộ về backend sau này.

### Plugin Đồng bộ Odoo

Mở menu **Đồng bộ Odoo → Kết nối & Đồng bộ**, sau đó:

1. Nhập URL gốc của Odoo, ví dụ `https://company.odoo.com` (không thêm `/web`).
2. Nhập tên database, tài khoản và API key. Nên tạo API key riêng trong Odoo thay vì dùng mật khẩu đăng nhập.
3. Chọn các model cần đồng bộ. Mặc định an toàn gồm danh mục, thẻ, mẫu sản phẩm và biến thể.
4. Nhấn **Kiểm tra** để xác thực kết nối.
5. Nhấn **Cập nhật schema** để tải module, model, field và view hiện có trên Odoo.
6. Tìm/chọn model remote hoặc nhập tên model custom như `x_service.order`.
7. Nhấn **Đồng bộ ngay** để đẩy thay đổi local rồi tải thay đổi từ Odoo.

Sync Engine gọi `fields_get` trước mỗi model nên chỉ gửi các field tồn tại và cho
phép ghi trên Odoo. `Many2one` và `Many2many` được đổi giữa local ID và Odoo ID;
`server_id` lưu ID phía Odoo. Trạng thái `created`, `updated`, `deleted`, `synced`
quyết định bản ghi cần push. Mỗi model có cursor `write_date` riêng để pull tăng dần.
Lỗi một bản ghi được lưu trong `sync.log` và không làm dừng các model còn lại.

#### Dynamic Schema

TDshift đọc `ir.module.module`, `ir.model`, metadata `fields_get` và `ir.ui.view`.
Metadata được lưu offline trong `sync.remote.module`, `sync.remote.model`,
`sync.remote.field` và `sync.remote.view`. Với model chưa có class mobile, ORM tạo
model runtime cùng bảng SQLite ổn định; field mới được thêm cột bằng schema update.
List/form generic lấy thứ tự field từ kiến trúc XML của view Odoo. Metadata được
khôi phục khi mở lại ứng dụng nên field custom vẫn dùng được khi offline.

Các kiểu integer, float/monetary, char, text/html, boolean, date, datetime,
selection, binary và quan hệ được ánh xạ sang field ORM. Quan hệ tới model chưa
được chọn được giữ dạng JSON để không mất Odoo ID; sau khi chọn thêm model liên
quan và cập nhật schema, ORM có thể dùng quan hệ đầy đủ.

Dynamic Schema không tải hoặc chạy mã Python, computed logic, onchange, domain,
widget JavaScript hay workflow của module Odoo. Những nghiệp vụ này cần adapter
mobile/plugin riêng; metadata động chỉ cung cấp schema, dữ liệu và giao diện CRUD
generic.

Lưu ý:

- Đồng bộ cần mạng; CRUD/POS vẫn hoạt động offline khi không có mạng.
- Web có thể bị chính sách CORS của máy chủ Odoo chặn; nên dùng ứng dụng iOS/Android hoặc reverse proxy đã cấu hình CORS.
- API key hiện lưu trong SQLite trên thiết bị. Với production nên bổ sung SecureStore/mã hóa.
- Xóa từ Odoo về thiết bị và xử lý xung đột nâng cao chưa nằm trong phiên bản đầu; khi cùng sửa hai phía, dữ liệu local chờ push được đẩy trước.
- Các workflow nghiệp vụ Odoo có ràng buộc riêng. Hãy thử với database staging trước khi bật model kho/POS.

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

### Chỉnh sửa One2many

Field `One2many` hiển thị trực tiếp danh sách record con dựa trên list view của
comodel. Nhấn **Thêm dòng** để tạo, nhấn một dòng để sửa hoặc nhấn biểu tượng
thùng rác để xóa. Inverse field được tự động gán về record cha và không bị thay
đổi khi lưu. Với record cha mới, cần lưu record cha một lần để có local ID trước
khi thêm dòng chi tiết.

### Xóa record

1. Nhấn biểu tượng thùng rác trên record.
2. Xác nhận thao tác xóa.

Record mới chỉ tồn tại local sẽ bị xóa khỏi SQLite. Record đã có `server_id` sẽ
được soft-delete bằng trạng thái `deleted` để Sync Engine gửi thao tác xóa lên
server sau này.

### Chọn file hoặc hình ảnh

Field `Binary` hiển thị hai nút **Chọn file** và **Chọn ảnh**. File được copy vào
thư mục documents riêng của ứng dụng, sau đó metadata được lưu trong model
`ir.attachment`. Hình ảnh có preview ngay trên form. Trong module Product, mở
form **Mẫu sản phẩm** để sử dụng field `image_1920`.

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
    ├── GenericList.tsx       # Chỉ điều phối list state/data
    ├── GenericForm.tsx       # Chỉ điều phối form state/data
    ├── form/                 # Một component cho mỗi field/widget
    ├── list/                 # Header, search, card, field value
    ├── menu/                 # Các component menu
    ├── module/               # Các component quản lý module
    └── navigation/           # Các component điều hướng
```

Mỗi file trong `src/ui` chỉ export một React component chính. Khi thêm widget
mới, tạo component riêng trong `src/ui/form` rồi đăng ký nhánh render trong
`FormFieldRenderer`; không viết trực tiếp widget vào `GenericForm`.

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
    document_file: fields.Binary({
      string: "Tài liệu",
      acceptedTypes: ["application/pdf", "image/*"],
      maxSize: 10 * 1024 * 1024,
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
