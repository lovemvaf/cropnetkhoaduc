# MASTER PROMPT — CROPNET ĐỒNG NAI | HUMAN-DESIGNED UI/UX REDESIGN

> **Đây là yêu cầu THỰC THI, không phải yêu cầu viết thêm một kế hoạch.**
>
> Repo: `https://github.com/lovemvaf/cropnetkhoaduc`
>
> Bản showcase cần kiểm tra sau phát hành: `https://lovemvaf.github.io/cropnetkhoaduc/`
>
> Mục tiêu: thiết kế lại toàn bộ frontend để mang cảm giác thương hiệu nông sản Đồng Nai được một đội ngũ product designer và frontend engineer chuyên nghiệp tạo dựng riêng: tự nhiên, tinh tế, dễ dùng, giàu tính địa phương, nhất quán, tối giản có chủ đích. **Loại bỏ hoàn toàn gradient trang trí, cảm giác AI-template và hiệu ứng thừa.** Giữ hoạt động ổn định toàn bộ tính năng quan trọng, mobile/desktop xuất sắc.

## 0. VAI TRÒ VÀ NGUYÊN TẮC

Bạn đồng thời là Lead Product Designer, Senior Frontend Engineer, UX Researcher, Accessibility Engineer và QA/Release Engineer. **Phải sửa mã nguồn thực tế, chạy kiểm thử, xem kết quả render và chỉnh tới khi đạt tiêu chí.** Không chỉ trả lời bằng lời hứa, TODO hoặc mockup.

Các sự thật đã quan sát từ repo trước đây (tự fetch HEAD mới nhất để xác minh lại):
- Monorepo NPM Workspaces; frontend `apps/web` dùng Next.js App Router, React, Tailwind; UI chia sẻ ở `packages/ui`; backend `apps/server` Express/TypeScript và PostgreSQL/Prisma.
- Trang ở `apps/web/src/app` gồm `/`, `/products`, `/products/[id]`, `/traceability`, `/ai-tu-van`, `/ban-do`, `/mua-vu`, `/cart`, `/checkout`, `/orders/[id]`, đăng nhập/đăng ký và các dashboard đa vai trò.
- Các điểm có thẩm mỹ template rõ nhất: `apps/web/src/shared/components/Header.tsx`, `FloatingAiWidget.tsx`, `Footer.tsx`, `apps/web/src/app/page.tsx`, `apps/web/src/app/ai-tu-van/page.tsx`, `apps/web/src/features/products/components/ProductCard.tsx`, `apps/web/tailwind.config.ts`, `packages/ui/src/index.tsx`.
- Trong code trước đây xuất hiện `bg-gradient-*`, `from-* / via-* / to-*`, `font-black`, `shadow-2xl`, `rounded-3xl`, `animate-ping`, `animate-bounce`, blur glows, emoji/icon trang trí lặp lại, nhãn dày đặc và text rất nhỏ (`text-[9px]`, `text-[10px]`). Kiểm kê lại ở HEAD mới nhất, không thay thế máy móc mọi nơi.
- Repo xuất frontend tĩnh lên GitHub Pages với `basePath=/cropnetkhoaduc`, `trailingSlash`, workflow `.github/workflows/deploy.yml`; backend không chạy trên GitHub Pages. Giữ đúng kiến trúc và ghi rõ demo/live/backend trạng thái thực.

