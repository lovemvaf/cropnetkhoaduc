import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { getUserFromRequest } from '@/server/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const resolvedParams = await params;
    const postId = resolvedParams.postId;

    const user = getUserFromRequest(request);
    const userId = user ? user.id : 'guest-visitor';

    const result = db.toggleLikePost(postId, userId);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Lỗi tương tác bài viết'
    }, { status: 500 });
  }
}
