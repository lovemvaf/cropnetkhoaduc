import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phone?: string;
  role: 'CUSTOMER' | 'FARMER' | 'ADMIN' | 'LOGISTICS' | 'INSPECTOR';
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  farmName?: string | null;
  address?: string | null;
  isEmailVerified: boolean;
  verificationToken?: string | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ForumCommentRecord {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  status: 'PUBLISHED' | 'HIDDEN';
  createdAt: string;
  parentId?: string | null;
  replies?: any[];
}

export interface ForumPostRecord {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  likes: number;
  commentsCount: number;
  comments: ForumCommentRecord[];
  isPinned: boolean;
  isLiked?: boolean;
  isBookmarked?: boolean;
  type: string;
  status: 'PUBLISHED' | 'DRAFT' | 'HIDDEN';
  tags: string[];
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemRecord {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  total: number;
  unit: string;
}

export interface OrderRecord {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderItemRecord[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
  paymentMethod: string;
  paymentStatus: 'UNPAID' | 'PAID';
  createdAt: string;
  updatedAt: string;
}

interface DatabaseState {
  users: UserRecord[];
  forumPosts: ForumPostRecord[];
  orders: OrderRecord[];
  likes: { postId: string; userId: string }[];
  bookmarks: { postId: string; userId: string }[];
}

const STORAGE_FILE = path.join(process.cwd(), '.cropnet_store.json');
const TMP_STORAGE_FILE = '/tmp/cropnet_store.json';

// In-memory persistent cache
let state: DatabaseState | null = null;

function getStoreFilePath(): string {
  // Try local directory first, or /tmp in serverless environments
  try {
    fs.accessSync(process.cwd(), fs.constants.W_OK);
    return STORAGE_FILE;
  } catch {
    return TMP_STORAGE_FILE;
  }
}

function loadFromDisk(): DatabaseState | null {
  const filePath = getStoreFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('Could not read store file from disk:', err);
  }
  return null;
}

function saveToDisk(data: DatabaseState): void {
  const filePath = getStoreFilePath();
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.warn('Could not write store file to disk:', err);
  }
}

