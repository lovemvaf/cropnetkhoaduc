# MASTER PROMPT HOTFIX & QUALITY RELEASE — CROPNET ĐỒNG NAI AI
**Ngày audit:** 15/10/2026. **Đích source:** https://github.com/lovemvaf/cropnetkhoaduc (`main`). **Đích showcase:** https://lovemvaf.github.io/cropnetkhoaduc/. **Loại sản phẩm:** AI Digital Business Challenge 2026.

> **Lệnh triển khai:** Bạn là Tech Lead + QA + AI Engineer + Product/Data Auditor. HÃY THỰC THI sửa mã nguồn, chạy kiểm thử, sửa CI, triển khai và nghiệm thu website. ĐỪNG CHỈ VIẾT LẠI KẾ HOẠCH. Đọc các master plan/prompt trước và đặc biệt chú ý những bằng chứng đã phát hiện bên dưới; nếu code mới thay đổi, kiểm tra lại toàn bộ trên HEAD hiện tại. Không coi README, tài liệu, lời hứa hay test giả lập là bằng chứng sản phẩm đang hoạt động.

## 0. THỰC TRẠNG ĐÃ KIỂM CHỨNG (ĐỌC TRƯỚC KHI CODE)

- `main` tại thời điểm audit: commit `9337b08ab6083638d644769dbfa103c9eb06169e`.
- GitHub Actions run https://github.com/lovemvaf/cropnetkhoaduc/actions/runs/38608279856 có `status=completed`, `conclusion=failure`. Step **Run automated security & AI test suite** bị lỗi; bước **Build web** và **Deploy** đều `skipped`.
- Log job `116004714945` cho thấy lỗi TypeScript **TS7006 implicit any** trong `src/modules/ai/ai.service.ts` và `admin`, `analytics`, `forum`, `order`. Kiểm tra thiếu bước `prisma generate` trong CI trước khi chẩn đoán; KHÔNG được tắt `strict`/`noImplicitAny`, bỏ test, nuốt exit code hoặc sửa bằng `any` tràn lan.
- Nhánh `gh-pages` tại thời điểm audit: commit `09813bb26ed662ecda170ce315a8d4b3829bda80`, chưa chứa các thư mục xuất bản `ai-tu-van`, `ban-do`, `mua-vu`. Đây là bằng chứng nhánh deploy còn bản cũ; không được tự ghi `GITHUB_PAGES_SHOWCASE_VERIFIED` trước khi sửa, push và kiểm tra URL sau deploy.
- `apps/web/src/app/traceability/page.tsx`: chế độ camera và upload dùng `setTimeout` rồi điều hướng đến mã lô hardcode. Không phải giải mã QR thật. Hàm `handleSearch` điều hướng sang `/traceability/[batchCode]`; cần dùng route tĩnh chuẩn `/traceability/?batch=<code>` trên GitHub Pages và áp dụng `basePath` chính xác.
- `apps/web/src/app/ai-tu-van/page.tsx`: nhánh catch dùng 'Offline smart fallback simulation', tạo phản hồi/các mặt hàng cố định kể cả lúc API không hoạt động; RFQ cũng tạo thông báo `SUBMITTED` tại frontend khi offline. PHẢI ngừng giả vờ đã gửi yêu cầu thật.
- `apps/server/src/modules/ai/ai.service.ts`: xử lý truy vấn chủ yếu từ khóa/regex, combo hardcode theo ID `'1'`, `'2'`, v.v, trong khi seed DB có ID dạng `prod-*`; chức năng đang giống hệ luật + template hơn một mô hình ngôn ngữ có xử lý thực. Có hardcoded cam kết 'mọi sản phẩm OCOP/VietGAP/QR', 'đối tác độc quyền', 'sẵn hàng' mà chưa có nguồn. `apps/server/src/modules/ai/ai.controller.ts` trả `201 SUBMITTED` cho RFQ soạn bằng object nhưng không ghi DB hay gửi cho nhân viên.
- `apps/server/src/database/seed.ts`, `dbFallback.ts`, trang bản đồ/mùa vụ, QR và các tài liệu chứa tên HTX, chứng nhận, lô, kết quả phòng lab, Brix, lịch chăm sóc, thời gian giao và địa chỉ liên hệ giả lập/không có chứng cứ. Seed có mẫu báo cáo `PASSED` và claims không phát hiện dư lượng mà KHÔNG được xem là chứng nhận thật. Những mẫu demo bắt buộc ghi 'DỮ LIỆU MINH HỌA – KHÔNG PHẢI CHỨNG NHẬN THẬT'.
- Nhiều sản phẩm dùng **cùng ảnh Unsplash cho các loại nông sản**, ảnh vật liệu không đúng sản phẩm; thiếu bộ ảnh bưởi Tân Triều/nhà vườn được cấp phép. Ảnh thật phải đúng đối tượng và có quyền dùng.
- `apps/web/next.config.ts`: `output:'export'`, basePath `/cropnetkhoaduc`, `eslint.ignoreDuringBuilds:true`; cần kiểm tra static export, đường dẫn ảnh và JS, không xem compile thành công là đủ.
- `apps/web/src/shared/services/api.ts` có `isShowcaseDemoMode`: production GitHub Pages không có backend thì API không hoạt động. Phải thiết kế rõ **showcase tĩnh trung thực** vs **ứng dụng thương mại có backend HTTPS + PostgreSQL**, không hiện nút giả `Đặt hàng thành công`.
- `docs/AI_EVALUATION.md` và báo cáo trước có các số `99.5% giảm thời gian`, `0% lỗi`, `48.2% chuyển đổi`, `100% minh bạch`; nếu không có raw logs, phương pháp, cỡ mẫu, dữ liệu độc lập thì phải gỡ khỏi lời khẳng định đã đo, đổi thành 'mô phỏng/mục tiêu', hoặc đo lại. 13 test case unit không chứng minh 100% vận hành.
- **Sự thật địa phương:** Bưởi Tân Triều (đường lá cam, da xanh) là đặc sản Đồng Nai, KHÔNG xóa vì nhầm là tỉnh khác. Theo Nghị quyết 30/2026/QH16: **Thành phố Đồng Nai** từ 30/4/2026. Tân Bình/Vĩnh Cửu là địa chỉ hành chính cũ; đơn vị cấp xã hiện hành là **phường Tân Triều**. **phường Xuân Lập, Thành phố Đồng Nai** thay cho cấu trúc lồng `TP Long Khánh, TP Đồng Nai`. Giữ 'Long Khánh', 'Vĩnh Cửu' như vùng địa lý/lịch sử khi cần; tên hành chính phải đúng. Xác minh từng địa chỉ HTX trước khi công bố, không tự đoán số nhà/địa chỉ.
- Nguồn pháp lý & địa phương: https://vanban.chinhphu.vn/?classid=1&docid=218009&pageid=27160 ; https://tantrieu.dongnai.gov.vn/vi/ ; https://dongnai.gov.vn/vi/news/tin-hoat-dong-linh-vuc-nganh/xay-dung-san-pham-du-lich-tieu-bieu-dau-tien-cua-dong-nai-56129.html ; https://baodongnai.com.vn/thanh-pho-dong-nai/202605/ong-hanh-cung-su-phat-trien-cua-doanh-nghiep-8712e2d/ . Bài báo có ghi sản phẩm bưởi một số cơ sở OCOP 4 sao, không suy ra rằng TẤT CẢ lô/nhà vườn đều đạt 4 sao.

