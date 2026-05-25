import { prisma } from '../../database/client';
import { 
  isDatabaseError, mockUsersList, MOCK_PRODUCTS, MOCK_ORDERS, MOCK_BATCHES,
  updateMockUserStatus, updateMockSupplierStatus, updateMockProductStatus, updateMockCertificationStatus
} from '../../database/dbFallback';

// Local mock states when offline
let mockProductsList: any[] = [...MOCK_PRODUCTS];
let mockOrdersList: any[] = [...MOCK_ORDERS];

export const findAllUsers = async () => {
  try {
    return await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        status: true,
        role: { select: { name: true } },
        supplier: { select: { id: true, farmName: true, address: true, status: true } }
      }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      return mockUsersList.map((u: any) => ({
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        phone: u.phone || null,
        status: u.status,
        role: { name: u.role },
        supplier: u.supplierId ? { id: u.supplierId, farmName: u.farmName || 'HTX Trái Cây Sạch Cái Mơn', address: u.address || 'Bến Tre', status: u.supplierStatus } : null
      })) as any[];
    }
    throw error;
  }
};

export const findUserById = async (id: string) => {
  try {
    return await prisma.user.findUnique({
      where: { id },
      include: { role: true }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      const match = mockUsersList.find(u => u.id === id);
      if (!match) return null;
      return {
        id: match.id,
        role: { name: match.role },
        status: match.status
      } as any;
    }
    throw error;
  }
};

export const updateUserStatus = async (id: string, status: string) => {
  try {
    return await prisma.user.update({
      where: { id },
      data: { status }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      updateMockUserStatus(id, status);
      return { id, status } as any;
    }
    throw error;
  }
};

export const updateSupplierStatus = async (userId: string, status: string) => {
  try {
    return await prisma.supplier.updateMany({
      where: { userId },
      data: { status }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      updateMockSupplierStatus(userId, status);
      return { userId, status } as any;
    }
    throw error;
  }
};

export const findAllProducts = async () => {
  try {
    return await prisma.product.findMany({
      include: {
        category: true,
        supplier: true,
        images: true
      }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      return MOCK_PRODUCTS;
    }
    throw error;
  }
};

export const updateProductStatus = async (id: string, status: string) => {
  try {
    return await prisma.product.update({
      where: { id },
      data: { status }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      updateMockProductStatus(id, status);
      return { id, status } as any;
    }
    throw error;
  }
};

export const deleteProduct = async (id: string) => {
  try {
    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      const idx = MOCK_PRODUCTS.findIndex(p => p.id === id);
      if (idx !== -1) MOCK_PRODUCTS.splice(idx, 1);
      return;
    }
    throw error;
  }
};

export const findAllOrders = async () => {
  try {
    return await prisma.order.findMany({
      include: {
        customer: true,
        orderItems: { include: { product: true } },
        payment: true,
        shipment: true
      }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      return MOCK_ORDERS;
    }
    throw error;
  }
};

export const updateOrderStatus = async (id: string, status: string) => {
  try {
    return await prisma.order.update({
      where: { id },
      data: { status }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      const match = MOCK_ORDERS.find(o => o.id === id);
      if (match) match.status = status;
      return { id, status } as any;
    }
    throw error;
  }
};

export const findAllCertificates = async () => {
  try {
    return await prisma.certification.findMany({
      include: { batch: { include: { product: true } } }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      const mockCerts: any[] = [];
      MOCK_BATCHES.forEach(b => {
        if (b.certifications) {
          b.certifications.forEach((c: any) => {
            mockCerts.push({
              ...c,
              batch: { batchCode: b.batchCode, product: { name: b.product?.name } }
            });
          });
        }
      });
      return mockCerts;
    }
    throw error;
  }
};

export const updateCertificationStatus = async (id: string, status: string) => {
  try {
    return await prisma.certification.update({
      where: { id },
      data: { status }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      return updateMockCertificationStatus(id, status);
    }
    throw error;
  }
};
