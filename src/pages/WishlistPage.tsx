import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { EmptyState } from '../components/ui';
import { formatINR } from '../lib/config';

export function WishlistPage() {
  const { items, remove } = useWishlist();
  const { add } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  if (!user) {
    return (
      <div className="container-x py-20">
        <EmptyState icon={<Heart size={48} />} title="Sign in to view your wishlist"
          action={<Link to="/login" className="btn-gold">Sign In</Link>} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-x py-20">
        <EmptyState icon={<Heart size={48} />} title="Your wishlist is empty"
          subtitle="Save items you love to find them here later."
          action={<Link to="/shop" className="btn-gold">Discover Products <ArrowRight size={16} /></Link>} />
      </div>
    );
  }

  const moveToCart = async (productId: string) => {
    const item = items.find((i) => i.product_id === productId);
    if (!item?.product) return;
    try { await add(item.product, 1); await remove(productId); toast('Moved to cart'); }
    catch (e: any) { toast(e.message || 'Failed', 'error'); }
  };

  return (
    <div className="container-x py-8">
      <h1 className="mb-6 font-display text-3xl font-bold text-ink-900">My Wishlist</h1>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((w) => (
          <div key={w.id} className="group flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
            <Link to={`/product/${w.product?.slug}`} className="relative aspect-[3/4] overflow-hidden bg-ink-50">
              <img src={w.product?.primary_image_url} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
            </Link>
            <div className="flex flex-1 flex-col p-4">
              <p className="text-[11px] font-semibold uppercase text-gold-600">{w.product?.brand}</p>
              <Link to={`/product/${w.product?.slug}`} className="line-clamp-1 font-medium text-ink-800 hover:text-gold-600">{w.product?.name}</Link>
              <p className="mt-1 font-display text-lg font-bold text-ink-900">{formatINR(w.product?.price ?? 0)}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => moveToCart(w.product_id)} className="btn-dark flex-1 py-2 text-xs">
                  <ShoppingCart size={14} /> Add
                </button>
                <button onClick={() => remove(w.product_id)} className="grid h-9 w-9 place-items-center rounded-full border border-ink-200 text-ink-400 hover:border-red-300 hover:text-red-500">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
