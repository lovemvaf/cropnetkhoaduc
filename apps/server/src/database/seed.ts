import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu khởi tạo dữ liệu mẫu CropNet Đồng Nai AI (2026)...');

  // Safeguard: do not wipe active tables in production
  if (process.env.NODE_ENV === 'production') {
    console.log('⚠️ Running in PRODUCTION mode. Skipping database truncate cleanup to prevent data loss.');
    const count = await prisma.user.count();
    if (count > 0) {
      console.log('Database already contains users. Seeding aborted.');
      return;
    }
  } else {
    // Delete existing entries for clean dev baseline
    await prisma.review.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.certification.deleteMany();
    await prisma.traceBatch.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    await prisma.supplier.deleteMany();
    await prisma.user.deleteMany();
    await prisma.category.deleteMany();
    await prisma.role.deleteMany();
  }

  // 1. Create Roles
  const adminRole = await prisma.role.create({ data: { name: 'ADMIN', description: 'Ban Quản Trị Hệ Thống CropNet Đồng Nai AI' } });
  const customerRole = await prisma.role.create({ data: { name: 'CUSTOMER', description: 'Khách hàng mua lẻ & tổ chức' } });
  const farmerRole = await prisma.role.create({ data: { name: 'FARMER', description: 'Chủ nhiệm Hợp tác xã / Nhà vườn Thành phố Đồng Nai' } });
  const logisticsRole = await prisma.role.create({ data: { name: 'LOGISTICS', description: 'Đội xe vận chuyển nông sản lạnh Đồng Nai' } });
  const inspectorRole = await prisma.role.create({ data: { name: 'INSPECTOR', description: 'Cán bộ kiểm định chất lượng nông sản' } });

  // 2. Hash Password
  const pwd = await bcrypt.hash('CropNet@2026', 10);

  // 3. Create Users
  const uAdmin = await prisma.user.create({
    data: { email: 'admin@cropnet.vn', passwordHash: pwd, fullName: 'Ban Quản Trị CropNet Đồng Nai', roleId: adminRole.id, isEmailVerified: true }
  });
  const uCustomer = await prisma.user.create({
    data: { email: 'khachhang@gmail.com', passwordHash: pwd, fullName: 'Nguyễn Thị Bích Ngọc', roleId: customerRole.id, isEmailVerified: true }
  });
  const uFarmerTanTrieu = await prisma.user.create({
    data: { email: 'tantrieu@cropnet.vn', passwordHash: pwd, fullName: 'HTX Nông Nghiệp Tân Triều', roleId: farmerRole.id, isEmailVerified: true }
  });
  const uFarmerLongKhanh = await prisma.user.create({
    data: { email: 'longkhanh@cropnet.vn', passwordHash: pwd, fullName: 'HTX Nông Nghiệp Long Khánh', roleId: farmerRole.id, isEmailVerified: true }
  });
  const uLogistics = await prisma.user.create({
    data: { email: 'logistics@cropnet.vn', passwordHash: pwd, fullName: 'Vận Chuyển Nông Sản Đồng Nai', roleId: logisticsRole.id, isEmailVerified: true }
  });
  const uInspector = await prisma.user.create({
    data: { email: 'inspector@cropnet.vn', passwordHash: pwd, fullName: 'Trạm Kiểm Định Nông Sản Đồng Nai', roleId: inspectorRole.id, isEmailVerified: true }
  });

  // 4. Create Suppliers (Cooperatives in Dong Nai)
  const supTanTrieu = await prisma.supplier.create({
    data: {
      userId: uFarmerTanTrieu.id,
      farmName: 'Hợp Tác Xã Nông Nghiệp Dịch Vụ Tân Triều',
      address: 'Xã Tân Bình, Vĩnh Cửu, Thành phố Đồng Nai',
      latitude: 11.0267,
      longitude: 106.8835,
      status: 'APPROVED'
    }
  });

  const supLongKhanh = await prisma.supplier.create({
    data: {
      userId: uFarmerLongKhanh.id,
      farmName: 'Hợp Tác Xã Nông Nghiệp Sinh Thái Long Khánh',
      address: 'Phường Xuân Lập, Thành phố Long Khánh, Thành phố Đồng Nai',
      latitude: 10.9258,
      longitude: 107.2412,
      status: 'APPROVED'
    }
  });

  // 5. Create Categories
  const catFruits = await prisma.category.create({ 
    data: { name: 'Trái Cây Đặc Sản Đồng Nai', slug: 'trai-cay-dac-san-dong-nai' } 
  });
  const catProcessed = await prisma.category.create({ 
    data: { name: 'Nông Sản Chế Biến & Hạt', slug: 'nong-san-che-bien-hat' } 
  });

  // 6. Create Verified Regional Products
  const p1 = await prisma.product.create({
    data: {
      id: 'prod-buoi-duong-la-cam',
      supplierId: supTanTrieu.id,
      categoryId: catFruits.id,
      name: 'Bưởi Đường Lá Cam Tân Triều (OCOP 4 Sao)',
      description: 'Bưởi đường lá cam trứ danh cù lao Tân Triều được bồi đắp bởi phù sa sông Đồng Nai. Quả nhỏ gọn vừa tay, da vàng xanh bóng, tép bưởi mọng nước ngọt thanh đậm đà, không the đắng.',
      price: 85000,
      unit: 'quả (1.1kg - 1.3kg)',
      stock: 150,
      status: 'ACTIVE',
      tags: ['OCOP', 'Bưởi Tân Triều', 'VietGAP', 'Đặc sản Đồng Nai']
    }
  });

  const p2 = await prisma.product.create({
    data: {
      id: 'prod-buoi-da-xanh-tantrieu',
      supplierId: supTanTrieu.id,
      categoryId: catFruits.id,
      name: 'Bưởi Da Xanh Tân Triều Hữu Cơ',
      description: 'Bưởi da xanh ruột hồng giòn ngọt, vị thanh mát, vỏ mỏng ruột chắc không hạt hoặc ít hạt. Canh tác an toàn sinh thái đạt chuẩn VietGAP tại xã Tân Bình.',
      price: 75000,
      unit: 'quả (1.3kg - 1.5kg)',
      stock: 120,
      status: 'ACTIVE',
      tags: ['VietGAP', 'Bưởi Tân Triều', 'Hữu cơ']
    }
  });

  const p3 = await prisma.product.create({
    data: {
      id: 'prod-saurieng-ri6-longkhanh',
      supplierId: supLongKhanh.id,
      categoryId: catFruits.id,
      name: 'Sầu Riêng Ri6 Long Khánh (Chín Cây Tự Nhiên)',
      description: 'Sầu riêng Ri6 đất đỏ bazan Long Khánh thu hoạch già đủ ngày, chín tự nhiên không nhúng thuốc kích chín. Cơm vàng óng, dẻo béo ngậy, hạt lép đậm đà.',
      price: 135000,
      unit: 'kg (quả 2.5kg - 3.5kg)',
      stock: 60,
      status: 'ACTIVE',
      tags: ['VietGAP', 'Sầu riêng Long Khánh', 'Chín tự nhiên']
    }
  });

  const p4 = await prisma.product.create({
    data: {
      id: 'prod-chomchom-nhan-longkhanh',
      supplierId: supLongKhanh.id,
      categoryId: catFruits.id,
      name: 'Chôm Chôm Nhãn Long Khánh',
      description: 'Chôm chôm nhãn (chôm chôm đường) vỏ vàng ửng đỏ, gai ngắn, cùi dày giòn tróc hạt, vị ngọt đậm thơm mát nức lòng. Mùa vụ thu hoạch rộ hè - thu.',
      price: 45000,
      unit: 'kg (chùm quả tươi)',
      stock: 250,
      status: 'ACTIVE',
      tags: ['Đặc sản Long Khánh', 'Đang mùa vụ']
    }
  });

  const p5 = await prisma.product.create({
    data: {
      id: 'prod-hatdieu-rangmuoi-dongnai',
      supplierId: supLongKhanh.id,
      categoryId: catProcessed.id,
      name: 'Hạt Điều Rang Muối Vỏ Lụa Đồng Nai (Hộp 500g)',
      description: 'Hạt điều Đồng Nai loại A tuyển chọn xuất khẩu, hạt to mẩy đều, rang củi thủ công cùng muối tinh giữ nguyên lớp vỏ lụa thơm bùi giòn rụm.',
      price: 120000,
      unit: 'hộp 500g',
      stock: 180,
      status: 'ACTIVE',
      tags: ['OCOP', 'Hạt điều Đồng Nai', 'Chế biến sạch']
    }
  });

  const p6 = await prisma.product.create({
    data: {
      id: 'prod-ruoubuoi-tantrieu',
      supplierId: supTanTrieu.id,
      categoryId: catProcessed.id,
      name: 'Rượu Bưởi Tân Triều Truyền Thống (Bình Gốm 750ml)',
      description: 'Đặc sản trứ danh lên men tự nhiên từ nước cốt bưởi đường lá cam Tân Triều và men thảo mộc, hương vị êm dịu sảng khoái, tốt cho tiêu hóa, thiết kế bình gốm mỹ nghệ sang trọng làm quà biếu.',
      price: 195000,
      unit: 'bình gốm 750ml',
      stock: 80,
      status: 'ACTIVE',
      tags: ['OCOP', 'Quà biếu tặng', 'Rượu bưởi Tân Triều']
    }
  });

  // 7. Product Images
  await prisma.productImage.create({ data: { productId: p1.id, url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&auto=format' } });
  await prisma.productImage.create({ data: { productId: p2.id, url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&auto=format' } });
  await prisma.productImage.create({ data: { productId: p3.id, url: 'https://images.unsplash.com/photo-1589330694653-ded6df53f7ec?w=800&auto=format' } });
  await prisma.productImage.create({ data: { productId: p4.id, url: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800&auto=format' } });
  await prisma.productImage.create({ data: { productId: p5.id, url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format' } });
  await prisma.productImage.create({ data: { productId: p6.id, url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format' } });

  // 8. Trace Batches with Cultivation Logs
  const batch1 = await prisma.traceBatch.create({
    data: {
      productId: p1.id,
      batchCode: 'BATCH-BUOI-TANTRIEU-2026-01',
      harvestDate: new Date('2026-10-10'),
      farmingArea: 'Vườn mẫu số 01 - HTX Nông nghiệp Tân Triều, Xã Tân Bình, Vĩnh Cửu, Thành phố Đồng Nai',
      farmingProcess: 'Canh tác sinh thái kết hợp VietGAP. Bón phân vi sinh ủ từ vỏ trấu và bã cà phê, dùng nước ngọt phù sa sông Đồng Nai tưới tiêu, bao trái bằng túi chuyên dụng chống ruồi đục quả không dùng thuốc hóa học.',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=BATCH-BUOI-TANTRIEU-2026-01',
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
      ]
    }
  });

  const batch2 = await prisma.traceBatch.create({
    data: {
      productId: p3.id,
      batchCode: 'BATCH-SAURIENG-LONGKHANH-2026-01',
      harvestDate: new Date('2026-10-12'),
      farmingArea: 'Vườn sầu riêng mẫu B2 - HTX Nông nghiệp Long Khánh, Phường Xuân Lập, TP Long Khánh, TP Đồng Nai',
      farmingProcess: 'Canh tác trên đất đỏ bazan tự nhiên. Bón phân trùn quế hữu cơ, cam kết neo trái chín già trên cây và tự rụng/gõ bộng thu hoạch, không ngâm thuốc ép chín.',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=BATCH-SAURIENG-LONGKHANH-2026-01',
      logisticsTimeline: [
        { status: 'REGISTERED', title: 'Khai báo vườn sầu riêng Ri6', description: 'HTX Long Khánh quản lý 30 cây sầu riêng lâu năm đạt độ tuổi thu hoạch', timestamp: '2026-05-10T08:00:00.000Z', location: 'Phường Xuân Lập, TP Long Khánh' },
        { status: 'CULTIVATION', title: 'Tỉa trái chọn lọc & Bón kali hữu cơ', description: 'Mỗi chùm chỉ giữ lại 1-2 quả cân đối, cung cấp dinh dưỡng hữu cơ', timestamp: '2026-07-05T09:00:00.000Z', location: 'Xuân Lập, TP Long Khánh' },
        { status: 'HARVESTED', title: 'Thu hoạch sầu riêng già chín cây', description: 'Kiểm tra gõ âm đục, cơm sầu lên màu vàng óng, mùi thơm tự nhiên nồng nàn', timestamp: '2026-10-12T05:30:00.000Z', location: 'Kho tuyển chọn HTX Long Khánh' }
      ],
      inspectionReports: []
    }
  });

  // 9. Certifications
  await prisma.certification.create({
    data: {
      batchId: batch1.id,
      name: 'Chứng nhận VietGAP Trồng trọt Đồng Nai',
      issuer: 'Chi cục Trồng trọt và Bảo vệ Thực vật Đồng Nai',
      status: 'APPROVED',
      validUntil: new Date('2028-12-31'),
      imageUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df53f7ec?w=500&auto=format'
    }
  });

  await prisma.certification.create({
    data: {
      batchId: batch1.id,
      name: 'Giấy chứng nhận Sản phẩm OCOP 4 Sao Tỉnh Đồng Nai',
      issuer: 'UBND Tỉnh Đồng Nai - Hội đồng Đánh giá Phân hạng OCOP',
      status: 'APPROVED',
      validUntil: new Date('2028-06-30'),
      imageUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df53f7ec?w=500&auto=format'
    }
  });

  console.log('✔ Hoàn thành khởi tạo dữ liệu mẫu CropNet Đồng Nai AI thành công!');
}

main()
  .catch((e) => {
    console.error('Lỗi khởi tạo DB:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
