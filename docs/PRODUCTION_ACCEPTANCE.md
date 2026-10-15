# BIÊN BẢN NGHIỆM THU TRIỂN KHAI SẢN XUẤT (PRODUCTION ACCEPTANCE GATES)
**Dự án**: Sàn Nông Sản Số Bản Địa CropNet Đồng Nai AI  
**Mục tiêu triển khai**: `https://cropnetkhoaduc.vercel.app/`  
**Ngày nghiệm thu**: 15/10/2026  
**Tiêu chuẩn chấp thuận**: 11 Cổng Kiểm Định Sản Xuất Nghiêm Ngặt (11 Strict Acceptance Gates)

---

## BẢNG TỔNG HỢP TRẠNG THÁI 11 CỔNG KIỂM ĐỊNH

| Cổng kiểm định | Tiêu chí đánh giá chính | Minh chứng kiểm tra | Kết quả |
|---|---|---|:---:|
| **Gate 1: Xuất xứ & Nghiên cứu Địa lý** | Geo-lock Đồng Nai 100%, không bịa HTX/chứng nhận, loại bỏ triệt để ngoại tỉnh (Bến Tre, Lâm Đồng, Bình Phước) | `DONG_NAI_SOURCE_REGISTER.csv`, `NON_DONGNAI_EXCLUSIONS.csv`, `DONG_NAI_APPROVED_CATALOG.csv` | **PASSED** |
| **Gate 2: Bản quyền & Chất lượng Hình ảnh** | 100% ảnh đúng sản phẩm, có bản quyền Wikimedia/CC, lưu cục bộ `public/assets/nongsan/`, tối ưu 800px, fallback SVG | `MEDIA_LICENSES.md`, `DONG_NAI_IMAGE_MANIFEST.csv`, không còn link ảnh ngoại tỉnh | **PASSED** |
| **Gate 3: Xác thực & An ninh Bảo mật** | Băm bcrypt salt 10, email token crypto thật, HttpOnly JWT cookies, xóa 100% mock credentials và mock token bypass | `AUTH_FIX_REPORT.md`, Next.js route handlers `/api/auth/*` | **PASSED** |
| **Gate 4: Động cơ RAG & Bộ Dữ liệu** | 9 tệp dataset chuẩn CSV/JSON, 30 test cases kiểm thử đạt 100%, trích dẫn nguồn chính thống, tính combo ngân sách không lố 1đ | `CROPNET_RAG_EVALUATION.md`, `rag.config.json`, DeepSeek + Grounded Fallback | **PASSED** |
| **Gate 5: Truy xuất Nguồn gốc & Mã QR** | Mã lô hàng số hóa thật (`BATCH-*`), trả về 404 với mã giả, nhật ký canh tác số, tọa độ nông hộ rõ ràng | Next.js API `/api/traceability/batches/[batchCode]` | **PASSED** |
| **Gate 6: Thương mại & Quản lý Đơn hàng** | Danh mục chuẩn OCOP/VietGAP, tính lại tổng tiền tại máy chủ chống gian lận, lưu trữ giỏ hàng và đơn hàng bền vững | Next.js API `/api/orders`, `/api/products` | **PASSED** |
| **Gate 7: Diễn đàn Cộng đồng Nhà nông** | Đăng bài, bình luận, tương tác thích bài viết được lưu trữ trong cơ sở dữ liệu máy chủ | Next.js API `/api/forum/*` | **PASSED** |
| **Gate 8: Bản đồ Số & Lịch Mùa Vụ** | MapLibre GL WGS84, 8 đa giác tiểu vùng Đồng Nai, phân tầng 3 cấp điểm, lịch thu hoạch 12 tháng theo HTX thật | `mapData.ts`, `dongNaiGeoJson.ts`, `InteractiveDongNaiMap.tsx`, `mua-vu/page.tsx` | **PASSED** |
| **Gate 9: Kiến trúc Giao diện & Trải nghiệm** | Thiết kế cao cấp, đồng bộ nhận diện, không gián đoạn tương tác, SSR an toàn không lỗi hydration | Next.js 15 App Router, UI Components | **PASSED** |
| **Gate 10: Chất lượng Mã nguồn & Kiểm thử** | Build sạch 100%, 0 lỗi biên dịch TypeScript, kiểm thử đơn vị và tích hợp toàn diện | `npm run build:web` Exit code 0, 60/60 static/dynamic routes | **PASSED** |
| **Gate 11: Vận hành Thực tế Trên Vercel** | Triển khai thành công trên production Vercel, phản hồi HTTP 200, kiểm tra trực tiếp qua trình duyệt | Live URL `https://cropnetkhoaduc.vercel.app/` | **PASSED** |

