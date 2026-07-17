export type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export interface Profile {
  id: string;
  email: string;
  role: Role;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  default_address_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  mrp: number | null;
  stock: number;
  low_stock_threshold: number;
  category_id: string | null;
  brand: string | null;
  rating: number;
  rating_count: number;
  badges: string[];
  is_featured: boolean;
  is_trending: boolean;
  is_best_seller: boolean;
  is_new: boolean;
  primary_image_url: string;
  created_at: string;
  updated_at: string;
  // joined
  category?: Category | null;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  position: number;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
  // joined
  profile?: Pick<Profile, 'full_name' | 'avatar_url'> | null;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product?: Product;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
}

export type OrderStatus =
  | 'pending' | 'confirmed' | 'processing' | 'shipped'
  | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';

export type PaymentMethod = 'cod';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  name: string;
  image_url: string | null;
  price: number;
  quantity: number;
  category_name: string | null;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  txn_id: string | null;
  subtotal: number;
  discount: number;
  gst: number;
  delivery_charge: number;
  grand_total: number;
  coupon_code: string | null;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'flat' | 'percent';
  discount_value: number;
  min_order: number;
  max_discount: number;
  usage_limit: number;
  used_count: number;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
  created_at: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  cta_text: string | null;
  cta_link: string | null;
  position: number;
  is_active: boolean;
  created_at: string;
}
