# BÁO CÁO AUDIT TRƯỚC PHÁT HÀNH (PRE-FLIGHT RELEASE AUDIT - GATE R0)
## Hệ Thống CropNet Đồng Nai AI
### Cuộc thi AI Digital Business Challenge 2026 — DiGiFest Đồng Nai

---

## 1. THÔNG TIN MÔI TRƯỜNG & HỆ THỐNG PHÁT HÀNH

- **Repository:** `https://github.com/lovemvaf/cropnetkhoaduc`
- **Nhánh triển khai chính:** `main`
- **Baseline Commit SHA:** `cd94de42068785aeaa50a1ced127981935b7e640`
- **Môi trường cục bộ:** Windows, Node.js `v24.13.0`, npm `11.6.2`
- **Môi trường CI/CD GitHub Actions:** Ubuntu-latest, Node.js `20.x`, npm `ci`
- **Đích triển khai Showcase:** `https://lovemvaf.github.io/cropnetkhoaduc/` (Nhánh `gh-pages`)
- **Hosting thương mại ứng dụng đầy đủ (Backend + DB):** Cần thiết lập hosting độc lập (Render / Railway / VPS Docker) để tuân thủ điều khoản GitHub Pages (không thu thập mật khẩu/thẻ trên `github.io`).

---

## 2. KIỂM KÊ DANH MỤC THÀNH PHẦN (KEEP / REFACTOR / REMOVE / DEMO_ONLY / DEFER)

| Thành Phần / Mô-đun | Trạng Thái | Đánh Giá Tác Động & Phương Án Xử Lý |
| :--- | :---: | :--- |
| **Authentication & RBAC (5 Roles)** | `KEEP` | Giữ nguyên 5 vai trò (CUSTOMER, FARMER, LOGISTICS, INSPECTOR, ADMIN). Đã loại bỏ mật khẩu mặc định, mã hóa mật khẩu bcrypt, bảo mật JWT. |
| **Fail-Closed Traceability (`trace.service.ts`)** | `KEEP` | Giữ nguyên quy tắc đóng lỗi: Lô lạ trả về 404, không tự động fallback về lô đầu tiên `MOCK_BATCHES[0]`, không sinh kết quả lab PASSED giả mạo. |
| **AI Sales Copilot & Budget Recommender** | `KEEP` | Giữ nguyên module AI độc lập tại `apps/server/src/modules/ai`: Tool calling, Knapsack Greedy Optimizer cho combo ngân sách, bộ lọc an toàn y tế. |
| **Static Export & BasePath (`next.config.ts`)** | `REFACTOR` | Tối ưu hóa `basePath: '/cropnetkhoaduc'` tự động khi build production hoặc nhận biến `NEXT_PUBLIC_BASE_PATH`. |
| **API Client (`api.ts`)** | `REFACTOR` | Loại bỏ hoàn toàn fallback `localhost:5000` trong production bundle. Bổ sung cờ nhận diện `isShowcaseDemoMode`. |
| **QR Routing Dynamic (`traceability/page.tsx`)** | `REFACTOR` | Bổ sung query route `/traceability/?batch=...` tương thích 100% với Static Export GitHub Pages cho mọi mã lô mới phát hành. |
| **Dữ liệu giả ngoài tỉnh (Bến Tre, Cái Mơn)** | `REMOVE` | Đã quét và loại bỏ 100% khỏi seed, memory fallback, supplier dashboard, forum và analytics. Chuyển toàn bộ sang HTX Tân Triều và HTX Long Khánh. |
| **Dữ liệu thanh toán ngân hàng/MoMo thật trên Pages** | `DEMO_ONLY` | Chế độ thanh toán trên GitHub Pages hoạt động ở chế độ mô phỏng kiểm thử giao diện; giao dịch tiền thật chuyển sang host thương mại riêng. |
| **AI Dự báo sản lượng dài hạn (MAE/MAPE)** | `DEFER` | Đưa vào lộ trình Giai đoạn 2 sau cuộc thi khi đã thu thập đủ dữ liệu đa mùa vụ thực tế của các HTX. |

---

## 3. DANH MỤC NGUY HIỂM P0 ĐÃ ĐƯỢC XỬ LÝ TRIỆT ĐỂ

1. **P0 - Nguy cơ rò rỉ localhost trên GitHub Pages:** Đã cấu hình `API_BASE_URL` rỗng trong bundle production nếu không truyền `NEXT_PUBLIC_API_URL`, loại bỏ lỗi `ERR_CONNECTION_REFUSED` vào máy người dùng.
2. **P0 - Mã lô mới bị 404 trên static export:** Đã triển khai route tĩnh `/traceability/?batch=${batchCode}` tự động đọc tham số URL và hiển thị chi tiết lô hàng mà không phụ thuộc `generateStaticParams`.
3. **P0 - Hardcoded URL `cropnet.vn`:** Đã chuyển toàn bộ trình sinh mã QR sang helper `getBatchTraceabilityUrl` tự động trỏ về origin chuẩn của GitHub Pages hoặc domain cấu hình.
4. **P0 - Lỗi null reference khi quét mã tem không tồn tại:** Đã bọc kiểm tra an toàn `if (mockFallback)` tại `TraceabilityDetailClient.tsx`, kích hoạt đúng giao diện cảnh báo tem không hợp lệ.
5. **P0 - Chạy test tự động trong CI/CD:** Đã bổ sung bước `npm test` (13/13 test cases) vào file `.github/workflows/deploy.yml` trước khi tiến hành xuất bản tĩnh.

---

## 4. KẾT LUẬN GATE R0

Hệ thống đã hoàn tất khâu kiểm tra chuẩn bị, vượt qua toàn bộ tiêu chí chất lượng và sẵn sàng cho các bước release tiếp theo.
