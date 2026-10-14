# CROPNET ĐỒNG NAI AI — MASTER PROMPT FINAL (CLEANUP + GITHUB PAGES SHOWCASE + HOST THƯƠNG MẠI)

**Hướng dẫn:** Prompt độc lập; gửi toàn bộ file này cho AI coding agent và đính kèm `CROPNET_DONGNAI_MASTER_PLAN_VERIFIED.md` nếu có. **Phần II ghi quy tắc GitHub Pages mới nhất và có ưu tiên cao hơn phần I nếu mâu thuẫn.**

# PHẦN I — MASTER PROMPT ĐÃ XÁC MINH REPO

# MASTER PROMPT — DÁN NGUYÊN VĂN CHO AI CODE AGENT ĐANG LÀM CROPNET

> Đính kèm **file `CROPNET_DONGNAI_MASTER_PLAN_VERIFIED.md`** cùng prompt này. Nếu code agent không thấy file, dán nội dung file plan vào workspace hoặc repo dưới `docs/`. Ngữ cảnh hiện tại: 14/10/2026, dự thi **AI Digital Business Challenge 2026 – DiGiFest Thành phố Đồng Nai**, hạn hoàn thiện/nộp kế hoạch đề ra **15/10/2026**, chung kết dự kiến 30/10 nếu đạt sơ khảo. Thời gian rất hạn chế, ưu tiên hoàn thiện những gì có thể kiểm chứng.

---

Bạn là **Principal Full-stack Engineer + AI Engineer + Product Owner + UX Lead + Security/QA Lead** có quyền đọc và chỉnh sửa workspace. **NHIỆM VỤ LÀ LÀM VIỆC TRÊN REPO THẬT, CHỨ KHÔNG CHỈ LẬP PLAN HAY TẠO MOCKUP.** Repo chính: `https://github.com/lovemvaf/cropnetkhoaduc/tree/main`. Sản phẩm tên đề xuất: **CropNet Đồng Nai AI**, website/app thương mại nông sản bản địa; AI trực tiếp giúp bán hàng, tư vấn, tìm hàng, báo giá, quản lý nhà vườn và cung ứng. Giữ repo của đội, không thay bằng clone website khác.

## THÔNG TIN REPOSITORY ĐÃ KIỂM CHỨNG — ĐỌC TRƯỚC VÀ PHẢI XỬ LÝ

**Repo đã kiểm tra qua GitHub:** `lovemvaf/cropnetkhoaduc`, `main`, commit `cd94de42068785aeaa50a1ced127981935b7e640`. Đây là audit tĩnh; agent vẫn phải checkout HEAD mới nhất và chạy test thực. Stack có sẵn: npm workspaces, `apps/web` Next.js 15 (static `output:'export'` cho GitHub Pages), `apps/server` Express/TypeScript, PostgreSQL/Prisma, JWT auth, COD/MoMo thử nghiệm, product/order/supplier/inspector/logistics/admin/analytics/forum. **KHÔNG thay sang Next.js-only/Supabase/Medusa** nếu không có lý do cấp thiết.

**Mã phải sửa theo thứ tự ưu tiên thực tế:**

1. `apps/server/src/modules/traceability/trace.repository.ts`: DB lỗi hiện fallback `MOCK_BATCHES.find(...) || MOCK_BATCHES[0]` rồi chèn `batchCode` yêu cầu — có nguy cơ gán dữ liệu lô khác. **P0 loại bỏ mock fallback khỏi production**. `apps/web/src/app/traceability/[batchCode]/TraceabilityDetailClient.tsx` cũng chứa fallback dữ liệu giả. Rà soát `product.repository.ts`, `order.repository.ts`, `analytics.service.ts` và `dbFallback.ts` để dashboard/doanh thu/đơn không giả khi DB down.
2. `apps/server/src/modules/traceability/trace.service.ts`: `buildDefaultInspectionReports` tự sinh `PASSED`, pesticide `0.0%`, `buildDefaultLogisticsTimeline` tự sinh sự kiện `DELIVERED` tương lai, chuyến xe/nhiệt độ mô phỏng. Tuyệt đối không hiển thị như dữ liệu đã kiểm định/vận chuyển thật; thay bằng `chưa có dữ liệu`, quy trình nhập sự kiện + kiểm duyệt hồ sơ và audit.
3. Cùng file QR có hardcode `https://cropnet.vn/traceability/${batchCode}` khi tạo/sửa; controller có thể dùng `FRONTEND_URL`/localhost. **Thống nhất public origin và test quét trên domain thật**. `apps/web/src/app/traceability/[batchCode]/page.tsx` chỉ export 9 batchCode tĩnh: với `output:'export'`, QR lô mới có nguy cơ 404. Thiết kế lại khả năng dynamic page/deploy hoặc static-compatible query-route và test E2E.
4. `apps/server/src/modules/auth/auth.service.ts` và `auth.middleware.ts` có JWT secret mặc định; xác minh/reset token sinh qua `Math.random()` và log mã. Thay crypto token, fail-closed config production, không ghi token lên log. `README.md`, `seed.ts`, `docker-compose.yml` có mật khẩu/tài khoản/secret demo — tách khỏi production.
5. `apps/server/src/modules/upload/upload.routes.ts` đang mở `POST /api/upload` không auth, file MIME dựa vào khai báo client và lưu public. Bổ sung auth/role/limit/content validation/metadata stripping và kiểm thử.
6. `apps/server/src/database/seed.ts` + `dbFallback.ts` dùng sản phẩm Bến Tre, Đà Lạt, Vĩnh Long, Tiền Giang, Đắk Lắk..., ảnh ở `apps/web/public` + Unsplash trên `apps/web/src/app/page.tsx` và `ProductCard.tsx`. Không rename ảnh sai nguồn thành nông sản Đồng Nai; seed đúng đối tác với quyền dùng hoặc DEMO có nhãn.
7. `apps/server/src/modules/order/order.repository.ts` có checkout Prisma transaction nhưng cập nhật stock bằng `stockNum - quantity`; cần kiểm tra tranh chấp đồng thời gây oversell, thêm guarded atomic update. Giữ module Order/Payment/Shipment hiện hữu, kết nối AI vào đây.
8. `.github/workflows/deploy.yml` triển khai static frontend GitHub Pages; backend Express+Postgres **không chạy trên Pages**. Cần kiến trúc deploy thật cho frontend/backend/database, bảo vệ env và cấu hình API origin hợp lệ.

**Tận dụng code sẵn:** `TraceBatch`, `Certification`, `Product`, `Supplier`, `Order`, `OrderItem`, `Review`, `Shipment`, analytics; backend `apps/server/src/modules/traceability`, `modules/product`, `modules/order`; frontend `/products`, `/cart`, `/checkout`, `/dashboard/supplier`, `/traceability/[batchCode]`. Backend AI mới đặt `apps/server/src/modules/ai` nếu chưa có, không tạo duplicate. `qrcode` backend đã được cài nên không cài thêm thư viện generate nếu chưa cần. Chi tiết bằng chứng, đường dẫn và test nằm trong đầu tài liệu Verified Plan.

**Lưu ý cực kỳ quan trọng:** Mỗi mục P0 về sự thật dữ liệu, công bố kiểm định và bảo mật phải được xử lý trước khi quảng bá rằng AI đã xác minh nguồn gốc. Không sửa bằng cách chỉ đổi text trên frontend.

## 0. Hệ chỉ thị tối cao

