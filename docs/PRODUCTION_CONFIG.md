# CẤU HÌNH TRIỂN KHAI PRODUCTION ĐẦY ĐỦ (PRODUCTION HOSTING CONFIG - GATE R3)
## Hệ Thống Thương Mại Điện Tử Nông Sản CropNet Đồng Nai AI
### Cuộc thi AI Digital Business Challenge 2026 — DiGiFest Đồng Nai

---

## 1. NGUYÊN TẮC BẢO MẬT BIẾN MÔI TRƯỜNG (ENV VAR HYGIENE)
- **Tuyệt đối không lưu giá trị bí mật (Secrets, Private Keys, Passwords) trong tài liệu này hoặc trong mã nguồn commit.**
- Chỉ công bố danh mục tên biến và mô tả vai trò cấu hình hệ thống.

---

## 2. DANH MỤC BIẾN MÔI TRƯỜNG CHO HẠ TẦNG SẢN PHẨM (PRODUCTION ENVIRONMENT)

### 2.1. Cấu hình Backend Server (`apps/server/.env`)
| Tên Biến Môi Trường | Mục Đích Sử Dụng | Mức Độ Bảo Mật |
| :--- | :--- | :---: |
| `NODE_ENV` | Thiết lập môi trường (`production`) | Công khai |
| `PORT` | Cổng dịch vụ lắng nghe (Mặc định `5000` hoặc do Cloud Provider cấp) | Nội bộ |
| `DATABASE_URL` | Chuỗi kết nối PostgreSQL sản phẩm (`postgresql://user:pass@host:5432/dbname?sslmode=require`) | **Tuyệt Mật** |
| `JWT_SECRET` | Khóa bí mật ký phát Access Token (tối thiểu 32 ký tự ngẫu nhiên an toàn) | **Tuyệt Mật** |
| `JWT_REFRESH_SECRET` | Khóa bí mật ký phát Refresh Token | **Tuyệt Mật** |
| `FRONTEND_URL` | URL công khai của Frontend để cấu hình CORS và sinh mã QR (`https://...`) | Công khai |
| `GEMINI_API_KEY` | Khóa API dịch vụ Gemini AI của Google (nếu có để kích hoạt Live AI) | **Tuyệt Mật** |

### 2.2. Cấu hình Frontend Web Client (`apps/web/.env.production`)
| Tên Biến Môi Trường | Mục Đích Sử Dụng | Ghi Chú |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Địa chỉ Endpoint API Backend HTTPS của hệ thống sản phẩm | Được đóng gói vào JS bundle |
| `NEXT_PUBLIC_APP_URL` | Địa chỉ gốc trang web công khai | Dùng cho thẻ OpenGraph & Canonical |
| `NEXT_PUBLIC_BASE_PATH` | Đường dẫn con của ứng dụng (`/cropnetkhoaduc` trên GitHub Pages) | Trống nếu dùng tên miền riêng |

---

## 3. HƯỚNG DẪN TRIỂN KHAI BACKEND VÀ DATABASE THẬT (DEDICATED HOSTING)

Nhằm tuân thủ điều khoản GitHub Pages, toàn bộ giao dịch đặt hàng thật, đăng nhập và quản lý dữ liệu nhạy cảm được triển khai trên hạ tầng chuyên dụng:

### Phương án A: Triển khai trên Render / Railway (Khuyến nghị cho Startup OCOP)
1. Tạo một cơ sở dữ liệu **Managed PostgreSQL** (ví dụ: Render PostgreSQL Free Tier hoặc Supabase PostgreSQL).
2. Chạy migration tạo bảng:
   ```bash
   npx prisma migrate deploy --schema=apps/server/src/database/schema.prisma
   ```
3. Nạp dữ liệu định danh nông sản Đồng Nai:
   ```bash
   npm run seed --workspace=apps/server
   ```
4. Tạo một **Web Service** chạy Dockerfile hoặc Node.js script:
   - Build Command: `npm run build:server`
   - Start Command: `npm run start:server`
   - Nhập các biến môi trường tại mục 2.1 vào mục Environment Variables của Dashboard hosting.

### Phương án B: Triển khai trên VPS Docker Compose (Doanh Nghiệp / Tỉnh Đoàn Bảo Trợ)
Sử dụng tệp `docker-compose.yml` có sẵn trong thư mục gốc dự án:
```bash
docker compose up -d --build
```
Dịch vụ sẽ tự động kích hoạt:
- NGINX Reverse Proxy với chứng chỉ SSL Let's Encrypt tự động.
- Container `cropnet-server` (Express API) lắng nghe cổng 5000.
- Container `cropnet-db` (PostgreSQL 16) lưu trữ bền vững trên Docker Volume.

---

## 4. TÁCH BIỆT BẢN SHOWCASE TRÊN GITHUB PAGES
- Khi người dùng truy cập bản tĩnh trên GitHub Pages, ứng dụng hiển thị thông báo **Bản Trình Diễn DiGiFest 2026**.
- Mọi thao tác thử nghiệm đặt hàng hay đăng ký trên GitHub Pages được cách ly trong bộ nhớ trình duyệt (Zustand Local Storage), không lưu trữ thông tin thẻ ngân hàng thật, đảm bảo an toàn tuyệt đối và tuân thủ 100% chính sách của GitHub Pages.
