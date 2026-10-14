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
    const body = await request.json();
    const { content, parentId } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ success: false, error: 'Bình luận không được để trống' }, { status: 400 });
    }

    const newComment = {
      id: `comment-${Date.now()}`,
      postId: id,
      authorId: 'user-current',
      authorName: 'Thành viên Đồng Nai',
      content: content.trim(),
      parentId: parentId || null,
      status: 'PUBLISHED',
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'Thêm bình luận thành công',
      data: newComment
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