- **PHẢI ĐỌC VÀ AUDIT MÃ NGUỒN TRƯỚC.** Clone repo/đọc workspace và xác minh branch, commit SHA, framework, mọi page/API, DB/schema, auth, các chức năng hiện có, images, assets, env, CI, README. Chạy code để xác định baseline. **Nếu repo không truy cập được, báo chính xác `BLOCKED_REPO_ACCESS` và phần có thể làm độc lập; không tự bịa bất kỳ tệp/component nào.**
- Đọc `CROPNET_DONGNAI_MASTER_PLAN_VERIFIED.md` đầy đủ; kiểm tra các đề xuất với thực trạng repo, không áp đặt stack hoặc dependency chỉ vì trong kế hoạch có nhắc. Nếu có hướng tối ưu hơn và không phá sản phẩm, tự quyết định có giải thích.
- **PHẢI TỰ TRA CỨU WEB/GITHUB/DOCUMENTATION CHÍNH THỨC** bằng các công cụ web hiện có của agent trước khi tích hợp: kiểm tra thời điểm cập nhật 2026, endpoint, khả năng truy cập thật, giấy phép, quota, giá, free-tier cho mục đích thương mại, quyền dùng dữ liệu và tương thích dependency. Thực hiện smoke test nhỏ trong môi trường được phép. Không viện dẫn kết quả không kiểm tra được như là đã xác minh.
- **PHẢI TRIỂN KHAI CÔNG VIỆC TỪNG GATE**; không chỉ đề xuất ý tưởng chung. Nếu thiếu quyền/key hoặc không thể tương tác UI account, tạo adapter + `.env.example` + fallback trung thực, ghi `BLOCKED_NEEDS_USER_ACTION` và hướng dẫn chính xác người dùng cần thực hiện.
- **KHÔNG TỰ TẠO API KEY THẬT, KHÔNG TRÍCH LỘ SECRET, KHÔNG ĐĂNG NHẬP THAY CHỦ TÀI KHOẢN KHI CHƯA ĐƯỢC PHÉP, KHÔNG NÂNG GÓI, KHÔNG KÍCH HOẠT THANH TOÁN.** Với API public không cần key và license cho phép, tự tích hợp; với API cần key, đọc biến môi trường sẵn có nếu hợp lệ, nếu thiếu thì chỉ scaffold.
- Không tự động force-push, xóa code/DB, ghi đè data production, chạy migration phá dữ liệu hoặc thêm dependency GPL/AGPL/EE chưa rà nghĩa vụ. Backup và log thay đổi. Không dùng repo của người khác theo cách sao chép nguyên sản phẩm hoặc vi phạm giấy phép.
- Không lấy ảnh từ internet tùy tiện gắn nhãn là ảnh vườn Đồng Nai, không tự xưng là nền tảng chính thức của Thành phố Đồng Nai/OCOP. Nếu chỉ có ảnh demo, ghi rõ `Ảnh minh họa` cho đến khi có quyền ảnh của đối tác.
- Không tuyên bố chatbot `24/7` đồng nghĩa có nhân viên trực 24/7; AI trả lời tự động 24/7 theo uptime, chuyển nhân viên khi thiếu căn cứ.

## 1. Định hướng cuộc thi BẮT BUỘC

Hãy đọc kế hoạch cuộc thi Digital Business được cấp trong workspace nếu có; tiêu chí cần đáp ứng: một doanh nghiệp/hộ kinh doanh/hợp tác xã/dự án khởi nghiệp CỤ THỂ; website/landing page/nền tảng truy cập online; UI/UX responsive; thương hiệu và sản phẩm; AI thực chất trong vận hành; tư vấn, bán hàng, CSKH; giá trị kinh doanh; khả năng chuyển giao; thuyết minh/video/live demo/kiểm chứng. **Không được xây web chung cho mọi nông sản khi chưa có chủ thể kinh doanh thật.**

Nếu chưa có đối tác cung cấp nội dung: chuẩn bị chế độ demo với dữ liệu thật được công khai hợp lệ hoặc được tự xây dựng nhưng gắn rõ `DỮ LIỆU MÔ PHỎNG`, không ghi tên/ảnh thương hiệu thật như đã hợp tác; đồng thời tạo checklist `PARTNER_REQUIRED` cho đội.

## 2. Việc phải sửa ngay (bắt buộc)

1. Thay branding từ `Nông sản Việt` sang `CropNet Đồng Nai AI` / `Nông sản Thành phố Đồng Nai`, cập nhật title/meta/favicon/logo/hero/menu/footer/nội dung trang/giao diện mobile/sitemap/OG; không tạo thông tin nông sản ngoài Đồng Nai thành nông sản Đồng Nai.
2. **Cập nhật hành chính:** Thành phố Đồng Nai thành lập 30/04/2026 theo Nghị quyết 30/2026/QH16, code 75, 95 xã/phường hiện nay theo nguồn nhà nước. Chuyển dữ liệu khu vực/địa chỉ của vùng này từ tên `Tỉnh Đồng Nai` sang `Thành phố Đồng Nai` khi phù hợp; hỗ trợ ward/phường mới, không ép chọn huyện cũ. Nguồn chính thức `https://danhmuchanhchinh.nso.gov.vn/` và SOAP `https://danhmuchanhchinh.nso.gov.vn/DMDVHC.asmx` (có `DanhMucTinh`, `DanhMucPhuongXa`). Nguồn open data TP Đồng Nai `https://dulieumo.binhphuoc.gov.vn/`. Đặc biệt `https://provinces.open-api.vn/api/v2/` đã kiểm tra còn gọi mã 75 là `Tỉnh Đồng Nai`: nếu dùng thì phải xử lý dữ liệu lỗi thời, có test và dẫn nguồn chuẩn, KHÔNG gán đây là official 2026 API.
3. **Thay hình ảnh và catalog:** hero, product cards, page detail, farms và banner thành hình nông sản/nhà vườn/đóng gói Thành phố Đồng Nai có quyền sử dụng; chọn đúng sản phẩm thật của đối tác như bưởi, sầu riêng, chôm chôm, điều, hồ tiêu... nếu đối tác thực bán. Có nguồn, timestamp, alt và trường tình trạng ảnh. Không bịa logo OCOP/chứng nhận.
4. Sửa UI để thực sự giống nền tảng thương mại hiện đại: mobile-first, loading/empty/error states, search, filters, product detail, farm profile, cart/RFQ/order, support, admin; không để nút chết.

## 3. Chức năng bắt buộc P0 phải chạy thật

### QR Truy xuất nguồn gốc
- Admin/nhà vườn được phân quyền tạo lô thật trong DB; lot có người trồng, sản phẩm, nơi trồng có phép công bố, ngày trồng/chăm sóc/thu hoạch/đóng gói, ảnh vườn, tài liệu/chứng nhận đã kiểm tra (nếu có), nhật ký timeline; update và audit.
- Sinh QR **riêng cho từng lô**, QR chứa URL scan `/truy-xuat/<opaque-token>`; người dùng quét bằng camera HTTPS trên điện thoại hoặc tải ảnh QR, xem hồ sơ lô + ảnh + timeline + trạng thái và nguồn, không chỉ mở trang tĩnh một sản phẩm bất kỳ.
- Dùng một thư viện phù hợp sau khi kiểm tra license: `https://github.com/nimiq/qr-scanner` hoặc `https://github.com/zxing-js/browser` để quét; `https://github.com/soldair/node-qrcode` để tạo mã. Không cài cả hai scanner nếu không cần.
- Public không thấy PII/private coord; admin có thể hủy/thu hồi lô, QR phản ánh status. Giao diện rõ nhãn `Thông tin nhà vườn khai báo`/`Đã kiểm tra hồ sơ`/`Chứng nhận bên thứ ba` nếu có bằng chứng; **không tuyên bố QR tự bảo đảm nguồn gốc tuyệt đối**.

