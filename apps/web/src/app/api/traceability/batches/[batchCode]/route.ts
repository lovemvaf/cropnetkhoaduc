import { NextRequest, NextResponse } from 'next/server';
import { VERIFIED_BATCHES } from '@/data/catalog';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ batchCode: string }> }
) {
  try {
    const resolvedParams = await params;
    const rawBatchCode = resolvedParams.batchCode;
    const batchCode = decodeURIComponent(rawBatchCode).toUpperCase().trim();

    const batch = VERIFIED_BATCHES[batchCode];

    if (!batch) {
      return NextResponse.json({
        success: false,
        error: `Mã lô ${batchCode} không tìm thấy trong hệ thống cơ sở dữ liệu nông nghiệp Thành phố Đồng Nai. Vui lòng kiểm tra lại tem nhãn truy xuất.`
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: batch
    });

  } catch (error: any) {
    console.error('Batch detail API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Lỗi tra cứu lô hàng'
    }, { status: 500 });
  }
}
