import { supabase } from './supabase';
import type { Category, Product, Review, Banner, Coupon } from './types';

// ---------- Categories ----------
export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

// ---------- Banners ----------
export async function fetchBanners(): Promise<Banner[]> {
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('is_active', true)
    .order('position');
  if (error) throw error;
  return data ?? [];
}

// ---------- Products ----------
export interface ProductQuery {
  category?: string; // slug
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: 'popular' | 'price_low' | 'price_high' | 'newest' | 'rating';
  limit?: number;
  featured?: boolean;
  trending?: boolean;
  bestSeller?: boolean;
  isNew?: boolean;
}

export async function fetchProducts(q: ProductQuery = {}): Promise<Product[]> {
  let query = supabase.from('products').select('*, category:categories(*)');
  if (q.category) {
    query = query.eq('category.slug', q.category);
  }
  if (q.search) {
    query = query.or(`name.ilike.%${q.search}%,description.ilike.%${q.search}%,brand.ilike.%${q.search}%`);
  }
  if (typeof q.minPrice === 'number') query = query.gte('price', q.minPrice);
  if (typeof q.maxPrice === 'number') query = query.lte('price', q.maxPrice);
  if (typeof q.minRating === 'number') query = query.gte('rating', q.minRating);
  if (q.featured) query = query.eq('is_featured', true);
  if (q.trending) query = query.eq('is_trending', true);
  if (q.bestSeller) query = query.eq('is_best_seller', true);
  if (q.isNew) query = query.eq('is_new', true);

  switch (q.sort) {
    case 'price_low': query = query.order('price', { ascending: true }); break;
    case 'price_high': query = query.order('price', { ascending: false }); break;
    case 'rating': query = query.order('rating', { ascending: false }); break;
    case 'newest': query = query.order('created_at', { ascending: false }); break;
    default: query = query.order('rating_count', { ascending: false });
  }
  if (q.limit) query = query.limit(q.limit);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .neq('id', product.id)
    .eq('category_id', product.category_id)
    .order('rating', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

// ---------- Reviews ----------
export async function fetchReviews(productId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profile:profiles(full_name, avatar_url)')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addReview(input: {
  product_id: string;
  rating: number;
  title?: string;
  comment?: string;
}): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .insert(input)
    .select('*, profile:profiles(full_name, avatar_url)')
    .single();
  if (error) throw error;
  return data;
}

// ---------- Coupons ----------
export async function fetchCoupon(code: string): Promise<Coupon | null> {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .maybeSingle();
  if (error) throw error;
  return data;
}
