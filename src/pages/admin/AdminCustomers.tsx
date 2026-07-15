import { useEffect, useState } from 'react';
import { Search, Mail, Phone, Calendar, ShoppingBag } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatINR } from '../../lib/config';
import { formatDate, initials } from '../../lib/utils';
import { Spinner, EmptyState } from '../../components/ui';
import type { Profile, Order } from '../../lib/types';

export function AdminCustomers() {
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [orders, setOrders] = useState<Record<string, { count: number; total: number; last?: Order }>>({});
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      const [{ data: profiles }, { data: allOrders }] = await Promise.all([
        supabase.from('profiles').select('*').eq('role', 'customer').order('created_at', { ascending: false }),
        supabase.from('orders').select('*'),
      ]);
      setCustomers(profiles || []);
      const map: Record<string, { count: number; total: number; last?: Order }> = {};
      for (const o of allOrders || []) {
        if (o.status === 'cancelled') continue;
        if (!map[o.user_id]) map[o.user_id] = { count: 0, total: 0 };
        map[o.user_id].count += 1;
        map[o.user_id].total += o.grand_total;
        if (!map[o.user_id].last || new Date(o.created_at) > new Date(map[o.user_id].last!.created_at)) map[o.user_id].last = o;
      }
      setOrders(map);
      setLoading(false);
    })();
  }, []);

  const filtered = customers.filter((c) =>
    (c.full_name || '').toLowerCase().includes(q.toLowerCase()) || c.email.toLowerCase().includes(q.toLowerCase())
  );

  if (loading) return <div className="flex justify-center py-12"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Customers</h1>
        <p className="text-sm text-ink-500">{customers.length} registered customers</p>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email…" className="input pl-9 py-2" />
      </div>

      {filtered.length === 0 ? <EmptyState title="No customers found" /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => {
            const stats = orders[c.id] || { count: 0, total: 0 };
            return (
              <div key={c.id} className="rounded-2xl border border-ink-100 bg-white p-5">
                <div className="flex items-center gap-3">
                  {c.avatar_url ? (
                    <img src={c.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-ink-900 font-bold text-gold-400">{initials(c.full_name)}</span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink-900">{c.full_name || 'Unnamed'}</p>
                    <p className="truncate text-xs text-ink-400">Joined {formatDate(c.created_at)}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-1.5 text-sm">
                  <p className="flex items-center gap-2 text-ink-600"><Mail size={14} className="text-gold-600" /> <span className="truncate">{c.email}</span></p>
                  {c.phone && <p className="flex items-center gap-2 text-ink-600"><Phone size={14} className="text-gold-600" /> {c.phone}</p>}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-ink-100 pt-3">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={16} className="text-ink-400" />
                    <div><p className="text-sm font-bold text-ink-900">{stats.count}</p><p className="text-[10px] text-ink-400">Orders</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-ink-400" />
                    <div><p className="text-sm font-bold text-ink-900">{formatINR(stats.total)}</p><p className="text-[10px] text-ink-400">Spent</p></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
