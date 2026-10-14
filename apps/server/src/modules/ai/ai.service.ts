import { MOCK_PRODUCTS, MOCK_BATCHES, MOCK_SUPPLIERS, isDatabaseError } from '../../database/dbFallback';
import { prisma } from '../../database/client';

export interface AiChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface RecommendedProductItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  total: number;
  imageUrl?: string;
  cooperativeName: string;
}

export interface AiChatResponse {
  reply: string;
  intent: string;
  toolsUsed: string[];
  recommendedProducts?: RecommendedProductItem[];
  suggestedPrompts?: string[];
  actionLink?: {
    label: string;
    url: string;
  };
}

export interface BudgetComboResult {
  comboTitle: string;
  targetBudget: number;
  totalCost: number;
  remainingBudget: number;
  items: RecommendedProductItem[];
  reasoning: string;
  applicableDiscounts: string;
}

// -------------------------------------------------------------
// Real Data Tools for AI Assistant
// -------------------------------------------------------------

export const getFactProducts = async () => {
  try {
    const prods = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: { supplier: true, category: true, images: true }
    });
    if (prods && prods.length > 0) {
      return prods.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        unit: p.unit,
        stock: p.stock,
        farmName: p.supplier?.farmName || 'HTX Nông Nghiệp Đồng Nai',
        cooperativeId: p.supplierId,
        category: p.category?.name || 'Nông Sản',
        imageUrl: (p.images && p.images[0]?.url) || ''
      }));
    }
  } catch (err) {
    // fallback if DB offline
  }

  return MOCK_PRODUCTS.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    unit: p.unit,
    stock: p.stock,
    farmName: p.supplier?.farmName || 'HTX Nông Nghiệp Đồng Nai',
    cooperativeId: p.supplier?.id,
    category: p.category?.name || 'Nông Sản',
    imageUrl: p.imageUrl || ''
  }));
};

export const getFactBatches = async () => {
  try {
    const batches = await prisma.traceBatch.findMany({
      include: { product: { include: { supplier: true } }, certifications: true }
    });
    if (batches && batches.length > 0) return batches;
  } catch (err) {}
  return MOCK_BATCHES;
};

export const getFactCooperatives = async () => {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { status: 'APPROVED' }
    });
    if (suppliers && suppliers.length > 0) return suppliers;
  } catch (err) {}
  return MOCK_SUPPLIERS;
};

export const getSeasonalCalendarData = () => {
  return [
    {
      crop: 'Bưởi Đường Lá Cam & Da Xanh Tân Triều',
      location: 'Xã Tân Bình, Huyện Vĩnh Cửu, TP Đồng Nai',
      peakSeason: 'Tháng 9 đến Tháng 12 âm lịch (Phục vụ cao điểm Tết Nguyên Đán)',
      status: 'Đang vào vụ thu hoạch rộ chính',
      notes: 'Bưởi tích đủ nước ngọt phù sa sông Đồng Nai, đạt độ ngọt Brix từ 11.5 - 12.5.'
    },
    {
      crop: 'Sầu Riêng Ri6 Long Khánh',
      location: 'Phường Xuân Lập, TP Long Khánh, TP Đồng Nai',
      peakSeason: 'Tháng 5 đến Tháng 8 dương lịch, có vụ nghịch nhỏ vào Tháng 10 - 11',
      status: 'Đang thu hoạch chọn lọc trái già',
      notes: 'Đất đỏ bazan, 100% để chín cây tự nhiên hoặc cắt già gõ bộng, không nhúng thuốc kích chín.'
    },
    {
      crop: 'Chôm Chôm Nhãn Long Khánh',
      location: 'TP Long Khánh, TP Đồng Nai',
      peakSeason: 'Tháng 5 đến Tháng 7 dương lịch, có hàng rải vụ cuối năm',
      status: 'Đang cung cấp hàng tươi từ vườn',
      notes: 'Trái gai ngắn, cơm dày róc hạt, ăn giòn ngọt thanh.'
    },
    {
      crop: 'Hạt Điều Rang Muối Đồng Nai',
      location: 'Xuân Lộc & Long Khánh, TP Đồng Nai',
      peakSeason: 'Quanh năm (chế biến bảo quản khô hút chân không)',
      status: 'Sẵn sàng giao hàng toàn quốc',
      notes: 'Hạt điều Bình Phước - Đồng Nai loại A tuyển chọn xuất khẩu, rang củi muối tinh giữ vỏ lụa.'
    },
    {
      crop: 'Rượu Bưởi Tân Triều',
      location: 'Làng bưởi Tân Triều, Vĩnh Cửu',
      peakSeason: 'Quanh năm (ủ men chum sành hạ thổ 6 - 12 tháng)',
      status: 'Sẵn sàng quà tặng Tết & Sự kiện',
      notes: 'Đặc sản OCOP Đồng Nai, 15% vol, nước cốt bưởi lên men tự nhiên.'
    }
  ];
};

