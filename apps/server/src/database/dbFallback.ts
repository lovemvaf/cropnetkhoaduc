import bcrypt from 'bcryptjs';

export interface MockUser {
  id: string;
  email: string;
  passwordHash?: string;
  fullName: string;
  role: string;
  status: string;
  supplierId: string | null;
  supplierStatus: string | null;
  isEmailVerified?: boolean;
  verificationToken?: string | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
}

export let mockUsersList: MockUser[] = [
  { id: 'mock-admin-id', email: 'admin@cropnet.vn', fullName: 'Ban Quản Trị CropNet Đồng Nai', role: 'ADMIN', status: 'ACTIVE', supplierId: null, supplierStatus: null, isEmailVerified: true, verificationToken: null, resetPasswordToken: null, resetPasswordExpires: null },
  { id: 'mock-customer-id', email: 'khachhang@gmail.com', fullName: 'Nguyễn Thị Bích Ngọc (Biên Hòa)', role: 'CUSTOMER', status: 'ACTIVE', supplierId: null, supplierStatus: null, isEmailVerified: true, verificationToken: null, resetPasswordToken: null, resetPasswordExpires: null },
  { id: 'mock-farmer-id', email: 'tantrieu@cropnet.vn', fullName: 'HTX Nông Nghiệp Tân Triều', role: 'FARMER', status: 'ACTIVE', supplierId: 'mock-supplier-tantrieu', supplierStatus: 'APPROVED', isEmailVerified: true, verificationToken: null, resetPasswordToken: null, resetPasswordExpires: null },
  { id: 'mock-farmer-longkhanh', email: 'longkhanh@cropnet.vn', fullName: 'HTX Nông Nghiệp Long Khánh', role: 'FARMER', status: 'ACTIVE', supplierId: 'mock-supplier-longkhanh', supplierStatus: 'APPROVED', isEmailVerified: true, verificationToken: null, resetPasswordToken: null, resetPasswordExpires: null },
  { id: 'mock-logistics-id', email: 'logistics@cropnet.vn', fullName: 'Vận Tải Lạnh Nông Sản Đồng Nai', role: 'LOGISTICS', status: 'ACTIVE', supplierId: null, supplierStatus: null, isEmailVerified: true, verificationToken: null, resetPasswordToken: null, resetPasswordExpires: null },
  { id: 'mock-inspector-id', email: 'inspector@cropnet.vn', fullName: 'Trạm Kiểm Định Nông Sản Đồng Nai', role: 'INSPECTOR', status: 'ACTIVE', supplierId: null, supplierStatus: null, isEmailVerified: true, verificationToken: null, resetPasswordToken: null, resetPasswordExpires: null }
];

export const updateMockUserStatus = (id: string, status: string) => {
  const user = mockUsersList.find(u => u.id === id);
  if (user) {
    user.status = status;
  }
};

export const updateMockSupplierStatus = (userId: string, status: string) => {
  const user = mockUsersList.find(u => u.id === userId);
  if (user) {
    user.supplierStatus = status;
  }
};

export const MOCK_USERS = mockUsersList;

// Verified regional cooperatives in Thanh pho Dong Nai
export const MOCK_SUPPLIERS = [
  {
    id: 'mock-supplier-tantrieu',
    farmName: 'Hợp Tác Xã Nông Nghiệp Dịch Vụ Tân Triều',
    address: 'Xã Tân Bình, Vĩnh Cửu, Thành phố Đồng Nai',
    latitude: 11.0267,
    longitude: 106.8835,
    status: 'APPROVED',
    description: 'Chuyên canh bưởi đường lá cam và bưởi da xanh cù lao Tân Triều trứ danh, phù sa sông Đồng Nai bồi đắp.',
    certifications: ['OCOP 4 Sao', 'VietGAP Trồng trọt']
  },
  {
    id: 'mock-supplier-longkhanh',
    farmName: 'Hợp Tác Xã Nông Nghiệp Sinh Thái Long Khánh',
    address: 'Phường Xuân Lập, Thành phố Long Khánh, Thành phố Đồng Nai',
    latitude: 10.9258,
    longitude: 107.2412,
    status: 'APPROVED',
    description: 'Vùng trồng cây ăn trái đất đỏ bazan Long Khánh: sầu riêng Ri6 chín tự nhiên, chôm chôm nhãn cơm dày giòn ngọt.',
    certifications: ['VietGAP', 'Chuẩn chuỗi cung ứng sạch']
  }
];

