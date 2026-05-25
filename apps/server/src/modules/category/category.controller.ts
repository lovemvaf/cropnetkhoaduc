import { Request, Response, NextFunction } from 'express';
import * as categoryService from './category.service';

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await categoryService.listCategories();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await categoryService.getCategoryDetails(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug } = req.body;
    const data = await categoryService.addCategory({ name, slug });
    res.status(201).json({ success: true, data, message: 'Tạo danh mục mới thành công!' });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, slug } = req.body;
    const data = await categoryService.editCategory(id, { name, slug });
    res.status(200).json({ success: true, data, message: 'Cập nhật danh mục thành công!' });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await categoryService.removeCategory(id);
    res.status(200).json({ success: true, message: 'Xóa danh mục thành công!' });
  } catch (error) {
    next(error);
  }
};
