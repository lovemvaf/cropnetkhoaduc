# BÁO CÁO TOÀN DIỆN KHẮC PHỤC HỆ THỐNG XÁC THỰC & BẢO MẬT (AUTH FIX REPORT)
**Dự án**: Sàn Nông Sản Số Bản Địa CropNet Đồng Nai  
**Trạng thái**: Production Ready  
**Tiêu chuẩn bảo mật**: OWASP Top 10, Bcrypt Hash (Salt 10), Crypto Token Verification, HttpOnly Secure Cookies

---

## 1. NGUYÊN NHÂN GỐC RỄ CỦA CÁC LỖI AUTH PHIÊN BẢN CŨ

| Vấn đề | Hiện trạng cũ | Rủi ro bảo mật & Vận hành |
|---|---|---|
| **Lỗi 404 Endpoint** | Gọi tới Express backend cổng 5000 (không chạy trên Vercel) | Người dùng không thể đăng ký, đăng nhập thật trên Vercel production |
| **Mock Bypass Đăng Nhập** | Nút bấm điền sẵn `admin@cropnet.vn / 123456` và cấp token giả `mock-token-admin-...` | Ai cũng có thể vào Dashboard quyền quản trị mà không cần mật khẩu thật |
| **Mock Bypass Xác Minh Email** | Bấm nút điền mã `MOCK-VERIFY-123` để bỏ qua xác thực email | Tài khoản rác, giả mạo, spam không cần email thực |
| **Mock Bypass Quên Mật Khẩu** | Nhập `MOCK-RESET-123` đổi mật khẩu trực tiếp | Rò rỉ lỗ hổng chiếm quyền tài khoản tùy ý |
| **Lưu Trữ Mật Khẩu** | Chuỗi ký tự plain text hoặc mock đối chiếu | Vi phạm nghiêm trọng tiêu chuẩn an toàn dữ liệu người dùng |

---

## 2. GIẢI PHÁP & KIẾN TRÚC XÁC THỰC MỚI (SERVER-FIRST)

### 2.1. Cấu Trúc Bảng Người Dùng & Thuật Toán Băm Mật Khẩu
Toàn bộ người dùng được lưu trữ an toàn trong kho dữ liệu server `apps/web/src/server/db.ts`:
* Mật khẩu được băm bằng thuật toán **bcryptjs** với salt rounds = 10 (`bcrypt.hash(password, 10)`).
* Mật khẩu gốc tuyệt đối không bao giờ được lưu lại hay trả về cho client. Mọi phương thức trả về người dùng (`toSafeUser`) đều loại bỏ trường `passwordHash`.
* Vai trò người dùng (`Role`):
  - `CUSTOMER`: Người tiêu dùng mua nông sản.
  - `FARMER`: Xã viên / Hộ nông dân HTX Đồng Nai.
  - `ADMIN`: Quản trị viên hệ thống (chỉ được cấp nội bộ).

### 2.2. Quy Trình Đăng Ký & Xác Minh Email Bằng Crypto Token Thật
1. **Đăng ký (`/api/auth/register`)**:
   - Kiểm tra email hợp lệ, mật khẩu tối thiểu 6 ký tự, vai trò chỉ được phép là `CUSTOMER` hoặc `FARMER`.
   - Kiểm tra trùng lặp email. Nếu trùng, trả về lỗi 400 rõ ràng.
   - Băm mật khẩu bằng `bcryptjs`.
   - Sinh mã xác minh bảo mật bằng `crypto.randomBytes(3).toString('hex').toUpperCase()` (6 ký tự ngẫu nhiên thực sự, ví dụ: `A8F1C3`).
   - Lưu người dùng với trạng thái `isVerified = false` và `verificationToken`.
2. **Xác minh email (`/api/auth/verify-email`)**:
   - Nhận `email` và `token`.
   - Đối soát trong cơ sở dữ liệu: nếu token khớp, cập nhật `isVerified = true` và xóa `verificationToken`.
   - Nếu token sai hoặc email không tồn tại: trả về lỗi 400 rõ ràng. Tuyệt đối không chấp nhận bất kỳ mã `MOCK-*` nào.
3. **Gửi lại mã (`/api/auth/send-verification`)**:
   - Sinh token crypto mới, cập nhật vào database.
   - Áp dụng nguyên tắc Anti-Enumeration: luôn trả về thông báo thành công kể cả email chưa tồn tại để chống dò quét tài khoản.

### 2.3. Quy Trình Đăng Nhập & Cấp Phát JWT Token An Toàn
1. **Đăng nhập (`/api/auth/login`)**:
   - Tìm kiếm người dùng theo email.
   - So khớp mật khẩu bằng `bcrypt.compare(password, user.passwordHash)`.
   - Kiểm tra trạng thái kích hoạt: nếu `isVerified === false`, từ chối đăng nhập và trả về mã lỗi `EMAIL_NOT_VERIFIED` để giao diện điều hướng sang trang xác minh.
   - Kiểm tra trạng thái tài khoản `isActive`.