**Quy tắc không thương lượng:**
1. **Đây là UI/UX refactor, KHÔNG phải viết lại sản phẩm.** Giữ API contracts, Redux/Zustand (nếu đang có), routing, query parameters, quyền truy cập, hành vi giỏ hàng, AI, QR, đơn hàng, thanh toán thử nghiệm, và backend trừ khi cần sửa lỗi trực tiếp liên quan. Không xóa logic AI thật để xóa dấu vết “AI design”.
2. **Không gradient dưới bất kỳ hình thức trang trí nào ở frontend** (`linear-gradient`, `radial-gradient`, Tailwind gradient, màu chữ gradient, overlays gradient, glow, aurora, mesh gradient); không thay bằng một kiểu hiệu ứng hào nhoáng khác. Dùng các mảng màu phẳng và ảnh thật.
3. Không tạo thiết kế rập khuôn: không lặp 4 ô icon giống hệt ở mọi section; không lạm dụng cards, pills, badges, floating glassmorphism; không đánh bóng mọi phần tử; không nhồi CTA, emoji, Sparkles và biểu tượng robot.
4. **Giữ thông tin nông sản Đồng Nai trung thực.** Không dùng ảnh stock không liên quan rồi gọi là ảnh vườn Tân Triều. Không hiển thị OCOP/VietGAP, đánh giá 4.9, HTX đối tác, hotline, số liệu 100% hay AI online 24/7 nếu chưa có căn cứ trong dữ liệu. Nếu dữ liệu trình diễn phải ghi rõ “Dữ liệu minh họa” ở vị trí thích hợp.
5. Không tự mua dịch vụ, lộ API key, thay công nghệ chính, xóa dữ liệu người dùng, force push hoặc sửa cấu hình bảo mật nhằm vượt qua CI. Với thay đổi có rủi ro cần đưa ra phương án an toàn và giữ khả năng rollback.
6. Không cho rằng giao diện đẹp đồng nghĩa sản phẩm chạy thật. Hoàn thành phải có **visual verification + functional verification + deployed verification**.

## 1. GATE D0 — AUDIT GIAO DIỆN VÀ CHỨC NĂNG TRƯỚC KHI ĐỤNG CODE

- `git fetch`, xác nhận HEAD, sạch working tree; đọc `package.json`, cấu trúc router, Tailwind, CSS global, component library, `Header`, `Footer`, product cards, map, traceability, AI, dashboards, workflow. Snapshot commit hiện tại và tạo nhánh làm việc an toàn nếu quy trình dự án cho phép.
- Chạy các lệnh build/test hiện có, chụp ảnh màn hình trước refactor tại ít nhất các màn hình: Home, Listing, Detail, AI, Traceability, Cart, Map, Season, Admin/Supplier. Chụp kích cỡ **360×800, 390×844, 768×1024, 1024×768, 1440×900**; bổ sung 320px, 430px và 1280px cho các lỗi responsive.
- Xác định: overflow ngang, header che nội dung, footer xấu trên mobile, ảnh stretch, crop sai, text bị cắt, alignment không đều, màu quá gắt, độ tương phản kém, popup che CTA, table tràn, filter khó dùng, menu khó bấm, element không có trạng thái loading/error/empty.
- Lập `docs/UI_AUDIT_BEFORE.md`: route, ảnh before, vấn đề, độ nghiêm trọng, file liên quan, mục tiêu sửa. **Không được coi việc tạo tài liệu là hoàn tất.**
- Lập bảng regression coverage: với từng route nêu chức năng được bảo toàn và test sẽ chạy sau khi đổi UI.

## 2. GATE D1 — XÂY HỆ THỐNG THIẾT KẾ BIÊN TẬP CAO CẤP

**Hướng art direction:** “Vietnamese Agricultural Editorial Commerce”, nông sản tươi, mộc mạc có chọn lọc, đáng tin cậy, ảnh thật là nhân vật chính; gần với một thương hiệu thực phẩm/đặc sản chỉn chu hơn là dashboard AI hay landing page crypto.

### 2.1 Màu sắc gợi ý (có quyền tinh chỉnh theo kiểm tra contrast, nhưng giữ tinh thần)
- Canvas: `#FAF9F5` (trắng ngà ấm)
- Surface: `#FFFFFF`
- Deep forest / hành động chính: `#2C4939`
- Forest hover: `#233C2F`
- Primary ink: `#253129`
- Secondary text: `#647067`
- Muted olive: `#7B876C`
- Clay accent: `#A46C49` (dùng rất tiết chế)
- Warm neutral surface: `#F1EFE8`
- Border/divider: `#E2E5DC`
- Danger/Warning/Success: bộ màu ngữ nghĩa có tương phản đạt chuẩn, không dùng màu để truyền đạt thông tin một mình.

