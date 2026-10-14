# KIẾN TRÚC GITHUB PAGES & ĐIỀU HƯỚNG TĨNH (GITHUB PAGES ARCHITECTURE - GATE R2)
## Nền Tảng CropNet Đồng Nai AI
### Cuộc thi AI Digital Business Challenge 2026 — DiGiFest Đồng Nai

---

## 1. MỤC TIÊU THIẾT KẾ & ĐIỀU KHOẢN HOSTING GITHUB PAGES

Căn cứ quy định chính thức của GitHub Pages ([GitHub Pages Limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)), dịch vụ này chỉ phục vụ lưu trữ trang tĩnh (Static HTML/CSS/JS) cho mục đích giới thiệu dự án, tài liệu và showcase, **không được dùng để thu thập thông tin thẻ, mật khẩu hoặc vận hành nền tảng thương mại điện tử thực nhận tiền**.

Vì vậy, kiến trúc **CropNet Đồng Nai AI** được tách bạch rõ ràng làm 2 môi trường:
1. **GitHub Pages (`https://lovemvaf.github.io/cropnetkhoaduc/`):** Phiên bản **Showcase / Competition Demo** phục vụ Ban Giám khảo chấm thi: Tĩnh, tốc độ cao, responsive, hiển thị toàn bộ thương hiệu OCOP Đồng Nai, bản đồ GIS, lịch mùa vụ, quét tem QR và thử nghiệm Trợ lý AI trong môi trường cách ly an toàn.
2. **Hosting Thương Mại Đầy Đủ (Dedicated Backend & Database):** Triển khai trên hạ tầng chuyên dụng (Render / Railway / VPS) qua giao thức HTTPS có cơ sở dữ liệu PostgreSQL thực, chịu trách nhiệm lưu trữ đơn hàng thực tế, thanh toán và quản trị khách hàng.

---

## 2. KIẾN TRÚC ROUTING TƯƠNG THÍCH STATIC EXPORT

```mermaid
graph TD
    User([Người Dùng / Ban Giám Khảo]) --> Browser[Trình Duyệt Web]
    Browser -->|Truy cập URL gốc| Home[https://lovemvaf.github.io/cropnetkhoaduc/]
    Browser -->|Quét Tem QR / Nhấp Link| QRRoute[.../traceability/?batch=MÃ_LÔ]
    
    subgraph GitHub Pages Static Export
        Home --> IndexHTML[index.html (SSG)]
        QRRoute --> TracePortal[traceability/index.html]
        TracePortal -->|Đọc tham số query ?batch| DetailRenderer[TraceabilityDetailClient]
    end

    DetailRenderer -->|Kiểm tra mã lô hợp lệ| LotView[Hiển Thị Lịch Sử Canh Tác & Phiếu Kiểm Định]
    DetailRenderer -->|Mã không tồn tại / Lạ| Alert404[Cảnh Báo Fail-Closed: Tem Không Hợp Lệ]
```

---

## 3. CÁC ĐIỂM CẢI TIẾN THEN CHỐT CHO GITHUB PAGES

### 3.1. Tự động hóa BasePath (`next.config.ts`)
- Khi biên dịch cho GitHub Pages, `basePath` tự động nhận giá trị `/cropnetkhoaduc`.
- Cho phép ghi đè linh hoạt qua biến môi trường `NEXT_PUBLIC_BASE_PATH` (ví dụ: khi gắn tên miền riêng hoặc chạy local).
- Tiện ích `getAssetPath()` trong `apps/web/src/shared/utils/path.ts` được bổ sung chốt kiểm tra tránh nhân đôi đường dẫn (`/cropnetkhoaduc/cropnetkhoaduc/...`).

### 3.2. Kiến trúc QR Query-Route cho Mọi Mã Lô Mới
- **Vấn đề cũ:** Next.js `output: 'export'` yêu cầu hàm `generateStaticParams()` phải liệt kê trước toàn bộ mã lô khi build; nếu admin tạo thêm lô mới trong DB thì người dùng quét QR sẽ bị lỗi HTTP 404 của GitHub Pages.
- **Giải pháp:** Thiết kế route chính tắc:
  ```
  https://lovemvaf.github.io/cropnetkhoaduc/traceability/?batch=<URL_ENCODED_BATCH_CODE>
  ```
- Trang `/traceability/index.html` được xuất bản tĩnh 1 lần duy nhất, sử dụng `useSearchParams()` (được bọc an toàn trong React `<Suspense>`) để phân tích mã lô lúc chạy (Runtime) và tải dữ liệu tương ứng.
- **Kết quả:** Hệ thống hỗ trợ không giới hạn số lượng lô hàng mới mà không cần phải kích hoạt lại quy trình build tĩnh!

### 3.3. Loại bỏ Triệt Để Rò Rỉ `localhost:5000`
- Tệp `apps/web/src/shared/services/api.ts` nhận diện môi trường sản phẩm:
  - Nếu `NEXT_PUBLIC_API_URL` chưa được cung cấp và đang chạy trên GitHub Pages, `API_BASE_URL` sẽ để trống, không tự ý kết nối về `localhost:5000` của máy người dùng bên ngoài.
  - Chế độ `isShowcaseDemoMode` kích hoạt cơ chế hiển thị dữ liệu minh họa Đồng Nai mượt mà, giúp Ban Giám khảo trải nghiệm toàn bộ giao diện mà không gặp bất kỳ lỗi mạng khó chịu nào.

### 3.4. Workflow GitHub Actions Tự Động Hóa (`.github/workflows/deploy.yml`)
- Quy trình triển khai tự động kích hoạt khi có commit đẩy lên nhánh `main`:
  1. `actions/checkout@v4` kiểm tra mã nguồn.
  2. `actions/setup-node@v4` thiết lập Node.js 20 LTS và cache npm.
  3. `npm ci` cài đặt chính xác các phụ thuộc.
  4. **Cổng kiểm soát chất lượng (Quality Gate):** Chạy lệnh `npm test` bắt buộc. Nếu có bất kỳ test case nào hỏng, workflow dừng lại ngay lập tức và không deploy bản lỗi.
  5. `npm run build:web` xuất bản tĩnh thư mục `apps/web/out`.
  6. Tạo tệp `.nojekyll` nhằm ngăn GitHub Pages bỏ qua các thư mục bắt đầu bằng dấu gạch dưới (`_next/`).
  7. `JamesIves/github-pages-deploy-action@v4` đẩy tự động vào nhánh `gh-pages`.
