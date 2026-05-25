import * as categoryRepo from './category.repository';
import { BadRequestError, NotFoundError } from '../../utils/errors';

export const listCategories = async () => {
  return await categoryRepo.findAllCategories();
};

export const getCategoryDetails = async (id: string) => {
  const cat = await categoryRepo.findCategoryById(id);
  if (!cat) throw new NotFoundError('Không tìm thấy danh mục này');
  return cat;
};

export const addCategory = async (data: { name: string; slug: string }) => {
  const existing = await categoryRepo.findCategoryBySlug(data.slug);
  if (existing) {
    throw new BadRequestError('Slug danh mục này đã tồn tại');
  }
  return await categoryRepo.createCategory(data);
};

export const editCategory = async (id: string, data: { name: string; slug: string }) => {
  const cat = await categoryRepo.findCategoryById(id);
  if (!cat) throw new NotFoundError('Không tìm thấy danh mục này');

  const existingSlug = await categoryRepo.findCategoryBySlug(data.slug);
  if (existingSlug && existingSlug.id !== id) {
    throw new BadRequestError('Slug danh mục này đã được sử dụng bởi danh mục khác');
  }

  return await categoryRepo.updateCategory(id, data);
};

export const removeCategory = async (id: string) => {
  const cat = await categoryRepo.findCategoryById(id);
  if (!cat) throw new NotFoundError('Không tìm thấy danh mục này');
  return await categoryRepo.deleteCategory(id);
};