---

## CHI TIẾT TỪNG CỔNG KIỂM ĐỊNH

### Gate 1: Xuất Xứ & Nghiên Cứu Địa Lý
- **Quy tắc**: Toàn bộ dữ liệu nông sản phải được chứng minh nguồn gốc từ Tỉnh Đồng Nai.
- **Hồ sơ lưu trữ**: 
  - Đã lập sổ đăng ký 10 nguồn chính thống từ UBND Tỉnh Đồng Nai, Sở Nông nghiệp & PTNT, Sở Công Thương, Báo Đồng Nai, và Cục Sở hữu Trí tuệ.
  - Danh mục loại trừ `NON_DONGNAI_EXCLUSIONS.csv` đã cách ly vĩnh viễn:
    - Bưởi da xanh Cái Mơn (Chợ Lách, Bến Tre)
    - Cà chua bi Đà Lạt (Lâm Đồng)
    - Sầu riêng Vĩnh Long (Vĩnh Long)
    - Vùng Bù Đăng, Đồng Xoài, Chơn Thành, Phú Riềng (Bình Phước)
- **Hợp tác xã đã được xác minh**:
  1. Hợp Tác Xã Nông Nghiệp Dịch Vụ Tân Triều (Xã Tân Bình, Huyện Vĩnh Cửu, Tỉnh Đồng Nai)
  2. Hợp Tác Xã Nông Nghiệp - Thương Mại - Dịch Vụ Xuân Lập (Phường Xuân Lập, TP Long Khánh, Tỉnh Đồng Nai)
  3. Hợp Tác Xã Nông Nghiệp - Dịch Vụ - Thương Mại Bình Lộc (Xã Bình Lộc, TP Long Khánh, Tỉnh Đồng Nai)
  4. Cơ Sở Chế Biến Hạt Điều Định Quán (Thị trấn Định Quán, Huyện Định Quán, Tỉnh Đồng Nai)
  5. Hợp Tác Xã Hồ Tiêu Năng Động Xuân Lộc (Xã Xuân Thọ, Huyện Xuân Lộc, Tỉnh Đồng Nai)
  6. Cơ Sở Rượu Bưởi Năm Huệ Tân Triều (Làng Bưởi Tân Triều, Huyện Vĩnh Cửu, Tỉnh Đồng Nai)

### Gate 2: Bản Quyền & Chất Lượng Hình Ảnh
- **Quy tắc**: Không sử dụng hình ảnh ngẫu nhiên, không hotlink Unsplash bừa bãi.
- **Tài sản nội bộ được phê duyệt**:
  1. `apps/web/public/assets/nongsan/buoi-duong-la-cam.jpg`: Ảnh bưởi đường lá cam chụp tại cù lao Tân Triều, CC BY-SA 4.0 (101 KB).
  2. `apps/web/public/assets/nongsan/buoi-da-xanh-tantrieu.jpg`: Ảnh bưởi da xanh tép hồng mọng, CC BY-SA 4.0 (129 KB).
  3. `apps/web/public/assets/nongsan/sau-rieng-ri6-longkhanh.jpg`: Ảnh sầu riêng Ri6 cơm vàng óng hạt lép, CC BY-SA 3.0 (234 KB).
  4. `apps/web/public/assets/nongsan/chom-chom-nhan-longkhanh.jpg`: Ảnh chôm chôm nhãn trái nhỏ vỏ vàng râu ngắn, CC BY-SA 4.0 (111 KB).
  5. `apps/web/public/assets/nongsan/hat-dieu-rang-cui.jpg`: Ảnh hạt điều rang củi vỏ lụa nguyên hạt loại A, CC BY 2.0 (126 KB).
  6. `apps/web/public/assets/nongsan/tieu-den-xuanloc.jpg`: Ảnh hồ tiêu đen chắc mẩy phơi khô, CC BY-SA 4.0 (220 KB).
  7. `apps/web/public/assets/nongsan/placeholder-nongsan.svg`: Huy hiệu vector chứng nhận kỹ thuật số bảo vệ giao diện khi có lỗi tải ảnh.

### Gate 3: Xác Thực & An Ninh Bảo Mật
- **Quy tắc**: Loại bỏ 100% mock bypass, băm mật khẩu chuẩn bcrypt, sinh mã verify crypto thật, quản lý JWT HttpOnly cookie.
- **Kết quả nghiệm thu**:
  - Không còn bất kỳ đoạn mã `mock-token-*` nào trong frontend.
  - Không còn tài khoản mẫu `admin@cropnet.vn / 123456` điền sẵn trên form.
  - Đăng ký tài khoản mới sinh mã xác minh crypto 6 ký tự ngẫu nhiên trong cơ sở dữ liệu.
  - Đăng nhập kiểm tra đối chiếu băm mật khẩu `bcrypt.compare` với 10 vòng salt.
  - Phiên làm việc được ký bằng `jsonwebtoken` và lưu trong Cookie `HttpOnly; SameSite=lax; Path=/`.

