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
    const body = await request.json();
    const { content, parentId } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ success: false, error: 'Bình luận không được để trống' }, { status: 400 });
    }

    const user = getUserFromRequest(request);
    const authorId = user?.id || 'anonymous-customer';
    const authorName = user?.fullName || 'Thành viên Đồng Nai';

    const newComment = db.addComment(id, {
      postId: id,
      authorId,
      authorName,
      content: content.trim(),
      status: 'PUBLISHED',
      parentId: parentId || null
    });

    return NextResponse.json({
      success: true,
      message: 'Thêm bình luận thành công',
      data: newComment
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