## 1. NHỮNG NGUYÊN TẮC KHÔNG THƯƠNG LƯỢNG
1. Thực thi theo thứ tự P0 → P1 → P2. **Đích P0:** trang mới thật sự lên GitHub Pages, ảnh tải, sản phẩm Đồng Nai chính xác, QR thật, AI/DEMO phân biệt minh bạch.
2. Không xóa module cũ vô tội vạ, không wipe production DB, không xóa lịch sử git, không `git push --force` lên `main` hoặc `gh-pages`. Tạo nhánh fix và PR để review nếu có thể; merge sau khi CI xanh. Luôn có backup/rollback commit SHA.
3. Không fake API key, không tự bật dịch vụ trả phí hoặc vượt quyền; nếu thiếu cấu hình, báo blocker với phương án open-source/miễn phí hợp lệ. Không dán key vào client, repo, log.
4. Không gọi các bộ lọc cứng, combo hardcode hoặc mẫu hội thoại là 'AI thực' hoặc 'Tool calling' nếu không thực sự chạy mô hình/tools đã kiểm thử. Cung cấp `mode`: `live_ai`, `verified_rules`, `demo_example`, `offline_unavailable` hiển thị minh bạch.
5. Không quảng cáo thực phẩm như thuốc chữa bệnh; không tuyên bố nông sản hữu cơ, VietGAP, HACCP, OCOP, chỉ dẫn địa lý hoặc đã kiểm nghiệm nếu không có chứng cứ gắn đúng đối tượng/chủ thể/lô, hiệu lực và nguồn. Với sản phẩm có cồn, loại khỏi combo mặc định/bản demo dành cho người dùng phổ thông; rà soát điều kiện kinh doanh phù hợp nếu tiếp tục hỗ trợ sản phẩm đó.
6. Tuyệt đối không tuyên bố liên kết/ủy quyền/cung ứng độc quyền với HTX, nhà vườn, cơ quan quản lý khi chưa có chấp thuận. Không dựng hotline giả, tọa độ giả, tồn kho giả như dữ liệu thật.
7. Dùng nguồn dữ liệu có xuất xứ, có đơn vị quản trị và quyền sử dụng; không tự thay sản phẩm 'bưởi Tân Triều' thành thứ khác do hiểu sai.
8. Show case GitHub Pages là static; muốn backend thật phải deploy HTTPS+DB bên ngoài hợp lệ. Bản Pages không tự nhận đơn hàng nhạy cảm/thu thập thông tin thanh toán hoặc mật khẩu như một trang e-commerce production. Dùng liên hệ thật có đồng ý, hoặc CTA 'Yêu cầu demo' không thu PII. Các tính năng không có backend phải khóa đúng nghĩa.

