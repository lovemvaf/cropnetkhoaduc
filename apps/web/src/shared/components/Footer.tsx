import React from 'react';
import { Sprout, MapPin, QrCode, FileText } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#FFFFFF] border-t border-[#E2E5DC] py-12 mt-20 text-sm">
      <div className="max-w-[1240px] mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Column */}
        <div className="col-span-1 md:col-span-2 space-y-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E6EAE4] border border-[#C7D1C3] flex items-center justify-center text-[#2C4939]">
              <Sprout className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-[#253129] leading-tight">
                CropNet <span className="text-[#647067] font-normal text-sm">Đồng Nai</span>
              </span>
              <span className="text-[11px] text-[#8C978F]">Nông sản bản địa minh bạch</span>
            </div>
          </div>
          <p className="text-[#647067] max-w-md leading-relaxed text-xs sm:text-sm">
            Nền tảng thương mại số hóa kết nối các vùng trồng nông sản chủ lực Tỉnh Đồng Nai: 
            vùng bưởi Cù lao Tân Triều và miệt vườn sầu riêng, chôm chôm Long Khánh. 
            Giải pháp số dự thi Cuộc thi <strong>AI Digital Business Challenge 2026</strong>.
          </p>
          <div className="pt-2 text-xs text-[#8C978F] flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#7B876C]"></span>
            <span>Bản quyền hiển thị & khảo sát nông vụ 2026</span>
          </div>
        </div>

        {/* Navigation Column */}
        <div>
          <h4 className="font-semibold text-[#253129] mb-3 text-xs uppercase tracking-wider">
            Nông Sản & Vườn Trồng
          </h4>
          <ul className="space-y-2 text-[#647067] text-xs sm:text-sm">
            <li>
              <Link href="/products" className="hover:text-[#2C4939] transition-colors">
                Danh mục đặc sản
              </Link>
            </li>
            <li>
              <Link href="/ban-do" className="hover:text-[#2C4939] transition-colors">
                Bản đồ vị trí vườn
              </Link>
            </li>
            <li>
              <Link href="/mua-vu" className="hover:text-[#2C4939] transition-colors">
                Lịch mùa vụ thu hoạch
              </Link>
            </li>
            <li>
              <Link href="/traceability" className="hover:text-[#2C4939] transition-colors">
                Cổng quét QR truy xuất
              </Link>
            </li>
            <li>
              <Link href="/ai-tu-van" className="hover:text-[#2C4939] transition-colors">
                Trợ lý tính combo theo ngân sách
              </Link>
            </li>
          </ul>
        </div>

        {/* Regional Partners Column */}
        <div>
          <h4 className="font-semibold text-[#253129] mb-3 text-xs uppercase tracking-wider">
            Hợp Tác Xã Khảo Sát
          </h4>
          <div className="space-y-2.5 text-xs text-[#647067]">
            <div>
              <p className="font-medium text-[#253129]">HTX Nông Nghiệp Dịch Vụ Tân Triều</p>
              <p className="text-[#8C978F]">Xã Tân Bình, Huyện Vĩnh Cửu, Tỉnh Đồng Nai (Cù lao Tân Triều)</p>
            </div>
            <div>
              <p className="font-medium text-[#253129]">HTX Nông Nghiệp - TM - DV Xuân Lập</p>
              <p className="text-[#8C978F]">Phường Xuân Lập, Thành phố Long Khánh, Tỉnh Đồng Nai</p>
            </div>
            <div className="pt-2 border-t border-[#E2E5DC] text-[11px] text-[#8C978F]">
              Liên hệ khảo sát & phát triển: <strong>info@cropnet.vn</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 mt-8 pt-6 border-t border-[#E2E5DC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8C978F]">
        <div>
          &copy; {new Date().getFullYear()} <strong>CropNet Đồng Nai</strong>. Nền tảng Nông sản Số DiGiFest 2026.
        </div>
        <div className="flex items-center gap-4">
          <span>Dữ liệu khảo sát thực tế địa phương</span>
          <span>•</span>
          <span>Tỉnh Đồng Nai</span>
        </div>
      </div>
    </footer>
  );
}
