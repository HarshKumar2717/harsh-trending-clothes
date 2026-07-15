import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ShoppingBag, Users, Package, AlertTriangle, ArrowRight, IndianRupee } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatINR } from '../../lib/config';
import { formatDateTime, STATUS_LABEL, STATUS_COLOR } from '../../lib/utils';
import { Spinner } from '../../components/ui';
import { cn } from '../../lib/utils';
import type { Order, Product } from '../../lib/types';

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState(0);
  const [lowStock, setLowStock] = useState<Product[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: o }, { data: p }, { count: c }, { data: ls }] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('products').select('*'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
        supabase.from('products').select('*').lte('stock', 10).order('stock', { ascending: true }),
      ]);
      setOrders(o || []);
      setProducts(p || []);
      setCustomers(c || 0);
      setLowStock((ls || []).filter((x) => x.stock <= x.low_stock_threshold));
      setLoading(false);
    })();
  }, []);

  const revenue = orders.reduce((s, o) => s + (o.status !== 'cancelled' ? o.grand_total : 0), 0);
  const pending = orders.filter((o) => ['pending', 'confirmed', 'processing'].includes(o.status)).length;
  void pending;

  // Monthly sales for last 6 months
  const monthly = useMemo(() => {
    const months: { label: string; total: number; key: string }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      months.push({ label: d.toLocaleString('en-IN', { month: 'short' }), total: 0, key });
    }
    for (const o of orders) {
      if (o.status === 'cancelled') continue;
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const m = months.find((x) => x.key === key);
      if (m) m.total += o.grand_total;
    }
    return months;
  }, [orders]);

  const maxMonthly = Math.max(...monthly.map((m) => m.total), 1);

  const stats = [
    { label: 'Total Revenue', value: formatINR(revenue), icon: IndianRupee, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Orders', value: orders.length, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
    { label: 'Customers', value: customers, icon: Users, color: 'bg-gold-50 text-gold-600' },
    { label: 'Products', value: products.length, icon: Package, color: 'bg-purple-50 text-purple-600' },
  ];

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Dashboard</h1>
        <p className="text-sm text-ink-500">Overview of your store performance.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-ink-100 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className={cn('grid h-10 w-10 place-items-center rounded-xl', s.color)}><s.icon size={20} /></span>
              <TrendingUp size={16} className="text-emerald-500" />
            </div>
            <p className="mt-3 font-display text-2xl font-bold text-ink-900">{s.value}</p>
            <p className="text-xs text-ink-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Sales chart */}
      <div className="rounded-2xl border border-ink-100 bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-ink-900">Monthly Sales</h2>
            <p className="text-xs text-ink-500">Last 6 months revenue</p>
          </div>
          <Link to="/admin/reports" className="text-sm font-semibold text-gold-600">View report →</Link>
        </div>
        <div className="flex h-48 items-end justify-between gap-3">
          {monthly.map((m) => (
            <div key={m.key} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-gold-600 to-gold-300 transition-all duration-700 hover:from-gold-700 hover:to-gold-400"
                  style={{ height: `${(m.total / maxMonthly) * 100}%`, minHeight: m.total > 0 ? '8px' : '2px' }}
                  title={formatINR(m.total)}
                />
              </div>
              <span className="text-xs font-medium text-ink-500">{m.label}</span>
              <span className="text-[10px] text-ink-400">{m.total > 0 ? formatINR(m.total) : '—'}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Recent orders */}
        <div className="rounded-2xl border border-ink-100 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm font-semibold text-gold-600">View all</Link>
          </div>
          {orders.length === 0 ? <p className="py-8 text-center text-sm text-ink-400">No orders yet.</p> : (
            <div className="space-y-2">
              {orders.slice(0, 6).map((o) => (
                <Link key={o.id} to="/admin/orders" className="flex items-center justify-between rounded-xl border border-ink-50 p-3 hover:border-gold-200">
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{o.order_number}</p>
                    <p className="text-xs text-ink-400">{formatDateTime(o.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn('chip text-[10px]', STATUS_COLOR[o.status])}>{STATUS_LABEL[o.status]}</span>
                    <span className="text-sm font-bold">{formatINR(o.grand_total)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Low stock */}
        <div className="rounded-2xl border border-ink-100 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-ink-900">
            <AlertTriangle size={18} className="text-amber-500" /> Low Stock
          </h2>
          {lowStock.length === 0 ? <p className="py-6 text-center text-sm text-ink-400">All products well stocked.</p> : (
            <div className="space-y-2">
              {lowStock.slice(0, 6).map((p) => (
                <Link key={p.id} to="/admin/products" className="flex items-center gap-3 rounded-xl border border-ink-50 p-3 hover:border-gold-200">
                  <img src={p.primary_image_url} alt="" className="h-10 w-9 rounded object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-900">{p.name}</p>
                    <p className="text-xs text-ink-400">{formatINR(p.price)}</p>
                  </div>
                  <span className={cn('chip text-[10px]', p.stock === 0 ? 'chip-red' : 'bg-amber-100 text-amber-700')}>{p.stock} left</span>
                </Link>
              ))}
              <Link to="/admin/products" className="mt-2 flex items-center justify-center gap-1 text-sm font-semibold text-gold-600">
                Manage stock <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