## 2. GATE P0-A: DẬP LỬA CI/DEPLOY (ƯU TIÊN SỐ 1)
- Clone repository HEAD mới nhất, lập bảng `file/function -> lỗi -> root cause -> sửa -> test`. Lấy workflow logs, đừng dựa vào `npm test` chạy trên máy tác giả.
- Điều chỉnh `.github/workflows/deploy.yml` cho monorepo NPM: `npm ci`, **`npx prisma generate --schema=apps/server/prisma/schema.prisma`** trước `npm test`, `npm run build:server`, `npm run build:web`; kiểm tra đường dẫn Prisma và environment CI nếu cần. Nếu code thật có TS7006 sau generate, sửa kiểu bằng các type thực và các callback đã nêu; giữ TypeScript nghiêm ngặt.
- Bật lint riêng, không chỉ `eslint.ignoreDuringBuilds:true` rồi bỏ qua. Định nghĩa script lint và typecheck rõ ràng. Đừng sửa bằng `@ts-nocheck`, `any`, bỏ bước test hoặc `|| true`.
- Kiểm tra `NEXT_PUBLIC_BASE_PATH=/cropnetkhoaduc`, static `output:'export'`, `trailingSlash:true`, asset prefix, Next Link Router, public images, dynamic routes. Giải quyết thực trạng `generateStaticParams` cũ cho chi tiết sản phẩm và URL QR mới; QR link tĩnh `/cropnetkhoaduc/traceability/?batch=<encoded>`.
- Chạy trên môi trường sạch tương đương CI, không phụ thuộc node_modules cache và biến .env của người lập trình. Sau commit, chờ workflow chạy xong, xác nhận `success` & nhánh gh-pages có `/ai-tu-van/index.html`, `/ban-do/index.html`, `/mua-vu/index.html` và tệp JS/ảnh tương ứng. Nếu gh-pages là nguồn publish thực, kiểm tra cấu hình Pages và cache; không công bố thành công khi chưa thấy commit mới.
- Test trực tiếp các URL: `/cropnetkhoaduc/`, `/products/`, `/ai-tu-van/`, `/ban-do/`, `/mua-vu/`, `/traceability/?batch=BATCH-BUOI-TANTRIEU-2026-01` và mã bất kỳ không tồn tại. Test hard reload và truy cập trực tiếp trong tab ẩn danh; chụp bằng chứng thiết bị mobile + desktop, Network/Console không có 404 bất thường/hydration lỗi.
- Lập `DEPLOY_VERIFICATION.md` có workflow run ID, HEAD SHA, gh-pages SHA, thời gian test, URL+HTTP code và màn hình kiểm thử. Trạng thái `PASS/FAIL/BLOCKED`; KHÔNG chép lại báo cáo cũ '100% Verified'.

