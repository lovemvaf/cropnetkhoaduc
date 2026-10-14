# CHÍNH SÁCH BẢO MẬT & BẢO VỆ DỮ LIỆU CÁ NHÂN (SECURITY & PRIVACY POLICY)
## Nền Tảng Thương Mại Nông Sản Số CropNet Đồng Nai AI
### Cuộc thi AI Digital Business Challenge 2026 — DiGiFest Đồng Nai 2026

---

## 1. MỤC TIÊU & CĂN CỨ PHÁP LÝ

Nhằm tuân thủ tuyệt đối yêu cầu của Ban Thường vụ Thành đoàn & Trường CĐ FPT Polytechnic Đồng Nai tại **Kế hoạch số 141-KH/TĐTN-CTĐTTN (Mục I.2)**:
> *"Quá trình xây dựng và vận hành sản phẩm phải bảo đảm AI có trách nhiệm, an toàn thông tin, bảo vệ dữ liệu và quyền riêng tư; tuân thủ các quy định về sở hữu trí tuệ, quyền tác giả và các quy định pháp luật có liên quan."*

Hệ thống **CropNet Đồng Nai AI** được thiết kế kiến trúc bảo mật đa lớp (Defense-in-Depth) theo các quy chuẩn:
1. **Nghị định số 13/2023/NĐ-CP** ngày 17/04/2023 của Chính phủ về Bảo vệ dữ liệu cá nhân.
2. **Luật An toàn thông tin mạng số 86/2015/QH13**.
3. **Tiêu chuẩn an toàn OWASP Top 10 Web Application Security**.

---

## 2. NGUYÊN TẮC BẢO MẬT HỆ THỐNG

### 2.1. Xác thực và Phân quyền (Authentication & Authorization)
- **Cơ chế Token kép (JWT Access / Refresh Token):**
  - `accessToken` có thời hạn ngắn (15 phút), được ký bảo mật bằng thuật toán `HS256` với `JWT_SECRET` độc lập.
  - `refreshToken` có thời hạn 7 ngày, được lưu trữ có gắn cờ `HttpOnly`, `SameSite=Strict` và `Secure` nhằm chống tấn công XSS/CSRF.
