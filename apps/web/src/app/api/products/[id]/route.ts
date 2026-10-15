import { NextRequest, NextResponse } from 'next/server';
import { VERIFIED_PRODUCTS, VERIFIED_BATCHES } from '@/data/catalog';

export const dynamic = 'force-dynamic';

const ID_ALIASES: Record<string, string> = {
  '1': 'prod-buoi-duong-la-cam',
  '2': 'prod-buoi-da-xanh-tantrieu',
  '3': 'prod-saurieng-ri6-longkhanh',
  '4': 'prod-chom-chom-nhan-longkhanh',
  '5': 'prod-hat-dieu-rang-cui',
  '6': 'prod-ruou-buoi-tan-trieu',
  '7': 'prod-tieu-den-xuanloc'
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const rawId = resolvedParams.id;
    const targetId = ID_ALIASES[rawId] || rawId;

    const product = VERIFIED_PRODUCTS.find(p => p.id === targetId || p.id === rawId);

    if (!product) {
      return NextResponse.json({
        success: false,
        error: 'Không tìm thấy sản phẩm trên hệ thống CropNet.'
      }, { status: 404 });
    }

    // Attach linked batches if any
    const batches = Object.values(VERIFIED_BATCHES).filter(b => b.productId === product.id);

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        batches
      }
    });

  } catch (error: any) {
    console.error('Product Detail API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Lỗi tải chi tiết sản phẩm'
    }, { status: 500 });
  }
}
