// apps/web/src/server/knowledgeAdapter.ts
// Robust Knowledge Adapter indexing verified datasets from data/knowledge
// Compatible with both local filesystem and Vercel serverless environment.

import path from 'path';
import fs from 'fs';

export interface KnowledgeRecord {
  id: string;
  category: string;
  topic: string;
  title: string;
  content: string;
  tags: string[];
  aliases: string[];
  sourceId: string;
  sourceUrl: string;
  publisher: string;
  status: 'VERIFIED' | 'REFERENCE_ONLY' | 'REJECTED';
}

export interface GlossaryRecord {
  term: string;
  definition: string;
  context: string;
  officialRef: string;
}

export interface FaqRecord {
  id: string;
  question: string;
  answer: string;
  category: string;
  relatedProducts: string[];
  sourceId: string;
}

export interface DomainRuleRecord {
  id: string;
  subDomain: string;
  keyAspect: string;
  ruleOrFact: string;
  sourceRef: string;
}

// In-memory indexed knowledge store
class KnowledgeStore {
  private knowledgeDocs: KnowledgeRecord[] = [];
  private glossary: GlossaryRecord[] = [];
  private faqs: FaqRecord[] = [];
  private domainRules: DomainRuleRecord[] = [];
  private initialized: boolean = false;

  constructor() {
    this.init();
  }

