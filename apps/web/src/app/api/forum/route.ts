import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { getUserFromRequest } from '@/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || undefined;
    const search = searchParams.get('search') || undefined;
    const tag = searchParams.get('tag') || undefined;
    const sort = searchParams.get('sort') || 'newest';

    const posts = db.getForumPosts(type, search, tag, sort);

    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        total: posts.length,
        page: 1,
        limit: 50
      }
    });

  } catch (error: any) {
    console.error('Forum GET error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Lỗi tải bài viết diễn đàn'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, type = 'POST', tags = [], status = 'PUBLISHED' } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Tiêu đề bài viết không được để trống.'
      }, { status: 400 });
    }

    if (!content || !content.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Nội dung bài viết không được để trống.'
      }, { status: 400 });
    }

    // Attach user profile if authenticated
    const currentUser = getUserFromRequest(request);

    const newPost = db.createForumPost({
      title: title.trim(),
      content: content.trim(),
      authorId: currentUser ? currentUser.id : 'usr-community-guest',
      authorName: currentUser ? currentUser.fullName : 'Thành viên Cộng đồng Nông sản',
      authorRole: currentUser ? currentUser.role : 'CUSTOMER',
      isPinned: false,
      type,
      status: status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED',
      tags: Array.isArray(tags) ? tags : []
    });

    return NextResponse.json({
      success: true,
      message: 'Đăng bài viết lên diễn đàn thành công!',
      data: newPost
    }, { status: 201 });

  } catch (error: any) {
    console.error('Forum POST error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Lỗi đăng bài viết'
    }, { status: 500 });
  }
}
