'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Container } from '@cropnet/ui';
import { 
  Send, ShoppingBag, ArrowRight, FileText, 
  MapPin, Check, Copy, Download, X, SlidersHorizontal, MessageSquare, AlertCircle, RefreshCw, ExternalLink
} from 'lucide-react';
import { apiClient } from '@/shared/services/api';
import { useCartStore } from '@/shared/stores/cart';
import { formatVND } from '@cropnet/utils';
import Link from 'next/link';

interface Citation {
  sourceId: string;
  title: string;
  url: string;
  publisher?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  intent?: string;
  mode?: string;
  evidenceScope?: string;
  citations?: Citation[];
  recommendedProducts?: any[];
  suggestedPrompts?: string[];
  actionLink?: {
    label: string;
    url: string;
  };
  isError?: boolean;
  retryText?: string;
  timestamp: string;
}

export default function AiConsultationPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Xin chào quý khách! Tôi là Trợ lý Tư vấn Nông sản CropNet Đồng Nai.\n\nHệ thống đối chiếu dữ liệu trực tiếp với danh mục và bảng giá niêm yết của HTX Nông nghiệp Tân Triều và HTX Sinh thái Long Khánh. Tôi có thể hỗ trợ quý khách:\n• Tối ưu hóa combo giỏ quà biếu hoặc trái cây gia đình theo ngân sách chính xác.\n• Tra cứu thông tin mã tem QR lô thu hoạch thực địa.\n• Giải thích các thuật ngữ chuyên sâu (Độ Brix, Ethylene, VietGAP, HACCP, GlobalGAP, SKU).\n• Lập bản thảo yêu cầu báo giá sỉ (RFQ) minh bạch cho doanh nghiệp.\n\nQuý khách muốn tìm hiểu loại nông sản nào hôm nay?',
      intent: 'GREETING',
      mode: 'verified_fallback',
      evidenceScope: 'rag_verified',
      citations: [
        {
          sourceId: 'SRC-DN-01',
          title: 'Cổng TTĐT Tỉnh Đồng Nai — Nông Sản Bản Địa',
          url: 'https://dongnai.gov.vn',
          publisher: 'UBND Tỉnh Đồng Nai'
        }
      ],
      suggestedPrompts: [
        'Tư vấn combo quà biếu 500.000đ',
        'Combo trái cây gia đình 300.000đ',
        'Độ Brix trong bưởi Tân Triều là gì?',
        'Kiểm tra mã lô BATCH-BUOI-TANTRIEU-2026-01',
        'Lịch mùa vụ bưởi Tân Triều và sầu riêng'
      ],
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [budgetSlider, setBudgetSlider] = useState(500000);
  const [budgetPurpose, setBudgetPurpose] = useState('quà biếu');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [rfqModalOpen, setRfqModalOpen] = useState(false);
  const [rfqSubmitting, setRfqSubmitting] = useState(false);
  const [rfqResult, setRfqResult] = useState<any>(null);
  const [rfqForm, setRfqForm] = useState({
    companyName: '',
    contactName: '',
    phone: '',
    email: '',
    notes: 'Yêu cầu báo giá 50 quả bưởi đường lá cam Tân Triều và 30 hộp hạt điều vỏ lụa làm quà tặng đối tác.'
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const addItem = useCartStore((state) => state.addItem);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) {
      setInputMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
    setLoading(true);

    try {
      const res = await apiClient.post('/ai/chat', {
        message: textToSend,
        history: messages.map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }))
      });

      if (res.data?.success) {
        const aiData = res.data.data;
        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: aiData.reply,
          intent: aiData.intent,
          mode: aiData.mode,
          evidenceScope: aiData.evidenceScope,
          citations: aiData.citations,
          recommendedProducts: aiData.recommendedProducts,
          suggestedPrompts: aiData.suggestedPrompts,
          actionLink: aiData.actionLink,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error(res.data?.message || 'Lỗi xử lý phản hồi từ trợ lý AI');
      }
    } catch (err: any) {
      // Truthful error state with Retry CTA (Never invent fake simulated 500k combos on API network error)
      const errorMsg: Message = {
        id: `ai-err-${Date.now()}`,
        sender: 'assistant',
        text: '⚠️ **Không thể kết nối đến máy chủ trợ lý AI CropNet.** Có thể do gián đoạn kết nối mạng hoặc phiên làm việc tạm thời bị gián đoạn. Bạn có thể nhấn nút "Thử lại" bên dưới.',
        isError: true,
        retryText: textToSend,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetPreset = (budget: number) => {
    setBudgetSlider(budget);
    handleSendMessage(`Tư vấn giúp tôi combo nông sản Đồng Nai ngân sách ${budget.toLocaleString('vi-VN')} đ cho mục đích ${budgetPurpose}`);
    if (window.innerWidth < 1024) {
      setMobileSidebarOpen(false);
    }
  };

  const handleAddAllToCart = (products: any[]) => {
    products.forEach((p) => {
      addItem({
        productId: p.id,
        name: p.name,
        price: Number(p.price),
        unit: p.unit,
        quantity: p.quantity || 1,
        imageUrl: p.imageUrl
      });
    });
    alert(`Đã thêm ${products.length} sản phẩm trong combo vào giỏ hàng thành công!`);
  };

  const handleAddProductToCart = (p: any) => {
    addItem({
      productId: p.id,
      name: p.name,
      price: Number(p.price),
      unit: p.unit,
      quantity: 1,
      imageUrl: p.imageUrl
    });
    alert(`Đã thêm ${p.name} vào giỏ hàng!`);
  };

  const handleSubmitRfq = async (e: React.FormEvent) => {
    e.preventDefault();
    setRfqSubmitting(true);
    try {
      const res = await apiClient.post('/ai/rfq-draft', rfqForm);
      if (res.data?.success) {
        setRfqResult(res.data.data);
      }
    } catch (err) {
      // Local draft fallback
      setRfqResult({
        rfqNumber: `RFQ-DN-${Date.now().toString().slice(-6)}`,
        status: 'DRAFT_LOCAL',
        companyName: rfqForm.companyName,
        contactName: rfqForm.contactName,
        phone: rfqForm.phone,
        notes: rfqForm.notes
      });
    } finally {
      setRfqSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAF9F5] min-h-screen py-4 sm:py-8 md:py-12">
      <Container className="space-y-6 max-w-7xl px-3 sm:px-6">
        {/* Editorial Page Header */}
        <div className="border-b border-[#E2E5DC] pb-4 sm:pb-6 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] sm:text-xs font-semibold text-[#7B876C] uppercase tracking-wider">
              Trợ Lý Nông Sản Số
            </span>
            <span className="text-xs text-[#8C978F]">•</span>
            <span className="text-[11px] sm:text-xs text-[#2C4939] bg-[#E6EAE4] px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2C4939] animate-pulse"></span>
              Hybrid RAG + DeepSeek AI 2026
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#253129] tracking-tight">
            Tư Vấn Chọn Nông Sản & Tính Combo Theo Ngân Sách
          </h1>
          <p className="text-xs sm:text-sm text-[#647067] max-w-3xl leading-relaxed">
            Hệ thống đối soát trực tiếp theo danh mục Hợp tác xã Đồng Nai, cam kết bảo toàn ngân sách 0% vượt ngưỡng, minh bạch nguồn gốc và hỗ trợ giải thích kiến thức nông nghiệp chính xác.
          </p>
        </div>

        {/* Mobile Sidebar Toggle Button (< 1024px) */}
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="w-full flex items-center justify-between p-3 bg-white border border-[#E2E5DC] rounded-xl text-xs font-semibold text-[#253129] shadow-subtle hover:bg-[#FAF9F5] transition-colors"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#2C4939]" />
              <span>{mobileSidebarOpen ? 'Thu gọn công cụ tính combo & HTX' : 'Tùy chọn tính combo nhanh & HTX khảo sát'}</span>
            </div>
            <span className="text-[11px] text-[#7B876C] font-normal">{mobileSidebarOpen ? '▲ Đóng' : '▼ Mở nhanh'}</span>
          </button>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Quick Budget Calculator & Cooperatives Info */}
          <div className={`${mobileSidebarOpen ? 'block' : 'hidden'} lg:block lg:col-span-4 space-y-5`}>
            {/* Quick Budget Tool Card */}
            <div className="bg-white rounded-xl border border-[#E2E5DC] p-4 sm:p-5 shadow-subtle space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E2E5DC] pb-3">
                <SlidersHorizontal className="w-4 h-4 text-[#7B876C]" />
                <h3 className="font-semibold text-sm text-[#253129]">
                  Tính combo nhanh theo ngân sách
                </h3>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#647067]">Ngân sách dự kiến:</span>
                  <span className="font-bold text-sm text-[#253129]">
                    {budgetSlider.toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <input
                  type="range"
                  min={100000}
                  max={2000000}
                  step={50000}
                  value={budgetSlider}
                  onChange={(e) => setBudgetSlider(Number(e.target.value))}
                  className="w-full accent-[#2C4939] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#8C978F]">
                  <span>100.000 đ</span>
                  <span>1.000.000 đ</span>
                  <span>2.000.000 đ</span>
                </div>
              </div>

              {/* Purpose Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#647067]">Mục đích chọn mua:</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['quà biếu đối tác', 'thưởng thức gia đình'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setBudgetPurpose(p)}
                      className={`p-2.5 rounded-lg border text-center transition-colors min-h-[40px] flex items-center justify-center ${
                        budgetPurpose === p
                          ? 'bg-[#E6EAE4] border-[#2C4939] text-[#2C4939] font-medium'
                          : 'bg-white border-[#E2E5DC] text-[#647067] hover:border-[#CBD0C4]'
                      }`}
                    >
                      {p === 'quà biếu đối tác' ? 'Quà biếu đối tác' : 'Trái cây gia đình'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => handleBudgetPreset(budgetSlider)}
                  className="w-full bg-[#2C4939] hover:bg-[#233C2F] text-white py-2.5 rounded-lg text-xs font-medium transition-colors min-h-[44px]"
                >
                  Tính combo ngay ({budgetSlider.toLocaleString('vi-VN')} đ)
                </button>
                <button
                  onClick={() => setRfqModalOpen(true)}
                  className="w-full bg-white hover:bg-[#F1EFE8] text-[#253129] border border-[#E2E5DC] py-2.5 rounded-lg text-xs font-medium transition-colors min-h-[44px]"
                >
                  Lập bản thảo báo giá sỉ B2B (RFQ)
                </button>
              </div>
            </div>

            {/* Cooperative Info Card */}
            <div className="bg-white rounded-xl border border-[#E2E5DC] p-4 sm:p-5 shadow-subtle space-y-3 text-xs">
              <h4 className="font-semibold text-xs text-[#253129] uppercase tracking-wider">
                Hợp Tác Xã Khảo Sát & Xác Thực
              </h4>
              <div className="space-y-3">
                <div className="p-3 bg-[#FAF9F5] rounded-lg border border-[#E2E5DC] space-y-1">
                  <div className="font-semibold text-[#253129]">HTX Nông Nghiệp Dịch Vụ Tân Triều</div>
                  <div className="text-[#8C978F]">Xã Tân Bình, Huyện Vĩnh Cửu, Tỉnh Đồng Nai</div>
                  <span className="inline-block text-[10px] bg-[#E6EAE4] text-[#2C4939] px-2 py-0.5 rounded font-medium">
                    OCOP 4 Sao • Bưởi đường lá cam • VietGAP
                  </span>
                </div>
                <div className="p-3 bg-[#FAF9F5] rounded-lg border border-[#E2E5DC] space-y-1">
                  <div className="font-semibold text-[#253129]">HTX Xuân Lập Long Khánh</div>
                  <div className="text-[#8C978F]">Phường Xuân Lập, TP Long Khánh, Tỉnh Đồng Nai</div>
                  <span className="inline-block text-[10px] bg-[#FAF5F1] text-[#A46C49] px-2 py-0.5 rounded font-medium">
                    Sầu riêng Ri6 chín cây • Hạt điều rang củi
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Interactive Dialogue Stream */}
          <div className="lg:col-span-8 flex flex-col h-[70vh] min-h-[500px] lg:h-[720px] max-h-[calc(100dvh-140px)] bg-white rounded-xl border border-[#E2E5DC] shadow-subtle overflow-hidden">
            {/* Messages Scroll Area */}
            <div className="flex-1 p-3.5 sm:p-5 md:p-6 overflow-y-auto space-y-4 bg-[#FAF9F5]/40">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 sm:gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-[#E6EAE4] border border-[#C7D1C3] text-[#2C4939] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className={`max-w-xl space-y-2.5 ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    {/* Provenance badge for Assistant */}
                    {m.sender === 'assistant' && !m.isError && (
                      <div className="flex items-center gap-1.5 text-[10px] text-[#8C978F]">
                        {m.mode === 'live_deepseek_grounded' ? (
                          <span className="bg-[#E8F0FE] text-[#1967D2] px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1967D2]"></span>
                            DeepSeek AI + Dữ liệu đối soát
                          </span>
                        ) : (
                          <span className="bg-[#E6EAE4] text-[#2C4939] px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2C4939]"></span>
                            Tri thức CropNet đã xác minh
                          </span>
                        )}
                      </div>
                    )}

                    <div
                      className={`p-3.5 sm:p-4 rounded-xl text-xs sm:text-sm leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-[#2C4939] text-white shadow-sm'
                          : m.isError
                          ? 'bg-[#FDF2F2] text-[#991B1B] border border-[#F87171]'
                          : 'bg-white text-[#253129] border border-[#E2E5DC] shadow-sm'
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">{m.text}</div>

                      {/* Retry Button if Error */}
                      {m.isError && m.retryText && (
                        <div className="pt-3 mt-2 border-t border-[#FCA5A5]/60 flex items-center justify-between">
                          <span className="text-[11px] text-[#B91C1C]">Lỗi kết nối</span>
                          <button
                            onClick={() => handleSendMessage(m.retryText)}
                            disabled={loading}
                            className="inline-flex items-center gap-1 text-xs bg-[#B91C1C] hover:bg-[#991B1B] text-white px-3 py-1.5 rounded-lg transition-colors font-medium min-h-[36px]"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Thử lại</span>
                          </button>
                        </div>
                      )}

                      {/* Citations list */}
                      {m.citations && m.citations.length > 0 && (
                        <div className="pt-2.5 mt-2.5 border-t border-[#E2E5DC] space-y-1.5">
                          <span className="text-[11px] font-semibold text-[#647067] block">Nguồn trích dẫn xác minh:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {m.citations.map((c, idx) => (
                              <a
                                key={idx}
                                href={c.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] bg-[#F1EFE8] hover:bg-[#E6EAE4] text-[#2C4939] px-2.5 py-1 rounded-md border border-[#CBD0C4] transition-colors"
                              >
                                <span className="truncate max-w-[220px]">{c.title}</span>
                                <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      <span
                        className={`block text-[10px] mt-2 font-mono ${
                          m.sender === 'user' ? 'text-white/70 text-right' : 'text-[#8C978F]'
                        }`}
                      >
                        {m.timestamp}
                      </span>
                    </div>

                    {/* Recommended Products inside Message */}
                    {m.recommendedProducts && m.recommendedProducts.length > 0 && (
                      <div className="bg-white border border-[#CBD0C4] p-3.5 sm:p-4 rounded-xl space-y-3 w-full shadow-sm">
                        <div className="flex items-center justify-between border-b border-[#E2E5DC] pb-2">
                          <span className="text-xs font-semibold text-[#253129] flex items-center gap-1.5">
                            <ShoppingBag className="w-4 h-4 text-[#7B876C]" />
                            <span>Combo đề xuất ({m.recommendedProducts.length} sản phẩm)</span>
                          </span>
                          <button
                            onClick={() => handleAddAllToCart(m.recommendedProducts!)}
                            className="text-xs bg-[#2C4939] hover:bg-[#233C2F] text-white font-medium px-3 py-1.5 rounded-lg transition-colors min-h-[36px]"
                          >
                            Thêm tất cả vào giỏ
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {m.recommendedProducts.map((p) => (
                            <div
                              key={p.id}
                              className="p-3 bg-[#FAF9F5] border border-[#E2E5DC] rounded-lg flex flex-col justify-between space-y-2 text-xs"
                            >
                              <div>
                                <h5 className="font-semibold text-[#253129]">{p.name}</h5>
                                <p className="text-[11px] text-[#8C978F] mt-0.5">{p.cooperativeName}</p>
                                <div className="font-bold text-[#253129] mt-1">
                                  {formatVND(p.price)} <span className="font-normal text-[11px] text-[#8C978F]">/{p.unit}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleAddProductToCart(p)}
                                className="w-full bg-white hover:bg-[#F1EFE8] text-[#253129] border border-[#E2E5DC] text-xs font-medium py-1.5 rounded transition-colors min-h-[36px]"
                              >
                                + Thêm món này
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action link */}
                    {m.actionLink && (
                      <div>
                        <Link
                          href={m.actionLink.url}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-[#2C4939] hover:bg-[#233C2F] px-4 py-2 rounded-lg transition-colors min-h-[38px]"
                        >
                          <span>{m.actionLink.label}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}

                    {/* Suggested prompts chips */}
                    {m.suggestedPrompts && m.suggestedPrompts.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {m.suggestedPrompts.map((prompt) => (
                          <button
                            key={prompt}
                            onClick={() => handleSendMessage(prompt)}
                            className="text-xs bg-white hover:bg-[#F1EFE8] text-[#647067] hover:text-[#253129] border border-[#E2E5DC] px-2.5 py-1.5 rounded-lg transition-colors text-left min-h-[32px] flex items-center"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#E6EAE4] border border-[#C7D1C3] text-[#2C4939] flex items-center justify-center flex-shrink-0 animate-pulse">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-3 bg-white border border-[#E2E5DC] rounded-xl text-xs text-[#647067] shadow-sm flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-[#2C4939] border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang tra cứu dữ liệu nông sản Đồng Nai & suy luận...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Composer Input Bar */}
            <div className="p-3 sm:p-4 border-t border-[#E2E5DC] bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-end gap-2"
              >
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={inputMessage}
                    onChange={(e) => {
                      setInputMessage(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 130)}px`;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        // Protect Vietnamese IME composition from premature send
                        if (e.nativeEvent.isComposing || e.keyCode === 229) return;
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Nhập câu hỏi (Shift+Enter xuống dòng): 'Brix là gì?', 'Combo 500k không hạt điều'..."
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#E2E5DC] rounded-lg text-base md:text-sm text-[#253129] placeholder-[#8C978F] focus:outline-none focus:border-[#2C4939] resize-none leading-relaxed transition-all block"
                    style={{ minHeight: '44px', maxHeight: '130px' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim()}
                  className="bg-[#2C4939] hover:bg-[#233C2F] text-white p-2.5 sm:px-4 sm:py-2.5 rounded-lg flex-shrink-0 transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px]"
                  aria-label="Gửi tin nhắn"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs font-medium">Gửi</span>
                </button>
              </form>
              <div className="text-[11px] text-[#8C978F] mt-1.5 flex items-center justify-between px-1">
                <span className="truncate">Nhấn <strong>Enter</strong> để gửi • <strong>Shift + Enter</strong> xuống dòng</span>
                <span className="hidden sm:inline flex-shrink-0 ml-2">Đối soát HTX Đồng Nai</span>
              </div>
            </div>
          </div>
        </div>

        {/* RFQ Wholesale Modal */}
        {rfqModalOpen && (
          <div className="fixed inset-0 z-50 bg-[#253129]/50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="w-full max-w-lg p-5 sm:p-6 bg-white rounded-xl space-y-4 border border-[#E2E5DC] shadow-modal relative my-auto">
              <div className="flex items-center justify-between border-b border-[#E2E5DC] pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#7B876C]" />
                  <h3 className="font-semibold text-sm sm:text-base text-[#253129]">Bản Thảo Báo Giá Sỉ (RFQ)</h3>
                </div>
                <button
                  onClick={() => {
                    setRfqModalOpen(false);
                    setRfqResult(null);
                  }}
                  className="text-[#647067] hover:text-[#253129] p-1"
                  aria-label="Đóng"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {rfqResult ? (
                <div className="space-y-4">
                  <div className="p-3 bg-[#FAF9F5] border border-[#E2E5DC] rounded-lg text-center space-y-1">
                    <span className="text-[11px] font-medium bg-[#E6EAE4] text-[#2C4939] px-2.5 py-0.5 rounded">
                      BẢN NHÁP CỤC BỘ (DRAFT_LOCAL)
                    </span>
                    <h4 className="font-bold text-sm text-[#253129] mt-1">Mã tham chiếu: {rfqResult.rfqNumber}</h4>
                  </div>

                  <div className="text-xs text-[#647067] space-y-1.5 bg-[#FAF9F5] p-3.5 rounded-lg border border-[#E2E5DC]">
                    <p><strong>Đơn vị:</strong> {rfqResult.companyName}</p>
                    <p><strong>Người liên hệ:</strong> {rfqResult.contactName || rfqResult.companyName}</p>
                    <p><strong>Số điện thoại:</strong> {rfqResult.phone}</p>
                    <p><strong>Nội dung:</strong> {rfqResult.notes || rfqForm.notes}</p>
                    <p className="text-[11px] text-[#8C978F] italic pt-1 border-t border-[#E2E5DC]">
                      * Ghi chú: Bản nháp lưu tại trình duyệt của bạn để chuẩn bị gửi đối tác HTX.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => {
                        const text = `YÊU CẦU BÁO GIÁ SỈ CROPNET ĐỒNG NAI AI\nMã RFQ: ${rfqResult.rfqNumber}\nCông ty: ${rfqResult.companyName}\nNgười liên hệ: ${rfqResult.contactName || rfqResult.companyName}\nSĐT: ${rfqResult.phone}\nNội dung: ${rfqResult.notes || rfqForm.notes}\nNgày tạo: ${new Date().toLocaleString('vi-VN')}`;
                        navigator.clipboard.writeText(text);
                        alert('Đã sao chép nội dung bản nháp RFQ vào bộ nhớ tạm!');
                      }}
                      className="flex-1 bg-[#F1EFE8] hover:bg-[#E7E4DC] text-[#253129] text-xs font-medium py-2.5 rounded-lg border border-[#E2E5DC] inline-flex items-center justify-center gap-1.5 min-h-[44px]"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép bản nháp</span>
                    </button>
                    <button
                      onClick={() => {
                        const text = `YÊU CẦU BÁO GIÁ SỈ CROPNET ĐỒNG NAI AI\nMã RFQ: ${rfqResult.rfqNumber}\nCông ty: ${rfqResult.companyName}\nNgười liên hệ: ${rfqResult.contactName || rfqResult.companyName}\nSĐT: ${rfqResult.phone}\nNội dung: ${rfqResult.notes || rfqForm.notes}\nNgày tạo: ${new Date().toLocaleString('vi-VN')}`;
                        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${rfqResult.rfqNumber}.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="flex-1 bg-[#2C4939] hover:bg-[#233C2F] text-white text-xs font-medium py-2.5 rounded-lg inline-flex items-center justify-center gap-1.5 min-h-[44px]"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải file (.txt)</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setRfqModalOpen(false);
                      setRfqResult(null);
                    }}
                    className="w-full text-xs text-[#647067] hover:underline pt-1 text-center py-2"
                  >
                    Đóng cửa sổ
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitRfq} className="space-y-3.5 text-xs">
                  <div>
                    <label className="text-[#647067] block mb-1 font-semibold">Tên Công Ty / Đơn Vị:</label>
                    <input
                      type="text"
                      required
                      value={rfqForm.companyName}
                      onChange={(e) => setRfqForm({ ...rfqForm, companyName: e.target.value })}
                      placeholder="Ví dụ: Công ty TNHH Nông Sản Xanh..."
                      className="w-full p-2.5 bg-[#FAF9F5] border border-[#E2E5DC] rounded-lg text-base md:text-xs text-[#253129] focus:outline-none focus:border-[#2C4939] min-h-[42px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[#647067] block mb-1 font-semibold">Số Điện Thoại:</label>
                      <input
                        type="tel"
                        required
                        value={rfqForm.phone}
                        onChange={(e) => setRfqForm({ ...rfqForm, phone: e.target.value })}
                        placeholder="09xx.xxx.xxx"
                        className="w-full p-2.5 bg-[#FAF9F5] border border-[#E2E5DC] rounded-lg text-base md:text-xs text-[#253129] focus:outline-none focus:border-[#2C4939] min-h-[42px]"
                      />
                    </div>
                    <div>
                      <label className="text-[#647067] block mb-1 font-semibold">Người Liên Hệ:</label>
                      <input
                        type="text"
                        value={rfqForm.contactName}
                        onChange={(e) => setRfqForm({ ...rfqForm, contactName: e.target.value })}
                        placeholder="Họ và tên..."
                        className="w-full p-2.5 bg-[#FAF9F5] border border-[#E2E5DC] rounded-lg text-base md:text-xs text-[#253129] focus:outline-none focus:border-[#2C4939] min-h-[42px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[#647067] block mb-1 font-semibold">Nội dung nhu cầu báo giá:</label>
                    <textarea
                      rows={3}
                      value={rfqForm.notes}
                      onChange={(e) => setRfqForm({ ...rfqForm, notes: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF9F5] border border-[#E2E5DC] rounded-lg text-base md:text-xs text-[#253129] focus:outline-none focus:border-[#2C4939]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={rfqSubmitting}
                    className="w-full bg-[#2C4939] hover:bg-[#233C2F] text-white font-medium py-3 rounded-lg text-xs transition-colors min-h-[44px]"
                  >
                    {rfqSubmitting ? 'Đang khởi tạo bản thảo...' : 'Tạo Bản Thảo Báo Giá Sỉ (DRAFT_LOCAL)'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
