import { useEffect, useMemo, useState } from 'react';
import { Download, TrendingUp, ShoppingBag, IndianRupee, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatINR } from '../../lib/config';
import { STATUS_LABEL, toCSV, downloadFile } from '../../lib/utils';
import { Spinner } from '../../components/ui';
import { cn } from '../../lib/utils';
import type { Order, Product } from '../../lib/types';

export function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: o }, { data: p }] = await Promise.all([
        supabase.from('orders').select('*'),
        supabase.from('products').select('*, category:categories(*)'),
      ]);
      setOrders(o || []);
      setProducts(p || []);
      setLoading(false);
    })();
  }, []);

  const validOrders = orders.filter((o) => o.status !== 'cancelled');
  const revenue = validOrders.reduce((s, o) => s + o.grand_total, 0);
  const avgOrder = validOrders.length ? Math.round(revenue / validOrders.length) : 0;

  const byStatus = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of orders) map[o.status] = (map[o.status] || 0) + 1;
    return map;
  }, [orders]);

  const byCategory = useMemo(() => {
    const map: Record<string, { revenue: number; count: number }> = {};
    for (const p of products) {
      const cat = p.category?.name || 'Uncategorized';
      if (!map[cat]) map[cat] = { revenue: 0, count: 0 };
      map[cat].count += 1;
      map[cat].revenue += p.price * Math.max(0, 50 - p.stock); // approx sold
    }
    return Object.entries(map).sort((a, b) => b[1].revenue - a[1].revenue);
  }, [products]);

  const monthly = useMemo(() => {
    const months: { label: string; total: number; count: number; key: string }[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ label: d.toLocaleString('en-IN', { month: 'short', year: '2-digit' }), total: 0, count: 0, key: `${d.getFullYear()}-${d.getMonth()}` });
    }
    for (const o of validOrders) {
      const d = new Date(o.created_at);
      const m = months.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`);
      if (m) { m.total += o.grand_total; m.count += 1; }
    }
    return months;
  }, [validOrders]);

  const maxMonthly = Math.max(...monthly.map((m) => m.total), 1);

  const exportOrders = () => {
    const rows = orders.map((o) => ({
      order: o.order_number, date: new Date(o.created_at).toLocaleDateString('en-IN'),
      customer: o.shipping_name, status: STATUS_LABEL[o.status], payment: o.payment_method,
      subtotal: o.subtotal, discount: o.discount, gst: o.gst, delivery: o.delivery_charge, total: o.grand_total,
    }));
    downloadFile('orders-report.csv', toCSV(rows), 'text/csv');
  };

  const exportProducts = () => {
    const rows = products.map((p) => ({
      name: p.name, category: p.category?.name, price: p.price, stock: p.stock,
      rating: p.rating, sold: Math.max(0, 50 - p.stock), revenue: p.price * Math.max(0, 50 - p.stock),
    }));
    downloadFile('products-report.csv', toCSV(rows), 'text/csv');
  };

  if (loading) return <div className="flex justify-center py-12"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="font-display text-2xl font-bold text-ink-900">Reports & Analytics</h1><p className="text-sm text-ink-500">Revenue, sales and product performance</p></div>
        <div className="flex gap-2">
          <button onClick={exportOrders} className="btn-outline py-2 text-xs"><Download size={14} /> Orders</button>
          <button onClick={exportProducts} className="btn-outline py-2 text-xs"><Download size={14} /> Products</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { l: 'Total Revenue', v: formatINR(revenue), I: IndianRupee, c: 'bg-emerald-50 text-emerald-600' },
          { l: 'Total Orders', v: orders.length, I: ShoppingBag, c: 'bg-blue-50 text-blue-600' },
          { l: 'Avg Order Value', v: formatINR(avgOrder), I: TrendingUp, c: 'bg-gold-50 text-gold-600' },
          { l: 'Products', v: products.length, I: Package, c: 'bg-purple-50 text-purple-600' },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-ink-100 bg-white p-5">
            <span className={cn('grid h-10 w-10 place-items-center rounded-xl', s.c)}><s.I size={20} /></span>
            <p className="mt-3 font-display text-2xl font-bold text-ink-900">{s.v}</p>
            <p className="text-xs text-ink-500">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart - 12 months */}
      <div className="rounded-2xl border border-ink-100 bg-white p-6">
        <h2 className="mb-6 font-display text-lg font-bold text-ink-900">Revenue (Last 12 Months)</h2>
        <div className="flex h-56 items-end justify-between gap-2">
          {monthly.map((m) => (
            <div key={m.key} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="text-[9px] text-ink-400">{m.count > 0 ? m.count : ''}</span>
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t bg-gradient-to-t from-gold-600 to-gold-300 transition-all duration-700 hover:from-gold-700"
                  style={{ height: `${(m.total / maxMonthly) * 100}%`, minHeight: m.total > 0 ? '6px' : '2px' }}
                  title={formatINR(m.total)}
                />
              </div>
              <span className="text-[9px] font-medium text-ink-500">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category performance */}
        <div className="rounded-2xl border border-ink-100 bg-white p-6">
          <h2 className="mb-4 font-display text-lg font-bold text-ink-900">Category Performance</h2>
          <div className="space-y-3">
            {byCategory.map(([cat, d]) => (
              <div key={cat}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-ink-700">{cat}</span>
                  <span className="font-semibold text-ink-900">{formatINR(d.revenue)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                  <div className="h-full rounded-full bg-gold-400" style={{ width: `${(d.revenue / (byCategory[0]?.[1].revenue || 1)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order status breakdown */}
        <div className="rounded-2xl border border-ink-100 bg-white p-6">
          <h2 className="mb-4 font-display text-lg font-bold text-ink-900">Orders by Status</h2>
          <div className="space-y-2.5">
            {Object.entries(byStatus).sort((a, b) => b[1] - a[1]).map(([s, n]) => (
              <div key={s} className="flex items-center justify-between rounded-lg border border-ink-50 px-4 py-2.5">
                <span className="text-sm font-medium text-ink-700">{STATUS_LABEL[s as keyof typeof STATUS_LABEL]}</span>
                <span className="font-bold text-ink-900">{n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
