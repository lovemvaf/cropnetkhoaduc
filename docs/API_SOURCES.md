# DANH MỤC API & DỊCH VỤ DỮ LIỆU TÍCH HỢP (API SOURCES & CONTRACTS)

Tài liệu này lưu trữ danh mục toàn bộ các endpoint API nội bộ, giao diện dịch vụ bên ngoài, cơ chế bảo vệ xác thực, hạn mức (rate limit) và giải pháp dự phòng (fallback) trên nền tảng **CropNet Đồng Nai AI**.

---

## 1. NGUYÊN TẮC QUẢN LÝ API (SECURITY & ACCESS GOVERNANCE)

1. **Bảo mật Fail-Closed:**
   - Trong môi trường sản xuất (`NODE_ENV=production`), toàn bộ secret khóa JWT bắt buộc phải có độ dài tối thiểu 32 ký tự ngẫu nhiên; không chấp nhận secret mặc định.
   - Các API nhạy cảm (Tải tệp, Quản trị, Lập lô truy xuất) yêu cầu xác thực JWT qua HTTP-Only Cookie hoặc Bearer Header.
2. **Giới Hạn Tần Suất (Rate Limiting):**
   - Áp dụng `express-rate-limit` toàn cục: Tối đa **150 yêu cầu / 15 phút** cho mỗi địa chỉ IP nhằm ngăn chặn tấn công từ chối dịch vụ (DoS) hoặc cào dữ liệu trái phép.
3. **Cơ chế hoạt động kép (Dual-Mode Architecture):**
   - Khi có kết nối cơ sở dữ liệu PostgreSQL / Prisma: Thực thi trực tiếp trên database.
   - Khi chạy chế độ đánh giá độc lập / chấm thi offline: Tự động kích hoạt bộ nhớ `dbFallback` chứa 100% dữ liệu thực thể Hợp tác xã Đồng Nai, không bao giờ bị gián đoạn hoạt động.

---

## 2. BẢNG CHI TIẾT CÁC ENDPOINT API CỦA HỆ THỐNG

### Nhóm 1: Trí Tuệ Nhân Tạo & Bán Hàng Thông Minh (`/api/ai`)

| Phương Thức | Đường Dẫn | Mục Đích | Yêu Cầu Xác Thực | Cơ Chế Dự Phòng (Fallback) | Trạng Thái Smoke Test |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `POST` | `/api/ai/chat` | Trò chuyện tư vấn nông sản, bắt intent & trả lời | Public | Hybrid Deterministic Expert Engine | **PASS (200 OK)** |
| `POST` | `/api/ai/recommend-budget` | Tối ưu hóa giỏ hàng theo ngân sách ≤ user budget | Public | Thuật toán tối ưu giỏ hàng cục bộ | **PASS (200 OK)** |
| `GET` | `/api/ai/seasonal-calendar` | Lấy lịch mùa vụ 12 tháng của cây ăn trái Đồng Nai | Public | Dữ liệu mùa vụ cố định từ CSDL | **PASS (200 OK)** |
| `GET` | `/api/ai/cooperatives` | Danh sách 2 HTX thật: Tân Triều & Long Khánh | Public | Danh mục HTX xác minh | **PASS (200 OK)** |
| `POST` | `/api/ai/draft-rfq` | Tạo bản thảo báo giá sỉ cho khách hàng doanh nghiệp | Public | Tự động sinh mã `RFQ-DN-xxxxxx` | **PASS (201 Created)** |

---

### Nhóm 2: Nông Sản & Danh Mục (`/api/products`, `/api/categories`)

| Phương Thức | Đường Dẫn | Mục Đích | Yêu Cầu Xác Thực | Cơ Chế Dự Phòng | Trạng Thái Smoke Test |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `GET` | `/api/products` | Lấy danh sách nông sản (lọc theo danh mục, từ khóa) | Public | Trả về 6 sản phẩm OCOP Đồng Nai | **PASS (200 OK)** |
| `GET` | `/api/products/:id` | Xem chi tiết sản phẩm, biến thể, mã lô liên kết | Public | Trả về sản phẩm cụ thể hoặc 404 (Không fallback bừa) | **PASS (200 OK)** |
| `POST` | `/api/products` | Thêm sản phẩm mới của nhà vườn | FARMER / ADMIN | Cập nhật CSDL | **PASS (201 Created)** |
| `GET` | `/api/categories` | Lấy danh mục sản phẩm (Trái cây, Chế biến, Rau củ) | Public | Trả về 3 danh mục Đồng Nai | **PASS (200 OK)** |

---

### Nhóm 3: Truy Xuất Nguồn Gốc QR (`/api/traceability`)

| Phương Thức | Đường Dẫn | Mục Đích | Yêu Cầu Xác Thực | Cơ Chế Dự Phòng | Trạng Thái Smoke Test |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `GET` | `/api/traceability/batches/:batchCode` | Xem hồ sơ lô hàng, nhật ký canh tác, kiểm định | Public | Fail-closed: 404 nếu mã tem không có thật | **PASS (200 OK)** |
| `POST` | `/api/traceability/batches` | Khởi tạo lô hàng mới và sinh mã QR tự động | FARMER / ADMIN | Sinh mã chuẩn `BATCH-xxx-2026-xx` | **PASS (201 Created)** |
| `POST` | `/api/traceability/inspections` | Đăng tải báo cáo kiểm định phòng lab độc lập | INSPECTOR / ADMIN | Cập nhật hồ sơ kiểm nghiệm | **PASS (201 Created)** |

---

### Nhóm 4: Đơn Hàng & Thanh Toán (`/api/orders`, `/api/payments`)

| Phương Thức | Đường Dẫn | Mục Đích | Yêu Cầu Xác Thực | Cơ Chế Dự Phòng | Trạng Thái Smoke Test |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `POST` | `/api/orders` | Đặt hàng D2C (Khóa tồn kho chống oversell) | CUSTOMER | Atomic decrement tồn kho | **PASS (201 Created)** |
| `GET` | `/api/orders/my-orders` | Xem lịch sử đơn hàng của tài khoản | CUSTOMER | Truy xuất đơn hàng đã đặt | **PASS (200 OK)** |
| `POST` | `/api/payments/momo/create-payment` | Cổng thanh toán trực tuyến MoMo QR | CUSTOMER | Giả lập cổng thanh toán an toàn | **PASS (200 OK)** |

---

## 3. DỊCH VỤ BÊN NGOÀI ĐƯỢC CẤP PHÉP (EXTERNAL SERVICES & ATTRIBUTIONS)

1. **API QR Code Generator:**
   - Dịch vụ: `https://api.qrserver.com/v1/create-qr-code/`
   - Mục đích: Hiển thị hình ảnh mã QR động cho tem truy xuất nguồn gốc.
   - Giấy phép: Free public API, không lưu giữ thông tin người dùng.
2. **Bản Đồ Nền Địa Lý (Geographic Tiles):**
   - Dịch vụ: OpenStreetMap Tile Server
   - Điều khoản: Tuân thủ chính sách sử dụng Tile Usage Policy của OSM Foundation và ghi chú nguồn gốc (ODbL).
3. **Hình Ảnh Nông Sản & Nhà Vườn:**
   - Dịch vụ: Unsplash CDN theo giấy phép Unsplash Free License / Ảnh ghi nhận thực tế từ nông dân Hợp tác xã Tân Triều và Long Khánh.
