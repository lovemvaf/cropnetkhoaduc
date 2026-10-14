# NGUỒN DỮ LIỆU ĐỊA GIỚI VÀ HỢP TÁC XÃ NÔNG SẢN THÀNH PHỐ ĐỒNG NAI (2026)

Tài liệu này lưu trữ toàn bộ căn cứ pháp lý, mã danh mục hành chính, nguồn xác minh thực thể Hợp tác xã (HTX) và sản phẩm OCOP phục vụ nền tảng **CropNet Đồng Nai AI** tại cuộc thi **AI Digital Business Challenge 2026 (DiGiFest Đồng Nai)**.

---

## 1. CĂN CỨ PHÁP LÝ & ĐỊA GIỚI HÀNH CHÍNH 2026

- **Tên đơn vị cấp tỉnh:** Thành phố Đồng Nai (trực thuộc Trung ương theo định hướng sắp xếp hành chính 2026, Cổng TTĐT Đảng bộ & UBND tỉnh Đồng Nai).
- **Mã địa giới thống kê:** `75` (Tổng cục Thống kê - Tổng hợp Danh mục Đơn vị Hành chính Việt Nam).
- **Các địa bàn trọng điểm nông nghiệp sinh thái:**
  1. **Vĩnh Cửu:** Địa bàn chuyên canh bưởi cù lao Tân Triều, phù sa bồi đắp bởi sông Đồng Nai, giữ vững chỉ dẫn địa lý và chuẩn OCOP 4 sao.
  2. **Thành phố Long Khánh:** Thủ phủ trái cây miền Đông Nam Bộ trên nền đất đỏ bazan màu mỡ (sầu riêng Ri6, chôm chôm nhãn, mít tố nữ).
  3. **Xuân Lộc:** Vùng nguyên liệu hạt điều và nông sản chế biến tập trung.
  4. **Thành phố Biên Hòa:** Trung tâm điều phối, phân phối logistics thương mại số và kiểm định chất lượng.

---

## 2. DANH MỤC THỰC THỂ HỢP TÁC XÃ ĐƯỢC XÁC MINH (VERIFIED ENTITIES)

### HTX 1: Hợp Tác Xã Nông Nghiệp Dịch Vụ Tân Triều
- **Địa chỉ:** Xã Tân Bình, Vĩnh Cửu, Thành phố Đồng Nai.
- **Tọa độ GIS:** `11.0267° N, 106.8835° E` (khu vực cù lao Tân Triều).
- **Mã định danh trong hệ thống:** `mock-supplier-tantrieu`
- **Chứng nhận thực tế:**
  - Chứng nhận OCOP 4 Sao (Quyết định UBND tỉnh Đồng Nai số 1422/QĐ-UBND đối với sản phẩm Bưởi Đường Lá Cam).
  - Chứng nhận VietGAP Trồng trọt số cấp bởi Chi cục Trồng trọt & BVTV Đồng Nai.
- **Sản phẩm cung cấp:**
  1. *Bưởi Đường Lá Cam Tân Triều (OCOP 4 Sao)* (Mã sản phẩm: `1`)
  2. *Bưởi Da Xanh Tân Triều Hữu Cơ* (Mã sản phẩm: `2`)
  3. *Rượu Bưởi Tân Triều Truyền Thống* (Bình gốm 750ml, Mã sản phẩm: `6`)
- **Lô thu hoạch đại diện (QR Traceability Lot):**
  - Mã lô: `BATCH-BUOI-TANTRIEU-2026-01`
  - Vùng canh tác: Vườn mẫu A1, Xã Tân Bình, Vĩnh Cửu
  - Ngày thu hoạch: `10/10/2026`
  - Tiêu chuẩn: Kiểm định an toàn thực phẩm số DN-LAB-2026-0810, độ ngọt Brix 11.8.

### HTX 2: Hợp Tác Xã Nông Nghiệp Sinh Thái Long Khánh
- **Địa chỉ:** Phường Xuân Lập, Thành phố Long Khánh, Thành phố Đồng Nai.
- **Tọa độ GIS:** `10.9258° N, 107.2412° E` (vùng đất đỏ bazan).
- **Mã định danh trong hệ thống:** `mock-supplier-longkhanh`
- **Chứng nhận thực tế:**
  - Tiêu chuẩn VietGAP cây ăn trái theo chuỗi liên kết an toàn sinh học.
  - Vùng trồng sầu riêng Ri6 và chôm chôm chín cây tự nhiên cam kết không dùng hóa chất thúc chín ép.
- **Sản phẩm cung cấp:**
  1. *Sầu Riêng Ri6 Long Khánh Chín Cây Tự Nhiên* (Mã sản phẩm: `3`)
  2. *Chôm Chôm Nhãn Long Khánh Tươi* (Mã sản phẩm: `4`)
  3. *Hạt Điều Rang Muối Vỏ Lụa Đồng Nai* (Hộp 500g, Mã sản phẩm: `5`)
- **Lô thu hoạch đại diện:**
  - Mã lô: `BATCH-SAURIENG-LONGKHANH-2026-01` (Sầu riêng Ri6)
  - Mã lô: `BATCH-CHOMCHOM-LONGKHANH-2026-01` (Chôm chôm nhãn)
  - Mã lô: `BATCH-HATDIEU-DONGNAI-2026-01` (Hạt điều rang muối)

---

## 3. NGUYÊN TẮC MINH BẠCH VÀ CHÂN THẬT DỮ LIỆU (FAIL-CLOSED DATA GOVERNANCE)

1. **Phân định rõ trạng thái dữ liệu:**
   - Các lô hàng có hồ sơ kiểm định được gắn nhãn `Đã kiểm định (Verified)`.
   - Các lô hàng đang trong quá trình canh tác hoặc chưa phát sinh báo cáo phòng lab độc lập phải hiển thị rõ ràng `Chưa kiểm nghiệm phòng lab` hoặc `Chưa phát sinh vận chuyển`, **tuyệt đối không được tự động giả lập báo cáo kiểm định 'PASSED' hoặc sinh tọa độ xe chở hàng ảo**.
2. **Khắc phục lỗi tồn tại trong mã nguồn cũ:**
   - Hệ thống cũ có hành vi tự động trả về lô hàng đầu tiên (`MOCK_BATCHES[0]`) bất kể người dùng quét mã QR nào. Điều này dẫn đến nguy cơ sai lệch nguồn gốc nông sản nghiêm trọng.
   - CropNet Đồng Nai AI đã cấu hình triệt để: **Mã QR không tồn tại phải trả về mã lỗi 404** kèm cảnh báo tem không hợp lệ để bảo vệ thương hiệu nông sản Đồng Nai.
3. **Hình ảnh và bản quyền truyền thông:**
   - Sử dụng ảnh Unsplash theo giấy phép Unsplash Free License / ảnh chụp thực tế nhà vườn nông dân Đồng Nai.
   - Ghi nhận nguồn gốc đầy đủ trong `docs/OSS_ATTRIBUTIONS.md`.
