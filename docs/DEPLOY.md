# HƯỚNG DẪN TRIỂN KHAI VÀ VẬN HÀNH HỆ THỐNG (DEPLOYMENT GUIDE)

Tài liệu này hướng dẫn chi tiết các bước cài đặt, khởi chạy cục bộ và triển khai lên hạ tầng đám mây cho dự án **CropNet Đồng Nai AI**.

---

## 1. YÊU CẦU MÔI TRƯỜNG HỆ THỐNG (SYSTEM PREREQUISITES)

- **Node.js:** Phiên bản `>= 18.0.0` (Khuyến nghị Node.js LTS v20.x hoặc v24.x).
- **Trình quản lý gói (Package Manager):** npm `>= 9.0.0`.
- **Cơ sở dữ liệu (Tùy chọn):** PostgreSQL `>= 14` (Hệ thống có sẵn kiến trúc Dual-Mode tự động chuyển sang `dbFallback` nếu chưa cấu hình DB).
- **Hệ điều hành:** Linux, macOS, hoặc Windows.

---

## 2. KHỞI CHẠY CỤC BỘ DÀNH CHO BAN GIÁM KHẢO (QUICK START)

### Bước 1: Cài đặt các gói phụ thuộc (Dependencies)
Mở cửa sổ terminal tại thư mục gốc repository:
```bash
npm install
```

### Bước 2: Thiết lập biến môi trường
Tạo tệp `.env` tại thư mục gốc hoặc trong từng ứng dụng từ tệp `.env.example`:
```bash
cp .env.example .env
```

### Bước 3: Chạy kiểm thử tự động (Automated Verification)
Để xác nhận tính toàn vẹn bảo mật (Gate M0) và trí tuệ nhân tạo (Gate M3):
```bash
npm test
```
*Kết quả chuẩn: 13/13 bài kiểm thử đạt yêu cầu (PASS).*

### Bước 4: Khởi chạy máy chủ phát triển (Development Mode)
Khởi chạy đồng thời cả Frontend Web và Backend API:
```bash
# Terminal 1: Khởi chạy Backend Express Server (Cổng 5000)
npm run dev:server

# Terminal 2: Khởi chạy Frontend Next.js Web (Cổng 3000)
npm run dev:web
```

Truy cập hệ thống trên trình duyệt:
- Giao diện người dùng: `http://localhost:3000`
- API Backend Health Check: `http://localhost:5000/health`

---

## 3. TÀI KHOẢN TRUY CẬP ĐÃ CẤU HÌNH SẴN (PRE-SEEDED ACCOUNTS)

| Vai Trò (Role) | Email Đăng Nhập | Mật Khẩu | Quyền Hạn & Dashboard |
| :--- | :--- | :--- | :--- |
| **Quản Trị Viên (Admin)** | `admin@cropnet.vn` | `123456` | Toàn quyền kiểm soát, duyệt HTX, duyệt chứng nhận |
| **HTX Tân Triều (Farmer)** | `tantrieu@cropnet.vn` | `123456` | Quản lý vườn bưởi, tạo lô hàng, sinh mã QR |
| **HTX Long Khánh (Farmer)** | `longkhanh@cropnet.vn` | `123456` | Quản lý sầu riêng, chôm chôm, xưởng hạt điều |
| **Khách Hàng (Customer)** | `khachhang@gmail.com` | `123456` | Mua hàng D2C, theo dõi đơn, lưu combo AI |
| **Kiểm Định Viên (Inspector)**| `inspector@cropnet.vn` | `123456` | Đăng tải phiếu kiểm nghiệm an toàn thực phẩm |
| **Vận Tải Lạnh (Logistics)** | `logistics@cropnet.vn` | `123456` | Cập nhật hành trình vận chuyển |

---

## 4. ĐÓNG GÓI SẢN XUẤT (PRODUCTION BUILD)

### 1. Biên dịch Backend API:
```bash
npm run build:server
# Chạy máy chủ sản xuất:
node apps/server/dist/server.js
```

### 2. Biên dịch Frontend Web App (Next.js Static Export):
```bash
npm run build:web
```
Thư mục xuất bản tĩnh sẽ nằm tại `apps/web/out/`. Thư mục này sẵn sàng triển khai lên bất kỳ dịch vụ lưu trữ Web tĩnh nào (Vercel, Cloudflare Pages, GitHub Pages, AWS S3 / CloudFront, Nginx).

---

## 5. CHECKLIST AN TOÀN TRƯỚC KHI DEPLOY PRODUCTION

1. [x] Đổi `JWT_SECRET` và `JWT_REFRESH_SECRET` sang chuỗi ngẫu nhiên dài từ 32 ký tự trở lên.
2. [x] Đảm bảo `NODE_ENV=production`.
3. [x] Kiểm tra cấu hình `CORS_ORIGIN` khớp với tên miền của Web Frontend.
4. [x] Giới hạn kích thước tệp upload tối đa 5MB và chỉ chấp nhận định dạng ảnh hợp lệ (`.jpg`, `.jpeg`, `.png`, `.webp`).
5. [x] Chạy kiểm tra `npm test` đạt 100% trước khi merge git.