export const MOCK_PRODUCTS: any[] = [
  {
    id: '1',
    categoryId: 'cat-fruits',
    name: 'Bưởi Đường Lá Cam Tân Triều (OCOP 4 Sao)',
    description: 'Bưởi đường lá cam trứ danh cù lao Tân Triều, da vàng xanh mỏng dính, tép bưởi mọng nước ngọt thanh đậm đà, không the đắng.',
    price: 85000,
    unit: 'quả (1.1kg - 1.3kg)',
    stock: 150,
    status: 'ACTIVE',
    createdAt: new Date('2026-10-01'),
    supplier: MOCK_SUPPLIERS[0],
    category: { name: 'Trái Cây Đặc Sản Đồng Nai' },
    images: [{ url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&auto=format' }],
    imageUrl: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&auto=format',
    tags: ['OCOP', 'Bưởi Tân Triều', 'VietGAP', 'Đặc sản Đồng Nai']
  },
  {
    id: '2',
    categoryId: 'cat-fruits',
    name: 'Bưởi Da Xanh Tân Triều Hữu Cơ',
    description: 'Bưởi da xanh ruột hồng giòn ngọt, vỏ xanh bóng, ít hạt, canh tác theo quy chuẩn an toàn sinh thái tại Vĩnh Cửu.',
    price: 75000,
    unit: 'quả (1.3kg - 1.5kg)',
    stock: 120,
    status: 'ACTIVE',
    createdAt: new Date('2026-10-02'),
    supplier: MOCK_SUPPLIERS[0],
    category: { name: 'Trái Cây Đặc Sản Đồng Nai' },
    images: [{ url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&auto=format' }],
    imageUrl: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&auto=format',
    tags: ['VietGAP', 'Bưởi Tân Triều', 'Hữu cơ']
  },
  {
    id: '3',
    categoryId: 'cat-fruits',
    name: 'Sầu Riêng Ri6 Long Khánh (Chín Cây Tự Nhiên)',
    description: 'Sầu riêng Ri6 đất đỏ bazan Long Khánh thu hoạch già đủ ngày, chín tự nhiên không nhúng thuốc kích chín. Cơm vàng óng, dẻo béo ngậy, hạt lép đậm đà.',
    price: 135000,
    unit: 'kg (quả 2.5kg - 3.5kg)',
    stock: 60,
    status: 'ACTIVE',
    createdAt: new Date('2026-10-03'),
    supplier: MOCK_SUPPLIERS[1],
    category: { name: 'Trái Cây Đặc Sản Đồng Nai' },
    images: [{ url: 'https://images.unsplash.com/photo-1589330694653-ded6df53f7ec?w=800&auto=format' }],
    imageUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df53f7ec?w=800&auto=format',
    tags: ['VietGAP', 'Sầu riêng Long Khánh', 'Chín tự nhiên']
  },
  {
    id: '4',
    categoryId: 'cat-fruits',
    name: 'Chôm Chôm Nhãn Long Khánh',
    description: 'Chôm chôm nhãn (chôm chôm đường) vỏ vàng ửng đỏ, gai ngắn, cùi dày giòn tróc hạt, vị ngọt đậm thơm mát.',
    price: 45000,
    unit: 'kg (chùm quả tươi)',
    stock: 250,
    status: 'ACTIVE',
    createdAt: new Date('2026-10-04'),
    supplier: MOCK_SUPPLIERS[1],
    category: { name: 'Trái Cây Đặc Sản Đồng Nai' },
    images: [{ url: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800&auto=format' }],
    imageUrl: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800&auto=format',
    tags: ['Đặc sản Long Khánh', 'Đang mùa vụ']
  },
  {
    id: '5',
    categoryId: 'cat-processed',
    name: 'Hạt Điều Rang Muối Vỏ Lụa Đồng Nai (Hộp 500g)',
    description: 'Hạt điều Đồng Nai loại A tuyển chọn xuất khẩu, hạt to mẩy đều, rang củi thủ công cùng muối tinh giữ nguyên lớp vỏ lụa thơm bùi giòn rụm.',
    price: 120000,
    unit: 'hộp 500g',
    stock: 180,
    status: 'ACTIVE',
    createdAt: new Date('2026-10-05'),
    supplier: MOCK_SUPPLIERS[1],
    category: { name: 'Nông Sản Chế Biến & Hạt' },
    images: [{ url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format' }],
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format',
    tags: ['OCOP', 'Hạt điều Đồng Nai', 'Chế biến sạch']
  },
  {
    id: '6',
    categoryId: 'cat-processed',
    name: 'Rượu Bưởi Tân Triều Truyền Thống (Bình Gốm 750ml)',
    description: 'Đặc sản trứ danh lên men tự nhiên từ nước cốt bưởi đường lá cam Tân Triều và men thảo mộc, hương vị êm dịu sảng khoái, tốt cho tiêu hóa.',
    price: 195000,
    unit: 'bình gốm 750ml',
    stock: 80,
    status: 'ACTIVE',
    createdAt: new Date('2026-10-06'),
    supplier: MOCK_SUPPLIERS[0],
    category: { name: 'Nông Sản Chế Biến & Hạt' },
    images: [{ url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format' }],
    imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format',
    tags: ['OCOP', 'Quà biếu tặng', 'Rượu bưởi Tân Triều']
  }
];

export const MOCK_BATCHES: any[] = [
  {
    id: 'batch-buoi-tantrieu-01',
    productId: '1',
    batchCode: 'BATCH-BUOI-TANTRIEU-2026-01',
    harvestDate: new Date('2026-10-10'),
    farmingArea: 'Vườn mẫu A1 - HTX Nông nghiệp Tân Triều, Xã Tân Bình, Vĩnh Cửu, Thành phố Đồng Nai',
    farmingProcess: 'Canh tác sinh thái kết hợp VietGAP. Bón phân vi sinh ủ từ vỏ trấu và bã cà phê, dùng nước ngọt phù sa sông Đồng Nai tưới tiêu, bao trái bằng túi chuyên dụng chống ruồi đục quả không dùng thuốc hóa học.',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=BATCH-BUOI-TANTRIEU-2026-01',
    product: MOCK_PRODUCTS[0],
    certifications: [
      {
        id: 'cert-vietgap-tantrieu',
        name: 'Chứng nhận VietGAP Trồng trọt Đồng Nai',
        issuer: 'Chi cục Trồng trọt và Bảo vệ Thực vật Đồng Nai',
        validUntil: new Date('2028-12-31'),
        imageUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df53f7ec?w=500&auto=format',
        status: 'APPROVED'
      },
      {
        id: 'cert-ocop-tantrieu',
        name: 'Giấy chứng nhận OCOP 4 Sao Tỉnh Đồng Nai',
        issuer: 'UBND Tỉnh Đồng Nai - Hội đồng Phân hạng OCOP',
        validUntil: new Date('2028-06-30'),
        imageUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df53f7ec?w=500&auto=format',
        status: 'APPROVED'
      }
    ],
    logisticsTimeline: [
      { status: 'REGISTERED', title: 'Khởi tạo thông tin lô bưởi', description: 'HTX Tân Triều đăng ký mã vùng trồng và lô thu hoạch vụ mùa 2026', timestamp: '2026-06-15T07:00:00.000Z', location: 'Xã Tân Bình, Vĩnh Cửu, TP Đồng Nai' },
      { status: 'CULTIVATION', title: 'Bón phân hữu cơ vi sinh đợt 2 & Bao trái', description: 'Hoàn tất bao 5.000 trái bằng túi màng thoáng khí chống côn trùng', timestamp: '2026-07-20T08:30:00.000Z', location: 'Vườn mẫu A1 Tân Triều' },
      { status: 'PRE_HARVEST', title: 'Kiểm tra độ chín sinh lý & độ Brix', description: 'Đo độ ngọt đạt 11.8 Brix, vỏ chuyển sang vàng sáng đạt chuẩn thu hái', timestamp: '2026-09-28T09:15:00.000Z', location: 'Trạm kỹ thuật HTX Tân Triều' },
      { status: 'HARVESTED', title: 'Thu hoạch cắt cuống & Dán tem QR', description: 'Thu hoạch quả loại 1, lau sạch bằng nước nano bạc, dán tem truy xuất nguồn gốc', timestamp: '2026-10-10T06:30:00.000Z', location: 'Kho sơ chế HTX Tân Triều' }
    ],
    inspectionReports: [
      {
        inspector: 'Trung tâm Phân tích & Kiểm định Nông sản Đồng Nai',
        status: 'PASSED',
        checkDate: '2026-10-08T10:00:00.000Z',
        comments: 'Mẫu bưởi đường lá cam đạt toàn bộ chỉ tiêu an toàn thực phẩm. Không phát hiện dư lượng kim loại nặng và hóa chất BVTV.',
        metrics: { pesticideLevel: 'Không phát hiện (dưới ngưỡng LOD)', sugarLevel: '11.8 Brix', waterContent: '88.5%' }
      }
    ],
    shipmentInfo: null
  },
  {
    id: 'batch-saurieng-longkhanh-01',
    productId: '3',
    batchCode: 'BATCH-SAURIENG-LONGKHANH-2026-01',
    harvestDate: new Date('2026-10-12'),
    farmingArea: 'Vườn sầu riêng mẫu B2 - HTX Nông nghiệp Long Khánh, Phường Xuân Lập, TP Long Khánh, TP Đồng Nai',
    farmingProcess: 'Canh tác trên đất đỏ bazan tự nhiên. Bón phân trùn quế hữu cơ, cam kết neo trái chín già trên cây và tự rụng/gõ bộng thu hoạch, không ngâm thuốc ép chín.',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=BATCH-SAURIENG-LONGKHANH-2026-01',
    product: MOCK_PRODUCTS[2],
    certifications: [
      {
        id: 'cert-vietgap-longkhanh',
        name: 'Cam kết Chuẩn canh tác sinh thái Long Khánh',
        issuer: 'Hội Nông Dân TP Long Khánh',
        validUntil: new Date('2027-12-31'),
        imageUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df53f7ec?w=500&auto=format',
        status: 'APPROVED'
      }
    ],
    logisticsTimeline: [
      { status: 'REGISTERED', title: 'Khai báo vườn sầu riêng Ri6', description: 'HTX Long Khánh quản lý 30 cây sầu riêng lâu năm đạt độ tuổi thu hoạch', timestamp: '2026-05-10T08:00:00.000Z', location: 'Phường Xuân Lập, TP Long Khánh' },
      { status: 'CULTIVATION', title: 'Tỉa trái chọn lọc & Bón kali hữu cơ', description: 'Mỗi chùm chỉ giữ lại 1-2 quả cân đối, cung cấp dinh dưỡng hữu cơ', timestamp: '2026-07-05T09:00:00.000Z', location: 'Xuân Lập, TP Long Khánh' },
      { status: 'HARVESTED', title: 'Thu hoạch sầu riêng già chín cây', description: 'Kiểm tra gõ âm đục, cơm sầu lên màu vàng óng, mùi thơm tự nhiên nồng nàn', timestamp: '2026-10-12T05:30:00.000Z', location: 'Kho tuyển chọn HTX Long Khánh' }
    ],
    inspectionReports: [],
    shipmentInfo: null
  },
  {
    id: 'batch-hatdieu-dongnai-01',
    productId: '5',
    batchCode: 'BATCH-HATDIEU-DONGNAI-2026-01',
    harvestDate: new Date('2026-10-05'),
    farmingArea: 'Xưởng chế biến Nông sản Đồng Nai - Huyện Xuân Lộc, Thành phố Đồng Nai',
    farmingProcess: 'Hạt điều tuyển chọn loại A, phơi sấy tiêu chuẩn, rang củi truyền thống cùng muối tinh, đóng hộp hút chân không an toàn.',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=BATCH-HATDIEU-DONGNAI-2026-01',
    product: MOCK_PRODUCTS[4],
    certifications: [
      {
        id: 'cert-haccp-dieudongnai',
        name: 'Chứng nhận An Toàn Vệ Sinh Thực Phẩm HACCP',
        issuer: 'Sở Công Thương Thành phố Đồng Nai',
        validUntil: new Date('2028-08-30'),
        imageUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df53f7ec?w=500&auto=format',
        status: 'APPROVED'
      }
    ],
    logisticsTimeline: [
      { status: 'REGISTERED', title: 'Tiếp nhận nguyên liệu hạt điều Xuân Lộc', description: 'Thu mua trực tiếp từ các hộ trồng điều liên kết', timestamp: '2026-09-25T08:00:00.000Z', location: 'Xuân Lộc, TP Đồng Nai' },
      { status: 'PROCESSING', title: 'Rang củi thủ công & Đóng hộp', description: 'Rang cùng muối tinh nhiệt độ 160°C, kiểm tra độ ẩm < 3%', timestamp: '2026-10-05T14:00:00.000Z', location: 'Xưởng chế biến Đồng Nai' }
    ],
    inspectionReports: [],
    shipmentInfo: null
  }
];

// Compatibility alias for legacy test codes
export const LEGACY_BATCH_ALIASES: Record<string, string> = {
  'BATCH-BUOI-CAIMON-01': 'BATCH-BUOI-TANTRIEU-2026-01',
  'BATCH-BUOI-CAIMON-02': 'BATCH-BUOI-TANTRIEU-2026-01',
  'BATCH-SAURIENG-RI6-01': 'BATCH-SAURIENG-LONGKHANH-2026-01',
  'BATCH-CACHUA-DALAT-01': 'BATCH-BUOI-TANTRIEU-2026-01'
};

export const MOCK_ORDERS: any[] = [
  {
    id: 'mock-order-1',
    customerId: 'mock-customer-id',
    totalAmount: 255000,
    shippingAddress: '124 Đường Đồng Khởi, Phường Tân Hiệp, Thành phố Đồng Nai',
    receiverName: 'Nguyễn Thị Bích Ngọc',
    receiverPhone: '0912345678',
    status: 'DELIVERED',
    createdAt: new Date('2026-10-12T09:30:00.000Z'),
    orderItems: [
      {
        id: 'order-item-1',
        productId: '1',
        quantity: 3,
        price: 85000,
        batchId: 'batch-buoi-tantrieu-01',
        product: MOCK_PRODUCTS[0],
        batch: MOCK_BATCHES[0]
      }
    ],
    payment: {
      id: 'pay-1',
      paymentMethod: 'COD',
      paymentStatus: 'COMPLETED',
      amount: 255000,
      paidAt: new Date('2026-10-13T10:00:00.000Z')
    },
    shipment: {
      id: 'ship-1',
      carrier: 'Đội xe Vận Tải Lạnh Đồng Nai',
      vehicle: 'Xe tải lạnh chuyên dụng 1.5 tấn',
      shipStatus: 'DELIVERED',
      trackingHistory: [
        { status: 'PICKED_UP', title: 'Lấy hàng tại HTX Tân Triều', timestamp: '2026-10-12T14:00:00.000Z' },
        { status: 'DELIVERED', title: 'Giao hàng thành công tại Biên Hòa', timestamp: '2026-10-13T10:00:00.000Z' }
      ]
    }
  }
];

export const MOCK_FORUM_POSTS: any[] = [
  {
    id: 'post-1',
    title: 'Hợp tác chuyển đổi số HTX Nông nghiệp Tân Triều cùng CropNet AI 2026',
    content: 'HTX Tân Triều chính thức ứng dụng tem QR truy xuất nguồn gốc số hóa cho toàn bộ diện tích 25 hecta bưởi đường lá cam và bưởi da xanh cù lao Tân Triều, phục vụ người tiêu dùng và các đối tác thương mại.',
    authorId: 'mock-farmer-id',
    authorName: 'HTX Nông Nghiệp Tân Triều',
    authorRole: 'FARMER',
    likes: 86,
    commentsCount: 2,
    isPinned: true,
    type: 'ANNOUNCEMENT',
    status: 'PUBLISHED',
    tags: ['Đồng Nai AI', 'Bưởi Tân Triều', 'Chuyển đổi số', 'OCOP'],
    viewsCount: 1420,
    createdAt: new Date('2026-10-05'),
    updatedAt: new Date('2026-10-05'),
    comments: [
      { id: 'comment-1', postId: 'post-1', authorId: 'mock-customer-id', authorName: 'Nguyễn Thị Bích Ngọc', content: 'Rất ủng hộ HTX Tân Triều làm mã QR truy xuất minh bạch để khách an tâm mua biếu!', parentId: null, status: 'PUBLISHED', createdAt: new Date('2026-10-05T12:00:00.000Z') }
    ]
  },
  {
    id: 'post-2',
    title: 'Kỹ thuật neo trái chín tự nhiên trên cây tại HTX Nông Nghiệp Long Khánh',
    content: 'Chia sẻ kinh nghiệm canh tác sầu riêng Ri6 đất đỏ bazan: HTX cam kết không thu hái trái non và không nhúng thuốc kích chín, chỉ thu hoạch khi gõ bộng đạt chuẩn già cây 100%.',
    authorId: 'mock-farmer-longkhanh',
    authorName: 'HTX Nông Nghiệp Long Khánh',
    authorRole: 'FARMER',
    likes: 64,
    commentsCount: 1,
    isPinned: false,
    type: 'TIP',
    status: 'PUBLISHED',
    tags: ['Sầu riêng Long Khánh', 'Chín tự nhiên', 'Kinh nghiệm nhà vườn'],
    viewsCount: 980,
    createdAt: new Date('2026-10-08'),
    updatedAt: new Date('2026-10-08'),
    comments: []
  }
];

export let mockPostLikesList: any[] = [];
export let mockPostBookmarksList: any[] = [];
export let mockForumReportsList: any[] = [];

export const isDatabaseError = (error: any): boolean => {
  if (!error) return false;
  const msg = String(error.message || '');
  const code = String(error.code || '');
  const name = String(error.name || '');
  return (
    msg.toLowerCase().includes('database') ||
    msg.toLowerCase().includes('prisma') ||
    msg.toLowerCase().includes('connection') ||
    msg.toLowerCase().includes('auth') ||
    msg.toLowerCase().includes('postgres') ||
    msg.toLowerCase().includes('relation') ||
    msg.toLowerCase().includes('table') ||
    msg.toLowerCase().includes('column') ||
    code.startsWith('P') ||
    name.includes('Prisma') ||
    msg.includes('reach database server') ||
    msg.includes('did not initialize yet') ||
    code.includes('P1000') ||
    code.includes('P1001')
  );
};

export interface MockCategory {
  id: string;
  name: string;
  slug: string;
}

export let mockCategoriesList: MockCategory[] = [
  { id: 'cat-fruits', name: 'Trái Cây Đặc Sản Đồng Nai', slug: 'trai-cay-dac-san-dong-nai' },
  { id: 'cat-processed', name: 'Nông Sản Chế Biến & Hạt', slug: 'nong-san-che-bien-hat' }
];

export const addMockCategory = (name: string, slug: string) => {
  const newCat = { id: `mock-cat-${Date.now()}`, name, slug };
  mockCategoriesList.push(newCat);
  return newCat;
};

export const updateMockCategory = (id: string, name: string, slug: string) => {
  const cat = mockCategoriesList.find(c => c.id === id);
  if (cat) {
    cat.name = name;
    cat.slug = slug;
    return cat;
  }
  return null;
};

export const deleteMockCategory = (id: string) => {
  const idx = mockCategoriesList.findIndex(c => c.id === id);
  if (idx !== -1) {
    mockCategoriesList.splice(idx, 1);
    return true;
  }
  return false;
};

export const updateMockOrderShipmentDetails = (orderId: string, details: { shipperName?: string; shipperPhone?: string; trackingCode?: string; estimatedDelivery?: Date }) => {
  const order = MOCK_ORDERS.find(o => o.id === orderId);
  if (order && order.shipment) {
    if (details.shipperName) order.shipment.shipperName = details.shipperName;
    if (details.shipperPhone) order.shipment.shipperPhone = details.shipperPhone;
    if (details.trackingCode) order.shipment.trackingCode = details.trackingCode;
    if (details.estimatedDelivery) order.shipment.estimatedDelivery = details.estimatedDelivery;
    order.shipment.updatedAt = new Date();
    return order;
  }
  return null;
};

export const addMockOrderShipmentMilestone = (orderId: string, milestone: { status: string; title: string; location?: string; description?: string }) => {
  const order = MOCK_ORDERS.find(o => o.id === orderId);
  if (order && order.shipment) {
    const history = order.shipment.trackingHistory || [];
    history.push({
      ...milestone,
      timestamp: new Date()
    });
    order.shipment.trackingHistory = history;
    order.shipment.updatedAt = new Date();
    return order;
  }
  return null;
};

export const disputeMockOrder = (orderId: string, reason: string) => {
  const order = MOCK_ORDERS.find(o => o.id === orderId);
  if (order) {
    order.status = 'DISPUTED';
    order.disputeReason = reason;
    return order;
  }
  return null;
};

export const resolveMockOrderDispute = (orderId: string, status: string) => {
  const order = MOCK_ORDERS.find(o => o.id === orderId);
  if (order) {
    order.status = status;
    if (status === 'REFUNDED' && order.payment) {
      order.payment.paymentStatus = 'REFUNDED';
    }
    return order;
  }
  return null;
};

export const assignMockOrderItemBatch = (orderId: string, orderItemId: string, batchId: string) => {
  const order = MOCK_ORDERS.find(o => o.id === orderId);
  if (order) {
    const item = order.orderItems.find((i: any) => i.id === orderItemId || i.productId === orderItemId);
    if (item) {
      item.batchId = batchId;
      const batch = MOCK_BATCHES.find(b => b.id === batchId || b.batchCode === batchId);
      if (batch) {
        item.batch = batch;
      }
    }
    const allAssigned = order.orderItems.every((i: any) => !!i.batchId);
    if (allAssigned) {
      order.status = 'PROCESSING';
    }
    return order;
  }
  return null;
};

export const updateMockProductStatus = (id: string, status: string) => {
  const prod = MOCK_PRODUCTS.find(p => p.id === id);
  if (prod) {
    prod.status = status;
    return prod;
  }
  return null;
};

export const updateMockCertificationStatus = (id: string, status: string) => {
  for (const b of MOCK_BATCHES) {
    if (b.certifications) {
      const cert = b.certifications.find((c: any) => c.id === id);
      if (cert) {
        cert.status = status;
        return cert;
      }
    }
  }
  return null;
};