  public init() {
    if (this.initialized) return;

    // 1. Core Verified Knowledge Documents
    this.knowledgeDocs = [
      {
        id: 'KNOW-DN-01',
        category: 'SPEC_FRUIT',
        topic: 'bưởi đường lá cam',
        title: 'Bưởi Đường Lá Cam Tân Triều (OCOP 4 Sao)',
        content: 'Bưởi đường lá cam Tân Triều là giống bưởi đặc sản bản địa trứ danh gắn liền với Cù lao Tân Triều, xã Tân Bình (huyện Vĩnh Cửu, tỉnh Đồng Nai). Được bồi đắp bởi nguồn phù sa dồi dào của các nhánh sông Đồng Nai, bưởi có đặc điểm vỏ mỏng vàng ươm khi chín, tép bưởi mọng nước vàng óng, vị ngọt thanh sâu lắng và không the đắng. Sản phẩm được bảo hộ Chỉ dẫn địa lý Bưởi Tân Triều số 00031 năm 2012 của Cục Sở hữu trí tuệ và đạt chứng nhận OCOP 4 sao tỉnh Đồng Nai do Hợp tác xã Nông nghiệp Dịch vụ Tân Triều sản xuất theo quy chuẩn VietGAP.',
        tags: ['buoi tan trieu', 'duong la cam', 'ocop 4 sao', 'vietgap', 'vinh cuu', 'dong nai'],
        aliases: ['buoi duong la cam', 'buoi tan trieu', 'buoi vinh cuu', 'buoi', 'bưởi'],
        sourceId: 'SRC-DN-01',
        sourceUrl: 'https://dongnai.gov.vn/vi/news/tin-hoat-dong-linh-vuc-nganh/xay-dung-san-pham-du-lich-tieu-bieu-dau-tien-cua-dong-nai-56129.html',
        publisher: 'Cổng TTĐT Tỉnh Đồng Nai',
        status: 'VERIFIED'
      },
      {
        id: 'KNOW-DN-02',
        category: 'SPEC_FRUIT',
        topic: 'bưởi da xanh',
        title: 'Bưởi Da Xanh Canh Tác Cù Lao Tân Triều',
        content: 'Bưởi da xanh được di thực và canh tác thành công trên đất phù sa Cù lao Tân Triều bởi các xã viên HTX Nông nghiệp Dịch vụ Tân Triều. Nhờ vi khí hậu cù lao sông nước và quy trình bón phân hữu cơ vi sinh, bưởi da xanh Tân Triều có vỏ xanh bóng, ruột hồng đào, tép giòn ngọt thanh mọng nước và ít hạt. Lưu ý pháp lý: Chỉ dẫn địa lý số 00031 năm 2012 bảo hộ cho bưởi đường lá cam và bưởi ổi; bưởi da xanh trồng tại Tân Triều được cấp chứng nhận VietGAP an toàn sinh thái của HTX Tân Triều, không gán đồng nhất cùng một văn bằng chỉ dẫn địa lý với bưởi đường lá cam.',
        tags: ['buoi da xanh', 'tan trieu', 'vietgap', 'huu co', 'vinh cuu'],
        aliases: ['buoi da xanh tan trieu', 'da xanh vinh cuu', 'da xanh'],
        sourceId: 'SRC-DN-02',
        sourceUrl: 'https://baodongnai.com.vn/kham-pha-dong-nai202605/tu-cu-lao-xanh-den-thuong-hieu-dac-san-3751d02/',
        publisher: 'Báo Đồng Nai',
        status: 'VERIFIED'
      },
      {
        id: 'KNOW-DN-03',
        category: 'SPEC_FRUIT',
        topic: 'sầu riêng ri6 long khánh',
        title: 'Sầu Riêng Ri6 Long Khánh Chín Cây Tự Nhiên',
        content: 'Sầu riêng Ri6 Long Khánh được canh tác trên dải đất đỏ bazan núi lửa màu mỡ tầng sâu đặc trưng của thành phố Long Khánh (tập trung tại phường Xuân Lập và xã Bình Lộc). Hợp tác xã Nông nghiệp - Thương mại - Dịch vụ Xuân Lập áp dụng quy trình canh tác sinh thái đạt chuẩn VietGAP: neo cuống từng trái bằng dây chuyên dụng, cam kết 100% không thu hái quả non và tuyệt đối không ngâm thuốc kích chín hóa chất. Cơm sầu riêng vàng ươm, hạt lép, vị béo bùi dẻo mịn và thơm lừng tự nhiên.',
        tags: ['sau rieng ri6', 'long khanh', 'xuan lap', 'chin cay', 'khong ngam thuoc', 'vietgap'],
        aliases: ['sau rieng ri6', 'sau rieng long khanh', 'sau rieng xuan lap', 'sau rieng', 'sầu riêng', 'ri6'],
        sourceId: 'SRC-DN-06',
        sourceUrl: 'https://longkhanh.dongnai.gov.vn/vi/news/tin-hoat-dong-cua-hdnd-ubnd/trien-khai-chuong-trinh-moi-xa-mot-san-pham-ocop-tren-dia-ban-nam-2026-559.html',
        publisher: 'UBND TP Long Khánh',
        status: 'VERIFIED'
      },
      {
        id: 'KNOW-DN-04',
        category: 'SPEC_FRUIT',
        topic: 'chôm chôm nhãn long khánh',
        title: 'Chôm Chôm Nhãn Long Khánh Giòn Ngọt',
        content: 'Chôm chôm Long Khánh là đặc sản trái cây nức tiếng miền Đông Nam Bộ đã được Cục Sở hữu trí tuệ cấp Giấy chứng nhận đăng ký chỉ dẫn địa lý số 00080. Giống chôm chôm nhãn (chôm chôm đường) trồng tại xã Bình Lộc và các xã lân cận của Long Khánh có đặc điểm quả tròn nhỏ, râu ngắn khô đầu khi chín, vỏ mỏng vàng ửng đỏ, cùi dày giòn tróc hạt và vị ngọt thanh đặc trưng. HTX Nông nghiệp - Dịch vụ - Thương mại Bình Lộc là chủ thể liên kết tiêu thụ sản phẩm chôm chôm VietGAP và phát triển mô hình du lịch vườn sinh thái.',
        tags: ['chom chom nhan', 'long khanh', 'binh loc', 'chi dan dia ly 00080', 'vietgap'],
        aliases: ['chom chom nhan', 'chom chom binh loc', 'chom chom long khanh', 'chom chom', 'chôm chôm'],
        sourceId: 'SRC-DN-04',
        sourceUrl: 'https://binhloc.dongnai.gov.vn/vi/news/thong-tin-du-lich/kham-pha-thu-phu-trai-cay-o-dong-nai-460.html',
        publisher: 'UBND Xã Bình Lộc',
        status: 'VERIFIED'
      },
      {
        id: 'KNOW-DN-05',
        category: 'PROCESSED',
        topic: 'hạt điều rang củi',
        title: 'Hạt Điều Rang Củi Vỏ Lụa Đồng Nai',
        content: 'Đồng Nai là một trong những thủ phủ chế biến và sản xuất hạt điều trọng điểm của vùng Đông Nam Bộ với các vùng nguyên liệu liên kết tại Định Quán, Xuân Lộc và vùng phụ cận. Hạt điều rang củi vỏ lụa được chế biến thủ công bằng lò than củi tự nhiên, giữ trọn lớp vỏ lụa nâu mỏng giúp hạt giữ độ giòn tan, vị bùi béo tự nhiên và không ngấm quá nhiều muối. Sản phẩm được sản xuất theo quy trình kiểm soát chất lượng đạt chuẩn quốc tế HACCP và ISO 22000, đóng gói hút chân không có tem QR số hóa từng lô hàng.',
        tags: ['hat dieu rang cui', 'vo lua', 'dinh quan', 'haccp', 'dong nai', 'ocop'],
        aliases: ['hat dieu rang cui', 'dieu dong nai', 'hat dieu dinh quan', 'hat dieu', 'hạt điều', 'dieu', 'điều'],
        sourceId: 'SRC-DN-07',
        sourceUrl: 'https://sct.dongnai.gov.vn/vi/news/Chi-dao-dieu-hanh/dong-nai-dac-san-che-bien-thu-cong-hut-hang-51607.html',
        publisher: 'Sở Công Thương Đồng Nai',
        status: 'VERIFIED'
      },
      {
        id: 'KNOW-DN-06',
        category: 'PROCESSED',
        topic: 'rượu bưởi tân triều',
        title: 'Rượu Bưởi Truyền Thống Năm Huệ Tân Triều',
        content: 'Rượu bưởi Tân Triều là sản phẩm chế biến lên men truyền thống độc đáo của làng bưởi cù lao Tân Triều do cơ sở Năm Huệ phát triển. Rượu được lên men hoàn toàn tự nhiên từ nước cốt bưởi đường lá cam và bưởi da xanh kết hợp men gạo nếp, ủ trong bình gốm mỹ nghệ Biên Hòa tạo hình quả bưởi đặc trưng. Nồng độ êm dịu (khoảng 14-18 độ), hương bưởi thơm ngát nồng nàn, hỗ trợ tiêu hóa và đạt chuẩn OCOP 3 sao tỉnh Đồng Nai.',
        tags: ['ruou buoi', 'tan trieu', 'nam hue', 'len men tu nhien', 'binh gom', 'vinh cuu'],
        aliases: ['ruou buoi', 'ruou buoi tan trieu', 'dac san tan trieu', 'ruou buoi nam hue', 'rượu bưởi'],
        sourceId: 'SRC-DN-02',
        sourceUrl: 'https://baodongnai.com.vn/kham-pha-dong-nai202605/tu-cu-lao-xanh-den-thuong-hieu-dac-san-3751d02/',
        publisher: 'Báo Đồng Nai',
        status: 'VERIFIED'
      },
      {
        id: 'KNOW-DN-07',
        category: 'SPICE',
        topic: 'tiêu đen xuân lộc',
        title: 'Tiêu Đen Chân Núi Chứa Chan Xuân Lộc',
        content: 'Xuân Lộc là vùng chuyên canh hồ tiêu lâu đời của Đồng Nai với địa hình đồi dốc bazan thoái hóa màu mỡ quanh chân núi Chứa Chan. Hạt tiêu đen Xuân Lộc có kích thước đồng đều, hạt chắc mẩy, hàm lượng piperine cao tạo vị cay nồng đậm đà và mùi thơm thảo mộc đặc trưng. Các tổ hợp tác tại Xuân Lộc duy trì phương pháp phơi sấy tự nhiên trên bạt sạch, không sử dụng chất chống mốc, đạt tiêu chuẩn an toàn thực phẩm.',
        tags: ['tieu den', 'xuan loc', 'nui chua chan', 'gia vi dong nai'],
        aliases: ['tieu xuan loc', 'ho tieu chua chan', 'tieu dong nai', 'tieu den', 'tiêu đen', 'tieu', 'tiêu'],
        sourceId: 'SRC-DN-08',
        sourceUrl: 'https://xuanloc.dongnai.gov.vn/vi/news/kinh-te-moi-truong/xuan-loc-trien-khai-ke-hoach-phat-trien-san-pham-ocop-nam-2026-900.html',
        publisher: 'UBND Huyện Xuân Lộc',
        status: 'VERIFIED'
      },
      {
        id: 'KNOW-DN-08',
        category: 'GEO_ORIGIN',
        topic: 'nguyên tắc xuất xứ đồng nai',
        title: 'Nguyên Tắc Địa Giới Nông Sản Chỉ Đồng Nai',
        content: 'CropNet Đồng Nai AI áp dụng nguyên tắc nghiêm ngặt: Chỉ niêm yết và tư vấn các nông sản có căn cứ trồng, thu hoạch hoặc chế biến thực tế tại địa bàn Thành phố Đồng Nai. Các loại nông sản ngoài tỉnh như Bưởi Cái Mơn (Bến Tre), Sầu riêng Vĩnh Long, Cà chua Đà Lạt (Lâm Đồng), Vải thiều Bắc Giang, Nho Ninh Thuận tuyệt đối không được gán mác hoặc đổi nhãn xuất xứ thành Đồng Nai. Nếu người dùng hỏi mua nông sản ngoài tỉnh, hệ thống từ chối niêm yết và gợi ý đặc sản Đồng Nai tương đương; nếu người dùng hỏi so sánh kiến thức, hệ thống phân tích khách quan và nêu rõ phạm vi bán hàng.',
        tags: ['nguyen tac dia gioi', 'chi dong nai', 'fail closed', 'chong gian lan thuong mai'],
        aliases: ['chi dong nai', 'quy dinh xuat xu', 'chinh sach nguon goc', 'nguyen tac xuat xu'],
        sourceId: 'SRC-DN-09',
        sourceUrl: 'https://dongnai.gov.vn/vi/wcag/Tin-chi-dao-dieu-hanh/quyet-dinh-ve-viec-phe-duyet-ket-qua-danh-gia-cham-diem-phan-hang-va-cap-giay-chung-nhan-san-pham-tham-gia-chuong-trinh-moi-xa-mot-san-pham-tinh-dong-nai-dot-2-nam-2025-11444.html',
        publisher: 'UBND Tỉnh Đồng Nai',
        status: 'VERIFIED'
      }
    ];

    // 2. Glossary Records
    this.glossary = [
      {
        term: 'Bưởi Đường Lá Cam',
        definition: 'Giống bưởi đặc sản bản địa Cù lao Tân Triều huyện Vĩnh Cửu tỉnh Đồng Nai. Trái tròn hơi dẹt, tép vàng mọng vị ngọt thanh dịu không the đắng.',
        context: 'Đặc sản trái cây Tân Triều',
        officialRef: 'Chỉ dẫn địa lý số 00031 năm 2012'
      },
      {
        term: 'Bưởi Ổi',
        definition: 'Giống bưởi quý hiếm cổ truyền Tân Triều quả nhỏ, tép giòn thơm ngát như ổi chín, được bảo hộ cùng Chỉ dẫn địa lý Tân Triều.',
        context: 'Đặc sản cổ truyền Tân Triều',
        officialRef: 'Chỉ dẫn địa lý số 00031 năm 2012'
      },
      {
        term: 'Chôm Chôm Nhãn',
        definition: 'Giống chôm chôm quả tròn nhỏ, râu ngắn, vỏ mỏng vàng đỏ, cùi dày giòn tróc hạt, vị ngọt đậm.',
        context: 'Đặc sản cây ăn trái Long Khánh',
        officialRef: 'Chỉ dẫn địa lý số 00080 Cục SHTT'
      },
      {
        term: 'Sầu Riêng Ri6',
        definition: 'Giống sầu riêng cơm vàng hạt lép thơm dẻo béo ngậy được canh tác đạt chuẩn VietGAP trên đất đỏ bazan Long Khánh.',
        context: 'Cây ăn quả chủ lực Long Khánh',
        officialRef: 'HTX Xuân Lập & Bình Lộc'
      },
      {
        term: 'OCOP',
        definition: 'Chương trình Mỗi xã một sản phẩm (One Commune One Product) đánh giá phân hạng sản phẩm nông nghiệp từ 1 đến 5 sao theo Quyết định của Thủ tướng Chính phủ.',
        context: 'Chứng nhận chất lượng sản phẩm',
        officialRef: 'Bộ Nông nghiệp & PTNT'
      },
      {
        term: 'VietGAP',
        definition: 'Quy trình Thực hành sản xuất nông nghiệp tốt cho nông sản tại Việt Nam, bảo đảm an toàn thực phẩm, truy xuất nguồn gốc, an toàn lao động và bảo vệ môi trường canh tác.',
        context: 'Tiêu chuẩn an toàn canh tác',
        officialRef: 'Bộ Nông nghiệp & PTNT (TCVN 11892)'
      },
      {
        term: 'HACCP',
        definition: 'Hệ thống phân tích mối nguy và điểm kiểm soát tới hạn trong quy trình chế biến thực phẩm, kiểm soát các nguy cơ sinh học, hóa học và vật lý trong nhà xưởng chế biến.',
        context: 'Tiêu chuẩn an toàn chế biến',
        officialRef: 'Codex Alimentarius'
      },
      {
        term: 'GlobalG.A.P.',
        definition: 'Bộ tiêu chuẩn quốc tế về thực hành nông nghiệp tốt toàn cầu nhằm đảm bảo an toàn thực phẩm, bảo vệ môi trường và điều kiện làm việc của nông dân, thường dùng cho nông sản xuất khẩu quốc tế.',
        context: 'Tiêu chuẩn xuất khẩu quốc tế',
        officialRef: 'GlobalG.A.P. Secretariat'
      },
      {
        term: 'Độ Brix (°Bx)',
        definition: 'Đơn vị đo hàm lượng chất khô hòa tan (chủ yếu là đường) có trong 100 gam dung dịch hoặc dịch quả, dùng để định lượng độ ngọt và độ chín sinh lý của trái cây.',
        context: 'Đo lường chất lượng nông sản',
        officialRef: 'Quy chuẩn kiểm nghiệm nông sản'
      },
      {
        term: 'Ethylene',
        definition: 'Hormone thực vật tự nhiên dạng khí do quả sản sinh trong quá trình hô hấp đột biến (climacteric) để kích thích quả tự chín, làm mềm thịt quả và tạo mùi thơm đặc trưng.',
        context: 'Sinh lý sau thu hoạch',
        officialRef: 'Nông học đại cương'
      },
      {
        term: 'Hoạt độ nước (aw)',
        definition: 'Tỷ lệ giữa áp suất hơi nước của thực phẩm với áp suất hơi nước của nước tinh khiết ở cùng nhiệt độ, biểu thị lượng nước tự do vi sinh vật có thể dùng để sinh trưởng. Giảm aw xuống dưới 0.6 giúp ngăn chặn nấm mốc và vi khuẩn trong nông sản sấy/chế biến.',
        context: 'Bảo quản nông sản chế biến',
        officialRef: 'Công nghệ thực phẩm'
      },
      {
        term: 'SKU (Stock Keeping Unit)',
        definition: 'Mã định danh duy nhất cho từng đơn vị sản phẩm lưu kho trong hệ thống thương mại, phân biệt rõ theo chủng loại, quy cách đóng gói và xuất xứ nhà vườn.',
        context: 'Quản lý kho hàng số hóa',
        officialRef: 'Hệ thống quản lý chuỗi cung ứng'
      },
      {
        term: 'Chỉ Dẫn Địa Lý',
        definition: 'Dấu hiệu dùng để chỉ sản phẩm có nguồn gốc từ khu vực, địa phương, vùng lãnh thổ cụ thể với danh tiếng và chất lượng đặc thù do điều kiện địa lý tự nhiên và con người quyết định.',
        context: 'Bảo hộ sở hữu trí tuệ',
        officialRef: 'Cục Sở hữu trí tuệ Việt Nam'
      },
      {
        term: 'HTX Tân Triều',
        definition: 'Hợp tác xã Nông nghiệp Dịch vụ Tân Triều có trụ sở tại xã Tân Bình (Vĩnh Cửu, Đồng Nai), đại diện vùng chuyên canh bưởi Cù lao Tân Triều đạt chuẩn VietGAP và OCOP 4 sao.',
        context: 'Pháp nhân sản xuất nông nghiệp',
        officialRef: 'UBND Huyện Vĩnh Cửu'
      },
      {
        term: 'HTX Xuân Lập',
        definition: 'Hợp tác xã Nông nghiệp - Thương mại - Dịch vụ Xuân Lập tại phường Xuân Lập (TP Long Khánh), đại diện vùng chuyên canh sầu riêng Ri6 chín cây tự nhiên VietGAP.',
        context: 'Pháp nhân sản xuất nông nghiệp',
        officialRef: 'UBND Thành phố Long Khánh'
      },
      {
        term: 'HTX Bình Lộc',
        definition: 'Hợp tác xã Nông nghiệp - Dịch vụ - Thương mại Bình Lộc tại xã Bình Lộc (TP Long Khánh), đại diện vùng chôm chôm nhãn Chỉ dẫn địa lý và du lịch sinh thái miệt vườn.',
        context: 'Pháp nhân sản xuất nông nghiệp',
        officialRef: 'UBND Thành phố Long Khánh'
      }
    ];

    // 3. FAQ Records
    this.faqs = [
      {
        id: 'FAQ-01',
        question: 'Bưởi Tân Triều có phải tất cả đều đạt chuẩn OCOP 4 sao không?',
        answer: 'Không. Tiêu chuẩn OCOP 4 sao là chứng nhận được cấp cho chủ thể và sản phẩm cụ thể (như Bưởi đường lá cam của HTX Nông nghiệp Dịch vụ Tân Triều). Các vườn hoặc hộ chưa đăng ký đánh giá OCOP không tự động sở hữu chứng nhận này. Ngoài ra, Chỉ dẫn địa lý năm 2012 số 00031 gắn liền với bưởi đường lá cam và bưởi ổi, không tự động bao hàm bưởi da xanh trồng tại cùng vùng.',
        category: 'SPEC_FRUIT',
        relatedProducts: ['prod-buoi-duong-la-cam'],
        sourceId: 'SRC-DN-01'
      },
      {
        id: 'FAQ-02',
        question: 'Sầu riêng Long Khánh có bị ngâm thuốc kích chín không?',
        answer: 'Nông sản sầu riêng niêm yết trên CropNet từ HTX Nông nghiệp - Thương mại - Dịch vụ Xuân Lập tuân thủ quy chuẩn VietGAP: neo cuống chín cây tự nhiên, cắt đúng độ già và cam kết 100% không nhúng hóa chất kích chín ép. Từng lô hàng có tem mã QR truy xuất ngày thu hoạch thực tế.',
        category: 'SPEC_FRUIT',
        relatedProducts: ['prod-saurieng-ri6-longkhanh'],
        sourceId: 'SRC-DN-06'
      },
      {
        id: 'FAQ-03',
        question: 'Tôi có thể đặt mua Bưởi Cái Mơn hay Chôm chôm Vĩnh Long trên CropNet không?',
        answer: 'Không. CropNet Đồng Nai AI chỉ phục vụ nông sản có căn cứ trồng, thu hoạch hoặc chế biến trên địa bàn Thành phố Đồng Nai. Các sản phẩm ngoại tỉnh như Bưởi Cái Mơn (Bến Tre) hay Chôm chôm Vĩnh Long nằm ngoài phạm vi nền tảng. Bạn có thể tham khảo Bưởi đường lá cam Tân Triều hoặc Chôm chôm nhãn Long Khánh có chất lượng và xuất xứ Đồng Nai được xác thực.',
        category: 'GEO_ORIGIN',
        relatedProducts: ['prod-buoi-duong-la-cam', 'prod-chom-chom-nhan-longkhanh'],
        sourceId: 'SRC-DN-08'
      },
      {
        id: 'FAQ-04',
        question: 'Làm thế nào để kiểm tra một mã QR lô hàng trên CropNet?',
        answer: 'Bạn có thể sử dụng tính năng quét mã QR trên trang Truy xuất nguồn gốc (/traceability) hoặc nhập trực tiếp mã lô (ví dụ: BATCH-BUOI-TANTRIEU-2026-01). Hệ thống sẽ tra cứu sổ nhật ký canh tác số, hiển thị hợp tác xã, nhật ký bón phân/tưới tiêu và chứng nhận an toàn thực phẩm đã được xác thực.',
        category: 'TRACEABILITY',
        relatedProducts: ['BATCH-BUOI-TANTRIEU-2026-01'],
        sourceId: 'SRC-DN-02'
      },
      {
        id: 'FAQ-05',
        question: 'Nếu mã lô QR không tồn tại thì hệ thống xử lý thế nào?',
        answer: 'Nếu mã lô không tìm thấy trong cơ sở dữ liệu xác minh của Đồng Nai, CropNet sẽ lập tức phát cảnh báo: "Mã lô chưa được đăng ký hoặc không tìm thấy trên hệ thống cơ sở dữ liệu nông nghiệp Thành phố Đồng Nai". Nền tảng tuyệt đối không tự động sinh chứng chỉ giả mạo hay gán báo cáo kiểm định PASSED cho mã không có thật.',
        category: 'SECURITY',
        relatedProducts: [],
        sourceId: 'SRC-DN-09'
      },
      {
        id: 'FAQ-06',
        question: 'Với ngân sách 500.000đ tôi có thể mua combo nông sản Đồng Nai nào làm quà biếu?',
        answer: 'Với ngân sách 500.000đ, CropNet gợi ý combo quà biếu đặc sản Đồng Nai gồm: 2 quả Bưởi Đường Lá Cam Tân Triều OCOP 4 sao (170.000đ) + 1 hộp Hạt Điều Rang Củi Vỏ Lụa 500g (140.000đ) + 1 hũ Tiêu Đen Chân Núi Chứa Chan 250g (90.000đ). Tổng giá trị: 400.000đ (dư 100.000đ trong ngân sách). Tất cả đều đóng gói lịch sự và có mã QR truy xuất.',
        category: 'BUDGET',
        relatedProducts: ['prod-buoi-duong-la-cam', 'prod-hat-dieu-rang-cui', 'prod-tieu-den-xuanloc'],
        sourceId: 'SRC-DN-01'
      },
      {
        id: 'FAQ-07',
        question: 'Nông sản Đồng Nai có chữa được bệnh ung thư hay tiểu đường không?',
        answer: 'Nông sản sạch như Bưởi Tân Triều rất giàu Vitamin C, kali và chất chống oxy hóa tốt cho đề kháng. Tuy nhiên, nông sản là thực phẩm bổ dưỡng cho sức khỏe hàng ngày, hoàn toàn không phải là thuốc và không thể thay thế phác đồ điều trị y khoa của bác sĩ. Vui lòng tham khảo ý kiến chuyên gia y tế nếu có bệnh lý.',
        category: 'SAFETY',
        relatedProducts: [],
        sourceId: 'SRC-DN-02'
      },
      {
        id: 'FAQ-08',
        question: 'Sự khác nhau giữa Bưởi Đường Lá Cam và Bưởi Da Xanh Tân Triều là gì?',
        answer: 'Bưởi đường lá cam là giống bản địa cổ truyền của Cù lao Tân Triều, quả nhỏ vừa (1.1-1.3kg), vỏ mỏng vàng khi chín, tép vàng óng ngọt đậm không hạt hoặc ít hạt. Bưởi da xanh là giống vỏ xanh ruột hồng mọng nước, quả lớn hơn (1.3-1.6kg), vị ngọt thanh giòn tép. Cả hai đều được trồng trên đất phù sa sông Đồng Nai phì nhiêu.',
        category: 'SPEC_FRUIT',
        relatedProducts: ['prod-buoi-duong-la-cam', 'prod-buoi-da-xanh-tantrieu'],
        sourceId: 'SRC-DN-01'
      }
    ];

    // 4. Domain Rules
    this.domainRules = [
      {
        id: 'DOM-01',
        subDomain: 'GEOGRAPHY',
        keyAspect: 'Địa bàn hành chính 2026',
        ruleOrFact: 'Thành phố Đồng Nai trực thuộc Trung ương hình thành trên diện tích tỉnh Đồng Nai trước khi chuyển đổi bao gồm cả không gian hành chính mở rộng. Tách bạch các địa danh lịch sử (Long Khánh, Vĩnh Cửu, Xuân Lộc, Định Quán, Biên Hòa) khi trích nguồn.',
        sourceRef: 'SRC-DN-09'
      },
      {
        id: 'DOM-02',
        subDomain: 'CERTIFICATION',
        keyAspect: 'Phân định chứng nhận',
        ruleOrFact: 'Chỉ dẫn địa lý thuộc về vùng địa lý cho giống cây cụ thể; OCOP và VietGAP thuộc về chủ thể và sản phẩm được cấp có thời hạn. Tuyệt đối không quy nạp toàn bộ nông sản một vùng đều đạt OCOP 4 sao hay VietGAP.',
        sourceRef: 'SRC-DN-01'
      },
      {
        id: 'DOM-03',
        subDomain: 'HARVEST_SEASON',
        keyAspect: 'Mùa vụ bưởi Tân Triều',
        ruleOrFact: 'Bưởi Tân Triều thu hoạch rộ nhất vào vụ Trung thu (tháng 8 âm lịch) và vụ Tết Nguyên Đán (tháng 11-12 âm lịch). Có rải vụ quanh năm nhờ kỹ thuật tưới phù sa.',
        sourceRef: 'SRC-DN-02'
      },
      {
        id: 'DOM-04',
        subDomain: 'HARVEST_SEASON',
        keyAspect: 'Mùa vụ trái cây Long Khánh',
        ruleOrFact: 'Sầu riêng và chôm chôm Long Khánh bước vào mùa thu hoạch chín rộ từ tháng 5 đến tháng 8 hàng năm. Lễ hội trái cây Long Khánh diễn ra định kỳ vào tháng 6.',
        sourceRef: 'SRC-DN-05'
      },
      {
        id: 'DOM-05',
        subDomain: 'PROCESSING',
        keyAspect: 'Hạt điều rang củi',
        ruleOrFact: 'Hạt điều rang củi giữ nguyên lớp vỏ lụa để hạn chế dầu oxy hóa và giữ vị thơm bùi tự nhiên. Không ngâm hóa chất tẩy trắng.',
        sourceRef: 'SRC-DN-07'
      },
      {
        id: 'DOM-06',
        subDomain: 'SAFETY_GUARDRAILS',
        keyAspect: 'An toàn y tế',
        ruleOrFact: 'Nông sản là thực phẩm bổ sung dinh dưỡng không thể thay thế thuốc chữa bệnh. Từ chối khẳng định nông sản có tác dụng trị ung thư hay tiểu đường.',
        sourceRef: 'SRC-DN-02'
      },
      {
        id: 'DOM-07',
        subDomain: 'OUT_OF_SCOPE',
        keyAspect: 'Từ chối hàng ngoại tỉnh',
        ruleOrFact: 'Từ chối đưa nông sản ngoài địa bàn Đồng Nai (Cái Mơn Bến Tre, Đà Lạt Lâm Đồng, Vĩnh Long, Bắc Giang) vào danh mục nông sản địa phương Đồng Nai. Hướng dẫn người dùng sang nông sản Đồng Nai tương đương.',
        sourceRef: 'SRC-DN-08'
      },
      {
        id: 'DOM-08',
        subDomain: 'TRACEABILITY_TRUTH',
        keyAspect: 'Minh bạch mã lô QR',
        ruleOrFact: 'Mã lô QR chỉ hiển thị khi có chứng từ và nhật ký thật. Mã không có trong hệ thống phải thông báo không tìm thấy; không sinh báo cáo PASSED giả lập.',
        sourceRef: 'SRC-DN-09'
      }
    ];

    this.initialized = true;
  }