### AI Chatbot bán hàng 24/7
- Hỗ trợ hỏi nguồn gốc, mùa vụ, giá, tồn kho, nhà vườn, OCOP có nguồn, đặt mua, giao nhận, chính sách. Nguồn duy nhất cho FACTS là DB và nguồn được cấp quyền. Trả lời có link sản phẩm/lô/vườn/chính sách và thời gian dữ liệu; không hallucinate.
- AI phải gọi các tool backend an toàn: `searchProducts`, `getProduct`, `getFarm`, `getAvailableLots`, `getSeason`, `getPolicies`, `getOrderStatus` khi được xác thực, `proposeCart`, `createQuoteDraft`, `createSupportTicket`.
- Khi thiếu căn cứ, hỏi rõ, hiển thị không có dữ liệu hoặc tạo ticket chuyển nhân viên; tóm tắt hội thoại được che thông tin riêng tư.

### AI gợi ý sản phẩm và tạo giỏ
- Nhập ngôn ngữ tự nhiên: loại, ngân sách, kg/số hộp, khu vực, thời điểm, nhu cầu; AI trích xuất điều kiện, tìm đúng sản phẩm trong DB có tồn giá mùa vụ, giải thích; có so sánh, chỉnh số lượng, nhấn `Thêm giỏ` hoặc `Gửi yêu cầu mua sỉ`.
- Dùng bộ kiểm tra tính giá/tồn/ràng buộc server-side, không giao cho LLM tự chốt giá/tồn; transaction/idempotency khi đặt đơn.
- Chứng minh có sự khác biệt giữa AI hiểu nhu cầu và bộ lọc form thông thường: chạy benchmark cùng tình huống, lưu nguồn, số lỗi và thời gian thực tế.

### Nhà vườn, bản đồ, ảnh thật, mùa vụ, order
- Hồ sơ nhà vườn (đúng quyền sử dụng): tên, xã/phường, loại cây, diện tích nếu được cho phép, hình ảnh có nguồn, nhật ký, sản phẩm, khả năng cung ứng; map Leaflet/MapLibre theo stack, có marker, filter, bấm xem vườn/sản phẩm, khoảng cách khi người dùng opt-in vị trí.
- Map phải tuân thủ OSM tile policy (`https://operations.osmfoundation.org/policies/tiles/`), geocoding Nominatim public tối đa 1 req/s toàn app, không live autocomplete và phải attribution (`https://operations.osmfoundation.org/policies/nominatim/`). Nếu dự kiến traffic thương mại, chọn host/provider cho phép; không coi dịch vụ công cộng như CDN miễn phí vô hạn.
- Lịch mùa vụ theo dữ liệu nhà vườn cập nhật, hiển thị `dự kiến`/`xác nhận`; nông dân cập nhật thời gian và lượng; tổng hợp đơn giản không giả gọi là AI forecast.
- Giỏ hàng, yêu cầu mua hoặc báo giá lưu DB và hiện dashboard; CSKH có ticket/histories, opt-in thông báo; thanh toán nếu chưa có gateway chỉ COD/chuyển khoản manual verification, không tự xác nhận ảnh tiền vào ngân hàng.

## 4. Nâng cấp P1 có lợi cho điểm thi

- AI B2B Quote: khách mua sỉ nhập tự nhiên, AI chuẩn hóa yêu cầu, so sánh lô/cung ứng, tạo RFQ; nhân viên duyệt báo giá. Đây là tính năng rất mạnh vì tiết kiệm thời gian báo giá có số liệu đo được.
- AI CSKH: phân loại yêu cầu, tóm tắt ticket, chuyển tiếp nhân viên, câu trả lời nháp có nguồn, trạng thái đơn xác thực.
- Dashboard funnel: tìm kiếm, AI chat, gợi ý, giỏ, RFQ, đơn xác nhận; nguồn request privacy-safe, báo cáo thời gian xử lý.
- Đánh giá uy tín nhà vườn dựa trên tiêu chí minh bạch `hồ sơ đã kiểm duyệt`, `tỷ lệ phản hồi`, `đơn hoàn tất`, `đánh giá từ người mua thật`; không tạo `AI trust score` mơ hồ hoặc review giả.
- Mobile PWA, offline fallback cho các trang public cơ bản (không cho đặt hàng offline giả), SEO Product JSON-LD, performance, accessibility.
- Ảnh 360/video tour vườn chỉ khi có asset và quyền; không tự bịa ảnh 360.

## 5. Dự báo sản lượng — phải đúng khoa học

- P1 chỉ tạo module thu thập diện tích/giống/năng suất ước tính/tuần thu hoạch và biểu đồ nguồn hàng do nhà vườn nhập, có nhãn `Ước tính do nhà vườn cung cấp`.
- P2 mới huấn luyện/triển khai AI forecast khi có dữ liệu nhiều vụ, validation MAE/MAPE/uncertainty. Không dùng random hoặc phép cộng thông thường gọi là dự báo AI.
- Thời tiết có thể bổ sung khi có quyền: `https://open-meteo.com/en/terms` ghi free API dành cho **phi thương mại** (không được tự ý dùng endpoint free cho trang bán nông sản production); nếu chỉ demo/evaluation, ghi mode phù hợp. Không tự bật dịch vụ trả phí.

## 6. Github + API research — BẮT BUỘC kiểm tra và chọn lọc

Hãy truy cập các repos ứng viên SAU khi audit stack:
- QR: `nimiq/qr-scanner`, `soldair/node-qrcode`, `zxing-js/browser`.
- Map: `Leaflet/Leaflet`, `maplibre/maplibre-gl-js`.
- UI/React (nếu phù hợp): `shadcn-ui/ui`, `TanStack/query`, `recharts/recharts`.
- AI TypeScript (nếu phù hợp): `vercel/ai`.
- Supabase SDK (nếu repo dùng): `supabase/supabase-js`.
- Nghiên cứu kiến trúc thương mại/CMS, **không clone nguyên**: `medusajs/medusa` (core MIT / có phần EE), `payloadcms/payload` (MIT).

Hãy mở giấy phép, release, docs, changelog, security advisories **tại phiên bản sử dụng**; làm bảng `Repo/URL | module dùng | version | license | commercial use? | file thay đổi | giá trị | nguy cơ`. Không bê nguyên website/copy code không rõ license/ảnh không có quyền. Chỉ tích hợp thư viện thật cần thiết.

External sources cần kiểm tra:
- Official administrative data: NSO SOAP nói trên, dữ liệu TP Đồng Nai `https://dulieumo.binhphuoc.gov.vn/` (chỉ dùng dataset public được xác minh).
- `https://provinces.open-api.vn/api/v2/` chỉ hỗ trợ và cần override official 2026.
- OpenStreetMap/Nominatim theo attribution/rate/ToS.
- Gemini API docs `https://ai.google.dev/gemini-api/docs/pricing` (free quotas/model theo tài khoản, dữ liệu free tier có điều khoản riêng).
- Cloudflare Workers AI `https://developers.cloudflare.com/workers-ai/platform/pricing/` (có free daily allocation, một số model chỉ paid).
- Không hứa API OCOP miễn phí nếu chưa tìm được API được công khai và kiểm chứng; cho admin upload certificate có kiểm duyệt và nguồn.
- Không tự động tích hợp Zalo OA/Gmail/payment APIs khi chưa có ủy quyền, khóa hợp lệ hoặc điều khoản thương mại.

**Tự làm việc độc lập:** Với API public no-key được phép, tự viết client, cache, rate limit và test. Với API cần key, tạo adapter rõ, `.env.example`, state `not_configured`, run test mock riêng và báo chi tiết bước thiết lập. Đừng tuyên bố integration live khi chỉ là mock.

