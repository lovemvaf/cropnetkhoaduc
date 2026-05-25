import { prisma } from '../../database/client';
import { isDatabaseError, mockCategoriesList, addMockCategory, updateMockCategory, deleteMockCategory } from '../../database/dbFallback';

export const findAllCategories = async () => {
  try {
    return await prisma.category.findMany();
  } catch (error: any) {
    if (isDatabaseError(error)) {
      return mockCategoriesList;
    }
    throw error;
  }
};

export const findCategoryById = async (id: string) => {
  try {
    return await prisma.category.findUnique({ where: { id } });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      return mockCategoriesList.find(c => c.id === id) || null;
    }
    throw error;
  }
};

export const findCategoryBySlug = async (slug: string) => {
  try {
    return await prisma.category.findUnique({ where: { slug } });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      return mockCategoriesList.find(c => c.slug === slug) || null;
    }
    throw error;
  }
};

export const createCategory = async (data: { name: string; slug: string }) => {
  try {
    return await prisma.category.create({ data });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      return addMockCategory(data.name, data.slug);
    }
    throw error;
  }
};

export const updateCategory = async (id: string, data: { name: string; slug: string }) => {
  try {
    return await prisma.category.update({
      where: { id },
      data
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      return updateMockCategory(id, data.name, data.slug);
    }
    throw error;
  }
};

export const deleteCategory = async (id: string) => {
  try {
    await prisma.category.delete({ where: { id } });
    return true;
  } catch (error: any) {
    if (isDatabaseError(error)) {
      return deleteMockCategory(id);
    }
    throw error;
  }
};
