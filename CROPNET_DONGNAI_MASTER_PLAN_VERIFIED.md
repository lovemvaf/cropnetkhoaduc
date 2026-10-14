# CropNet Đồng Nai AI — MASTER PLAN nâng cấp sản phẩm & dự thi AI Digital Business Challenge 2026

> Trạng thái: **ĐÃ AUDIT TĨNH REPOSITORY QUA KẾT NỐI GITHUB**, commit `cd94de42068785aeaa50a1ced127981935b7e640`; CHƯA clone/build/test chạy thực tế. Ngày lập: 14/10/2026. Repository đích: https://github.com/lovemvaf/cropnetkhoaduc/tree/main. Agent lập trình cần xác minh HEAD mới nhất và chạy baseline trước khi sửa.
>
> Cuộc thi căn cứ: `KH.CuocthiAIDigitalBusinessChallenge.DiGiFest.2026_dadongdau (1).pdf` người dùng gửi, đặc biệt phần yêu cầu **chọn 01 doanh nghiệp/hộ kinh doanh/hợp tác xã/khởi nghiệp thật**, website/nền tảng truy cập online, tính năng AI thao tác được, thuyết minh + video demo. Theo file: hoàn thiện/nộp đến hết 15/10/2026, sơ khảo 15–trước 20/10, chung kết dự kiến 30/10/2026. Giai đoạn tiếp nhận đăng ký trước đó ghi đến 30/9: cần kiểm tra tư cách đăng ký với BTC.

# BỔ SUNG KIỂM CHỨNG TỪ REPOSITORY GITHUB THẬT — ƯU TIÊN CAO HƠN MỌI ĐỀ XUẤT CHUNG BÊN DƯỚI

**Đã đọc qua kết nối GitHub của người dùng:** `lovemvaf/cropnetkhoaduc`, default branch `main`, commit HEAD lúc kiểm tra `cd94de42068785aeaa50a1ced127981935b7e640` (commit ghi nhận 2026-05-27). Đây là **audit tĩnh các tệp mã nguồn, chưa clone/build/test live**, chưa có bằng chứng các luồng đã chạy trên deployment thực. Trước khi code, agent phải checkout SHA/đọc HEAD mới nhất và so sánh thay đổi; nếu repository đã tiến lên, không ghi đè công việc nhóm.

## V1. Thực trạng chính xác đã xác minh

| Nhóm | Đã có trong mã nguồn | Chưa chứng minh/việc phải làm |
|---|---|---|
| Kiến trúc | Monorepo npm workspaces, `apps/web` Next.js 15 App Router, Tailwind, Zustand, `apps/server` Express/TypeScript, PostgreSQL/Prisma, `packages/ui`, `packages/types`, `packages/utils` | **Tận dụng mã nguồn hiện tại**, không đổi sang Supabase/Medusa/Next.js single backend một cách tùy tiện. |
| Tài khoản | Auth JWT, roles `ADMIN`, `CUSTOMER`, `FARMER`, `LOGISTICS`, `INSPECTOR`; giao diện role dashboards | Cần rà soát bảo mật token/mật khẩu, role ownership, chặn fallback mock ở production. |
| Kinh doanh | `/products`, `/cart`, `/checkout`, `/orders/[id]`, supplier dashboard, admin, inspector, logistics, analytics, forum; `Order`/`OrderItem`/`Payment`/`Shipment` có sẵn trong Prisma | Không làm lại checkout; thêm AI -> giỏ/đơn hiện hữu qua API an toàn; đánh giá luồng thật vs mock. |
| QR | `apps/server/src/modules/traceability/` đã có API CRUD lô/QR và `qrcode`; UI `/traceability/[batchCode]`; `TraceBatch`, `Certification` có sẵn | **Nâng cấp** QR lô, thêm timeline canh tác/ảnh thật, xác minh và phân biệt demo; không tạo QR mới từ đầu như giả định. |
| Địa điểm | `Supplier` đã có `farmName`, `address`, `latitude`, `longitude` | Bổ sung danh mục địa giới TP Đồng Nai, tính rõ visibility coords, map hiển thị từ dữ liệu thật. |
| Dữ liệu/ảnh | Seed và fallback còn bưởi Cái Mơn, cà chua Đà Lạt, sầu riêng Vĩnh Long, xoài Hòa Lộc; static ảnh dưới `apps/web/public` và `San pham/`; homepage còn ảnh Unsplash | Bắt buộc thay bộ dữ liệu và thông điệp, không đổi tên nhãn ảnh cũ thành sản phẩm Đồng Nai. |
| Deploy | `apps/web/next.config.ts` đang dùng `output:'export'`, `basePath` dựa vào `GITHUB_REPOSITORY`; `.github/workflows/deploy.yml` xuất frontend sang GitHub Pages; `docker-compose.yml` chạy web+Express+Postgres | Static export có hạn chế dynamic QR mới; GitHub Pages **không chạy Express/Postgres**. Chọn deployment hoạt động end-to-end, ngăn URL backend localhost trong production. |

## V2. CÁC PHÁT HIỆN PHẢI SỬA ĐẦU TIÊN — CÓ CHỈ RÕ TỆP

### V2.1. P0 / Blocker chứng minh nguồn gốc: dữ liệu giả khi DB lỗi

- `apps/server/src/modules/traceability/trace.repository.ts` `findBatchByCode`: `MOCK_BATCHES.find(...) || MOCK_BATCHES[0]` khi lỗi DB, rồi trả `batchCode` từ yêu cầu. Điều này có thể hiển thị **mã lô người dùng hỏi gắn với dữ liệu một lô khác**. Trong sản phẩm/production phải trả lỗi không truy xuất được (`503`/`not verified`) chứ không được hiển thị lô giả.
- `apps/web/src/app/traceability/[batchCode]/TraceabilityDetailClient.tsx` có **frontend mock fallback** khi API lỗi với thông tin chứng nhận/logistics giả lập. Loại bỏ khỏi public production; chỉ cho phép demo có nhãn chế độ mô phỏng mạnh và không thể nhầm với xác minh thật. Hãy kiểm tra thêm các fallback trong `product.repository.ts`, `order.repository.ts`, `analytics.service.ts`, `dbFallback.ts`: production **fail closed**, không tạo đơn hàng giả, doanh thu giả hoặc sản phẩm sai khi DB down.
- `apps/server/src/modules/traceability/trace.service.ts` tự tạo `buildDefaultLogisticsTimeline` có các sự kiện vận chuyển tới trạng thái `DELIVERED` trong tương lai, `buildDefaultInspectionReports` đánh dấu `PASSED`, ghi tồn dư thuốc `0.0%`, tự tạo vận đơn/chuyến xe/nhiệt độ (`buildDefaultShipmentInfo`). Các dữ liệu này có thể bị hiểu là kiểm định hay vận tải đã xảy ra thật. **CẤM tự tạo kiểm định PASS/vận chuyển DELIVERED trên lô thực**; yêu cầu bằng chứng, workflow kiểm tra và trạng thái `CHƯA XÁC MINH`/`CHƯA CÓ DỮ LIỆU`. Nếu dùng demo thì gắn nhãn `DỮ LIỆU GIẢ LẬP` rõ ràng trên UI, PDF, QR và API.

### V2.2. P0 / QR & static deploy

