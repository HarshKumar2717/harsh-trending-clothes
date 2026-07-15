import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { EmptyState } from '../components/ui';
import { formatINR, GST_RATE, FREE_DELIVERY_THRESHOLD } from '../lib/config';
import { useState } from 'react';
import { fetchCoupon } from '../lib/api';
import type { Coupon } from '../lib/types';

export function CartPage() {
  const { items, setQty, remove, subtotal, gst, deliveryCharge, total, loading } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);

  const discount = coupon ? computeDiscount(coupon, subtotal) : 0;
  const grandTotal = Math.max(0, total - discount);

  const applyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponBusy(true);
    try {
      const c = await fetchCoupon(couponCode.trim());
      if (!c) { toast('Invalid coupon code', 'error'); setCoupon(null); }
      else if (subtotal < c.min_order) { toast(`Minimum order ${formatINR(c.min_order)} required`, 'error'); setCoupon(null); }
      else { setCoupon(c); toast('Coupon applied!'); }
    } catch { toast('Could not apply coupon', 'error'); }
    finally { setCouponBusy(false); }
  };

  const proceed = () => {
    if (!user) { navigate('/login?redirect=/checkout'); return; }
    if (coupon) sessionStorage.setItem('applied_coupon', JSON.stringify(coupon));
    navigate('/checkout');
  };

  if (loading) return <div className="container-x py-20"><div className="skeleton h-96 w-full rounded-2xl" /></div>;

  if (items.length === 0) {
    return (
      <div className="container-x py-20">
        <EmptyState
          icon={<ShoppingBag size={48} />}
          title="Your cart is empty"
          subtitle="Looks like you haven't added anything yet. Let's fix that!"
          action={<Link to="/shop" className="btn-gold">Start Shopping <ArrowRight size={16} /></Link>}
        />
      </div>
    );
  }

  return (
    <div className="container-x py-8">
      <h1 className="mb-6 font-display text-3xl font-bold text-ink-900">Shopping Cart</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 rounded-2xl border border-ink-100 p-4">
              <Link to={`/product/${item.product?.slug}`} className="shrink-0">
                <img src={item.product?.primary_image_url} alt="" className="h-28 w-24 rounded-xl object-cover" />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase text-gold-600">{item.product?.brand}</p>
                    <Link to={`/product/${item.product?.slug}`} className="font-medium text-ink-900 hover:text-gold-600">{item.product?.name}</Link>
                  </div>
                  <button onClick={() => remove(item.product_id)} className="text-ink-400 hover:text-red-500"><Trash2 size={18} /></button>
                </div>
                <p className="text-sm text-ink-500">{item.product?.category?.name}</p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center rounded-full border border-ink-200">
                    <button onClick={() => setQty(item.product_id, item.quantity - 1)} className="grid h-8 w-8 place-items-center"><Minus size={14} /></button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => setQty(item.product_id, item.quantity + 1)} className="grid h-8 w-8 place-items-center"><Plus size={14} /></button>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg font-bold text-ink-900">{formatINR((item.product?.price ?? 0) * item.quantity)}</p>
                    <p className="text-xs text-ink-400">{formatINR(item.product?.price ?? 0)} each</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Link to="/shop" className="inline-flex items-center gap-1 text-sm font-semibold text-gold-600 hover:underline">← Continue shopping</Link>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-ink-100 bg-ink-50/50 p-6">
            <h2 className="font-display text-lg font-bold text-ink-900">Order Summary</h2>

            {/* Coupon */}
            <form onSubmit={applyCoupon} className="mt-4">
              <label className="label">Have a coupon?</label>
              {coupon ? (
                <div className="flex items-center justify-between rounded-xl border border-gold-300 bg-gold-50 px-3 py-2">
                  <span className="flex items-center gap-2 text-sm font-semibold text-gold-700"><Tag size={14} /> {coupon.code}</span>
                  <button type="button" onClick={() => setCoupon(null)} className="text-gold-700"><X size={16} /></button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Enter code" className="input py-2" />
                  <button type="submit" disabled={couponBusy} className="btn-dark px-4 py-2 text-xs">{couponBusy ? '…' : 'Apply'}</button>
                </div>
              )}
              <p className="mt-2 text-xs text-ink-400">Try WELCOME10, FLAT200, GOLD500</p>
            </form>

            <div className="mt-5 space-y-2.5 border-t border-ink-200 pt-4 text-sm">
              <Row label="Subtotal" value={formatINR(subtotal)} />
              {discount > 0 && <Row label="Discount" value={`- ${formatINR(discount)}`} green />}
              <Row label={`GST (${Math.round(GST_RATE * 100)}%)`} value={formatINR(gst)} />
              <Row label="Delivery" value={deliveryCharge === 0 ? 'FREE' : formatINR(deliveryCharge)} green={deliveryCharge === 0} />
              {subtotal < FREE_DELIVERY_THRESHOLD && (
                <p className="rounded-lg bg-gold-50 px-3 py-2 text-xs text-gold-700">
                  Add {formatINR(FREE_DELIVERY_THRESHOLD - subtotal)} more for FREE delivery!
                </p>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-ink-200 pt-4">
              <span className="font-semibold text-ink-900">Grand Total</span>
              <span className="font-display text-2xl font-bold text-ink-900">{formatINR(grandTotal)}</span>
            </div>

            <button onClick={proceed} className="btn-gold mt-5 w-full">
              Proceed to Checkout <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-500">{label}</span>
      <span className={green ? 'font-semibold text-emerald-600' : 'font-medium text-ink-800'}>{value}</span>
    </div>
  );
}

function computeDiscount(coupon: Coupon, subtotal: number): number {
  if (subtotal < coupon.min_order) return 0;
  let d = coupon.discount_type === 'percent'
    ? Math.round((subtotal * coupon.discount_value) / 100)
    : coupon.discount_value;
  if (coupon.max_discount > 0) d = Math.min(d, coupon.max_discount);
  return d;
}
