import * as productRepo from './product.repository';
import { NotFoundError, ForbiddenError } from '../../utils/errors';

export const listAllProducts = async (filters: {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  tag?: string;
  sort?: string;
  page?: number;
  limit?: number;
  supplierId?: string;
  status?: string;
}) => {
  const pageNum = Math.max(1, filters.page || 1);
  const limitNum = Math.max(1, Math.min(100, filters.limit || 12));
  const skip = (pageNum - 1) * limitNum;
  const take = limitNum;

  return productRepo.findProducts({
    categoryId: filters.categoryId,
    search: filters.search,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    tag: filters.tag,
    sort: filters.sort,
    skip,
    take,
    supplierId: filters.supplierId,
    status: filters.status
  });
};

export const getSingleProduct = async (id: string) => {
  const p = await productRepo.findProductById(id);
  if (!p) throw new NotFoundError('Không tìm thấy nông sản này');
  return p;
};

export const addProduct = async (
  userId: string, 
  data: { 
    categoryId: string; 
    name: string; 
    description: string; 
    price: number; 
    unit: string; 
    stock: number; 
    imageUrls?: string[];
    tags?: string[];
    variants?: any;
  }, 
  supplierId: string
) => {
  return productRepo.insertProduct({
    supplierId,
    categoryId: data.categoryId,
    name: data.name,
    description: data.description,
    price: data.price,
    unit: data.unit,
    stock: data.stock,
    imageUrls: data.imageUrls,
    tags: data.tags,
    variants: data.variants
  });
};

export const editProduct = async (
  id: string,
  supplierId: string,
  data: {
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
  }
) => {
  const product = await productRepo.findProductById(id);
  if (!product) throw new NotFoundError('Không tìm thấy nông sản này');

  // Verify ownership: Farmer can only edit their own products
  const productSupplierId = product.supplierId || (product.supplier as any)?.id;
  if (productSupplierId !== supplierId) {
    throw new ForbiddenError('Bạn không có quyền chỉnh sửa nông sản của nhà vườn khác');
  }

  return await productRepo.updateProduct(id, data);
};

export const removeProduct = async (id: string, supplierId: string) => {
  const product = await productRepo.findProductById(id);
  if (!product) throw new NotFoundError('Không tìm thấy nông sản này');

  const productSupplierId = product.supplierId || (product.supplier as any)?.id;
  if (productSupplierId !== supplierId) {
    throw new ForbiddenError('Bạn không có quyền xóa nông sản của nhà vườn khác');
  }

  return await productRepo.deleteProduct(id);
};

export const getSupplierByUserId = async (userId: string) => {
  const supplier = await productRepo.findSupplierByUserId(userId);
  if (!supplier) {
    throw new NotFoundError('Không tìm thấy thông tin nông trại');
  }
  return supplier;
};

export const createProductReview = async (productId: string, data: { rating: number; comment?: string; orderItemId: string }, customerId: string) => {
  return await productRepo.insertReview({
    productId,
    orderItemId: data.orderItemId,
    customerId,
    rating: Number(data.rating),
    comment: data.comment
  });
};

export const replyToProductReview = async (id: string, reply: string, supplierId: string) => {
  const review = await productRepo.findReviewById(id);
  if (!review) throw new NotFoundError('Không tìm thấy đánh giá');

  const product = await productRepo.findProductById(review.productId);
  if (!product) throw new NotFoundError('Không tìm thấy nông sản tương ứng');

  const productSupplierId = product.supplierId || (product.supplier as any)?.id;
  if (productSupplierId !== supplierId) {
    throw new ForbiddenError('Bạn không có quyền phản hồi đánh giá của nhà vườn khác');
  }

  return await productRepo.updateReviewReply(id, reply);
};
