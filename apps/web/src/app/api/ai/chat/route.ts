import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-static';

// Verified Dong Nai regional catalog data
const VERIFIED_PRODUCTS = [
  {
    id: 'prod-buoi-duong-la-cam',
    name: 'Bưởi Đường Lá Cam Tân Triều (OCOP 4 Sao)',
    price: 85000,
    unit: 'quả (1.1kg - 1.3kg)',
    cooperativeName: 'HTX Nông Nghiệp Dịch Vụ Tân Triều',
    certifications: ['OCOP 4 Sao', 'VietGAP Trồng trọt'],
    inStock: true
  },
  {
    id: 'prod-buoi-da-xanh',
    name: 'Bưởi Da Xanh Tân Triều Hữu Cơ',
    price: 75000,
    unit: 'quả (1.3kg - 1.5kg)',
    cooperativeName: 'HTX Nông Nghiệp Dịch Vụ Tân Triều',
    certifications: ['VietGAP Trồng trọt'],
    inStock: true
  },
  {
    id: 'prod-saurieng-ri6',
    name: 'Sầu Riêng Ri6 Long Khánh (Chín Cây Tự Nhiên)',
    price: 135000,
    unit: 'kg (trái 2.2kg - 3.5kg)',
    cooperativeName: 'HTX Nông Nghiệp Sinh Thái Long Khánh',
    certifications: ['VietGAP Chuỗi Cung Ứng', 'Không Ngâm Thuốc Kích Chín'],
    inStock: true
  },
  {
    id: 'prod-chomchom-nhan',
    name: 'Chôm Chôm Nhãn Long Khánh Giòn Ngọt',
    price: 45000,
    unit: 'kg (chùm quả tươi thu hái trong ngày)',
    cooperativeName: 'HTX Nông Nghiệp Sinh Thái Long Khánh',
    certifications: ['VietGAP Canh Tác'],
    inStock: true
  },
  {
    id: 'prod-hatdieu-rangcui',
    name: 'Hạt Điều Rang Củi Vỏ Lụa Đồng Nai (HACCP)',
    price: 165000,
    unit: 'hũ 500g (hút chân không)',
    cooperativeName: 'Tổ Hợp Tác Chế Biến Điều Định Quán & Bù Đăng',
    certifications: ['HACCP Chuẩn Quốc Tế', 'ISO 22000'],
    inStock: true
  }
];

const VERIFIED_BATCHES = [
  {
    batchCode: 'BATCH-BUOI-TANTRIEU-2026-01',
    productName: 'Bưởi Đường Lá Cam Tân Triều (OCOP 4 Sao)',
    farmingArea: 'Liếp số 04, Cù Lao Tân Triều, Vĩnh Cửu, Thành phố Đồng Nai',
    farmingProcess: 'Bón phân hữu cơ vi sinh, tưới ngập phù sa sông Đồng Nai theo quy chuẩn VietGAP',
    certifications: ['OCOP 4 Sao', 'VietGAP Trồng trọt'],
    testedStatus: 'PASSED (Không phát hiện dư lượng BVTV theo TCVN)'
  },
  {
    batchCode: 'BATCH-SAURIENG-LONGKHANH-2026-01',
    productName: 'Sầu Riêng Ri6 Long Khánh (Chín Cây Tự Nhiên)',
    farmingArea: 'Vườn thực nghiệm Xuân Lập, Thành phố Đồng Nai',
    farmingProcess: 'Neo cuống bằng dây chuyên dụng, thu hoạch đúng độ già chín tự nhiên, không ngâm thuốc',
    certifications: ['VietGAP Canh Tác Sinh Thái'],
    testedStatus: 'PASSED'
  },
  {
    batchCode: 'BATCH-HATDIEU-DONGNAI-2026-01',
    productName: 'Hạt Điều Rang Củi Vỏ Lụa Đồng Nai',
    farmingArea: 'Khu vực chế biến nông sản sạch Định Quán & Bù Đăng, Thành phố Đồng Nai',
    farmingProcess: 'Phân loại thủ công kích cỡ chuẩn W240, rang củi tự nhiên giữ vỏ lụa',
    certifications: ['HACCP Tiêu Chuẩn Quốc Tế'],
    testedStatus: 'PASSED'
  }
];

