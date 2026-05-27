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
  { id: 'mock-admin-id', email: 'admin@cropnet.vn', fullName: 'Cộng Tác Viên CropNet', role: 'ADMIN', status: 'ACTIVE', supplierId: null, supplierStatus: null, isEmailVerified: true, verificationToken: null, resetPasswordToken: null, resetPasswordExpires: null },
  { id: 'mock-customer-id', email: 'khachhang@gmail.com', fullName: 'Trần Thị Hà Nội', role: 'CUSTOMER', status: 'ACTIVE', supplierId: null, supplierStatus: null, isEmailVerified: true, verificationToken: null, resetPasswordToken: null, resetPasswordExpires: null },
  { id: 'mock-farmer-id', email: 'farmer@nongnghiep.vn', fullName: 'Chú Út Miền Tây', role: 'FARMER', status: 'ACTIVE', supplierId: 'mock-supplier-id', supplierStatus: 'APPROVED', isEmailVerified: true, verificationToken: null, resetPasswordToken: null, resetPasswordExpires: null },
  { id: 'mock-logistics-id', email: 'logistics@cropnet.vn', fullName: 'Vận Chuyển CropNet', role: 'LOGISTICS', status: 'ACTIVE', supplierId: null, supplierStatus: null, isEmailVerified: true, verificationToken: null, resetPasswordToken: null, resetPasswordExpires: null },
  { id: 'mock-inspector-id', email: 'inspector@cropnet.vn', fullName: 'Trạm Kiểm Định CropNet', role: 'INSPECTOR', status: 'ACTIVE', supplierId: null, supplierStatus: null, isEmailVerified: true, verificationToken: null, resetPasswordToken: null, resetPasswordExpires: null }
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

