import { VERIFIED_PRODUCTS, VERIFIED_BATCHES } from '../data/catalog';

export interface Citation {
  sourceId: string;
  title: string;
  url: string;
  publisher: string;
}

export interface RagResponse {
  success: boolean;
  reply: string;
  intent: string;
  answerType: 'grounded' | 'refusal' | 'guardrail' | 'calculation' | 'greeting';
  citations: Citation[];
  suggestions: string[];
  actionLink?: { label: string; url: string };
  confidence: 'high' | 'medium' | 'low';
  mode: 'live_deepseek' | 'verified_rag_engine';
}

export function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

// Verified knowledge documents
const KNOWLEDGE_DOCS = [
  {
    id: 'KNOW-DN-01',
    topic: 'Bưởi Đường Lá Cam Tân Triều',
    keywords: ['buoi', 'duong la cam', 'tan trieu', 'vinh cuu', 'ocop 4 sao', 'chi dan dia ly 00031'],
    content: 'Bưởi đường lá cam Tân Triều là giống bưởi đặc sản bản địa Cù lao Tân Triều, xã Tân Bình, huyện Vĩnh Cửu, Thành phố Đồng Nai. Nhờ phù sa sông Đồng Nai bồi đắp, bưởi có vỏ mỏng vàng khi chín, tép mọng nước vàng óng, vị ngọt thanh sâu lắng không the đắng. Sản phẩm được bảo hộ Chỉ dẫn địa lý Bưởi Tân Triều số 00031 năm 2012 và đạt chứng nhận OCOP 4 sao do HTX Nông nghiệp Dịch vụ Tân Triều sản xuất theo chuẩn VietGAP.',
    sourceId: 'SRC-DN-01',
    sourceUrl: 'https://dongnai.gov.vn/vi/news/tin-hoat-dong-linh-vuc-nganh/xay-dung-san-pham-du-lich-tieu-bieu-dau-tien-cua-dong-nai-56129.html',
    publisher: 'Cổng thông tin điện tử tỉnh Đồng Nai'
  },
  {
    id: 'KNOW-DN-02',
    topic: 'Bưởi Da Xanh Trồng Tại Tân Triều',
    keywords: ['buoi da xanh', 'da xanh tan trieu', 'ruot hong', 'vinh cuu', 'vietgap'],
    content: 'Bưởi da xanh được canh tác trên đất cù lao Tân Triều bởi HTX Nông nghiệp Dịch vụ Tân Triều, có vỏ xanh bóng, ruột hồng đào, tép giòn ngọt thanh và ít hạt. Lưu ý pháp lý: Chỉ dẫn địa lý Bưởi Tân Triều 2012 số 00031 bảo hộ cho bưởi đường lá cam và bưởi ổi; bưởi da xanh trồng tại Tân Triều đạt chuẩn VietGAP của HTX Tân Triều, không gán chung chỉ dẫn địa lý đường lá cam.',
    sourceId: 'SRC-DN-02',
    sourceUrl: 'https://baodongnai.com.vn/kham-pha-dong-nai202605/tu-cu-lao-xanh-den-thuong-hieu-dac-san-3751d02/',
    publisher: 'Báo Đồng Nai'
  },
  {
    id: 'KNOW-DN-03',
    topic: 'Sầu Riêng Ri6 Long Khánh Chín Cây Tự Nhiên',
    keywords: ['sau rieng', 'ri6', 'long khanh', 'xuan lap', 'chin cay', 'khong ngam thuoc', 'vietgap'],
    content: 'Sầu riêng Ri6 Long Khánh canh tác trên đất đỏ bazan tại phường Xuân Lập và xã Bình Lộc. HTX Nông nghiệp - Thương mại - Dịch vụ Xuân Lập thực hiện quy trình neo cuống từng trái chín già tự nhiên, cam kết 100% không thu hái quả non và không dùng thuốc kích chín hóa chất, đạt chuẩn VietGAP chuỗi an toàn thực phẩm.',
    sourceId: 'SRC-DN-06',
    sourceUrl: 'https://longkhanh.dongnai.gov.vn/vi/news/tin-hoat-dong-cua-hdnd-ubnd/trien-khai-chuong-trinh-moi-xa-mot-san-pham-ocop-tren-dia-ban-nam-2026-559.html',
    publisher: 'UBND Thành phố Long Khánh'
  },
  {
    id: 'KNOW-DN-04',
    topic: 'Chôm Chôm Nhãn Long Khánh Giòn Ngọt',
    keywords: ['chom chom', 'chom chom nhan', 'long khanh', 'binh loc', 'chi dan dia ly 00080'],
    content: 'Chôm chôm Long Khánh đã được Cục Sở hữu trí tuệ cấp Giấy chứng nhận đăng ký chỉ dẫn địa lý số 00080. Giống chôm chôm nhãn trồng tại xã Bình Lộc có quả tròn nhỏ, râu ngắn, vỏ vàng ửng đỏ, cùi dày giòn tróc hạt và ngọt lịm. HTX Nông nghiệp - Dịch vụ - Thương mại Bình Lộc là chủ thể liên kết tiêu thụ đạt chuẩn VietGAP.',
    sourceId: 'SRC-DN-04',
    sourceUrl: 'https://binhloc.dongnai.gov.vn/vi/news/thong-tin-du-lich/kham-pha-thu-phu-trai-cay-o-dong-nai-460.html',
    publisher: 'UBND Xã Bình Lộc'
  },
  {
    id: 'KNOW-DN-05',
    topic: 'Hạt Điều Rang Củi Vỏ Lụa Đồng Nai',
    keywords: ['hat dieu', 'rang cui', 'vo lua', 'dinh quan', 'haccp', 'dong nai'],
    content: 'Đồng Nai là thủ phủ chế biến hạt điều với vùng nguyên liệu tại Định Quán và Đông Nam Bộ. Hạt điều rang củi thủ công giữ nguyên lớp vỏ lụa bùi béo tự nhiên, phân loại chuẩn W240 và kiểm soát an toàn đạt chứng nhận quốc tế HACCP Codex và ISO 22000.',
    sourceId: 'SRC-DN-07',
    sourceUrl: 'https://sct.dongnai.gov.vn/vi/news/Chi-dao-dieu-hanh/dong-nai-dac-san-che-bien-thu-cong-hut-hang-51607.html',
    publisher: 'Sở Công Thương Đồng Nai'
  },
  {
    id: 'KNOW-DN-06',
    topic: 'Rượu Bưởi Truyền Thống Năm Huệ Tân Triều',
    keywords: ['ruou buoi', 'nam hue', 'tan trieu', 'len men', 'binh gom', 'ocop 3 sao'],
    content: 'Rượu bưởi Tân Triều lên men tự nhiên từ nước cốt bưởi đường lá cam cù lao Tân Triều, ủ trong bình gốm nung thủ công. Nồng độ dịu 14-18 độ, hương thơm thanh khiết, đạt chuẩn OCOP 3 sao tỉnh Đồng Nai.',
    sourceId: 'SRC-DN-02',
    sourceUrl: 'https://baodongnai.com.vn/kham-pha-dong-nai202605/tu-cu-lao-xanh-den-thuong-hieu-dac-san-3751d02/',
    publisher: 'Báo Đồng Nai'
  },
  {
    id: 'KNOW-DN-07',
    topic: 'Tiêu Đen Chân Núi Chứa Chan Xuân Lộc',
    keywords: ['tieu den', 'ho tieu', 'xuan loc', 'nui chua chan', 'bazan'],
    content: 'Hạt tiêu đen Xuân Lộc sinh trưởng trên vùng đồi đá bazan chân núi Chứa Chan, hạt mẩy chắc, cay nồng đậm đà và phơi sấy tự nhiên theo chuỗi nông sản an toàn vệ sinh thực phẩm.',
    sourceId: 'SRC-DN-08',
    sourceUrl: 'https://xuanloc.dongnai.gov.vn/vi/news/kinh-te-moi-truong/xuan-loc-trien-khai-ke-hoach-phat-trien-san-pham-ocop-nam-2026-900.html',
    publisher: 'UBND Huyện Xuân Lộc'
  }
];