Nguyên tắc: 80% neutral, 15% xanh thương hiệu, tối đa 5% accent; **mỗi màn hình 1 CTA primary rõ ràng**; không dùng quá nhiều màu chỉ để nhấn mạnh mọi thứ. Không biến mọi card thành nền xanh. Không tự tạo nhiều shades không có quy ước.

### 2.2 Typography
- Ưu tiên font hỗ trợ dấu tiếng Việt đầy đủ như `Be Vietnam Pro` hoặc font đang có nếu kết quả tốt; chỉ thêm font nếu không làm GitHub Pages build mất ổn định. Có fallback system, display swap.
- Phân cấp rõ: heading trang 34–48px desktop, 26–34px mobile; section heading 24–30px; body 15–16px; caption/metadata tối thiểu 12–13px khi có thể; line-height phù hợp 1.45–1.7.
- Hạn chế `font-black`, chữ HOA TOÀN BỘ, `tracking-widest`, in đậm mọi dòng; ưu tiên normal/medium/semibold, chỉ title chủ đạo mới bold. Sử dụng số tiền dễ đọc, nhãn đơn vị rõ ràng.
- Chú ý chữ dài tiếng Việt, tách dòng tự nhiên, không cắt tên sản phẩm quan trọng chỉ còn một dòng.

### 2.3 Layout / Component system
- Desktop content 1160–1240px; gutters responsive 16/20/24/32px tùy breakpoint; spacing nhất quán theo hệ 4/8px.
- Corner radius: controls 8–10px; card 12–14px; hero/photo 12–18px nếu cần; đừng bo `rounded-3xl` mọi nơi.
- Card: border nhẹ hoặc shadow rất mỏng, không đồng thời nhiều lớp shadow. Hover chỉ đổi border/shadow nhẹ, tránh card nhảy lên hay phóng ảnh mạnh.
- Icon chỉ dùng khi tăng khả năng nhận biết; stroke đồng nhất, kích cỡ ~18–20px; không lạm dụng icon trong mọi heading.
- Interaction có trạng thái hover, focus-visible, active, selected, disabled, loading, empty, error, success. Motion 120–200ms có chủ đích, tôn trọng `prefers-reduced-motion`, không chạy liên tục.
- Định nghĩa CSS variables/design tokens tại đúng lớp hiện có (`apps/web/src/styles/globals.css`, `apps/web/tailwind.config.ts`, `packages/ui`) và refactor hệ `Button`, `Card`, `Badge`, `Input`, `Modal`, `Table` dùng chung. Không làm mất props/variant cũ: hỗ trợ tương thích hoặc sửa mọi consumer có test.
- Tối thiểu hóa dependency mới; ưu tiên Tailwind và component sẵn có. Không chèn một UI framework mới chỉ để đổi giao diện.
- Đưa ví dụ logo/wordmark CropNet có cảm giác thương hiệu nông sản: wordmark rõ, một biểu tượng lá nhỏ có chủ đích, không phát sáng, không chữ gradient. Không dùng nhãn “AI” quá lố.

## 3. GATE D2 — THIẾT KẾ LẠI THEO JOURNEY THƯƠNG MẠI

**A. Header / Navigation** (`apps/web/src/shared/components/Header.tsx`)
- Loại bỏ thanh nền gradient DiGiFest chiếm nhiều chú ý; nếu cần thông báo demo thì dùng một dòng phẳng, trung tính, ngắn, không nhấp nháy.
- Logo đơn giản, navigation ưu tiên: Sản phẩm, Nhà vườn/Bản đồ, Mùa vụ, Truy xuất, Tư vấn; giỏ hàng/đăng nhập rõ ràng. Dashboard theo role chỉ hiện khi hợp lệ.
- Mobile: header cao vừa đủ; menu toggle dễ sử dụng, esc/backdrop, focus/scroll-lock đúng, điều hướng đóng sau khi chọn, không che giỏ hàng; không nhồi 7–10 nav vào một hàng.
- Header sticky chỉ nếu không chiếm diện tích quá lớn; xử lý safe-area và anchor offsets.

