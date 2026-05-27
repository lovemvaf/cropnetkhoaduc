import { prisma } from '../../database/client';
import { isDatabaseError, MOCK_PRODUCTS } from '../../database/dbFallback';
import { logger } from '../../utils/logger';

export const findProducts = async (filters: { 
  categoryId?: string; 
  search?: string; 
  minPrice?: number; 
  maxPrice?: number; 
  tag?: string; 
  sort?: string; 
  skip?: number; 
  take?: number;
  supplierId?: string;
  status?: string;
}) => {
  try {
    const where: any = {};
    
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }
    if (filters.search) {
      where.name = {
        contains: filters.search,
        mode: 'insensitive'
      };
    }
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
    }
    if (filters.tag) {
      where.tags = {
        has: filters.tag
      };
    }
    if (filters.supplierId) {
      where.supplierId = filters.supplierId;
    }
    if (filters.status) {
      where.status = filters.status;
    } else if (!filters.supplierId) {
      // In marketplace public view, only show ACTIVE products
      where.status = 'ACTIVE';
    }

    let orderBy: any = { createdAt: 'desc' };
    if (filters.sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (filters.sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (filters.sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: filters.skip,
        take: filters.take,
        include: {
          supplier: { select: { id: true, farmName: true, address: true } },
          category: { select: { name: true } },
          images: { select: { url: true } }
        },
        orderBy
      }),
      prisma.product.count({ where })
    ]);

    return { products, total };
  } catch (error: any) {
    if (isDatabaseError(error)) {
      logger.warn('Database connection failed. Falling back to mock products.');
      let filtered = [...MOCK_PRODUCTS];

      if (filters.supplierId) {
        filtered = filtered.filter(p => p.supplierId === filters.supplierId || p.supplier?.id === filters.supplierId);
      }
      if (filters.categoryId) {
        filtered = filtered.filter(p => p.categoryId === filters.categoryId);
      }
      if (filters.search) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(filters.search!.toLowerCase()));
      }
      if (filters.minPrice !== undefined) {
        filtered = filtered.filter(p => p.price >= filters.minPrice!);
      }
      if (filters.maxPrice !== undefined) {
        filtered = filtered.filter(p => p.price <= filters.maxPrice!);
      }
      if (filters.tag) {
        filtered = filtered.filter(p => Array.isArray(p.tags) && p.tags.includes(filters.tag!));
      }
      if (filters.status) {
        filtered = filtered.filter(p => p.status === filters.status);
      } else if (!filters.supplierId) {
        filtered = filtered.filter(p => p.status === 'ACTIVE');
      }

      // Sort simulation
      if (filters.sort === 'price_asc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (filters.sort === 'price_desc') {
        filtered.sort((a, b) => b.price - a.price);
      } else {
        // default newest
        filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      }

      const total = filtered.length;
      if (filters.skip !== undefined && filters.take !== undefined) {
        filtered = filtered.slice(filters.skip, filters.skip + filters.take);
      }

      return { products: filtered, total };
    }
    throw error;
  }
};