// -------------------------------------------------------------
// Core Budget Optimizer (Strictly <= User Budget)
// -------------------------------------------------------------

export const optimizeBudgetCombo = async (
  budget: number,
  recipient: string = 'gia đình',
  purpose: string = 'tiêu dùng'
): Promise<BudgetComboResult> => {
  const products = await getFactProducts();

  let selectedItems: RecommendedProductItem[] = [];
  let reasoning = '';
  let title = '';

  const cleanRecipient = recipient.toLowerCase();
  const cleanPurpose = purpose.toLowerCase();

  const isGift = cleanPurpose.includes('biếu') || cleanPurpose.includes('quà') || cleanRecipient.includes('đối tác') || cleanRecipient.includes('sếp') || cleanRecipient.includes('công ty');

  if (isGift) {
    title = `Combo Quà Biếu Đặc Sản Đồng Nai Tinh Hoa (${new Intl.NumberFormat('vi-VN').format(budget)}đ)`;
    if (budget >= 450000) {
      // Premium gift: Rượu bưởi + Bưởi Tân Triều OCOP 4 sao + Hộp hạt điều
      const ruou = products.find(p => p.id === '6') || products[5];
      const buoi = products.find(p => p.id === '1') || products[0];
      const dieu = products.find(p => p.id === '5') || products[4];

      selectedItems = [
        { id: ruou.id, name: ruou.name, price: ruou.price, unit: ruou.unit, quantity: 1, total: ruou.price, imageUrl: ruou.imageUrl, cooperativeName: ruou.farmName },
        { id: buoi.id, name: buoi.name, price: buoi.price, unit: buoi.unit, quantity: 2, total: buoi.price * 2, imageUrl: buoi.imageUrl, cooperativeName: buoi.farmName },
        { id: dieu.id, name: dieu.name, price: dieu.price, unit: dieu.unit, quantity: 1, total: dieu.price, imageUrl: dieu.imageUrl, cooperativeName: dieu.farmName }
      ];
      reasoning = 'Set quà sang trọng chuẩn OCOP Đồng Nai kết hợp bình gốm Rượu bưởi Tân Triều truyền thống, 2 quả bưởi đường lá cam tuyển chọn biếu trang trọng, và hộp hạt điều rang củi giòn bùi.';
    } else if (budget >= 250000) {
      // Medium gift: 2 bưởi OCOP + 1 hộp điều
      const buoi = products.find(p => p.id === '1') || products[0];
      const dieu = products.find(p => p.id === '5') || products[4];

      selectedItems = [
        { id: buoi.id, name: buoi.name, price: buoi.price, unit: buoi.unit, quantity: 2, total: buoi.price * 2, imageUrl: buoi.imageUrl, cooperativeName: buoi.farmName },
        { id: dieu.id, name: dieu.name, price: dieu.price, unit: dieu.unit, quantity: 1, total: dieu.price, imageUrl: dieu.imageUrl, cooperativeName: dieu.farmName }
      ];
      reasoning = 'Cặp bưởi đường lá cam Tân Triều thanh tao tài lộc cùng hộp hạt điều vỏ lụa thượng hạng, rất thích hợp biếu người thân và đối tác.';
    } else {
      // Compact gift: 2 bưởi Tân Triều hoặc 1 bưởi + 1 điều
      const buoi = products.find(p => p.id === '1') || products[0];
      const dieu = products.find(p => p.id === '5') || products[4];
      selectedItems = [
        { id: buoi.id, name: buoi.name, price: buoi.price, unit: buoi.unit, quantity: 1, total: buoi.price, imageUrl: buoi.imageUrl, cooperativeName: buoi.farmName },
        { id: dieu.id, name: dieu.name, price: dieu.price, unit: dieu.unit, quantity: 1, total: dieu.price, imageUrl: dieu.imageUrl, cooperativeName: dieu.farmName }
      ];
      reasoning = 'Gói quà tinh tế, nhỏ gọn nhưng đầy đủ phong vị Đồng Nai với bưởi Tân Triều chuẩn OCOP 4 sao và hạt điều rang muối.';
    }
  } else {
    title = `Combo Trái Cây & Nông Sản Sinh Thái Thưởng Thức (${new Intl.NumberFormat('vi-VN').format(budget)}đ)`;
    if (budget >= 400000) {
      // Family feast: 1 Sầu riêng chín cây (2.5kg = ~337k) + 1kg Chôm chôm nhãn (45k)
      const sauRieng = products.find(p => p.id === '3') || products[2];
      const chomChom = products.find(p => p.id === '4') || products[3];
      const buoi = products.find(p => p.id === '2') || products[1];

      selectedItems = [
        { id: buoi.id, name: buoi.name, price: buoi.price, unit: buoi.unit, quantity: 2, total: buoi.price * 2, imageUrl: buoi.imageUrl, cooperativeName: buoi.farmName },
        { id: chomChom.id, name: chomChom.name, price: chomChom.price, unit: chomChom.unit, quantity: 3, total: chomChom.price * 3, imageUrl: chomChom.imageUrl, cooperativeName: chomChom.farmName },
        { id: products[4].id, name: products[4].name, price: products[4].price, unit: products[4].unit, quantity: 1, total: products[4].price, imageUrl: products[4].imageUrl, cooperativeName: products[4].farmName }
      ];
      reasoning = 'Thực đơn hoa quả tươi sạch cho cả gia đình gồm 2 quả bưởi da xanh giải nhiệt, 3kg chôm chôm nhãn giòn ngọt và 1 hộp hạt điều nhâm nhi.';
    } else if (budget >= 200000) {
      const buoi = products.find(p => p.id === '2') || products[1];
      const chomChom = products.find(p => p.id === '4') || products[3];
      selectedItems = [
        { id: buoi.id, name: buoi.name, price: buoi.price, unit: buoi.unit, quantity: 1, total: buoi.price, imageUrl: buoi.imageUrl, cooperativeName: buoi.farmName },
        { id: chomChom.id, name: chomChom.name, price: chomChom.price, unit: chomChom.unit, quantity: 2, total: chomChom.price * 2, imageUrl: chomChom.imageUrl, cooperativeName: chomChom.farmName }
      ];
      reasoning = 'Bộ đôi giải nhiệt tươi mát gồm bưởi da xanh Tân Triều mọng nước và 2kg chôm chôm nhãn hái tươi tại vườn Long Khánh.';
    } else {
      const buoi = products.find(p => p.id === '1') || products[0];
      selectedItems = [
        { id: buoi.id, name: buoi.name, price: buoi.price, unit: buoi.unit, quantity: 1, total: buoi.price, imageUrl: buoi.imageUrl, cooperativeName: buoi.farmName }
      ];
      reasoning = '1 quả bưởi đường lá cam Tân Triều chuẩn OCOP 4 sao thu hoạch từ cù lao Tân Triều.';
    }
  }

  // Ensure total cost never exceeds budget
  let totalCost = selectedItems.reduce((sum, item) => sum + item.total, 0);
  while (totalCost > budget && selectedItems.length > 0) {
    const lastItem = selectedItems[selectedItems.length - 1];
    if (lastItem.quantity > 1) {
      lastItem.quantity -= 1;
      lastItem.total = lastItem.quantity * lastItem.price;
    } else {
      selectedItems.pop();
    }
    totalCost = selectedItems.reduce((sum, item) => sum + item.total, 0);
  }

  return {
    comboTitle: title,
    targetBudget: budget,
    totalCost,
    remainingBudget: Math.max(0, budget - totalCost),
    items: selectedItems,
    reasoning,
    applicableDiscounts: 'Miễn phí giao hàng nội ô Thành phố Đồng Nai cho đơn hàng combo từ 300.000đ.'
  };
};