**B. Trang chủ** (`apps/web/src/app/page.tsx`)
- Tạo bố cục như một thương hiệu biên tập: 1 headline tiếng Việt súc tích, 1 đoạn giới thiệu ngắn, 1 CTA “Khám phá nông sản”, 1 text link “Truy xuất nguồn gốc”; 1 ảnh nông sản Đồng Nai phù hợp được cấp phép và ghi nguồn; không làm hero có 5 nút.
- Bỏ blurry glows, nền gradient, những hộp thông tin nổi chồng chéo lên ảnh, 3–4 số liệu phóng đại chưa xác minh và các thẻ biểu tượng đồng dạng.
- Gợi ý cấu trúc: (1) Hero editorial + ảnh đẹp, (2) Đặc sản theo mùa (data-driven), (3) Danh mục sản phẩm nổi bật, (4) Nhà vườn / câu chuyện nguồn gốc với dữ liệu xác minh, (5) Quy trình truy xuất 3 bước đơn giản, (6) AI giúp chọn sản phẩm như một tiện ích thiết thực, (7) Footer. Sắp xếp hierarchy khoa học, ít section nhưng chất lượng.
- Trên mobile: hero ảnh tỷ lệ phù hợp, headline không tràn, 1 CTA dễ thấy, không có layout gãy.

**C. Danh mục và Card sản phẩm** (`/products`, `ProductCard.tsx`)
- Desktop 3–4 cột tùy độ rộng và sidebar; tablet 2 cột; mobile ưu tiên 2 cột khi đủ 360–430px và nội dung vẫn đọc được; ở 320px cho phép 1 cột nếu cần. Không bóp card chỉ để đạt 2 cột.
- Ảnh sản phẩm đồng nhất aspect ratio (ví dụ 4:5 hoặc 1:1), object-fit hợp lý. Rà soát từng ảnh; không dùng ảnh minh họa khác chủng loại hoặc ảnh sai địa phương như ảnh sản phẩm thật.
- Name 2 dòng khi cần; đơn vị, giá, nhà cung cấp rõ; 1 CTA sản phẩm nhất quán. Tối đa 1–2 badge có giá trị thật; không hiển thị đánh giá giả cứng `4.9`, OCOP/VietGAP khi chưa được xác minh.
- Search/filter/sort sử dụng được trên điện thoại: filter dạng drawer, button “Lọc” rõ, số bộ lọc, clear filters, trạng thái empty/error tốt.
- Ảnh lỗi phải có placeholder thiết kế riêng, alt phù hợp; không tải ảnh Unsplash ngẫu nhiên thay sản phẩm mà không thông báo.

**D. Trang chi tiết sản phẩm và nguồn gốc** (`/products/[id]`, `/traceability`)
- Product gallery, mô tả thực tế, đơn vị và giá, nguồn gốc, thông tin lô đã xác minh, nút xem QR và CTA mua hàng rõ. Không tạo thẻ chứng nhận giả.
- QR scanner, form nhập mã, trạng thái loading/error/unknown, ảnh vườn và nhật ký lô phải dễ theo dõi; không che giấu khác biệt giữa demo và dữ liệu xác minh.
- Mobile: CTA giỏ hàng dễ thấy; nếu sticky bottom CTA thì không che thanh điều hướng và không chồng Floating AI.

**E. AI tư vấn** (`/ai-tu-van`, `FloatingAiWidget.tsx`)
- **AI vẫn hoạt động nếu backend khả dụng; chỉ đổi giao diện.** Không xóa AI business logic.
- Biến trải nghiệm từ “chatbot neon” thành “Trợ lý chọn nông sản”: giao diện đơn giản, bảng gợi ý nhập nhu cầu, lịch sử, danh sách sản phẩm gợi ý có giá/tồn kho và nút thêm giỏ rõ.
- Bỏ sparkles/ping/bounce, gradient neon, lời hứa “24/7” khi không có service thật. Chat composer cố định hợp lý, bàn phím mobile không che input; bubble thanh lịch, không chiều cao cố định 750px trên màn nhỏ; có trạng thái lỗi / demo rõ.
- Floating widget nhỏ, không che nội dung, không che cart/checkout, không hiện overlay nhiều tầng; có thể ẩn trên checkout/mobile hoặc đổi vị trí để tránh va chạm. Nếu form nhập nhanh không truyền message đi thật thì phải sửa logic hoặc loại form giả.