## 3. GATE P0-B: KHÔI PHỤC TOÀN BỘ ẢNH, DỮ LIỆU VÀ NÔNG SẢN ĐỒNG NAI
- Quét tất cả `apps/web/public`, `San pham/`, `src/app`, `packages`, `seed.ts`, `dbFallback.ts`, tài liệu giới thiệu, các ảnh URL external, tag, alt, SEO. Phát hiện ảnh chết, ảnh stock không khớp sản phẩm, ảnh trùng lặp, ảnh vùng miền khác, ký tự/tên file có dấu, đường dẫn basePath đôi, hotlink lỗi, nội dung cũ 'Nông sản Việt Nam' hoặc Cái Mơn/Đà Lạt/Vĩnh Long.
- Catalogue ưu tiên: **Bưởi đường lá cam Tân Triều, bưởi da xanh Tân Triều, sầu riêng Long Khánh/Xuân Lập, chôm chôm nhãn Long Khánh, hạt điều có nguồn tại địa bàn Đồng Nai hiện hành**. Đây là *danh sách nhóm sản phẩm cần xác minh theo từng nhà sản xuất*, không tự gán số OCOP. Cho thêm các sản phẩm Đồng Nai đúng nguồn nếu có dữ liệu/ảnh thật và quyền sử dụng.
- Yêu cầu mỗi sản phẩm có: ID duy nhất ổn định, tên chuẩn, hình 1-3 ảnh đúng loại, giá và đơn vị bán (hoặc 'liên hệ báo giá'), tồn kho `unknown` nếu không xác minh, loại hàng, địa danh/vùng trồng, `supplierId`, trạng thái `VERIFIED/UNVERIFIED/DEMO`, nguồn chứng thực, thời điểm cập nhật, tags được chứng minh, mùa vụ ước tính chỉ khi nguồn có căn cứ. Tài liệu `docs/PRODUCT_DATA_AUDIT.md` dạng bảng đối chiếu từng item, `source_url`, `media_license`, người xác nhận, mức tin cậy.
- Ảnh sản phẩm phải là **ảnh đúng trái/bao bì/vườn**, ưu tiên đối tác đồng ý dùng; ảnh hợp pháp từ nguồn ảnh chính thức ghi attribution nếu cần. KHÔNG tự lấy ảnh báo chí rồi coi là được phép. Ảnh AI tạo chỉ dùng thiết kế hero concept có chú thích, không làm ảnh chứng minh hàng thật/lô thật/nhà vườn thật.
- Sửa địa chỉ hiển thị theo hành chính 2026: **phường Tân Triều, Thành phố Đồng Nai**, **phường Xuân Lập, Thành phố Đồng Nai** khi phù hợp; tên nhà vườn/tọa độ phải xác minh. Có thể lưu `addressHistorical` riêng để tìm kiếm bằng địa danh cũ; không lồng 'Thành phố Long Khánh, Thành phố Đồng Nai'. Hiện nay vùng Thành phố Đồng Nai bao gồm cả khu vực Bình Phước trước đây, nhưng không được đổi xuất xứ sản phẩm từ tỉnh khác thành Đồng Nai chỉ bằng sửa label.
- Kiểm tra tên HTX/công ty có tồn tại đúng thực thể không; tên không xác minh thì dùng `Nhà vườn minh họa A`, không ghi là được cấp phép/cộng tác; không đính địa chỉ/thông tin tổ chức thật vào dữ liệu demo khác.
- Loại hàng có cồn (rượu bưởi) khỏi combo mặc định và ưu tiên nông sản không hạn chế độ tuổi cho buổi thi; nếu giữ phải có tuân thủ phù hợp.
- Dữ liệu khi DB unavailable: giao diện **được hiển thị demo minh bạch** với badge 'DỮ LIỆU MINH HỌA', nhưng không trộn như catalog thật, không cho thanh toán hoặc đặt đơn thật. Không fallback 'sản phẩm khác đầu tiên' khi ID sai.
- Asset check script test HTTP/size/mime/correct mapping và ảnh không trùng cho các SKU khác nhau trừ ảnh hợp pháp dùng chung có ghi rõ. Phải có empty/loading/error/fallback image tử tế trên mọi trang.

