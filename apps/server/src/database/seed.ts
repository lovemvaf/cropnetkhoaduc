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
      name: 'Bưởi Da Xanh Bến Tre',
      description: 'Bưởi da xanh ngọt đậm đà, thu hoạch trực tiếp tại vườn cây Cái Mơn đạt chuẩn hữu cơ.',
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
      description: 'Cà chua chín mọng thơm mát, giàu vitamin, được trồng trong nhà kính theo quy chuẩn khép kín.',
      price: 35000,
      unit: 'túi 500g',
      stock: 120,
      status: 'ACTIVE'
    }
  });

  // Images
  await prisma.productImage.create({ data: { productId: p1.id, url: 'https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?w=500&auto=format' } });
  await prisma.productImage.create({ data: { productId: p2.id, url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=500&auto=format' } });

  // Create Trace Batch for Product 1
  const batch = await prisma.traceBatch.create({
    data: {
      productId: p1.id,
      batchCode: 'BATCH-BUOI-CAIMON-01',
      harvestDate: new Date(),
      farmingArea: 'Phân khu A3 - Trồng trọt Bưởi Hữu Cơ',
      farmingProcess: 'Tưới nước hữu cơ, dùng phân compost vi sinh tự ủ từ rau củ mục.',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BATCH-BUOI-CAIMON-01'
    }
  });

  // Certification for Trace Batch
  await prisma.certification.create({
    data: {
      batchId: batch.id,
      name: 'Chứng nhận VietGAP',
      issuer: 'Cục Trồng trọt Việt Nam',
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
