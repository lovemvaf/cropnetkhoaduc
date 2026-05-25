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
    name: 'Bưởi Da Xanh Bến Tre',
    description: 'Bưởi da xanh ngọt đậm đà, thu hoạch trực tiếp tại vườn cây Cái Mơn đạt chuẩn hữu cơ.',
    price: 65000,
    unit: 'quả 1.2kg',
    stock: 50,
    status: 'ACTIVE',
    createdAt: new Date(),
    supplier: { id: 'mock-supplier-id', farmName: 'Hợp Tác Xã Trái Cây Sạch Cái Mơn', address: 'Xã Sơn Định, Huyện Chợ Lách, Tỉnh Bến Tre' },
    category: { name: 'Trái Cây Sạch' },
    images: [{ url: 'https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?w=500&auto=format' }]
  },
  {
    id: '2',
    categoryId: 'cat-veggies',
    name: 'Cà Chua Bi Đà Lạt',
    description: 'Cà chua chín mọng thơm mát, giàu vitamin, được trồng trong nhà kính theo quy chuẩn khép kín.',
    price: 35000,
    unit: 'túi 500g',
    stock: 120,
    status: 'ACTIVE',
    createdAt: new Date(),
    supplier: { id: 'mock-supplier-id', farmName: 'Hợp Tác Xã Trái Cây Sạch Cái Mơn', address: 'Xã Sơn Định, Huyện Chợ Lách, Tỉnh Bến Tre' },
    category: { name: 'Rau Củ Hữu Cơ' },
    images: [{ url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=500&auto=format' }]
  },
  {
    id: '3',
    categoryId: 'cat-veggies',
    name: 'Rau Muống Hữu Cơ',
    description: 'Rau muống non xanh, ăn giòn ngọt, trồng theo phương pháp tự nhiên không chất hóa học.',
    price: 15000,
    unit: 'bó 500g',
    stock: 200,
    status: 'ACTIVE',
    createdAt: new Date(),
    supplier: { id: 'mock-supplier-id2', farmName: 'Vườn Rau Sạch Bến Tre', address: 'Bến Tre' },
    category: { name: 'Rau Củ Hữu Cơ' },
    images: [{ url: 'https://images.unsplash.com/photo-1557844352-761f2565b576?w=500&auto=format' }]
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
      { status: 'PICKED_UP', title: 'Thu hoạch & Đóng gói', description: 'Lô hàng đã được xếp dỡ vào container lạnh tại HTX Cái Mơn', timestamp: '2026-05-23T06:00:00.000Z', location: 'Cái Mơn, Bến Tre' },
      { status: 'IN_TRANSIT', title: 'Vận chuyển trung chuyển', description: 'Xe đông lạnh BKS 29H-123.45 đang di chuyển qua cao tốc Trung Lương', timestamp: '2026-05-23T08:30:00.000Z', location: 'Tiền Giang' },
      { status: 'DELIVERED', title: 'Cập cảng phân phối', description: 'Hàng đã cập kho trung chuyển CropNet D2C TP. HCM', timestamp: '2026-05-23T10:30:00.000Z', location: 'Bình Chánh, TP. HCM' }
    ],
    inspectionReports: [
      {
        inspector: 'Trạm Kiểm Định Vùng 2',
        status: 'PASSED',
        checkDate: '2026-05-23T07:30:00.000Z',
        comments: 'Sản phẩm đạt các chỉ số kiểm nghiệm, không có dư lượng thuốc bảo vệ thực vật hay kim loại nặng. Đạt chuẩn xuất khẩu loại 1.',
        metrics: {
          pesticideLevel: '0.0%',
          humidity: '85.2%',
          sugarLevel: '12.5 Brix'
        }
      }
    ],
    shipmentInfo: {
      shipmentId: 'SHIP-BUOI-CAIMON-01',
      carrier: 'Hãng vận tải Vạn Xuân',
      vehicle: 'Container đông lạnh Hyundai 3.5 tấn - BKS 29H-123.45',
      currentTemp: '5.2°C',
      humidity: '78.4%',
      departureDate: '2026-05-23T06:15:00.000Z',
      arrivalDate: '2026-05-23T10:45:00.000Z'
    },
    product: {
      name: 'Bưởi Da Xanh Bến Tre',
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

