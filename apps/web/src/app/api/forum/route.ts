import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-static';

interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  status: string;
  createdAt: string;
  replies: any[];
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  likes: number;
  commentsCount: number;
  comments: Comment[];
  isPinned: boolean;
  isLiked: boolean;
  isBookmarked: boolean;
  type: string;
  status: string;
  tags: string[];
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

// In-memory persistent storage for serverless runtime fallback if Postgres is initializing
let serverPosts: ForumPost[] = [
  {
    id: 'post-1',
    title: 'Hợp tác chuyển đổi số HTX Nông nghiệp Tân Triều cùng CropNet AI 2026',
    content: 'HTX Tân Triều chính thức ứng dụng tem QR số hóa cho toàn bộ diện tích 25 hecta bưởi đường lá cam và bưởi da xanh cù lao Tân Triều. Nhờ hệ thống truy xuất minh bạch nguồn gốc và sự đồng hành của CropNet, các lô hàng bưởi sạch đều có nhật ký tưới tiêu, bón phân hữu cơ và kết quả kiểm định dư lượng rõ ràng trước khi xuất vườn.',
    authorId: 'mock-farmer-id',
    authorName: 'HTX Nông Nghiệp Tân Triều',
    authorRole: 'FARMER',
    likes: 86,
    commentsCount: 1,
    isPinned: true,
    isLiked: false,
    isBookmarked: false,
    type: 'ANNOUNCEMENT',
    status: 'PUBLISHED',
    tags: ['Đồng Nai AI', 'Bưởi Tân Triều', 'Chuyển đổi số', 'OCOP'],
    viewsCount: 1420,
    createdAt: '2026-10-05T08:00:00.000Z',
    updatedAt: '2026-10-05T08:00:00.000Z',
    comments: [
      {
        id: 'comment-1',
        postId: 'post-1',
        authorId: 'mock-customer-id',
        authorName: 'Nguyễn Thị Bích Ngọc (Biên Hòa)',
        content: 'Rất ủng hộ HTX Tân Triều làm mã QR truy xuất minh bạch để người tiêu dùng an tâm mua biếu!',
        status: 'PUBLISHED',
        createdAt: '2026-10-05T12:00:00.000Z',
        replies: []
      }
    ]
  },
  {
    id: 'post-2',
    title: 'Kỹ thuật neo trái chín tự nhiên trên cây tại HTX Nông Nghiệp Long Khánh',
    content: 'Chia sẻ kinh nghiệm canh tác sầu riêng Ri6 đất đỏ bazan: HTX cam kết không thu hái trái non và không nhúng thuốc kích chín. Toàn bộ sầu riêng đều được neo cuống bằng dây chuyên dụng, đợi rụng hoặc gõ bộng đạt chuẩn già cây 100% mới thu hoạch giao tới khách hàng.',
    authorId: 'mock-farmer-longkhanh',
    authorName: 'HTX Nông Nghiệp Long Khánh',
    authorRole: 'FARMER',
    likes: 64,
    commentsCount: 1,
    isPinned: false,
    isLiked: false,
    isBookmarked: false,
    type: 'TIP',
    status: 'PUBLISHED',
    tags: ['Sầu riêng Long Khánh', 'Chín tự nhiên', 'Kinh nghiệm nhà vườn'],
    viewsCount: 980,
    createdAt: '2026-10-08T09:30:00.000Z',
    updatedAt: '2026-10-08T09:30:00.000Z',
    comments: [
      {
        id: 'comment-2',
        postId: 'post-2',
        authorId: 'mock-inspector-id',
        authorName: 'Trạm Kiểm Định Nông Sản',
        content: 'Quy trình kiểm soát độ Brix và không hóa chất kích chín của HTX Long Khánh rất chuẩn mực.',
        status: 'PUBLISHED',
        createdAt: '2026-10-08T14:15:00.000Z',
        replies: []
      }
    ]
  },
  {
    id: 'post-3',
    title: 'Quy trình kiểm tra dư lượng thuốc bảo vệ thực vật tại trạm kiểm định',
    content: 'Để bảo vệ thương hiệu nông sản sạch Thành phố Đồng Nai, mỗi lô hàng đăng ký truy xuất trên CropNet đều được lấy mẫu ngẫu nhiên kiểm nghiệm chỉ tiêu vi sinh và kim loại nặng theo TCVN. Kết quả kiểm tra được công khai trên cổng truy xuất QR cho người tiêu dùng tra cứu.',
    authorId: 'mock-inspector-id',
    authorName: 'Trạm Kiểm Định Nông Sản Đồng Nai',
    authorRole: 'INSPECTOR',
    likes: 42,
    commentsCount: 0,
    isPinned: false,
    isLiked: false,
    isBookmarked: false,
    type: 'EDUCATION',
    status: 'PUBLISHED',
    tags: ['Kiểm định', 'An toàn thực phẩm', 'VietGAP', 'Minh bạch'],
    viewsCount: 710,
    createdAt: '2026-10-10T11:00:00.000Z',
    updatedAt: '2026-10-10T11:00:00.000Z',
    comments: []
  },
  {
    id: 'post-4',
    title: 'Nhật ký chăm sóc bưởi đường lá cam vụ Tết 2026: Tỉa cành và bón lót hữu cơ',
    content: 'Đợt triều cường sông Đồng Nai mang lượng phù sa dồi dào về bồi đắp cho các liếp bưởi Tân Triều. Hiện tại các vườn đang bước vào giai đoạn nuôi trái cuối, sử dụng đỗ tương ngâm ủ vi sinh để tạo vị ngọt thanh tự nhiên cho tép bưởi.',
    authorId: 'mock-farmer-id',
    authorName: 'Nhà Vườn Cù Lao Tân Triều',
    authorRole: 'FARMER',
    likes: 51,
    commentsCount: 0,
    isPinned: false,
    isLiked: false,
    isBookmarked: false,
    type: 'FARM_STORY',
    status: 'PUBLISHED',
    tags: ['Bưởi Tân Triều', 'Vụ mùa Tết', 'Hữu cơ', 'Nhật ký vườn'],
    viewsCount: 850,
    createdAt: '2026-10-12T15:20:00.000Z',
    updatedAt: '2026-10-12T15:20:00.000Z',
    comments: []
  }
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const search = searchParams.get('search')?.toLowerCase();
  const tag = searchParams.get('tag');
  const sort = searchParams.get('sort') || 'newest';

  let list = [...serverPosts];

  if (type && type !== 'ALL') {
    list = list.filter(p => p.type === type);
  }

  if (search) {
    list = list.filter(p => p.title.toLowerCase().includes(search) || p.content.toLowerCase().includes(search));
  }

  if (tag) {
    list = list.filter(p => p.tags.includes(tag));
  }

  if (sort === 'popular') {
    list.sort((a, b) => b.likes - a.likes);
  } else if (sort === 'trending') {
    list.sort((a, b) => b.viewsCount - a.viewsCount);
  } else {
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return NextResponse.json({
    success: true,
    data: list,
    pagination: {
      total: list.length,
      page: 1,
      limit: 50
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, type = 'POST', tags = [], status = 'PUBLISHED' } = body;

    if (!title || !title.trim() || !content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: 'Tiêu đề và nội dung bài viết không được để trống.' },
        { status: 400 }
      );
    }

    const newPost: ForumPost = {
      id: `post-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      authorId: 'user-current',
      authorName: 'Thành viên Nông Nghiệp Đồng Nai',
      authorRole: 'MEMBER',
      likes: 0,
      commentsCount: 0,
      comments: [],
      isPinned: false,
      isLiked: false,
      isBookmarked: false,
      type,
      status,
      tags: Array.isArray(tags) ? tags : [],
      viewsCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    serverPosts.unshift(newPost);

    return NextResponse.json({
      success: true,
      message: 'Đăng bài viết thành công!',
      data: newPost
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi xử lý bài viết' },
      { status: 500 }
    );
  }
}