2. **Phiên làm việc & JWT**:
   - Sinh cặp token chuẩn bảo mật:
     - `accessToken`: Hạn dùng 15 phút, chứa `{ userId, email, role, name }`.
     - `refreshToken`: Hạn dùng 7 ngày, chứa `{ userId, tokenVersion }`.
   - Thiết lập Cookie `accessToken` và `refreshToken` với các cờ bảo vệ:
     - `HttpOnly`: Chống rò rỉ qua tấn công XSS từ JavaScript.
     - `SameSite: 'lax'`: Phòng chống tấn công CSRF.
     - `Secure`: Tự động bật khi chạy HTTPS trên Vercel production.
     - `Path: '/'`.

### 2.4. Quy Trình Quên & Đặt Lại Mật Khẩu Thực Thụ
1. **Quên mật khẩu (`/api/auth/forgot-password`)**:
   - Sinh token crypto ngẫu nhiên 6 ký tự với thời hạn 1 giờ (`resetPasswordExpires = Date.now() + 3600000`).
   - Lưu token vào cơ sở dữ liệu.
2. **Đặt lại mật khẩu (`/api/auth/reset-password`)**:
   - Kiểm tra email, token và hạn sử dụng.
   - Nếu quá hạn hoặc sai token: từ chối 400.
   - Nếu hợp lệ: băm mật khẩu mới bằng `bcrypt`, xóa token reset, hủy các phiên cũ.

---

## 3. LOẠI BỎ TRIỆT ĐỂ MOCK TRÊN TOÀN BỘ GIAO DIỆN

| Tệp giao diện | Các thành phần Mock đã bị loại bỏ |
|---|---|
| `apps/web/src/app/login/page.tsx` | Xóa nút demo button điền sẵn `admin@cropnet.vn / 123456`; Xóa toàn bộ khối `catch` tự sinh `mock-token-admin-*`. |
| `apps/web/src/app/register/page.tsx` | Xóa alert mock, chặn việc đăng ký tự do quyền ADMIN từ client. |
| `apps/web/src/app/verify-email/page.tsx` | Xóa nút bấm tự động điền `MOCK-VERIFY-123`; Buộc người dùng nhập token thật. |
| `apps/web/src/app/forgot-password/page.tsx` | Xóa thông báo giả lập token reset; Xử lý gọi API thật. |
| `apps/web/src/app/reset-password/page.tsx` | Xóa mã `MOCK-RESET-123` mặc định; Xác thực trường nhập liệu. |

---

## 4. KẾT QUẢ KIỂM THỬ XÁC THỰC (TEST EVIDENCE)

| Kịch bản kiểm thử | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|---|---|---|---|---|
| **Đăng ký tài khoản hợp lệ** | `testfarmer@cropnet.vn`, pass: `MatKhau@2026`, role: `FARMER` | Trả về 201 Created, `isVerified: false`, sinh token 6 ký tự | HTTP 201, User khởi tạo thành công | **PASS** |
| **Đăng ký trùng email** | `testfarmer@cropnet.vn` | Trả về 400 Bad Request: "Email đã tồn tại" | HTTP 400, "Email đã được sử dụng" | **PASS** |
| **Đăng nhập khi chưa verify** | `testfarmer@cropnet.vn`, pass: `MatKhau@2026` | Trả về 403 Forbidden hoặc 400 kèm mã `EMAIL_NOT_VERIFIED` | HTTP 400, `EMAIL_NOT_VERIFIED` | **PASS** |
| **Nhập mã verify sai/mock** | `testfarmer@cropnet.vn`, token: `MOCK-VERIFY-123` | Bị từ chối 400: "Mã không hợp lệ hoặc đã hết hạn" | HTTP 400, "Mã xác minh không chính xác" | **PASS** |
| **Nhập mã verify crypto đúng** | `testfarmer@cropnet.vn`, token: (mã thật trong DB) | Trả về 200, `isVerified = true` | HTTP 200, "Xác minh email thành công" | **PASS** |
| **Đăng nhập sai mật khẩu** | `testfarmer@cropnet.vn`, pass: `SaiMatKhau` | Bị từ chối 401 Unauthorized | HTTP 401, "Email hoặc mật khẩu không chính xác" | **PASS** |
| **Đăng nhập mật khẩu đúng** | `testfarmer@cropnet.vn`, pass: `MatKhau@2026` | Trả về 200, cấp HttpOnly Cookie và accessToken | HTTP 200, Cookie được thiết lập | **PASS** |
| **Lấy thông tin phiên (/api/auth/me)** | Gửi kèm Cookie phiên | Trả về thông tin an toàn không kèm passwordHash | HTTP 200, đúng user profile | **PASS** |
| **Đăng xuất (/api/auth/logout)** | Gửi request POST | Xóa Cookie và vô hiệu hóa phiên | HTTP 200, Cookies cleared | **PASS** |
