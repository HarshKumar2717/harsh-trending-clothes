import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { CartItem, Product } from '../lib/types';
import { DELIVERY_FLAT, FREE_DELIVERY_THRESHOLD, GST_RATE } from '../lib/config';

interface CartContextValue {
  items: CartItem[];
  loading: boolean;
  count: number;
  subtotal: number;
  gst: number;
  deliveryCharge: number;
  total: number;
  add: (product: Product, qty?: number) => Promise<void>;
  setQty: (productId: string, qty: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setItems([]); setLoading(false); return; }
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, product:products(*, category:categories(*))')
      .eq('user_id', user.id);
    if (!error && data) setItems(data as unknown as CartItem[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const add = async (product: Product, qty = 1) => {
    if (!user) throw new Error('Please sign in to add items to your cart');
    const { error } = await supabase
      .from('cart_items')
      .upsert(
        { user_id: user.id, product_id: product.id, quantity: qty },
        { onConflict: 'user_id,product_id' }
      );
    if (error) throw error;
    await load();
  };

  const setQty = async (productId: string, qty: number) => {
    if (!user) return;
    if (qty <= 0) { await remove(productId); return; }
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: qty })
      .eq('user_id', user.id)
      .eq('product_id', productId);
    if (error) throw error;
    await load();
  };

  const remove = async (productId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);
    if (error) throw error;
    await load();
  };

  const clear = async () => {
    if (!user) return;
    await supabase.from('cart_items').delete().eq('user_id', user.id);
    await load();
  };

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + (i.product?.price ?? 0) * i.quantity, 0);
  const gst = Math.round(subtotal * GST_RATE);
  const deliveryCharge = subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FLAT;
  const total = subtotal + gst + deliveryCharge;

  return (
    <CartContext.Provider value={{
      items, loading, count, subtotal, gst, deliveryCharge, total,
      add, setQty, remove, clear, refresh: load,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
