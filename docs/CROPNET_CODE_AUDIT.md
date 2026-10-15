# CROPNET ĐỒNG NAI AI - TOÀN VĂN BÁO CÁO KIỂM TOÁN MÃ NGUỒN & HỆ THỐNG
**Phiên bản**: Production Release 2026  
**Dự án**: Sàn Nông Sản Số Bản Địa & Trợ Lý AI Chuyên Sâu Tỉnh Đồng Nai (CropNet Đồng Nai)  
**Tác giả**: Đội ngũ Kỹ nghệ Hệ thống CropNet  
**Tiêu chuẩn chất lượng**: Nghiêm ngặt theo Master Prompt 2026 (Zero Fake Data, Dong Nai Geo-Lock, Real Auth, RAG DeepSeek + Citations, Verified Wikimedia Assets)

---

## 1. TỔNG QUAN KIẾẾN TRÚC & CƠ CẤU MONOREPO

Hệ thống CropNet được tổ chức theo mô hình Monorepo:
```
cropnetkhoaduc/
├── apps/
│   ├── web/                    # Ứng dụng Next.js 15 (App Router, SSR, Server Handlers, UI)
│   │   ├── public/
│   │   │   └── assets/nongsan/ # Kho tài nguyên hình ảnh nông sản bản địa Đồng Nai đã thẩm định
│   │   └── src/
│   │       ├── app/            # Next.js Pages & Route Handlers (/api/auth, /api/products, /api/ai/chat...)
│   │       ├── data/           # Danh mục nông sản (catalog.ts), HTX, lô hàng QR chuẩn hóa
│   │       ├── features/       # Bản đồ số (MapLibre), AI consultant, sản phẩm, forum
│   │       ├── server/         # In-memory fail-closed database (db.ts), JWT Auth (auth.ts), RAG Engine (rag.ts)
│   │       └── shared/         # Dịch vụ API, Zustand store, Layout Header/Footer
│   └── server/                 # Express API server nội bộ (dành cho môi trường node truyền thống)
├── data/
│   ├── knowledge/              # Bộ dữ liệu RAG chuẩn hóa 9 tệp CSV/JSON
│   └── research/               # Sổ bộ nguồn khảo sát Đồng Nai, danh mục loại trừ ngoại tỉnh, Image Manifest
├── docs/                       # Tài liệu kiểm toán, báo cáo bản quyền, nghiệm thu sản xuất
├── packages/                   # Thư viện dùng chung (@cropnet/types, @cropnet/ui, @cropnet/utils)
└── vercel.json                 # Cấu hình triển khai Vercel hướng thẳng vào Next.js apps/web
```

---

## 2. NGUYÊN NHÂN GỐC RỄ CÁC LỖI TỒN ĐỌI Ở PHIÊN BẢN CŨ

### 2.1. Lỗi 404 API & Sự Xuất Hiện Của Cơ Chế "Mock Bypass"
* **Nguyên nhân**: Khi triển khai lên Vercel, nền tảng Vercel chỉ chạy bản build của `apps/web` (`buildCommand: npm run build:web`, `outputDirectory: apps/web/.next`). Toàn bộ server Express tại `apps/server` (cổng 5000) hoàn toàn không chạy trên môi trường Vercel.
* **Hậu quả**: Khi frontend gửi request tới `/api/auth/login`, `/api/products`, `/api/traceability/batches`, máy chủ Vercel trả về lỗi `404 Not Found`. Lập trình viên trước đây đã viết các khối `catch (error)` ở frontend để "chữa cháy" bằng cách tiêm mock token giả (`mock-token-*`), mock code giả (`MOCK-VERIFY-123`, `MOCK-RESET-123`), và tài khoản mặc định `admin@cropnet.vn / 123456`.
* **Khắc phục triệt để**:
  - Chuyển toàn bộ các endpoint nghiệp vụ sang **Next.js App Router Route Handlers** nằm ngay trong `apps/web/src/app/api/`:
    - `api/auth/login`, `api/auth/register`, `api/auth/verify-email`, `api/auth/send-verification`, `api/auth/refresh-token`, `api/auth/me`, `api/auth/logout`, `api/auth/forgot-password`, `api/auth/reset-password`
    - `api/products`, `api/products/[id]`
    - `api/categories`
    - `api/traceability/batches`, `api/traceability/batches/[batchCode]`
    - `api/forum`, `api/forum/[postId]/like`, `api/forum/[postId]/comments`
    - `api/orders`
    - `api/ai/chat` (Tích hợp RAG Pipeline & DeepSeek HTTPS API)
  - Xóa 100% mock bypass ở mọi component và page phía client.

