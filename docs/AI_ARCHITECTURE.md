# KIẾN TRÚC HỆ THỐNG TRỢ LÝ AI BÁN HÀNG & TƯ VẤN NÔNG SẢN THÔNG MINH (CROPNET ĐỒNG NAI AI)

Tài liệu này thuyết minh toàn bộ kiến trúc kỹ thuật của hệ sinh thái AI trên nền tảng **CropNet Đồng Nai AI**, phục vụ cuộc thi **AI Digital Business Challenge 2026 (DiGiFest)**.

---

## 1. MỤC TIÊU & TẦM NHÌN THIẾT KẾ (DESIGN PHILOSOPHY)

Trợ lý ảo CropNet Đồng Nai AI được xây dựng theo tiêu chuẩn thương mại điện tử nông sản thế hệ mới với 3 nguyên tắc cốt lõi:
1. **Dữ liệu thật & Minh bạch tuyệt đối (Factual Grounding & Zero Hallucination):**
   - Không được sáng tác thông tin sai lệch về nông sản, không tự vẽ thêm chứng chỉ OCOP hay giả định quy trình an toàn sinh học.
   - Khi tư vấn nông sản, toàn bộ giá tiền, đơn vị đo, quy cách đóng gói và địa chỉ hợp tác xã đều truy vấn trực tiếp từ cơ sở dữ liệu (`getFactProducts`, `getFactBatches`, `getFactCooperatives`).
2. **Tuân thủ ngân sách nghiêm ngặt (Strict Budget Boundedness):**
   - Khi người dùng đưa ra ngân sách (ví dụ: 300.000đ, 500.000đ), thuật toán tính toán giỏ hàng (`optimizeBudgetCombo`) đảm bảo **tổng số tiền chi trả luôn nhỏ hơn hoặc bằng ngân sách**, không làm phát sinh chi phí vượt dự toán của khách hàng.
3. **An toàn y tế & Pháp lý người tiêu dùng (Medical & Safety Guardrails):**
   - Tự động nhận diện và chặn đứng các câu hỏi liên quan đến tuyên bố chữa bệnh vô căn cứ (ví dụ: bưởi chữa ung thư, chôm chôm trị dứt điểm tiểu đường). Hệ thống phản hồi bằng thông điệp trung thực về giá trị dinh dưỡng tự nhiên và khuyến nghị theo chỉ định y khoa.

---

## 2. SƠ ĐỒ KIẾN TRÚC TỔNG THỂ (SYSTEM ARCHITECTURE)

```
[Người Dùng / Khách Hàng / Doanh Nghiệp]
       │
       ▼ (HTTP REST API / WebSocket)
[API Controller: /api/ai/chat, /api/ai/recommend-budget, /api/ai/draft-rfq]
       │
       ▼
[Bộ Phân Loại Ý Định & Kiểm Tra An Toàn (Intent Classifier & Guardrails)]
   ├── Phân tích an toàn y tế (Medical & Curative Claims Filter)
   ├── Phân loại thực thể (Budget, Traceability, Seasonality, RFQ)
   │
   ▼
[Công Cụ Dữ Liệu Nông Nghiệp Thực (Deterministic Farm Data Tools)]
   ├── getFactProducts() ─────── CSDL Sản phẩm OCOP Đồng Nai
   ├── getFactBatches() ──────── CSDL Lô thu hoạch & Tem QR
   ├── getFactCooperatives() ── CSDL HTX Tân Triều & Long Khánh
   ├── getSeasonalCalendar() ── Lịch mùa vụ nông sản vùng Đông Nam Bộ
   └── optimizeBudgetCombo() ─── Thuật toán tối ưu giỏ hàng
       │
       ▼
[Dual-Engine AI Execution Flow]
   ├── Nếu có GEMINI_API_KEY: Gọi mô hình Gemini Flash qua Function Calling
   └── Nếu không có API Key / Offline: Chạy Hybrid Deterministic Expert Engine
       │
       ▼
[Định Dạng Phản Hồi Trực Quan (Rich Response Formatter)]
   ├── Tin nhắn tư vấn thân thiện bằng tiếng Việt
   ├── Thẻ sản phẩm tương tác (Thêm nhanh vào giỏ hàng)
   ├── Liên kết trực tiếp tem truy xuất QR / Bản đồ số
   └── Gợi ý câu hỏi tiếp theo (Follow-up Prompts)
```

---

## 3. DANH MỤC CÔNG CỤ TÍCH HỢP (REGISTERED TOOLS & SCHEMAS)

### Tool 1: `optimizeBudgetCombo`
- **Mô tả:** Tối ưu hóa giỏ hàng đặc sản theo ngân sách người dùng chỉ định.
- **Tham số đầu vào:**
  - `budget` (number, bắt buộc): Số tiền tối đa khách muốn chi (VND).
  - `recipient` (string, tùy chọn): Đối tượng nhận (gia đình, đối tác doanh nghiệp, người cao tuổi).
  - `purpose` (string, tùy chọn): Mục đích (quà biếu tết, ăn tươi, liên hoan).
- **Hành vi:** Thuật toán duyệt qua cây sản phẩm có sẵn tại HTX Tân Triều và HTX Long Khánh, chọn phối combo đa dạng nhất với điều kiện `totalCost <= budget`.

### Tool 2: `getFactBatches` & `verifyBatchCode`
- **Mô tả:** Kiểm tra tính hợp lệ và truy xuất toàn bộ nhật ký canh tác của mã lô hàng.
- **Tham số đầu vào:**
  - `batchCode` (string, bắt buộc): Mã tem QR (ví dụ: `BATCH-BUOI-TANTRIEU-2026-01`).
- **Hành vi (Fail-closed):** Nếu mã lô không khớp với dữ liệu đăng ký của HTX nông nghiệp Đồng Nai, trả về cảnh báo an toàn tem không rõ nguồn gốc.

### Tool 3: `getSeasonalCalendarData`
- **Mô tả:** Tra cứu lịch thời vụ thu hoạch, độ ngọt Brix và phương thức canh tác của từng vùng trái cây.
- **Hành vi:** Trả về thông tin chính vụ của bưởi đường lá cam, sầu riêng Ri6 Long Khánh, chôm chôm nhãn và hạt điều Xuân Lộc.

### Tool 4: `handleDraftRfq` (Wholesale Request For Quotation)
- **Mô tả:** Hỗ trợ khách hàng doanh nghiệp hoặc chuỗi siêu thị lập bản thảo chào giá sỉ cho các đơn hàng số lượng lớn (từ 50kg/hộp trở lên).
- **Hành vi:** Tự động sinh mã `RFQ-DN-xxxxxx` và điều phối đến ban giám đốc hợp tác xã phụ trách.

---

## 4. CHIẾN LƯỢC DỰ PHÒNG HOÀN TOÀN TỰ ĐỘNG (FALLBACK RESILIENCE)

- Trong môi trường thi đấu hoặc khi triển khai không có API key thương mại (`GEMINI_API_KEY` để trống), ứng dụng **không bị crash hay báo lỗi kết nối**.
- Hệ thống Hybrid Deterministic Expert System tự động kích hoạt, phân tích cú pháp tự nhiên của người dùng, ánh xạ vào các Tool và đưa ra lời giải hoàn toàn chính xác, đầy đủ giao diện trực quan và khả năng tương tác giỏ hàng.
