import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, CreditCard, Banknote, Smartphone, Wallet } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import type { Address, PaymentMethod } from '../lib/types';
import { formatINR, GST_RATE } from '../lib/config';
import { EmptyState } from '../components/ui';
import { cn } from '../lib/utils';
import type { Coupon } from '../lib/types';

const PAYMENTS: { v: PaymentMethod; label: string; Icon: any; desc: string }[] = [
  { v: 'upi', label: 'UPI', Icon: Smartphone, desc: 'Pay via any UPI app' },
  { v: 'credit_card', label: 'Credit Card', Icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
  { v: 'debit_card', label: 'Debit Card', Icon: Wallet, desc: 'All major debit cards' },
  { v: 'cod', label: 'Cash on Delivery', Icon: Banknote, desc: 'Pay when you receive' },
];

export function CheckoutPage() {
  const { items, subtotal, gst, deliveryCharge, total, clear } = useCart();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddr, setSelectedAddr] = useState<string>('');
  const [payment, setPayment] = useState<PaymentMethod>('cod');
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrForm, setAddrForm] = useState({ label: 'Home', full_name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' });

  const coupon: Coupon | null = (() => {
    const raw = sessionStorage.getItem('applied_coupon');
    return raw ? JSON.parse(raw) : null;
  })();
  const discount = coupon && subtotal >= coupon.min_order
    ? Math.min(coupon.discount_type === 'percent' ? Math.round((subtotal * coupon.discount_value) / 100) : coupon.discount_value, coupon.max_discount || Infinity)
    : 0;
  const grandTotal = Math.max(0, total - discount);

  useEffect(() => {
    if (!user) return;
    supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false })
      .then(({ data }) => {
        setAddresses(data || []);
        const def = (data || []).find((a) => a.is_default) || (data || [])[0];
        if (def) setSelectedAddr(def.id);
        else setShowAddrForm(true);
      });
  }, [user]);

  useEffect(() => { if (addrForm.full_name === '' && profile) setAddrForm((f) => ({ ...f, full_name: profile.full_name || '', phone: profile.phone || '' })); }, [profile]);

  if (items.length === 0) {
    return <div className="container-x py-20"><EmptyState title="Nothing to checkout" subtitle="Your cart is empty." action={<Link to="/shop" className="btn-dark">Shop now</Link>} /></div>;
  }

  const saveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { data, error } = await supabase.from('addresses').insert({ ...addrForm, user_id: user.id }).select().single();
    if (error) { toast(error.message, 'error'); return; }
    setAddresses((a) => [...a, data as Address]);
    setSelectedAddr(data.id);
    setShowAddrForm(false);
    setAddrForm({ label: 'Home', full_name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' });
    toast('Address saved');
  };

  const placeOrder = async () => {
    if (!user) { navigate('/login'); return; }
    const addr = addresses.find((a) => a.id === selectedAddr);
    if (!addr) { toast('Select a shipping address', 'error'); return; }
    setPlacing(true);
    try {
      const { data: orderNum } = await supabase.rpc('next_order_number').single();
      const orderNumber = orderNum || ('HTC' + Date.now().toString().slice(-6));

      const { data: order, error: oe } = await supabase.from('orders').insert({
        order_number: orderNumber,
        user_id: user.id,
        status: 'pending',
        payment_method: payment,
        payment_status: payment === 'cod' ? 'pending' : 'paid',
        subtotal, discount, gst, delivery_charge: deliveryCharge, grand_total: grandTotal,
        coupon_code: coupon?.code || null,
        shipping_name: addr.full_name, shipping_phone: addr.phone,
        shipping_address: `${addr.line1}${addr.line2 ? ', ' + addr.line2 : ''}`,
        shipping_city: addr.city, shipping_state: addr.state, shipping_pincode: addr.pincode,
        notes,
      }).select().single();
      if (oe) throw oe;

      const lineItems = items.map((i) => ({
        order_id: order.id,
        product_id: i.product_id,
        name: i.product?.name || '',
        image_url: i.product?.primary_image_url || null,
        price: i.product?.price ?? 0,
        quantity: i.quantity,
        category_name: i.product?.category?.name || null,
      }));
      const { error: ie } = await supabase.from('order_items').insert(lineItems);
      if (ie) throw ie;

      // Decrement stock
      for (const i of items) {
        const { error: se } = await supabase.rpc('decrement_stock', { p_id: i.product_id, qty: i.quantity });
        if (se) console.warn('stock decrement failed', se);
      }

      await clear();
      sessionStorage.removeItem('applied_coupon');
      toast('Order placed successfully!');
      navigate(`/account/orders/${order.id}`);
    } catch (e: any) {
      toast(e.message || 'Could not place order', 'error');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="container-x py-8">
      <h1 className="mb-6 font-display text-3xl font-bold text-ink-900">Checkout</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Address */}
          <section className="rounded-2xl border border-ink-100 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink-900">Shipping Address</h2>
              {addresses.length > 0 && (
                <button onClick={() => setShowAddrForm((s) => !s)} className="text-sm font-semibold text-gold-600">
                  {showAddrForm ? 'Cancel' : '+ Add new'}
                </button>
              )}
            </div>

            {addresses.length > 0 && !showAddrForm && (
              <div className="space-y-3">
                {addresses.map((a) => (
                  <label key={a.id} className={cn('flex cursor-pointer gap-3 rounded-xl border p-4 transition', selectedAddr === a.id ? 'border-gold-400 bg-gold-50' : 'border-ink-200 hover:border-ink-300')}>
                    <input type="radio" name="addr" checked={selectedAddr === a.id} onChange={() => setSelectedAddr(a.id)} className="mt-1 accent-gold-500" />
                    <div className="flex-1">
                      <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                        {a.full_name} <span className="chip bg-ink-100 text-ink-600">{a.label}</span>
                        {a.is_default && <span className="chip-gold">Default</span>}
                      </p>
                      <p className="mt-1 text-sm text-ink-600">{a.line1}{a.line2 ? ', ' + a.line2 : ''}, {a.city}, {a.state} {a.pincode}</p>
                      <p className="text-sm text-ink-500">Phone: {a.phone}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {showAddrForm && (
              <form onSubmit={saveAddress} className="grid gap-3 sm:grid-cols-2">
                <div><label className="label">Label</label><input className="input" value={addrForm.label} onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })} /></div>
                <div><label className="label">Full Name</label><input required className="input" value={addrForm.full_name} onChange={(e) => setAddrForm({ ...addrForm, full_name: e.target.value })} /></div>
                <div><label className="label">Phone</label><input required className="input" value={addrForm.phone} onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })} /></div>
                <div><label className="label">Pincode</label><input required className="input" value={addrForm.pincode} onChange={(e) => setAddrForm({ ...addrForm, pincode: e.target.value })} /></div>
                <div className="sm:col-span-2"><label className="label">Address Line 1</label><input required className="input" value={addrForm.line1} onChange={(e) => setAddrForm({ ...addrForm, line1: e.target.value })} /></div>
                <div className="sm:col-span-2"><label className="label">Address Line 2 (optional)</label><input className="input" value={addrForm.line2} onChange={(e) => setAddrForm({ ...addrForm, line2: e.target.value })} /></div>
                <div><label className="label">City</label><input required className="input" value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} /></div>
                <div><label className="label">State</label><input required className="input" value={addrForm.state} onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })} /></div>
                <button type="submit" className="btn-dark sm:col-span-2">Save Address</button>
              </form>
            )}
          </section>

          {/* Payment */}
          <section className="rounded-2xl border border-ink-100 p-6">
            <h2 className="mb-4 font-display text-lg font-bold text-ink-900">Payment Method</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {PAYMENTS.map((p) => (
                <label key={p.v} className={cn('flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition', payment === p.v ? 'border-gold-400 bg-gold-50' : 'border-ink-200 hover:border-ink-300')}>
                  <input type="radio" name="pay" checked={payment === p.v} onChange={() => setPayment(p.v)} className="mt-1 accent-gold-500" />
                  <p.Icon className="mt-0.5 text-gold-600" size={20} />
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{p.label}</p>
                    <p className="text-xs text-ink-500">{p.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-4">
              <label className="label">Order notes (optional)</label>
              <textarea rows={2} className="input" placeholder="Any special instructions…" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </section>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-ink-100 bg-ink-50/50 p-6">
            <h2 className="font-display text-lg font-bold text-ink-900">Your Order</h2>
            <div className="mt-4 max-h-60 space-y-3 overflow-y-auto">
              {items.map((i) => (
                <div key={i.id} className="flex gap-3">
                  <img src={i.product?.primary_image_url} alt="" className="h-14 w-12 rounded-lg object-cover" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-ink-900 line-clamp-1">{i.product?.name}</p>
                    <p className="text-ink-500">Qty: {i.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold">{formatINR((i.product?.price ?? 0) * i.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 border-t border-ink-200 pt-4 text-sm">
              <div className="flex justify-between"><span className="text-ink-500">Subtotal</span><span>{formatINR(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount ({coupon?.code})</span><span>- {formatINR(discount)}</span></div>}
              <div className="flex justify-between"><span className="text-ink-500">GST ({Math.round(GST_RATE * 100)}%)</span><span>{formatINR(gst)}</span></div>
              <div className="flex justify-between"><span className="text-ink-500">Delivery</span><span>{deliveryCharge === 0 ? 'FREE' : formatINR(deliveryCharge)}</span></div>
            </div>
            <div className="mt-4 flex justify-between border-t border-ink-200 pt-4">
              <span className="font-semibold">Total</span>
              <span className="font-display text-2xl font-bold">{formatINR(grandTotal)}</span>
            </div>
            <button onClick={placeOrder} disabled={placing} className="btn-gold mt-5 w-full">
              {placing ? 'Placing order…' : <>Place Order <Check size={16} /></>}
            </button>
            <p className="mt-3 text-center text-xs text-ink-400">By placing the order you agree to our Terms & Return Policy.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