- `trace.service.ts` dòng tạo QR khi tạo/sửa lô ghép `https://cropnet.vn/traceability/<batchCode>` **hardcode**, trong khi `getBatchQR`/`regenerateBatchQR` lấy `FRONTEND_URL` hoặc fallback localhost. Chuẩn hóa origin từ cấu hình deploy server-only an toàn, thống nhất giữa lưu/tải/tạo QR, không cho request client điều khiển host. Có kiểm thử scan QR camera tới URL công khai thật.
- `apps/web/src/app/traceability/[batchCode]/page.tsx` `generateStaticParams` hiện liệt kê **9 mã lô cố định** (gồm Cái Mơn/Đà Lạt…). Khi `output:'export'`, QR mới phát sinh có thể **không có trang tĩnh được export**, nên có nguy cơ 404. Chuyển sang hosting hỗ trợ dynamic route/server rendering hoặc định tuyến `/traceability/?batch=<code>` và xác minh thật trên môi trường static-compatible (nếu vẫn giữ GitHub Pages); **không tự khẳng định đã sửa nếu chưa quét QR mới trên deployment thực**.
- Hệ thống hiện đã có `qrcode` ở backend, nên ưu tiên **giữ thư viện hiện hữu**, thêm browser scanner (`nimiq/qr-scanner` hoặc `zxing-js/browser`) chỉ khi thiếu; không cài thư viện tạo QR thứ hai không cần thiết. Nếu muốn token ngẫu nhiên không đoán được, phải migration/backward compatibility cho mã cũ và phân quyền công khai/riêng tư, không làm hỏng QR đã phát hành.

### V2.3. P0 / Secrets và an toàn thông tin

- `apps/server/src/modules/auth/auth.service.ts` và `middlewares/auth.middleware.ts` có **fallback chuỗi JWT secret**; thiếu cấu hình trong production phải **từ chối khởi động**, không sử dụng secret mặc định.
- `auth.service.ts` tạo mã verify/reset 6 ký tự bằng `Math.random()` và log mã reset/xác minh; cần dùng `crypto.randomBytes`/token đủ entropy, hash token tại database, TTL, rate limit, chống dò; trong production không log mã, không trả token trong response. Nếu ứng dụng chưa có email provider, ghi rõ blocked, không giả gửi email.
- `README.md` và `seed.ts` có tài khoản demo mật khẩu mặc định `123456`; `docker-compose.yml` có mật khẩu/secret/JWT mẫu và MoMo sandbox config trong file. Dời cấu hình sang biến env/secret store, sử dụng password demo **chỉ trong local/test**, cấm seed tài khoản này cho public production; rà soát việc secret mẫu có bị dùng thật không và xoay secret nếu có. Không coi chuỗi test là credential sản xuất.
- `apps/server/src/modules/upload/upload.routes.ts`: `POST /api/upload` hiện **không có auth**, chỉ kiểm tra `file.mimetype.startsWith('image/')`, lưu tệp dưới `/uploads` public. Thêm xác thực/phân quyền, giới hạn quota/rate, kiểm tra magic bytes/dung lượng/định dạng hợp lệ, tái mã hóa ảnh để chặn nội dung nguy hiểm và metadata, hạn chế kích thước ảnh, ownership, chống spam/lạm dụng. Sau đó mới nhận ảnh nhà vườn/chứng nhận.
- Rà soát kiểm tra quyền `FARMER` sửa lô/sản phẩm và `INSPECTOR` xác minh chứng nhận; public không được tự tuyên bố chứng nhận đã duyệt. `trace.routes.ts` có route thêm chứng nhận dành cho inspector, nhưng seed và fallback hiện có nội dung kiểm định giả, nên cần tách nguồn/phê duyệt rõ ràng.

### V2.4. P0 / Checkout, đơn và thống kê

- `apps/server/src/modules/order/order.repository.ts` đã dùng `prisma.$transaction` và trừ tồn; **giữ nguyên, không tạo đơn thứ hai trong AI**. Rà soát concurrency nếu chỉ đọc stock rồi ghi số `stock - quantity` dẫn đến nguy cơ oversell khi nhiều đơn đồng thời; sửa thành thao tác cập nhật tồn nguyên tử/điều kiện và test race condition 2 khách mua đồng thời.
- `product.repository.ts` fallback sản phẩm sai (`find(...) || MOCK_PRODUCTS[0]`); `order.repository.ts` fallback tạo `mock-order-*`; `analytics.service.ts` có doanh thu và số đơn mock. Production phải tắt fallback và dashboard không trộn mock với số liệu thật.
- `apps/web/next.config.ts` đang đặt `eslint.ignoreDuringBuilds: true`; CI phải chạy lint/typecheck/test riêng và build thực tế, không dùng cấu hình bỏ qua lỗi làm tiêu chuẩn nghiệm thu.

## V3. THIẾT KẾ TỐI ƯU CHO KIẾN TRÚC ĐÃ CÓ

**Không thay stack.** Đặt tất cả API AI vào backend Express hiện hữu (`apps/server/src/modules/ai/`), gọi từ `apps/web` qua `apiClient` tại `apps/web/src/shared/services/api.ts`. LLM keys **chỉ trên server**. Dùng Prisma models đã có; migrate bổ sung các model như `CultivationEvent` (nhật ký lô), `FarmMedia`/`LotMedia`, `CropSeason`, `AiInteraction/SupportTicket`, `AdministrativeUnit`, `QuoteRequest` **chỉ khi kiểm tra không có model tương đương**. Giữ `TraceBatch`, `Certification`, `Supplier`, `Product`, `Order`, `OrderItem`, `Review`, `Payment`, `Shipment` và routes hiện hữu; thêm trường/quan hệ thay vì làm lại.

**Giao diện:** lấy `apps/web/src/app/page.tsx` + `Header.tsx`, `Footer.tsx`, `ProductCard.tsx`, `/products`, `/products/[id]`, `/traceability/[batchCode]`, `/dashboard/supplier`, `/admin` làm điểm mở rộng. Tách dần file client quá lớn thành components/hook và tests, nhưng **không refactor lớn trước khi chạy demo** (trang trace hiện hơn 1.000 dòng, dashboard supplier hơn 100 KB, admin ~75 KB). Thêm `/nha-vuon`, `/ban-do`, `/mua-vu`, `/ai-tu-van`, `/ho-tro` theo route thực của codebase, tránh tạo trang trùng.

**AI phù hợp để thi:** Chatbot dựa trên **DB trực tiếp** qua tool `searchProducts/getProduct/getBatches/getSupplier/getSeason/getPolicy`, recommend theo ngân sách với rule-check giá/tồn, tạo cart/quote draft bằng xác nhận người dùng. Những nâng cao: AI tóm tắt CSKH/soạn câu trả lời có nguồn; AI B2B quote; mùa vụ và sản lượng trước mắt là nhà vườn nhập, không gọi toán thống kê đơn giản là AI dự báo.

**AI adapter:** ưu tiên model API free-tier được phép sử dụng theo điều khoản, nhưng có server-side abstraction `AI_PROVIDER`, `AI_MODEL`, `AI_API_KEY`, rate limit, cost quotas, structured JSON/Zod validation, fallback **không-AI minh bạch** khi key thiếu. Không tự tạo secret, không giả API live, không gửi PII không cần thiết, không cho prompt injection từ sản phẩm/nhật ký thay đổi tool policy.

**Dữ liệu địa phương:** Seed cũ **là bộ minh họa nhiều tỉnh**, không được thay chuỗi `Cái Mơn` → `Đồng Nai` trên sản phẩm cũ. Hãy tạo `seed-dongnai-demo` có nhãn rõ, danh mục thật từ đối tác có bằng chứng và media permission; ảnh cũ giữ archive nếu cần. Địa chỉ sau 30/4/2026 hiển thị `Thành phố Đồng Nai`, code 75; lấy đơn vị xã/phường từ NSO, không tin API community chưa đồng bộ 2026; không khai báo danh hiệu OCOP/VietGAP giả.

## V4. Thứ tự thực thi BẮT BUỘC theo repo

