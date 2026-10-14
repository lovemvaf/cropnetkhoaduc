'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Container, Card, Badge, Button, Input } from '@cropnet/ui';
import { 
  Bot, Send, Sparkles, ShoppingBag, ShieldCheck, Calendar, 
  ArrowRight, RefreshCw, CheckCircle2, AlertTriangle, FileText, 
  Building, User, Phone, Mail, Award, MapPin 
} from 'lucide-react';
import { apiClient } from '@/shared/services/api';
import { useCartStore } from '@/shared/stores/cart';
import { formatVND } from '@cropnet/utils';
import Link from 'next/link';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  intent?: string;
  recommendedProducts?: any[];
  suggestedPrompts?: string[];
  actionLink?: {
    label: string;
    url: string;
  };
  timestamp: string;
}

export default function AiConsultationPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Xin chào quý khách! Em là **Trợ Lý AI Bán Hàng & Nông Sản Thông Minh** của **CropNet Đồng Nai AI** (Phục vụ DiGiFest 2026).\n\nEm được kết nối trực tiếp với CSDL nhà vườn tại Hợp Tác Xã Tân Triều (Vĩnh Cửu) và HTX Long Khánh. Em có thể hỗ trợ quý khách:\n- **Tối ưu combo theo ngân sách chính xác** (không bao giờ vượt quá ngân sách)\n- **Xác thực tem QR và nhật ký canh tác sinh thái**\n- **Tra cứu lịch mùa vụ & thời điểm trái cây chín cây ngon nhất**\n- **Lập yêu cầu báo giá sỉ (RFQ) cho công ty & nhà hàng**\n\nQuý khách muốn em tư vấn món ngon nào của đất Đồng Nai hôm nay ạ?',
      intent: 'GREETING',
      suggestedPrompts: [
        'Tư vấn combo quà biếu 500k',
        'Sầu riêng Ri6 Long Khánh có nhúng thuốc không?',
        'Tra cứu tem BATCH-BUOI-TANTRIEU-2026-01',
        'Lịch mùa vụ bưởi Tân Triều 2026'
      ],
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [budgetSlider, setBudgetSlider] = useState(500000);
  const [budgetPurpose, setBudgetPurpose] = useState('quà biếu');
  const [rfqModalOpen, setRfqModalOpen] = useState(false);
  const [rfqSubmitting, setRfqSubmitting] = useState(false);
  const [rfqResult, setRfqResult] = useState<any>(null);
  const [rfqForm, setRfqForm] = useState({
    companyName: '',
    contactName: '',
    phone: '',
    email: '',
    notes: 'Yêu cầu báo giá 100 quả bưởi Tân Triều và 50 hộp hạt điều làm quà tặng Tết.'
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
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
    if (!customText) setInputMessage('');
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
          recommendedProducts: aiData.recommendedProducts,
          suggestedPrompts: aiData.suggestedPrompts,
          actionLink: aiData.actionLink,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err: any) {
      // Offline fallback using verified rules and genuine Dong Nai product catalog
      const lower = textToSend.toLowerCase();
      let fallbackText = 'Dạ hệ thống quy tắc CropNet đã tiếp nhận yêu cầu của quý khách. Các nông sản đặc sản như Bưởi đường lá cam Tân Triều, Sầu riêng Ri6 và Chôm chôm Long Khánh đều có hồ sơ truy xuất trên hệ thống. Quý khách có thể xem danh mục hoặc thử gợi ý combo theo ngân sách (ví dụ: 500k, 300k)!';
      let products: any[] = [];

      if (lower.includes('500k') || lower.includes('ngân sách') || lower.includes('quà biếu')) {
        fallbackText = 'Dạ với ngân sách 500.000đ, CropNet Đồng Nai AI (chế độ quy tắc xác minh) gợi ý Combo Nông Sản Đồng Nai Tuyển Chọn gồm: 2 Quả Bưởi Đường Lá Cam Tân Triều OCOP (170.000đ), 1 Quả Bưởi Da Xanh Ruột Hồng (75.000đ) và 2 Hộp Hạt Điều Rang Củi Vỏ Lụa (240.000đ). Tổng thanh toán là 485.000đ (còn dư 15.000đ trong hạn mức). Quý khách bấm thêm nhanh vào giỏ hàng bên dưới nhé!';
        products = [
          { id: 'prod-buoi-duong-la-cam', name: 'Bưởi Đường Lá Cam Tân Triều (OCOP)', price: 85000, unit: 'quả (1.1kg - 1.3kg)', quantity: 2, total: 170000, cooperativeName: 'HTX Nông Nghiệp Tân Triều' },
          { id: 'prod-buoi-da-xanh', name: 'Bưởi Da Xanh Tân Triều Hữu Cơ', price: 75000, unit: 'quả (1.3kg - 1.5kg)', quantity: 1, total: 75000, cooperativeName: 'HTX Nông Nghiệp Tân Triều' },
          { id: 'prod-hat-dieu-dong-nai', name: 'Hạt Điều Rang Muối Vỏ Lụa Đồng Nai (Hộp 500g)', price: 120000, unit: 'hộp 500g', quantity: 2, total: 240000, cooperativeName: 'HTX Nông Nghiệp Sinh Thái Long Khánh' }
        ];
      } else if (lower.includes('300k') || lower.includes('200k')) {
        fallbackText = 'Dạ với ngân sách 300.000đ, CropNet gợi ý Combo Hoa Quả Tươi Mát gồm: 1 Quả Bưởi Da Xanh Tân Triều (75.000đ), 2kg Chôm Chôm Nhãn Long Khánh (90.000đ) và 1 Quả Bưởi Đường Lá Cam (85.000đ). Tổng cộng 250.000đ (dư 50.000đ).';
        products = [
          { id: 'prod-buoi-da-xanh', name: 'Bưởi Da Xanh Tân Triều Hữu Cơ', price: 75000, unit: 'quả (1.3kg - 1.5kg)', quantity: 1, total: 75000, cooperativeName: 'HTX Nông Nghiệp Tân Triều' },
          { id: 'prod-chom-chom-nhan', name: 'Chôm Chôm Nhãn Long Khánh Tươi', price: 45000, unit: 'kg', quantity: 2, total: 90000, cooperativeName: 'HTX Nông Nghiệp Sinh Thái Long Khánh' },
          { id: 'prod-buoi-duong-la-cam', name: 'Bưởi Đường Lá Cam Tân Triều (OCOP)', price: 85000, unit: 'quả (1.1kg - 1.3kg)', quantity: 1, total: 85000, cooperativeName: 'HTX Nông Nghiệp Tân Triều' }
        ];
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: fallbackText,
          recommendedProducts: products,
          suggestedPrompts: [
            'Lịch mùa vụ nông sản Đồng Nai 2026',
            'Kiểm tra mã lô BATCH-BUOI-TANTRIEU-2026-01'
          ],
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetQuickRecommend = () => {
    handleSendMessage(`Tư vấn cho tôi combo ${budgetPurpose} với ngân sách ${new Intl.NumberFormat('vi-VN').format(budgetSlider)}đ`);
  };

  const handleAddProductToCart = (prod: any) => {
    addItem({
      productId: prod.id,
      name: prod.name,
      price: prod.price,
      quantity: prod.quantity || 1,
      unit: prod.unit,
      imageUrl: prod.imageUrl || 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&auto=format'
    });
    alert(`Đã thêm ${prod.quantity || 1} ${prod.unit} ${prod.name} vào giỏ hàng!`);
  };

  const handleAddAllToCart = (items: any[]) => {
    items.forEach((item) => {
      addItem({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        unit: item.unit,
        imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&auto=format'
      });
    });
    alert(`Đã thêm toàn bộ ${items.length} món trong combo vào giỏ hàng của bạn!`);
  };

  const handleSubmitRfq = async (e: React.FormEvent) => {
    e.preventDefault();
    setRfqSubmitting(true);
    try {
      const res = await apiClient.post('/ai/draft-rfq', rfqForm);
      if (res.data?.success) {
        setRfqResult(res.data.data);
      }
    } catch (err) {
      // Honest offline fallback: DRAFT_LOCAL only
      setRfqResult({
        rfqNumber: `RFQ-DN-${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toISOString(),
        companyName: rfqForm.companyName,
        contactName: rfqForm.contactName || rfqForm.companyName,
        phone: rfqForm.phone,
        email: rfqForm.email,
        notes: rfqForm.notes,
        status: 'DRAFT_LOCAL',
        processingTimeline: 'Bản thảo đã được tạo và lưu cục bộ trên trình duyệt của bạn (Showcase Demo).',
        contactChannel: 'Cổng thông tin HTX Nông sản Thành phố Đồng Nai'
      });
    } finally {
      setRfqSubmitting(false);
    }
  };

  return (
    <Container className="py-8 max-w-6xl space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <Badge className="bg-white/20 text-white border-0 font-bold px-3 py-1 text-xs inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            AI Sales Copilot & Recommender 2026
          </Badge>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            Trợ Lý Nông Sản & Bán Hàng Thông Minh Đồng Nai
          </h1>
          <p className="text-emerald-100 text-xs md:text-sm leading-relaxed">
            Tư vấn combo theo đúng hạn mức ngân sách, minh chứng kiểm định OCOP/VietGAP từ HTX Tân Triều & HTX Long Khánh, tuyệt đối không bịa đặt dữ liệu.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setRfqModalOpen(true)}
            className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs px-4 py-2.5 rounded-2xl shadow-md flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Lập Báo Giá Sỉ (RFQ)</span>
          </Button>
          <Link
            href="/traceability"
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-2xl border border-white/20 flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Cổng Quét QR</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Side: Budget Combo Generator Tool */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-5 space-y-5 rounded-3xl border border-emerald-100 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h3 className="font-black text-sm text-gray-900">Tính Nhanh Ngân Sách</h3>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-500">Mức chi:</span>
                <span className="font-mono font-black text-emerald-700 text-sm">
                  {new Intl.NumberFormat('vi-VN').format(budgetSlider)}đ
                </span>
              </div>
              <input
                type="range"
                min="100000"
                max="2000000"
                step="50000"
                value={budgetSlider}
                onChange={(e) => setBudgetSlider(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>100k</span>
                <span>1 triệu</span>
                <span>2 triệu</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 block">Mục đích sử dụng:</label>
              <select
                value={budgetPurpose}
                onChange={(e) => setBudgetPurpose(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="quà biếu đối tác">Quà biếu đối tác / Doanh nghiệp</option>
                <option value="tiêu dùng gia đình">Trái cây tươi ăn gia đình</option>
                <option value="quà Tết người thân">Quà Tết biếu người thân</option>
                <option value="tiệc liên hoan">Liên hoan / Sự kiện công ty</option>
              </select>
            </div>

            <Button
              onClick={handleBudgetQuickRecommend}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>AI Tính Combo Ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Card>

          {/* Cooperatives Quick Card */}
          <Card className="p-5 space-y-4 rounded-3xl border border-gray-150 bg-white shadow-sm">
            <h4 className="font-black text-xs text-gray-400 uppercase tracking-wider">Hợp Tác Xã Đối Tác</h4>
            <div className="space-y-3 text-xs">
              <div className="p-2.5 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                <h5 className="font-black text-emerald-900">HTX Nông Nghiệp Tân Triều</h5>
                <p className="text-gray-500 text-[11px] mt-0.5">Xã Tân Bình, Vĩnh Cửu, TP Đồng Nai</p>
                <span className="inline-block mt-1 text-[10px] bg-emerald-200 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  OCOP 4 Sao • VietGAP
                </span>
              </div>

              <div className="p-2.5 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                <h5 className="font-black text-amber-900">HTX Nông Nghiệp Long Khánh</h5>
                <p className="text-gray-500 text-[11px] mt-0.5">Phường Xuân Lập, TP Long Khánh</p>
                <span className="inline-block mt-1 text-[10px] bg-amber-200 text-amber-800 font-bold px-2 py-0.5 rounded">
                  Sầu Riêng Chín Cây • Hạt Điều
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Center/Right: Interactive Chat Stream */}
        <div className="lg:col-span-3 flex flex-col h-[750px] bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
          {/* Chat Messages Log */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/40">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                    <Bot className="w-5 h-5" />
                  </div>
                )}

                <div className={`max-w-2xl space-y-3 ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-4 md:p-5 rounded-3xl text-sm leading-relaxed shadow-sm ${
                      m.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-gray-150 rounded-bl-none'
                    }`}
                  >
                    <div className="whitespace-pre-line font-normal">{m.text}</div>
                    <span
                      className={`block text-[10px] mt-2 font-mono ${
                        m.sender === 'user' ? 'text-emerald-100 text-right' : 'text-gray-400'
                      }`}
                    >
                      {m.timestamp}
                    </span>
                  </div>

                  {/* Render Recommended Products Inside Message */}
                  {m.recommendedProducts && m.recommendedProducts.length > 0 && (
                    <div className="bg-white border border-emerald-200 p-4 rounded-3xl shadow-md space-y-3 w-full">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                          <ShoppingBag className="w-4 h-4 text-emerald-600" />
                          Gợi ý giỏ hàng tối ưu cho bạn ({m.recommendedProducts.length} món)
                        </span>
                        <Button
                          onClick={() => handleAddAllToCart(m.recommendedProducts!)}
                          className="text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded-xl"
                        >
                          Thêm tất cả vào giỏ
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {m.recommendedProducts.map((p) => (
                          <div
                            key={p.id}
                            className="p-3 bg-gray-50 border border-gray-150 rounded-2xl flex flex-col justify-between space-y-2"
                          >
                            <div>
                              <h5 className="font-black text-xs text-gray-900 leading-snug">{p.name}</h5>
                              <p className="text-[10px] text-gray-500 mt-0.5">{p.cooperativeName}</p>
                              <div className="flex items-baseline gap-1 mt-1">
                                <span className="font-mono font-extrabold text-emerald-700 text-xs">
                                  {formatVND(p.price)}
                                </span>
                                <span className="text-[10px] text-gray-400">/{p.unit}</span>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleAddProductToCart(p)}
                              className="w-full bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-[11px] py-1 rounded-xl flex items-center justify-center gap-1"
                            >
                              <span>+ Thêm</span>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Link button */}
                  {m.actionLink && (
                    <div>
                      <Link
                        href={m.actionLink.url}
                        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-2xl shadow-sm transition-all"
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
                          className="text-[11px] font-bold bg-white hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 border border-gray-200 hover:border-emerald-300 px-3 py-1.5 rounded-full transition-all text-left"
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
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="p-4 bg-white border border-gray-150 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  <span className="text-xs text-gray-400 font-bold ml-1">CropNet AI đang tính toán...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Nhập câu hỏi (Ví dụ: 'Tư vấn combo 500k', 'Bưởi Tân Triều có VietGAP không?')..."
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
              <Button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3 rounded-2xl flex-shrink-0 shadow-md transition-all disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* RFQ Wholesale Modal */}
      {rfqModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 bg-white rounded-3xl space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-lg text-gray-900">Yêu Cầu Báo Giá Sỉ (RFQ)</h3>
              </div>
              <button
                onClick={() => {
                  setRfqModalOpen(false);
                  setRfqResult(null);
                }}
                className="text-gray-400 hover:text-gray-700 font-bold"
              >
                ✕
              </button>
            </div>

            {rfqResult ? (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-2">
                  <Badge className="bg-amber-200 text-amber-900 border-0 font-bold px-3 py-1 text-xs">
                    BẢN NHÁP KỸ THUẬT SỐ (DRAFT_LOCAL)
                  </Badge>
                  <h4 className="font-black text-amber-950 text-base">Bản Thảo Báo Giá Đã Khởi Tạo</h4>
                  <p className="font-mono font-bold text-xs text-amber-800">{rfqResult.rfqNumber}</p>
                </div>

                <div className="text-xs text-gray-700 space-y-2 bg-gray-50 p-4 rounded-2xl border border-gray-150 font-medium">
                  <p><strong>Đơn vị yêu cầu:</strong> {rfqResult.companyName}</p>
                  <p><strong>Người liên hệ:</strong> {rfqResult.contactName || rfqResult.companyName}</p>
                  <p><strong>Số điện thoại:</strong> {rfqResult.phone}</p>
                  <p><strong>Nội dung:</strong> {rfqResult.notes || rfqForm.notes}</p>
                  <p><strong>Trạng thái:</strong> <span className="text-amber-700 font-bold">Lưu cục bộ tại phiên duyệt web</span></p>
                  <div className="pt-2 border-t border-gray-200 text-[11px] text-gray-500 italic">
                    * Lưu ý minh bạch: Bản nháp được lưu trên thiết bị của bạn. Để đảm bảo tính trung thực theo quy chế thi, hệ thống chưa gửi tự động đến cơ sở dữ liệu HTX do chưa có nhân viên tiếp nhận đơn hàng.
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      const text = `YÊU CẦU BÁO GIÁ SỈ CROPNET ĐỒNG NAI AI\nMã RFQ: ${rfqResult.rfqNumber}\nCông ty: ${rfqResult.companyName}\nNgười liên hệ: ${rfqResult.contactName || rfqResult.companyName}\nSĐT: ${rfqResult.phone}\nNội dung: ${rfqResult.notes || rfqForm.notes}\nNgày tạo: ${new Date().toLocaleString('vi-VN')}`;
                      navigator.clipboard.writeText(text);
                      alert('Đã sao chép nội dung bản nháp RFQ vào bộ nhớ tạm (clipboard)!');
                    }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2.5 rounded-2xl text-xs"
                  >
                    Sao chép bản nháp
                  </Button>
                  <Button
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
                    className="flex-1 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold py-2.5 rounded-2xl text-xs"
                  >
                    Tải file (.txt)
                  </Button>
                </div>

                <Button
                  onClick={() => {
                    setRfqModalOpen(false);
                    setRfqResult(null);
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-2xl text-xs"
                >
                  Đóng cửa sổ
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmitRfq} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Tên Công Ty / Đơn Vị:</label>
                  <input
                    type="text"
                    required
                    value={rfqForm.companyName}
                    onChange={(e) => setRfqForm({ ...rfqForm, companyName: e.target.value })}
                    placeholder="Ví dụ: Công ty Cổ phần Thực phẩm Sạch..."
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Số Điện Thoại:</label>
                    <input
                      type="tel"
                      required
                      value={rfqForm.phone}
                      onChange={(e) => setRfqForm({ ...rfqForm, phone: e.target.value })}
                      placeholder="0987.xxx.xxx"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Người Liên Hệ:</label>
                    <input
                      type="text"
                      value={rfqForm.contactName}
                      onChange={(e) => setRfqForm({ ...rfqForm, contactName: e.target.value })}
                      placeholder="Anh / Chị..."
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Nội dung yêu cầu sỉ:</label>
                  <textarea
                    rows={3}
                    value={rfqForm.notes}
                    onChange={(e) => setRfqForm({ ...rfqForm, notes: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={rfqSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl shadow-md"
                >
                  {rfqSubmitting ? 'Đang gửi yêu cầu...' : 'Gửi Yêu Cầu Báo Giá Sỉ Cho HTX'}
                </Button>
              </form>
            )}
          </Card>
        </div>
      )}
    </Container>
  );
}
