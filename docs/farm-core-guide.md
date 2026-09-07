# Hướng dẫn sử dụng Farm Core

`farm_core` là module nền tảng cho quản lý trang trại đa ngành. Module dùng chung cho chăn nuôi trên cạn và nuôi trồng thủy sản, không hard-code khái niệm "chuồng".

## Cài module

`farm_core` phụ thuộc vào `base` và `contacts`.

1. Đăng nhập vào đúng database cần sử dụng.
2. Mở `Settings > Technical > Modules`.
3. Tìm `Farm Core`.
4. Chọn `Install`.
5. Làm mới menu nếu giao diện chưa cập nhật.

Mỗi database có module state riêng. Cài `farm_core` trong database A không cài module trong database B.

## Thứ tự thiết lập

Thiết lập dữ liệu theo thứ tự:

```text
Farm
  -> Area
    -> Production Unit
Species
  -> Breed
Production Batch
```

### 1. Farm

Vào `Farm > Configuration > Farms`.

Khai báo:

- Tên và mã trang trại.
- Địa chỉ.
- Người quản lý.
- Diện tích.
- Loại hình: `Animal Farming` hoặc `Aquaculture`.
- Trạng thái: `Active`, `Paused`, `Closed`.

### 2. Area

Vào `Farm > Configuration > Areas`.

Mỗi Area thuộc một Farm và có:

- Tên, mã.
- Trang trại.
- Diện tích.
- Loại khu: `Animal`, `Aquaculture`, `Mixed`.
- Người phụ trách.

### 3. Production Unit

Vào `Farm > Configuration > Production Units`.

Production Unit là nơi trực tiếp chứa đàn/vật nuôi. Có thể khai báo:

- `Barn`: chuồng.
- `House`: nhà nuôi.
- `Pond`: ao.
- `Tank`: bể.
- `Cage`: lồng.
- `Other`: loại khác.

Mỗi unit thuộc một Area và có sức chứa, diện tích, người phụ trách, trạng thái.

### 4. Species

Vào `Farm > Configuration > Species`.

Species là loại vật nuôi, ví dụ:

- Pig.
- Chicken.
- Duck.
- Cattle.
- Fish.
- Shrimp.

Có thể cấu hình loại hình sản xuất, đơn vị số lượng, đơn vị trọng lượng, theo dõi cá thể và theo dõi sinh sản.

### 5. Breed

Vào `Farm > Configuration > Breeds`.

Mỗi Breed phải thuộc một Species. Có thể khai báo nhà cung cấp và đặc điểm giống.

## Quy trình tạo lứa nuôi

Vào `Farm > Operations > Production Batches`.

Khai báo:

- Tên và mã lứa.
- Species và Breed.
- Farm, Area, Production Unit.
- Ngày bắt đầu.
- Số lượng ban đầu.
- Trọng lượng ban đầu.
- Nhà cung cấp và giá nhập.
- Người phụ trách.
- Trạng thái.

Trạng thái hiện có:

```text
Draft -> Planned -> Active -> Completed
                         \-> Cancelled
```

Ở phiên bản hiện tại, trạng thái là dữ liệu lựa chọn; nút chuyển trạng thái tự động sẽ được bổ sung trong module nghiệp vụ tiếp theo.

## Ghi nhận vận hành

### Di chuyển đàn

Vào `Farm > Operations > Batch Movements`.

Ghi nhận:

- Lứa nuôi.
- Production Unit đi và đến.
- Số lượng.
- Ngày chuyển.
- Lý do.
- Người thực hiện.

Mỗi phiếu là lịch sử chuyển. Việc tự động trừ/cộng tồn đàn sẽ được bổ sung cùng nghiệp vụ quantity ledger.

### Tăng trưởng

Vào `Farm > Operations > Growth Measurements`.

Ghi nhận:

- Lứa nuôi.
- Ngày cân.
- Số lượng mẫu.
- Tổng trọng lượng.
- Trọng lượng trung bình.
- ADG.
- Người thực hiện.
- Ghi chú.

ADG hiện có thể nhập trực tiếp. Công thức tự động theo các lần cân sẽ thuộc module báo cáo/tăng trưởng nâng cao.

### Hao hụt

Vào `Farm > Operations > Mortality`.

Ghi nhận:

- Lứa nuôi.
- Production Unit.
- Ngày.
- Số lượng hao hụt.
- Trọng lượng.
- Nguyên nhân: bệnh, tai nạn, môi trường, không rõ, khác.
- Ghi chú.

## Phạm vi hiện tại

`farm_core` hiện cung cấp model, menu, list view, form view và CRUD metadata cho phần lõi. Các phần sau sẽ là module mở rộng:

- `farm_feeding`: thức ăn, định mức, FCR.
- `farm_health`: thuốc, điều trị, vaccine.
- `farm_environment`: nhiệt độ, pH, DO, độ ẩm và IoT.
- `farm_costing`: chi phí, giá thành, doanh thu, lợi nhuận.
- `farm_reporting`: dashboard và báo cáo.
- `farm_pig`, `farm_chicken`, `farm_aquaculture`: nghiệp vụ chuyên ngành.

## Kiểm tra database

Sau khi cài module ở database đang đăng nhập, mở danh sách Models và tìm các model bắt đầu bằng `farm.`.

Khi chuyển sang database khác:

1. Đăng xuất.
2. Chọn database khác ở màn hình đăng nhập.
3. Kiểm tra `Settings > Technical > Modules`.
4. Chỉ database đã cài `Farm Core` mới có các model `farm.*`.

Mỗi database có module state, metadata, schema và records riêng.