// Helper to calculate strict budget combo on server
function computeBudgetCombo(budget: number, excludeCashew: boolean = false) {
  let available = VERIFIED_PRODUCTS.filter(p => !excludeCashew || !p.name.toLowerCase().includes('điều'));
  let remaining = budget;
  let selected: any[] = [];

  for (const prod of available) {
    if (remaining >= prod.price) {
      const maxQty = Math.floor(remaining / prod.price);
      const qty = Math.min(maxQty, 2);
      if (qty > 0) {
        const itemTotal = qty * prod.price;
        remaining -= itemTotal;
        selected.push({
          id: prod.id,
          name: prod.name,
          price: prod.price,
          unit: prod.unit,
          quantity: qty,
          total: itemTotal,
          cooperativeName: prod.cooperativeName
        });
      }
    }
  }

  const totalCost = selected.reduce((s, i) => s + i.total, 0);

  return {
    items: selected,
    totalCost,
    remainingBudget: budget - totalCost
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ success: false, error: 'Tin nhắn không hợp lệ' }, { status: 400 });
    }

    const query = message.trim();
    const lowerQuery = query.toLowerCase();

    // Guardrail: Length check (prevent abuse)
    if (query.length > 1000) {
      return NextResponse.json(
        { success: false, error: 'Tin nhắn quá dài (tối đa 1000 ký tự)' },
        { status: 400 }
      );
    }

    // Guardrail: Medical and curative safety
    const medicalWords = ['chữa bệnh', 'trị bệnh', 'ung thư', 'khỏi bệnh', 'tiểu đường', 'thần dược', 'thuốc'];
    if (medicalWords.some(w => lowerQuery.includes(w))) {
      return NextResponse.json({
        success: true,
        data: {
          reply: 'Dạ, nông sản tươi như Bưởi đường lá cam Tân Triều và Chôm chôm Long Khánh rất giàu Vitamin C, chất xơ tự nhiên và chất chống oxy hóa tốt cho sức khỏe và hệ miễn dịch. Tuy nhiên, theo quy định an toàn thực phẩm và y khoa, nông sản là thực phẩm dinh dưỡng bổ dưỡng hàng ngày, không thể thay thế thuốc chữa bệnh hay phác đồ điều trị y tế của bác sĩ ạ!',
          intent: 'MEDICAL_SAFETY_GUARDRAIL',
          mode: 'verified_rules',
          toolsUsed: ['medical_safety_filter'],
          suggestedPrompts: [
            'Hàm lượng dinh dưỡng của Bưởi Tân Triều?',
            'Tư vấn combo quà biếu tốt cho sức khỏe 500k',
            'Nông sản đạt chuẩn VietGAP tại Đồng Nai'
          ]
        }
      });
    }

    // Check for DeepSeek API Key on server side
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    const deepseekModel = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

    // If DeepSeek API Key is configured on the server, call DeepSeek HTTPS API
    if (deepseekApiKey && deepseekApiKey.trim() !== '') {
      try {
        const systemPrompt = `Bạn là Trợ lý Nông Sản & Bán Hàng Thông Minh trực thuộc nền tảng CropNet Đồng Nai AI (cuộc thi AI Digital Business Challenge 2026 DiGiFest).
Mục tiêu của bạn là tư vấn thân thiện, chuẩn xác bằng tiếng Việt về nông sản Thành phố Đồng Nai dựa trên dữ liệu đã xác thực:
1. Bưởi Đường Lá Cam Tân Triều (OCOP 4 sao, 85.000đ/quả) và Bưởi Da Xanh Tân Triều (75.000đ/quả) từ HTX Nông Nghiệp Dịch Vụ Tân Triều.
2. Sầu Riêng Ri6 Long Khánh (chín cây tự nhiên, không ngâm thuốc, 135.000đ/kg) và Chôm Chôm Nhãn Long Khánh (45.000đ/kg) từ HTX Nông Nghiệp Sinh Thái Long Khánh.
3. Hạt Điều Rang Củi Vỏ Lụa Đồng Nai (HACCP, 165.000đ/hũ 500g) từ Tổ Hợp Tác Chế Biến Điều Định Quán & Bù Đăng.
4. Lô hàng QR có thật: BATCH-BUOI-TANTRIEU-2026-01, BATCH-SAURIENG-LONGKHANH-2026-01, BATCH-HATDIEU-DONGNAI-2026-01.

QUY TẮC CỐT LÕI:
- Tuyệt đối trung thực, không bịa đặt chứng chỉ hoặc kết quả kiểm nghiệm nếu chưa có trong dữ liệu.
- Khi người dùng đưa ngân sách (ví dụ: 300k, 500k, 1 triệu), luôn tính toán gợi ý sao cho TỔNG TIỀN <= NGÂN SÁCH.
- Tuyệt đối không tư vấn nông sản làm thuốc chữa bệnh nan y (tuân thủ an toàn y tế).
- Giọng văn thanh lịch, mộc mạc, tôn vinh công sức của bà con nông dân và hợp tác xã Đồng Nai.`;

        const messages = [
          { role: 'system', content: systemPrompt },
          ...history.slice(-6).map((h: any) => ({
            role: h.role === 'user' ? 'user' : 'assistant',
            content: h.content
          })),
          { role: 'user', content: query }
        ];

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${deepseekApiKey}`
          },
          body: JSON.stringify({
            model: deepseekModel,
            messages,
            temperature: 0.7,
            max_tokens: 800
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const result = await response.json();
          const reply = result.choices?.[0]?.message?.content || 'Dạ chào bạn, mình có thể hỗ trợ gì về nông sản Đồng Nai ạ?';

          return NextResponse.json({
            success: true,
            data: {
              reply,
              intent: 'AI_CHAT_COMPLETION',
              mode: 'live_ai',
              model: deepseekModel,
              toolsUsed: ['deepseek_live_api', 'dongnai_fact_grounding'],
              suggestedPrompts: [
                'Tư vấn combo quà biếu 500k',
                'Xem nguồn gốc lô bưởi Tân Triều',
                'Sầu riêng Ri6 Long Khánh khi nào ngon nhất?'
              ]
            }
          });
        } else {
          console.warn(`DeepSeek API returned status ${response.status}. Falling back to verified rules engine.`);
        }
      } catch (apiError: any) {
        console.warn('DeepSeek API call failed or timed out:', apiError.message);
      }
    }

    // Deterministic Verified Rules Engine (Transparent fail-safe mode)
    // Intent 1: Budget Recommendation
    const budgetMatch = lowerQuery.match(/(\d+)\s*(k|nghìn|ngàn|triệu|tr)/i) || lowerQuery.match(/(\d+[\d\.,]*)\s*đ/i);
    const isBudgetIntent = lowerQuery.includes('ngân sách') || lowerQuery.includes('combo') || lowerQuery.includes('tư vấn gói') || (lowerQuery.includes('mua') && budgetMatch);

    if (isBudgetIntent) {
      let budgetAmount = 500000;
      if (budgetMatch) {
        const num = parseInt(budgetMatch[1].replace(/[\.,]/g, ''), 10);
        const unit = (budgetMatch[2] || '').toLowerCase();
        if (unit === 'k' || unit === 'nghìn' || unit === 'ngàn') {
          budgetAmount = num * 1000;
        } else if (unit === 'triệu' || unit === 'tr') {
          budgetAmount = num * 1000000;
        } else {
          budgetAmount = num;
        }
      }

      const excludeCashew = lowerQuery.includes('không hạt điều') || lowerQuery.includes('dị ứng hạt');
      const combo = computeBudgetCombo(budgetAmount, excludeCashew);

      const formattedBudget = new Intl.NumberFormat('vi-VN').format(budgetAmount);
      const formattedTotal = new Intl.NumberFormat('vi-VN').format(combo.totalCost);
      const formattedRemaining = new Intl.NumberFormat('vi-VN').format(combo.remainingBudget);

      let reply = `Dạ chào bạn! Dựa trên danh mục nông sản sạch Thành phố Đồng Nai đã xác thực, với ngân sách ${formattedBudget}đ, CropNet gợi ý gói sản phẩm tối ưu nhất:\n\n`;
      combo.items.forEach((item, idx) => {
        reply += `${idx + 1}. **${item.name}** x ${item.quantity} ${item.unit} (${new Intl.NumberFormat('vi-VN').format(item.total)}đ)\n   Nguồn: ${item.cooperativeName}\n`;
      });
      reply += `\n**Tổng giá trị:** ${formattedTotal}đ (Còn dư ${formattedRemaining}đ trong ngân sách)\n`;
      reply += `*Ghi chú:* Sản phẩm thu hoạch trực tiếp từ Hợp tác xã Tân Triều và Long Khánh, có tem QR truy xuất minh bạch từng mã lô.`;

      return NextResponse.json({
        success: true,
        data: {
          reply,
          intent: 'BUDGET_RECOMMENDATION',
          mode: 'verified_rules',
          toolsUsed: ['computeBudgetCombo', 'getFactProducts'],
          recommendedProducts: combo.items,
          actionLink: {
            label: 'Xem chi tiết các sản phẩm',
            url: '/products'
          },
          suggestedPrompts: [
            'Có bưởi OCOP Tân Triều không?',
            'Xem nguồn gốc lô bưởi Tân Triều',
            'Thời gian thu hoạch sầu riêng Long Khánh?'
          ]
        }
      });
    }

    // Intent 2: Traceability & QR
    if (lowerQuery.includes('truy xuất') || lowerQuery.includes('mã lô') || lowerQuery.includes('qr') || lowerQuery.includes('batch-')) {
      const match = query.match(/BATCH-[A-Z0-9\-]+/i);
      const batchCode = match ? match[0].toUpperCase() : null;

      if (batchCode) {
        const found = VERIFIED_BATCHES.find(b => b.batchCode === batchCode);
        if (found) {
          return NextResponse.json({
            success: true,
            data: {
              reply: `Dạ mã lô **${found.batchCode}** đã được xác thực trên hệ thống truy xuất nguồn gốc CropNet Đồng Nai AI:\n\n- **Sản phẩm:** ${found.productName}\n- **Vùng canh tác:** ${found.farmingArea}\n- **Quy trình:** ${found.farmingProcess}\n- **Chứng nhận:** ${found.certifications.join(', ')}\n- **Kiểm định:** ${found.testedStatus}`,
              intent: 'TRACEABILITY_VERIFIED',
              mode: 'verified_rules',
              toolsUsed: ['getFactBatches'],
              actionLink: {
                label: `Xem chứng thư số lô ${found.batchCode}`,
                url: `/traceability/${found.batchCode}`
              }
            }
          });
        } else {
          return NextResponse.json({
            success: true,
            data: {
              reply: `Cảnh báo an toàn: Mã lô **${batchCode}** không tìm thấy trên hệ thống cơ sở dữ liệu nông nghiệp Thành phố Đồng Nai. Để bảo vệ quyền lợi người tiêu dùng và thương hiệu đặc sản địa phương, CropNet khuyến cáo bạn kiểm tra kỹ tem nhãn hoặc liên hệ trực tiếp nhà vườn.`,
              intent: 'TRACEABILITY_NOT_FOUND',
              mode: 'verified_rules',
              toolsUsed: ['getFactBatches']
            }
          });
        }
      }
    }

    // Default Greeting & Product Overview
    return NextResponse.json({
      success: true,
      data: {
        reply: `Chào bạn! Mình là Trợ lý Nông Sản & Bán Hàng Thông Minh trực thuộc nền tảng **CropNet Đồng Nai AI** (AI Digital Business Challenge 2026).\n\nHệ thống hỗ trợ bạn:\n1. **Tối ưu combo nông sản theo ngân sách** (Ví dụ: "Tư vấn quà biếu 500k", "Combo hoa quả gia đình 300k, không hạt điều")\n2. **Tra cứu tem QR truy xuất nguồn gốc** lô bưởi Tân Triều, sầu riêng Long Khánh, hạt điều Đồng Nai\n3. **Tra cứu lịch mùa vụ & bản đồ vùng trồng số**\n\nBạn cần mình hỗ trợ thông tin gì hôm nay ạ?`,
        intent: 'GENERAL_GREETING',
        mode: 'verified_rules',
        toolsUsed: ['dongnai_fact_grounding'],
        suggestedPrompts: [
          'Tư vấn combo quà biếu 500k',
          'Tra cứu BATCH-BUOI-TANTRIEU-2026-01',
          'Sầu riêng Ri6 Long Khánh khi nào chín rộ?'
        ]
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