## 4. GATE P0-C: QR TRUY XUẤT THỰC SỰ HOẠT ĐỘNG, KHÔNG GIẢ LẬP
- Xóa `setTimeout` giả lập đọc QR tại `apps/web/src/app/traceability/page.tsx`. Dùng thư viện MIT/Apache tương thích như `nimiq/qr-scanner` hoặc `@zxing/browser`, kiểm tra bản quyền trước khi thêm. Camera thật (`getUserMedia`) có permission states, loading, stop camera/unmount, đổi camera trước/sau, lỗi quyền và fallback nhập tay; giải mã ảnh upload thật qua fileReader/decoder.
- Chuẩn hóa URL QR dưới HTTPS + `basePath`: `https://lovemvaf.github.io/cropnetkhoaduc/traceability/?batch=<encoded_batch_code>` cho showcase. Quét QR đã có URL hợp lệ hoặc mã lô hợp lệ, parse an toàn; không tự điều hướng sang URL bên ngoài do QR cung cấp; không hardcode tất cả trường hợp về một lô.
- Truy vấn DB lô thật bằng backend production, hoặc bảng dữ liệu demo tĩnh được duyệt với nhãn **DEMO** khi chỉ dùng GitHub Pages. Mã không tồn tại hiển thị `NOT_FOUND`, API lỗi hiển thị `UNAVAILABLE`; KHÔNG báo 'tem giả' khi chỉ thiếu dữ liệu; KHÔNG lấy mẫu đầu tiên làm fallback.
- Xây UI trang lô: mã, sản phẩm, nhà vườn và vị trí được phép công khai, ngày thu hoạch (nếu biết), ảnh vườn (chỉ khi có quyền), nhật ký chăm sóc có thời gian/nguồn/đơn vị xác nhận, timeline vận chuyển (nếu có bằng chứng), chứng nhận có tình trạng kiểm tra. Phân biệt `self_declared`, `admin_reviewed`, `third_party_verified`, `demo`. Không dùng badge 'đã kiểm định' với phiếu giả định.
- Kiểm thử tạo QR cho lô A, đọc bằng máy khác → đúng lô A; tải ảnh QR B → đúng lô B; mã ngẫu nhiên → không tìm thấy; tắt camera → dừng stream; reload URL truy xuất → còn hoạt động. Ít nhất 2 điện thoại hoặc camera máy tính.

