# BÁO CÁO DỌN DẸP MÃ NGUỒN & AN TOÀN DỮ LIỆU (CLEANUP & HARDENING AUDIT - GATE R1)
## Hệ Thống CropNet Đồng Nai AI
### Cuộc thi AI Digital Business Challenge 2026 — DiGiFest Đồng Nai

---

## 1. MỤC TIÊU DỌN DẸP
Thực hiện nghiêm túc chỉ thị: *Dọn sạch mã thừa, dependency thừa, dữ liệu mẫu không phù hợp, cấu hình lỗi và lỗ hổng bảo mật có kiểm chứng; bảo toàn nguyên vẹn các chức năng nghiệp vụ quan trọng và dữ liệu thật của các Hợp tác xã.*

---

## 2. CHI TIẾT CÁC TỆP ĐÃ ĐƯỢC RÀ SOÁT VÀ LÀM SẠCH

### 2.1. Dọn sạch dữ liệu địa phương không phù hợp
| Tệp Mã Nguồn | Vị Trí / Dòng | Nội Dung Cũ Bị Loại Bỏ | Nội Dung Mới Thay Thế (Chuẩn Đồng Nai) |
| :--- | :--- | :--- | :--- |
| `apps/server/src/database/seed.ts` | Toàn bộ seed | Sản phẩm & HTX Bến Tre, Chợ Lách, Cái Mơn | **HTX Nông Nghiệp Dịch Vụ Tân Triều** & **HTX Nông Nghiệp Long Khánh** |
| `apps/server/src/database/dbFallback.ts` | Toàn bộ fallback | Mock nông sản miền Tây | 6 Nông sản OCOP Đồng Nai (Bưởi Đường Lá Cam, Sầu Riêng Ri6, Hạt Điều...) |
| `apps/server/src/modules/analytics/analytics.repository.ts` | Dòng 124 | `Bưởi Da Xanh Bến Tre` | `Bưởi Đường Lá Cam Tân Triều (OCOP 4 Sao)` |
| `apps/web/src/app/dashboard/supplier/page.tsx` | Dòng 242, 645, 732 | `Cục Trồng trọt Bến Tre`, `Hợp Tác Xã Bến Tre` | `Chi cục Trồng trọt & BVTV Đồng Nai`, `HTX Nông Nghiệp Tân Triều, Đồng Nai` |
| `apps/web/src/app/forum/page.tsx` | Dòng 445, 1259 | `Cái Mơn`, `Bến Tre`, `sông Hàm Luông` | `Tân Triều`, `Long Khánh`, `phù sa sông Đồng Nai` |
| `apps/web/src/app/admin/page.tsx` & `dashboard/customer` | Toàn bộ mock logs | Nhật ký xuất xứ tỉnh khác | Nhật ký nông vụ & kiểm định thực tế tại Đồng Nai |

### 2.2. Dọn dẹp cấu hình & An toàn bảo mật (Security Hardening)
- **Loại bỏ rò rỉ localhost:** Tệp `apps/web/src/shared/services/api.ts` được cập nhật để không bao giờ mặc định fallback về `http://localhost:5000/api` trên các bản build production của GitHub Pages.
- **Xóa bỏ hardcode domain ngoài:** Tệp `apps/server/src/modules/traceability/trace.service.ts` được loại bỏ toàn bộ URL cứng `https://cropnet.vn`, đồng bộ hóa sang helper động `getBatchTraceabilityUrl`.
- **Whitelisting file upload an toàn:** Tệp `apps/server/src/modules/upload/upload.routes.ts` kiểm tra nghiêm ngặt phần mở rộng và MIME-type (`image/jpeg`, `image/png`, `image/webp`), giới hạn kích thước 5MB, loại bỏ hoàn toàn nguy cơ thực thi mã độc.
- **Bảo mật xác thực & Đổi mật khẩu:** Tệp `apps/server/src/modules/auth/auth.service.ts` sinh token ngẫu nhiên bằng `crypto.randomBytes(32)` an toàn mật mã, không ghi token nhạy cảm ra console log.
- **Bảo vệ kho hàng nguyên tử (Atomic Inventory Guard):** Tệp `apps/server/src/modules/order/order.repository.ts` sử dụng điều kiện `stock: { gte: quantity }` trong transaction, triệt tiêu nguy cơ oversell khi nhiều người đặt hàng đồng thời.

---

## 3. RÀ SOÁT THƯ VIỆN & PHỤ THUỘC (DEPENDENCY HYGIENE)

- Không cài đặt dư thừa nhiều thư viện cùng chức năng (ví dụ: chỉ sử dụng `qrcode` có sẵn của dự án, không cài thêm `qr-code-styling` hay các gói trùng lặp).
- Các thư viện UI nòng cốt: Lucide-react, TailwindCSS, Zustand, Axios được tinh giản cây import, không tạo gánh nặng tải trang.
- Đã chạy kiểm tra `npm audit` và toàn bộ các gói sử dụng đều tuân thủ giấy phép mã nguồn mở thân thiện (MIT, Apache-2.0, ISC, BSD-3-Clause) được ghi nhận đầy đủ tại [OSS_ATTRIBUTIONS.md](file:///c:/Users/asus/Documents/cropnetkhoaduc/docs/OSS_ATTRIBUTIONS.md).

---

## 4. BẰNG CHỨNG KIỂM THỬ KHÔNG HỎNG NGHIỆP VỤ (REGRESSION TESTING)

Toàn bộ 13/13 test cases đều vượt qua thành công:
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

=== [GATE M3 AI COPILOT & RECOMMENDER TESTS] ===
  ✔ PASS: optimizeBudgetCombo strictly respects 500,000 VND budget without exceeding
  ✔ PASS: optimizeBudgetCombo handles tight 100,000 VND budget correctly
  ✔ PASS: processAiConsultation triggers medical safety guardrail and rejects curative claims
  ✔ PASS: processAiConsultation successfully validates genuine lot code BATCH-BUOI-TANTRIEU-2026-01
  ✔ PASS: processAiConsultation fails closed and alerts user on unknown lot code
  ✔ PASS: getSeasonalCalendarData returns authentic regional crop seasonality
Results: 6 passed, 0 failed.
```
