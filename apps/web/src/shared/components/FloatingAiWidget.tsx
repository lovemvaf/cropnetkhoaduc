'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function FloatingAiWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close modal on Escape key press (UX15)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Hide on checkout, cart, or ai-tu-van itself to prevent obstructing critical commerce CTAs or duplicate chat
  if (
    pathname === '/checkout' || 
    pathname === '/cart' || 
    pathname?.startsWith('/checkout') ||
    pathname === '/ai-tu-van'
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end space-y-2">
      {/* Expanded Quick Dialog */}
      {isOpen && (
        <div 
          role="dialog"
          aria-labelledby="floating-ai-title"
          className="w-[calc(100vw-32px)] max-w-xs sm:w-80 bg-white rounded-2xl shadow-modal border border-[#E2E5DC] p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between border-b border-[#E2E5DC] pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#E6EAE4] text-[#2C4939] flex items-center justify-center">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <h4 id="floating-ai-title" className="font-semibold text-xs text-[#253129]">Trợ Lý Nông Sản CropNet</h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#647067] hover:text-[#253129] p-1.5 rounded-lg hover:bg-[#F1EFE8] transition-colors"
              aria-label="Đóng trợ lý"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-[#647067] leading-relaxed">
            Hỗ trợ gợi ý combo nông sản Đồng Nai theo ngân sách, tra cứu mã lô QR và đối chiếu kiến thức nông nghiệp.
          </p>

          <div className="space-y-1.5 text-xs">
            <Link
              href="/ai-tu-van"
              className="block p-2.5 bg-[#F7F6F2] hover:bg-[#F1EFE8] text-[#253129] rounded-lg transition-colors font-medium border border-[#E2E5DC]"
            >
              • Đề xuất combo quà biếu theo ngân sách (300k - 1tr)
            </Link>
            <Link
              href="/traceability"
              className="block p-2.5 bg-[#F7F6F2] hover:bg-[#F1EFE8] text-[#253129] rounded-lg transition-colors font-medium border border-[#E2E5DC]"
            >
              • Quét tem QR kiểm tra nhật ký thu hoạch
            </Link>
          </div>

          <Link
            href="/ai-tu-van"
            className="w-full bg-[#2C4939] hover:bg-[#233C2F] text-white text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 font-medium transition-colors min-h-[40px]"
          >
            <span>Mở trang tư vấn AI</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex items-center gap-2 bg-[#FFFFFF] hover:bg-[#F7F6F2] text-[#2C4939] text-xs py-2.5 px-3.5 rounded-full border border-[#CBD0C4] shadow-subtle transition-colors focus:outline-none min-h-[44px]"
        aria-label="Mở trợ lý tư vấn"
      >
        <MessageSquare className="w-4 h-4 text-[#2C4939]" />
        <span className="font-medium hidden sm:inline">Tư vấn chọn nông sản</span>
      </button>
    </div>
  );
}