## 5. GATE P0-D: LÀM AI TRỞ THÀNH AI THẬT, CÓ GIÁ TRỊ KINH DOANH
- Tách 3 tầng: (1) `catalog tools` đọc dữ liệu sản phẩm/lô/giá/tồn kho/thông tin nhà vườn có nguồn, (2) LLM/NLU (sử dụng API có key hợp lệ hoặc model OSS local) hiểu yêu cầu tự nhiên, rút điều kiện, đặt câu hỏi thiếu, phân tích ý định, (3) bộ giải tối ưu/ràng buộc bằng code kiểm chứng giá, số lượng, SKU, hạn ngân sách và các điều kiện người mua. Trả JSON schema đã validate với model version, `toolsUsed`, `evidenceRefs`.
- Hỗ trợ câu tiếng Việt tự nhiên khác template: 'Tôi có 300 nghìn, mua cho 5 người, không hạt điều', '20 hộp quà cần giao tuần sau', 'bưởi Tân Triều có sẵn không?', 'so sánh giá và nguồn gốc hai giống bưởi', '100kg báo sỉ', 'hàng hết thì thay thế gì'. Chỉ trả sản phẩm thật trong catalog đã kiểm tra, không bịa giá, tồn kho, OCOP, mùa vụ.
- Phân biệt 'bộ gợi ý bằng luật' với 'AI/NLU', đừng biến regex keyword matcher thành tên thương mại `AI Copilot`. Khi không có LLM token/key, hiển thị `AI chưa được cấu hình / bản demo quy tắc`, KHÔNG giả trả lời live.
- Sửa mismatch ID `prod-*` trong DB và `'1'..'6'` trong combo/frontend/seed. Mọi thao tác từ AI -> cart -> checkout phải dùng ID thật đã trả từ API catalog và kiểm tra lại giá/tồn kho server-side; không để giá do AI tự ghi vào đơn.
- Gỡ tất cả câu khẳng định tuyệt đối `toàn bộ sản phẩm OCOP/VietGAP`, `HTX độc quyền`, `giảm 100% lỗi`, `đã gửi báo giá`, `đang sẵn hàng` khi không có dữ liệu. AI phải nói 'chưa có dữ liệu xác minh' và đề nghị liên hệ đối tác.
- RFQ: `POST /ai/draft-rfq` chỉ tạo **bản nháp** nếu không persist. Nếu nói `SUBMITTED` phải có bảng `RFQ`/`RFQItem` thật, ghi DB, notify dashboard quản trị (không cần email nếu thiếu SMTP); hoặc ghi `DRAFT_LOCAL` và cho người dùng tải/copy bản nháp. Không bao giờ sinh số hotline giả hoặc hẹn phản hồi 4 giờ nếu chưa có SLA.
- Chống prompt injection trong mô tả sản phẩm/tin nhắn người dùng; input validation, tool authorization, rate-limit, PII minimization, backend secrets, budget token, cache. Rà soát phép tính VND và format tiền 1.000.000 / 1tr / 500k, số lượng gói và đơn vị kg/quả/hộp.
- Ở GitHub Pages không có backend: chỉ demo minh bạch có ví dụ đã chọn, badge 'MÔ PHỎNG', không tuyên bố AI đang chạy thật. Nếu được cấu hình API AI hợp lệ phải chạy qua server HTTPS và báo được trace/server logs.

## 6. GATE P1: KHÔI PHỤC CHỨC NĂNG WEB & UX TOÀN DIỆN
- Test navigation/hard reload cho mỗi route đã xuất bản: homepage, products, product detail, cart, checkout (demo mode), login/register (disabled rõ ràng khi Pages thiếu backend), AI, map, season, QR, forum, dashboards. Không để nút bấm vô tác dụng hay lỗi im lặng.
- Bản đồ: nhà vườn verified hoặc demo được gắn nhãn; tọa độ chính xác khi được phép, marker click -> hồ sơ -> sản phẩm -> QR; không đưa tọa độ bịa trên OpenStreetMap; phù hợp attribution/rate limit tile. Lọc theo khu vực/hàng/khoảng cách khi có dữ liệu.
- Lịch mùa vụ: chính vụ/đặt trước/đang cập nhật phải gắn thời điểm, nguồn hoặc do nhà vườn cập nhật; không hardcode 'đang vào vụ' quanh năm hoặc dự báo sản lượng khi thiếu dữ liệu. Cho phép chủ vườn nhập sản lượng dự kiến và ghi nhãn ước lượng.
- Ảnh: ưu tiên đúng sản phẩm, ảnh có nguồn, optimized webp/avif nếu phù hợp, lazy load, alt; kiểm thử tất cả đường dẫn ảnh tải được từ URL có `basePath`. Xử lý CDN/Unsplash lỗi; ảnh fallback có nhãn placeholder trung thực.
- Mobile-first: 360, 390, 768, 1366px; hamburger, touch targets >=44px, sticky header, modal, keyboard, accessibility, feedback khi loading/error, responsive map, skeleton.
- Kết nối order: nếu backend thật có thể checkout chuẩn và quản lý trạng thái; trong Pages showcase không nhận thanh toán/thông tin nhạy cảm, không giả đơn thành công. Test tạo/huỷ/quản lý đơn trong staging có DB, không đụng production thật.
- Thêm trạng thái quản trị sản phẩm: `PENDING_VERIFICATION`, `VERIFIED`, `DEMO_ONLY`, `OUT_OF_STOCK`; admin rà soát chứng từ và nội dung nhà vườn. Đánh giá phải liên quan đơn hàng hợp lệ; không dựng rating 5 sao bằng số giả.
- Rà soát quyền sở hữu hình, chứng từ, hợp tác xã; terms, privacy, contact, dữ liệu có thời hạn công bố.
- UX/SEO: metadata tiếng Việt, OG image chính xác, favicon, 404, sitemap nếu thích hợp, robots, title/description, Core Web Vitals cơ bản.