// Helper: Calculate strictly bounded budget combo
export function computeBudgetCombo(budget: number, excludeCashew: boolean = false) {
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
          cooperativeName: prod.supplier.farmName
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

// Core RAG Pipeline Handler
export async function executeRagPipeline(
  query: string,
  history: { role: string; content: string }[] = []
): Promise<RagResponse> {
  const cleanQuery = query.trim();
  const lowerQuery = cleanQuery.toLowerCase();
  const normQuery = removeVietnameseTones(cleanQuery);

  // Guardrail 1: Medical / curative claim safety filter
  const medicalWords = ['chua benh', 'tri benh', 'ung thu', 'tieu duong', 'than duoc', 'khoi benh', 'thay the thuoc'];
  if (medicalWords.some(w => normQuery.includes(w))) {
    return {
      success: true,
      reply: 'Dạ nông sản sạch như Bưởi đường lá cam Tân Triều và Chôm chôm Long Khánh rất giàu Vitamin C, chất xơ và chất chống oxy hóa tự nhiên tốt cho sức đề kháng hàng ngày. Tuy nhiên, theo quy định an toàn y tế và sức khỏe, nông sản là thực phẩm bổ sung dinh dưỡng, hoàn toàn không phải là thuốc và không thể thay thế phác đồ điều trị của bác sĩ ạ!',
      intent: 'MEDICAL_SAFETY_GUARDRAIL',
      answerType: 'guardrail',
      citations: [
        {
          sourceId: 'SRC-DN-02',
          title: 'Khám phá cù lao Tân Triều và giá trị dinh dưỡng nông sản',
          url: 'https://baodongnai.com.vn',
          publisher: 'Báo Đồng Nai'
        }
      ],
      suggestions: [
        'Hàm lượng dinh dưỡng của Bưởi Tân Triều?',
        'Tư vấn combo quà biếu tốt cho sức khỏe 500k',
        'Nông sản đạt chuẩn VietGAP tại Đồng Nai'
      ],
      confidence: 'high',
      mode: 'verified_rag_engine'
    };
  }

  // Guardrail 2: Foreign province / non-Dong Nai origin rejection
  const foreignPlaces = [
    { name: 'Cái Mơn', province: 'Bến Tre', alt: 'Bưởi Đường Lá Cam Tân Triều' },
    { name: 'Vĩnh Long', province: 'Vĩnh Long', alt: 'Sầu Riêng Ri6 Long Khánh' },
    { name: 'Đà Lạt', province: 'Lâm Đồng', alt: 'Trái cây sạch Đồng Nai' },
    { name: 'Bắc Giang', province: 'Bắc Giang', alt: 'Chôm Chôm Nhãn Long Khánh' },
    { name: 'Ninh Thuận', province: 'Ninh Thuận', alt: 'Nông sản Đồng Nai' }
  ];

  for (const fp of foreignPlaces) {
    if (lowerQuery.includes(fp.name.toLowerCase()) || normQuery.includes(removeVietnameseTones(fp.name))) {
      return {
        success: true,
        reply: `Dạ chào bạn! Nền tảng **CropNet Đồng Nai AI** tuân thủ nguyên tắc địa giới nghiêm ngặt: chỉ niêm yết và phục vụ nông sản có xuất xứ canh tác, thu hoạch hoặc chế biến thực tế tại **Thành phố Đồng Nai**.\n\nSản phẩm từ **${fp.name} (${fp.province})** nằm ngoài phạm vi hoạt động của CropNet. Để thưởng thức đặc sản chất lượng cao của địa phương, bạn có thể tham khảo **${fp.alt}** được HTX bảo chứng nguồn gốc rõ ràng ạ!`,
        intent: 'OUT_OF_SCOPE',
        answerType: 'refusal',
        citations: [
          {
            sourceId: 'SRC-DN-09',
            title: 'Quyết định phân hạng OCOP và quy chuẩn xuất xứ tỉnh Đồng Nai',
            url: 'https://dongnai.gov.vn',
            publisher: 'UBND Tỉnh Đồng Nai'
          }
        ],
        suggestions: [
          'Xem danh mục Bưởi Tân Triều chính gốc',
          'Xem Sầu riêng Ri6 Long Khánh chín cây',
          'Tra cứu bản đồ vùng trồng số Đồng Nai'
        ],
        actionLink: {
          label: 'Xem nông sản Đồng Nai chính gốc',
          url: '/products'
        },
        confidence: 'high',
        mode: 'verified_rag_engine'
      };
    }
  }

  // Guardrail 3: Traceability QR / Batch lookup
  if (lowerQuery.includes('truy xuat') || lowerQuery.includes('ma lo') || lowerQuery.includes('qr') || lowerQuery.includes('batch-')) {
    const match = cleanQuery.match(/BATCH-[A-Z0-9\-]+/i);
    const batchCode = match ? match[0].toUpperCase() : null;

    if (batchCode) {
      const found = VERIFIED_BATCHES[batchCode];
      if (found) {
        const certNames = found.certifications.map(c => c.name).join(', ');
        return {
          success: true,
          reply: `Dạ mã lô **${found.batchCode}** đã được xác thực chính thức trên hệ thống truy xuất số CropNet Đồng Nai:\n\n- **Sản phẩm:** ${found.productName}\n- **Chủ thể sản xuất:** ${found.supplier.farmName}\n- **Vùng canh tác:** ${found.farmingArea}\n- **Quy trình:** ${found.farmingProcess}\n- **Chứng nhận:** ${certNames}\n- **Kết quả kiểm định:** ${found.testedStatus}`,
          intent: 'TRACEABILITY_VERIFIED',
          answerType: 'grounded',
          citations: [
            {
              sourceId: found.certifications[0]?.id || 'SRC-DN-01',
              title: found.certifications[0]?.name || 'Hồ sơ truy xuất số lô hàng',
              url: `https://cropnetkhoaduc.vercel.app/traceability/${found.batchCode}`,
              publisher: found.certifications[0]?.issuer || 'Sở NN&PTNT Đồng Nai'
            }
          ],
          suggestions: [
            `Xem chứng thư số của lô ${found.batchCode}`,
            'Các lô bưởi Tân Triều vụ mới',
            'Quy trình kiểm định dư lượng nông sản'
          ],
          actionLink: {
            label: `Xem chứng thư số lô ${found.batchCode}`,
            url: `/traceability/${found.batchCode}`
          },
          confidence: 'high',
          mode: 'verified_rag_engine'
        };
      } else {
        return {
          success: true,
          reply: `⚠️ **Cảnh báo an toàn dữ liệu:** Mã lô **${batchCode}** không tồn tại hoặc chưa được xác thực trên hệ thống cơ sở dữ liệu nông nghiệp Thành phố Đồng Nai.\n\nĐể bảo vệ quyền lợi người tiêu dùng và thương hiệu đặc sản bản địa, CropNet không tự động cấp chứng chỉ giả mạo. Vui lòng kiểm tra lại tem QR trên bao bì hoặc liên hệ trực tiếp Hợp tác xã ạ!`,
          intent: 'TRACEABILITY_NOT_FOUND',
          answerType: 'refusal',
          citations: [],
          suggestions: [
            'Tra cứu BATCH-BUOI-TANTRIEU-2026-01',
            'Tra cứu BATCH-SAURIENG-LONGKHANH-2026-01',
            'Tra cứu BATCH-HATDIEU-DONGNAI-2026-01'
          ],
          confidence: 'high',
          mode: 'verified_rag_engine'
        };
      }
    }
  }

  // Guardrail 4: Budget combo recommendation
  const budgetMatch = lowerQuery.match(/(\d+)\s*(k|nghìn|ngàn|triệu|tr)/i) || lowerQuery.match(/(\d+[\d\.,]*)\s*đ/i);
  const isBudgetIntent = lowerQuery.includes('ngan sach') || lowerQuery.includes('combo') || lowerQuery.includes('tu van goi') || (lowerQuery.includes('mua') && budgetMatch);

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

    const excludeCashew = normQuery.includes('khong hat dieu') || normQuery.includes('di ung hat');
    const combo = computeBudgetCombo(budgetAmount, excludeCashew);

    const formattedBudget = new Intl.NumberFormat('vi-VN').format(budgetAmount);
    const formattedTotal = new Intl.NumberFormat('vi-VN').format(combo.totalCost);
    const formattedRemaining = new Intl.NumberFormat('vi-VN').format(combo.remainingBudget);

    let reply = `Dạ chào bạn! Dựa trên danh mục nông sản sạch Thành phố Đồng Nai đã xác thực, với ngân sách **${formattedBudget}đ**, CropNet gợi ý gói tối ưu:\n\n`;
    combo.items.forEach((item, idx) => {
      reply += `${idx + 1}. **${item.name}** x ${item.quantity} ${item.unit} (${new Intl.NumberFormat('vi-VN').format(item.total)}đ)\n   Nguồn: ${item.cooperativeName}\n`;
    });
    reply += `\n**Tổng chi phí:** ${formattedTotal}đ (Còn dư ${formattedRemaining}đ trong ngân sách)\n`;
    reply += `*Cam kết:* Toàn bộ sản phẩm được thu hoạch trực tiếp từ Hợp tác xã Tân Triều, Xuân Lập và Bình Lộc, có mã QR truy xuất minh bạch từng lô.`;

    return {
      success: true,
      reply,
      intent: 'BUDGET_RECOMMENDATION',
      answerType: 'calculation',
      citations: [
        {
          sourceId: 'SRC-DN-01',
          title: 'Danh mục nông sản OCOP và giá niêm yết HTX Đồng Nai',
          url: 'https://dongnai.gov.vn',
          publisher: 'Sở NN&PTNT Đồng Nai'
        }
      ],
      suggestions: [
        'Có bưởi OCOP Tân Triều không?',
        'Xem nguồn gốc lô bưởi Tân Triều',
        'Thời gian thu hoạch sầu riêng Long Khánh?'
      ],
      actionLink: {
        label: 'Xem chi tiết các sản phẩm trong combo',
        url: '/products'
      },
      confidence: 'high',
      mode: 'verified_rag_engine'
    };
  }

  // RAG: Retrieval from Knowledge Base
  let scoredDocs = KNOWLEDGE_DOCS.map(doc => {
    let score = 0;
    for (const kw of doc.keywords) {
      if (normQuery.includes(kw)) score += 2;
    }
    const topicNorm = removeVietnameseTones(doc.topic);
    if (normQuery.includes(topicNorm)) score += 4;
    return { doc, score };
  }).filter(item => item.score > 0);

  scoredDocs.sort((a, b) => b.score - a.score);
  const topDocs = scoredDocs.slice(0, 3).map(i => i.doc);

  // If DeepSeek API key is present in environment, query DeepSeek with grounded context
  const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
  const deepseekModel = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

  if (deepseekApiKey && deepseekApiKey.trim() !== '') {
    try {
      const retrievedContext = topDocs.length > 0
        ? topDocs.map(d => `[Nguồn: ${d.topic}] ${d.content}`).join('\n\n')
        : 'Nông sản Đồng Nai gồm: Bưởi Đường Lá Cam Tân Triều (OCOP 4 sao), Bưởi Da Xanh Tân Triều, Sầu Riêng Ri6 Long Khánh (chín cây tự nhiên), Chôm Chôm Nhãn Long Khánh (chỉ dẫn địa lý 00080), Hạt Điều Rang Củi Vỏ Lụa Định Quán (HACCP), Rượu Bưởi Tân Triều.';

      const systemPrompt = `Bạn là Trợ lý Nông Sản & Bán Hàng Thông Minh trực thuộc nền tảng CropNet Đồng Nai AI (Niên vụ 2026).
Bạn tư vấn thân thiện, chuẩn xác bằng tiếng Việt về nông sản Thành phố Đồng Nai dựa trên tri thức đã xác thực:
${retrievedContext}

QUY TẮC CỐT LÕI BẮT BUỘC:
1. Tuyệt đối trung thực, không bịa đặt chứng chỉ hoặc kết quả kiểm nghiệm nếu chưa có trong dữ liệu.
2. Chỉ tư vấn nông sản thuộc địa bàn Đồng Nai (Tân Triều, Long Khánh, Bình Lộc, Xuân Lập, Định Quán, Xuân Lộc). Từ chối hàng ngoại tỉnh (Cái Mơn, Vĩnh Long, Đà Lạt).
3. Tuyệt đối không tư vấn nông sản làm thuốc chữa bệnh nan y (tuân thủ an toàn y tế).
4. Khi người dùng đưa ngân sách, luôn tính toán sao cho tổng tiền <= ngân sách.
5. Giọng văn thanh lịch, mộc mạc, tôn vinh công sức của bà con nông dân và hợp tác xã Đồng Nai.`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.slice(-6).map((h: any) => ({
          role: h.role === 'user' ? 'user' : 'assistant',
          content: h.content
        })),
        { role: 'user', content: cleanQuery }
      ];

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${deepseekApiKey}`
        },
        body: JSON.stringify({
          model: deepseekModel,
          messages,
          temperature: 0.25,
          max_tokens: 800
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        const reply = result.choices?.[0]?.message?.content || 'Dạ chào bạn, mình có thể hỗ trợ gì về nông sản Đồng Nai ạ?';

        const citations: Citation[] = topDocs.map(d => ({
          sourceId: d.sourceId,
          title: d.topic,
          url: d.sourceUrl,
          publisher: d.publisher
        }));

        return {
          success: true,
          reply,
          intent: 'KNOWLEDGE',
          answerType: 'grounded',
          citations,
          suggestions: [
            'Bưởi Tân Triều có những giống nào?',
            'Sầu riêng Long Khánh khi nào chín rộ?',
            'Tư vấn combo quà biếu 500k'
          ],
          confidence: 'high',
          mode: 'live_deepseek'
        };
      }
    } catch (apiError: any) {
      console.warn('DeepSeek live API error, using verified RAG fallback:', apiError.message);
    }
  }

  // Grounded Deterministic RAG Fallback
  if (topDocs.length > 0) {
    const primary = topDocs[0];
    return {
      success: true,
      reply: `Dạ chào bạn! Thông tin về **${primary.topic}** từ dữ liệu nông nghiệp Tỉnh Đồng Nai đã xác thực:\n\n${primary.content}`,
      intent: 'KNOWLEDGE',
      answerType: 'grounded',
      citations: [
        {
          sourceId: primary.sourceId,
          title: primary.topic,
          url: primary.sourceUrl,
          publisher: primary.publisher
        }
      ],
      suggestions: [
        'Xem nguồn gốc lô bưởi Tân Triều',
        'Tư vấn combo quà biếu 500k',
        'Tra cứu vùng chuyên canh trên bản đồ'
      ],
      actionLink: {
        label: 'Xem chi tiết sản phẩm trên sàn',
        url: '/products'
      },
      confidence: 'high',
      mode: 'verified_rag_engine'
    };
  }

  // Default Greeting
  return {
    success: true,
    reply: `Chào bạn! Mình là Trợ lý Nông Sản & Bán Hàng Thông Minh trực thuộc nền tảng **CropNet Đồng Nai AI** (Niên vụ 2026).\n\nHệ thống hỗ trợ bạn:\n1. **Tư vấn đặc sản bản địa Đồng Nai:** Bưởi đường lá cam Tân Triều, Sầu riêng Ri6 Long Khánh chín cây, Chôm chôm nhãn Bình Lộc, Hạt điều rang củi Định Quán\n2. **Tối ưu combo theo ngân sách:** (Ví dụ: "Tư vấn quà biếu 500k", "Combo hoa quả 300k không hạt điều")\n3. **Tra cứu tem QR truy xuất nguồn gốc số hóa**\n4. **Tra cứu bản đồ vùng trồng số & mùa vụ**\n\nBạn cần mình hỗ trợ thông tin gì hôm nay ạ?`,
    intent: 'GENERAL_GREETING',
    answerType: 'greeting',
    citations: [
      {
        sourceId: 'SRC-DN-01',
        title: 'Cổng thông tin xúc tiến thương mại nông sản Đồng Nai',
        url: 'https://dongnai.gov.vn',
        publisher: 'UBND Tỉnh Đồng Nai'
      }
    ],
    suggestions: [
      'Tư vấn combo quà biếu 500k',
      'Tra cứu BATCH-BUOI-TANTRIEU-2026-01',
      'Sầu riêng Ri6 Long Khánh khi nào chín rộ?'
    ],
    confidence: 'high',
    mode: 'verified_rag_engine'
  };
}
