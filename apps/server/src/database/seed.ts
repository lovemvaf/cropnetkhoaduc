import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding CropNet DB...');

  // Safeguard: do not wipe active tables in production
  if (process.env.NODE_ENV === 'production') {
    console.log('⚠️ Running in PRODUCTION mode. Skipping database truncate cleanup to prevent data loss.');
    const count = await prisma.user.count();
    if (count > 0) {
      console.log('Database already contains users. Seeding aborted.');
      return;
    }
  } else {
    // Delete all existing entries to prevent duplicates in dev/test
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

  // Create Roles
  const adminRole = await prisma.role.create({ data: { name: 'ADMIN', description: 'Quản trị hệ thống' } });
  const customerRole = await prisma.role.create({ data: { name: 'CUSTOMER', description: 'Khách mua nông sản' } });
  const farmerRole = await prisma.role.create({ data: { name: 'FARMER', description: 'Nhà vườn / Hợp tác xã' } });
  const logisticsRole = await prisma.role.create({ data: { name: 'LOGISTICS', description: 'Đơn vị vận chuyển nông sản' } });
  const inspectorRole = await prisma.role.create({ data: { name: 'INSPECTOR', description: 'Kiểm định viên chất lượng' } });

  // Password hash
  const pwd = await bcrypt.hash('123456', 10);

  // Create Users
  const uAdmin = await prisma.user.create({
    data: { email: 'admin@cropnet.vn', passwordHash: pwd, fullName: 'Cộng Tác Viên CropNet', roleId: adminRole.id }
  });
  const uCustomer = await prisma.user.create({
    data: { email: 'khachhang@gmail.com', passwordHash: pwd, fullName: 'Trần Thị Hà Nội', roleId: customerRole.id }
  });
  const uFarmer = await prisma.user.create({
    data: { email: 'farmer@nongnghiep.vn', passwordHash: pwd, fullName: 'Chú Út Miền Tây', roleId: farmerRole.id }
  });
  const uLogistics = await prisma.user.create({
    data: { email: 'logistics@cropnet.vn', passwordHash: pwd, fullName: 'Vận Chuyển CropNet', roleId: logisticsRole.id }
  });
  const uInspector = await prisma.user.create({
    data: { email: 'inspector@cropnet.vn', passwordHash: pwd, fullName: 'Trạm Kiểm Định CropNet', roleId: inspectorRole.id }
  });

  // Create Supplier profile
  const supplier = await prisma.supplier.create({
    data: {
      userId: uFarmer.id,
      farmName: 'Hợp Tác Xã Trái Cây Sạch Cái Mơn',
      address: 'Xã Sơn Định, Huyện Chợ Lách, Tỉnh Bến Tre',
      latitude: 10.2458,
      longitude: 106.1284,
      status: 'APPROVED'
    }
  });

  // Create Categories
  const catFruits = await prisma.category.create({ data: { name: 'Trái Cây Sạch', slug: 'trai-cay-sach' } });
  const catVeggies = await prisma.category.create({ data: { name: 'Rau Củ Hữu Cơ', slug: 'rau-cu-huu-co' } });

  // Create Products
  const p1 = await prisma.product.create({
    data: {
      supplierId: supplier.id,
      categoryId: catFruits.id,
      name: 'Bưởi Da Xanh Cái Mơn',
      description: 'Bưởi da xanh ngọt đậm đà, vỏ mỏng ruột hồng tiêu biểu của vương quốc trái cây Cái Mơn, canh tác hữu cơ tự nhiên.',
      price: 65000,
      unit: 'quả 1.2kg',
      stock: 50,
      status: 'ACTIVE'
    }
  });

  const p2 = await prisma.product.create({
    data: {
      supplierId: supplier.id,
      categoryId: catVeggies.id,
      name: 'Cà Chua Bi Đà Lạt',
      description: 'Cà chua chín mọng thơm mát, giàu vitamin, được trồng trong nhà kính theo quy chuẩn hữu cơ khép kín.',
      price: 35000,
      unit: 'túi 500g',
      stock: 120,
      status: 'ACTIVE'
    }
  });

  const p3 = await prisma.product.create({
    data: {
      supplierId: supplier.id,
      categoryId: catVeggies.id,
      name: 'Rau Muống Hữu Cơ',
      description: 'Rau muống non xanh, ăn giòn ngọt, trồng theo phương pháp tự nhiên không chất hóa học tại Bến Tre.',
      price: 15000,
      unit: 'bó 500g',
      stock: 200,
      status: 'ACTIVE'
    }
  });

  const p4 = await prisma.product.create({
    data: {
      supplierId: supplier.id,
      categoryId: catFruits.id,
      name: 'Sầu Riêng Ri6 Vĩnh Long',
      description: 'Sầu riêng Ri6 cơm vàng hạt lép, béo ngậy ngọt ngào đặc sản trứ danh Vĩnh Long, chín tự nhiên không hóa chất nhúng thuốc.',
      price: 145000,
      unit: 'kg (quả 2.5kg)',
      stock: 30,
      status: 'ACTIVE'
    }
  });

  const p5 = await prisma.product.create({
    data: {
      supplierId: supplier.id,
      categoryId: catFruits.id,
      name: 'Xoài Cát Hòa Lộc',
      description: 'Xoài cát Hòa Lộc Tiền Giang quả to thuôn dài, khi chín vàng tươi, thịt xoài cát mịn màng ngọt lịm và thơm lừng.',
      price: 85000,
      unit: 'kg (2 quả)',
      stock: 40,
      status: 'ACTIVE'
    }
  });

  const p6 = await prisma.product.create({
    data: {
      supplierId: supplier.id,
      categoryId: catFruits.id,
      name: 'Bơ Sáp 034 Tây Nguyên',
      description: 'Bơ sáp 034 dáng dài đặc trưng Tây Nguyên, cơm vàng dẻo quánh, vị ngậy béo tự nhiên, vỏ xanh bóng đẹp mắt.',
      price: 55000,
      unit: 'túi 1kg',
      stock: 60,
      status: 'ACTIVE'
    }
  });

  const p7 = await prisma.product.create({
    data: {
      supplierId: supplier.id,
      categoryId: catVeggies.id,
      name: 'Nấm Đùi Gà Hữu Cơ',
      description: 'Nấm đùi gà thân trắng ngần, chắc thịt, giòn ngọt giàu dinh dưỡng trồng phòng lạnh khép kín tại Lâm Đồng.',
      price: 45000,
      unit: 'hộp 300g',
      stock: 80,
      status: 'ACTIVE'
    }
  });

  const p8 = await prisma.product.create({
    data: {
      supplierId: supplier.id,
      categoryId: catVeggies.id,
      name: 'Măng Tây Xanh Loại 1',
      description: 'Măng tây xanh Ninh Thuận loại 1 thân mập non tơ giòn ngọt, giàu chất xơ và khoáng chất tốt cho sức khỏe.',
      price: 85000,
      unit: 'bó 500g',
      stock: 100,
      status: 'ACTIVE'
    }
  });

  // Images
  await prisma.productImage.create({ data: { productId: p1.id, url: '/buoi-da-xanh-cai-mon.jpg' } });
  await prisma.productImage.create({ data: { productId: p2.id, url: '/cachuabidalat.jpg' } });
  await prisma.productImage.create({ data: { productId: p3.id, url: '/rau-muong-huu-co.jpg' } });
  await prisma.productImage.create({ data: { productId: p4.id, url: '/sau-rieng-vinh-long.jpg' } });
  await prisma.productImage.create({ data: { productId: p5.id, url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format' } });
  await prisma.productImage.create({ data: { productId: p6.id, url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&auto=format' } });
  await prisma.productImage.create({ data: { productId: p7.id, url: '/nam-dui-ga.jpg' } });
  await prisma.productImage.create({ data: { productId: p8.id, url: '/mang-tay-xanh.jpg' } });

  // Create Trace Batch for Product 1 (Pomelo)
  const batch1 = await prisma.traceBatch.create({
    data: {
      productId: p1.id,
      batchCode: 'BATCH-BUOI-CAIMON-01',
      harvestDate: new Date(),
      farmingArea: 'Phân khu A3 - Trồng trọt Bưởi Hữu Cơ',
      farmingProcess: 'Tưới tiêu bằng nước ngọt tự nhiên từ sông Hàm Luông, bón phân compost hữu cơ tự nhiên không sử dụng thuốc trừ sâu hóa học.',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BATCH-BUOI-CAIMON-01'
    }
  });

  // Create Trace Batch for Product 2 (Tomato)
  const batch2 = await prisma.traceBatch.create({
    data: {
      productId: p2.id,
      batchCode: 'BATCH-CACHUA-DALAT-01',
      harvestDate: new Date(),
      farmingArea: 'Nhà màng khu B - Trồng trọt Cà Chua Hữu Cơ',
      farmingProcess: 'Hệ thống tưới nhỏ giọt công nghệ Israel khép kín, bón phân hữu cơ vi sinh không sử dụng thuốc trừ sâu hóa học.',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BATCH-CACHUA-DALAT-01'
    }
  });

  // Create Trace Batch for Product 3 (Water Spinach)
  const batch3 = await prisma.traceBatch.create({
    data: {
      productId: p3.id,
      batchCode: 'BATCH-RAUMUONG-01',
      harvestDate: new Date(),
      farmingArea: 'Phân khu C1 - Trồng rau thủy canh hữu cơ',
      farmingProcess: 'Phương pháp thủy canh hồi lưu dùng dung dịch dinh dưỡng hữu cơ tự chế từ men vi sinh vi lượng sạch.',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BATCH-RAUMUONG-01'
    }
  });

  // Certification for Trace Batch Pomelo
  await prisma.certification.create({
    data: {
      batchId: batch1.id,
      name: 'Chứng nhận VietGAP',
      issuer: 'Cơ quan kiểm nghiệm cây trồng Bến Tre',
      validUntil: new Date('2028-12-31'),
      imageUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df53f7ec?w=500&auto=format'
    }
  });

  // Certification for Trace Batch Tomato
  await prisma.certification.create({
    data: {
      batchId: batch2.id,
      name: 'Chứng nhận VietGAP',
      issuer: 'Cơ quan kiểm nghiệm lâm nghiệp Lâm Đồng',
      validUntil: new Date('2028-12-31'),
      imageUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df53f7ec?w=500&auto=format'
    }
  });

  // Certification for Trace Batch Water Spinach
  await prisma.certification.create({
    data: {
      batchId: batch3.id,
      name: 'Chứng nhận hữu cơ Organic',
      issuer: 'Hiệp hội Nông nghiệp Hữu cơ Việt Nam',
      validUntil: new Date('2028-12-31'),
      imageUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df53f7ec?w=500&auto=format'
    }
  });

  console.log('Seeding CropNet DB successfully completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
