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

    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Nội dung bình luận không được để trống.'
      }, { status: 400 });
    }

    const user = getUserFromRequest(request);

    const comment = db.addComment(postId, {
      postId,
      authorId: user ? user.id : 'guest-commenter',
      authorName: user ? user.fullName : 'Khách thăm quan',
      content: content.trim(),
      status: 'PUBLISHED'
    });

    return NextResponse.json({
      success: true,
      message: 'Bình luận thành công!',
      data: comment
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Lỗi gửi bình luận'
    }, { status: 500 });
  }
}
