import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return [{ id: 'post-1' }, { id: 'post-2' }, { id: 'post-3' }, { id: 'post-4' }];
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return NextResponse.json({
      success: true,
      data: {
        postId: id,
        isLiked: true,
        message: 'Đã cập nhật lượt thích bài viết'
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
