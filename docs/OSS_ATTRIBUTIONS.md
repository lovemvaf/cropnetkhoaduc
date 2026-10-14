# GHI NHẬN NGUỒN GỐC PHẦN MỀM MÃ NGUỒN MỞ & DỮ LIỆU CỘNG ĐỒNG (OSS ATTRIBUTIONS)

Dự án **CropNet Đồng Nai AI** cam kết tuân thủ nghiêm ngặt các quy định về sở hữu trí tuệ, bản quyền mã nguồn mở và chính sách sử dụng dữ liệu mở phục vụ cuộc thi **AI Digital Business Challenge 2026**.

---

## 1. THƯ VIỆN & KHUNG PHÁT TRIỂN NỀN TẢNG (CORE FRAMEWORKS & LIBRARIES)

| Gói Phần Mềm / Thư Viện | Phiên Bản | Giấy Phép (License) | Đơn Vị Phát Triển / Tác Quyền | Mục Đích Sử Dụng |
| :--- | :--- | :--- | :--- | :--- |
| **Next.js** | 15.x | MIT License | Vercel, Inc. | Khung giao diện Web App, Server-Side Rendering & Static Export |
| **React & React DOM** | 19.x | MIT License | Meta Platforms, Inc. | Xây dựng thành phần giao diện người dùng tương tác |
| **Express** | 4.19.x | MIT License | StrongLoop, IBM & Express Community | Máy chủ API backend RESTful |
| **Prisma ORM** | 5.10.x | Apache 2.0 License | Prisma Data, Inc. | Tương tác cơ sở dữ liệu PostgreSQL an toàn |
| **Tailwind CSS** | 3.4.x | MIT License | Tailwind Labs, Inc. | Hệ thống thiết kế tiện ích giao diện hiện đại |
| **Lucide React** | 0.354.x | ISC License | Lucide Project | Bộ biểu tượng đồ họa SVG mã nguồn mở |
| **Zustand** | 4.5.x | MIT License | Paul Henschel & Zustand contributors | Quản lý trạng thái giỏ hàng máy khách |
| **Helmet** | 7.1.x | MIT License | Evan Hahn | Bảo vệ HTTP headers an toàn chống XSS/Clickjacking |
| **Express Rate Limit** | 7.1.x | MIT License | Nathan Friedly | Giới hạn tần suất gọi API chống lạm dụng |
| **Bcryptjs** | 2.4.x | MIT License | Daniel Wirtz | Băm mật khẩu người dùng chuẩn mật mã học |
| **JSONWebToken** | 9.0.x | MIT License | Auth0, Inc. | Tạo và xác thực chữ ký token JWT |
| **Winston** | 3.11.x | MIT License | Charlie Robbins | Hệ thống ghi nhật ký an ninh bảo mật |

---

## 2. NGUỒN DỮ LIỆU ĐỊA LÝ & BẢN ĐỒ MỞ (MAPS & GIS DATA)

- **Nhà cung cấp:** OpenStreetMap Foundation
- **Giấy phép:** Open Database License (ODbL) 1.0
- **Ghi nhận tác quyền:** "© OpenStreetMap contributors"
- **Tuân thủ chính sách:**
  - Ứng dụng tuân thủ triệt để Tile Usage Policy của OSM Foundation.
  - Sử dụng giao thức HTTPS an toàn, có gắn User-Agent định danh rõ ràng.
  - Không tải vượt ngưỡng lưu lượng quy định, có bộ đệm lưu trữ hình ảnh biểu tượng hợp tác xã.

---

## 3. TÀI NGUYÊN HÌNH ẢNH & TRUYỀN THÔNG (MEDIA & IMAGERY)

- **Ảnh minh họa nông sản sinh thái:**
  - Nguồn: Thư viện ảnh Unsplash.
  - Giấy phép: **Unsplash Free License** (Cho phép sử dụng miễn phí cho mục đích thương mại và phi thương mại, không yêu cầu cấp phép riêng).
  - Tác giả được trân trọng ghi nhận:
    - Bưởi đường lá cam & da xanh: Unsplash Photographer `@charlesdeluvio`
    - Sầu riêng & vườn cây trái nhiệt đới: Unsplash Photographer `@kmuza`
    - Hạt điều rang củi: Unsplash Photographer `@tamanna_rumee`
- **Ảnh thực tế tại địa phương:**
  - Tư liệu xác minh các mô hình canh tác tại HTX Nông nghiệp Tân Triều (Huyện Vĩnh Cửu) và HTX Long Khánh (Thành phố Long Khánh).

---

## 4. CAM KẾT KHÔNG SỬ DỤNG MÃ NGUỒN BẤT HỢP PHÁP (ETHICAL COMPLIANCE)

1. Nền tảng **không sử dụng** bất kỳ đoạn mã bị rò rỉ, mã nguồn độc quyền của doanh nghiệp khác khi chưa được cho phép.
2. Không nhúng các API key cá nhân có tính phí hoặc dịch vụ thương mại lậu; toàn bộ các kịch bản chạy thử đều có cơ chế tự hành an toàn (fail-closed / fallback) phục vụ công tác chấm thi khách quan.