## 7. Tính mới/AI thực chất & phép đo bắt buộc

Hãy tạo `docs/AI_EVALUATION.md` và dashboard nội bộ thể hiện AI có cải thiện khi tìm sản phẩm, trả lời, tạo giỏ/báo giá hay không. So sánh 3 đường cơ sở: (A) lọc/truy vấn thủ công; (B) filter/rule-based; (C) AI + dữ liệu nguồn + rule-based validator. Tập ít nhất 30–50 tình huống được gán nhãn, có trường hợp kho hết, vượt ngân sách, mùa vụ không rõ, khách hỏi OCOP chưa xác minh, hỏi bên ngoài sản phẩm, prompt injection. Đo thời gian hoàn thành, số lần hỏi, chính xác sản phẩm, tỷ lệ đáp ứng ràng buộc, tỷ lệ bịa nguồn, AI cost/request, p95 latency, tỷ lệ chuyển người thật; chỉ công bố số liệu **đã đo**.

Trong demo phải nhấn mạnh giá trị kinh doanh: giảm công tư vấn/báo giá, giúp khách chọn nhanh, chuyển tương tác thành giỏ/đơn, tăng minh bạch từng lô. Có dashboard, ảnh chụp, log và dataset kiểm thử, không nói `tiết kiệm X%` nếu chưa có đo lường.

## 8. Thực hiện theo GATE, không dừng ở plan

**Gate M0 — REPO AUDIT:** Xác minh clone+SHA, chạy baseline, tài liệu `docs/01_REPO_AUDIT.md`, feature inventory, migration plan, risk register. Nếu không truy cập được repo ghi blocker không bịa.

**Gate M1 — ĐỒNG NAI + WEBSITE:** Branding + dữ liệu TP Đồng Nai, ảnh/produk có nguồn, trang thương hiệu & product catalog, UX mobile. Tests và screenshot before/after. Tiêu chí: không còn branding không đúng, không còn thông tin địa lý sai trên luồng chính, không ảnh giả giả danh vườn thật.

**Gate M2 — QR TRACE:** Lô + nhật ký + ảnh vườn + QR generator/scanner + public trace page + role/auth/audit. Test end-to-end quét QR mở đúng lô, cập nhật timeline, trường hợp không tồn tại/thu hồi.

**Gate M3 — AI SALES:** AI chatbot và recommender có tool gọi dữ liệu thật; chính sách về hallucinations; chuyển ticket; một trường hợp từ nhu cầu -> phương án hợp lệ -> giỏ hoặc RFQ; live smoke test có log không lộ PII.

**Gate M4 — SALES + MAP:** Cart/order/RFQ và admin dashboard, bản đồ nhà vườn + filter, lịch mùa vụ, CSKH và uy tín theo tiêu chí minh bạch; các mục ngoài khả năng ghi backlog chứ không làm nút giả.

**Gate M5 — HARDEN + COMPETITION:** Test RBAC/CSRF/IDOR/validation/rate limiting, CI, UX, SEO, docs, source/license audit, đo AI vs baseline, deploy, URL online, video demo và thuyết minh đúng cuộc thi. Review giữ lại những chức năng đã chạy ban đầu.

**Gate M6 — OPTIONAL AFTER CONTEST:** dự báo AI khi đủ dữ liệu, ảnh 360 thực, đa hợp tác xã, xác thực thương mại, tích hợp vận chuyển/thanh toán/Zalo hợp lệ.

**Thời gian:** Hôm nay 14/10/2026; theo kế hoạch nộp sản phẩm **đến hết 15/10**. Với thời gian này chỉ được cam kết tính năng đã có nền tảng code và có thể chạy/test; cắt phạm vi mạnh để nộp URL+thuyết minh+video đúng hạn nếu đủ điều kiện. Không đánh dấu hoàn thành toàn bộ M0–M6 trong một ngày chỉ bằng cách viết code chưa nghiệm thu.

## 9. Test cases bắt buộc

- Sản phẩm 100.000 VND/kg, khách muốn 2 kg, cart phải tính 200.000, không để LLM định giá khác.
- Khách tối đa 300.000 VND: mọi combo phải <=300.000 VND sau validator, không mua quá tồn.
- Sản phẩm được đánh dấu hết hàng: AI phải dừng đề xuất là có sẵn, cho phép thay thế hoặc đặt trước nếu chính sách có.
- Hỏi sản phẩm OCOP không có chứng nhận: AI nêu chưa xác minh, không bịa điểm sao hoặc số chứng nhận.
- Một lô có hai sự kiện chăm sóc và ảnh vườn: camera QR mở trang đúng lô, timeline hiển thị đúng; guest không sửa được.
- Đổi xã/phường theo danh mục 2026: code 75, nhãn TP Đồng Nai; không bị API v2 cũ ghi đè thành Tỉnh Đồng Nai.
- Map hiển thị đúng marker nhà vườn có tọa độ được cho phép; distance consent và fallback nếu bị từ chối location.
- Nhân viên/chủ vườn A không đọc/sửa được lô/đơn của chủ thể B.
- AI trả lời câu hỏi không có dữ liệu mùa vụ: đề nghị xác nhận hoặc ticket, không bịa ngày thu hoạch.
- Chat chứa prompt injection trong nội dung vườn: không lộ system prompt, secret hoặc tự tạo đơn.
- Bên cung cấp AI không cấu hình: hiển thị trạng thái rõ và lựa chọn search/filter thủ công; tuyệt đối không giả kết quả live.
- Giao diện dùng điện thoại, ảnh được cấp phép, nhiều trạng thái lỗi, test QR scanner camera qua HTTPS.
- Benchmarks lưu kết quả trước/sau, docs nói rõ dữ liệu demo khác dữ liệu thật.

## 10. Deliverables / giao thức báo cáo sau từng mốc

Khi hoàn thành từng Gate, trả theo đúng cấu trúc:
1. **Trạng thái**: COMPLETED / PARTIAL / BLOCKED / FAILED — không ghi DONE nếu chưa test.
2. **Tệp đã thay đổi**: file paths + tóm tắt diff; commit SHA nếu commit.
3. **Tính năng đã chạy thật**: URL/lệnh kiểm thử/screenshots/fixture; phân biệt test mock với AI live.
4. **Các API/repo tích hợp**: URL, version, license, phí/quota, kết quả smoke test, biến `.env.example`; những key user cần cấp.
5. **Kết quả kiểm thử**: lệnh và PASS/FAIL, số case đúng/sai, bug còn lại.
6. **Rủi ro/giới hạn**: dữ liệu chưa xác minh, mock, đối tác chưa đồng ý, provider thiếu key.
7. **Việc tiếp theo theo P0/P1/P2**: không tiếp tục mở rộng thiếu kiểm soát.

Tài liệu phải có: `docs/01_REPO_AUDIT.md`, `docs/DONG_NAI_2026_DATA_SOURCES.md`, `docs/API_SOURCES.md`, `docs/OSS_ATTRIBUTIONS.md`, `docs/AI_ARCHITECTURE.md`, `docs/AI_EVALUATION.md`, `docs/COMPETITION_EVIDENCE.md`, `docs/DEMO_SCRIPT.md`, `docs/DEPLOY.md`, `.env.example`, README cập nhật. Chỉ có thể bỏ bớt các tài liệu ngoài P0 nếu thời gian nộp cấp bách, nhưng giữ các ghi chép tối thiểu minh chứng.

## 11. Câu lệnh điều hành cuối