1. **Security/data-trust hotfix:** không mock data khi production DB lỗi; dừng tự sinh `PASSED`/`DELIVERED`; fail-closed JWT/env, giới hạn upload; test lô không tồn tại, lỗi DB, không lộ token.
2. **Geo/content:** chỉnh thành nông sản Thành phố Đồng Nai dựa trên chứng cứ, seed demo gắn nhãn, hình ảnh đúng vùng/giấy phép, bộ địa chỉ 2026.
3. **QR hiện hữu -> QR thực:** chuẩn URL, kiểm static route/deploy, nhật ký trồng/chăm sóc + ảnh, update/scan, tính trạng thái xác minh, test mobile QR.
4. **AI -> bán hàng:** Chatbot RAG/tool truy vấn dữ liệu thật, recommender có validator, tạo giỏ hoặc quote vào DB và dashboard, chuyển người nếu cần.
5. **Commerce + map + season:** tận dụng hệ thống order/analytics/auth, bổ sung map/farm pages/season/ticket theo nhu cầu thực; chỉ làm forecast khi có dữ liệu.
6. **Competition:** build/lint/typecheck, test auth/QR/checkout/AI, deploy **cả backend+DB** (nếu frontend GitHub Pages thì cần API công khai an toàn), demo live, benchmark, video, thuyết minh theo rubric; freeze trước deadline.

## V5. Kiểm thử đặc biệt phải bổ sung

- DB down -> QR/đơn/sản phẩm trả lỗi và KHÔNG trả một record mock giả; test `batchCode=NOT_EXIST` không bao giờ nhận `MOCK_BATCHES[0]`.
- Không có lab report thật -> UI phải hiển thị `Chưa có kết quả kiểm định`, không được có `PASSED` hoặc `0.0%` mặc định.
- Không có chuyến xe thật -> không tạo timeline `DELIVERED` hay số xe trong tương lai; chỉ ghi hành động người vận hành đã xác nhận.
- QR tạo mới trên production -> quét mobile ra đúng URL mới và đúng lô; lô chưa publish, thu hồi, không tồn tại có trang trạng thái phù hợp.
- `POST /api/upload` là người không đăng nhập -> bị từ chối. Upload giả định là ảnh nhưng nội dung không phải ảnh -> bị từ chối.
- Thiếu `JWT_SECRET`/`JWT_REFRESH_SECRET` trong production -> boot fail; token reset không lộ qua log.
- Gọi chat hỏi giá, tồn kho, OCOP chưa duyệt -> không bịa số hoặc chứng nhận. AI chọn đúng sản phẩm khi ngân sách và số lượng thay đổi.
- Hai khách đồng thời mua gần hết tồn -> không thể làm tồn âm.
- Frontend static export: route QR không có trong `generateStaticParams` phải mở được trên host thực sau sửa hoặc báo rõ giới hạn.
- App online chạy khi frontend và backend deploy khác origin, cookie/CORS/CSRF hoạt động; tránh `NEXT_PUBLIC_API_URL=http://localhost:5000/api` trong production.

**Tóm lại:** Kế hoạch tổng thể phía dưới vẫn hữu ích về sản phẩm và mục tiêu thi, nhưng các phát hiện mã nguồn này **phải được áp dụng trước và được xem là điều chỉnh chính thức**. Không được xem trang QR và chức năng thương mại là hoàn toàn chưa có; không được xem demo fallback và kiểm định tự sinh là dữ liệu đã được xác minh. Đội cần đo hiệu quả của AI **sau** khi nền tảng thật, tính đúng dữ liệu và bảo mật đáp ứng yêu cầu.

---

## A. Mục tiêu sản phẩm, giới hạn, định vị

**Tên đề xuất:** CropNet Đồng Nai AI — Kết nối nông sản địa phương, nguồn gốc minh bạch, mua hàng thông minh.

**Định vị:** Nền tảng B2C/B2B kết nối người mua với **một hợp tác xã hoặc đơn vị kinh doanh nông sản cụ thể trước**; mở rộng nhiều nhà vườn sau. Không biến website thành cổng thông tin rời rạc không có người bán, sản phẩm, giá, đơn hoặc đầu mối chịu trách nhiệm.

**Giá trị kiểm chứng được:** (1) giảm thời gian người mua tìm đúng nông sản; (2) giảm thời gian người bán tư vấn/báo giá; (3) khách tự tra được lô hàng và nhật ký có nguồn; (4) nhà vườn chủ động cập nhật lô, mùa vụ và dự kiến cung ứng; (5) chủ cơ sở có bảng theo dõi nhu cầu, đơn, chất lượng chăm sóc khách và tương tác AI.

**Nguyên tắc:** Sản phẩm bán hàng chạy được trước, AI hỗ trợ toàn bộ luồng sau. Không gọi một trang chatbot duy nhất là nền tảng AI. AI trả lời theo dữ liệu có bằng chứng; số tiền, tồn kho, trạng thái đơn, địa chỉ và chứng nhận do hệ thống/quản trị xác định, không để LLM bịa. Người dùng chủ động xác nhận trước khi tạo đơn, yêu cầu báo giá và chuyển người thật.

**Giới hạn:** Không tự tuyên bố VietGAP/GlobalGAP/OCOP nếu không có hồ sơ hợp lệ; không khẳng định QR chứng minh tuyệt đối nông sản không bị tráo; không giả ảnh người bán thật/vườn thật; không tuyên bố dự báo sản lượng đáng tin nếu thiếu dữ liệu; không tự động thu tiền, không tự tạo API key hoặc đăng ký gói trả phí.

## B. Công việc M0 bắt buộc: audit repo hiện hữu — KHÔNG ĐƯỢC BỎ QUA

1. `git clone`/mở workspace đúng repo + branch, xác minh commit SHA, quyền truy cập, package manager, framework, cách run/deploy, routes/pages, UI components, database, auth, API, assets, env, tests, CI, licenses.
2. Chạy install/build/lint/typecheck/test bằng lệnh thực tế của repo; ghi kết quả, không đoán lệnh. Chụp ảnh các trang cũ (nếu có thể) và lập baseline chức năng.
3. Kiểm kê các đường dẫn, nút bấm, mock data, chức năng chết, lỗi, bảo mật, quyền sở hữu hình ảnh; chỉ ra component dùng lại, schema có thể migrate.
4. Cập nhật audit tĩnh có sẵn bên trên bằng kết quả chạy thực tế; viết `docs/01_REPO_AUDIT.md`: cấu trúc, commit SHA, bảng `feature: existing/partial/missing/broken`, lý do và đề xuất sửa; `docs/02_MIGRATION_PLAN.md` với các migration an toàn, nguy cơ phá tương thích, phương án rollback.
5. Tạo branch `feat/dong-nai-ai-competition` (trừ khi người dùng đã quy định cách làm), commit theo mốc; không force push, không xóa lịch sử, không ghi đè `.env` và dữ liệu hiện hữu. **Không thêm framework mới nếu không cần thiết**.
6. **Chỉ sau audit** mới được chốt stack hoặc lựa chọn repo bên ngoài. Ưu tiên sửa/mở rộng project thay vì clone Medusa/Payload rồi thay toàn bộ.

## C. Nguồn dữ liệu Đồng Nai & chuyển đổi địa phương 2026

### C1. Sự kiện pháp lý và nhãn hiển thị
- Theo nguồn nhà nước được tra cứu 14/10/2026, **Thành phố Đồng Nai** thành lập theo Nghị quyết **30/2026/QH16**, chính thức hoạt động từ **30/04/2026**, **mã cấp tỉnh 75**; 95 đơn vị hành chính cấp xã gồm **33 phường và 62 xã** (xác nhận lại danh mục từng đơn vị tại nguồn chính thức trước khi seed).
- Cập nhật toàn bộ `Nông sản Việt`/`Nông sản Việt Nam` trong phạm vi branding hiện tại thành **Nông sản Thành phố Đồng Nai** hoặc thương hiệu `CropNet Đồng Nai AI`, nhưng giữ khả năng cung ứng từ nơi khác nếu được định nghĩa là mở rộng tương lai; không tự gán sản phẩm ngoài vùng thành hàng Đồng Nai.
- Địa chỉ mới lưu cấu trúc: `ward_code`, `ward_name`, `city_code=75`, `city_name="Thành phố Đồng Nai"`, `address_detail`, `geo_point`, `source_verified_at`, có trường `legacy_address` dành cho dữ liệu cũ; không bắt nhập huyện không còn là cấp hành chính chuẩn.