**F. Bản đồ + Lịch mùa vụ** (`/ban-do`, `/mua-vu`)
- Bản đồ ưu tiên không gian xem, legend và các filter gọn, cards nhà vườn ít màu, ảnh cùng tỷ lệ và điểm ghim có nhãn; responsive panel dưới map trên mobile.
- Lịch mùa vụ trình bày như calendar/timeline dùng được, dễ đọc, không phải grid card đủ màu. Hiển thị “ước tính”, “do nhà vườn cập nhật” nếu chưa có dữ liệu kiểm chứng.

**G. Cart, Checkout, Order tracking, Login/Register**
- Thiết kế commerce chuẩn: checkout có tiến trình rõ, form validation ngay cạnh field, tổng tiền dễ nhìn, button hành động nổi bật bằng màu phẳng; lỗi API rõ nhưng không xóa giỏ khi request thất bại.
- Các màn xác thực, tài khoản, đơn hàng cần cùng visual language, không phải style khác với trang chủ.
- Không biến showcase GitHub Pages thành thanh toán thực; giữ gating/backend-status đúng điều khoản và thực tế deploy.

**H. Dashboard theo vai trò** (`/admin`, `/dashboard/customer`, `/dashboard/supplier`, `/dashboard/inspector`, `/dashboard/logistics`, `/forum`)
- Ưu tiên data density tốt: typography 13–16px, số liệu đủ nổi bật, filter, tables và status chips có hệ thống; bảng trên mobile dùng horizontal scroll có chỉ dẫn hoặc card rows; không để overflow toàn trang.
- Sidebar/drawer có điều hướng keyboard và mobile; loading/empty/error rõ; biểu đồ dễ đọc, không nhiều màu tùy tiện.
- Forum gọn như cộng đồng nhà vườn thực tế, không nhồi gradient/card/chat UI.
- Chỉ can thiệp dữ liệu demo/claim khi cần sửa thông tin sai; không xóa logic backend, permission, analytics.

**I. Footer**
- Tối giản: thương hiệu, liên kết hữu ích, thông tin liên hệ đã xác minh, chính sách demo/dữ liệu; không gọi số hotline giả hoặc tên HTX chưa đối chiếu là đối tác chính thức. Địa chỉ hành chính phải xác minh trước khi công bố.

## 4. GATE D3 — RESPONSIVE VÀ ACCESSIBILITY BẮT BUỘC

Kiểm thử **320, 360, 375, 390, 430, 768, 1024, 1280, 1440px** và ít nhất Chrome desktop + Chromium mobile; nếu môi trường có sẵn thử Firefox/WebKit. Không chỉ điều chỉnh theo devtools một lần.

Chấp nhận khi:
- Không có horizontal overflow toàn trang tại mọi viewport; không có văn bản/button bị che, ảnh méo, modal vượt màn.
- Menu mobile thao tác được bằng ngón tay, input không bị bàn phím ảo che, filter dùng được, AI input và kết quả không tràn.
- Touch targets khoảng >= 44×44 CSS px cho thao tác quan trọng (khi khả thi); `focus-visible`, labels, keyboard navigation, Escape close, aria state, alt ảnh, contrast WCAG AA 4.5:1 cho chữ thường.
- Không dùng chỉ màu để báo trạng thái; nội dung loading/error/empty có thông báo tiếng Việt dễ hiểu.
- Tôn trọng reduced motion và không thêm animation loop vô nghĩa.
- Thử với tên sản phẩm dài, thiếu ảnh, giá dài, không có chứng nhận, dữ liệu rỗng, API lỗi và quyền truy cập thiếu.

## 5. GATE D4 — PERFORMANCE, HÌNH ẢNH VÀ CODE CLEANUP