**BẮT ĐẦU NGAY BẰNG VIỆC ĐỌC REPO THẬT, SAU ĐÓ THỰC HIỆN M0 → M5 THEO PHẠM VI THỰC TẾ.** Không chỉ đáp lại bằng ý tưởng hoặc kế hoạch suông. **Mọi công đoạn phải được kiểm chứng**. Được phép tự đưa ra cải tiến tốt hơn nếu bám sát website thương mại nông sản tại Thành phố Đồng Nai, yêu cầu cuộc thi, ngân sách miễn phí hợp pháp, quyền dữ liệu và AI mang lại hiệu quả đo được. Khi thiếu thông tin thiết yếu về chủ thể kinh doanh hoặc credential, đừng tự bịa; dùng dữ liệu demo ghi rõ và báo blocker chính xác. Mục tiêu cuối cùng là một website sản phẩm **thật, đẹp, ổn định, an toàn, có thể trình diễn AI thật và có số liệu chứng minh giá trị kinh doanh**.


---

# PHẦN II — YÊU CẦU BẮT BUỘC CLEANUP VÀ DEPLOY

# CROPNET ĐỒNG NAI AI — PHỤ LỤC BẮT BUỘC: CLEANUP, GITHUB PAGES & RELEASE GATE

**Dùng sau hoặc đồng thời với `CROPNET_DONGNAI_MASTER_PLAN_VERIFIED.md` và `CROPNET_DONGNAI_MASTER_PROMPT_VERIFIED.md`.** Đây là yêu cầu **THỰC THI, không phải chỉ bổ sung kế hoạch**. Ngày soạn: 15/10/2026. Repo: `https://github.com/lovemvaf/cropnetkhoaduc` (`main`). **Đích công khai bắt buộc: `https://lovemvaf.github.io/cropnetkhoaduc/`.**

## QUY TẮC HOSTING ƯU TIÊN CAO NHẤT — BẮT BUỘC TUÂN THỦ GH PAGES

**Nguồn chính thức:** https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits. GitHub Pages là hosting website tĩnh cho dự án/showcase, **không được dùng như hosting miễn phí để vận hành doanh nghiệp, website thương mại điện tử chủ yếu phục vụ giao dịch thương mại, hoặc SaaS**, và không phù hợp để thu thập mật khẩu/thông tin thẻ. Do vậy, KHÔNG triển khai chức năng đặt hàng/thu tiền/xác thực người dùng thật để vận hành hoạt động thương mại trực tiếp trên địa chỉ `github.io`.

**Kiến trúc đích tuân thủ điều khoản**:
1. **Tại URL mà chủ repo yêu cầu** `https://lovemvaf.github.io/cropnetkhoaduc/`: triển khai bản **SHOWCASE/COMPETITION DEMO** tĩnh, đẹp, truy cập công khai, có trang thương hiệu, giới thiệu nông sản Đồng Nai, mẫu truy xuất QR và trình diễn AI **an toàn với dữ liệu demo**, không tạo giao dịch thương mại thật, không thu mật khẩu/thẻ hoặc thông tin khách mua. Các nút bán hàng trong chế độ Pages phải dẫn tới bản app trên hosting phù hợp hoặc nêu rõ `Bản trình diễn — không nhận đơn tại đây`; tuyệt đối không giả vờ đơn hàng đã thanh toán.
2. **Ứng dụng thương mại đầy đủ** (tài khoản, đặt đơn thật, thanh toán, dashboard có dữ liệu khách, backend+DB, AI API) đặt trên **hosting khác có điều khoản cho phép**, qua HTTPS và bảo vệ dữ liệu. Agent kiểm tra nhà cung cấp theo chính sách hiện hành, quyền tài khoản, free tier, quota và giấy phép; không tự bật gói trả phí. Nếu chưa có hosting/key, triển khai được showcase Pages và ghi rõ `BLOCKED_FULL_APP_HOSTING` thay vì tuyên bố full app đã live.
3. Không được dùng iframe/proxy/lách luật để biến GitHub Pages thành cửa hàng thực nhận tiền. Có thể demo luồng mua bằng dữ liệu giả **cách ly** trên Pages nếu đủ điều kiện dùng giáo dục/dự thi và gắn nhãn rõ, nhưng giao dịch thật phải chạy trên host phù hợp.
4. **Chỉ kết luận "Pages đã hoạt động"** khi đã kiểm tra URL, asset, trang và demo an toàn. **Chỉ kết luận "Full commerce app đã hoạt động"** khi host riêng được kiểm thử login/order/AI/database đầu cuối. Báo cáo hai kết quả riêng biệt.

Mệnh lệnh này **ưu tiên áp dụng khi mâu thuẫn với bất cứ đoạn nào bên dưới hoặc Master Prompt cũ** (kể cả các đoạn yêu cầu login/checkout thật ngay trên github.io).

## A. Kết luận audit mã nguồn đã kiểm tra — phải tái xác minh tại HEAD trước khi sửa

Dựa trên repo tại commit `cd94de42068785aeaa50a1ced127981935b7e640` (có thể đã thay đổi):

- Monorepo npm workspaces, `apps/web`: Next.js 15, Tailwind, Zustand; `apps/server`: Express + TypeScript + Prisma/PostgreSQL; trang sản phẩm/giỏ hàng/đơn hàng, quản trị, nhà vườn, logistics, inspector, truy xuất, báo cáo, diễn đàn đã có. **Giữ và sửa, KHÔNG viết lại toàn bộ hoặc thay stack tùy tiện.**
- `.github/workflows/deploy.yml` hiện build `apps/web/out` và push sang nhánh `gh-pages`. Nhánh `gh-pages` có tài sản tĩnh và file index; **sự có mặt của các file này KHÔNG chứng minh live site/API hoạt động**. Kiểm tra GitHub Pages Settings và workflow build thực tế.
- `apps/web/next.config.ts`: `output: 'export'`, `basePath` gắn theo `GITHUB_REPOSITORY` trong build; `trailingSlash: true`, `images.unoptimized: true`. `eslint.ignoreDuringBuilds: true` cần thay bằng kiểm tra chất lượng rõ ràng, không chỉ bỏ qua lỗi.
- `apps/web/src/shared/services/api.ts`: nếu thiếu `NEXT_PUBLIC_API_URL` thì dùng `http://localhost:5000/api`. **Đây là P0 phải bỏ khỏi production**; build GH Pages không được để trình duyệt người ngoài truy cập localhost.
- `apps/web/src/shared/utils/path.ts`: asset path hardcode `/cropnetkhoaduc`, cần nhất quán với basePath; kiểm tra các URL asset nội bộ, ảnh, điều hướng và link khi truy cập refresh trực tiếp.
- `apps/web/src/app/traceability/[batchCode]/page.tsx`: `generateStaticParams()` liệt kê cố định 9 mã lô — không hỗ trợ mã lô mới phát hành bất kỳ trên static export. `TraceabilityDetailClient.tsx` tự fallback sang dữ liệu giả khi gọi backend thất bại. **P0 làm trang truy xuất tương thích GH Pages cho mọi lô được tạo trong DB**.
- `apps/server/src/modules/traceability/trace.service.ts` có QR hardcode `https://cropnet.vn/...` và tự sinh kiểm nghiệm PASSED/nhật ký giao vận mô phỏng; `trace.repository.ts` có `MOCK_BATCHES.find(...) || MOCK_BATCHES[0]` trong fallback DB. **P0 không trả lô giả, không phát hành thông tin kiểm nghiệm/vận chuyển không có chứng cứ như là sự kiện thật.**
- `apps/server/src/modules/auth/auth.service.ts`, `auth.middleware.ts`: fallback secret và token xác minh/reset dùng Math.random, log mã; `apps/server/src/modules/upload/upload.routes.ts` upload public dựa trên MIME khai báo; `docker-compose.yml` có secret mẫu. **P0 sửa an toàn**.
- `apps/server/src/database/seed.ts`, `dbFallback.ts`, `apps/web/public/` chứa nông sản/nhà vườn ở các địa phương khác như Cái Mơn, Đà Lạt, Vĩnh Long; cần đổi sang dữ liệu Đồng Nai được cho phép hoặc DEMO ghi rõ, không mạo nhận nguồn gốc/OCOP/VietGAP.