### 2.2. Lỗi Sai Lệch Địa Lý & Dữ Liệu Nông Sản Ngoại Tỉnh
* **Nguyên nhân**: Dữ liệu trước đây đưa vào các sản phẩm không thuộc Đồng Nai: Bưởi da xanh Cái Mơn (Bến Tre), Cà chua bi Đà Lạt (Lâm Đồng), Sầu riêng Vĩnh Long (Vĩnh Long), Măng tây xanh, Nấm đùi gà... và tự ý gán nhãn "Đồng Nai". Thậm chí phần bản đồ còn đưa ra một giả định sai sự thật về "Nghị quyết 30/2026/QH16 sáp nhập Bình Phước vào Thành phố Đồng Nai" để đưa các địa danh Bù Đăng, Đồng Xoài, Chơn Thành, Phú Riềng vào hệ thống.
* **Khắc phục triệt để**:
  - Cách ly toàn bộ 6 tệp ảnh sai vào thư mục `quarantine_assets/`.
  - Thiết lập hồ sơ loại trừ nghiêm ngặt tại `data/research/NON_DONGNAI_EXCLUSIONS.csv`.
  - Quy tụ dữ liệu chỉ về 11 đơn vị hành chính chuẩn xác của Tỉnh Đồng Nai: TP Biên Hòa, TP Long Khánh, Huyện Vĩnh Cửu, Huyện Cẩm Mỹ, Huyện Xuân Lộc, Huyện Định Quán, Huyện Tân Phú, Huyện Thống Nhất, Huyện Trảng Bom, Huyện Long Thành, Huyện Nhơn Trạch.
  - Cập nhật tên Hợp tác xã thật có mã số thuế/chứng nhận OCOP: HTX Tân Triều, HTX Xuân Lập, HTX Bình Lộc, Cơ sở Điều Định Quán, HTX Xuân Lộc.

### 2.3. Lỗi Hình Ảnh Kém Chất Lượng & Chưa Được Thẩm Quyền Bản Quyền
* **Nguyên nhân**: Trang web dùng hotlink trực tiếp từ Unsplash với ảnh minh họa ngẫu nhiên (ảnh cam chanh nước ngoài, ảnh súp lơ, ảnh tài liệu chung chung).
* **Khắc phục triệt để**:
  - Tải về và tối ưu hóa 6 tệp ảnh nông sản chất lượng cao từ Wikimedia Commons theo giấy phép CC BY-SA 4.0 / CC BY-SA 3.0 / CC BY 2.0 / Public Domain.
  - Quy chuẩn kích thước hiển thị WebP/JPEG 800px dung lượng tối ưu 100KB - 230KB, lưu cục bộ trong `apps/web/public/assets/nongsan/`.
  - Tạo biểu trưng huy hiệu vector `placeholder-nongsan.svg` sạch đẹp làm fallback cho tất cả các thẻ hình ảnh gặp sự cố kết nối.
  - Lập bảng kê khai minh bạch `docs/MEDIA_LICENSES.md` và `data/research/DONG_NAI_IMAGE_MANIFEST.csv`.

---

## 3. DANH SÁCH CHI TIẾT TẤT CẢ TỆP MÃ NGUỒN ĐÃ CHỈNH SỬA & TẠO MỚI

