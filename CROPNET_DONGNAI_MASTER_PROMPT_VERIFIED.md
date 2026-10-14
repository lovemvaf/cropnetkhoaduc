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