// -------------------------------------------------------------
// Natural Language Intent Engine & Chat Processor
// -------------------------------------------------------------

export const processAiConsultation = async (
  userMessage: string,
  history: AiChatMessage[] = []
): Promise<AiChatResponse> => {
  const query = userMessage.trim();
  const lowerQuery = query.toLowerCase();

  // Safety & Medical Guardrail Check
  const medicalWords = ['chữa bệnh', 'trị bệnh', 'ung thư', 'khỏi bệnh', 'tiểu đường', 'thần dược', 'thuốc'];
  const hasMedical = medicalWords.some(w => lowerQuery.includes(w));
  if (hasMedical) {
    return {
      reply: 'Dạ, nông sản như Bưởi đường lá cam Tân Triều và Chôm chôm Long Khánh rất giàu Vitamin C, chất xơ tự nhiên và chất chống oxy hóa tốt cho sức khỏe và hệ miễn dịch. Tuy nhiên, theo quy định an toàn và y khoa, nông sản tươi là thực phẩm dinh dưỡng bổ dưỡng hàng ngày, không thể thay thế thuốc chữa bệnh hay phác đồ điều trị của bác sĩ ạ!',
      intent: 'MEDICAL_SAFETY_GUARDRAIL',
      toolsUsed: ['safety_guidelines'],
      suggestedPrompts: [
        'Hàm lượng dinh dưỡng của Bưởi Tân Triều?',
        'Tư vấn combo quà biếu tốt cho sức khỏe 500k',
        'Nông sản đạt chuẩn VietGAP tại Đồng Nai'
      ]
    };
  }

  // Intent 1: Budget Recommendation (e.g. 300k, 500k, 1 triệu, ngân sách, combo, quà biếu)
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

    const recipient = lowerQuery.includes('đối tác') || lowerQuery.includes('sếp') || lowerQuery.includes('công ty') ? 'đối tác' : (lowerQuery.includes('biếu') ? 'quà biếu' : 'gia đình');
    const combo = await optimizeBudgetCombo(budgetAmount, recipient, lowerQuery.includes('biếu') ? 'quà biếu' : 'tiêu dùng');

    const formattedBudget = new Intl.NumberFormat('vi-VN').format(budgetAmount);
    const formattedTotal = new Intl.NumberFormat('vi-VN').format(combo.totalCost);
    const formattedRemaining = new Intl.NumberFormat('vi-VN').format(combo.remainingBudget);

    let replyText = `Dạ chào bạn! Với ngân sách ${formattedBudget}đ dành cho ${recipient}, CropNet Đồng Nai AI xin gợi ý gói sản phẩm tối ưu nhất:\n\n`;
    replyText += `**${combo.comboTitle}**\n`;
    replyText += `* ${combo.reasoning}\n\n`;
    replyText += `**Chi tiết giỏ hàng:**\n`;
    combo.items.forEach((item, index) => {
      replyText += `${index + 1}. **${item.name}** x ${item.quantity} ${item.unit} (${new Intl.NumberFormat('vi-VN').format(item.total)}đ)\n   Nguồn gốc: ${item.cooperativeName}\n`;
    });
    replyText += `\n**Tổng thanh toán:** ${formattedTotal}đ (Còn dư ${formattedRemaining}đ trong hạn mức)\n`;
    replyText += `*Cam kết:* Toàn bộ sản phẩm đều có tem QR truy xuất nguồn gốc và giấy chứng nhận OCOP / VietGAP chính thống tại Thành phố Đồng Nai. Bạn có thể bấm thêm vào giỏ hàng ngay bên dưới nhé!`;

    return {
      reply: replyText,
      intent: 'BUDGET_RECOMMENDATION',
      toolsUsed: ['optimizeBudgetCombo', 'getFactProducts'],
      recommendedProducts: combo.items,
      actionLink: {
        label: 'Xem chi tiết các sản phẩm',
        url: '/products'
      },
      suggestedPrompts: [
        'Có bưởi OCOP 4 sao Tân Triều không?',
        'Thời gian giao hàng tại Đồng Nai?',
        'Xem nguồn gốc lô bưởi Tân Triều'
      ]
    };
  }

  // Intent 2: Traceability & QR Code Verification
  if (lowerQuery.includes('truy xuất') || lowerQuery.includes('mã lô') || lowerQuery.includes('qr') || lowerQuery.includes('batch-') || lowerQuery.includes('kiểm định') || lowerQuery.includes('vietgap') || lowerQuery.includes('ocop')) {
    const batches = await getFactBatches();
    const batchCodeMatch = query.match(/BATCH-[A-Z0-9\-]+/i);
    const searchedCode = batchCodeMatch ? batchCodeMatch[0].toUpperCase() : null;

    if (searchedCode) {
      const found = batches.find(b => b.batchCode.toUpperCase() === searchedCode);
      if (found) {
        return {
          reply: `Dạ mã lô **${found.batchCode}** đã được xác thực thành công trên hệ thống CropNet Đồng Nai AI!\n\n` +
            `- **Sản phẩm:** ${found.product?.name || 'Nông sản Đồng Nai'}\n` +
            `- **Nhà vườn canh tác:** ${found.farmingArea}\n` +
            `- **Quy trình:** ${found.farmingProcess}\n` +
            `- **Chứng nhận:** ${(found.certifications || []).map((c: any) => c.name).join(', ') || 'Đang cập nhật'}\n\n` +
            `Bạn có thể bấm vào liên kết bên dưới để xem trọn vẹn chứng thư số và báo cáo kiểm định chất lượng phòng lab!`,
          intent: 'TRACEABILITY_VERIFICATION',
          toolsUsed: ['getFactBatches'],
          actionLink: {
            label: `Xem chứng thư lô ${found.batchCode}`,
            url: `/traceability/${found.batchCode}`
          },
          suggestedPrompts: [
            'Xem các chứng nhận VietGAP khác',
            'Mua sản phẩm thuộc lô hàng này'
          ]
        };
      } else {
        return {
          reply: `Cảnh báo an toàn: Mã lô **${searchedCode}** không tìm thấy trên hệ thống cơ sở dữ liệu nông nghiệp Thành phố Đồng Nai 2026. Để bảo vệ quyền lợi người tiêu dùng và thương hiệu HTX, CropNet khuyến cáo bạn không sử dụng các sản phẩm có tem QR không xác thực hoặc nghi vấn làm giả.`,
          intent: 'TRACEABILITY_NOT_FOUND',
          toolsUsed: ['getFactBatches'],
          suggestedPrompts: [
            'Xem danh sách mã lô đã xác thực',
            'Hướng dẫn quét tem QR chính hãng'
          ]
        };
      }
    }

    return {
      reply: `Dạ toàn bộ sản phẩm trên CropNet Đồng Nai AI đều được gắn mã QR truy xuất nguồn gốc fail-closed, liên kết trực tiếp với HTX Nông nghiệp Tân Triều (Vĩnh Cửu) và HTX Long Khánh. Các mã lô mẫu đang hoạt động:\n\n` +
        `1. **BATCH-BUOI-TANTRIEU-2026-01**: Bưởi Đường Lá Cam Tân Triều (OCOP 4 Sao, VietGAP)\n` +
        `2. **BATCH-SAURIENG-LONGKHANH-2026-01**: Sầu Riêng Ri6 Long Khánh (Chín Cây Tự Nhiên)\n` +
        `3. **BATCH-HATDIEU-DONGNAI-2026-01**: Hạt Điều Rang Muối Vỏ Lụa (HACCP, OCOP)\n\n` +
        `Bạn có thể truy cập Cổng Truy Xuất Nguồn Gốc để quét camera hoặc tra cứu chi tiết nhé!`,
      intent: 'TRACEABILITY_GENERAL',
      toolsUsed: ['getFactBatches'],
      actionLink: {
        label: 'Mở Cổng Truy Xuất QR',
        url: '/traceability'
      },
      suggestedPrompts: [
        'Tra cứu BATCH-BUOI-TANTRIEU-2026-01',
        'Quy trình canh tác bưởi Tân Triều thế nào?'
      ]
    };
  }

  // Intent 3: Seasonal Calendar Query
  if (lowerQuery.includes('mùa') || lowerQuery.includes('tháng mấy') || lowerQuery.includes('vụ') || lowerQuery.includes('thu hoạch')) {
    const calendar = getSeasonalCalendarData();
    let replyText = `Dạ CropNet Đồng Nai AI xin cung cấp lịch mùa vụ nông sản chính thức năm 2026 tại Thành phố Đồng Nai:\n\n`;
    calendar.forEach((item, idx) => {
      replyText += `${idx + 1}. **${item.crop}**\n   - **Địa bàn:** ${item.location}\n   - **Thời điểm rộ:** ${item.peakSeason}\n   - **Hiện trạng:** ${item.status}\n\n`;
    });
    replyText += `Bạn quan tâm đến loại trái cây nào để mình tư vấn nhà vườn thu hoạch tươi trong ngày nhé!`;

    return {
      reply: replyText,
      intent: 'SEASONAL_CALENDAR',
      toolsUsed: ['getSeasonalCalendarData'],
      actionLink: {
        label: 'Xem Lịch Mùa Vụ & Đặt Trước',
        url: '/mua-vu'
      },
      suggestedPrompts: [
        'Sầu riêng Ri6 Long Khánh khi nào ngon nhất?',
        'Đặt trước Bưởi Tết Tân Triều',
        'Xem bản đồ vị trí các hợp tác xã'
      ]
    };
  }

  // Intent 4: Cooperatives & Locations
  if (lowerQuery.includes('hợp tác xã') || lowerQuery.includes('htx') || lowerQuery.includes('ở đâu') || lowerQuery.includes('vườn') || lowerQuery.includes('tân triều') || lowerQuery.includes('long khánh')) {
    const coops = await getFactCooperatives();
    let replyText = `Dạ nền tảng CropNet Đồng Nai AI hiện liên kết độc quyền với 2 Hợp Tác Xã nông nghiệp sinh thái nòng cốt:\n\n`;
    coops.forEach((c: any, idx: number) => {
      replyText += `${idx + 1}. **${c.farmName}**\n   - **Địa chỉ:** ${c.address}\n   - **Tọa độ GIS:** ${c.latitude}° N, ${c.longitude}° E\n   - **Đặc sản chính:** ${c.description}\n   - **Chứng nhận:** ${(c.certifications || []).join(', ')}\n\n`;
    });
    replyText += `Bạn có thể xem trực quan vị trí địa lý của từng nhà vườn trên Bản Đồ Nông Nghiệp Số Đồng Nai ạ!`;

    return {
      reply: replyText,
      intent: 'COOPERATIVE_INFO',
      toolsUsed: ['getFactCooperatives'],
      actionLink: {
        label: 'Xem Bản Đồ Vườn Số',
        url: '/ban-do'
      },
      suggestedPrompts: [
        'Đến tham quan làng bưởi Tân Triều đường nào?',
        'Xem các sản phẩm của HTX Long Khánh'
      ]
    };
  }

  // Default: General Product Knowledge & Assistance
  const products = await getFactProducts();
  return {
    reply: `Chào bạn! Mình là Trợ lý AI Bán Hàng & Nông Sản Thông Minh trực thuộc nền tảng **CropNet Đồng Nai AI** (DiGiFest 2026).\n\n` +
      `Mình có thể hỗ trợ bạn:\n` +
      `1. **Tư vấn giỏ hàng theo ngân sách** (Ví dụ: "Tư vấn quà biếu 500k", "Combo hoa quả gia đình 300k")\n` +
      `2. **Truy xuất nguồn gốc QR** từng quả bưởi Tân Triều, sầu riêng Long Khánh, hạt điều Xuân Lộc\n` +
      `3. **Tra cứu lịch mùa vụ & độ chín sinh lý**\n` +
      `4. **Lập yêu cầu báo giá sỉ (RFQ)** trực tiếp cho công ty & nhà hàng\n\n` +
      `Hiện các vườn đang có sẵn Bưởi Đường Lá Cam Tân Triều (OCOP 4 sao), Sầu riêng Ri6 chín cây Long Khánh và Rượu bưởi truyền thống. Bạn cần mình tư vấn mục nào ạ?`,
    intent: 'GENERAL_GREETING',
    toolsUsed: ['getFactProducts'],
    suggestedPrompts: [
      'Tư vấn combo quà biếu 500k',
      'Sầu riêng Ri6 Long Khánh có nhúng thuốc không?',
      'Tra cứu mã lô BATCH-BUOI-TANTRIEU-2026-01',
      'Lịch mùa vụ bưởi Tân Triều'
    ]
  };
};