### C2. Địa chỉ và nguồn API ĐÃ TÌM THẤY
1. **Cục Thống kê – danh mục hành chính (nguồn chính thức):** https://danhmuchanhchinh.nso.gov.vn/ (hiển thị Thành phố Đồng Nai, mã 75), dịch vụ SOAP: https://danhmuchanhchinh.nso.gov.vn/DMDVHC.asmx ; phương thức chính thức trên trang: `DanhMucTinh`, `DanhMucPhuongXa`, `DanhMucQuanHuyen`. Hướng dẫn riêng cho `DanhMucTinh`: https://danhmuchanhchinh.nso.gov.vn/DMDVHC.asmx?op=DanhMucTinh ; dùng server-side SOAP adapter nếu thực sự truy xuất thành công và được phép, có cache, chuyển XML sang danh mục nội bộ, không lạm dụng API.
2. **Cổng dữ liệu mở Thành phố Đồng Nai:** https://dulieumo.binhphuoc.gov.vn/ — đúng tên trên website hiện tại mặc dù hostname giữ `binhphuoc`. Phải tìm **dataset cụ thể có giấy phép và endpoint rõ** về nông sản, OCOP, khu vực, cơ sở, sau đó mới tích hợp. Không được giả định mọi bộ dữ liệu đều có API public. Có thể giới thiệu trang liên hệ/nguồn ở phần dữ liệu.
3. **Cục Thống kê danh mục cơ quan chính thức:** https://danhmuchanhchinh.nso.gov.vn/TongHop.aspx ; dùng nguồn đối chiếu; ưu tiên snapshot có ghi ngày, người kiểm duyệt.
4. **API cộng đồng:** https://provinces.open-api.vn/api/v2/ — KHÔNG xem là nguồn hành chính chính thức và **đã kiểm tra còn hiện `Tỉnh Đồng Nai` với mã 75**, chưa cập nhật thay đổi tên 2026. Nếu sử dụng v2 cho dữ liệu nền, bắt buộc normalization/override có nguồn chính thức và test về mã/loại đơn vị; không tự động thay đổi bằng dữ liệu cũ.
5. **Thông tin Thành phố Đồng Nai:** https://dongnai.gov.vn/ ; nguồn hội nông dân: https://hoinongdan.dongnai.gov.vn/ ; **phải xác minh bài viết/dữ liệu cụ thể**, không dùng tin tức để suy ra giá tồn kho hay chứng nhận.

### C3. Nội dung nông sản & ảnh
- Danh mục gợi ý nghiên cứu và xác minh với chủ thể: bưởi Tân Triều, sầu riêng khu vực Long Khánh, chôm chôm, điều và sản phẩm chế biến từ điều, hồ tiêu, chuối, cà phê, một số sản phẩm OCOP. **Chỉ đăng các mặt hàng thực sự có từ nhà vườn/HTX được chọn**, không tự gắn logo OCOP hoặc nhãn địa lý.
- Thay toàn bộ hero/banner/product/thumbnail/nội dung địa phương cũ hoặc không liên quan bằng ảnh **nông sản, nhà vườn, khâu đóng gói, thương hiệu và sản phẩm Đồng Nai đã được cấp phép**. Ưu tiên ảnh doanh nghiệp cung cấp; nếu chưa có, dùng asset demo đã ghi `Ảnh minh họa`, không ghi là ảnh nhà vườn cụ thể.
- Tạo `media_provenance` (URL/nguồn/người cấp quyền, quyền sử dụng, ảnh minh họa hay ảnh xác minh, alt text, giấy phép, ngày duyệt), tối ưu WebP/AVIF, srcset, lazy loading, responsive và không dùng ảnh AI tạo như chứng cứ thực tế.

## D. Vai trò và hành trình người dùng

**Khách chưa đăng nhập:** Xem sản phẩm/nhà vườn/định vị công khai/mùa vụ, quét QR, AI trợ lý, tìm kiếm, tạo giỏ; có thể gửi liên hệ/đặt mua dạng khách nếu đã kiểm tra spam.

**Khách có tài khoản:** Giỏ và đơn hàng, trạng thái, đánh giá đơn đã hoàn tất, lịch sử chat nếu có đồng ý, yêu cầu hỗ trợ, sở thích nhận thông báo có opt-in.

**Nhà vườn/HTX:** Quản lý profile, ảnh được phép, sản phẩm, lô hàng, nhật ký chăm sóc, dự kiến mùa vụ, khả năng cung ứng, đơn và yêu cầu mua sỉ.

**Quản trị cơ sở:** Duyệt hồ sơ vườn/lô/ảnh/chứng nhận, phân vai, giá, đơn hàng, ticket CSKH, thống kê chuyển đổi, quản lý bài đăng/OCOP.

**Nhân viên hỗ trợ:** Xem ticket được phân công, nối tiếp cuộc hội thoại sau khi AI chuyển người thật, không đọc dữ liệu không được cấp quyền.

**Super admin:** Cấu hình, kiểm duyệt, audit logs, quản lý phí API và chặn nội dung.

## E. Sitemap và UI/UX phải làm

### E1. Trang công khai
- `/` hero đúng Đồng Nai với thông điệp thương hiệu, CTA `Khám phá nông sản`, `Quét QR nguồn gốc`, `Tìm nhà vườn`, `Tư vấn AI`; danh mục theo mùa; sản phẩm nổi bật; lý do tin cậy và thông tin doanh nghiệp; không hiển thị số liệu giả.
- `/san-pham`, `/san-pham/[slug]` danh mục, bộ lọc giống/loại, trọng lượng, xuất xứ, mùa vụ, tồn kho khả dụng, giá có đơn vị/kg/giỏ/hộp, nhãn dữ liệu cập nhật lúc nào.
- `/nha-vuon`, `/nha-vuon/[slug]` danh sách và bản đồ vườn đã xác minh; ảnh, lịch sử, loại cây, diện tích (nếu công bố), mùa vụ, vị trí công khai đã làm mờ nếu cần bảo vệ nhà vườn.
- `/ban-do` lọc theo phường/xã, loại nông sản, khoảng cách khi người dùng cho phép vị trí; bấm marker xem ảnh và sản phẩm, chỉ đường bằng URL ngoài được xây dựng an toàn.
- `/truy-xuat`, `/truy-xuat/[token]` scan QR qua camera hoặc nhập mã, hiển thị lô hàng/trạng thái/nhật ký/hình ảnh/nguồn xác minh theo quy tắc quyền riêng tư.
- `/mua-vu` xem lịch mùa vụ có nguồn, cập nhật của nông hộ, phân biệt `ước tính`/`dự kiến`/`đã xác nhận`.
- `/ai-tu-van` hỗ trợ chọn nông sản theo nhu cầu, ngân sách, số lượng, dịp dùng; tạo danh sách/giỏ/quote draft, giải thích nguồn.
- `/gio-hang`, `/thanh-toan` giỏ, chọn giao nhận, xác nhận; payment v1: COD hoặc chuyển khoản thủ công và người bán xác nhận tiền trong hệ thống ngân hàng — không tự coi ảnh giao dịch là thanh toán thành công.
- `/don-hang`, `/ho-tro`, `/lien-he`, `/chinh-sach-*`, `/ve-chung-toi` và trang truy cập cho người khuyết tật/điện thoại.

