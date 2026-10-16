# BÁO CÁO PHÂN TÍCH NGUYÊN NHÂN GỐC RỄ (ROOT CAUSE ANALYSIS)
## Dự án: CropNet Đồng Nai AI (DiGiFest 2026)
**Ngày thực hiện:** 15/10/2026  
**Commit tham chiếu:** `2f90b839d8fcd9cd2d3f0852753f5037f7d10f03`  
**Production URL:** https://cropnetkhoaduc.vercel.app/  
**Tác giả:** Antigravity Engineering Team  

---

### 1. TỔNG QUAN TÌNH TRẠNG & TÁI HIỆN THỰC TẾ TRÊN PRODUCTION

Kiểm tra trực tiếp endpoint production `https://cropnetkhoaduc.vercel.app/api/auth/register` vào lúc 18:36:33+07:00 ngày 15/10/2026:
```http
POST /api/auth/register HTTP/1.1
Host: cropnetkhoaduc.vercel.app
Content-Type: application/json

{"email":"test-diag-1@cropnet.vn","password":"PassDiag123!@#","fullName":"Test Diag","roleName":"CUSTOMER"}
```

**Phản hồi từ Production:**
```json
{
  "success": true,
  "message": "Đăng ký tài khoản thành công! Vui lòng xác minh email trước khi đăng nhập.",
  "data": {
    "userId": "usr-1792064340131-adf2n",
    "email": "test-diag-1@cropnet.vn",
    "fullName": "Test Diag",
    "role": "CUSTOMER",
    "status": "ACTIVE",
    "verificationToken": "E0CB9C"
  }
}
```
**Xác nhận lỗi nghiêm trọng:** Mã xác minh `verificationToken: "E0CB9C"` được trả trực tiếp về trình duyệt trong JSON response, đồng thời tài khoản được lưu vào tệp tạm `/tmp/cropnet_store.json` của serverless function, dẫn đến mất toàn bộ dữ liệu khi serverless function recycle hoặc redeploy.

---

### 2. BẢNG CHI TIẾT CÁC LỖI GỐC RỄ (ROOT CAUSES)

