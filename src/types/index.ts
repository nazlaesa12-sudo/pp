export type ProductCategory = 'Pembersih & Toner' | 'Serum & Treatment' | 'Moisturizer & Sunscreen';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice: number;
  stock: number;
  rating: number;
  soldCount: number;
  description: string;
  ingredients: string;
  howToUse: string;
  imageUrl: string;
  badge?: string;
  volume: string;
  benefits?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | 'Menunggu Pembayaran'
  | 'Menunggu Verifikasi'
  | 'Diproses'
  | 'Dikirim'
  | 'Selesai'
  | 'Dibatalkan';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  category: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  city: string;
  notes?: string;
  items: OrderItem[];
  totalItems: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  paymentMethod: string;
  status: OrderStatus;
  paymentProofUrl?: string;
  paymentSenderBank?: string;
  paymentSenderName?: string;
  paymentProofUploadedAt?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  createdAt: string;
}

export interface AdminUser {
  email: string;
  name: string;
  role: 'superadmin' | 'staff';
}