export const MOCK_PRODUCTS: any[] = [
  {
    id: '1',
    categoryId: 'cat-fruits',
    name: 'Bưởi Da Xanh Cái Mơn',
    description: 'Bưởi da xanh ngọt đậm đà, vỏ mỏng ruột hồng tiêu biểu của vương quốc trái cây Cái Mơn, canh tác hữu cơ tự nhiên.',
    price: 65000,
    unit: 'quả 1.2kg',
    stock: 50,
    status: 'ACTIVE',
    createdAt: new Date(),
    supplier: { id: 'mock-supplier-id', farmName: 'Hợp Tác Xã Trái Cây Sạch Cái Mơn', address: 'Xã Sơn Định, Huyện Chợ Lách, Tỉnh Bến Tre' },
    category: { name: 'Trái Cây Sạch' },
    images: [
      { url: '/buoi-da-xanh-cai-mon.jpg' }
    ],
    imageUrl: '/buoi-da-xanh-cai-mon.jpg',
    tags: ['VietGAP', 'Đặc sản', 'Bến Tre']
  },
  {
    id: '2',
    categoryId: 'cat-veggies',
    name: 'Cà Chua Bi Đà Lạt',
    description: 'Cà chua chín mọng thơm mát, giàu vitamin, được trồng trong nhà kính theo quy chuẩn hữu cơ khép kín.',
    price: 35000,
    unit: 'túi 500g',
    stock: 120,
    status: 'ACTIVE',
    createdAt: new Date(),
    supplier: { id: 'mock-supplier-tomato', farmName: 'Dalat Bio Farm', address: 'Đường Hồ Xuân Hương, Phường 9, TP. Đà Lạt, Tỉnh Lâm Đồng' },
    category: { name: 'Rau Củ Hữu Cơ' },
    images: [{ url: '/cachuabidalat.jpg' }],
    imageUrl: '/cachuabidalat.jpg',
    tags: ['Hữu cơ', 'Đà Lạt']
  },
  {
    id: '3',
    categoryId: 'cat-veggies',
    name: 'Rau Muống Hữu Cơ',
    description: 'Rau muống non xanh, ăn giòn ngọt, trồng theo phương pháp tự nhiên không chất hóa học tại Bến Tre.',
    price: 15000,
    unit: 'bó 500g',
    stock: 200,
    status: 'ACTIVE',
    createdAt: new Date(),
    supplier: { id: 'mock-supplier-id2', farmName: 'Vườn Rau Sạch Bến Tre', address: 'Huyện Châu Thành, Tỉnh Bến Tre' },
    category: { name: 'Rau Củ Hữu Cơ' },
    images: [{ url: '/rau-muong-huu-co.jpg' }],
    imageUrl: '/rau-muong-huu-co.jpg',
    tags: ['Hữu cơ', 'D2C']
  },
  {
    id: '4',
    categoryId: 'cat-fruits',
    name: 'Sầu Riêng Ri6 Vĩnh Long',
    description: 'Sầu riêng Ri6 cơm vàng hạt lép, béo ngậy ngọt ngào đặc sản trứ danh Vĩnh Long, chín tự nhiên không hóa chất nhúng thuốc.',
    price: 145000,
    unit: 'kg (quả 2.5kg)',
    stock: 30,
    status: 'ACTIVE',
    createdAt: new Date(),
    supplier: { id: 'mock-supplier-durian', farmName: 'HTX Sầu Riêng Vĩnh Long', address: 'Huyện Long Hồ, Tỉnh Vĩnh Long' },
    category: { name: 'Trái Cây Sạch' },
    images: [{ url: '/sau-rieng-vinh-long.jpg' }],
    imageUrl: '/sau-rieng-vinh-long.jpg',
    tags: ['VietGAP', 'Đặc sản', 'Vĩnh Long']
  },
  {
    id: '5',
    categoryId: 'cat-fruits',
    name: 'Xoài Cát Hòa Lộc',
    description: 'Xoài cát Hòa Lộc Tiền Giang quả to thuôn dài, khi chín vàng tươi, thịt xoài cát mịn màng ngọt lịm và thơm lừng.',
    price: 85000,
    unit: 'kg (2 quả)',
    stock: 40,
    status: 'ACTIVE',
    createdAt: new Date(),
    supplier: { id: 'mock-supplier-mango', farmName: 'HTX Xoài Cát Hòa Lộc', address: 'Huyện Cái Bè, Tỉnh Tiền Giang' },
    category: { name: 'Trái Cây Sạch' },
    images: [{ url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format' }],
    imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format',
    tags: ['VietGAP', 'Đặc sản', 'Tiền Giang']
  },
  {
    id: '6',
    categoryId: 'cat-fruits',
    name: 'Bơ Sáp 034 Tây Nguyên',
    description: 'Bơ sáp 034 dáng dài đặc trưng Tây Nguyên, cơm vàng dẻo quánh, vị ngậy béo tự nhiên, vỏ xanh bóng đẹp mắt.',
    price: 55000,
    unit: 'túi 1kg',
    stock: 60,
    status: 'ACTIVE',
    createdAt: new Date(),
    supplier: { id: 'mock-supplier-avocado', farmName: 'Vườn Bơ Sáp Đắk Lắk', address: 'Huyện Cư M\'gar, Tỉnh Đắk Lắk' },
    category: { name: 'Trái Cây Sạch' },
    images: [{ url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&auto=format' }],
    imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&auto=format',
    tags: ['VietGAP', 'Đặc sản', 'Đắk Lắk']
  },
  {
    id: '7',
    categoryId: 'cat-veggies',
    name: 'Nấm Đùi Gà Hữu Cơ',
    description: 'Nấm đùi gà thân trắng ngần, chắc thịt, giòn ngọt giàu dinh dưỡng trồng phòng lạnh khép kín tại Lâm Đồng.',
    price: 45000,
    unit: 'hộp 300g',
    stock: 80,
    status: 'ACTIVE',
    createdAt: new Date(),
    supplier: { id: 'mock-supplier-mushroom', farmName: 'Lâm Đồng Organics', address: 'Đức Trọng, Tỉnh Lâm Đồng' },
    category: { name: 'Rau Củ Hữu Cơ' },
    images: [{ url: '/nam-dui-ga.jpg' }],
    imageUrl: '/nam-dui-ga.jpg',
    tags: ['Hữu cơ', 'Lâm Đồng']
  },
  {
    id: '8',
    categoryId: 'cat-veggies',
    name: 'Măng Tây Xanh Loại 1',
    description: 'Măng tây xanh Ninh Thuận loại 1 thân mập non tơ giòn ngọt, giàu chất xơ và khoáng chất tốt cho sức khỏe.',
    price: 85000,
    unit: 'bó 500g',
    stock: 100,
    status: 'ACTIVE',
    createdAt: new Date(),
    supplier: { id: 'mock-supplier-asparagus', farmName: 'Hợp Tác Xã Măng Tây Ninh Thuận', address: 'Huyện Ninh Phước, Tỉnh Ninh Thuận' },
    category: { name: 'Rau Củ Hữu Cơ' },
    images: [{ url: '/mang-tay-xanh.jpg' }],
    imageUrl: '/mang-tay-xanh.jpg',
    tags: ['VietGAP', 'Đặc sản', 'Ninh Thuận']
  }
];

export const MOCK_BATCHES: any[] = [
  {
    id: 'mock-batch-1',
    batchCode: 'BATCH-BUOI-CAIMON-01',
    harvestDate: new Date(),
    farmingArea: 'Phân khu A3 - Trồng trọt Bưởi Hữu Cơ',
    farmingProcess: 'Tưới tiêu bằng nước ngọt tự nhiên từ sông Hàm Luông, bón phân compost hữu cơ tự nhiên không sử dụng thuốc trừ sâu hóa học.',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BATCH-BUOI-CAIMON-01',
    logisticsTimeline: [
      { status: 'PICKED_UP', title: 'Thu hoạch & Đóng gói', description: 'Lô bưởi đạt chuẩn chín được thu hoạch thủ công và phân loại kỹ lưỡng tại vựa Cái Mơn', timestamp: '2026-05-23T06:00:00.000Z', location: 'Cái Mơn, Bến Tre' },
      { status: 'IN_TRANSIT', title: 'Vận chuyển lạnh', description: 'Đang vận chuyển bằng xe lạnh chuyên dụng BKS 29H-123.45 qua cao tốc Trung Lương', timestamp: '2026-05-23T08:30:00.000Z', location: 'Tiền Giang' },
      { status: 'DELIVERED', title: 'Cập cảng CropNet TP. HCM', description: 'Đã nhập kho mát phân phối CropNet và sẵn sàng giao hàng trực tiếp D2C', timestamp: '2026-05-23T10:30:00.000Z', location: 'Bình Chánh, TP. HCM' }
    ],
    inspectionReports: [
      {
        inspector: 'Trạm Kiểm Định Vùng 2 (Bộ NN&PTNT)',
        status: 'PASSED',
        checkDate: '2026-05-23T07:30:00.000Z',
        comments: 'Đã hoàn thành kiểm nghiệm các chỉ tiêu an toàn thực phẩm sinh học và hóa học. Lô hàng đạt độ chín, mẫu mã đẹp, không phát hiện dư lượng thuốc bảo vệ thực vật hay kim loại nặng.',
        metrics: {
          pesticideLevel: '0.0% (Không phát hiện)',
          humidity: '84.8%',
          sugarLevel: '12.6 Brix'
        }
      }
    ],
    shipmentInfo: {
      shipmentId: 'SHIP-BUOI-CAIMON-01',
      carrier: 'CropNet Express Cold-Chain',
      vehicle: 'Xe đông lạnh Isuzu 2.4 tấn - BKS 29H-123.45',
      currentTemp: '5.4°C',
      humidity: '76.8%',
      departureDate: '2026-05-23T06:15:00.000Z',
      arrivalDate: '2026-05-23T10:45:00.000Z'
    },
    product: {
      name: 'Bưởi Da Xanh Cái Mơn',
      supplier: {
        farmName: 'Hợp Tác Xã Trái Cây Sạch Cái Mơn',
        address: 'Xã Sơn Định, Huyện Chợ Lách, Tỉnh Bến Tre',
        latitude: 10.2458,
        longitude: 106.1284
      }
    },
    certifications: [
      {
        id: 'mock-cert-1',
        name: 'Chứng nhận VietGAP',
        issuer: 'Cơ quan kiểm nghiệm cây trồng Bến Tre',
        status: 'APPROVED',
        validUntil: new Date('2028-12-31'),
        imageUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df53f7ec?w=500&auto=format'
      }
    ]
  },
  {
    id: 'mock-batch-tomato-1',
    batchCode: 'BATCH-CACHUA-DALAT-01',
    harvestDate: new Date(),
    farmingArea: 'Nhà màng khu B - Trồng trọt Cà Chua Hữu Cơ',
    farmingProcess: 'Hệ thống tưới nhỏ giọt công nghệ Israel khép kín, bón phân hữu cơ vi sinh không sử dụng thuốc trừ sâu hóa học.',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BATCH-CACHUA-DALAT-01',
    logisticsTimeline: [
      { status: 'PICKED_UP', title: 'Thu hoạch & Đóng gói', description: 'Cà chua bi thu hoạch chín tự nhiên tại nhà màng Dalat Bio Farm', timestamp: '2026-05-23T06:00:00.000Z', location: 'TP. Đà Lạt, Lâm Đồng' },
      { status: 'IN_TRANSIT', title: 'Vận chuyển lạnh', description: 'Đang vận chuyển từ Đà Lạt xuống TP. HCM bằng xe đông lạnh chuyên dụng', timestamp: '2026-05-23T08:30:00.000Z', location: 'Đèo Bảo Lộc, Lâm Đồng' },
      { status: 'DELIVERED', title: 'Nhập kho mát TP. HCM', description: 'Đã nhập kho phân phối mát CropNet và sẵn sàng giao hàng', timestamp: '2026-05-23T10:30:00.000Z', location: 'Quận 7, TP. HCM' }
    ],
    inspectionReports: [
      {
        inspector: 'Trung tâm Phân tích và Kiểm nghiệm Lâm Đồng',
        status: 'PASSED',
        checkDate: '2026-05-23T07:30:00.000Z',
        comments: 'Mẫu cà chua bi đạt các chỉ chỉ tiêu hóa lý, không có kim loại nặng hay tồn dư chất bảo vệ thực vật. Hàm lượng dinh dưỡng cao.',
        metrics: {
          pesticideLevel: '0.0%',
          humidity: '92.3%',
          sugarLevel: '7.8 Brix'
        }
      }
    ],
    shipmentInfo: {
      shipmentId: 'SHIP-TOMATO-BATCH-CACHUA-DALAT-01',
      carrier: 'Dalat Express Logistics',
      vehicle: 'Xe lạnh Hyundai 1.5 tấn - BKS 49C-567.89',
      currentTemp: '4.8°C',
      humidity: '82.4%',
      departureDate: '2026-05-23T06:15:00.000Z',
      arrivalDate: '2026-05-23T10:45:00.000Z'
    },
    product: {
      name: 'Cà Chua Bi Đà Lạt',
      supplier: {
        farmName: 'Dalat Bio Farm',
        address: 'Đường Hồ Xuân Hương, Phường 9, TP. Đà Lạt, Tỉnh Lâm Đồng',
        latitude: 11.9542,
        longitude: 108.4612
      }
    },
    certifications: [
      {
        id: 'mock-cert-tomato',
        name: 'Chứng nhận VietGAP',
        issuer: 'Cơ quan kiểm nghiệm lâm nghiệp Lâm Đồng',
        status: 'APPROVED',
        validUntil: new Date('2028-12-31'),
        imageUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df53f7ec?w=500&auto=format'
      }
    ]
  },
  {
    id: 'mock-batch-spinach-1',
    batchCode: 'BATCH-RAUMUONG-01',
    harvestDate: new Date(),
    farmingArea: 'Phân khu C1 - Trồng rau thủy canh hữu cơ',
    farmingProcess: 'Phương pháp thủy canh hồi lưu dùng dung dịch dinh dưỡng hữu cơ tự chế từ men vi sinh vi lượng sạch.',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BATCH-RAUMUONG-01',
    logisticsTimeline: [
      { status: 'PICKED_UP', title: 'Thu hoạch cắt gốc', description: 'Rau muống non được thu hoạch cắt gốc lúc sáng sớm', timestamp: '2026-05-23T06:00:00.000Z', location: 'Châu Thành, Bến Tre' },
      { status: 'DELIVERED', title: 'Giao trực tiếp D2C', description: 'Đã cập bến cửa hàng phân phối trung chuyển CropNet trong ngày', timestamp: '2026-05-23T08:30:00.000Z', location: 'Bình Tân, TP. HCM' }
    ],
    inspectionReports: [
      {
        inspector: 'Chi cục Bảo vệ Thực vật Bến Tre',
        status: 'PASSED',
        checkDate: '2026-05-23T07:30:00.000Z',
        comments: 'Sản phẩm rau ăn lá đạt chuẩn an toàn vệ sinh thực phẩm cao nhất, hoàn toàn không có hóa chất kích thích sinh trưởng.',
        metrics: {
          pesticideLevel: '0.0%',
          humidity: '94.5%',
          sugarLevel: '1.2 Brix'
        }
      }
    ],
    shipmentInfo: {
      shipmentId: 'SHIP-SPINACH-BATCH-RAUMUONG-01',
      carrier: 'Giao Hàng Nhanh CropNet',
      vehicle: 'Xe tải nhẹ Suzuki 500kg - BKS 71C-123.45',
      currentTemp: '8.2°C',
      humidity: '90.1%',
      departureDate: '2026-05-23T06:15:00.000Z',
      arrivalDate: '2026-05-23T08:30:00.000Z'
    },
    product: {
      name: 'Rau Muống Hữu Cơ',
      supplier: {
        farmName: 'Vườn Rau Sạch Bến Tre',
        address: 'Huyện Châu Thành, Tỉnh Bến Tre',
        latitude: 10.2742,
        longitude: 106.3124
      }
    },
    certifications: [
      {
        id: 'mock-cert-spinach',
        name: 'Chứng nhận hữu cơ Organic',
        issuer: 'Hiệp hội Nông nghiệp Hữu cơ Việt Nam',
        status: 'APPROVED',
        validUntil: new Date('2028-12-31'),
        imageUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df53f7ec?w=500&auto=format'
      }
    ]
  }
];

export const MOCK_ORDERS: any[] = [
  {
    id: 'mock-order-1',
    customerId: 'mock-customer-id',
    totalAmount: 100000,
    shippingAddress: '123 Đường Nguyễn Huệ, Quận 1, TP. HCM',
    receiverName: 'Trần Thị Hà Nội',
    receiverPhone: '0987654321',
    status: 'PENDING',
    createdAt: new Date(),
    orderItems: [
      {
        id: 'mock-item-1',
        productId: '1',
        quantity: 1,
        price: 65000,
        product: MOCK_PRODUCTS[0]
      },
      {
        id: 'mock-item-2',
        productId: '2',
        quantity: 1,
        price: 35000,
        product: MOCK_PRODUCTS[1]
      }
    ],
    payment: {
      id: 'mock-pay-1',
      paymentMethod: 'MOMO',
      paymentStatus: 'PENDING',
      amount: 100000
    },
    shipment: {
      id: 'mock-ship-1',
      shipStatus: 'PICKING'
    }
  }
];

export const MOCK_FORUM_POSTS: any[] = [
  {
    id: 'post-1',
    title: 'Thông báo: Lễ ký kết hợp tác số hóa nông sản CropNet 2026',
    content: 'CropNet chính thức ký kết hợp tác cùng Liên minh Hợp tác xã Việt Nam nhằm đưa 500+ hợp tác xã trái cây Bến Tre, Lâm Đồng lên sàn thương mại điện tử D2C.',
    authorId: 'mock-admin-id',
    authorName: 'Ban Quản Trị CropNet',
    authorRole: 'ADMIN',
    likes: 124,
    commentsCount: 2,
    isPinned: true,
    type: 'ANNOUNCEMENT',
    status: 'PUBLISHED',
    tags: ['Số hóa', 'Ký kết', 'Hợp tác xã'],
    viewsCount: 1520,
    createdAt: new Date('2026-05-01'),
    updatedAt: new Date('2026-05-01'),
    comments: [
      { id: 'comment-11', postId: 'post-1', authorId: 'mock-farmer-id', authorName: 'Chú Út Miền Tây', content: 'Tin vui quá, mong nông sản của hợp tác xã tiếp cận được nhiều bà con!', parentId: null, status: 'PUBLISHED', createdAt: new Date('2026-05-01T12:00:00.000Z') },
      { id: 'comment-12', postId: 'post-1', authorId: 'mock-customer-id', authorName: 'Trần Thị Hà Nội', content: 'Ủng hộ mô hình D2C này để mua được bưởi sạch đúng gốc Cái Mơn.', parentId: null, status: 'PUBLISHED', createdAt: new Date('2026-05-01T14:30:00.000Z') }
    ]
  },
  {
    id: 'post-2',
    title: 'Kỹ thuật ủ phân compost hữu cơ tại nhà từ vỏ trái cây',
    content: 'Hướng dẫn chi tiết quy trình ủ rác hữu cơ, vỏ bưởi da xanh thành phân compost vi sinh bón cho rau sạch. Đảm bảo không mùi, dinh dưỡng cao.',
    authorId: 'mock-inspector-id',
    authorName: 'Trạm Kiểm Định CropNet',
    authorRole: 'INSPECTOR',
    likes: 85,
    commentsCount: 0,
    isPinned: false,
    type: 'TIP',
    status: 'PUBLISHED',
    tags: ['Ủ phân', 'Compost', 'Hữu cơ', 'Kinh nghiệm'],
    viewsCount: 845,
    createdAt: new Date('2026-05-10'),
    updatedAt: new Date('2026-05-10'),
    comments: []
  },
  {
    id: 'post-3',
    title: 'Cách làm phân hữu cơ từ vỏ trứng và bã cà phê?',
    content: 'Có ai ở đây đã thử trộn vỏ trứng xay nhuyễn với bã cà phê bón cho cây cà chua chưa? Xin chia sẻ kinh nghiệm tỉ lệ thích hợp nhé.',
    authorId: 'mock-customer-id',
    authorName: 'Mẹ Bầu Sống Xanh',
    authorRole: 'CUSTOMER',
    likes: 18,
    commentsCount: 0,
    isPinned: false,
    type: 'POST',
    status: 'PUBLISHED',
    tags: ['Hỏi đáp', 'Cà chua', 'Mẹo vặt'],
    viewsCount: 298,
    createdAt: new Date('2026-05-20'),
    updatedAt: new Date('2026-05-20'),
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
  { id: 'cat-fruits', name: 'Trái Cây Sạch', slug: 'trai-cay-sach' },
  { id: 'cat-veggies', name: 'Rau Củ Hữu Cơ', slug: 'rau-cu-huu-co' }
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
  const index = mockCategoriesList.findIndex(c => c.id === id);
  if (index !== -1) {
    mockCategoriesList.splice(index, 1);
    return true;
  }
  return false;
};

export const updateMockProductStatus = (id: string, status: string) => {
  const prod = MOCK_PRODUCTS.find(p => p.id === id);
  if (prod) {
    prod.status = status;
  }
};

export const updateMockCertificationStatus = (id: string, status: string) => {
  for (const b of MOCK_BATCHES) {
    if (b.certifications) {
      const match = b.certifications.find((c: any) => c.id === id);
      if (match) {
        match.status = status;
        return match;
      }
    }
  }
  return null;
};

export const updateMockOrderShipmentDetails = (orderId: string, details: { shipperName: string; shipperPhone: string; trackingCode: string; estimatedDelivery: Date }) => {
  const order = MOCK_ORDERS.find(o => o.id === orderId);
  if (order) {
    order.status = 'SHIPPING';
    order.shipment = {
      ...order.shipment,
      shipperName: details.shipperName,
      shipperPhone: details.shipperPhone,
      trackingCode: details.trackingCode,
      estimatedDelivery: details.estimatedDelivery,
      shipStatus: 'IN_TRANSIT',
      trackingHistory: [
        {
          title: 'Đã xuất kho & giao shipper',
          description: `Đơn hàng đã bàn giao cho nhân viên giao hàng ${details.shipperName} (${details.shipperPhone}). Vui lòng giữ liên lạc.`,
          location: 'Kho tổng CropNet',
          timestamp: new Date()
        }
      ],
      updatedAt: new Date()
    };
    return order;
  }
  return null;
};

export const addMockOrderShipmentMilestone = (orderId: string, milestone: { title: string; description: string; location: string }) => {
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
    
    // If all items in this order have assigned batches, transition to PROCESSING
    const allAssigned = order.orderItems.every((i: any) => !!i.batchId);
    if (allAssigned) {
      order.status = 'PROCESSING';
    }
    return order;
  }
  return null;
};

