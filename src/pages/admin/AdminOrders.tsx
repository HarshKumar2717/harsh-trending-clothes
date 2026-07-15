import { useEffect, useState } from 'react';
import { Search, Download, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../lib/config';
import { formatDateTime, STATUS_LABEL, STATUS_COLOR, toCSV, downloadFile } from '../../lib/utils';
import { Modal, Spinner, EmptyState } from '../../components/ui';
import type { Order, OrderItem, OrderStatus } from '../../lib/types';
import { cn } from '../../lib/utils';

const STATUS_OPTIONS: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'];

export function AdminOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [updating, setUpdating] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = orders.filter((o) =>
    (o.order_number.toLowerCase().includes(q.toLowerCase()) || o.shipping_name.toLowerCase().includes(q.toLowerCase())) &&
    (!filterStatus || o.status === filterStatus)
  );

  const view = async (o: Order) => {
    setViewOrder(o);
    const { data } = await supabase.from('order_items').select('*').eq('order_id', o.id);
    setItems(data || []);
  };

  const updateStatus = async (id: string, status: OrderStatus) => {
    setUpdating(true);
    await supabase.from('orders').update({ status }).eq('id', id);
    setViewOrder((o) => o ? { ...o, status } : o);
    await load();
    setUpdating(false);
    toast(`Order marked as ${STATUS_LABEL[status]}`);
  };

  const exportCSV = () => {
    const rows = filtered.map((o) => ({
      order_number: o.order_number, customer: o.shipping_name, date: formatDateTime(o.created_at),
      status: o.status, payment: o.payment_method, total: o.grand_total, city: o.shipping_city,
    }));
    downloadFile('orders.csv', toCSV(rows), 'text/csv');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Orders</h1>
          <p className="text-sm text-ink-500">{orders.length} total orders</p>
        </div>
        <button onClick={exportCSV} className="btn-outline py-2 text-xs"><Download size={14} /> Export CSV</button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by order # or customer…" className="input pl-9 py-2" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input w-auto py-2">
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
      </div>

      {loading ? <div className="flex justify-center py-12"><Spinner /></div> :
       filtered.length === 0 ? <EmptyState title="No orders found" /> : (
        <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-100 bg-ink-50/50 text-left text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-ink-50/40">
                  <td className="px-4 py-3 font-semibold text-ink-900">{o.order_number}</td>
                  <td className="px-4 py-3 text-ink-600">{o.shipping_name}<br /><span className="text-xs text-ink-400">{o.shipping_city}</span></td>
                  <td className="px-4 py-3 text-ink-500">{formatDateTime(o.created_at)}</td>
                  <td className="px-4 py-3 font-bold text-ink-900">{formatINR(o.grand_total)}</td>
                  <td className="px-4 py-3 capitalize text-ink-600">{o.payment_method.replace('_', ' ')}</td>
                  <td className="px-4 py-3"><span className={cn('chip text-[10px]', STATUS_COLOR[o.status])}>{STATUS_LABEL[o.status]}</span></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => view(o)} className="grid h-8 w-8 place-items-center rounded-full text-ink-400 hover:bg-gold-50 hover:text-gold-600 ml-auto"><Eye size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View modal */}
      <Modal open={!!viewOrder} onClose={() => setViewOrder(null)} title={viewOrder?.order_number} maxWidth="max-w-2xl">
        {viewOrder && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="label">Customer</p>
                <p className="text-sm font-medium text-ink-900">{viewOrder.shipping_name}</p>
                <p className="text-sm text-ink-500">{viewOrder.shipping_phone}</p>
              </div>
              <div>
                <p className="label">Shipping Address</p>
                <p className="text-sm text-ink-600">{viewOrder.shipping_address}</p>
                <p className="text-sm text-ink-600">{viewOrder.shipping_city}, {viewOrder.shipping_state} {viewOrder.shipping_pincode}</p>
              </div>
            </div>

            <div>
              <p className="label">Items</p>
              <div className="space-y-2 rounded-xl border border-ink-100 p-3">
                {items.map((it) => (
                  <div key={it.id} className="flex items-center gap-3">
                    {it.image_url && <img src={it.image_url} alt="" className="h-12 w-10 rounded object-cover" />}
                    <div className="flex-1"><p className="text-sm font-medium text-ink-900">{it.name}</p><p className="text-xs text-ink-400">Qty: {it.quantity}</p></div>
                    <span className="text-sm font-semibold">{formatINR(it.price * it.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-ink-50 p-4 text-sm">
                <p className="flex justify-between"><span className="text-ink-500">Subtotal</span><span>{formatINR(viewOrder.subtotal)}</span></p>
                {viewOrder.discount > 0 && <p className="flex justify-between text-emerald-600"><span>Discount</span><span>- {formatINR(viewOrder.discount)}</span></p>}
                <p className="flex justify-between"><span className="text-ink-500">GST</span><span>{formatINR(viewOrder.gst)}</span></p>
                <p className="flex justify-between"><span className="text-ink-500">Delivery</span><span>{viewOrder.delivery_charge === 0 ? 'FREE' : formatINR(viewOrder.delivery_charge)}</span></p>
                <p className="mt-1 flex justify-between border-t border-ink-200 pt-1 font-bold"><span>Total</span><span>{formatINR(viewOrder.grand_total)}</span></p>
              </div>
              <div>
                <p className="label">Update Status</p>
                <select
                  value={viewOrder.status}
                  disabled={updating}
                  onChange={(e) => updateStatus(viewOrder.id, e.target.value as OrderStatus)}
                  className="input"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
                <p className="mt-2 text-xs text-ink-400">Payment: {viewOrder.payment_method.replace('_', ' ')} ({viewOrder.payment_status})</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