### E2. Dashboard role-based
- Nhà vườn: sản phẩm, lô/QR, nhập ảnh vườn và timeline, ngày chăm sóc, mùa vụ, nguồn hàng, đơn B2B.
- Quản trị: danh mục, duyệt hồ sơ, thống kê funnel, ticket AI chuyển người thật, đơn, báo giá, xác minh chứng chỉ, audit, trạng thái API.
- Hỗ trợ: ticket, hội thoại được chuyển, SLA đơn giản, mẫu trả lời.
- UI có skeleton/loading/error/empty states, tìm kiếm không kết quả, ảnh không tồn tại, mạng chậm, accessibility WCAG 2.2 AA hướng tới và responsive mobile-first.

## F. Chức năng QR truy xuất nguồn gốc — CHỨC NĂNG BẮT BUỘC, CHẠY THẬT

**Luồng sản xuất:** Nhà vườn tạo vườn → tạo mùa vụ → tạo lô hàng → nhập nhật ký (gieo/trồng/chăm sóc/thu hoạch/đóng gói) có người nhập + thời điểm + chứng cứ → admin kiểm tra và phát hành QR lô → tải SVG/PNG mã → người dùng scan qua điện thoại hoặc nhập mã → công khai hồ sơ lô, vườn, ảnh vườn, nhật ký đã được phép hiển thị, ngày đóng gói/hạn sử dụng nếu có, cơ sở chịu trách nhiệm; nút liên hệ/đặt mua.

**Data:** lotId nội bộ UUID, lotCode human-friendly, traceToken random không đoán được, farmerId, productId, provenance, status; nhật ký là các events append-only hoặc có audit trước-sau, ảnh gắn timestamp và người nhập. QR chứa URL `https://<domain>/truy-xuat/<opaque-token>`, không chứa số điện thoại riêng, mật khẩu hoặc dữ liệu nhạy cảm.

**Chống nói quá:** QR chứng minh dữ liệu đã được **ghi nhận và có nguồn bên quản trị**, không tự chứng minh nguồn gốc vật lý thật tuyệt đối. Hiển thị nhãn `Nhà vườn tự khai báo`, `Đã được nền tảng kiểm tra hồ sơ`, `Chứng nhận bên thứ ba` khác nhau. Nếu QR thiếu hoặc lô hủy/thu hồi, hiển thị trạng thái rõ và nút hỗ trợ.

**Test QR:** scan camera Android/iOS qua HTTPS, scan từ ảnh, QR in ở kích thước khác nhau, truy xuất một lô thật trong db, thay đổi nhật ký thấy mới, quyền ghi bị khóa cho người xem; QR không tồn tại, token bị thay, sản phẩm tạm ngừng và lô thu hồi.

## G. AI phải giải quyết BÀI TOÁN, không chỉ chatbot

### G1. AI Sales Copilot — P0 (thi được)
- Trả lời 24/7 về giá, nguồn gốc theo hồ sơ, mùa vụ dự kiến, lô có sẵn, hướng dẫn đặt hàng/thanh toán/giao hàng/chính sách; **RAG theo dữ liệu hiện tại**, cite link sản phẩm/nhà vườn/lô/chính sách và ngày cập nhật.
- AI tool-calling có kiểm soát: `searchProducts`, `getProduct`, `getAvailableLots`, `getFarm`, `getSeason`, `getPolicies`, `getOrderStatus` (xác thực chủ đơn), `proposeCart`, `createQuoteDraft`, `createSupportTicket`.
- Chuyển người thật nếu thiếu dữ liệu, ngoài phạm vi, yêu cầu thương lượng, đơn lỗi, khiếu nại hoặc người dùng yêu cầu; lưu ticket với tóm tắt đã che PII, nhân viên nhận và trả lời trong giờ làm việc. Không hứa người thật trực 24/7.
- Chặn prompt injection từ mô tả sản phẩm, nhật ký do nhà vườn nhập, nội dung upload; context là **dữ liệu**, không phải system prompt. Schema output bằng Zod/JSON Schema; side effects xác thực RBAC và cần user confirmation.

### G2. AI Product Match & Explain — P0
- Khách nhập nhu cầu tự nhiên: `Tôi có 400.000 đồng, cần trái cây biếu 2 gia đình, giao khu vực X, ưu tiên sản phẩm đang mùa`.
- AI chuẩn hóa intent (`budget`, `quantity`, `delivery_area`, `purpose`, `product_preference`, `constraints`), truy vấn sản phẩm thực, xếp hạng giải thích *vì sao phù hợp*, hiện giá/tồn/mùa vụ có nguồn, so sánh 2–3 phương án; allow tweak giỏ.
- Công thức giá/tồn và ràng buộc giao nhận chạy bằng mã xác định, không do AI quyết giá. Thiếu dữ liệu bắt buộc hỏi thêm. Không khẳng định OCOP nếu chưa có chứng nhận.
- AI giúp chuyển từ mô tả thành **quote/giỏ hàng**. Báo giá là draft cho người dùng/người bán xác nhận.

### G3. AI B2B Quote Assistant — P1 cạnh tranh
- Người mua sỉ nhập tiếng Việt: sản phẩm, quy cách, kg, ngày nhận, địa chỉ, kỳ vọng giá; AI trích xuất yêu cầu cấu trúc, đối chiếu khả năng cung ứng theo lô, gợi ý đơn vị nhận và soạn yêu cầu báo giá. Admin điều chỉnh giá, thời gian, điều khoản và chốt.
- Giảm số lần hỏi qua lại; tạo `request_for_quote` có trạng thái `new/need_info/quoted/accepted/rejected`.

### G4. Dự báo mùa vụ & sản lượng có trách nhiệm — P1/P2
- V1: nhà vườn nhập diện tích, giống, số cây, năng suất dự kiến, tuần thu hoạch, độ chắc chắn; dùng thống kê có minh bạch để tổng hợp nguồn hàng dự kiến. **Không gọi phép cộng/trung bình là AI**.
- V2 chỉ thử mô hình dự báo khi có dữ liệu nhiều vụ thu hoạch đủ kiểm chứng (sản lượng thực tế, thời tiết, giống, diện tích, chăm sóc); đo MAE/MAPE, phạm vi sai số; nếu không đủ dữ liệu thì hiển thị `Ước tính do nhà vườn cung cấp, chưa phải dự báo AI`.
- Dữ liệu thời tiết chỉ làm thông tin bổ sung: Open-Meteo free **phi thương mại**, không tự đưa vào sản phẩm thương mại nếu không có quyền sử dụng tương ứng; có thể dùng input thủ công hoặc tự-host nguồn được cấp phép.

### G5. AI Customer Service — P1
- Liên hệ, ticket, trạng thái đơn và khiếu nại. AI phân loại yêu cầu, tóm tắt cho nhân viên, soạn câu trả lời có căn cứ để nhân viên duyệt. Khách được opt-in thông báo mùa vụ/ưu đãi; phải có unsubscribe. Đánh giá chỉ người mua hoàn tất đơn mới được ghi, có kiểm duyệt và công khai nguyên tắc.

### G6. AI Reliability & Evaluation — P0 bắt buộc
- Lập bộ benchmark ít nhất 30 yêu cầu thường gặp + 20 tình huống khó + 10 trường hợp ngoài dữ liệu. Phải có **gold answer** và `expectedProductIds/expectedConstraints`, nguồn dẫn và tình huống phải từ chối.
- Baseline A: khách dùng danh mục/lọc thường; B: trợ lý AI. Đo thời gian tìm được sản phẩm và tạo đơn, số bước thao tác, tỷ lệ lựa chọn hợp lệ, lỗi trả lời không có nguồn, lỗi giá/tồn, tỷ lệ chuyển người thật; công khai cả khi AI tệ hơn.
- Mục tiêu thử nghiệm **đề xuất**: tỷ lệ tuân thủ ràng buộc 100% sau validation; 0 báo giá AI được chốt tự động khi chưa duyệt; ≥90% câu hỏi dữ liệu có link nguồn hợp lệ trên bộ test (mục tiêu, không hứa kết quả), p95 chat dưới ngưỡng đo thực tế. Quy định tiêu chí sau benchmark.