| STT | Đường dẫn tệp | Loại thao tác | Nội dung cải tiến & khắc phục |
|---|---|---|---|
| 1 | `apps/web/src/data/catalog.ts` | Tạo mới | Danh mục nông sản Đồng Nai chuẩn OCOP/VietGAP, HTX thật, QR batch thật |
| 2 | `apps/web/src/server/db.ts` | Tạo mới | In-memory fail-closed database, bcrypt salt 10, quản lý User, Post, Order |
| 3 | `apps/web/src/server/auth.ts` | Tạo mới | JWT accessToken (15m), refreshToken (7d), Cookie HttpOnly, mã hóa token |
| 4 | `apps/web/src/server/rag.ts` | Tạo mới | Pipeline RAG, tokenizer tiếng Việt, bộ lọc biên giới địa lý, gọi DeepSeek API |
| 5 | `apps/web/src/app/api/auth/register/route.ts` | Tạo mới | Đăng ký tài khoản, mã hóa bcrypt, sinh mã verify email crypto |
| 6 | `apps/web/src/app/api/auth/login/route.ts` | Tạo mới | Đăng nhập kiểm tra bcrypt, chặn chưa verify, phát JWT cookies |
| 7 | `apps/web/src/app/api/auth/verify-email/route.ts` | Tạo mới | Xác minh email bằng token thật trong database, cập nhật isVerified |
| 8 | `apps/web/src/app/api/auth/send-verification/route.ts` | Tạo mới | Gửi lại mã xác minh, phòng chống user enumeration |
| 9 | `apps/web/src/app/api/auth/refresh-token/route.ts` | Tạo mới | Cấp mới accessToken khi refreshToken hợp lệ |
| 10 | `apps/web/src/app/api/auth/me/route.ts` | Tạo mới | Trả về thông tin phiên người dùng đã xác thực |
| 11 | `apps/web/src/app/api/auth/logout/route.ts` | Tạo mới | Đăng xuất, hủy refresh token và xóa cookie |
| 12 | `apps/web/src/app/api/auth/forgot-password/route.ts` | Tạo mới | Sinh mã đặt lại mật khẩu ngẫu nhiên có thời hạn 1 giờ |
| 13 | `apps/web/src/app/api/auth/reset-password/route.ts` | Tạo mới | Đặt lại mật khẩu với bcrypt mới, xóa token reset |
| 14 | `apps/web/src/app/api/categories/route.ts` | Tạo mới | API danh mục đặc sản Đồng Nai |
| 15 | `apps/web/src/app/api/products/route.ts` | Tạo mới | API tìm kiếm, lọc theo danh mục, sắp xếp nông sản |
| 16 | `apps/web/src/app/api/products/[id]/route.ts` | Tạo mới | Chi tiết nông sản kèm lô truy xuất liên kết |
| 17 | `apps/web/src/app/api/traceability/batches/route.ts` | Tạo mới | Danh sách lô hàng QR số hóa Đồng Nai |
| 18 | `apps/web/src/app/api/traceability/batches/[batchCode]/route.ts` | Tạo mới | Chi tiết lô hàng QR, trả về 404 với mã giả mạo |
| 19 | `apps/web/src/app/api/forum/route.ts` | Tạo mới | Đọc và đăng bài viết diễn đàn nhà nông |
| 20 | `apps/web/src/app/api/forum/[postId]/like/route.ts` | Tạo mới | Thích / bỏ thích bài viết |
| 21 | `apps/web/src/app/api/forum/[postId]/comments/route.ts` | Tạo mới | Bình luận trao đổi kỹ thuật mùa vụ |
| 22 | `apps/web/src/app/api/orders/route.ts` | Tạo mới | Tạo đơn hàng, tính toán lại giá tại server chống gian lận |
| 23 | `apps/web/src/app/api/ai/chat/route.ts` | Tạo mới | Trợ lý RAG + DeepSeek với gợi ý combo ngân sách chính xác |
| 24 | `apps/web/src/app/login/page.tsx` | Sửa đổi | Xóa bỏ nút điền mock credentials, xóa mock token bypass |
| 25 | `apps/web/src/app/register/page.tsx` | Sửa đổi | Xóa cảnh báo mock, giới hạn vai trò CUSTOMER/FARMER |
| 26 | `apps/web/src/app/verify-email/page.tsx` | Sửa đổi | Xóa MOCK-VERIFY-123, kết nối API token thật |
| 27 | `apps/web/src/app/forgot-password/page.tsx` | Sửa đổi | Xóa MOCK-RESET-123, xử lý luồng thật |
| 28 | `apps/web/src/app/reset-password/page.tsx` | Sửa đổi | Xác thực mật khẩu mới tối thiểu 6 ký tự |
| 29 | `apps/web/src/app/page.tsx` | Sửa đổi | Thay toàn bộ ảnh hero và sản phẩm nổi bật sang tài sản Đồng Nai |
| 30 | `apps/web/src/app/ban-do/page.tsx` | Sửa đổi | Cập nhật tiêu đề và mô tả ranh giới Tỉnh Đồng Nai chuẩn xác |
| 31 | `apps/web/src/features/map/mapData.ts` | Sửa đổi | Thay các điểm Bình Phước bằng tiểu vùng Đồng Nai thật |
| 32 | `apps/web/src/features/map/dongNaiGeoJson.ts` | Sửa đổi | Đa giác WGS84 chuẩn 8 tiểu vùng chuyên canh Đồng Nai |
| 33 | `apps/web/src/features/map/InteractiveDongNaiMap.tsx` | Sửa đổi | Cập nhật bộ chọn tiểu vùng Nam/Bắc Đồng Nai, xóa văn bản sai lệch |
| 34 | `apps/web/src/app/mua-vu/page.tsx` | Sửa đổi | Lịch mùa vụ nông sản Đồng Nai, HTX thật, ảnh cục bộ |
| 35 | `apps/web/src/app/ai-tu-van/page.tsx` | Sửa đổi | Đồng bộ ID sản phẩm ('1' - '6') trong bộ tính combo ngân sách |
| 36 | `apps/web/src/shared/components/Footer.tsx` | Sửa đổi | Tên HTX thật, địa chỉ Đồng Nai chuẩn xác |
| 37 | `apps/web/src/features/products/components/ProductCard.tsx` | Sửa đổi | Fallback SVG badge, onError bảo vệ giao diện |
| 38 | `apps/web/src/app/traceability/[batchCode]/TraceabilityDetailClient.tsx` | Sửa đổi | Thay Unsplash bằng fallback SVG nội bộ |
| 39 | `apps/web/src/app/orders/[id]/OrderTrackingClient.tsx` | Sửa đổi | Cập nhật fallback ảnh đơn hàng |
| 40 | `apps/web/src/app/dashboard/customer/page.tsx` | Sửa đổi | Cập nhật fallback ảnh đơn mua của khách hàng |
| 41 | `apps/web/src/app/dashboard/supplier/page.tsx` | Sửa đổi | Cập nhật địa chỉ HTX, thư viện ảnh nông sản bản địa |
| 42 | `apps/web/src/app/admin/page.tsx` | Sửa đổi | Fallback bảng sản phẩm và chứng nhận chất lượng |
| 43 | `apps/web/src/app/traceability/page.tsx` | Sửa đổi | Cập nhật danh sách lô hàng QR mẫu theo HTX thật |
| 44 | `apps/web/package.json` | Sửa đổi | Bổ sung dependencies `bcryptjs` và `jsonwebtoken` |

---

## 4. KẾT LUẬN KIỂM TOÁN
Toàn bộ mã nguồn đã được tái cấu trúc triệt để theo kiến trúc Server-First của Next.js 15, loại bỏ 100% các dòng mã mock tạm bợ, đảm bảo tính pháp lý về nguồn gốc nông sản tỉnh Đồng Nai và bản quyền hình ảnh.