## 7. GATE P1/P2: ĐÁNH GIÁ ĐỊNH LƯỢNG AI, MINH CHỨNG CUỘC THI
- Viết ít nhất 30–50 prompt thử nghiệm độc lập, chia nhu cầu mua, ngân sách, loại trừ dị ứng/nguyên liệu, so sánh vùng trồng, truy xuất, câu hỏi thiếu dữ liệu, hỏi ngoài phạm vi. Có labels/tham chiếu sản phẩm/số tiền/bằng chứng, ghi dataset version.
- Đánh giá `(a) lọc/sắp xếp thông thường; (b) luật thuần; (c) AI+tools+constraint solver` cùng dữ liệu đầu vào. Đo: schema valid rate, đúng SKU, tỷ lệ vượt ngân sách, hallucination rate, stock mismatch, tỷ lệ trả đúng tình trạng chứng nhận, trung vị/p95 latency, API cost mỗi lượt.
- Thử 5–10 người dùng thật (nếu có thể), dùng hai tập nhiệm vụ tương đương hoán đổi thứ tự để giảm thiên lệch. Đo thời gian từ mô tả nhu cầu tới giỏ hợp lệ, số thao tác, tỷ lệ hoàn tất, nhận thức đúng về nguồn gốc và SUS/CSAT tùy cỡ mẫu. Ghi raw data vô danh, phương pháp, ngày, phân bố, không bịa số.
- Thu hồi hoặc sửa các số tuyên bố 99.5%, 48.2%, 0%, 100% trong `docs/AI_EVALUATION.md`, thuyết minh, homepage nếu thiếu phép đo độc lập và dữ liệu chứng cứ. Chỉ đưa số thật được tính tự động từ log; 'mock conversion rate' không được công bố như conversion thật.
- Demo 1 mạch: chọn bưởi Tân Triều -> xem nguồn gốc/QR (có nhãn mức xác minh) -> nhập nhu cầu/budget -> AI đọc catalog -> tạo combo dưới ngân sách -> người dùng sửa số lượng -> thêm đúng SKU -> quản trị nhận yêu cầu báo giá thật HOẶC xác nhận đây chỉ là bản nháp demo. So sánh baseline đã đo.

## 8. DỌN SẠCH CODE CÓ KIỂM SOÁT
- Lập inventory toàn repo với import graph, unused imports/deps/assets, dead routes, duplicated functions, TODO/FIXME, old locations, fake report, debug logging. Chỉ xóa khi có bằng chứng không được tham chiếu hoặc đã thay thế an toàn. KHÔNG xóa tài liệu kinh nghiệm, seed demo hay historical references nếu còn sử dụng; có thể đưa vào `fixtures/demo` kèm nhãn và exclude khỏi production.
- Tách mock/test fixtures khỏi production bundle, xóa fallback dùng mã lô bất kỳ và trạng thái `PASSED` giả. Rà soát `dbFallback.ts`/client trace service/frontend; không tạo identity giả cho nhà vườn.
- Bảo mật: JWT secret không dùng fallback mặc định trên production, không log OTP/token, phân quyền upload, validate file thật, CSP/CORS đúng origin, rate limit, kiểm tra dependency và `.env`, dữ liệu không được commit. Migrations giữ data an toàn, backup trước thay đổi.
- Không làm lại Next.js/Express/Prisma/PostgreSQL bằng stack khác chỉ vì thích template. Tiếp tục sử dụng module auth, order, traceability, analytics và UI có sẵn.

