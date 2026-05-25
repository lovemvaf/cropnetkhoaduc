// Định nghĩa các Entity dùng chung cho toàn hệ thống
export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: 'ADMIN' | 'CUSTOMER' | 'FARMER' | 'LOGISTICS';
  status: 'ACTIVE' | 'BANNED';
  createdAt: string;
}

export interface Supplier {
  id: string;
  userId: string;
  farmName: string;
  address: string;
  latitude?: number;
  longitude?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  supplierId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  stock: number;
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  createdAt: string;
  images?: string[];
  supplier?: {
    farmName: string;
    address: string;
  };
  category?: {
    name: string;
  };
}

export interface TraceBatch {
  id: string;
  productId: string;
  batchCode: string;
  harvestDate: string;
  farmingArea: string;
  farmingProcess?: string;
  qrCodeUrl?: string;
  createdAt: string;
  certifications?: Certification[];
  product?: Product;
}

export interface Certification {
  id: string;
  batchId: string;
  name: string;
  issuer: string;
  validUntil: string;
  imageUrl: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  unit: string;
  batchId?: string;
}

export interface Order {
  id: string;
  customerId: string;
  totalAmount: number;
  shippingAddress: string;
  receiverName: string;
  receiverPhone: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  orderItems: OrderItem[];
  payment?: {
    paymentMethod: 'COD' | 'MOMO' | 'BANK_TRANSFER';
    paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  };
}
