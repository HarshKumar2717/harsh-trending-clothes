import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { WishlistItem, Product } from '../lib/types';

interface WishlistContextValue {
  items: WishlistItem[];
  ids: Set<string>;
  loading: boolean;
  has: (productId: string) => boolean;
  toggle: (product: Product) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setItems([]); setLoading(false); return; }
    const { data, error } = await supabase
      .from('wishlist_items')
      .select('*, product:products(*, category:categories(*))')
      .eq('user_id', user.id);
    if (!error && data) setItems(data as unknown as WishlistItem[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const ids = new Set(items.map((i) => i.product_id));

  const has = (productId: string) => ids.has(productId);

  const toggle = async (product: Product) => {
    if (!user) throw new Error('Please sign in to save items to your wishlist');
    if (ids.has(product.id)) {
      await supabase.from('wishlist_items').delete().eq('user_id', user.id).eq('product_id', product.id);
    } else {
      await supabase.from('wishlist_items').insert({ user_id: user.id, product_id: product.id });
    }
    await load();
  };

  const remove = async (productId: string) => {
    if (!user) return;
    await supabase.from('wishlist_items').delete().eq('user_id', user.id).eq('product_id', productId);
    await load();
  };

  return (
    <WishlistContext.Provider value={{ items, ids, loading, has, toggle, remove, refresh: load }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
