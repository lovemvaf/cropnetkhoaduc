# HƯỚNG DẪN MIGRATION & BACKUP / ROLLBACK
## Dự án: CropNet Đồng Nai AI (DiGiFest 2026)
**Ngày thực hiện:** 15/10/2026  

---

### 1. QUY TRÌNH THỰC THI MIGRATION

1. **Khởi tạo schema trên Supabase PostgreSQL:**
   - Script SQL đặt tại: `supabase/migrations/20261015000000_init_auth_profiles.sql`
   - Có thể áp dụng thông qua Supabase Dashboard (SQL Editor) hoặc lệnh Supabase CLI:
     ```bash
     npx supabase db push
     ```
2. **Kiểm tra tính Idempotent:**
   - Toàn bộ câu lệnh đều sử dụng `CREATE TABLE IF NOT EXISTS`, `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object`, `DROP POLICY IF EXISTS`, và `ON CONFLICT (id) DO UPDATE`.
   - Script an toàn khi chạy lại nhiều lần mà không gây gián đoạn hay trùng lặp.
3. **Cơ chế Trigger tự động:**
   - Trigger `on_auth_user_created` trên bảng `auth.users` bảo đảm khi người dùng xác thực thành công qua Supabase Auth, bản ghi `public.profiles` được khởi tạo lập tức với vai trò và trạng thái tương ứng.

---

### 2. PHƯƠNG ÁN SAO LƯU & PHỤC HỒI (BACKUP & RESTORE)

- **Sao lưu định kỳ (Database Backup):**
  - Sử dụng pg_dump thông qua chuỗi kết nối Supabase PostgreSQL:
    ```bash
    pg_dump "$DATABASE_URL" --schema=public --clean --if-exists > backup_cropnet_$(date +%Y%m%d).sql
    ```
- **Phương án Rollback:**
  - Nếu xảy ra sự cố trong quá trình nâng cấp, rollback về migration trước hoặc phục hồi snapshot gần nhất mà không làm ảnh hưởng đến các module độc lập (AI RAG, Bản đồ, QR Code).

---

### 3. DANH MỤC BIẾN MÔI TRƯỜNG CẦN THIẾT (ENV VARS CHECKLIST)
*(Chỉ liệt kê tên biến theo quy định bảo mật, tuyệt đối không chứa giá trị bí mật)*

#### Biến môi trường Client & Server (Next.js App Router):
- `NEXT_PUBLIC_SUPABASE_URL` : URL project Supabase (https://<project-ref>.supabase.co)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : Anon Public Key dành cho trình duyệt
- `SUPABASE_SERVICE_ROLE_KEY` : Service Role Key bí mật dành riêng cho Server (không bao giờ lộ ra frontend)
- `DATABASE_URL` : Connection string kết nối trực tiếp PostgreSQL

#### Biến môi trường Email / SMTP (Tùy chọn tích hợp Resend):
- `RESEND_API_KEY` : Khóa gửi email xác thực và khôi phục mật khẩu từ Resend
- `EMAIL_FROM` : Địa chỉ hòm thư gửi thông báo chính thức (ví dụ: `CropNet <no-reply@cropnet.vn>`)