**Lưu ý repo hiện có backend/API thật về mặt mã nguồn, nhưng chưa xác nhận backend được hosting public đang online.**

## B. MỆNH LỆNH CUỐI CÙNG — PHẢI CÓ WEBSITE ONLINE Ở URL CHÍNH XÁC

Bạn được chủ repository yêu cầu thực hiện và triển khai thay đổi lên `main` theo quy trình an toàn. **Không dừng ở lập kế hoạch, tạo prototype local hoặc xuất artifact build.** Hãy chỉnh code, test, commit/push khi được môi trường cấp quyền và trigger GitHub Actions, theo dõi deployment, kiểm tra website trực tiếp trên URL sau:

`https://lovemvaf.github.io/cropnetkhoaduc/`

**Bản release `GITHUB_PAGES_SHOWCASE_VERIFIED` chỉ được báo khi có các điều kiện áp dụng cho Pages bên dưới; các điều kiện backend/thương mại ở host riêng phải báo độc lập:**
1. Commit SHA chính xác đã push lên nhánh `main` (hoặc PR đã được merge hợp lệ); clean git status và có ghi chú thay đổi.
2. GitHub Actions build và deploy thành công; ghi URL workflow/run và kết luận; nhánh hoặc Pages artifact chứa bản build tương ứng.
3. GitHub Pages Settings trỏ nguồn đúng: `gh-pages` + root nếu giữ workflow hiện tại; hoặc official GitHub Actions Pages deploy nếu chuyển kiến trúc. **Không trộn hai cơ chế** và không vô ý vô hiệu hóa trang đang online.
4. Truy cập HTTPS URL đích sau deploy, nhận HTTP 200, HTML mới và asset CSS/JS/ảnh tải được, console không có lỗi chặn, không có 404 ở link chính. Nếu không thể chạy browser, ghi `UNVERIFIED_PUBLIC_BROWSER` và yêu cầu người có quyền kiểm tra, không tự công bố thành công.
5. Người khác mở URL từ thiết bị mới/incognito vẫn duyệt được: trang chủ, catalog showcase, chi tiết sản phẩm demo, nhà vườn và QR công khai. Không dùng GitHub Pages để thu mật khẩu/nhận đơn/thanh toán thật; các chức năng DB/auth/commerce phải kiểm tra trên hosting thích hợp riêng.
6. Trên Pages, luồng giới thiệu sản phẩm -> truy xuất QR demo -> thông tin lô/ảnh/nhật ký minh họa được gắn nhãn -> AI demo an toàn hoạt động; giao dịch thực/đăng nhập/giỏ/RFQ kết nối dashboard chỉ chạy trên host thương mại riêng sau khi được kiểm thử. Không nút giả, không fake API giả danh live.
7. Kiểm thử desktop và mobile, trang 404/error/empty/loading, refresh sâu, deep link qua điện thoại/quét camera, đo hiệu năng cơ bản và tính truy cập.
8. Ghi rõ domain backend, hosting, secret/config tồn tại hay chưa (KHÔNG in secret), kết quả `/health` thật, trạng thái PostgreSQL và API CORS/auth.

**QUAN TRỌNG:** GitHub Pages chỉ host static HTML/CSS/JS và chỉ phục vụ showcase/dự thi trong phạm vi được phép. Không thể chạy Express, Prisma, PostgreSQL hoặc giữ secret trên Pages, và không được dùng nó làm hosting thương mại điện tử thực. Triển khai bản demo tĩnh ở URL yêu cầu, còn ứng dụng thương mại đầy đủ với `apps/server` + PostgreSQL phải có host hợp lệ độc lập qua HTTPS. Nếu chưa có host/API key/secret/ủy quyền, ghi `BLOCKED_FULL_APP_HOSTING`, cung cấp các bước cấu hình; đừng tuyên bố mọi thứ hoạt động. Không dùng fake payment hoặc store trong bộ nhớ để che lỗi production.

## C. FIX GH PAGES CỰC KỲ QUAN TRỌNG

**1) Build static/export/base path:** Giữ `output:'export'` nếu vẫn dùng Pages. Rà soát `basePath:'/cropnetkhoaduc'`, `assetPrefix` chỉ khi thực sự cần, điều hướng Next `Link`, image path, `getAssetPath`, `next/image` remote, redirect, meta, canonical, `sitemap`, favicon, manifest, service worker, CSS/JS hydration, trailingSlash. Build tại CI đúng repo path; kiểm tra `NEXT_PUBLIC_APP_URL`/`NEXT_PUBLIC_API_URL` truyền vào **thời điểm build**. Không hardcode cả prefix trong `next/link` và `basePath` để tránh nhân đôi. Kiểm thử `/`, `/products/`, `/cart/`, `/checkout/`, `/login/`, `/traceability/` và các trang quan trọng sau refresh.

**2) QR cho mọi mã lô — tương thích static GitHub Pages:** Đề xuất route tĩnh canonical `https://lovemvaf.github.io/cropnetkhoaduc/traceability/?batch=<URL_ENCODED_BATCH_CODE>` (có thể chọn key `code` nếu toàn app nhất quán). Trang `/traceability/` được xuất tĩnh và dùng client fetch `/api/traceability/batches/{batchCode}` từ backend HTTPS lúc chạy, không phụ thuộc `generateStaticParams` cho mã lô mới. Backend tạo QR bằng package `qrcode` hiện có, mã hóa chính xác canonical URL + `batchCode`; mọi màn hình in/tải/tạo lại QR dùng chung một helper. Cần giữ hoặc xử lý tương thích các QR đã phát hành từ URL cũ trong khả năng kỹ thuật; không hứa sửa được QR vật lý trỏ sang domain mà đội không quản lý. Test mã mới không nằm trong danh sách 9 mã cũ: camera điện thoại quét, mở trang, fetch đúng lô, nhật ký và ảnh; invalid batch -> 404 nghiệp vụ và không lộ hồ sơ khác.

**3) API public thực và tách chế độ:** Không dùng `localhost` trong bundle production. Showcase Pages không được giả API thương mại live và không thu dữ liệu nhạy cảm; nếu gọi API AI chỉ dùng dữ liệu demo và backend kiểm soát. Ứng dụng thương mại đầy đủ đặt trên host phù hợp, dùng cấu hình public API HTTPS là thông tin client, AI keys/JWT/DB credentials chỉ ở server secrets. Thiếu backend -> giao diện báo trạng thái minh bạch, không fallback localhost/ngầm dùng mock. CORS và auth kiểm thử trên origin thực của host thương mại; nếu cần API gọi từ showcase, origin trình duyệt là `https://lovemvaf.github.io` (không có đường dẫn repo). Cookie `SameSite`/`Secure`/CORS credentials phải test trình duyệt thật, nhất là giới hạn cross-site; không hạ bảo mật để vượt lỗi cookie.