## H. Data model tối thiểu

- `users`, `roles`, `profiles`, `permissions`.
- `organizations`/`cooperatives`, `farms` (status verification, publicApproxLocation), `farm_media` (license), `farm_verification_records`.
- `admin_units` (city=75, ward, source, valid_from), `addresses` (legacy_address optional).
- `categories`, `products` (SKU, taxonomies, price_unit, description), `product_images`, `product_claims` (OCOP/VietGAP pending/verified + cert evidence + validity).
- `crop_seasons` (type, dates, confidence, update timestamps), `harvest_forecasts` (human/AI method, estimate, uncertainty, actual).
- `lots` (status, quantities, harvested_at, packing_at, source), `cultivation_events`, `lot_media`, `trace_tokens`, `trace_audit_events`.
- `inventory_movements`, `carts`, `cart_items`, `orders`, `order_items`, `order_status_history`, `payment_evidence` optional (never auto confirm), `shipping_requests`.
- `rfqs`, `rfq_items`, `quotes`, `quote_items`, `support_tickets`, `ticket_messages`.
- `reviews` (verified buyer), `favorites`, `notification_preferences`, `consent_records`.
- `ai_conversations` (opt-in retention), `ai_tool_calls` (redacted), `ai_eval_runs`, `events` (privacy safe), `audit_logs`.

Design relations + constraints + migration; role policy: farm only edits own, admin approve, public reads only `published`; inventory/order update transactionally, idempotency on checkout/payment, no trust LLM for write access.

## I. API của CHÍNH CropNet (đề xuất, không phải API repo đã tồn tại)

`GET /api/products?query=&category=&season=&city=75&ward=&limit=`
`GET /api/products/:id`
`GET /api/farms?crop=&ward=&near=&radiusKm=`
`GET /api/farms/:id`
`GET /api/seasons?month=&crop=`
`GET /api/traces/:token`
`POST /api/qr/scan` (tùy UI; scanner ở client, endpoint xác thực trace token)
`POST /api/cart/validate`
`POST /api/checkout`
`GET /api/orders/:id` (owner/admin)
`POST /api/rfq`, `GET /api/rfq/:id` (authorized)
`POST /api/ai/chat`, `POST /api/ai/recommend`, `POST /api/ai/quote-draft`
`POST /api/support/tickets`
`POST /api/farms/:id/lots` (authorized), `POST /api/lots/:id/events` (authorized), `POST /api/lots/:id/publish-qr` (authorized)
`GET /api/health`, `GET /api/admin/analytics` (authorized)

Cấu trúc endpoint điều chỉnh sau audit repo. Ghi rõ OpenAPI, Zod schema, phân quyền, rate limit, CORS/CSRF nếu dùng cookie, mô tả API và mock fixtures.

## J. GitHub OSS được nghiên cứu để lựa chọn SAU AUDIT

**Luật bắt buộc:** Không sao chép cả repo; chỉ tích hợp thư viện hoặc tham khảo mô-đun phù hợp, ghi license + version + URL + files đã thay đổi + điều khoản attribution; không copy themes/assets/lô-gô của dự án khác. Chỉ thêm khi ứng dụng đang thiếu và tương thích công nghệ.

| Repo | Công dụng | Cách chọn | Ghi chú giấy phép/triển khai |
|---|---|---|---|
| https://github.com/nimiq/qr-scanner | Quét QR camera hoặc ảnh | **Ưu tiên QR scanner trên browser** | MIT (xác minh repo); HTTPS và cho phép camera |
| https://github.com/soldair/node-qrcode | Sinh mã QR SVG/PNG | **Ưu tiên generate QR** | MIT (package.json) |
| https://github.com/zxing-js/browser | Scanner 1D/2D nhiều định dạng | Thay thế `qr-scanner` nếu cần mã vạch khác | Kiểm tra license và phiên bản trước sử dụng |
| https://github.com/Leaflet/Leaflet | Bản đồ nhẹ | **Ưu tiên khi map cơ bản** | BSD-2-Clause; cần tile provider đúng policy |
| https://github.com/maplibre/maplibre-gl-js | Bản đồ vector tương tác | Khi cần nhiều lớp dữ liệu/vector | BSD-3-Clause; cần nguồn vector tiles phù hợp |
| https://github.com/shadcn-ui/ui | UI components | Nếu framework React/Next/Tailwind | MIT; tùy biến giao diện Đồng Nai, không clone site |
| https://github.com/TanStack/query | Fetch/cache/async | Nếu frontend React | MIT, chọn sau audit |
| https://github.com/recharts/recharts | Biểu đồ kinh doanh React | Dashboard analytics | Check license/version tại commit được chọn |
| https://github.com/chartjs/Chart.js | Biểu đồ nói chung | Thay cho Recharts nếu stack phù hợp | Không cài cả hai nếu không cần |
| https://github.com/vercel/ai | AI SDK cho TypeScript | Nếu stack TS/Next và cần structured output/stream | OSS nhưng phí mô hình/provider tách riêng; kiểm license/version |
| https://github.com/supabase/supabase-js | Auth, storage, Postgres client | Nếu hiện đã dùng Supabase hoặc cần nhanh | Free tiers có giới hạn; RLS bắt buộc |
| https://github.com/payloadcms/payload | CMS/admin nâng cao | **Tham khảo**; chỉ tích hợp nếu phù hợp repo và đủ thời gian | MIT, tích hợp có thể lớn |
| https://github.com/medusajs/medusa | Engine thương mại điện tử | **Tham khảo kiến trúc/luồng**, không bê nguyên bộ | Core MIT/open-core; doanh nghiệp yêu cầu loại trừ EE |

**Không dùng tùy tiện:** template có ảnh bản quyền, AGPL nếu chưa hiểu nghĩa vụ, code lấy từ repo không có LICENSE, repository không kiểm chứng provenance, package không được cập nhật/bị CVE.

## K. External APIs / nguồn miễn phí hoặc có free quota — KHÔNG PHẢI TẤT CẢ ĐỀU MIỄN PHÍ CHO KINH DOANH

| Nguồn | URL & sử dụng | Kiểm tra/giới hạn |
|---|---|---|
| NSO admin SOAP | https://danhmuchanhchinh.nso.gov.vn/DMDVHC.asmx ; `DanhMucTinh`/`DanhMucPhuongXa` | Nguồn chính thức, phải test endpoint + quyền truy cập + snapshot, có chế độ cache |
| Đồng Nai open data | https://dulieumo.binhphuoc.gov.vn/ | Chỉ kết nối dataset có endpoint, license và nội dung đã xác minh |
| Provinces v2 | https://provinces.open-api.vn/api/v2/ | Dữ liệu hiện tại vẫn ghi `Tỉnh Đồng Nai`; dùng phụ trợ có normalization + test, không làm nguồn chính thức |
| OSM base map | https://www.openstreetmap.org/ | Dữ liệu/bản đồ cần attribution; tile server công cộng **không được bulk download**, chính sách hosting khác license code |
| Nominatim public geocode | https://nominatim.openstreetmap.org/ | Giới hạn tối đa 1 req/s/toàn app, không autocomplete; nếu nhiều người dùng cần dịch vụ khác/hệ thống riêng |
| Gemini Developer API | https://ai.google.dev/gemini-api/docs/pricing | Có free tier cho một số model, khác theo tài khoản/vùng/model và dữ liệu free tier có thể dùng để cải thiện dịch vụ; phải minh bạch; không lộ key |
| Cloudflare Workers AI | https://developers.cloudflare.com/workers-ai/platform/pricing/ | Free quota 10.000 neurons/ngày được nêu 09/10/2026, không phải mọi model đều có free; cần account, model support/chi phí |
| Open-Meteo weather | https://open-meteo.com/en/terms | **Free endpoint chỉ phi thương mại**, không bật trên website thương mại production khi chưa được phép; dùng giả lập/feature-off hoặc nguồn có license phù hợp |
| Open-Meteo self-host | https://github.com/open-meteo/open-meteo | Phần server có AGPLv3, cần xem nghĩa vụ license, vận hành có chi phí |
| Dữ liệu OCOP/chứng nhận | Nhà nước hoặc chủ thể sở hữu cung cấp | Không thấy API công khai được xác minh để tra chứng nhận OCOP; nhập và xác minh hồ sơ thủ công, ghi nguồn & hạn |
| Thanh toán/giao vận | Đối tác cụ thể khi được cấp quyền | Không hứa API miễn phí; v1 hỗ trợ COD/đặt mua yêu cầu, chuyển khoản manual confirmation |

