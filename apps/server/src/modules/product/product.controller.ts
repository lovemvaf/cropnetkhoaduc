import { Request, Response, NextFunction } from 'express';
import * as productService from './product.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { UnauthorizedError } from '../../utils/errors';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId, search, minPrice, maxPrice, tag, sort, page, limit, supplierId, status } = req.query;
    
    const { products, total } = await productService.listAllProducts({
      categoryId: categoryId as string,
      search: search as string,
      minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
      maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
      tag: tag as string,
      sort: sort as string,
      page: page !== undefined ? Number(page) : undefined,
      limit: limit !== undefined ? Number(limit) : undefined,
      supplierId: supplierId as string,
      status: status as string
    });

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 12));

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const p = await productService.getSingleProduct(req.params.id);
    res.status(200).json({ success: true, data: p });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Chưa đăng nhập');
    }
    const { categoryId, name, description, price, unit, stock, imageUrls, tags, variants, imageUrl } = req.body;
    
    const supplier = await productService.getSupplierByUserId(req.user.id);
    
    // Support legacy singular imageUrl or imageUrls array
    const finalImageUrls = imageUrls || (imageUrl ? [imageUrl] : []);

    const p = await productService.addProduct(req.user.id, {
      categoryId, 
      name, 
      description, 
      price: Number(price), 
      unit, 
      stock: Number(stock), 
      imageUrls: finalImageUrls,
      tags,
      variants
    }, supplier.id);

    res.status(201).json({ success: true, data: p });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Chưa đăng nhập');
    }
    const { id } = req.params;
    const { categoryId, name, description, price, unit, stock, imageUrls, tags, variants, status } = req.body;

    const supplier = await productService.getSupplierByUserId(req.user.id);

    const p = await productService.editProduct(id, supplier.id, {
      categoryId,
      name,
      description,
      price: price !== undefined ? Number(price) : undefined,
      unit,
      stock: stock !== undefined ? Number(stock) : undefined,
      imageUrls,
      tags,
      variants,
      status
    });

    res.status(200).json({ success: true, data: p, message: 'Cập nhật sản phẩm thành công!' });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Chưa đăng nhập');
    }
    const { id } = req.params;
    const supplier = await productService.getSupplierByUserId(req.user.id);

    await productService.removeProduct(id, supplier.id);
    res.status(200).json({ success: true, message: 'Đã xóa sản phẩm khỏi sàn thành công!' });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Chưa đăng nhập');
    }
    const { rating, comment, orderItemId } = req.body;
    const { productId } = req.params;

    const review = await productService.createProductReview(productId, { rating, comment, orderItemId }, req.user.id);
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

export const replyToReview = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Chưa đăng nhập');
    }
    const { reply } = req.body;
    const { id } = req.params;

    const supplier = await productService.getSupplierByUserId(req.user.id);
    const review = await productService.replyToProductReview(id, reply, supplier.id);
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};
