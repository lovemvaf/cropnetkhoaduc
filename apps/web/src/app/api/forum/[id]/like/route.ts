import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { getUserFromRequest } from '@/server/auth';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = getUserFromRequest(request);
    const userId = user?.id || 'anonymous-user';
    const result = db.toggleLikePost(id, userId);

    return NextResponse.json({
      success: true,
      data: {
        postId: id,
        likes: result.likes,
        isLiked: result.isLiked,
        message: 'Đã cập nhật lượt thích bài viết'
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
