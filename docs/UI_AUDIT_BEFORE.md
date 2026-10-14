# BẢNG ĐÁNH GIÁ THỰC TRẠNG GIAO DIỆN TRƯỚC REFACOR (GATE D0 — UI/UX AUDIT BEFORE)
## Dự Án: CropNet Đồng Nai AI
### Cuộc Thi: AI Digital Business Challenge 2026 — DiGiFest Đồng Nai

---

## 1. TỔNG QUAN HIỆN TRẠNG (OVERVIEW OF PRE-REFACTOR STATE)

Sau khi kiểm kê mã nguồn tại HEAD commit `403ff1e` và các trang render trên GitHub Pages `https://lovemvaf.github.io/cropnetkhoaduc/`, giao diện hiện tại bộc lộ nhiều dấu ấn "AI-template / Crypto landing page" điển hình cần phải loại bỏ triệt để:
1. **Lạm dụng Gradients & Neon Glow:** Xuất hiện tràn lan `bg-gradient-to-r`, `bg-gradient-to-tr`, text-gradient (`bg-clip-text text-transparent`), nền blur glow (`blur-3xl`), dải màu xanh tím, vàng neon chói mắt.
2. **Hiệu ứng chuyển động quá đà (Senseless Animations):** `animate-ping`, `animate-bounce`, `animate-pulse` trên icon chatbot, sparkles lấp lánh, hiệu ứng scale quá trớn (`hover:scale-105 active:scale-95`).
3. **Typography thiếu phân cấp:** Sử dụng `font-black` cho hầu hết mọi tiêu đề, chữ in hoa toàn bộ (`uppercase tracking-wider`), cỡ chữ siêu nhỏ khó đọc (`text-[9px]`, `text-[10px]`).
4. **Bố cục thẻ lặp lại máy móc:** Các khối 4 ô icon giống hệt nhau, thẻ bo tròn quá lớn (`rounded-3xl`), nhiều lớp đổ bóng nặng (`shadow-2xl`), hộp thoại glassmorphism che khuất ảnh nông sản.
5. **Thiếu bản sắc Nông Sản Đồng Nai:** Chưa toát lên vẻ đẹp mộc mạc, tươi lành, chỉn chu của nông sản cù lao Tân Triều và đất đỏ bazan Long Khánh.

---

## 2. BẢNG CHI TIẾT KIỂM KÊ TỪNG TRANG (PER-ROUTE AUDIT MATRIX)