**Tự động hóa chọn API:** agent có thể tự động kiểm tra docs public, compatibility, thử endpoint **không cần key** hợp lệ, ghi log smoke test; có thể tự tạo `.env.example` và adapter. Nhưng agent không thể tự tạo credential thay người dùng hoặc vượt xác minh tài khoản; thiếu key ghi `BLOCKED_NEEDS_USER_CREDENTIAL`, không chế secret và không âm thầm kích hoạt gói trả phí. Không sử dụng API có giới hạn phi thương mại để sản xuất kinh doanh.

## L. Thiết kế đồ họa, nội dung, thương hiệu

- Brand đề xuất: màu xanh lá/vàng trái chín/trắng, font hỗ trợ tiếng Việt, typography rõ và contrast tốt; hình nhà vườn Đồng Nai thật là trung tâm, không lấy ảnh vùng khác rồi ghi chú Đồng Nai.
- Tên thương hiệu: `CropNet Đồng Nai AI`; khẩu hiệu `Từ nhà vườn Đồng Nai đến bàn ăn — Minh bạch từng lô hàng` (gợi ý). Logo thiết kế mới có quyền sử dụng; không mạo danh cổng chính phủ/OCOP.
- Nội dung về đặc sản, nơi trồng, mùa vụ, OCOP phải có `content_source`, `verified_at`, `verified_by`, disclaimers nếu dự kiến.
- Product cards có nhãn `Đang mùa`, `Sắp thu hoạch`, `Có sẵn`, `Đặt trước`, `Hết hàng`, `Đã xác minh thông tin vườn`, `Chứng nhận xác thực` chỉ khi phù hợp.
- SEO: canonical, sitemap, robots, Product JSON-LD/Organization, product alt text, Vietnamese URL slugs, share card OG, legal pages. Không tạo review/rating schema giả.

## M. Dashboard, thương mại, đánh giá hiệu quả

**KPI kinh doanh:** view sản phẩm → AI tư vấn → thêm giỏ → yêu cầu báo giá → đơn xác nhận; tỷ lệ chuyển đổi; thời gian lập báo giá; tỷ lệ bỏ giỏ; đánh giá khách; thời gian phản hồi ticket.

**KPI AI:** mức chính xác tìm sản phẩm theo điều kiện, tỷ lệ AI viện dẫn đúng sản phẩm và lô, hallucination rate, tỷ lệ giỏ vượt ngân sách, thời gian đến kết quả, giá/call, escalation rate, tỷ lệ người dùng chấp nhận gợi ý.

**KPI QR:** số mã lô sinh ra, tỷ lệ mở được trang trace, số lô có nhật ký đầy đủ, số lô bị báo thiếu dữ liệu, thời gian tra cứu thủ công so với scan.

**KPI nhà vườn:** tỷ lệ cập nhật tồn/mùa vụ đúng hạn, số đơn chấp nhận, đơn hoàn tất, phản hồi trung vị; uy tín là chỉ số tường minh không phải 'AI chấm độ uy tín' tùy tiện. Review chỉ từ verified purchase, chống spam/gian lận, có cơ chế khiếu nại.

**Phép thử A/B có đối chứng:** cùng 20–30 tình huống, người mua thao tác web danh mục/lọc thường và web có AI trên tập tình huống tương đương đảo thứ tự; đo thời gian tìm đúng, số lần hỏi lại, mức phù hợp đơn, trải nghiệm; ghi số liệu đo thật, kích thước mẫu, không tự báo % tiết kiệm.

**Nguồn dữ liệu phân tích:** event không chứa PII thô, consent trước analytics không thiết yếu, dashboard phân quyền, không dùng trackers tùy tiện; thống kê số liệu seed demo có nhãn `DEMO`.

## N. An toàn & tính đúng đắn

- Phân quyền server-side và RLS nếu dùng Supabase, tenant isolation giữa các nhà vườn, URL upload được ký hạn chế, chống IDOR.
- Quy tắc xác thực giá, tiền VND integer, đơn vị kg/hộp, số lượng, tồn kho và checkout trong transaction; tránh double-order, oversell.
- Rate limit AI, upload, QR scan; validate MIME/content, malware scanning nếu có; audit logs, không log API key/PII/password.
- AI không được gọi chức năng viết database nếu chưa xác thực role/đơn hàng; tool result có schema, chặn injections trong tài liệu vườn, hạn chế PII trong prompts.
- Consent ảnh vườn/địa chỉ, không công bố tọa độ riêng tư nếu không được phép; thông báo ưu đãi opt-in và unsubscribe.
- Không tự động gửi số điện thoại/email khách cho nhà cung cấp LLM nếu chưa có cơ sở xử lý dữ liệu phù hợp. Phải công bố provider và chính sách dữ liệu/retention, chỉ gửi trường cần thiết.
- Dữ liệu và hình ảnh liên quan thật/giả/AI generated cần phân loại. Không dùng demo dữ liệu bịa đặt không gắn nhãn.

## O. Lộ trình thực hiện theo cuộc thi, nhóm 4–5 thành viên

### P0 — Chạy demo hợp lệ (ưu tiên cấp tốc, nếu repo có nền tảng sẵn)
**Audit repo -> Chọn đúng chủ thể -> Cập nhật branding/ảnh/sản phẩm/địa chỉ -> Trang sản phẩm + hồ sơ vườn -> QR truy xuất lô thật -> AI tư vấn có link nguồn -> giỏ/yêu cầu báo giá -> deploy -> thuyết minh/video.** Không xây đầy đủ hệ thống cùng lúc từ số 0 và hứa hoàn tất trước 15/10.

**Ngày 14–15/10/2026:** xác minh đăng ký/tư cách dự thi với BTC; khóa phạm vi; chỉ sửa các module tác động trực tiếp đến luồng demo; chạy production build, test camera QR trên HTTPS, test AI live bằng ít request, gửi video/hồ sơ/URL. Nếu chưa đăng ký hoặc chưa có repo chạy được, báo rõ nguy cơ không kịp; không tự khẳng định hoàn tất.

### P1 — Sau nộp, chỉ khi được BTC cho phép và vào chung kết (16–29/10)
Hoàn thiện admin lô/nhật ký và đăng ảnh, bản đồ thật, mùa vụ, ticket CSKH/chuyển người thật, B2B quote, bảo mật, hiệu năng, dữ liệu đã xác minh và đo benchmark trước–sau. Cuối 28–29/10 freeze tính năng, luyện demo offline/online, backup video/screenshots và kịch bản phản biện.

### P2 — Sau cuộc thi
Tích hợp vận chuyển/thanh toán có hợp đồng, forecast sản lượng AI khi đủ dữ liệu, automation email/Zalo hợp lệ, đánh giá chất lượng nâng cao, đa chủ thể/địa phương khác, self-host AI hoặc hợp đồng mô hình thương mại thích hợp.

