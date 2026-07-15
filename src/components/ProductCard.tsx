import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import type { Product } from '../lib/types';
import { formatINR, discountedPercent } from '../lib/config';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Stars } from './ui';
import { cn } from '../lib/utils';

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { user } = useAuth();
  const { toast } = useToast();
  const wished = has(product.id);
  const off = discountedPercent(product.price, product.mrp);
  const lowStock = product.stock > 0 && product.stock <= product.low_stock_threshold;
  const out = product.stock === 0;

  const onAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { toast('Please sign in to add to cart', 'info'); return; }
    try {
      await add(product, 1);
      toast(`${product.name} added to cart`);
    } catch (err: any) {
      toast(err.message || 'Could not add to cart', 'error');
    }
  };

  const onWish = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { toast('Please sign in to use wishlist', 'info'); return; }
    try {
      await toggle(product);
      toast(wished ? 'Removed from wishlist' : 'Saved to wishlist');
    } catch (err: any) {
      toast(err.message || 'Could not update wishlist', 'error');
    }
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group relative flex animate-fade-up flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-gold"
      style={{ animationDelay: `${Math.min(index * 60, 400)}ms` }}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-ink-50">
        <img
          src={product.primary_image_url}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {off > 0 && <span className="chip bg-ink-900 text-gold-400">{off}% OFF</span>}
          {product.is_new && <span className="chip bg-gold-400 text-ink-950">NEW</span>}
          {product.is_best_seller && <span className="chip bg-white text-ink-900 shadow">Bestseller</span>}
          {out && <span className="chip bg-red-600 text-white">Out of stock</span>}
          {lowStock && <span className="chip bg-amber-500 text-white">Only {product.stock} left</span>}
        </div>

        <button
          onClick={onWish}
          aria-label="Toggle wishlist"
          className={cn(
            'absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow backdrop-blur transition hover:scale-110',
            wished ? 'text-red-500' : 'text-ink-400'
          )}
        >
          <Heart size={18} className={wished ? 'fill-red-500' : ''} />
        </button>

        {/* Quick add overlay */}
        <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center gap-2 bg-gradient-to-t from-ink-950/80 to-transparent p-3 transition-transform duration-500 group-hover:translate-y-0">
          <button onClick={onAdd} disabled={out} className="btn-gold flex-1 py-2 text-xs">
            <ShoppingCart size={15} /> Add to Cart
          </button>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink-800">
            <Eye size={16} />
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gold-600">{product.brand}</p>
        <h3 className="line-clamp-1 font-medium text-ink-800">{product.name}</h3>
        <Stars value={Number(product.rating)} />
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-display text-lg font-bold text-ink-900">{formatINR(product.price)}</span>
          {product.mrp && product.mrp > product.price && (
            <span className="text-xs text-ink-400 line-through">{formatINR(product.mrp)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