export const findProductById = async (id: string) => {
  try {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        supplier: { select: { id: true, farmName: true, address: true } },
        category: { select: { name: true } },
        images: { select: { url: true } },
        batches: {
          include: { certifications: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      logger.warn(`Database connection failed. Falling back to mock product details for ID: ${id}.`);
      const prod = MOCK_PRODUCTS.find(p => p.id === id) || MOCK_PRODUCTS[0];
      return {
        ...prod,
        supplier: prod.supplier || { id: 'mock-supplier-id', farmName: 'HTX Cái Mơn', address: 'Bến Tre' },
        category: prod.category || { name: 'Trái Cây Sạch' },
        images: prod.images || [{ url: prod.imageUrl || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=500&auto=format' }],
        batches: prod.batches || [
          {
            id: 'mock-batch-1',
            batchCode: 'BATCH-BUOI-CAIMON-01',
            harvestDate: new Date(),
            farmingArea: 'Phân khu A3 - Trồng trọt Bưởi Hữu Cơ',
            farmingProcess: 'Tưới tiêu bằng nước ngọt tự nhiên từ sông Hàm Luông, bón phân compost hữu cơ tự nhiên không sử dụng thuốc trừ sâu hóa học.',
            qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BATCH-BUOI-CAIMON-01',
            certifications: [
              {
                id: 'mock-cert-1',
                name: 'Chứng nhận VietGAP',
                issuer: 'Cơ quan kiểm nghiệm cây trồng Bến Tre',
                validUntil: new Date('2028-12-31'),
                imageUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df53f7ec?w=500&auto=format'
              }
            ]
          }
        ]
      } as any;
    }
    throw error;
  }
};

export const insertProduct = async (data: {
  supplierId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  stock: number;
  imageUrls?: string[];
  tags?: string[];
  variants?: any;
}) => {
  try {
    return await prisma.product.create({
      data: {
        supplierId: data.supplierId,
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        price: data.price,
        unit: data.unit,
        stock: data.stock,
        tags: data.tags || [],
        variants: data.variants || null,
        images: data.imageUrls && data.imageUrls.length > 0 
          ? { create: data.imageUrls.map(url => ({ url })) } 
          : undefined
      },
      include: { images: true, category: true, supplier: true }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      logger.warn('Database connection failed. Simulating in-memory product creation.');
      const newProduct = {
        id: `mock-${Date.now()}`,
        supplierId: data.supplierId,
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        price: data.price,
        unit: data.unit,
        stock: data.stock,
        status: 'ACTIVE',
        tags: data.tags || [],
        variants: data.variants || null,
        createdAt: new Date(),
        supplier: { id: data.supplierId, farmName: 'Hợp Tác Xã Trái Cây Sạch Cái Mơn', address: 'Xã Sơn Định, Huyện Chợ Lách, Tỉnh Bến Tre' },
        category: { name: 'Nông Sản' },
        images: data.imageUrls && data.imageUrls.length > 0 
          ? data.imageUrls.map(url => ({ url })) 
          : [{ url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=500&auto=format' }]
      };
      MOCK_PRODUCTS.push(newProduct);
      return newProduct;
    }
    throw error;
  }
};

export const updateProduct = async (id: string, data: {
  categoryId?: string;
  name?: string;
  description?: string;
  price?: number;
  unit?: string;
  stock?: number;
  imageUrls?: string[];
  tags?: string[];
  variants?: any;
  status?: string;
}) => {
  try {
    if (data.imageUrls) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
    }

    return await prisma.product.update({
      where: { id },
      data: {
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        price: data.price,
        unit: data.unit,
        stock: data.stock,
        tags: data.tags,
        variants: data.variants,
        status: data.status,
        images: data.imageUrls && data.imageUrls.length > 0 ? {
          create: data.imageUrls.map(url => ({ url }))
        } : undefined
      },
      include: { images: true, category: true, supplier: true }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      logger.warn(`Database connection failed. Simulating in-memory product update for ID: ${id}`);
      const index = MOCK_PRODUCTS.findIndex(p => p.id === id);
      if (index !== -1) {
        const updated = {
          ...MOCK_PRODUCTS[index],
          ...data,
          price: data.price !== undefined ? Number(data.price) : MOCK_PRODUCTS[index].price,
          stock: data.stock !== undefined ? Number(data.stock) : MOCK_PRODUCTS[index].stock,
          images: data.imageUrls && data.imageUrls.length > 0 
            ? data.imageUrls.map(url => ({ url })) 
            : MOCK_PRODUCTS[index].images
        };
        MOCK_PRODUCTS[index] = updated;
        return updated;
      }
      return null;
    }
    throw error;
  }
};

export const deleteProduct = async (id: string) => {
  try {
    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });
    return true;
  } catch (error: any) {
    if (isDatabaseError(error)) {
      logger.warn(`Database connection failed. Simulating in-memory product deletion for ID: ${id}`);
      const index = MOCK_PRODUCTS.findIndex(p => p.id === id);
      if (index !== -1) {
        MOCK_PRODUCTS.splice(index, 1);
        return true;
      }
      return false;
    }
    throw error;
  }
};

export const findSupplierByUserId = async (userId: string) => {
  try {
    return await prisma.supplier.findUnique({ where: { userId } });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      return { id: 'mock-supplier-id', userId, farmName: 'HTX Cái Mơn', address: 'Bến Tre', status: 'APPROVED' };
    }
    throw error;
  }
};

export const insertReview = async (data: {
  productId: string;
  orderItemId: string;
  customerId: string;
  rating: number;
  comment?: string;
}) => {
  try {
    return await prisma.review.create({
      data: {
        productId: data.productId,
        orderItemId: data.orderItemId,
        customerId: data.customerId,
        rating: data.rating,
        comment: data.comment
      }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      return {
        id: `mock-review-${Date.now()}`,
        productId: data.productId,
        orderItemId: data.orderItemId,
        customerId: data.customerId,
        rating: data.rating,
        comment: data.comment,
        createdAt: new Date()
      };
    }
    throw error;
  }
};

export const findReviewById = async (id: string) => {
  try {
    return await prisma.review.findUnique({
      where: { id }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      return {
        id,
        productId: '1',
        orderItemId: 'mock-item-1',
        customerId: 'mock-customer-id',
        rating: 5,
        comment: 'Sản phẩm tuyệt vời',
        createdAt: new Date()
      };
    }
    throw error;
  }
};

export const updateReviewReply = async (id: string, reply: string) => {
  try {
    return await prisma.review.update({
      where: { id },
      data: { reply }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      return {
        id,
        reply,
        updatedAt: new Date()
      };
    }
    throw error;
  }
};