**Phân công 5 người:** (1) Product/đối tác/QA/đánh giá, (2) frontend UX + branding/assets, (3) backend + database/auth/QR, (4) AI RAG + recommendation + eval, (5) integration/map/SEO/CI/deploy/docs. Nếu 4 người gộp map/CI vào frontend và product.

## P. Kịch bản live demo 6–8 phút (có demo thật, không giả gọi AI)

1. **0:00–0:45:** giới thiệu đúng một cơ sở kinh doanh ở TP Đồng Nai, khó khăn: quảng bá hạn chế, khách khó chọn và không tra nguồn gốc, tư vấn/báo giá thủ công.
2. **0:45–1:30:** mở website thương hiệu nông sản Đồng Nai trên điện thoại, tìm một sản phẩm có dữ liệu thật.
3. **1:30–2:30:** quét **QR thật** từ tem/ảnh QR phát hành trên màn hình khác -> trang trace của lô thật -> ảnh vườn -> timeline chăm sóc/thu hoạch -> thông tin được phép công bố.
4. **2:30–4:00:** khách nói `Tôi muốn mua khoảng 350.000 đồng trái cây Đồng Nai, ưu tiên đang mùa, cần giao đến phường X`; AI đọc dữ liệu sản phẩm/lô/mùa vụ và đưa 2 phương án có link nguồn và tính giá chính xác.
5. **4:00–5:00:** thay một sản phẩm thành hết hàng; AI hoặc bộ kiểm tra phải loại khỏi giỏ, đề xuất thay thế hợp lệ; tạo đơn/yêu cầu báo giá để quản trị thấy ngay.
6. **5:00–6:00:** chủ shop mở dashboard và xem đơn, xem ticket cần tư vấn người thật; nhà vườn cập nhật mùa vụ/lô, QR phản ánh bản ghi mới.
7. **6:00–7:00:** trình bày bảng so sánh **đã đo thật**: thao tác/tìm đúng hàng/báo giá với và không AI, demo nguồn ảnh/dữ liệu và quyền riêng tư.
8. **7:00–8:00:** kế hoạch chuyển giao cho chủ thể thực tế, chi phí API/hosting, giới hạn, câu trả lời phản biện.

## Q. Acceptance criteria / Definition of Done

- [ ] Audit repo, commit SHA, backup, baseline run/test, bảng khả năng hiện có; không thay stack khi không cần.
- [ ] Toàn bộ thay đổi tên/ảnh/nội dung thuộc Đồng Nai đều có nguồn, ảnh đúng quyền, không còn ảnh nông sản vùng khác bị ghi nhãn Đồng Nai.
- [ ] TP Đồng Nai mã 75; nguồn địa giới mới được ghi, phường/xã 2026 không sai, địa chỉ khách hỗ trợ cũ-mới và có test tên chuẩn; API stale không ghi đè.
- [ ] Một đối tác/HTX/hộ kinh doanh được lựa chọn, thỏa thuận dùng thông tin/ảnh, catalogue tối thiểu 8–15 sản phẩm thật (hoặc xác định rõ demo với dữ liệu mô phỏng), bảng giá/tồn có timestamp.
- [ ] QR thực sinh + scan camera qua HTTPS + link trace hoạt động + hồ sơ lô + ảnh vườn + nhật ký; người không được phép không sửa được lô.
- [ ] AI nhận tình huống mua hàng, gọi tool dữ liệu thực, đưa nguồn và đề xuất có giá/tồn đúng; thiếu dữ liệu hỏi lại, không bịa chứng nhận, chuyển người thật khi cần.
- [ ] Giỏ hàng/đơn hoặc yêu cầu báo giá lưu DB thật và hiện trong dashboard; trạng thái thanh toán không giả.
- [ ] Map lọc vườn/loại cây/khoảng cách, marker có ảnh + sản phẩm, vị trí dùng sự đồng ý, bản đồ ghi attribution và tuân thủ policy nhà cung cấp.
- [ ] Cơ chế mùa vụ, đánh giá uy tín minh bạch, review chỉ verified order; P1 có thể ra sau nộp nếu hạn quá gấp.
- [ ] PWA/mobile responsive, SEO, accessibility cơ bản, không có nút giả, trạng thái lỗi rõ, ảnh có giấy phép.
- [ ] RLS/role isolation, no secrets leaked, input validation, rate limits, transaction checkout, CI + build pass.
- [ ] Có `docs/COMPETITION_EVIDENCE.md` chứa ảnh thật/số liệu thật/log thử AI, ưu tiên có benchmark before/after; các chỉ số không đo không viết thành thành tích.
- [ ] Có URL deploy, video demo, README setup, `.env.example`, `docs/API_SOURCES.md` (giấy phép, giới hạn, chi phí), `docs/OSS_ATTRIBUTIONS.md`, danh sách tool AI dùng và lý giải AI tạo giá trị.
- [ ] Ngoại lệ do API/key/thời gian được ghi `BLOCKED`, không tự chế kết quả; không tự mua gói dịch vụ.

## R. Tài liệu cần bàn giao trong repo

1. `docs/01_REPO_AUDIT.md`, `docs/02_MIGRATION_PLAN.md`.
2. `docs/DONG_NAI_2026_DATA_SOURCES.md`: pháp lý, code 75, mapping phường/xã cũ-mới, provenance.
3. `docs/API_SOURCES.md`: từng API endpoint, license, quota, key, truy cập, smoke test, fallback.
4. `docs/OSS_ATTRIBUTIONS.md`: repo/lib/version/commit/license/files sử dụng, tuân thủ giấy phép.
5. `docs/AI_ARCHITECTURE.md`: prompts, RAG/tool calls, schema, safety, AI vs rule-based.
6. `docs/AI_EVALUATION.md`: test cases, baseline, metrics, limitations, kết quả thật.
7. `docs/COMPETITION_EVIDENCE.md`: hồ sơ đối tác, demo, screenshot, quyền sử dụng ảnh, bảng đo.
8. `docs/DEPLOY.md`, `docs/SECURITY_PRIVACY.md`, `docs/DEMO_SCRIPT.md`, `docs/POST_CONTEST_ROADMAP.md`.
9. `.env.example` không có secret; migration/seed được tách `verified/illustrative`.

## S. Thư mục nguồn nghiên cứu để agent lập trình kiểm tra lại

- Thể lệ cuộc thi: PDF `KH.CuocthiAIDigitalBusinessChallenge.DiGiFest.2026_dadongdau (1).pdf` do người dùng cung cấp.
- Tên TP Đồng Nai 2026: https://phunghia.dongnai.gov.vn/vi/news/hoat-dong-chinh-quyen-nha-nuoc/tuyen-truyen-thanh-lap-thanh-pho-dong-nai-236.html
- Danh mục hành chính thống kê: https://danhmuchanhchinh.nso.gov.vn/ và https://danhmuchanhchinh.nso.gov.vn/DMDVHC.asmx
- Cổng dữ liệu mở: https://dulieumo.binhphuoc.gov.vn/
- Hội nông dân: https://hoinongdan.dongnai.gov.vn/
- Province API v2 (dữ liệu có thể cũ): https://provinces.open-api.vn/api/v2/
- Gemini free-tier và điều khoản dữ liệu: https://ai.google.dev/gemini-api/docs/pricing
- Cloudflare Workers AI quota: https://developers.cloudflare.com/workers-ai/platform/pricing/
- Open-Meteo hạn chế phi thương mại: https://open-meteo.com/en/terms
- OSM tile: https://operations.osmfoundation.org/policies/tiles/
- Nominatim: https://operations.osmfoundation.org/policies/nominatim/

**Ghi chú quan trọng:** Những URL bên trên là nguồn nghiên cứu/lựa chọn, không có nghĩa tất cả đã được kết nối và hoạt động trong repository hiện hữu. Việc chọn bản release, giấy phép tại phiên bản tích hợp, điều khoản và API keys phải được kiểm tra lại ngay trong quá trình thực hiện.