- **Phân quyền dựa trên vai trò (Role-Based Access Control - RBAC):**
  - Hệ thống định nghĩa 5 vai trò riêng biệt: `CUSTOMER`, `FARMER` (Chủ hộ/HTX), `LOGISTICS` (Đơn vị vận chuyển), `INSPECTOR` (Thanh tra chất lượng VietGAP/OCOP), `ADMIN` (Ban quản trị).
  - Middleware `authMiddleware` và `authorizeRole` tại [`apps/server/src/middlewares/auth.middleware.ts`](file:///c:/Users/asus/Documents/cropnetkhoaduc/apps/server/src/middlewares/auth.middleware.ts) chặn đứng truy cập trái phép ở cấp độ từng Endpoint API.
- **Bảo vệ mật khẩu:**
  - 100% mật khẩu người dùng được băm một chiều bằng thư viện `bcryptjs` với số vòng băm `saltRounds = 10`. Tuyệt đối không lưu mật khẩu dạng bản rõ (plaintext).
  - Quy trình đổi mật khẩu và quên mật khẩu sử dụng mã OTP sinh ngẫu nhiên 6 chữ số với thời hạn hết hạn 10 phút và giới hạn số lần thử (Rate-limiting).

### 2.2. Kiểm soát dữ liệu tải lên (File Upload Whitelisting)
- Được triển khai chặt chẽ tại [`apps/server/src/modules/upload/upload.routes.ts`](file:///c:/Users/asus/Documents/cropnetkhoaduc/apps/server/src/modules/upload/upload.routes.ts):
  - **Giới hạn kích thước file:** Tối đa 5MB / file.
  - **Kiểm tra MIME-type và định dạng mở rộng:** Chỉ chấp nhận `image/jpeg`, `image/png`, `image/webp`. Chặn đứng hoàn toàn file thực thi nguy hiểm (`.exe`, `.sh`, `.php`, `.bat`, `.js`).
  - **Khử khuẩn tên file (Filename Sanitization):** Loại bỏ toàn bộ ký tự đặc biệt, chống Path Traversal (`../`).

### 2.3. Nguyên tắc Đóng lỗi (Fail-Closed Governance) trong Truy xuất nguồn gốc
- Không chấp nhận tạo dữ liệu giả mạo:
  - Khi quét mã QR hoặc nhập mã lô không tồn tại (Ví dụ: `BATCH-FAKE-99999999`), hệ thống trả về mã lỗi `404 NOT_FOUND` cùng cảnh báo tem không hợp lệ, tuyệt đối không tự động trỏ về một sản phẩm ngẫu nhiên để đánh lừa khách hàng.
  - Các chứng thư kiểm định chất lượng (Inspection Reports, VietGAP, OCOP) bắt buộc phải có đầy đủ tên đơn vị cấp thẩm quyền (Ví dụ: Chi cục Trồng trọt & BVTV Đồng Nai) và hình ảnh chứng chỉ bản quét thực tế.

### 2.4. Khử khuẩn dữ liệu đầu vào (Input Sanitization & SQL/NoSQL Injection Prevention)
- Sử dụng tiện ích `sanitizeText` tại [`apps/server/src/utils/security.ts`](file:///c:/Users/asus/Documents/cropnetkhoaduc/apps/server/src/utils/security.ts) lọc sạch các chuỗi độc hại trước khi đưa vào Database hoặc xử lý Prompt AI.
- Sử dụng Prisma ORM với cơ chế Parameterized Queries, loại bỏ hoàn toàn nguy cơ SQL Injection.

---

## 3. BẢO MẬT & AN TOÀN TRÍ TUỆ NHÂN TẠO (AI SAFETY & GUARDRAILS)

### 3.1. Cơ chế Kiểm soát Ảo giác (Hallucination Control via Tool Calling)
- CropNet AI hoạt động dựa trên cơ chế **Grounding** dữ liệu thực:
  - Khi người dùng hỏi giá bưởi Tân Triều hay mùa vụ sầu riêng Long Khánh, mô hình không tự "bịa" ra thông tin mà gọi trực tiếp các Tool API nội bộ: `getFactProducts()`, `getFactBatches()`, `getFactCooperatives()`, `getSeasonalCalendarData()`.
  - Phản hồi của AI dựa 100% vào dữ liệu đã được Sở NN&PTNT và HTX xác thực.

### 3.2. Bộ lọc Phát ngôn Y tế & Dinh dưỡng (Medical Safety Guardrails)
- Để bảo vệ sức khỏe người tiêu dùng và tuân thủ Luật An toàn thực phẩm:
  - Phát hiện và kích hoạt cờ `hasMedicalClaim` khi phát hiện các từ khóa nhạy cảm: `chữa ung thư`, `trị tiểu đường`, `thần dược`, `khỏi bệnh 100%`, `trị dứt điểm`.
  - Hệ thống tự động bác bỏ các khẳng định chữa bệnh sai sự thật, làm rõ nông sản chỉ có tác dụng bổ sung vitamin, chất xơ và hỗ trợ lối sống lành mạnh; đồng thời khuyến nghị người dùng tham vấn ý kiến bác sĩ chuyên khoa.

### 3.3. Bảo mật API Key & Offline Fallback Engine
- API Key Gemini (`GEMINI_API_KEY`) được cô lập hoàn toàn tại Server-side trong biến môi trường `.env`, tuyệt đối không bao giờ để lộ ra Client-side Next.js bundle (`NEXT_PUBLIC_`).
- Khi không có API Key, hệ thống tự động kích hoạt **Offline Deterministic Fallback Engine** (`Offline Rule-based & Knapsack Engine`), đảm bảo mọi tính năng tư vấn, tối ưu ngân sách, kiểm tra mã tem vẫn hoạt động trơn tru 100% mà không bị phụ thuộc vào dịch vụ bên ngoài.

---

## 4. CHÍNH SÁCH QUYỀN RIÊNG TƯ THEO NGHỊ ĐỊNH 13/2023/NĐ-CP

1. **Thu thập dữ liệu tối thiểu (Data Minimization):**
   - Chỉ thu thập Họ tên, Số điện thoại và Địa chỉ giao hàng khi khách hàng thực sự tạo đơn hàng.
   - Không thu thập vị trí GPS chính xác của người dùng cá nhân; trang Bản đồ số nông nghiệp chỉ hiển thị tọa độ các Hợp tác xã đã công khai thông tin.
2. **Quyền của chủ thể dữ liệu (Data Subject Rights):**
   - Khách hàng có toàn quyền xem lại lịch sử đơn hàng, cập nhật thông tin cá nhân hoặc yêu cầu khóa tài khoản thông qua trang Dashboard Người mua.
3. **Lưu trữ & Bảo mật thông tin:**
   - Dữ liệu đơn hàng và giao dịch được mã hóa trong quá trình truyền tải (In-transit) qua giao thức HTTPS / TLS 1.3.
   - Không chia sẻ thông tin khách hàng cho bên thứ ba ngoại trừ đơn vị vận chuyển được chỉ định để hoàn tất đơn hàng.

---

## 5. TỔNG KẾT & CAM KẾT CUỘC THI

CropNet Đồng Nai AI cam kết duy trì chuẩn mực cao nhất về tính trung thực, an toàn dữ liệu và trách nhiệm xã hội trong toàn bộ quá trình tham gia **AI Digital Business Challenge 2026** và giai đoạn bàn giao thực tế cho các Hợp tác xã nông nghiệp tỉnh Đồng Nai.
