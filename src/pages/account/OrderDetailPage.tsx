import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Download, ArrowLeft, Check, MapPin, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Order, OrderItem } from '../../lib/types';
import { STORE, formatINR } from '../../lib/config';
import { formatDateTime, STATUS_LABEL, STATUS_COLOR, ORDER_STATUS_FLOW, statusStep, downloadFile } from '../../lib/utils';
import { FullPageLoader, EmptyState } from '../../components/ui';
import { cn } from '../../lib/utils';

export function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;
    (async () => {
      const [{ data: o }, { data: its }] = await Promise.all([
        supabase.from('orders').select('*').eq('id', id).maybeSingle(),
        supabase.from('order_items').select('*').eq('order_id', id),
      ]);
      setOrder(o as Order | null);
      setItems(its || []);
      setLoading(false);
    })();
  }, [id, user]);

  if (loading) return <FullPageLoader label="Loading order…" />;
  if (!order) return <EmptyState title="Order not found" action={<Link to="/account/orders" className="btn-dark">Back to orders</Link>} />;

  const step = statusStep(order.status);
  const cancelled = order.status === 'cancelled' || order.status === 'returned';

  const downloadInvoice = () => {
    const lines: string[] = [];
    lines.push(`${STORE.name}`);
    lines.push(`${STORE.address.line1}, ${STORE.address.city}, ${STORE.address.state} ${STORE.address.pincode}`);
    lines.push(`Phone: ${STORE.phone} | Email: ${STORE.email}`);
    lines.push('='.repeat(50));
    lines.push(`INVOICE: ${order.order_number}`);
    lines.push(`Date: ${formatDateTime(order.created_at)}`);
    lines.push(`Status: ${STATUS_LABEL[order.status]} | Payment: ${order.payment_method.toUpperCase()} (${order.payment_status})`);
    lines.push('-'.repeat(50));
    lines.push('SHIP TO:');
    lines.push(`${order.shipping_name}`);
    lines.push(`${order.shipping_address}`);
    lines.push(`${order.shipping_city}, ${order.shipping_state} ${order.shipping_pincode}`);
    lines.push(`Phone: ${order.shipping_phone}`);
    lines.push('-'.repeat(50));
    lines.push('ITEMS:');
    lines.push(`${'Item'.padEnd(30)} ${'Qty'.padStart(5)} ${'Price'.padStart(10)} ${'Total'.padStart(10)}`);
    items.forEach((it) => {
      lines.push(`${it.name.slice(0, 30).padEnd(30)} ${String(it.quantity).padStart(5)} ${String(it.price).padStart(10)} ${String(it.price * it.quantity).padStart(10)}`);
    });
    lines.push('-'.repeat(50));
    lines.push(`Subtotal: ${formatINR(order.subtotal)}`);
    if (order.discount) lines.push(`Discount: - ${formatINR(order.discount)}`);
    lines.push(`GST: ${formatINR(order.gst)}`);
    lines.push(`Delivery: ${order.delivery_charge === 0 ? 'FREE' : formatINR(order.delivery_charge)}`);
    lines.push('='.repeat(50));
    lines.push(`GRAND TOTAL: ${formatINR(order.grand_total)}`);
    lines.push('='.repeat(50));
    lines.push('Thank you for shopping with Harsh Trending Cloth!');
    downloadFile(`invoice-${order.order_number}.txt`, lines.join('\n'));
  };

  return (
    <div className="space-y-6">
      <Link to="/account/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-500 hover:text-gold-600">
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">{order.order_number}</h1>
          <p className="text-sm text-ink-500">Placed on {formatDateTime(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn('chip', STATUS_COLOR[order.status])}>{STATUS_LABEL[order.status]}</span>
          <button onClick={downloadInvoice} className="btn-outline py-2">
            <Download size={16} /> Invoice
          </button>
        </div>
      </div>

      {/* Tracking */}
      {!cancelled && (
        <div className="rounded-2xl border border-ink-100 bg-white p-6">
          <h2 className="mb-6 font-display text-lg font-bold text-ink-900">Order Tracking</h2>
          <div className="relative">
            <div className="absolute left-0 right-0 top-5 h-1 bg-ink-100" />
            <div
              className="absolute left-0 top-5 h-1 bg-gold-400 transition-all duration-700"
              style={{ width: `${(step / (ORDER_STATUS_FLOW.length - 1)) * 100}%` }}
            />
            <div className="relative flex justify-between">
              {ORDER_STATUS_FLOW.map((s, i) => {
                const done = i <= step;
                return (
                  <div key={s} className="flex flex-col items-center gap-2">
                    <span className={cn(
                      'grid h-10 w-10 place-items-center rounded-full border-2 bg-white transition',
                      done ? 'border-gold-400 bg-gold-400 text-ink-950' : 'border-ink-200 text-ink-300'
                    )}>
                      {done ? <Check size={18} /> : i + 1}
                    </span>
                    <span className={cn('text-center text-[10px] font-semibold uppercase tracking-wider sm:text-xs', done ? 'text-gold-600' : 'text-ink-400')}>
                      {STATUS_LABEL[s]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {cancelled && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-semibold text-red-700">This order was {STATUS_LABEL[order.status].toLowerCase()}.</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Items */}
        <div className="rounded-2xl border border-ink-100 bg-white p-6">
          <h2 className="mb-4 font-display text-lg font-bold text-ink-900">Items ({items.length})</h2>
          <div className="space-y-4">
            {items.map((it) => (
              <div key={it.id} className="flex gap-4">
                {it.image_url && <img src={it.image_url} alt="" className="h-16 w-14 rounded-lg object-cover" />}
                <div className="flex-1">
                  <p className="font-medium text-ink-900">{it.name}</p>
                  {it.category_name && <p className="text-xs text-ink-400">{it.category_name}</p>}
                  <p className="text-sm text-ink-500">Qty: {it.quantity} × {formatINR(it.price)}</p>
                </div>
                <span className="font-semibold text-ink-900">{formatINR(it.price * it.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary + shipping */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-ink-100 bg-white p-6">
            <h3 className="mb-3 font-semibold text-ink-900">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-ink-500">Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>- {formatINR(order.discount)}</span></div>}
              <div className="flex justify-between"><span className="text-ink-500">GST</span><span>{formatINR(order.gst)}</span></div>
              <div className="flex justify-between"><span className="text-ink-500">Delivery</span><span>{order.delivery_charge === 0 ? 'FREE' : formatINR(order.delivery_charge)}</span></div>
              <div className="flex justify-between border-t border-ink-100 pt-2 font-bold"><span>Total</span><span>{formatINR(order.grand_total)}</span></div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-2 text-sm">
              <CreditCard size={16} className="text-gold-600" />
              <span className="capitalize">{order.payment_method.replace('_', ' ')}</span>
              <span className={cn('ml-auto chip', order.payment_status === 'paid' ? 'chip-green' : 'chip bg-ink-100 text-ink-600')}>
                {order.payment_status}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-ink-100 bg-white p-6">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-ink-900"><MapPin size={16} className="text-gold-600" /> Shipping Address</h3>
            <p className="text-sm text-ink-700">{order.shipping_name}</p>
            <p className="text-sm text-ink-500">{order.shipping_address}</p>
            <p className="text-sm text-ink-500">{order.shipping_city}, {order.shipping_state} {order.shipping_pincode}</p>
            <p className="mt-1 text-sm text-ink-500">Phone: {order.shipping_phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