## 9. BÀN GIAO VÀ TIÊU CHÍ NGHIỆM THU ĐỊNH LƯỢNG
### Yêu cầu bắt buộc P0
1. GitHub Actions workflow **SUCCESS** trên commit thay đổi; tests thực chạy; `tsc` strict PASS; build backend PASS; static export PASS.
2. Nhánh `gh-pages` chứa trang AI, bản đồ, lịch mùa vụ mới, các trang tải ảnh, QR route; đã thực mở/hard reload URL công khai và không có lỗi JS chặn luồng demo.
3. Tất cả SKU featured được xác minh xuất xứ vùng Đồng Nai hiện hành và ảnh đúng loại, ghi nguồn; thông tin không xác minh hiển thị DEMO/CHƯA XÁC MINH.
4. Camera quét QR A/B cho ra hai mã khác nhau (không hardcode); ảnh upload đọc QR khác nhau; unknown => NOT_FOUND, offline => UNAVAILABLE, không lấy lô mẫu đầu tiên.
5. `live_ai` chỉ hiển thị khi gọi mô hình thật thành công, mô tả dữ liệu/cost phù hợp. Chế độ demo không giả là real AI; không RFQ `SUBMITTED` khi DB không ghi nhận.
6. Các cảnh báo/cam kết OCOP, VietGAP, hữu cơ, phiếu lab, giao hàng, tồn kho, HTX được đối chiếu nguồn; tuyệt đối không có lời khẳng định chưa được chứng minh.
7. Test luồng xuyên suốt desktop/mobile, direct-load, hình, map, chatbot, sản phẩm và QR. Có test case + screenshot/capture/HTTP evidence.

### Định dạng báo cáo mỗi mốc
`Gate | observed before | root cause | changed files | commands run | exit code | test evidence | deployed URL | actual status PASS/FAIL/BLOCKED | remaining risk`.

### Bắt buộc báo cáo cuối
- HEAD SHA, PR/commit URL, workflow link+conclusion, gh-pages HEAD SHA, thời điểm kiểm tra online; danh sách URL HTTPS đã mở và trạng thái của từng route.
- Bảng sản phẩm gồm tên chuẩn, nguồn Đồng Nai, hình ảnh, license, trạng thái chứng nhận, tình trạng tồn kho và chủ thể đã đồng ý cung cấp dữ liệu (nếu có).
- Video/screenshot kết quả quét QR A/B (camera/ảnh thật), demo AI live hoặc ghi rõ demo, cùng kết quả kịch bản không tìm thấy/không có mạng.
- Bảng lỗi chưa sửa và hạ tầng chưa có (backend, DB, AI key, tên miền, đối tác xác nhận), tác động tới tính năng; không đánh dấu hoàn thành nếu có blocker.
- `RELEASE_NOTES.md`, `DEPLOY_VERIFICATION.md`, `PRODUCT_DATA_AUDIT.md`, `AI_EVALUATION.md` được cập nhật trung thực. Hướng dẫn rollback **ưu tiên `git revert`/deploy lại commit đã kiểm thử**, không `push --force`/`reset --hard` trên nhánh đang phục vụ website.

## 10. CHIẾN LƯỢC THỜI GIAN CẤP BÁCH
Hạn nộp Digital Business theo kế hoạch là hết 15/10/2026. Trước hạn: chỉ P0 CI→deploy→sản phẩm/ảnh chuẩn Đồng Nai→QR thật hoặc ghi rõ giới hạn→AI minh bạch→video demo và bằng chứng. Không phát triển hàng chục tính năng P2 khiến mất trang nộp. Giữ một bản đang chạy ổn định làm đường lui; thử trên staging trước, không xóa dữ liệu thật.

**HÀNH ĐỘNG BẮT ĐẦU NGAY:** Mở log run `38608279856`, sửa TypeScript/prisma-generate, commit & chạy CI tới `success`, xác thực nhánh `gh-pages` đã cập nhật, rồi test website trực tiếp. Sau đó xử lý QR fake, dữ liệu sản phẩm/ảnh và AI. Hãy CODE, TEST, DEPLOY và CHỨNG MINH; không viết báo cáo thành công dựa trên giả định.