- Ưu tiên ảnh địa phương được cấp phép và đúng đối tượng; tối ưu dung lượng, `width/height` hoặc aspect-ratio để tránh CLS, lazy-load dưới fold, ảnh hero ưu tiên tải phù hợp. Quản lý nguồn và attribution khi cần; không dùng link ảnh hỏng/stock sai sản phẩm.
- Ưu tiên font loading ít nặng. Không biến việc làm đẹp thành thêm thư viện animation, carousel, chart không cần thiết.
- Chỉ loại bỏ CSS/component/import/dependency **sau khi kiểm tra không được route/logic nào sử dụng**; kiểm tra toàn bộ ref và test, không đại trà `rm` theo tên.
- Tạo token và component tái sử dụng; loại duplication trong phạm vi hợp lý, không rewrite backend để làm UI.
- Tìm và xử lý class `bg-gradient`, `from-`, `via-`, `to-` theo ngữ cảnh UI; kiểm tra cả style inline, style CSS, pseudo-element và layout components. Không dùng `!important` tràn lan.
- Nếu phát hiện lỗi nghiệp vụ nằm trên UI (button vô tác dụng, dummy QR, placeholder loading vô hạn), ghi rõ là BUG và sửa có kiểm chứng hoặc báo blocker; không lấp bằng mock âm thầm.

## 6. GATE D5 — TỰ ĐỘNG KIỂM THỬ CHẤT LƯỢNG TRƯỚC/SAU

**Phải chạy các bộ kiểm tra hiện có:**
- `npm ci`
- `npx prisma generate --schema=apps/server/prisma/schema.prisma` (nếu pipeline backend cần)
- `npm test`
- `npm run build:server`
- `NEXT_PUBLIC_BASE_PATH=/cropnetkhoaduc npm run build:web` trong môi trường tương đương CI, dùng cú pháp phù hợp OS. Không bỏ qua lỗi TypeScript, không tắt CI để được deploy.

**Bổ sung nếu repo chưa có:** Playwright smoke tests cho desktop/mobile và kiểm tra link, layout, interaction; script scan static assets và dead URLs; axe accessibility checks khi khả thi; screenshot regression hoặc before/after review. Không tạo snapshot cập nhật mù để giấu lỗi.

**Acceptance journeys cần giữ:**
1. Home → Products → Search/Filter → Product detail.
2. Product detail → Cart → Checkout theo đúng chế độ demo/production.
3. QR nhập mã / scan → lô chính xác hoặc thông báo unknown, không sinh lô ngẫu nhiên.
4. AI consultation → đề xuất → kiểm tra giá/số lượng → thêm giỏ (nếu backend không có: giao diện thể hiện trạng thái không sẵn sàng, không giả vờ AI đã xử lý).
5. Map → farm detail; Seasons → liên kết sản phẩm; navigation giữa routes.
6. Login / roles / dashboard điều hướng đúng trạng thái được phép (môi trường phù hợp); modal, forms, error states.
7. Header/sidebars/filter/menu/tables/AI widget đều hoạt động trên 360 và 390px không che nội dung.

**Kiểm thử trực quan bắt buộc**: tạo screenshot *before/after* cho các route chính, chỉ ra đã bỏ hết gradient/glows/neon/badges thừa và mọi text vẫn đọc được. Nêu rõ bất kỳ trang nào chưa đạt.

## 7. GATE D6 — DEPLOY VÀ LIVE VERIFICATION