| ID | File & Line | Hiện tượng & Lỗi | Nguyên nhân gốc rễ | Mức độ nghiêm trọng |
|---|---|---|---|---|
| **RC-01** | `apps/web/src/server/db.ts:91-102, 119-130` | Dữ liệu người dùng, forum, đơn hàng biến mất sau khi instance restart, cold start hoặc redeploy. | Sử dụng `/tmp/cropnet_store.json` và RAM state trên Vercel Serverless. `/tmp` chỉ là thư mục tạm thời của container lambda, không có tính bền vững (non-persistent) giữa các lần gọi hoặc giữa các instances khác nhau. | **CRITICAL** (Mất dữ liệu) |
| **RC-02** | `apps/web/src/server/db.ts:133-197` | Tài khoản quản trị và nhà vườn mẫu tồn tại với mật khẩu cố định trong code. | `generateInitialState()` tự động nạp các tài khoản hardcoded (`admin@cropnet.vn`, `tantrieu@cropnet.vn`, `xuanlap@cropnet.vn`, `khachhang@gmail.com`) với mật khẩu biết trước (`AdminDongNai2026!@#`, v.v.). Bất kỳ ai đọc mã nguồn đều có thể chiếm quyền ADMIN. | **CRITICAL** (Lỗ hổng bảo mật nghiêm trọng) |
| **RC-03** | `apps/web/src/server/auth.ts:5-6` | `JWT_SECRET` và `JWT_REFRESH_SECRET` có giá trị fallback tĩnh mặc định. | Không bắt buộc cấu hình biến môi trường bí mật; fallback vào chuỗi cố định khiến kẻ tấn công có thể tự tạo JWT giả mạo vai trò ADMIN. | **CRITICAL** (Giả mạo quyền) |
| **RC-04** | `apps/web/src/app/api/auth/register/route.ts:56, 83` | Endpoint đăng ký trả `verificationToken` ra JSON response. | Để phục vụ việc test tự động tạm thời, lập trình viên đã đính kèm token xác minh vào dữ liệu trả về cho client. Bất kỳ ai cũng có thể bypass xác minh email mà không cần truy cập hòm thư. | **HIGH** (Lộ mã xác minh) |
| **RC-05** | `apps/web/src/app/api/auth/send-verification/route.ts:40`<br>`apps/web/src/app/api/auth/forgot-password/route.ts:38` | Trả mã `verificationToken` và `resetToken` trong response của API. | Tương tự RC-04, API gửi lại mã xác minh và mã khôi phục mật khẩu trả thẳng token ra browser. Bất kỳ ai biết email của nạn nhân đều có thể lấy resetToken để chiếm đoạt tài khoản. | **CRITICAL** (Account Takeover) |
| **RC-06** | `apps/web/src/app/api/auth/send-verification/route.ts:38`<br>`apps/web/src/app/api/auth/forgot-password/route.ts:36` | Thông báo "Đã gửi email thành công" nhưng thực tế không có tích hợp SMTP/Email service nào. | "Thành công giả" (Fake success). Hệ thống không kết nối với bất kỳ dịch vụ gửi mail nào (như Resend, Sendgrid, SMTP), gây hiểu lầm cho người dùng thật. | **HIGH** (Thành công giả) |
| **RC-07** | `apps/web/src/shared/stores/auth.ts:24-36`<br>`apps/web/src/shared/services/api.ts:31-36` | Lưu access token và thông tin user trong `localStorage`; gửi qua header `Authorization: Bearer`. | Dễ bị tấn công XSS; trạng thái client bị lệch so với cookie server; không tận dụng được Next.js 15 App Router Server Component Auth / Middleware bảo vệ route. | **MEDIUM** (Bảo mật phiên) |
| **RC-08** | `apps/web/src/app/login/page.tsx:32`<br>`apps/web/src/app/verify-email/page.tsx:83`<br>`apps/web/src/app/forgot-password/page.tsx:69-72` | Giao diện hiển thị token test, dùng hàm `alert()`, `prompt()`, thiếu accessibility và quản lý focus lỗi. | Giao diện prototype chưa hoàn thiện cho production, phá vỡ UX di động và làm lộ thông tin bảo mật trên màn hình. | **MEDIUM** (Trải nghiệm người dùng) |
| **RC-09** | Kiến trúc phân mảnh: `apps/server` (Express/Prisma) vs `apps/web` (Next.js 15) | Trang `/admin` gọi `apiClient.get('/admin/users')` bị trả về mã 404 trên Vercel Production. | Vercel chỉ deploy thư mục `apps/web`. Thư mục `apps/server` không hề được chạy trên Vercel. Các endpoint `/api/admin/*` chỉ có bên `apps/server` mà chưa được chuyển đổi thành Next.js Route Handlers bên `apps/web`. | **HIGH** (Chức năng hỏng) |
| **RC-10** | `apps/web/src/app/api/auth/me/route.ts` | Phản hồi `/api/auth/me` trả về header `Cache-Control: public, max-age=0, must-revalidate`. | Thiếu chỉ thị `private, no-store`, có nguy cơ các tầng CDN/Proxy lưu đệm dữ liệu cá nhân giữa các người dùng khác nhau. | **MEDIUM** (Bảo mật rò rỉ dữ liệu) |

---

### 3. KẾT LUẬN & ĐỊNH HƯỚNG KHẮC PHỤC TRIỆT ĐỂ

1. **Thay thế hoàn toàn in-memory/tmp bằng Supabase Auth + PostgreSQL:**
   - Identity & Auth quản lý bởi Supabase Auth engine chuẩn công nghiệp.
   - Dữ liệu `public.profiles` và `public.supplier_profiles` lưu trữ bền vững trên PostgreSQL.
   - Vai trò được bảo vệ tuyệt đối bằng Row Level Security (RLS) và Server Route Handlers; không cho phép client tự sửa role.
2. **Loại bỏ 100% token trả về client:**
   - Các API `register`, `send-verification`, `forgot-password` tuyệt đối không trả token trong response body.
3. **Tích hợp Email xác thực thực tế (Resend / Supabase SMTP):**
   - Thiết lập luồng gửi email thật; nếu chưa cấu hình domain/SMTP, hiển thị thông báo trung thực `BLOCKED_EMAIL_PROVIDER`, không báo "đã gửi" giả.
4. **Chuẩn hóa Session Cookie cho Next.js 15:**
   - Sử dụng `@supabase/ssr` và `middleware.ts` để quản lý phiên bằng HttpOnly cookies an toàn.
   - Cung cấp API `/api/admin/*` đầy đủ trong `apps/web`.
