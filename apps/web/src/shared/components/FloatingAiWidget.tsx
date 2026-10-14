'use client';

import React, { useState } from 'react';
import { Bot, Sparkles, X, MessageSquare, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function FloatingAiWidget() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [quickInput, setQuickInput] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    router.push('/ai-tu-van');
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end space-y-3 font-sans">
      {/* Expanded Quick Dialogue Bubble */}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-emerald-200 p-5 space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-black text-xs text-gray-900 leading-tight">Trợ Lý AI Đồng Nai 2026</h4>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Sẵn sàng tư vấn 24/7
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-700 text-xs font-bold"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs text-gray-600 space-y-2">
            <p>Em có thể giúp quý khách:</p>
            <div className="space-y-1.5">
              <Link
                href="/ai-tu-van"
                className="block p-2 bg-emerald-50 hover:bg-emerald-100/70 text-emerald-900 rounded-xl font-bold transition-colors"
              >
                🎁 Tối ưu combo quà biếu theo ngân sách (500k, 1 triệu)
              </Link>
              <Link
                href="/ai-tu-van"
                className="block p-2 bg-amber-50 hover:bg-amber-100/70 text-amber-900 rounded-xl font-bold transition-colors"
              >
                🔍 Kiểm tra tem QR & chứng nhận OCOP 4 sao
              </Link>
              <Link
                href="/ai-tu-van"
                className="block p-2 bg-sky-50 hover:bg-sky-100/70 text-sky-900 rounded-xl font-bold transition-colors"
              >
                📋 Lập yêu cầu báo giá sỉ cho công ty (RFQ)
              </Link>
            </div>
          </div>

          <Link
            href="/ai-tu-van"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all"
          >
            <span>Mở Cửa Sổ Trò Chuyện Đầy Đủ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs py-3.5 px-5 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95"
      >
        <div className="relative">
          <Bot className="w-5 h-5 text-white" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-white animate-ping"></span>
        </div>
        <span>AI Tư Vấn 24/7</span>
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
      </button>
    </div>
  );
}
