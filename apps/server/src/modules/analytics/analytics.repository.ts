import { prisma } from '../../database/client';
import { isDatabaseError, MOCK_ORDERS, MOCK_PRODUCTS, mockUsersList, MOCK_BATCHES } from '../../database/dbFallback';

export const findSystemCounts = async () => {
  try {
    const totalUsers = await prisma.user.count();
    const totalProducts = await prisma.product.count();
    const totalOrders = await prisma.order.count();
    const totalShipments = await prisma.shipment.count();
    const totalCertificates = await prisma.certification.count();

    const roleCounts = await prisma.role.findMany({
      include: {
        _count: { select: { users: true } }
      }
    });

    const getRoleCount = (name: string) => {
      const match = roleCounts.find(r => r.name === name);
      return match ? match._count.users : 0;
    };

    const ordersSum = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: 'CANCELLED' } }
    });

    return {
      totalUsers,
      totalSuppliers: getRoleCount('FARMER') + getRoleCount('SUPPLIER'),
      totalCustomers: getRoleCount('CUSTOMER'),
      totalLogistics: getRoleCount('LOGISTICS'),
      totalInspectors: getRoleCount('INSPECTOR'),
      totalProducts,
      totalOrders,
      totalRevenue: Number(ordersSum._sum.totalAmount || 0),
      totalShipments,
      totalCertificates
    };
  } catch (error: any) {
    if (isDatabaseError(error)) {
      // Fallback calculation using in-memory mock lists
      const getMockRoleCount = (roleName: string) => {
        return mockUsersList.filter(u => u.role === roleName).length;
      };
      
      const revenue = MOCK_ORDERS
        .filter(o => o.status !== 'CANCELLED')
        .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

      // count mock certs
      let certCount = 0;
      MOCK_BATCHES.forEach(b => {
        if (b.certifications) certCount += b.certifications.length;
      });

      return {
        totalUsers: mockUsersList.length,
        totalSuppliers: getMockRoleCount('FARMER') || 1,
        totalCustomers: getMockRoleCount('CUSTOMER') || 1,
        totalLogistics: getMockRoleCount('LOGISTICS') || 1,
        totalInspectors: getMockRoleCount('INSPECTOR') || 1,
        totalProducts: MOCK_PRODUCTS.length,
        totalOrders: MOCK_ORDERS.length,
        totalRevenue: revenue,
        totalShipments: MOCK_ORDERS.length,
        totalCertificates: certCount || 1
      };
    }
    throw error;
  }
};

export const findOrdersSince = async (date: Date) => {
  try {
    return await prisma.order.findMany({
      where: {
        createdAt: { gte: date },
        status: { not: 'CANCELLED' }
      },
      include: {
        orderItems: { include: { product: true } }
      },
      orderBy: { createdAt: 'asc' }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      return MOCK_ORDERS.filter(o => new Date(o.createdAt) >= date && o.status !== 'CANCELLED');
    }
    throw error;
  }
};

export const findTopProducts = async (limit: number, supplierId?: string) => {
  try {
    const whereClause = supplierId ? { product: { supplierId } } : {};
    const orderItems = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: whereClause,
      _sum: { quantity: true },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: limit
    });

    return await Promise.all(
      orderItems.map(async (item) => {
        const prod = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true }
        });
        return {
          name: prod?.name || 'Sản phẩm khác',
          value: Number(item._sum?.quantity || 0)
        };
      })
    );
  } catch (error: any) {
    if (isDatabaseError(error)) {
      return [
        { name: 'Bưởi Da Xanh Bến Tre', value: 65 },
        { name: 'Cà Chua Bi Đà Lạt', value: 40 },
        { name: 'Rau Muống Hữu Cơ', value: 25 }
      ];
    }
    throw error;
  }
};

export const findReviewsStats = async (supplierId?: string) => {
  try {
    const whereClause = supplierId ? { product: { supplierId } } : {};
    const reviews = await prisma.review.findMany({
      where: whereClause,
      select: { rating: true }
    });

    const total = reviews.length;
    const average = total > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total) : 5.0;

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      const rate = r.rating as 1 | 2 | 3 | 4 | 5;
      if (distribution[rate] !== undefined) {
        distribution[rate]++;
      }
    });

    return { total, average, distribution };
  } catch (error: any) {
    if (isDatabaseError(error)) {
      return {
        total: 12,
        average: 4.6,
        distribution: { 5: 8, 4: 3, 3: 1, 2: 0, 1: 0 }
      };
    }
    throw error;
  }
};

export const findExpiringCertificates = async () => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return await prisma.certification.findMany({
      where: {
        validUntil: { lte: thirtyDaysFromNow },
        status: 'APPROVED'
      },
      include: {
        batch: { select: { batchCode: true, product: { select: { name: true } } } }
      }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      return [
        { id: 'cert-1', name: 'Chứng nhận VietGAP', validUntil: new Date(Date.now() + 15 * 24 * 3600 * 1000), batch: { batchCode: 'BATCH-001', product: { name: 'Bưởi Da Xanh' } } }
      ];
    }
    throw error;
  }
};

export const findLowStockProducts = async (limit: number) => {
  try {
    return await prisma.product.findMany({
      where: { stock: { lte: 15 } },
      select: { name: true, stock: true },
      take: limit
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      return MOCK_PRODUCTS.filter(p => p.stock <= 15);
    }
    throw error;
  }
};

export const findSupplierProducts = async (supplierId: string, categoryId?: string) => {
  try {
    return await prisma.product.findMany({
      where: {
        supplierId,
        ...(categoryId ? { categoryId } : {})
      }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      return MOCK_PRODUCTS.filter(p => 
        p.supplierId === supplierId && (!categoryId || p.categoryId === categoryId)
      );
    }
    throw error;
  }
};

export const findSupplierOrdersSince = async (supplierId: string, date: Date) => {
  try {
    return await prisma.order.findMany({
      where: {
        orderItems: { some: { product: { supplierId } } },
        createdAt: { gte: date }
      },
      include: {
        orderItems: {
          where: { product: { supplierId } },
          include: { product: true }
        }
      }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      return MOCK_ORDERS.filter(o => {
        return new Date(o.createdAt) >= date;
      });
    }
    throw error;
  }
};

export const countCustomerBookmarks = async (customerId: string) => {
  try {
    return await prisma.postBookmark.count({ where: { userId: customerId } });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      return 2;
    }
    throw error;
  }
};

export const findAllShipments = async () => {
  try {
    return await prisma.shipment.findMany();
  } catch (error: any) {
    if (isDatabaseError(error)) {
      return [];
    }
    throw error;
  }
};

export const findAllCertifications = async () => {
  try {
    return await prisma.certification.findMany();
  } catch (error: any) {
    if (isDatabaseError(error)) {
      return [];
    }
    throw error;
  }
};

export const findCustomerOrders = async (customerId: string) => {
  try {
    return await prisma.order.findMany({
      where: { customerId, status: { not: 'CANCELLED' } },
      include: { orderItems: { include: { product: true } } }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      return MOCK_ORDERS.filter(o => o.customerId === customerId && o.status !== 'CANCELLED');
    }
    throw error;
  }
};
