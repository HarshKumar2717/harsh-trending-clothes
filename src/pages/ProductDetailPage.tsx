import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart, ShoppingCart, Truck, ShieldCheck, RefreshCw, ChevronRight,
  Minus, Plus, Star, Check, Banknote,
} from 'lucide-react';
import { fetchProductBySlug, fetchRelatedProducts, fetchReviews, addReview, fetchProductImages } from '../lib/api';
import type { ProductImage } from '../lib/types';
import type { Product, Review } from '../lib/types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ProductCard } from '../components/ProductCard';
import { Stars, FullPageLoader, EmptyState } from '../components/ui';
import { formatINR, discountedPercent } from '../lib/config';
import { cn } from '../lib/utils';

export function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { user } = useAuth();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [gallery, setGallery] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<'desc' | 'reviews'>('desc');
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setQty(1);
    setTab('desc');
    setActiveImage(0);
    setSelectedColor('');
    setSelectedSize('');
    (async () => {
      const p = await fetchProductBySlug(slug);
      setProduct(p);
      if (p) {
        const [r, rv, imgs] = await Promise.all([
          fetchRelatedProducts(p),
          fetchReviews(p.id),
          fetchProductImages(p.id),
        ]);
        setRelated(r);
        setReviews(rv);
        setGallery(imgs);
        if (p.colors.length > 0) setSelectedColor(p.colors[0]);
        if (p.sizes.length > 0) setSelectedSize(p.sizes[0]);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <FullPageLoader label="Loading product…" />;
  if (!product) {
    return (
      <div className="container-x py-20">
        <EmptyState title="Product not found" subtitle="The product you're looking for doesn't exist." action={<Link to="/shop" className="btn-dark">Back to Shop</Link>} />
      </div>
    );
  }

  const wished = has(product.id);
  const off = discountedPercent(product.price, product.mrp);
  const out = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= product.low_stock_threshold;

  const addToCart = async () => {
    if (!user) { toast('Please sign in to add to cart', 'info'); navigate('/login'); return; }
    try { await add(product, qty); toast(`${product.name} added to cart`); }
    catch (e: any) { toast(e.message || 'Could not add', 'error'); }
  };

  const buyNow = async () => {
    if (!user) { navigate('/login'); return; }
    try { await add(product, qty); navigate('/checkout'); }
    catch (e: any) { toast(e.message || 'Could not proceed', 'error'); }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast('Please sign in to review', 'info'); return; }
    setSubmitting(true);
    try {
      const rv = await addReview({ product_id: product.id, rating: newRating, title: newTitle, comment: newComment });
      setReviews((r) => [rv, ...r]);
      setNewTitle(''); setNewComment(''); setNewRating(5);
      toast('Review submitted!');
    } catch (e: any) { toast(e.message || 'Could not submit', 'error'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="container-x py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-ink-400">
        <Link to="/" className="hover:text-ink-800">Home</Link>
        <ChevronRight size={14} />
        <Link to="/shop" className="hover:text-ink-800">Shop</Link>
        {product.category && (
          <>
            <ChevronRight size={14} />
            <Link to={`/category/${product.category.slug}`} className="hover:text-ink-800">{product.category.name}</Link>
          </>
        )}
        <ChevronRight size={14} />
        <span className="text-ink-800">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Image */}
        <div className="animate-fade-in">
          <div className="relative overflow-hidden rounded-3xl bg-ink-50">
            <img
              src={gallery[activeImage]?.image_url || product.primary_image_url}
              alt={product.name}
              className="aspect-[3/4] w-full object-cover transition-opacity duration-300"
            />
            <div className="absolute left-4 top-4 flex flex-col gap-2">
              {off > 0 && <span className="chip bg-ink-900 text-gold-400">{off}% OFF</span>}
              {product.is_best_seller && <span className="chip bg-gold-400 text-ink-950">Bestseller</span>}
            </div>
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {gallery.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={cn('flex-shrink-0 overflow-hidden rounded-xl border-2 transition', activeImage === i ? 'border-gold-400' : 'border-transparent hover:border-ink-200')}
                >
                  <img src={img.image_url} alt="" className="h-20 w-16 object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="animate-fade-up">
          <p className="text-sm font-semibold uppercase tracking-wider text-gold-600">{product.brand}</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink-900 sm:text-4xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <Stars value={Number(product.rating)} size={18} />
            <span className="text-sm text-ink-500">{product.rating.toFixed(1)} ({product.rating_count} reviews)</span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-3xl font-bold text-ink-900">{formatINR(product.price)}</span>
            {product.mrp && product.mrp > product.price && (
              <>
                <span className="text-lg text-ink-400 line-through">{formatINR(product.mrp)}</span>
                <span className="chip-green">Save {formatINR(product.mrp - product.price)}</span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-ink-400">Inclusive of all taxes</p>

          {product.badges.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.badges.map((b) => <span key={b} className="chip-gold">{b}</span>)}
            </div>
          )}

          {/* Stock */}
          <div className="mt-5">
            {out ? (
              <span className="chip-red">Out of stock</span>
            ) : lowStock ? (
              <span className="chip bg-amber-100 text-amber-700">Hurry! Only {product.stock} left</span>
            ) : (
              <span className="chip-green"><Check size={14} /> In stock ({product.stock} available)</span>
            )}
          </div>

          {/* Colors */}
          {product.colors.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold text-ink-700">Color: <span className="text-ink-500">{selectedColor}</span></p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={cn(
                      'rounded-full border px-4 py-1.5 text-xs font-medium transition',
                      selectedColor === c ? 'border-gold-400 bg-gold-50 text-gold-700' : 'border-ink-200 text-ink-600 hover:border-ink-300'
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold text-ink-700">Size: <span className="text-ink-500">{selectedSize}</span></p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={cn(
                      'min-w-[44px] rounded-lg border px-3 py-2 text-sm font-medium transition',
                      selectedSize === s ? 'border-gold-400 bg-gold-500 text-white' : 'border-ink-200 text-ink-700 hover:border-gold-400 hover:text-gold-600'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mt-6 flex items-center gap-4">
            <span className="text-sm font-semibold text-ink-700">Quantity</span>
            <div className="flex items-center rounded-full border border-ink-200">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-10 w-10 place-items-center text-ink-700 hover:text-gold-600" disabled={out}>
                <Minus size={16} />
              </button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="grid h-10 w-10 place-items-center text-ink-700 hover:text-gold-600" disabled={out}>
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={addToCart} disabled={out} className="btn-dark flex-1">
              <ShoppingCart size={18} /> Add to Cart
            </button>
            <button onClick={buyNow} disabled={out} className="btn-gold flex-1">
              Buy Now
            </button>
            <button
              onClick={() => { if (!user) { toast('Sign in to use wishlist', 'info'); return; } toggle(product).then(() => toast(wished ? 'Removed' : 'Saved to wishlist')); }}
              className={cn('grid h-12 w-12 place-items-center rounded-full border transition', wished ? 'border-red-200 text-red-500' : 'border-ink-200 text-ink-600 hover:border-gold-400')}
            >
              <Heart size={20} className={wished ? 'fill-red-500' : ''} />
            </button>
          </div>

          {/* COD + Delivery info */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-ink-500">
            {product.cod_available ? (
              <span className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 font-medium text-emerald-700">
                <Banknote size={14} /> COD Available
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 font-medium text-red-600">
                <Banknote size={14} /> COD Not Available
              </span>
            )}
            <span className="text-ink-400">Free delivery over Rs 1499</span>
          </div>

          {/* Assurances */}
          <div className="mt-8 grid grid-cols-3 gap-3 rounded-2xl border border-ink-100 bg-ink-50/50 p-4">
            {[
              { Icon: Truck, t: 'Free Delivery', s: 'Over ₹1499' },
              { Icon: RefreshCw, t: '7-Day Returns', s: 'Easy returns' },
              { Icon: ShieldCheck, t: 'Authentic', s: 'Genuine product' },
            ].map((f) => (
              <div key={f.t} className="flex flex-col items-center text-center">
                <f.Icon size={20} className="text-gold-600" />
                <p className="mt-1.5 text-xs font-semibold text-ink-800">{f.t}</p>
                <p className="text-[10px] text-ink-500">{f.s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-14">
        <div className="flex gap-6 border-b border-ink-100">
          {(['desc', 'reviews'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'relative pb-3 text-sm font-semibold transition',
                tab === t ? 'text-gold-600' : 'text-ink-400 hover:text-ink-700'
              )}
            >
              {t === 'desc' ? 'Description' : `Reviews (${reviews.length})`}
              {tab === t && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-gold-400" />}
            </button>
          ))}
        </div>

        <div className="py-6">
          {tab === 'desc' ? (
            <div className="max-w-3xl">
              <p className="leading-relaxed text-ink-600">{product.description}</p>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
              {/* Review list */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <EmptyState icon={<Star size={32} />} title="No reviews yet" subtitle="Be the first to review this product." />
                ) : (
                  reviews.map((r) => (
                    <div key={r.id} className="rounded-2xl border border-ink-100 p-5">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-ink-900 font-bold text-gold-400">
                          {(r.profile?.full_name?.[0] || 'U').toUpperCase()}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-ink-900">{r.profile?.full_name || 'Anonymous'}</p>
                          <Stars value={r.rating} />
                        </div>
                        <span className="ml-auto text-xs text-ink-400">{new Date(r.created_at).toLocaleDateString('en-IN')}</span>
                      </div>
                      {r.title && <h4 className="mt-3 font-semibold text-ink-800">{r.title}</h4>}
                      {r.comment && <p className="mt-1 text-sm text-ink-600">{r.comment}</p>}
                    </div>
                  ))
                )}
              </div>

              {/* Review form */}
              <div className="rounded-2xl border border-ink-100 p-5">
                <h3 className="font-display text-lg font-bold text-ink-900">Write a Review</h3>
                {user ? (
                  <form onSubmit={submitReview} className="mt-4 space-y-4">
                    <div>
                      <label className="label">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <button type="button" key={i} onClick={() => setNewRating(i)}>
                            <Star size={26} className={i <= newRating ? 'fill-gold-400 text-gold-400' : 'text-ink-200'} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="label">Title</label>
                      <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="input" placeholder="Summarize your review" />
                    </div>
                    <div>
                      <label className="label">Comment</label>
                      <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} rows={3} className="input" placeholder="Share your experience…" />
                    </div>
                    <button disabled={submitting} className="btn-gold w-full">{submitting ? 'Submitting…' : 'Submit Review'}</button>
                  </form>
                ) : (
                  <p className="mt-3 text-sm text-ink-500">
                    <Link to="/login" className="font-semibold text-gold-600">Sign in</Link> to write a review.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="section-title mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </div>
      )}
    </div>
  );
}
