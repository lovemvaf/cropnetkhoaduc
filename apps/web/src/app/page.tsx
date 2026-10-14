'use client';

import React from 'react';
import Link from 'next/link';
import { Container } from '@cropnet/ui';
import { ArrowRight, QrCode, MapPin, Calendar, Check, MessageSquare } from 'lucide-react';

export default function HomePage() {
  const featuredProducts = [
    {
      id: 'prod-buoi-duong-la-cam',
      name: 'Bưởi Đường Lá Cam Tân Triều',
      supplier: 'HTX Nông Nghiệp Tân Triều',
      origin: 'Phường Tân Triều, TP Đồng Nai',
      price: 85000,
      unit: 'Quả (1.2 - 1.4kg)',
      tag: 'OCOP 4 Sao',
      imageUrl: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=600&auto=format'
    },
    {
      id: 'prod-saurieng-ri6-longkhanh',
      name: 'Sầu Riêng Ri6 Long Khánh (Chín Cây)',
      supplier: 'HTX Sinh Thái Long Khánh',
      origin: 'Phường Xuân Lập, TP Đồng Nai',
      price: 110000,
      unit: 'Kg (Quả 2.5 - 4kg)',
      tag: 'Canh tác sinh thái',
      imageUrl: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=600&auto=format'
    },
    {
      id: 'prod-hat-dieu-rang-cui',
      name: 'Hạt Điều Rang Củi Vỏ Lụa',
      supplier: 'HTX Nông Nghiệp Long Khánh',
      origin: 'TP Long Khánh, TP Đồng Nai',
      price: 140000,
      unit: 'Hộp 500g',
      tag: 'Đặc sản Đồng Nai',
      imageUrl: 'https://images.unsplash.com/photo-1563865436874-9aef32095fad?w=600&auto=format'
    }
  ];

  return (
    <div className="bg-[#FAF9F5] min-h-screen">
      {/* 1. Editorial Hero Section */}
      <section className="pt-10 pb-16 md:pt-16 md:pb-24 border-b border-[#E2E5DC]">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Narrative Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#F1EFE8] border border-[#E2E5DC] px-3 py-1 rounded text-xs font-medium text-[#2C4939]">
                <span>Nông sản bản địa Đồng Nai • Niên vụ 2026</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#253129] tracking-tight leading-[1.2]">
                Nông sản tươi lành, <br className="hidden sm:inline" />
                minh bạch từ vườn Cù lao Tân Triều đến Long Khánh.
              </h1>

              <p className="text-[#647067] text-base sm:text-lg leading-relaxed max-w-xl">
                CropNet kết nối trực tiếp các Hợp tác xã cây ăn trái Thành phố Đồng Nai với người tiêu dùng và doanh nghiệp. 
                Mỗi quả bưởi đường lá cam, trái sầu riêng chín cây đều có mã QR gắn với nhật ký thu hái thực địa.
              </p>

              {/* Editorial CTA Group: Exactly 1 primary CTA + 1 text link */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/products"
                  className="bg-[#2C4939] hover:bg-[#233C2F] text-white px-6 py-3 rounded-lg font-medium text-sm transition-colors inline-flex items-center gap-2"
                >
                  <span>Khám phá nông sản</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/traceability"
                  className="text-sm font-medium text-[#2C4939] hover:underline inline-flex items-center gap-1.5"
                >
                  <QrCode className="w-4 h-4 text-[#7B876C]" />
                  <span>Tra cứu tem QR lô hàng</span>
                </Link>
              </div>

              {/* Authentic Regional Attributes */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#E2E5DC] max-w-lg">
                <div>
                  <div className="text-xl font-bold text-[#253129]">02 HTX</div>
                  <div className="text-xs text-[#647067] mt-0.5">Tân Triều & Long Khánh</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-[#253129]">100% Lô</div>
                  <div className="text-xs text-[#647067] mt-0.5">Mã tem truy xuất nguồn gốc</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-[#253129]">Trợ Lý AI</div>
                  <div className="text-xs text-[#647067] mt-0.5">Tối ưu combo theo ngân sách</div>
                </div>
              </div>
            </div>

            {/* Right Hero Image */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-xl border border-[#E2E5DC] p-3 shadow-card">
                <div className="aspect-[4/3] rounded-lg overflow-hidden bg-[#F1EFE8] relative">
                  <img
                    src="https://images.unsplash.com/photo-1595855759920-86582396756a?w=1000&auto=format"
                    alt="Vườn bưởi Cù lao Tân Triều, Đồng Nai"
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="pt-3 px-1 flex items-center justify-between text-xs text-[#647067]">
                  <span>Vườn bưởi đường lá cam Cù lao Tân Triều</span>
                  <Link href="/ban-do" className="text-[#2C4939] hover:underline font-medium">
                    Xem bản đồ vườn →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Featured Regional Produce Section */}
      <section className="py-16 md:py-20 border-b border-[#E2E5DC]">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-3">
            <div>
              <span className="text-xs font-semibold text-[#7B876C] uppercase tracking-wider">
                Đặc Sản Tiêu Biểu
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#253129] tracking-tight mt-1">
                Nông sản thu hoạch theo vụ mùa
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs sm:text-sm font-medium text-[#2C4939] hover:underline inline-flex items-center gap-1"
            >
              <span>Xem toàn bộ danh mục</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-[#E2E5DC] overflow-hidden flex flex-col transition-colors hover:border-[#CBD0C4]"
              >
                <div className="aspect-square bg-[#F1EFE8] relative overflow-hidden">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-[#FFFFFF]/90 backdrop-blur-xs px-2 py-0.5 rounded text-[11px] font-medium text-[#2C4939] border border-[#E2E5DC]">
                    {p.tag}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="text-xs text-[#8C978F]">{p.supplier}</div>
                    <h3 className="font-semibold text-base text-[#253129] mt-0.5 leading-snug line-clamp-2">
                      {p.name}
                    </h3>
                    <div className="text-xs text-[#647067] mt-1">{p.origin}</div>
                  </div>

                  <div className="pt-3 border-t border-[#E2E5DC] flex items-center justify-between">
                    <div>
                      <div className="text-base font-bold text-[#253129]">
                        {p.price.toLocaleString('vi-VN')} đ
                      </div>
                      <div className="text-[11px] text-[#8C978F]">{p.unit}</div>
                    </div>
                    <Link
                      href={`/products/${p.id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-[#F1EFE8] hover:bg-[#E7E4DC] text-xs font-medium text-[#253129] transition-colors"
                    >
                      Chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 3. The Two Farming Regions Narrative */}
      <section className="py-16 md:py-20 bg-[#F1EFE8] border-b border-[#E2E5DC]">
        <Container>
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-semibold text-[#7B876C] uppercase tracking-wider">
              Vùng Đất & Nhà Vườn
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#253129] tracking-tight mt-1">
              Hai vùng trồng nòng cốt của Thành phố Đồng Nai
            </h2>
            <p className="text-sm text-[#647067] mt-2 leading-relaxed">
              Thổ nhưỡng phù sa sông Đồng Nai tại Vĩnh Cửu và đất đỏ bazan núi lửa tại Long Khánh tạo nên hương vị đặc sản không thể trộn lẫn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Tan Trieu Island */}
            <div className="bg-white rounded-xl border border-[#E2E5DC] p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-medium text-[#2C4939] bg-[#E6EAE4] px-2 py-0.5 rounded">
                    Phù sa sông Đồng Nai
                  </span>
                  <h3 className="text-lg font-bold text-[#253129] mt-2">
                    Cù Lao Tân Triều
                  </h3>
                  <p className="text-xs text-[#647067]">Phường Tân Triều, Thành phố Đồng Nai</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#647067] leading-relaxed">
                Nổi tiếng hơn một thế kỷ với giống bưởi đường lá cam và bưởi da xanh. Nước ngọt phù sa quanh năm bồi đắp giúp tép bưởi mọng nước, vị ngọt thanh tự nhiên và hương thơm thoang thoảng đặc trưng.
              </p>
              <div className="pt-2 border-t border-[#E2E5DC] flex items-center justify-between text-xs">
                <span className="text-[#647067]">Chủ thể: HTX Nông Nghiệp Tân Triều</span>
                <Link href="/products?supplier=tan-trieu" className="text-[#2C4939] font-medium hover:underline">
                  Xem nông sản Tân Triều →
                </Link>
              </div>
            </div>

            {/* Long Khanh Orchards */}
            <div className="bg-white rounded-xl border border-[#E2E5DC] p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-medium text-[#A46C49] bg-[#FAF5F1] px-2 py-0.5 rounded">
                    Đất đỏ bazan màu mỡ
                  </span>
                  <h3 className="text-lg font-bold text-[#253129] mt-2">
                    Miệt Vườn Long Khánh
                  </h3>
                  <p className="text-xs text-[#647067]">Phường Xuân Lập, Thành phố Đồng Nai</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#647067] leading-relaxed">
                Vựa trái cây trứ danh miền Đông Nam Bộ với sầu riêng Ri6 chín cây không nhúng thuốc, chôm chôm nhãn giòn ngọt và hạt điều vỏ lụa rang củi truyền thống của các hộ nhà vườn lâu năm.
              </p>
              <div className="pt-2 border-t border-[#E2E5DC] flex items-center justify-between text-xs">
                <span className="text-[#647067]">Chủ thể: HTX Sinh Thái Long Khánh</span>
                <Link href="/products?supplier=long-khanh" className="text-[#2C4939] font-medium hover:underline">
                  Xem nông sản Long Khánh →
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 4. Three Steps of Truthful Traceability */}
      <section className="py-16 md:py-20 border-b border-[#E2E5DC]">
        <Container>
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-semibold text-[#7B876C] uppercase tracking-wider">
              Minh Bạch Nguồn Gốc
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#253129] tracking-tight">
              3 bước truy xuất đơn giản
            </h2>
            <p className="text-xs sm:text-sm text-[#647067]">
              Cam kết nói không với mã tem ảo. Mỗi mã QR đều dẫn tới thông tin thu hoạch có thực.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-[#E2E5DC] p-6 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#E6EAE4] text-[#2C4939] flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="font-semibold text-base text-[#253129]">Ghi nhật ký tại vườn</h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                Nhà vườn cập nhật đợt bón phân sinh học, tưới tiêu và thời gian thu hái thực tế cho từng luống cây.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E5DC] p-6 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#E6EAE4] text-[#2C4939] flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="font-semibold text-base text-[#253129]">Cấp mã QR lô thu hoạch</h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                Mỗi kiện nông sản được định danh bằng mã lô độc nhất (ví dụ: BATCH-BUOI-TANTRIEU-2026-01).
              </p>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E5DC] p-6 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#E6EAE4] text-[#2C4939] flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="font-semibold text-base text-[#253129]">Quét kiểm tra trực tiếp</h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                Khách hàng quét qua camera điện thoại để xem hình ảnh vườn, vị trí tọa độ GIS và hồ sơ kiểm nghiệm mẫu.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/traceability"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#2C4939] hover:underline"
            >
              <QrCode className="w-4 h-4 text-[#7B876C]" />
              <span>Mở cổng quét mã QR camera và tải ảnh tem →</span>
            </Link>
          </div>
        </Container>
      </section>

      {/* 5. AI Consultant as a Practical Tool */}
      <section className="py-16 md:py-20 bg-[#FFFFFF]">
        <Container>
          <div className="rounded-xl border border-[#E2E5DC] bg-[#FAF9F5] p-8 sm:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <span className="text-xs font-semibold text-[#7B876C] uppercase tracking-wider">
                  Tiện Ích Thông Minh
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#253129] tracking-tight">
                  Trợ lý tư vấn combo nông sản theo ngân sách
                </h2>
                <p className="text-xs sm:text-sm text-[#647067] leading-relaxed max-w-xl">
                  Quý khách cần mua giỏ quà biếu đối tác hoặc chuẩn bị trái cây gia đình? 
                  Hệ thống đề xuất dựa trên bảng giá niêm yết của HTX, cam kết không vượt quá 1 đồng ngân sách và không tự ý đưa rượu vào combo quà biếu.
                </p>
                <div className="pt-2">
                  <Link
                    href="/ai-tu-van"
                    className="bg-[#2C4939] hover:bg-[#233C2F] text-white px-5 py-2.5 rounded-lg text-xs sm:text-sm font-medium inline-flex items-center gap-2 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Thử tính combo theo ngân sách</span>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-4 bg-white rounded-lg border border-[#E2E5DC] p-5 space-y-2.5 text-xs">
                <div className="font-semibold text-[#253129]">Ví dụ yêu cầu thực tế:</div>
                <div className="p-2.5 bg-[#FAF9F5] rounded border border-[#E2E5DC] text-[#647067]">
                  &quot;Tôi có 500.000đ muốn mua giỏ quà biếu bưởi Tân Triều và hạt điều&quot;
                </div>
                <div className="text-[11px] text-[#8C978F]">
                  → Hệ thống tính toán combo: 2 Bưởi đường lá cam + 1 Bưởi da xanh + 1 Hạt điều vỏ lụa (Tổng: 435.000đ).
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
