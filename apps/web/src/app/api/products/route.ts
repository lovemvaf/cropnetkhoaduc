import { NextRequest, NextResponse } from 'next/server';
import { VERIFIED_PRODUCTS } from '@/data/catalog';
import { removeVietnameseTones } from '@/server/rag';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const categoryId = searchParams.get('categoryId');
    const tag = searchParams.get('tag');
    const supplier = searchParams.get('supplier');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    let list = [...VERIFIED_PRODUCTS];

    if (search) {
      const qNorm = removeVietnameseTones(search);
      list = list.filter(p => {
        const nameNorm = removeVietnameseTones(p.name);
        const descNorm = removeVietnameseTones(p.description);
        const tagsNorm = p.tags.map(t => removeVietnameseTones(t)).join(' ');
        return nameNorm.includes(qNorm) || descNorm.includes(qNorm) || tagsNorm.includes(qNorm);
      });
    }

    if (categoryId && categoryId !== 'ALL') {
      list = list.filter(p => p.categoryId === categoryId);
    }

    if (tag) {
      list = list.filter(p => p.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
    }

    if (supplier) {
      const sLower = supplier.toLowerCase();
      list = list.filter(p => p.supplierId.toLowerCase().includes(sLower) || p.supplier.farmName.toLowerCase().includes(sLower));
    }

    if (minPrice) {
      const min = Number(minPrice);
      if (!isNaN(min)) list = list.filter(p => p.price >= min);
    }

    if (maxPrice) {
      const max = Number(maxPrice);
      if (!isNaN(max)) list = list.filter(p => p.price <= max);
    }

    if (sort === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const total = list.length;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      data: {
        products: paginated,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1
        }
      }
    });

  } catch (error: any) {
    console.error('Products API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Lỗi tải danh mục sản phẩm'
    }, { status: 500 });
  }
}
