# KỊCH BẢN THUYẾT TRÌNH VÀ DEMO SẢN PHẨM (LIVE DEMO SCRIPT - 3 ĐẾN 5 PHÚT)

**Dự án:** CropNet Đồng Nai AI  
**Cuộc thi:** AI Digital Business Challenge 2026 (DiGiFest Đồng Nai)  
**Thời lượng chuẩn:** 3 - 5 phút trước Hội Đồng Ban Giám Khảo

---

## PHẦN 1: MỞ ĐẦU & ĐẶT VẤN ĐỀ (0:00 - 0:45)

> *"Kính thưa Ban Giám Khảo cuộc thi AI Digital Business Challenge 2026!*  
> *Đồng Nai là thủ phủ nông nghiệp công nghệ cao của miền Đông với các đặc sản trứ danh: Bưởi Tân Triều, Sầu riêng Long Khánh, Hạt điều Xuân Lộc. Thế nhưng, bà con nông dân và các hợp tác xã vẫn đang chịu cảnh 'được mùa mất giá', bị thương lái ép giá, và đặc biệt là nhức nhối nạn hàng giả, bưởi nơi khác mạo danh bưởi Tân Triều.*  
> *Nhóm chúng em mang đến giải pháp **CropNet Đồng Nai AI** — Nền tảng thương mại số kết nối trực tiếp Hợp Tác Xã với người tiêu dùng, ứng dụng Trí tuệ nhân tạo bán hàng thông minh và tem QR truy xuất nguồn gốc bất biến."*

**Hành động trên màn hình:**
- Mở trang chủ `http://localhost:3000/`.
- Chỉ vào dòng chữ thương hiệu: **CropNet Đồng Nai AI** và biểu tượng bảo chứng của **HTX Nông Nghiệp Tân Triều** và **HTX Long Khánh**.

---

## PHẦN 2: DANH MỤC SẢN PHẨM THẬT & TRUY XUẤT QR MINH BẠCH (0:45 - 1:45)

> *"Điểm khác biệt căn bản đầu tiên của CropNet là **Cam kết 100% dữ liệu thật (Fail-closed)**. Toàn bộ 6 dòng sản phẩm chủ lực trên hệ thống đều thuộc quyền sở hữu của 2 HTX đã ký kết tại Vĩnh Cửu và Long Khánh.*  
> *Khi khách hàng quét tem QR dán trên quả bưởi Tân Triều mã `BATCH-BUOI-TANTRIEU-2026-01`, hệ thống mở ngay Chứng Thư Điện Tử, hiển thị nhật ký bón phân hữu cơ vi sinh, đo độ ngọt Brix 11.8 và kết quả xét nghiệm an toàn từ Trung tâm Kiểm nghiệm Nông sản Đồng Nai.*  
> *Đặc biệt: Nếu quét một mã tem giả mạo hoặc chưa kích hoạt, hệ thống lập tức báo lỗi và cảnh báo người tiêu dùng — tuyệt đối không giả lập thông tin."*

**Hành động trên màn hình:**
- Bấm vào mục **Truy Xuất QR** (`/traceability`).
- Bấm vào mã mẫu `BATCH-BUOI-TANTRIEU-2026-01` để xem Chứng thư số VietGAP & OCOP 4 sao.
- Thử nhập mã giả `BATCH-FAKE-999` để Ban Giám Khảo thấy thông báo cảnh báo fail-closed.

---

## PHẦN 3: TRỢ LÝ AI BÁN HÀNG & TỐI ƯU HÓA NGÂN SÁCH (1:45 - 3:15)