// Initial seed users with strong bcrypt hashes (min 10 rounds)
function generateInitialState(): DatabaseState {
  // Pre-hashed passwords for test accounts: 'MatKhauBaoMat2026@'
  const salt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync('AdminDongNai2026!@#', salt);
  const farmerHash = bcrypt.hashSync('FarmerDongNai2026!@#', salt);
  const customerHash = bcrypt.hashSync('Customer2026!@#', salt);

  const initialUsers: UserRecord[] = [
    {
      id: 'usr-admin-01',
      email: 'admin@cropnet.vn',
      passwordHash: adminHash,
      fullName: 'Ban Quản Trị CropNet Đồng Nai',
      phone: '0901234567',
      role: 'ADMIN',
      status: 'ACTIVE',
      isEmailVerified: true,
      verificationToken: null,
      createdAt: '2026-10-01T00:00:00.000Z',
      updatedAt: '2026-10-01T00:00:00.000Z'
    },
    {
      id: 'usr-farmer-tantrieu',
      email: 'tantrieu@cropnet.vn',
      passwordHash: farmerHash,
      fullName: 'HTX Nông Nghiệp Dịch Vụ Tân Triều',
      phone: '02513851234',
      role: 'FARMER',
      status: 'ACTIVE',
      farmName: 'HTX Nông Nghiệp Dịch Vụ Tân Triều',
      address: 'Xã Tân Bình, Vĩnh Cửu, Thành phố Đồng Nai',
      isEmailVerified: true,
      verificationToken: null,
      createdAt: '2026-10-01T00:00:00.000Z',
      updatedAt: '2026-10-01T00:00:00.000Z'
    },
    {
      id: 'usr-farmer-xuanlap',
      email: 'xuanlap@cropnet.vn',
      passwordHash: farmerHash,
      fullName: 'HTX Nông nghiệp Xuân Lập Long Khánh',
      phone: '02513875678',
      role: 'FARMER',
      status: 'ACTIVE',
      farmName: 'HTX Nông nghiệp - Thương mại - Dịch vụ Xuân Lập',
      address: 'Phường Xuân Lập, TP Long Khánh, Thành phố Đồng Nai',
      isEmailVerified: true,
      verificationToken: null,
      createdAt: '2026-10-02T00:00:00.000Z',
      updatedAt: '2026-10-02T00:00:00.000Z'
    },
    {
      id: 'usr-customer-01',
      email: 'khachhang@gmail.com',
      passwordHash: customerHash,
      fullName: 'Nguyễn Thị Bích Ngọc (Biên Hòa)',
      phone: '0918765432',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      isEmailVerified: true,
      verificationToken: null,
      createdAt: '2026-10-03T00:00:00.000Z',
      updatedAt: '2026-10-03T00:00:00.000Z'
    }
  ];

  const initialForumPosts: ForumPostRecord[] = [
    {
      id: 'post-1',
      title: 'Quy trình kiểm soát an toàn bưởi đường lá cam Cù lao Tân Triều',
      content: 'HTX Tân Triều áp dụng tem QR số hóa cho diện tích bưởi đường lá cam cù lao Tân Triều niên vụ 2026. Từng liếp bưởi đều ghi nhận nhật ký tưới nước phù sa sông Đồng Nai, ủ phân hữu cơ vi sinh và kiểm nghiệm dư lượng bảo vệ thực vật theo quy chuẩn VietGAP trước khi xuất vườn giao người tiêu dùng.',
      authorId: 'usr-farmer-tantrieu',
      authorName: 'HTX Nông Nghiệp Dịch Vụ Tân Triều',
      authorRole: 'FARMER',
      likes: 48,
      commentsCount: 1,
      isPinned: true,
      type: 'ANNOUNCEMENT',
      status: 'PUBLISHED',
      tags: ['Đồng Nai AI', 'Bưởi Tân Triều', 'VietGAP', 'OCOP 4 Sao'],
      viewsCount: 840,
      createdAt: '2026-10-05T08:00:00.000Z',
      updatedAt: '2026-10-05T08:00:00.000Z',
      comments: [
        {
          id: 'comment-1',
          postId: 'post-1',
          authorId: 'usr-customer-01',
          authorName: 'Nguyễn Thị Bích Ngọc (Biên Hòa)',
          content: 'Người tiêu dùng Biên Hòa rất tin tưởng bưởi đường lá cam Tân Triều khi có tem truy xuất rõ ràng từng quả!',
          status: 'PUBLISHED',
          createdAt: '2026-10-05T12:00:00.000Z'
        }
      ]
    },
    {
      id: 'post-2',
      title: 'Kinh nghiệm neo cuống chín cây tự nhiên cho sầu riêng Ri6 đất đỏ Long Khánh',
      content: 'Nhà vườn HTX Xuân Lập chia sẻ kinh nghiệm canh tác sầu riêng Ri6 trên đất bazan: cam kết không cắt trái non và 100% không nhúng thuốc kích chín ép. Cuống trái được neo bằng dây bảo hộ, chờ già chín rụng tự nhiên mới thu hái và đóng gói.',
      authorId: 'usr-farmer-xuanlap',
      authorName: 'HTX Nông nghiệp Xuân Lập Long Khánh',
      authorRole: 'FARMER',
      likes: 36,
      commentsCount: 0,
      isPinned: false,
      type: 'FARM_STORY',
      status: 'PUBLISHED',
      tags: ['Sầu riêng Long Khánh', 'Chín tự nhiên', 'VietGAP'],
      viewsCount: 520,
      createdAt: '2026-10-08T09:30:00.000Z',
      updatedAt: '2026-10-08T09:30:00.000Z',
      comments: []
    }
  ];

  return {
    users: initialUsers,
    forumPosts: initialForumPosts,
    orders: [],
    likes: [],
    bookmarks: []
  };
}

function getState(): DatabaseState {
  if (!state) {
    const loaded = loadFromDisk();
    if (loaded && Array.isArray(loaded.users) && loaded.users.length > 0) {
      state = loaded;
    } else {
      state = generateInitialState();
      saveToDisk(state);
    }
  }
  return state;
}