| Tuyến Đường (Route) | Tệp Nguồn Liên Quan | Vấn Đề Giao Diện Quan Sát | Mức Độ | Mục Tiêu Sửa Đổi (Refactor Target) |
| :--- | :--- | :--- | :---: | :--- |
| **Global / Layout / Header / Footer** | `Header.tsx`, `Footer.tsx`, `FloatingAiWidget.tsx`, `tailwind.config.ts`, `globals.css` | - Dải thông báo DiGiFest có gradient 3 màu nặng nề.<br>- Logo dùng text-gradient và icon lá bóng bẩy.<br>- Badge "24/7 AI" nhấp nháy.<br>- Footer nhồi quá nhiều badge màu mè.<br>- Floating widget dùng nút gradient neon to, `animate-ping` gây xao nhãng. | **Nghiêm trọng (P0)** | - Chuyển sang bảng màu biên tập: Canvas `#FAF9F5`, Forest `#2C4939`, Surface `#FFFFFF`, Border `#E2E5DC`.<br>- Thanh thông báo phẳng, tinh tế, 1 dòng trung tính.<br>- Wordmark CropNet Đồng Nai phẳng, thanh lịch với biểu tượng mầm lá tự nhiên.<br>- Bỏ nút floating AI bóng bẩy; thay bằng nút trợ lý nhỏ gọn, phẳng hoặc tích hợp vào navigation. |
| **Trang Chủ (`/`)** | `apps/web/src/app/page.tsx` | - 2 đốm sáng blur-3xl lớn nền trang.<br>- Badge thi đấu có chấm tròn nhấp nháy `animate-ping`.<br>- Tiêu đề dùng text-gradient 3 màu.<br>- 3 nút CTA to ngang hàng làm loãng hành động chính.<br>- Card ảnh bưởi bị bo tròn `rounded-3xl`, shadow-2xl và có hộp kính nổi đè lên mặt ảnh. | **Nghiêm trọng (P0)** | - Cấu trúc lại dạng bài viết thương mại (Editorial Commerce).<br>- 1 tiêu đề thanh lịch, 1 đoạn dẫn súc tích, 1 CTA chính "Khám phá Nông sản" và 1 link phụ "Truy xuất nguồn gốc".<br>- Khung ảnh tỷ lệ chuẩn, tôn vinh hình ảnh thật của vườn bưởi Tân Triều.<br>- Phân bổ section: Sản phẩm mùa vụ → Câu chuyện nhà vườn → Quy trình QR 3 bước → Tiện ích AI. |
| **Danh Mục Sản Phẩm (`/products`)** | `apps/web/src/app/products/page.tsx`, `ProductCard.tsx` | - Card bo tròn quá mức, hover giật mạnh.<br>- Nhãn đánh giá giả `4.9 ★` gán cứng trên card.<br>- Bộ lọc trên mobile chiếm nhiều diện tích, khó cuộn.<br>- Badge OCOP/VietGAP màu sắc sặc sỡ lộn xộn. | **Cao (P0)** | - Grid card chuẩn 3-4 cột desktop, 2 cột mobile.<br>- Tỷ lệ ảnh 4:5 hoặc 1:1 đồng nhất.<br>- Bỏ rating giả; hiển thị tên nông sản 2 dòng, nhà vườn xuất xứ, giá niêm yết rõ ràng.<br>- Bộ lọc dạng drawer trượt nhẹ nhàng trên mobile. |
| **Chi Tiết Sản Phẩm (`/products/[id]`)** | `ProductDetailPageClient.tsx` | - Bố cục rối, nhiều nút chia sẻ và badge không cần thiết.<br>- Nút Mua hàng và Xem QR tranh chấp sự chú ý.<br>- Mobile: Khu vực chọn số lượng và nút mua bị đẩy sâu xuống dưới. | **Cao (P0)** | - Bố cục 2 cột gallery ảnh - thông tin rõ ràng.<br>- Khối xuất xứ HTX và mã QR truy xuất thiết kế như chứng thư thực địa trang nhã.<br>- Nút "Thêm vào giỏ hàng" là CTA duy nhất nổi bật với màu xanh `#2C4939`. |
| **AI Tư Vấn Bán Hàng (`/ai-tu-van`)** | `apps/web/src/app/ai-tu-van/page.tsx` | - Giao diện đậm chất chatbot crypto với neon, sparkles.<br>- Slider ngân sách màu mè, card combo hiển thị chật chội trên mobile.<br>- Form RFQ thiếu khoảng thở. | **Nghiêm trọng (P0)** | - Chuyển thành "Trợ Lý Mua Sắm Nông Sản Thông Minh".<br>- Khung chat / nhập liệu màu trung tính ấm, chữ rõ ràng dễ đọc.<br>- Thẻ combo hiển thị hình ảnh sản phẩm thực kèm nút "Thêm tất cả vào giỏ".<br>- Modal RFQ phẳng, các trường nhập liệu có nhãn rõ ràng. |
| **Truy Xuất Nguồn Gốc (`/traceability`)** | `apps/web/src/app/traceability/page.tsx`, `TraceabilityDetailClient.tsx` | - Khung camera viền gradient xanh lá.<br>- Timeline nhật ký nhiều màu sặc sỡ.<br>- Giấy chứng nhận mẫu hiển thị như tài liệu giả lập. | **Cao (P0)** | - Khung quét camera tối giản với các đường căn góc tinh tế.<br>- Timeline canh tác dạng đường kẻ thanh mảnh màu olive `#7B876C`.<br>- Báo cáo kiểm định và hồ sơ OCOP trình bày minh bạch, ghi rõ "Hồ sơ tham khảo". |
| **Bản Đồ Nông Nghiệp (`/ban-do`)** | `apps/web/src/app/ban-do/page.tsx` | - Thanh bên che khuất bản đồ trên màn hình nhỏ.<br>- Marker và popup hiển thị màu sắc tùy tiện. | **Trung bình (P1)** | - Tối ưu tỷ lệ bản đồ toàn màn hình có khung viền trang nhã.<br>- Danh sách nhà vườn dạng trượt đáy (bottom sheet) trên mobile. |
| **Lịch Mùa Vụ (`/mua-vu`)** | `apps/web/src/app/mua-vu/page.tsx` | - Lưới 12 tháng quá nhiều màu thẻ khác nhau, gây nhiễu thị giác. | **Trung bình (P1)** | - Trình bày dạng niên lịch nông vụ trang nhã (Seasonal Harvest Calendar).<br>- Phân kỳ chính vụ / rải vụ bằng các sắc thái nhẹ của đất và lá. |
| **Giỏ Hàng & Thanh Toán (`/cart`, `/checkout`)** | `cart/page.tsx`, `checkout/page.tsx` | - Khối tổng tiền và nút thanh toán chưa đủ phân cấp.<br>- Mobile dễ bị tràn bảng liệt kê sản phẩm. | **Cao (P1)** | - Bố cục thương mại chuẩn mực (e-commerce standard).<br>- Nút Đặt hàng / Thanh toán rõ ràng, hỗ trợ đầy đủ chế độ demo an toàn. |
| **Tài Khoản & Dashboards** | `/login`, `/register`, `/admin`, `/dashboard/*`, `/forum` | - Một số bảng biểu bị tràn ngang trên màn hình 360px.<br>- Nút bấm màu xanh lam chọi với màu thương hiệu xanh lá. | **Trung bình (P2)** | - Chuẩn hóa toàn bộ bảng biểu có `overflow-x-auto` và typography 13-14px sắc nét.<br>- Đồng bộ nút bấm, badge trạng thái (Đang xử lý, Hoàn thành, Cảnh báo). |

---

## 3. KẾ HOẠCH BẢO TOÀN NGHIỆP VỤ (REGRESSION COVERAGE)
Mọi thay đổi giao diện phải đảm bảo 100% tính năng hoạt động:
1. `npm test`: Bộ kiểm thử 13/13 bài test (bảo mật JWT, token ngẫu nhiên, fail-closed, AI budget, guardrail y tế) luôn PASS.
2. `npm run build:web`: Xuất khẩu tĩnh 43/43 trang thành công.
3. Không phá vỡ luồng Camera QR Scanner, giải mã file ảnh, đồng bộ giỏ hàng và bản thảo RFQ.