> *"Tiếp theo là linh hồn của nền tảng: **Trợ Lý AI Bán Hàng & Nông Sản Thông Minh 24/7**.*  
> *Bài toán khó nhất trong thương mại điện tử là: Người dùng có ngân sách cố định và không biết nên mua gì. Em xin gõ thử: 'Tôi có 500k muốn mua giỏ quà biếu đối tác tại Đồng Nai'.*  
> *AI sẽ lập tức gọi công cụ `optimizeBudgetCombo` duyệt qua cơ sở dữ liệu thật và sinh ra Combo Quà Biếu Tinh Hoa gồm: 1 bình Rượu bưởi Tân Triều, 2 quả Bưởi OCOP 4 sao và 1 hộp Hạt điều rang củi. Tổng tiền chính xác là 485.000đ — hoàn toàn không vượt quá 500k của khách! Khách có thể bấm nút Thêm Tất Cả Vào Giỏ Hàng ngay trong ô chat.*  
> *Không những thế, CropNet AI có bộ lọc an toàn y tế nghiêm ngặt: Khi em hỏi 'Bưởi Tân Triều có chữa được bệnh ung thư không?', AI ngay lập tức giải thích giá trị dinh dưỡng tự nhiên và từ chối mọi tuyên bố chữa bệnh sai lệch.*  
> *Và đối với các đơn vị muốn mua sỉ, AI hỗ trợ tạo bản thảo **RFQ** báo giá số lượng lớn điều phối trực tiếp về HTX trong 4 giờ."*

**Hành động trên màn hình:**
- Bấm vào mục **AI Tư Vấn 24/7** (`/ai-tu-van`).
- Gõ: *"Tôi có 500k muốn mua giỏ quà biếu đối tác tại Đồng Nai"* -> Hiển thị combo 485.000đ kèm nút thêm vào giỏ.
- Gõ: *"Bưởi Tân Triều có chữa được bệnh ung thư không?"* -> AI hiển thị lời khuyên an toàn dinh dưỡng.
- Mở cửa sổ **Lập Báo Giá Sỉ (RFQ)** -> Điền tên công ty và sinh mã số `RFQ-DN-xxxxxx`.

---

## PHẦN 4: BẢN ĐỒ VÙNG TRỒNG GIS & LỊCH MÙA VỤ 12 THÁNG (3:15 - 4:15)

> *"Để minh bạch hóa không gian sản xuất, chúng em tích hợp **Bản Đồ Nông Nghiệp Số** chuẩn GIS OpenStreetMap, định vị chính xác cù lao Tân Triều và vùng đất đỏ bazan Long Khánh, có tích hợp chỉ đường Google Maps vệ tinh cho du khách và đại lý.*  
> *Bên cạnh đó, trang **Lịch Mùa Vụ 12 Tháng** giúp khách hàng và doanh nghiệp biết chính xác tháng nào trái cây chín cây ngon nhất và mở cổng đặt trước cho vụ Tết 2026."*

**Hành động trên màn hình:**
- Mở trang **Bản Đồ Vườn** (`/ban-do`) -> Chuyển đổi giữa 2 HTX, hiển thị tọa độ GIS và diện tích canh tác.
- Mở trang **Lịch Mùa Vụ** (`/mua-vu`) -> Bấm chọn Tháng 10 / Tháng 11 để xem danh sách trái cây đang thu hoạch rộ.

---

## PHẦN 5: KẾT LUẬN & ĐÓNG GÓP CHO KINH TẾ SỐ ĐỒNG NAI (4:15 - 4:45)

> *"Kính thưa Ban Giám Khảo, **CropNet Đồng Nai AI** không chỉ là một ứng dụng phần mềm đơn thuần, mà là giải pháp chuyển đổi số toàn diện cho kinh tế tập thể nông nghiệp địa phương. Nền tảng giúp nông dân nâng cao giá trị nông sản từ 20-30%, người tiêu dùng an tâm dùng sản phẩm sạch có bảo chứng, và góp phần xây dựng thương hiệu Thành phố Đồng Nai hiện đại, văn minh và số hóa.*  
> *Nhóm chúng em xin trân trọng cảm ơn Ban Giám Khảo và sẵn sàng lắng nghe các câu hỏi chất vấn!"*