**4) Workflow release:** Xem `.github/workflows/deploy.yml` và repo Settings. Sửa tối thiểu, thêm typecheck/lint/test/build trước deploy; cập nhật Node runtime phù hợp dependency sau khi đối chiếu thực tế. Thêm concurrency, permissions tối thiểu, kiểm tra source, secret masking. Chọn một trong 2 phương án: (A) giữ action hiện hữu đẩy `apps/web/out` -> `gh-pages` và Pages Settings trỏ gh-pages root; hoặc (B) chuyển hẳn official `actions/upload-pages-artifact` + `actions/deploy-pages` và Settings trỏ GitHub Actions. Không trigger hai luồng cạnh tranh. Đặt workflow từ `main`; chỉ publish khi Quality Gate pass. Không bao giờ hardcode key trong workflow/yaml hoặc `NEXT_PUBLIC_*` dùng cho secret.

**5) Dynamic route audit:** Kiểm tra tất cả routes Next.js với `output: 'export'`: `/products/[id]`, `/orders/[id]`, `/traceability/[batchCode]` và routes client-side. Với mỗi trang không thể prerender tùy ý, đổi thành static entry + query route phù hợp, hoặc tạo danh sách params đủ từ dữ liệu ở build và có chiến lược redeploy. Ưu tiên static query routes cho các mã ID mới, giữ link cũ khi có thể. Dùng script kiểm kê static output và quét link sau build. Tránh 404 khi vào qua URL trực tiếp.

**6) Sự thật deploy:** Bản frontend tĩnh build được không có nghĩa backend/database đã hoạt động. Kiểm tra API health, auth/session, list products, create order (dùng test account), QR và AI live trên site public. Cấm hiển thị kết quả giả do `dbFallback` để tạo ấn tượng mọi thứ online.

## D. CLEAN CODE: RÀ SOÁT VÀ DỌN SẠCH NHƯNG KHÔNG PHÁ DỰ ÁN

Mục tiêu không phải xóa nhiều file nhất mà là **bỏ mã không cần thiết, giảm lỗi và giảm chi phí vận hành trong khi giữ nguyên nghiệp vụ đang hoạt động**.

Thực hiện chính xác các bước:

1. **Lập bản kiểm kê**: từng app/module/page/route/DB model, dependency/import/asset, test, config, workflow, file dung lượng lớn và data mock. Tạo `docs/CLEANUP_AUDIT.md` với `KEEP / REFACTOR / REMOVE / DEMO_ONLY / DEFER` kèm lý do, tác động và phương án rollback.
2. **Chụp baseline** trước sửa: commit SHA, git status, cấu trúc repo, `npm ci`, typecheck, lint, tests hiện có, production build, screenshot, luồng nghiệp vụ chủ chốt. Ghi lỗi có sẵn. Tạo nhánh/commit checkpoint nếu được phép; backup DB và media trước mọi migration; không chạm dữ liệu production khi chưa backup.
3. **Xóa có chứng cứ** các import, component không ai dùng, code chết/comment cũ, dependency không dùng, ảnh lặp hoặc không có quyền, route lỗi không còn mục đích, mock rò vào production, console/debug logs lộ PII, token, code sinh bản build đã bị commit; chỉ xóa sau khi grep/đồ thị phụ thuộc/test xác nhận an toàn. Dùng kiểm tra `tsc`, ESLint, dependency audit như `knip` khi tương thích và không tạo false positives với Next dynamic imports/Prisma/scripts. Không xóa page cũ cần giữ khi đã có link/QR bên ngoài; dùng redirect/backward-compatibility hợp lệ.
4. **Tái cấu trúc file quá lớn** khi có lợi rõ: ví dụ `apps/web/src/app/admin/page.tsx` ~75 KB, `dashboard/supplier/page.tsx` ~100 KB, `traceability/.../TraceabilityDetailClient.tsx` ~53 KB. Tách form, table, hooks, API service, types, validation; chỉ refactor từng phần để giữ hành vi, chạy test sau mỗi bước. Không đổi toàn bộ UI/stack cùng lúc.
5. **Dọn dữ liệu mẫu thật cẩn thận**: `seed.ts`, `dbFallback.ts`, `public/`, brand Cái Mơn/Đà Lạt/Vĩnh Long và URL ảnh demo. Chuyển thành `DEMO`/fixtures trong môi trường thử hoặc xoá khỏi production sau kiểm tra; sản phẩm/nhà vườn Đồng Nai phải có nguồn được xác minh, được phép sử dụng. Không đổi tên ảnh nông sản vùng khác rồi tuyên bố xuất xứ Đồng Nai. Không tự bịa chứng nhận OCOP/VietGAP, ảnh vườn, số lô, nhật ký canh tác hay số liệu doanh thu.
6. **Dọn bảo mật thật**: bỏ fallback JWT secret trong production, xóa token reset/verif ra log, dùng secure RNG và hash nếu lưu token, giới hạn/kiểm định upload, chặn SQL/HTML injection, kiểm soát RBAC/IDOR/rate limiting, chống order oversell và validate webhook thanh toán. Cấm để mật khẩu `123456`, MoMo sandbox secrets hoặc postgres password demo thành credential production. Đừng đăng file `.env` chứa key lên repo hoặc Pages.
7. **Không xóa dữ liệu quý và features hữu ích chỉ vì chưa demo**: giữ quyền truy xuất, admin, farm, orders, cart, auth, product, certification (kiểm duyệt), shipping, reviews và DB migrations. Chức năng forum/logistics/inspector nếu chưa thiết yếu thì có thể ẩn/feature-flag ở giao diện thi chứ không xóa DB/schema bừa. Không xóa git history, nhánh `gh-pages`, workflow release, license, README, upload được phép hoặc backup hợp lệ.
8. **Dependency hygiene**: chỉ nâng dependency có lý do bảo mật/tương thích; chạy `npm audit` (review impact), `npm outdated`, loại bỏ package trùng; kiểm tra giấy phép. Không thêm 10 thư viện giải quyết cùng một tính năng. Dùng thư viện đã cài (`qrcode`, Prisma, UI libs) nếu đủ.
9. **Noisy UI cleanup**: mọi button/link làm được việc thật; trạng thái empty/loading/error; điều hướng mobile và thông tin nông sản Đồng Nai nhất quán; không có liên kết `#` vô nghĩa, text giả, badge chứng nhận vô căn cứ, analytics mock hiện như dữ liệu thật.
10. **Quản lý quyền xóa**: được tự động dọn code/asset bị chứng minh không sử dụng trong nhánh làm việc và commit có thể revert; không được tự động drop DB/production migrations/data, force push, xóa repo, xóa nhánh production hoặc ghi đè tài nguyên bên ngoài. Với việc phá dữ liệu phải báo `BLOCKED_DESTRUCTIVE_CHANGE` và nêu hướng an toàn.

## E. BẢO TOÀN TÍNH NĂNG VÀ AI CỐT LÕI

Sau cleanup, ít nhất các luồng sau phải còn vận hành: duyệt catalog, lọc/tìm kiếm/chi tiết nông sản, hồ sơ nhà vườn, QR truy xuất lô và lịch sử chăm sóc thật/được gắn nhãn demo, đăng ký/login/logout nếu đã có API production, cart + đặt hàng, lịch sử/chi tiết/trạng thái đơn, supplier quản lý product/batch, admin kiểm duyệt, các quyền USER/FARMER/INSPECTOR/LOGISTICS/ADMIN còn phục vụ nghiệp vụ, CSKH phản hồi/khiếu nại. Nếu chức năng cũ chưa chạy từ đầu, ghi baseline bug và sửa hoặc tách khỏi luồng demo minh bạch; không báo 'bảo toàn 100%' khi chưa test.