- Không push trực tiếp `gh-pages`, không force push. Làm việc trên branch/PR hoặc commit theo quy trình repo, giữ checkpoint rollback.
- Kiểm tra `.github/workflows/deploy.yml`; khi có quyền và thay đổi đã qua test, commit/push lên nhánh hợp lệ để kích hoạt GitHub Actions.
- Xác nhận CI workflow **conclusion = success**, commit SHA của bản build, cây gh-pages có các routes, HTML/CSS/JS assets mới; kiểm tra production URL: `https://lovemvaf.github.io/cropnetkhoaduc/`.
- **Không chỉ kiểm tra HTTP 200 trang chủ**. Mở trực tiếp từng deep link `/products/`, `/ai-tu-van/`, `/traceability/`, `/ban-do/`, `/mua-vu/`, `/cart/`, thử back/refresh, QR query param, mobile nav, images; xác nhận basePath `/cropnetkhoaduc` không bị lặp hoặc mất.
- GitHub Pages là static showcase, không phải máy chủ Express/Prisma; công bố trạng thái backend và AI thật; không báo đăng nhập/đặt hàng/AI live đã hoạt động nếu không có HTTPS backend tương ứng.
- Nếu không có browser/permission/API key/hosting thì báo **BLOCKED** với lý do cụ thể và kết quả đã làm; không tự ghi '100% PASS'. Nếu deploy lỗi phải lấy log thật, sửa, test và triển khai lại khi có quyền.

## 8. THỨ TỰ ƯU TIÊN VÀ KHÔNG DỜI TIẾN ĐỘ BẰNG TRANG TRÍ

- **P0:** Design tokens + Header + Home + Product list/card + Detail + AI chat mobile + QR mobile + critical workflows + build/deploy.
- **P1:** Map + Seasons + Cart/Checkout/Orders + Auth + Footer + floating widget + shared system UI.
- **P2:** Dashboards + Forum + animation rất tiết chế + polish cuối.
- Sau mỗi nhóm phải review bằng screenshot và thử thao tác; không sửa hàng trăm file đồng loạt rồi mới kiểm tra.
- Khi có thời hạn sát, ưu tiên tính năng hoạt động và trải nghiệm mua hàng hơn những cải tiến nhỏ mang tính trang trí.

## 9. ĐẦU RA CUỐI CÙNG BẮT BUỘC

Trả về báo cáo với những minh chứng có thật:
1. HEAD ban đầu và commit/PR cuối; danh sách tệp sửa/xóa/thêm; lý do.
2. Design tokens và nguyên tắc visual đã áp dụng; các điểm nhận diện thương hiệu riêng biệt của CropNet Đồng Nai.
3. Link screenshot before/after theo **ít nhất 5 route** và **desktop + mobile** (đính kèm artifact hoặc vị trí trong repo), nêu viewport.
4. Bảng responsive 320/360/390/430/768/1024/1440: overflow, navigation, modal/chat, image, CTA.
5. Kết quả lint/typecheck/test/build, các test cases quan trọng, trạng thái issue và còn blocker nào.
6. Bằng chứng CI run SUCCESS và public URL đã kiểm tra; thời gian kiểm tra, SHA được deploy, route/deep link đã mở.
7. Chức năng nào là live, demo, offline và cần backend; không được đánh đồng.
8. Những vấn đề dữ liệu ảnh, chứng nhận, địa chỉ còn chưa xác minh; không tự đánh dấu đã kiểm chứng.
9. Hướng dẫn rollback an toàn (ưu tiên `git revert` qua PR/branch theo quy trình, không force push).

## TIÊU CHÍ NHẬN BÀN GIAO

**KHÔNG ĐẠT** nếu: còn gradient trang trí; giao diện neon/glow/sparkles/badges tràn lan; mobile tràn ngang; menu hoặc cart/chat/QR lỗi; nội dung bị che; ảnh sai loại sản phẩm; nhãn tin cậy bịa đặt; chỉ sửa trang chủ; build/CI failed; hoặc tuyên bố deploy thành công mà không kiểm tra public URL.

**ĐẠT** khi: CropNet trông như website thương mại nông sản được designer làm riêng, thân thiện và đáng tin; responsive xuất sắc, typography/ảnh/layout nhất quán; quan trọng hơn là các luồng nghiệp vụ chạy đúng trạng thái thực và bản showcase mới đã được nghiệm thu trực tiếp trên GitHub Pages.

**BẮT ĐẦU NGAY:** Audit HEAD + screenshots -> Design tokens -> refactor từng page/component -> visual + functional tests -> deploy -> verify -> report. Không hỏi lại những thông tin đã có trong repo; chỉ xin người dùng những quyền hoặc tài nguyên thực sự thiếu. Không thay công việc bằng một bản kế hoạch khác.