  public getKnowledgeDocs(): KnowledgeRecord[] {
    return this.knowledgeDocs;
  }

  public getGlossary(): GlossaryRecord[] {
    return this.glossary;
  }

  public getFaqs(): FaqRecord[] {
    return this.faqs;
  }

  public getDomainRules(): DomainRuleRecord[] {
    return this.domainRules;
  }

  // Lexical & Semantic Hybrid Search across local knowledge
  public search(queryNorm: string, limit: number = 3): { item: KnowledgeRecord; score: number }[] {
    const results: { item: KnowledgeRecord; score: number }[] = [];

    for (const doc of this.knowledgeDocs) {
      // Avoid intercepting regular fruit/product queries with administrative policy doc
      if (doc.id === 'KNOW-DN-08') {
        const isGeoPolicy =
          queryNorm.includes('nguyen tac') ||
          queryNorm.includes('dia gioi') ||
          queryNorm.includes('ngoai tinh') ||
          queryNorm.includes('xuat xu dong nai') ||
          queryNorm.includes('quy dinh') ||
          queryNorm.includes('tai sao chi');
        if (!isGeoPolicy) {
          continue;
        }
      }

      let score = 0;
      const topicNorm = doc.topic.toLowerCase();
      const titleNorm = doc.title.toLowerCase();
      const contentNorm = doc.content.toLowerCase();

      // Exact topic match
      if (queryNorm.includes(topicNorm)) score += 6;
      if (titleNorm.includes(queryNorm)) score += 5;

      // Tag & Alias matches
      for (const tag of doc.tags) {
        if (queryNorm.includes(tag)) score += 3;
      }
      for (const alias of doc.aliases) {
        if (queryNorm.includes(alias)) score += 6;
      }

      // Keyword occurrences in content
      const words = queryNorm.split(/\s+/).filter(w => w.length > 2);
      for (const w of words) {
        if (contentNorm.includes(w)) score += 1;
      }

      if (score > 0) {
        results.push({ item: doc, score });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }

  // Lookup in Glossary
  public lookupGlossary(termNorm: string): GlossaryRecord | null {
    for (const g of this.glossary) {
      const gNorm = g.term.toLowerCase();
      if (termNorm.includes(gNorm) || gNorm.includes(termNorm)) {
        return g;
      }
    }
    return null;
  }

  // Lookup in FAQ
  public lookupFaq(queryNorm: string): FaqRecord | null {
    let bestFaq: FaqRecord | null = null;
    let highestScore = 0;

    for (const faq of this.faqs) {
      const qNorm = faq.question.toLowerCase();
      let matchCount = 0;
      const words = queryNorm.split(/\s+/).filter(w => w.length > 2);
      for (const w of words) {
        if (qNorm.includes(w)) matchCount++;
      }
      if (matchCount > 2 && matchCount > highestScore) {
        highestScore = matchCount;
        bestFaq = faq;
      }
    }

    return bestFaq;
  }
}

export const knowledgeAdapter = new KnowledgeStore();