export const db = {
  // User operations
  findUserByEmail(email: string): UserRecord | null {
    const s = getState();
    const normalized = email.toLowerCase().trim();
    return s.users.find(u => u.email.toLowerCase() === normalized) || null;
  },

  findUserById(id: string): UserRecord | null {
    const s = getState();
    return s.users.find(u => u.id === id) || null;
  },

  findUserByVerificationToken(token: string): UserRecord | null {
    const s = getState();
    return s.users.find(u => u.verificationToken === token) || null;
  },

  findUserByResetToken(token: string): UserRecord | null {
    const s = getState();
    return s.users.find(u => {
      if (u.resetPasswordToken !== token) return false;
      if (!u.resetPasswordExpires) return false;
      return new Date(u.resetPasswordExpires) > new Date();
    }) || null;
  },

  createUser(user: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt'>): UserRecord {
    const s = getState();
    const newUser: UserRecord = {
      ...user,
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    s.users.push(newUser);
    saveToDisk(s);
    return newUser;
  },

  updateUser(id: string, updates: Partial<UserRecord>): UserRecord | null {
    const s = getState();
    const idx = s.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    s.users[idx] = {
      ...s.users[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveToDisk(s);
    return s.users[idx];
  },

  // Forum operations
  getForumPosts(type?: string, search?: string, tag?: string, sort: string = 'newest'): ForumPostRecord[] {
    const s = getState();
    let list = [...s.forumPosts];

    if (type && type !== 'ALL') {
      list = list.filter(p => p.type === type);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
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

    return list;
  },

  getForumPostById(id: string): ForumPostRecord | null {
    const s = getState();
    return s.forumPosts.find(p => p.id === id) || null;
  },

  createForumPost(post: Omit<ForumPostRecord, 'id' | 'likes' | 'commentsCount' | 'comments' | 'viewsCount' | 'createdAt' | 'updatedAt'>): ForumPostRecord {
    const s = getState();
    const newPost: ForumPostRecord = {
      ...post,
      id: `post-${Date.now()}`,
      likes: 0,
      commentsCount: 0,
      comments: [],
      viewsCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    s.forumPosts.unshift(newPost);
    saveToDisk(s);
    return newPost;
  },

  toggleLikePost(postId: string, userId: string): { likes: number; isLiked: boolean } {
    const s = getState();
    const post = s.forumPosts.find(p => p.id === postId);
    if (!post) throw new Error('Post not found');

    const likeIdx = s.likes.findIndex(l => l.postId === postId && l.userId === userId);
    let isLiked = false;
    if (likeIdx > -1) {
      s.likes.splice(likeIdx, 1);
      post.likes = Math.max(0, post.likes - 1);
      isLiked = false;
    } else {
      s.likes.push({ postId, userId });
      post.likes += 1;
      isLiked = true;
    }
    saveToDisk(s);
    return { likes: post.likes, isLiked };
  },

  addComment(postId: string, comment: Omit<ForumCommentRecord, 'id' | 'createdAt'>): ForumCommentRecord {
    const s = getState();
    const post = s.forumPosts.find(p => p.id === postId);
    if (!post) throw new Error('Post not found');

    const newComment: ForumCommentRecord = {
      ...comment,
      id: `comment-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    post.comments.push(newComment);
    post.commentsCount = post.comments.length;
    saveToDisk(s);
    return newComment;
  },

  // Order operations
  createOrder(order: Omit<OrderRecord, 'id' | 'createdAt' | 'updatedAt'>): OrderRecord {
    const s = getState();
    const newOrder: OrderRecord = {
      ...order,
      id: `ORD-DN-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    s.orders.unshift(newOrder);
    saveToDisk(s);
    return newOrder;
  },

  getOrdersByUser(userId: string): OrderRecord[] {
    const s = getState();
    return s.orders.filter(o => o.customerId === userId);
  },

  getOrderById(id: string): OrderRecord | null {
    const s = getState();
    return s.orders.find(o => o.id === id) || null;
  }
};