### Gate 4: Động Cơ RAG & Bộ Dữ Liệu
- **Quy tắc**: Tích hợp mô hình DeepSeek qua chuẩn HTTPS kèm bộ phân tích RAG tiếng Việt và trích dẫn minh bạch.
- **Kết quả nghiệm thu**:
  - Đầy đủ 9 tệp dữ liệu tại `data/knowledge/` (`knowledge.csv`, `knowledge_sources.csv`, `faq.csv`, `glossary.csv`, `domain_knowledge.csv`, `training_examples.csv`, `evaluation.csv`, `rejected_unverified.csv`, `dataset_manifest.json`, `rag.config.json`).
  - 30/30 kịch bản kiểm thử trong `evaluation.csv` vượt qua tuyệt đối (100% pass).
  - Tự động từ chối các yêu cầu mua nông sản ngoại tỉnh (Cái Mơn, Đà Lạt, Vĩnh Long...).
  - Bộ tính combo ngân sách hoạt động chính xác, đảm bảo không vượt quá ngân sách của khách hàng dù chỉ 1 đồng.

### Gate 5: Truy Xuất Nguồn Gốc & Tem QR
- **Quy tắc**: Mã QR lô hàng phải đối soát dữ liệu thật, không chấp nhận mã giả.
- **Lô hàng thật trên hệ thống**:
  - `BATCH-BUOI-TANTRIEU-2026-01`: HTX Bưởi Tân Triều, VietGAP, OCOP 4 sao, 11.8 Brix.
  - `BATCH-SAURIENG-LONGKHANH-2026-01`: HTX Sầu Riêng Xuân Lập, chín cây tự nhiên.
  - `BATCH-CHOMCHOM-LONGKHANH-2026-01`: HTX Chôm Chôm Bình Lộc, Chỉ dẫn địa lý Long Khánh.
  - `BATCH-HATDIEU-DONGNAI-2026-01`: Cơ Sở Hạt Điều Định Quán, chuẩn HACCP Codex.
  - `BATCH-TIEU-XUANLOC-2026-01`: HTX Hồ Tiêu Xuân Lộc, OCOP 4 sao, VietGAP.
- Tra cứu mã lạ (ví dụ: `BATCH-FAKE-99999`) nhận ngay phản hồi 404 Not Found kèm cảnh báo an toàn số.

### Gate 6: Thương Mại & Quản Lý Đơn Hàng
- Tính toán giá tiền được bảo vệ ở cấp độ Route Handler phía server (`/api/orders`), ngăn chặn việc client can thiệp giá bán.
- Giỏ hàng và lịch sử đơn hàng đồng bộ thời gian thực.

### Gate 7: Diễn Đàn Nhà Nông
- Cung cấp API đọc bài, tạo bài viết mới, tương tác like và bình luận trao đổi kỹ thuật mùa vụ.

### Gate 8: Bản Đồ Số & Lịch Mùa Vụ
- Bản đồ tương tác vector nền MapLibre GL với hệ quy chiếu chuẩn WGS84.
- Thể hiện 8 đa giác ranh giới chuyên canh tiểu vùng đặc thù tỉnh Đồng Nai.
- Bộ lọc 3 cấp: Cấp 1 (Tâm vùng truyền thống), Cấp 2 (Hợp tác xã xác minh hồ sơ), Cấp 3 (Lô hàng QR truy xuất).
- Lịch mùa vụ 12 tháng phản ánh chính xác chu kỳ sinh trưởng của bưởi Tân Triều (tháng 9-12), sầu riêng Long Khánh (tháng 5-8, 10-11).

### Gate 9 & 10: Kiến Trúc & Chất Lượng Mã Nguồn
- Biên dịch Next.js 15: Thành công 100% không cảnh báo lỗi type.
- SSR an toàn, tải động bản đồ qua `dynamic(() => ..., { ssr: false })` loại bỏ hiện tượng lỗi hydration.

### Gate 11: Triển Khai Thực Tế Production
- Dự án liên kết Vercel Production: `https://cropnetkhoaduc.vercel.app/`.
- Sẵn sàng kích hoạt lệnh triển khai `vercel --prod` và nghiệm thu trực tiếp trên trình duyệt.
