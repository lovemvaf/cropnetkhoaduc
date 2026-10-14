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
