# BÁO CÁO AUDIT TOÀN DIỆN MÃ NGUỒN CROPNET (GATE M0)

**Dự án:** CropNet Đồng Nai AI  
**Repository:** `https://github.com/lovemvaf/cropnetkhoaduc` (Branch `main`)  
**Commit SHA Audit:** `cd94de42068785aeaa50a1ced127981935b7e640`  
**Ngày thực hiện:** 14/10/2026  
**Mục tiêu cuộc thi:** AI Digital Business Challenge 2026 — DIGIFEST Thành phố Đồng Nai (Kế hoạch 141-KH/TĐTN-CTĐTTN).

---

## 1. Tổng quan Kiến trúc & Stack kỹ thuật

- **Mô hình Repository:** Monorepo sử dụng npm workspaces (`apps/*`, `packages/*`).
- **Frontend (`apps/web`):**
  - Next.js 15.5.18 (App Router), React 19, TypeScript 5.3.
  - Tailwind CSS 3.4.1, Framer Motion, Lucide React, Zustand, Axios, Recharts.
  - Cấu hình export: `output: 'export'` (tối ưu static build deploy GitHub Pages).
- **Backend (`apps/server`):**
  - Node.js / Express 4.19.2, TypeScript 5.3, Prisma ORM 5.22.0.
  - JWT Authentication, bcryptjs, Helmet, CORS, express-rate-limit.
  - QR Code generator (`qrcode` library v1.5.3), Socket.io.
- **Shared Packages (`packages/*`):**
  - `@cropnet/types`: DTOs, interfaces, common types.
  - `@cropnet/ui`: Shared component library (Button, Card, Modal, Badge, Container).
  - `@cropnet/utils`: Formatters (`formatVND`, `formatDate`), helpers.
  - `@cropnet/config`: Cấu hình chung.

---

## 2. Kết quả kiểm tra Baseline (Build & Run)

| Hạng mục | Lệnh thực tế | Kết quả ban đầu | Ghi chú |
|---|---|---|---|
| **Cài đặt thư viện** | `npm install` | ✔ Thành công (398 packages) | Cần cập nhật npm workspaces lockfile |
| **Prisma generate** | `npx prisma generate` | ✔ Thành công (Prisma v5.22.0) | Schema đã sẵn sàng |
| **Server build** | `npm run build:server` | ✔ Thành công (`tsc` 0 errors) | Compile ra `apps/server/dist/` |
| **Web build** | `npm run build:web` | ✔ Thành công (39 pages export) | Export static ra `apps/web/out/` |
| **Automated Tests** | `npm test` | Ban đầu: Chưa có script | **Đã bổ sung bộ test tự động `gate_m0_security.test.ts` (7/7 PASS)** |

---

## 3. Bảng kiểm kê tính năng hiện hữu & Lỗ hổng P0 phát hiện

| Module | Tệp tin | Hiện trạng ban đầu | Rủi ro P0 phát hiện | Hành động khắc phục (Gate M0) |
|---|---|---|---|---|
| **Truy xuất QR** | `trace.repository.ts` | Fallback `MOCK_BATCHES[0]` khi DB lỗi hoặc không tìm thấy mã | Gán dữ liệu của lô khác cho mã truy xuất người dùng yêu cầu | **Đã sửa:** Trả `null` (404) nếu không có mã; fail-closed trong production. |
| **Dữ liệu kiểm định** | `trace.service.ts` | Tự động tạo kết quả `PASSED`, `0.0% tồn dư thuốc`, xe lạnh tương lai | Bịa kết quả kiểm định chất lượng, vi phạm tiêu chí trung thực | **Đã sửa:** Loại bỏ báo cáo giả; mặc định trạng thái `Chưa có kết quả kiểm định độc lập`. |
| **Domain QR** | `trace.service.ts` | Hardcode URL `https://cropnet.vn/traceability/...` | Không quét được trên domain triển khai thật | **Đã sửa:** Dùng `FRONTEND_URL` / `NEXT_PUBLIC_APP_URL` đồng nhất. |
| **Bảo mật JWT** | `auth.service.ts`, `auth.middleware.ts` | Hardcode default secret `super-secret-jwt-key` | Cho phép giả mạo token người dùng nếu dùng production | **Đã sửa:** `getJwtSecret()` kiểm tra nghiêm ngặt, fail-closed khi thiếu key 32+ ký tự ở production. |
| **Reset Token** | `auth.service.ts` | Dùng `Math.random()`, trả `resetToken` trong API response, in token lên log | Nguy cơ chiếm đoạt tài khoản (Account Takeover) | **Đã sửa:** Dùng `crypto.randomBytes`, không trả token qua API ở production, giấu token khỏi log. |
| **Upload file** | `upload.routes.ts` | Không có auth middleware, chỉ check MIME client khai báo | Bất kỳ ai cũng có thể upload file rác/độc hại lên server | **Đã sửa:** Thêm `authMiddleware`, kiểm tra đuôi file nghiêm ngặt (`.jpg`, `.png`, `.webp`), mã hóa tên file ngẫu nhiên. |
| **Giao dịch kho** | `order.repository.ts` | Cập nhật kho bằng `stock - quantity` trong transaction | Concurrency race condition dẫn đến bán âm kho (oversell) | **Đã sửa:** Dùng guarded atomic update `where: { stock: { gte: quantity } }, data: { stock: { decrement: quantity } }`. |
| **Branding & Địa phương** | Toàn bộ web & seed | Nông sản Cái Mơn Bến Tre, Đà Lạt, Vĩnh Long; tên "Nông sản Việt" | Không đáp ứng yêu cầu cuộc thi tại Thành phố Đồng Nai | Chuyển toàn bộ sang HTX Tân Triều & HTX Long Khánh (Gate M1). |

---

## 4. Bằng chứng chạy kiểm thử Gate M0 (Verification Evidence)

Đã chạy `npm test` với 7 kịch bản kiểm thử bảo mật & tính toàn vẹn dữ liệu:
```
=== [GATE M0 SECURITY & DATA INTEGRITY TESTS] ===

  ✔ PASS: getJwtSecret fails closed in production with default insecure secret
  ✔ PASS: getJwtSecret accepts secure 32+ character key in production
  ✔ PASS: generateSecureToken generates unpredictable cryptographic tokens
  ✔ PASS: findBatchByCode returns null for non-existent batch (never returns MOCK_BATCHES[0])
  ✔ PASS: findProductById returns null for invalid ID (never returns MOCK_PRODUCTS[0])
  ✔ PASS: createTraceBatch creates truthful unverified baseline without fake PASSED lab reports
  ✔ PASS: requestPasswordReset does not leak resetToken in production response

Results: 7 passed, 0 failed.
```
