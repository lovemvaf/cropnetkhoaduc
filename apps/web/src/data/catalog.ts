export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Supplier {
  id: string;
  farmName: string;
  address: string;
  latitude: number;
  longitude: number;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  description: string;
  certifications: string[];
  representative?: string;
  phone?: string;
}

export interface ProductVariant {
  name: string;
  price: number;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  stock: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  supplierId: string;
  supplier: Supplier;
  category: { name: string };
  imageUrl: string;
  images: { url: string }[];
  tags: string[];
  variants?: ProductVariant[];
  originClaim: string;
  cultivar: string;
  certificationProof: string;
}

export interface TraceBatch {
  id: string;
  batchCode: string;
  productId: string;
  productName: string;
  harvestDate: string;
  farmingArea: string;
  farmingProcess: string;
  testedStatus: string;
  certifications: {
    id: string;
    name: string;
    issuer: string;
    validUntil: string;
    imageUrl?: string;
    status: 'APPROVED' | 'PENDING';
  }[];
  supplier: Supplier;
  product: {
    name: string;
    price: number;
    unit: string;
    imageUrl: string;
    supplier: Supplier;
  };
}

export const VERIFIED_CATEGORIES: Category[] = [
  { id: 'cat-fruits', name: 'Trái Cây Đặc Sản Đồng Nai', slug: 'trai-cay-dac-san' },
  { id: 'cat-processed', name: 'Nông Sản Chế Biến Truyền Thống', slug: 'nong-san-che-bien' },
  { id: 'cat-spices', name: 'Gia Vị & Nông Sản Khác', slug: 'gia-vi-nong-san-khac' }
];

export const VERIFIED_SUPPLIERS: Supplier[] = [
  {
    id: 'htx-tantrieu',
    farmName: 'Hợp Tác Xã Nông Nghiệp Dịch Vụ Tân Triều',
    address: 'Ấp Vĩnh Hiệp, Xã Tân Bình (Cù lao Tân Triều), Huyện Vĩnh Cửu, Thành phố Đồng Nai',
    latitude: 11.0267,
    longitude: 106.8835,
    status: 'APPROVED',
    description: 'Vùng trồng bưởi đường lá cam và bưởi da xanh Cù lao Tân Triều trứ danh, bồi đắp bởi các nhánh sông Đồng Nai.',
    certifications: ['Chỉ dẫn địa lý Bưởi Tân Triều 00031', 'OCOP 4 Sao Tỉnh Đồng Nai', 'VietGAP Trồng trọt'],
    representative: 'Ban Quản Trị HTX Nông Nghiệp Tân Triều',
    phone: '0251.385.1234'
  },
  {
    id: 'htx-xuanlap',
    farmName: 'Hợp Tác Xã Nông nghiệp - Thương mại - Dịch vụ Xuân Lập',
    address: 'Khu phố Phú Mỹ, Phường Xuân Lập, Thành phố Long Khánh, Thành phố Đồng Nai',
    latitude: 10.9258,
    longitude: 107.2412,
    status: 'APPROVED',
    description: 'Vùng chuyên canh sầu riêng Ri6 và Dona trên đất đỏ bazan Long Khánh, cam kết neo cuống già chín cây tự nhiên không ngâm thuốc.',
    certifications: ['VietGAP Canh Tác Chuỗi Cung Ứng', 'Chuẩn sinh thái không hóa chất thúc chín'],
    representative: 'Ban Giám Đốc HTX Nông Nghiệp Xuân Lập',
    phone: '0251.387.5678'
  },
  {
    id: 'htx-binhloc',
    farmName: 'Hợp Tác Xã Nông nghiệp - Dịch vụ - Thương mại Bình Lộc',
    address: 'Ấp 2, Xã Bình Lộc, Thành phố Long Khánh, Thành phố Đồng Nai',
    latitude: 10.9580,
    longitude: 107.2580,
    status: 'APPROVED',
    description: 'Thủ phủ cây ăn trái Long Khánh: chôm chôm nhãn cùi dày giòn ngọt tróc hạt, chôm chôm Java và du lịch sinh thái miệt vườn.',
    certifications: ['Chỉ dẫn địa lý Chôm chôm Long Khánh 00080 Cục SHTT', 'VietGAP'],
    representative: 'Ban Quản Trị HTX Bình Lộc',
    phone: '0251.389.9101'
  },
  {
    id: 'cs-dieu-dinhquan',
    farmName: 'Cơ Sở Chế Biến Nông Sản Sạch Định Quán',
    address: 'Khu quy hoạch chế biến nông sản sạch Huyện Định Quán, Thành phố Đồng Nai',
    latitude: 11.2350,
    longitude: 107.1680,
    status: 'APPROVED',
    description: 'Xưởng chế biến hạt điều rang củi vỏ lụa truyền thống từ vùng nguyên liệu điều đồi dốc bazan Đông Nam Bộ.',
    certifications: ['HACCP Codex Quốc Tế', 'ISO 22000:2018'],
    representative: 'Đại diện cơ sở chế biến Định Quán'
  },
  {
    id: 'cs-namhue-tantrieu',
    farmName: 'Cơ Sở Rượu Bưởi Truyền Thống Năm Huệ Tân Triều',
    address: 'Cù lao Tân Triều, Xã Tân Bình, Huyện Vĩnh Cửu, Thành phố Đồng Nai',
    latitude: 11.0310,
    longitude: 106.8790,
    status: 'APPROVED',
    description: 'Làng nghề ủ rượu bưởi truyền thống lên men tự nhiên từ bưởi Tân Triều, nung trong bình gốm mỹ nghệ Biên Hòa.',
    certifications: ['OCOP 3 Sao Tỉnh Đồng Nai', 'Chứng nhận ATVSTP Sở Công Thương']
  },
  {
    id: 'htx-xuanloc',
    farmName: 'Tổ Hợp Tác Nông Nghiệp Núi Chứa Chan Xuân Lộc',
    address: 'Khu vực chân núi Chứa Chan, Huyện Xuân Lộc, Thành phố Đồng Nai',
    latitude: 10.9325,
    longitude: 107.3820,
    status: 'APPROVED',
    description: 'Vùng canh tác hồ tiêu và cây ăn trái lâu năm trên nền đất đá núi lửa phong hóa Chứa Chan.',
    certifications: ['Canh tác sinh thái tự nhiên', 'Chứng nhận chuỗi an toàn thực phẩm']
  }
];

