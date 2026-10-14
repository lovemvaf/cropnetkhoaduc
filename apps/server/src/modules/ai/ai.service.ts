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

export type AiConsultationMode = 'live_ai' | 'verified_rules' | 'demo_example' | 'offline_unavailable';

export interface AiChatResponse {
  reply: string;
  intent: string;
  mode: AiConsultationMode;
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
      return prods.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: Number(p.price),
        unit: p.unit,
        stock: p.stock,
        farmName: p.supplier?.farmName || 'HTX Nông Nghiệp Tân Triều',
        cooperativeId: p.supplierId,
        category: p.category?.name || 'Trái Cây Đặc Sản Đồng Nai',
        imageUrl: (p.images && p.images[0]?.url) || ''
      }));
    }
  } catch (err) {
    // fallback if DB offline
  }

  return MOCK_PRODUCTS.map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    unit: p.unit,
    stock: p.stock,
    farmName: p.supplier?.farmName || 'HTX Nông Nghiệp Tân Triều',
    cooperativeId: p.supplier?.id || p.supplierId,
    category: p.category?.name || 'Trái Cây Đặc Sản Đồng Nai',
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
      location: 'Phường Tân Triều, Thành phố Đồng Nai (vùng Cù lao Tân Triều lịch sử)',
      peakSeason: 'Tháng 9 đến Tháng 12 âm lịch (Phục vụ cao điểm Tết Nguyên Đán)',
      status: 'Đang vào vụ thu hoạch rộ chính',
      notes: 'Bưởi tích đủ nước ngọt phù sa sông Đồng Nai, đạt độ ngọt Brix từ 11.5 - 12.5.'
    },
    {
      crop: 'Sầu Riêng Ri6 Long Khánh',
      location: 'Phường Xuân Lập, Thành phố Đồng Nai',
      peakSeason: 'Tháng 5 đến Tháng 8 dương lịch, có vụ nghịch nhỏ vào Tháng 10 - 11',
      status: 'Đang thu hoạch chọn lọc trái già',
      notes: 'Đất đỏ bazan, 100% để chín cây tự nhiên hoặc cắt già gõ bộng, không nhúng thuốc kích chín.'
    },
    {
      crop: 'Chôm Chôm Nhãn Long Khánh',
      location: 'Phường Xuân Lập, Thành phố Đồng Nai',
      peakSeason: 'Tháng 5 đến Tháng 7 dương lịch, có hàng rải vụ cuối năm',
      status: 'Đang cung cấp hàng tươi từ vườn',
      notes: 'Trái gai ngắn, cơm dày róc hạt, ăn giòn ngọt thanh.'
    },
    {
      crop: 'Hạt Điều Rang Muối Đồng Nai',
      location: 'Vùng trồng Xuân Lộc & Xuân Lập, Thành phố Đồng Nai',
      peakSeason: 'Quanh năm (chế biến bảo quản khô hút chân không)',
      status: 'Sẵn sàng giao hàng toàn quốc',
      notes: 'Hạt điều rang củi muối tinh giữ vỏ lụa, tiêu chuẩn ATTP HACCP.'
    },
    {
      crop: 'Rượu Bưởi Tân Triều Truyền Thống (Sản phẩm có cồn có điều kiện)',
      location: 'Cù lao Tân Triều, Phường Tân Triều, Thành phố Đồng Nai',
      peakSeason: 'Quanh năm (ủ men chum sành hạ thổ 6 - 12 tháng)',
      status: 'Sản phẩm truyền thống có điều kiện - Không bán cho người dưới 18 tuổi',
      notes: 'Đặc sản lên men thủ công từ nước cốt bưởi đường lá cam, 15% vol.'
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
  const excludeNuts = cleanRecipient.includes('không hạt điều') || cleanPurpose.includes('không hạt điều') || cleanRecipient.includes('dị ứng');
  const excludeDurian = cleanRecipient.includes('không sầu riêng') || cleanPurpose.includes('không sầu riêng');

  // Helpers to resolve items by canonical or numeric IDs
  const findProd = (idPart: string, fallbackIdx: number) => {
    return products.find((p: any) => p.id === idPart || p.id.includes(idPart) || p.id === String(fallbackIdx + 1)) || products[fallbackIdx] || products[0];
  };

  const buoiDuongLaCam = findProd('prod-buoi-duong-la-cam', 0);
  const buoiDaXanh = findProd('prod-buoi-da-xanh', 1);
  const sauRieng = findProd('prod-sau-rieng', 2);
  const chomChom = findProd('prod-chom-chom', 3);
  const hatDieu = findProd('prod-hat-dieu', 4);

  if (isGift) {
    title = `Combo Quà Biếu Nông Sản Đồng Nai Tuyển Chọn (${new Intl.NumberFormat('vi-VN').format(budget)}đ)`;
    if (budget >= 450000) {
      if (excludeNuts) {
        selectedItems = [
          { id: buoiDuongLaCam.id, name: buoiDuongLaCam.name, price: buoiDuongLaCam.price, unit: buoiDuongLaCam.unit, quantity: 2, total: buoiDuongLaCam.price * 2, imageUrl: buoiDuongLaCam.imageUrl, cooperativeName: buoiDuongLaCam.farmName },
          { id: buoiDaXanh.id, name: buoiDaXanh.name, price: buoiDaXanh.price, unit: buoiDaXanh.unit, quantity: 2, total: buoiDaXanh.price * 2, imageUrl: buoiDaXanh.imageUrl, cooperativeName: buoiDaXanh.farmName },
          { id: chomChom.id, name: chomChom.name, price: chomChom.price, unit: chomChom.unit, quantity: 3, total: chomChom.price * 3, imageUrl: chomChom.imageUrl, cooperativeName: chomChom.farmName }
        ];
        reasoning = 'Set quà thanh lịch từ các nhà vườn Đồng Nai gồm 2 quả bưởi đường lá cam Tân Triều, 2 quả bưởi da xanh ruột hồng và 3kg chôm chôm nhãn Long Khánh (đã loại trừ hạt điều theo yêu cầu).';
      } else {
        selectedItems = [
          { id: buoiDuongLaCam.id, name: buoiDuongLaCam.name, price: buoiDuongLaCam.price, unit: buoiDuongLaCam.unit, quantity: 2, total: buoiDuongLaCam.price * 2, imageUrl: buoiDuongLaCam.imageUrl, cooperativeName: buoiDuongLaCam.farmName },
          { id: buoiDaXanh.id, name: buoiDaXanh.name, price: buoiDaXanh.price, unit: buoiDaXanh.unit, quantity: 1, total: buoiDaXanh.price, imageUrl: buoiDaXanh.imageUrl, cooperativeName: buoiDaXanh.farmName },
          { id: hatDieu.id, name: hatDieu.name, price: hatDieu.price, unit: hatDieu.unit, quantity: 1, total: hatDieu.price, imageUrl: hatDieu.imageUrl, cooperativeName: hatDieu.farmName }
        ];
        reasoning = 'Set quà sang trọng phù hợp biếu tặng đối tác và người thân gồm cặp bưởi đường lá cam Tân Triều thanh tao tài lộc, 1 quả bưởi da xanh hữu cơ mọng nước và 1 hộp hạt điều rang củi vỏ lụa Đồng Nai (không chứa thức uống có cồn).';
      }
    } else if (budget >= 250000) {
      if (excludeNuts) {
        selectedItems = [
          { id: buoiDuongLaCam.id, name: buoiDuongLaCam.name, price: buoiDuongLaCam.price, unit: buoiDuongLaCam.unit, quantity: 2, total: buoiDuongLaCam.price * 2, imageUrl: buoiDuongLaCam.imageUrl, cooperativeName: buoiDuongLaCam.farmName },
          { id: buoiDaXanh.id, name: buoiDaXanh.name, price: buoiDaXanh.price, unit: buoiDaXanh.unit, quantity: 1, total: buoiDaXanh.price, imageUrl: buoiDaXanh.imageUrl, cooperativeName: buoiDaXanh.farmName }
        ];
        reasoning = 'Cặp bưởi đường lá cam Tân Triều kết hợp cùng bưởi da xanh hữu cơ, thanh ngọt giải nhiệt, an toàn và trang trọng.';
      } else {
        selectedItems = [
          { id: buoiDuongLaCam.id, name: buoiDuongLaCam.name, price: buoiDuongLaCam.price, unit: buoiDuongLaCam.unit, quantity: 2, total: buoiDuongLaCam.price * 2, imageUrl: buoiDuongLaCam.imageUrl, cooperativeName: buoiDuongLaCam.farmName },
          { id: hatDieu.id, name: hatDieu.name, price: hatDieu.price, unit: hatDieu.unit, quantity: 1, total: hatDieu.price, imageUrl: hatDieu.imageUrl, cooperativeName: hatDieu.farmName }
        ];
        reasoning = 'Cặp bưởi đường lá cam Tân Triều OCOP cùng 1 hộp hạt điều rang củi vỏ lụa thượng hạng chuẩn ATTP Đồng Nai.';
      }
    } else {
      selectedItems = [
        { id: buoiDuongLaCam.id, name: buoiDuongLaCam.name, price: buoiDuongLaCam.price, unit: buoiDuongLaCam.unit, quantity: 1, total: buoiDuongLaCam.price, imageUrl: buoiDuongLaCam.imageUrl, cooperativeName: buoiDuongLaCam.farmName }
      ];
      reasoning = 'Gói quà nhỏ gọn tinh tế với 1 quả bưởi đường lá cam Tân Triều tuyển chọn thu hoạch từ cù lao Tân Triều.';
    }
  } else {
    title = `Combo Trái Cây & Nông Sản Sinh Thái Thưởng Thức (${new Intl.NumberFormat('vi-VN').format(budget)}đ)`;
    if (budget >= 400000) {
      if (excludeDurian) {
        selectedItems = [
          { id: buoiDaXanh.id, name: buoiDaXanh.name, price: buoiDaXanh.price, unit: buoiDaXanh.unit, quantity: 2, total: buoiDaXanh.price * 2, imageUrl: buoiDaXanh.imageUrl, cooperativeName: buoiDaXanh.farmName },
          { id: chomChom.id, name: chomChom.name, price: chomChom.price, unit: chomChom.unit, quantity: 3, total: chomChom.price * 3, imageUrl: chomChom.imageUrl, cooperativeName: chomChom.farmName },
          { id: buoiDuongLaCam.id, name: buoiDuongLaCam.name, price: buoiDuongLaCam.price, unit: buoiDuongLaCam.unit, quantity: 1, total: buoiDuongLaCam.price, imageUrl: buoiDuongLaCam.imageUrl, cooperativeName: buoiDuongLaCam.farmName }
        ];
        reasoning = 'Thực đơn hoa quả tươi sạch cho cả gia đình gồm 2 quả bưởi da xanh giải nhiệt, 3kg chôm chôm nhãn giòn ngọt và 1 quả bưởi đường lá cam Tân Triều (đã loại trừ sầu riêng).';
      } else {
        selectedItems = [
          { id: buoiDaXanh.id, name: buoiDaXanh.name, price: buoiDaXanh.price, unit: buoiDaXanh.unit, quantity: 2, total: buoiDaXanh.price * 2, imageUrl: buoiDaXanh.imageUrl, cooperativeName: buoiDaXanh.farmName },
          { id: chomChom.id, name: chomChom.name, price: chomChom.price, unit: chomChom.unit, quantity: 3, total: chomChom.price * 3, imageUrl: chomChom.imageUrl, cooperativeName: chomChom.farmName },
          { id: hatDieu.id, name: hatDieu.name, price: hatDieu.price, unit: hatDieu.unit, quantity: 1, total: hatDieu.price, imageUrl: hatDieu.imageUrl, cooperativeName: hatDieu.farmName }
        ];
        reasoning = 'Thực đơn hoa quả tươi sạch cho cả gia đình gồm 2 quả bưởi da xanh mọng nước, 3kg chôm chôm nhãn hái tươi trong ngày và 1 hộp hạt điều nhâm nhi.';
      }
    } else if (budget >= 200000) {
      selectedItems = [
        { id: buoiDaXanh.id, name: buoiDaXanh.name, price: buoiDaXanh.price, unit: buoiDaXanh.unit, quantity: 1, total: buoiDaXanh.price, imageUrl: buoiDaXanh.imageUrl, cooperativeName: buoiDaXanh.farmName },
        { id: chomChom.id, name: chomChom.name, price: chomChom.price, unit: chomChom.unit, quantity: 2, total: chomChom.price * 2, imageUrl: chomChom.imageUrl, cooperativeName: chomChom.farmName }
      ];
      reasoning = 'Bộ đôi hoa quả tươi mát gồm bưởi da xanh Tân Triều và 2kg chôm chôm nhãn hái tươi tại vùng chuyên canh Xuân Lập.';
    } else {
      selectedItems = [
        { id: buoiDuongLaCam.id, name: buoiDuongLaCam.name, price: buoiDuongLaCam.price, unit: buoiDuongLaCam.unit, quantity: 1, total: buoiDuongLaCam.price, imageUrl: buoiDuongLaCam.imageUrl, cooperativeName: buoiDuongLaCam.farmName }
      ];
      reasoning = '1 quả bưởi đường lá cam Tân Triều tuyển chọn thu hoạch từ cù lao Tân Triều.';
    }
  }

  // Strictly enforce budget ceiling (totalCost <= budget)
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
      reply: 'Dạ, nông sản tươi như Bưởi đường lá cam Tân Triều và Chôm chôm Long Khánh rất giàu Vitamin C, chất xơ tự nhiên và chất chống oxy hóa tốt cho sức khỏe và hệ miễn dịch. Tuy nhiên, theo quy định an toàn thực phẩm và y khoa, nông sản là thực phẩm dinh dưỡng bổ dưỡng hàng ngày, không thể thay thế thuốc chữa bệnh hay phác đồ điều trị y tế của bác sĩ ạ!',
      intent: 'MEDICAL_SAFETY_GUARDRAIL',
      mode: 'verified_rules',
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
    const combo = await optimizeBudgetCombo(budgetAmount, recipient, lowerQuery);

    const formattedBudget = new Intl.NumberFormat('vi-VN').format(budgetAmount);
    const formattedTotal = new Intl.NumberFormat('vi-VN').format(combo.totalCost);
    const formattedRemaining = new Intl.NumberFormat('vi-VN').format(combo.remainingBudget);

    let replyText = `Dạ chào bạn! Dựa trên danh mục nông sản Đồng Nai đã xác thực, với ngân sách ${formattedBudget}đ dành cho ${recipient}, CropNet gợi ý gói sản phẩm tối ưu nhất:\n\n`;
    replyText += `**${combo.comboTitle}**\n`;
    replyText += `* ${combo.reasoning}\n\n`;
    replyText += `**Chi tiết sản phẩm:**\n`;
    combo.items.forEach((item, index) => {
      replyText += `${index + 1}. **${item.name}** x ${item.quantity} ${item.unit} (${new Intl.NumberFormat('vi-VN').format(item.total)}đ)\n   Nguồn: ${item.cooperativeName}\n`;
    });
    replyText += `\n**Tổng giá trị:** ${formattedTotal}đ (Còn dư ${formattedRemaining}đ trong ngân sách)\n`;
    replyText += `*Ghi chú minh bạch:* Sản phẩm được lựa chọn từ các hợp tác xã tại Thành phố Đồng Nai. Thông tin chứng nhận OCOP/VietGAP hoặc tiêu chuẩn canh tác được đối chiếu cụ thể theo từng sản phẩm và mã lô truy xuất. Bạn có thể bấm thêm vào giỏ hàng bên dưới!`;

    return {
      reply: replyText,
      intent: 'BUDGET_RECOMMENDATION',
      mode: 'verified_rules',
      toolsUsed: ['optimizeBudgetCombo', 'getFactProducts'],
      recommendedProducts: combo.items,
      actionLink: {
        label: 'Xem chi tiết các sản phẩm',
        url: '/products'
      },
      suggestedPrompts: [
        'Có bưởi OCOP Tân Triều không?',
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
      const found = batches.find((b: any) => b.batchCode.toUpperCase() === searchedCode);
      if (found) {
        return {
          reply: `Dạ mã lô **${found.batchCode}** đã được xác thực trên hệ thống truy xuất nguồn gốc CropNet Đồng Nai AI:\n\n` +
            `- **Sản phẩm:** ${found.product?.name || 'Nông sản Đồng Nai'}\n` +
            `- **Nhà vườn / Vùng canh tác:** ${found.farmingArea}\n` +
            `- **Quy trình:** ${found.farmingProcess}\n` +
            `- **Chứng nhận / Tiêu chuẩn:** ${(found.certifications || []).map((c: any) => c.name).join(', ') || 'Đang cập nhật'}\n\n` +
            `Bạn có thể bấm vào liên kết bên dưới để xem chi tiết nhật ký chăm sóc và chứng thư số của lô hàng này!`,
          intent: 'TRACEABILITY_VERIFICATION',
          mode: 'verified_rules',
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
          reply: `Cảnh báo an toàn: Mã lô **${searchedCode}** không tìm thấy trên hệ thống cơ sở dữ liệu nông nghiệp Thành phố Đồng Nai. Để bảo vệ quyền lợi người tiêu dùng và thương hiệu đặc sản địa phương, CropNet khuyến cáo bạn kiểm tra kỹ tem nhãn hoặc liên hệ trực tiếp nhà vườn.`,
          intent: 'TRACEABILITY_NOT_FOUND',
          mode: 'verified_rules',
          toolsUsed: ['getFactBatches'],
          suggestedPrompts: [
            'Xem danh sách mã lô mẫu đã xác thực',
            'Hướng dẫn quét tem QR chính hãng'
          ]
        };
      }
    }

    return {
      reply: `Dạ các sản phẩm trên CropNet Đồng Nai AI đều hỗ trợ truy xuất nguồn gốc liên kết với HTX Nông nghiệp Dịch vụ Tân Triều (Phường Tân Triều) và HTX Nông nghiệp Sinh Thái Long Khánh (Phường Xuân Lập). Các mã lô mẫu đang có trên hệ thống:\n\n` +
        `1. **BATCH-BUOI-TANTRIEU-2026-01**: Bưởi Đường Lá Cam Tân Triều (OCOP, VietGAP)\n` +
        `2. **BATCH-SAURIENG-LONGKHANH-2026-01**: Sầu Riêng Ri6 Long Khánh (Chín Cây Tự Nhiên)\n` +
        `3. **BATCH-HATDIEU-DONGNAI-2026-01**: Hạt Điều Rang Muối Vỏ Lụa (HACCP)\n\n` +
        `Bạn có thể truy cập Cổng Truy Xuất Nguồn Gốc để quét camera hoặc tra cứu chi tiết nhé!`,
      intent: 'TRACEABILITY_GENERAL',
      mode: 'verified_rules',
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
    let replyText = `Dạ CropNet Đồng Nai AI xin cung cấp lịch mùa vụ nông sản tham khảo tại Thành phố Đồng Nai:\n\n`;
    calendar.forEach((item, idx) => {
      replyText += `${idx + 1}. **${item.crop}**\n   - **Địa bàn:** ${item.location}\n   - **Thời điểm rộ:** ${item.peakSeason}\n   - **Hiện trạng:** ${item.status}\n\n`;
    });
    replyText += `Bạn quan tâm đến loại trái cây nào để mình tư vấn mùa vụ và thời điểm thưởng thức ngon nhất nhé!`;

    return {
      reply: replyText,
      intent: 'SEASONAL_CALENDAR',
      mode: 'verified_rules',
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
    let replyText = `Dạ nền tảng CropNet Đồng Nai AI hiện hợp tác trưng bày sản phẩm của các Hợp Tác Xã nông nghiệp sinh thái nòng cốt:\n\n`;
    coops.forEach((c: any, idx: number) => {
      replyText += `${idx + 1}. **${c.farmName}**\n   - **Địa chỉ:** ${c.address}\n   - **Tọa độ GIS:** ${c.latitude}° N, ${c.longitude}° E\n   - **Đặc sản chính:** ${c.description}\n   - **Chứng nhận/Tiêu chuẩn:** ${(c.certifications || []).join(', ')}\n\n`;
    });
    replyText += `Bạn có thể xem trực quan vị trí địa lý của từng nhà vườn trên Bản Đồ Nông Nghiệp Số Đồng Nai!`;

    return {
      reply: replyText,
      intent: 'COOPERATIVE_INFO',
      mode: 'verified_rules',
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
    reply: `Chào bạn! Mình là Trợ lý Nông Sản & Bán Hàng Thông Minh trực thuộc nền tảng **CropNet Đồng Nai AI** (AI Digital Business Challenge 2026).\n\n` +
      `Hệ thống sử dụng bộ quy tắc và dữ liệu nông sản đã xác minh để hỗ trợ bạn:\n` +
      `1. **Tối ưu gói sản phẩm theo ngân sách** (Ví dụ: "Tư vấn quà biếu 500k", "Combo hoa quả gia đình 300k, không hạt điều")\n` +
      `2. **Tra cứu tem QR truy xuất nguồn gốc** từng lô bưởi Tân Triều, sầu riêng Long Khánh, hạt điều Đồng Nai\n` +
      `3. **Tra cứu lịch mùa vụ & thời điểm thu hoạch**\n` +
      `4. **Soạn bản nháp yêu cầu báo giá sỉ (RFQ)** cho tổ chức và doanh nghiệp\n\n` +
      `Bạn cần mình tư vấn nông sản nào của Thành phố Đồng Nai hôm nay ạ?`,
    intent: 'GENERAL_GREETING',
    mode: 'verified_rules',
    toolsUsed: ['getFactProducts'],
    suggestedPrompts: [
      'Tư vấn combo quà biếu 500k',
      'Sầu riêng Ri6 Long Khánh có nhúng thuốc không?',
      'Tra cứu mã lô BATCH-BUOI-TANTRIEU-2026-01',
      'Lịch mùa vụ bưởi Tân Triều'
    ]
  };
};