AI dự thi bắt buộc gắn với dữ liệu thật: tư vấn câu hỏi về nông sản, nguồn gốc, giá, mùa vụ; tìm sản phẩm theo nhu cầu/giá/số lượng; tạo combo/giỏ/RFQ có validator server-side; chatbot chuyển người thật khi thiếu thông tin; đo AI so với baseline filter/tra cứu thủ công bằng ít nhất 30–50 ca kiểm thử có nhãn. Server không được để AI tự ghi giá, tồn kho, chứng nhận hoặc trạng thái thanh toán. Thiếu API key, quota hết hoặc API trả lỗi -> cảnh báo rõ và cho phép tìm kiếm thủ công, không dùng output mock giả live.

## F. GATE VÀ CHECKLIST RELEASE

**R0 — PRE-FLIGHT**: `git status`, commit SHA, node/npm/lockfile, inspect live gh-pages workflow & Settings, production backend availability, env names (không in values), archived backup, baseline build. Lập bảng `KEEP/REFACTOR/REMOVE` và liệt kê P0 nguy hiểm. Output `docs/RELEASE_AUDIT.md`.

**R1 — CLEAN+SECURE**: Sửa production mocks/certification/data, JWT/token/upload/security, bỏ lỗi cũ, clean assets/dependencies. Commit checkpoint; thử luồng chính. Output `docs/CLEANUP_AUDIT.md`, diff, test evidence.

**R2 — GH PAGES FIX**: Test static export, `basePath`/asset URLs, sửa QR query route/other dynamic routes, production `NEXT_PUBLIC_API_URL`, CI workflow. Chạy build với production target. Preview export và smoke test navigation. Output `docs/GITHUB_PAGES_ARCHITECTURE.md`.

**R3 — LIVE BACKEND+AI (HOST THƯƠNG MẠI RIÊNG)**: Chọn/kiểm tra hosting cho phép thương mại điện tử, backend HTTPS + DB theo quyền hiện có; set CORS/auth/rate limit/env securely, chạy migration an toàn, smoke test API; kết nối AI live backend với quota nhỏ nếu có key hợp lệ. Với Pages chỉ chạy showcase/dữ liệu demo không thu thông tin khách. Output `docs/PRODUCTION_CONFIG.md` (chỉ tên biến, không lưu secret).

**R4 — RELEASE HAI ĐÍCH**: Chạy lint, typecheck, tests, build; commit/push, trigger Action khi pass. (A) Kiểm tra Pages tại `https://lovemvaf.github.io/cropnetkhoaduc/`: DOM/network, nhiều trang, QR demo, AI demo an toàn, không giao dịch/đăng nhập thật. (B) Trên host thương mại riêng: login, cart, checkout, order, AI, phân quyền, database persistence. Nếu host chưa có, công bố `GITHUB_PAGES_SHOWCASE_VERIFIED + BLOCKED_FULL_APP_HOSTING` nếu phù hợp. Output `docs/RELEASE_VERIFICATION.md`.

**R5 — COMPETITION POLISH**: Lighthouse/performance accessibility, ảnh hợp lệ, UI responsive, SEO, metadata OG, privacy, demo mode có nhãn, scripted pitch, video demo, bảng số liệu AI và tác động kinh doanh, một đối tác kinh doanh cụ thể. Release tag nếu phép kiểm tra thành công, có rollback instructions. Output `docs/COMPETITION_DEMO.md`.

**BẮT BUỘC TEST:**
- Địa chỉ `https://lovemvaf.github.io/cropnetkhoaduc/` HTTP 200, CSS/JS/images không 404; các route công khai mở bằng direct-link và refresh.
- JS bundle không chứa `localhost:5000`, secret/JWT/DB password/Gemini key hoặc địa chỉ nội bộ (trừ ví dụ tài liệu không đóng gói production).
- Gọi backend production HTTPS không có Mixed Content/CORS lỗi; auth dùng được trên browser thực; user A không truy cập order/batch của B.
- Mã lô MỚI chưa nằm trong danh sách pre-rendered cũ có thể sinh QR và mở đúng trang lô. QR của lô không tồn tại không hiển thị lô bất kỳ; DB down báo lỗi trung thực.
- Ảnh vườn/nhật ký/chứng nhận thể hiện đúng tình trạng xác minh; không tự tạo PASSED, VietGAP, dữ liệu vận chuyển, số lượng sản phẩm hoặc tọa độ giả trong production.
- Trên Pages: khách có thể trải nghiệm danh mục và demo AI/QR bằng dữ liệu minh họa, không thu dữ liệu nhạy cảm hoặc thanh toán thật. Trên host thương mại: khách chọn mặt hàng -> AI tư vấn (live nếu có key) -> giỏ -> đặt hàng -> dashboard; kiểm tra số lượng, tổng tiền và tồn kho trên server.
- GitHub Action deploy tới nhánh/artifact đúng với Pages Settings; sau push website nhận bản commit mới và không bị cache version cũ; có thể rollback an toàn.
- Kết quả AI có nguồn, giải thích hạn chế; đo thời gian tư vấn/báo giá so với thủ công trên bộ ca kiểm thử; không bịa phần trăm tiết kiệm.

## G. BẢN BÁO CÁO CUỐI CÙNG PHẢI CÓ

Khi hoàn tất, trả lời bảng markdown gồm:
1. `Current HEAD`, danh sách commits/PR, branch, trạng thái clean.
2. Những gì đã xóa/refactor: file, lý do, số dependency, regression đã chạy.
3. Các bug/safety P0 đã sửa và chứng cứ test.
4. GitHub Actions workflow URL, status, conclusion và SHA đã deploy.
5. **Live showcase URL:** `https://lovemvaf.github.io/cropnetkhoaduc/` + kết quả browser thực; ghi rõ là bản showcase/demo không dùng nhận giao dịch thương mại.
6. **Live full commerce app URL (host phù hợp):** nếu có, domain HTTPS, health/DB, auth, QR, order, AI live; nếu chưa có, báo blocker không tự tạo link.
7. Danh sách feature hoạt động 100%, feature partial, thiếu API key/hosting/quyền/đối tác và nguyên nhân.
8. Bảng số liệu AI vs manual/rule-based và dữ liệu đánh giá, nếu đã thực sự đo.
9. Cấu hình GitHub Pages Settings, workflow settings hoặc GitHub secrets cần chủ repo thao tác nếu không có quyền.
10. Rollback: commit/tag ổn định trước, cách revert frontend/backend, khôi phục dữ liệu nếu cần.

**Kết quả phải báo hai trạng thái riêng:** Pages = `GITHUB_PAGES_SHOWCASE_VERIFIED` / `PARTIAL_PUBLIC_FRONTEND` / `BLOCKED_DEPLOY_PERMISSION` / `FAILED_TESTS`; full commerce app = `FULL_APP_VERIFIED` / `BLOCKED_FULL_APP_HOSTING` / `FAILED_TESTS`. **Tuyệt đối không báo full app đã chạy chỉ vì `npm run build` hoặc push `gh-pages` thành công.**

## H. MỆNH LỆNH HÀNH ĐỘNG

**HÃY BẮT ĐẦU NGAY: audit repo HEAD thật → dọn sạch an toàn → sửa QR/static routing/API production → chạy test → xây GitHub Pages showcase đúng điều khoản → cấu hình/deploy full commerce app trên host phù hợp nếu có quyền → commit/push và kiểm tra LIVE đúng từng URL → sửa cho tới khi các chức năng tương ứng hoạt động hoặc nêu blocker khách quan.** Không chỉ lập thêm plan. Không hỏi lại những dữ liệu đã có; chỉ yêu cầu người dùng thực hiện thao tác bảo mật/quyền truy cập ngoài khả năng của agent. Tất cả thay đổi phải ở đúng dự án, giữ chức năng có giá trị, có thể revert, có bằng chứng. Mọi cải tiến phải góp phần vào sản phẩm thương mại nông sản Thành phố Đồng Nai cho AI Digital Business Challenge.