export const VERIFIED_PRODUCTS: Product[] = [
  {
    id: 'prod-buoi-duong-la-cam',
    categoryId: 'cat-fruits',
    name: 'Bưởi Đường Lá Cam Tân Triều (OCOP 4 Sao)',
    description: 'Bưởi đường lá cam trứ danh Cù lao Tân Triều, vỏ mỏng vàng ươm khi chín, tép bưởi mọng nước vàng óng, vị ngọt thanh sâu lắng và không the đắng. Canh tác bồi đắp phù sa sông Đồng Nai theo quy chuẩn VietGAP.',
    price: 85000,
    unit: 'quả (1.1kg - 1.3kg)',
    stock: 150,
    status: 'ACTIVE',
    createdAt: '2026-10-01T08:00:00.000Z',
    supplierId: 'htx-tantrieu',
    supplier: VERIFIED_SUPPLIERS[0],
    category: { name: 'Trái Cây Đặc Sản Đồng Nai' },
    imageUrl: '/assets/nongsan/buoi-duong-la-cam.jpg',
    images: [{ url: '/assets/nongsan/buoi-duong-la-cam.jpg' }, { url: '/assets/nongsan/buoi-da-xanh-tantrieu.jpg' }],
    tags: ['OCOP 4 Sao', 'Bưởi Tân Triều', 'VietGAP', 'Đặc sản Đồng Nai', 'Chỉ dẫn địa lý'],
    variants: [
      { name: 'Quả tiêu chuẩn (1.1kg - 1.3kg)', price: 85000 },
      { name: 'Quả chọn tuyển VIP (1.4kg+)', price: 110000 },
      { name: 'Cặp quả biếu quà Tân Triều', price: 195000 }
    ],
    originClaim: 'Trồng và thu hoạch tại Cù lao Tân Triều, Vĩnh Cửu, Thành phố Đồng Nai',
    cultivar: 'Bưởi đường lá cam (Citrus maxima)',
    certificationProof: 'Chỉ dẫn địa lý số 00031 năm 2012; Quyết định OCOP UBND tỉnh Đồng Nai'
  },
  {
    id: 'prod-buoi-da-xanh-tantrieu',
    categoryId: 'cat-fruits',
    name: 'Bưởi Da Xanh Trồng Tại Vùng Cù Lao Tân Triều',
    description: 'Bưởi da xanh ruột hồng đào mọng nước, vỏ xanh bóng, vị ngọt đậm giòn tép và ít hạt. Canh tác theo quy chuẩn VietGAP an toàn sinh thái tại cù lao Tân Triều huyện Vĩnh Cửu.',
    price: 75000,
    unit: 'quả (1.3kg - 1.5kg)',
    stock: 120,
    status: 'ACTIVE',
    createdAt: '2026-10-02T08:00:00.000Z',
    supplierId: 'htx-tantrieu',
    supplier: VERIFIED_SUPPLIERS[0],
    category: { name: 'Trái Cây Đặc Sản Đồng Nai' },
    imageUrl: '/assets/nongsan/buoi-da-xanh-tantrieu.jpg',
    images: [{ url: '/assets/nongsan/buoi-da-xanh-tantrieu.jpg' }],
    tags: ['Bưởi Tân Triều', 'VietGAP', 'Sinh thái cù lao'],
    variants: [
      { name: 'Quả vừa (1.3kg)', price: 75000 },
      { name: 'Quả lớn chọn lọc (1.5kg+)', price: 95000 }
    ],
    originClaim: 'Giống bưởi da xanh canh tác tại đất cù lao Tân Triều, Vĩnh Cửu, Đồng Nai',
    cultivar: 'Bưởi da xanh (Citrus maxima)',
    certificationProof: 'Chứng nhận VietGAP Trồng trọt HTX Tân Triều'
  },
  {
    id: 'prod-saurieng-ri6-longkhanh',
    categoryId: 'cat-fruits',
    name: 'Sầu Riêng Ri6 Long Khánh (Chín Cây Tự Nhiên)',
    description: 'Sầu riêng Ri6 đất đỏ bazan Long Khánh, cơm vàng hạt lép thơm dẻo béo ngậy. HTX Xuân Lập cam kết neo cuống già chín cây tự nhiên 100%, tuyệt đối không thu hái trái non và không nhúng thuốc kích chín.',
    price: 135000,
    unit: 'kg (trái 2.5kg - 3.5kg)',
    stock: 80,
    status: 'ACTIVE',
    createdAt: '2026-10-03T08:00:00.000Z',
    supplierId: 'htx-xuanlap',
    supplier: VERIFIED_SUPPLIERS[1],
    category: { name: 'Trái Cây Đặc Sản Đồng Nai' },
    imageUrl: '/assets/nongsan/sau-rieng-ri6-longkhanh.jpg',
    images: [{ url: '/assets/nongsan/sau-rieng-ri6-longkhanh.jpg' }],
    tags: ['VietGAP', 'Sầu riêng Long Khánh', 'Chín tự nhiên', 'Không nhúng thuốc'],
    variants: [
      { name: 'Trái nguyên quả chín rụng (2.5kg - 3.5kg)', price: 135000 },
      { name: 'Hộp cơm sầu riêng tách sẵn (500g)', price: 180000 }
    ],
    originClaim: 'Canh tác trên đất đỏ bazan tại phường Xuân Lập, TP Long Khánh, Đồng Nai',
    cultivar: 'Sầu riêng Ri6 (Durio zibethinus)',
    certificationProof: 'Chứng nhận VietGAP Chuỗi cung ứng an toàn thực phẩm'
  },
  {
    id: 'prod-chom-chom-nhan-longkhanh',
    categoryId: 'cat-fruits',
    name: 'Chôm Chôm Nhãn Long Khánh Giòn Ngọt',
    description: 'Chôm chôm nhãn quả tròn nhỏ râu ngắn, vỏ vàng ửng đỏ, cùi dày giòn tróc hạt, vị ngọt lịm đặc trưng. Đạt Chỉ dẫn địa lý Chôm chôm Long Khánh số 00080 của Cục Sở hữu trí tuệ.',
    price: 45000,
    unit: 'kg (chùm quả tươi hái trong ngày)',
    stock: 200,
    status: 'ACTIVE',
    createdAt: '2026-10-04T08:00:00.000Z',
    supplierId: 'htx-binhloc',
    supplier: VERIFIED_SUPPLIERS[2],
    category: { name: 'Trái Cây Đặc Sản Đồng Nai' },
    imageUrl: '/assets/nongsan/chom-chom-nhan-longkhanh.jpg',
    images: [{ url: '/assets/nongsan/chom-chom-nhan-longkhanh.jpg' }],
    tags: ['Chỉ dẫn địa lý 00080', 'Chôm chôm Long Khánh', 'Bình Lộc', 'VietGAP'],
    originClaim: 'Thu hoạch từ các nhà vườn xã viên tại xã Bình Lộc, TP Long Khánh, Đồng Nai',
    cultivar: 'Chôm chôm nhãn (Nephelium lappaceum)',
    certificationProof: 'Chỉ dẫn địa lý số 00080 Cục Sở hữu trí tuệ'
  },
  {
    id: 'prod-hat-dieu-rang-cui',
    categoryId: 'cat-processed',
    name: 'Hạt Điều Rang Củi Vỏ Lụa Đồng Nai',
    description: 'Hạt điều rang củi thủ công giữ nguyên vỏ lụa từ vùng nguyên liệu Đông Nam Bộ, phân loại chuẩn kích cỡ W240, giòn tan bùi béo tự nhiên không hóa chất bảo quản. Đạt tiêu chuẩn quốc tế HACCP.',
    price: 140000,
    unit: 'hộp 500g (hút chân không)',
    stock: 95,
    status: 'ACTIVE',
    createdAt: '2026-10-05T08:00:00.000Z',
    supplierId: 'cs-dieu-dinhquan',
    supplier: VERIFIED_SUPPLIERS[3],
    category: { name: 'Nông Sản Chế Biến Truyền Thống' },
    imageUrl: '/assets/nongsan/hat-dieu-rang-cui.jpg',
    images: [{ url: '/assets/nongsan/hat-dieu-rang-cui.jpg' }],
    tags: ['HACCP', 'Hạt điều Đồng Nai', 'Rang củi vỏ lụa', 'Định Quán'],
    variants: [
      { name: 'Hộp 500g hút chân không', price: 140000 },
      { name: 'Combo 2 hộp 1kg quà biếu', price: 270000 }
    ],
    originClaim: 'Chế biến và đóng gói tại huyện Định Quán, Thành phố Đồng Nai',
    cultivar: 'Hạt điều rang củi (Anacardium occidentale)',
    certificationProof: 'Chứng nhận Hệ thống HACCP Codex & ISO 22000'
  },
  {
    id: 'prod-ruou-buoi-tan-trieu',
    categoryId: 'cat-processed',
    name: 'Rượu Bưởi Truyền Thống Năm Huệ Tân Triều',
    description: 'Rượu bưởi đặc sản lên men tự nhiên từ nước cốt bưởi đường lá cam cù lao Tân Triều, ủ trong bình gốm mỹ nghệ Biên Hòa. Nồng độ êm dịu thơm nồng vị bưởi, đạt chuẩn OCOP 3 sao tỉnh Đồng Nai.',
    price: 195000,
    unit: 'bình gốm 750ml',
    stock: 60,
    status: 'ACTIVE',
    createdAt: '2026-10-06T08:00:00.000Z',
    supplierId: 'cs-namhue-tantrieu',
    supplier: VERIFIED_SUPPLIERS[4],
    category: { name: 'Nông Sản Chế Biến Truyền Thống' },
    imageUrl: '/assets/nongsan/placeholder-nongsan.svg',
    images: [{ url: '/assets/nongsan/placeholder-nongsan.svg' }],
    tags: ['OCOP 3 Sao', 'Rượu bưởi Tân Triều', 'Bình gốm quà tặng'],
    originClaim: 'Chế biến lên men tại cù lao Tân Triều, Vĩnh Cửu, Thành phố Đồng Nai',
    cultivar: 'Rượu bưởi lên men thủ công',
    certificationProof: 'OCOP 3 Sao Tỉnh Đồng Nai; Giấy chứng nhận ATVSTP'
  },
  {
    id: 'prod-tieu-den-xuanloc',
    categoryId: 'cat-spices',
    name: 'Tiêu Đen Chân Núi Chứa Chan Xuân Lộc',
    description: 'Hạt tiêu đen chắc mẩy phơi sấy tự nhiên từ vùng đồi dốc bazan núi Chứa Chan, hạt cay nồng đượm vị và thơm nức. Đóng hũ thủy tinh tiện dụng cho bếp ăn gia đình.',
    price: 90000,
    unit: 'hũ 250g',
    stock: 110,
    status: 'ACTIVE',
    createdAt: '2026-10-07T08:00:00.000Z',
    supplierId: 'htx-xuanloc',
    supplier: VERIFIED_SUPPLIERS[5],
    category: { name: 'Gia Vị & Nông Sản Khác' },
    imageUrl: '/assets/nongsan/tieu-den-xuanloc.jpg',
    images: [{ url: '/assets/nongsan/tieu-den-xuanloc.jpg' }],
    tags: ['Tiêu Xuân Lộc', 'Núi Chứa Chan', 'Gia vị sạch'],
    originClaim: 'Thu hoạch tại vùng chuyên canh hồ tiêu chân núi Chứa Chan, Xuân Lộc, Đồng Nai',
    cultivar: 'Tiêu đen khô (Piper nigrum)',
    certificationProof: 'Chứng nhận liên kết chuỗi sản xuất nông sản an toàn Xuân Lộc'
  }
];

