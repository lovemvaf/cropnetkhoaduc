# CROPNET ĐỒNG NAI AI — Nền Tảng Thương Mại Nông Sản Thông Minh & Truy Xuất Nguồn Gốc Số

> **Dự Án Tham Dự Cuộc Thi:** AI Digital Business Challenge 2026 (DiGiFest Đồng Nai)  
> **Căn Cứ Kế Hoạch:** Kế hoạch số 141-KH/TĐTN-CTĐTTN — Ban Thường vụ Tỉnh Đoàn Đồng Nai  
> **Repository:** [https://github.com/lovemvaf/cropnetkhoaduc/tree/main](https://github.com/lovemvaf/cropnetkhoaduc/tree/main)  
> **Kiến Trúc:** Monorepo (Next.js 15 App Router + Express TypeScript + Prisma ORM)

---

## 1. GIỚI THIỆU DỰ ÁN

**CropNet Đồng Nai AI** là nền tảng thương mại điện tử nông sản số thông minh kết nối trực tiếp các Hợp Tác Xã (HTX) nông nghiệp sinh thái tại **Thành phố Đồng Nai** (Mã tỉnh 75) tới người tiêu dùng và khách hàng doanh nghiệp theo mô hình D2C (Direct-to-Consumer).

Nền tảng giải quyết triệt để 3 bài toán lớn của nông sản địa phương:
1. **Minh bạch nguồn gốc 100% (Fail-closed):** Tem QR Code gắn liền với từng quả bưởi Tân Triều, trái sầu riêng Long Khánh; kiên quyết loại bỏ hàng giả và không bao giờ giả lập dữ liệu.
2. **Trợ lý AI Bán Hàng & Tối Ưu Hóa Ngân Sách (AI Copilot 24/7):** Tính toán giỏ hàng đặc sản chính xác theo hạn mức ngân sách khách hàng (300k, 500k, 1 triệu) với độ chính xác 100%, bảo vệ an toàn y tế và tạo yêu cầu báo giá sỉ (RFQ) tự động.
3. **Bản Đồ Nông Nghiệp Số (GIS) & Lịch Mùa Vụ 12 Tháng:** Định vị không gian vùng nguyên liệu cù lao Tân Triều và đất đỏ bazan Long Khánh, hỗ trợ đặt trước mùa vụ.

---

## 2. HỢP TÁC XÃ ĐỐI TÁC ĐÃ ĐƯỢC XÁC MINH

- **HTX Nông Nghiệp Dịch Vụ Tân Triều** (Xã Tân Bình, Vĩnh Cửu, TP Đồng Nai):
  - *Sản phẩm:* Bưởi Đường Lá Cam (OCOP 4 Sao), Bưởi Da Xanh, Rượu Bưởi Tân Triều Truyền Thống.
  - *Mã lô tiêu biểu:* `BATCH-BUOI-TANTRIEU-2026-01`
- **HTX Nông Nghiệp Sinh Thái Long Khánh** (Phường Xuân Lập, TP Long Khánh, TP Đồng Nai):
  - *Sản phẩm:* Sầu Riêng Ri6 Chín Cây Tự Nhiên, Chôm Chôm Nhãn, Hạt Điều Rang Củi Muối Tinh.
  - *Mã lô tiêu biểu:* `BATCH-SAURIENG-LONGKHANH-2026-01`, `BATCH-HATDIEU-DONGNAI-2026-01`

---

## 3. BẢNG TÍNH NĂNG NỔI BẬT

- **Cổng Quét QR & Tra Cứu Tem (`/traceability`):** Hỗ trợ quét camera trực tiếp, tải ảnh tem QR và nhập mã lô thủ công. Cung cấp chứng thư số điện tử và báo cáo kiểm định chất lượng phòng lab.
- **Trợ Lý AI Bán Hàng (`/ai-tu-van`):** Hỗ trợ đối thoại tự nhiên, tính combo theo ngân sách, phản xạ an toàn y tế (từ chối tuyên bố chữa ung thư/tiểu đường), và sinh bản thảo RFQ cho doanh nghiệp.
- **Bản Đồ Vùng Trồng Số (`/ban-do`):** Hiển thị hệ thống tọa độ GIS, ranh giới sông Đồng Nai và chỉ đường Google Maps vệ tinh.
- **Lịch Mùa Vụ 12 Tháng (`/mua-vu`):** Tra cứu độ ngọt Brix, thời điểm chín già tự nhiên và mở cổng đặt trước mùa vụ.
- **Widget AI Nổi (Floating Assistant):** Hiện diện trên toàn bộ các trang để giải đáp thắc mắc của khách hàng bất kỳ lúc nào.

---

## 4. BỘ TÀI LIỆU BÀN GIAO CUỘC THI (DOCUMENTATION SUITE)

Hệ thống tài liệu đầy đủ được lưu trữ trong thư mục `docs/`:
- [`docs/01_REPO_AUDIT.md`](file:///c:/Users/asus/Documents/cropnetkhoaduc/docs/01_REPO_AUDIT.md): Báo cáo audit mã nguồn, kiến trúc và các lỗ hổng bảo mật đã xử lý.
- [`docs/02_MIGRATION_PLAN.md`](file:///c:/Users/asus/Documents/cropnetkhoaduc/docs/02_MIGRATION_PLAN.md): Kế hoạch chuyển đổi toàn diện theo các Gate M0 - M5.
- [`docs/DONG_NAI_2026_DATA_SOURCES.md`](file:///c:/Users/asus/Documents/cropnetkhoaduc/docs/DONG_NAI_2026_DATA_SOURCES.md): Căn cứ pháp lý, địa giới hành chính mã 75 và hồ sơ xác minh HTX.
- [`docs/AI_ARCHITECTURE.md`](file:///c:/Users/asus/Documents/cropnetkhoaduc/docs/AI_ARCHITECTURE.md): Kiến trúc AI Dual-Engine, tool calling và cơ chế an toàn y tế.
- [`docs/AI_EVALUATION.md`](file:///c:/Users/asus/Documents/cropnetkhoaduc/docs/AI_EVALUATION.md): Kết quả kiểm thử thực nghiệm 10 kịch bản test case (Đạt 100%).
- [`docs/API_SOURCES.md`](file:///c:/Users/asus/Documents/cropnetkhoaduc/docs/API_SOURCES.md): Hợp đồng API, giấy phép, quota và cơ chế dự phòng.
- [`docs/OSS_ATTRIBUTIONS.md`](file:///c:/Users/asus/Documents/cropnetkhoaduc/docs/OSS_ATTRIBUTIONS.md): Ghi nhận bản quyền phần mềm mã nguồn mở & dữ liệu OpenStreetMap.
- [`docs/COMPETITION_EVIDENCE.md`](file:///c:/Users/asus/Documents/cropnetkhoaduc/docs/COMPETITION_EVIDENCE.md): Bằng chứng dự thi DiGiFest 2026 và kết quả test 13/13 PASS.
- [`docs/DEMO_SCRIPT.md`](file:///c:/Users/asus/Documents/cropnetkhoaduc/docs/DEMO_SCRIPT.md): Kịch bản thuyết trình và demo trực tiếp 3 - 5 phút cho Ban Giám Khảo.
- [`docs/DEPLOY.md`](file:///c:/Users/asus/Documents/cropnetkhoaduc/docs/DEPLOY.md): Hướng dẫn cài đặt, khởi chạy cục bộ và triển khai sản xuất.

---

## 5. HƯỚNG DẪN KHỞI CHẠY NHANH (QUICK START)

```bash
# 1. Cài đặt các gói phụ thuộc
npm install

# 2. Chạy bộ kiểm thử tự động (13/13 PASS)
npm test

# 3. Biên dịch hệ thống
npm run build:server
npm run build:web

# 4. Khởi chạy môi trường phát triển
npm run dev:server   # Backend chạy tại http://localhost:5000
npm run dev:web      # Frontend chạy tại http://localhost:3000
```

### Tài Khoản Chấm Thi Cấu Hình Sẵn:
- **Admin Quản Trị:** `admin@cropnet.vn` / `123456`
- **HTX Tân Triều (Bưởi OCOP):** `tantrieu@cropnet.vn` / `123456`
- **HTX Long Khánh (Sầu Riêng):** `longkhanh@cropnet.vn` / `123456`
- **Khách Hàng Mua Sắm:** `khachhang@gmail.com` / `123456`

---

## 6. THÔNG TIN BẢN QUYỀN

Dự án được xây dựng trên nền tảng mã nguồn mở phục vụ cuộc thi **AI Digital Business Challenge 2026 (DiGiFest Đồng Nai)**.
© 2026 CropNet Đồng Nai AI. All rights reserved.