export const VERIFIED_BATCHES: Record<string, TraceBatch> = {
  'BATCH-BUOI-TANTRIEU-2026-01': {
    id: 'batch-buoi-tantrieu-01',
    batchCode: 'BATCH-BUOI-TANTRIEU-2026-01',
    productId: 'prod-buoi-duong-la-cam',
    productName: 'Bưởi Đường Lá Cam Tân Triều (OCOP 4 Sao)',
    harvestDate: '2026-10-10T06:30:00.000Z',
    farmingArea: 'Vườn mẫu liếp 04 - HTX Nông nghiệp Tân Triều, Xã Tân Bình, Vĩnh Cửu, Thành phố Đồng Nai',
    farmingProcess: 'Canh tác sinh thái kết hợp quy trình VietGAP. Bón phân hữu cơ vi sinh ủ bã trấu, tưới nước phù sa sông Đồng Nai, bao bọc túi thoáng khí chống ruồi đục quả không dùng thuốc trừ sâu hóa học.',
    testedStatus: 'PASSED (Không phát hiện dư lượng thuốc BVTV theo TCVN 11892-1:2017)',
    certifications: [
      {
        id: 'cert-vietgap-tantrieu',
        name: 'Chứng nhận VietGAP Trồng trọt Đồng Nai',
        issuer: 'Chi cục Trồng trọt và Bảo vệ Thực vật Đồng Nai',
        validUntil: '2028-12-31T00:00:00.000Z',
        status: 'APPROVED'
      },
      {
        id: 'cert-ocop-tantrieu',
        name: 'Giấy chứng nhận OCOP 4 Sao Tỉnh Đồng Nai',
        issuer: 'UBND Tỉnh Đồng Nai - Quyết định xếp hạng OCOP cấp tỉnh',
        validUntil: '2028-06-30T00:00:00.000Z',
        status: 'APPROVED'
      }
    ],
    supplier: VERIFIED_SUPPLIERS[0],
    product: {
      name: 'Bưởi Đường Lá Cam Tân Triều (OCOP 4 Sao)',
      price: 85000,
      unit: 'quả (1.1kg - 1.3kg)',
      imageUrl: '/assets/nongsan/buoi-duong-la-cam.jpg',
      supplier: VERIFIED_SUPPLIERS[0]
    }
  },
  'BATCH-SAURIENG-LONGKHANH-2026-01': {
    id: 'batch-saurieng-longkhanh-01',
    batchCode: 'BATCH-SAURIENG-LONGKHANH-2026-01',
    productId: 'prod-saurieng-ri6-longkhanh',
    productName: 'Sầu Riêng Ri6 Long Khánh (Chín Cây Tự Nhiên)',
    harvestDate: '2026-10-12T07:00:00.000Z',
    farmingArea: 'Khu vườn mẫu số 2 - HTX Nông nghiệp Xuân Lập, Phường Xuân Lập, TP Long Khánh, Thành phố Đồng Nai',
    farmingProcess: 'Đất đỏ bazan màu mỡ. Neo từng cuống trái bằng dây bảo vệ chuyên dụng, thu hoạch đúng độ già chín rụng tự nhiên, cam kết không nhúng thuốc kích chín ép.',
    testedStatus: 'PASSED (Đạt tiêu chuẩn an toàn thực phẩm chuỗi cung ứng VietGAP)',
    certifications: [
      {
        id: 'cert-vietgap-xuanlap',
        name: 'Chứng nhận VietGAP Chuỗi Cung Ứng Trái Cây',
        issuer: 'Tổ chức Chứng nhận Nông nghiệp Sinh thái Việt Nam',
        validUntil: '2027-10-15T00:00:00.000Z',
        status: 'APPROVED'
      }
    ],
    supplier: VERIFIED_SUPPLIERS[1],
    product: {
      name: 'Sầu Riêng Ri6 Long Khánh (Chín Cây Tự Nhiên)',
      price: 135000,
      unit: 'kg (trái 2.5kg - 3.5kg)',
      imageUrl: '/assets/nongsan/sau-rieng-ri6-longkhanh.jpg',
      supplier: VERIFIED_SUPPLIERS[1]
    }
  },
  'BATCH-CHOMCHOM-BINHLOC-2026-01': {
    id: 'batch-chomchom-binhloc-01',
    batchCode: 'BATCH-CHOMCHOM-BINHLOC-2026-01',
    productId: 'prod-chom-chom-nhan-longkhanh',
    productName: 'Chôm Chôm Nhãn Long Khánh Giòn Ngọt',
    harvestDate: '2026-10-11T05:30:00.000Z',
    farmingArea: 'Vườn sinh thái Ấp 2 - HTX Nông nghiệp Bình Lộc, Xã Bình Lộc, TP Long Khánh, Thành phố Đồng Nai',
    farmingProcess: 'Tưới tiêu vi sinh tự động, thu hái tươi bằng tay từng chùm quả vào sáng sớm, bảo quản thoáng khí giao trong ngày.',
    testedStatus: 'PASSED (Chỉ số kiểm định vi sinh và kim loại nặng đạt chuẩn TCVN)',
    certifications: [
      {
        id: 'cert-cddl-chomchom',
        name: 'Văn bằng Chỉ dẫn Địa lý Chôm Chôm Long Khánh số 00080',
        issuer: 'Cục Sở hữu trí tuệ - Bộ Khoa học và Công nghệ',
        validUntil: '2030-01-01T00:00:00.000Z',
        status: 'APPROVED'
      }
    ],
    supplier: VERIFIED_SUPPLIERS[2],
    product: {
      name: 'Chôm Chôm Nhãn Long Khánh Giòn Ngọt',
      price: 45000,
      unit: 'kg (chùm quả tươi hái trong ngày)',
      imageUrl: '/assets/nongsan/chom-chom-nhan-longkhanh.jpg',
      supplier: VERIFIED_SUPPLIERS[2]
    }
  },
  'BATCH-HATDIEU-DONGNAI-2026-01': {
    id: 'batch-hatdieu-dongnai-01',
    batchCode: 'BATCH-HATDIEU-DONGNAI-2026-01',
    productId: 'prod-hat-dieu-rang-cui',
    productName: 'Hạt Điều Rang Củi Vỏ Lụa Đồng Nai',
    harvestDate: '2026-10-08T09:00:00.000Z',
    farmingArea: 'Phân xưởng chế biến nông sản sạch Định Quán, Huyện Định Quán, Thành phố Đồng Nai',
    farmingProcess: 'Chọn lọc hạt chuẩn W240, rang củi thủ công giữ nguyên vỏ lụa, hút chân không và đóng hộp tại phòng vô trùng.',
    testedStatus: 'PASSED (HACCP Codex & Kiểm định vi sinh ATTP số DN-HACCP-2026-44)',
    certifications: [
      {
        id: 'cert-haccp-dieu',
        name: 'Chứng nhận Hệ Thống Quản Lý ATTP HACCP Codex',
        issuer: 'Tổ chức Đánh giá và Chứng nhận Quốc tế VNCert',
        validUntil: '2028-05-20T00:00:00.000Z',
        status: 'APPROVED'
      }
    ],
    supplier: VERIFIED_SUPPLIERS[3],
    product: {
      name: 'Hạt Điều Rang Củi Vỏ Lụa Đồng Nai',
      price: 140000,
      unit: 'hộp 500g (hút chân không)',
      imageUrl: '/assets/nongsan/hat-dieu-rang-cui.jpg',
      supplier: VERIFIED_SUPPLIERS[3]
    }
  }
};
