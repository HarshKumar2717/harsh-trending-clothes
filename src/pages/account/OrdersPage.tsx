import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Order } from '../../lib/types';
import { formatINR } from '../../lib/config';
import { formatDateTime, STATUS_LABEL, STATUS_COLOR } from '../../lib/utils';
import { EmptyState, Spinner } from '../../components/ui';

export function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    if (!user) return;
    supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setOrders(data || []); setLoading(false); });
  }, [user]);

  const filtered = orders.filter((o) =>
    o.order_number.toLowerCase().includes(q.toLowerCase()) || o.status.toLowerCase().includes(q.toLowerCase())
  );

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">My Orders</h1>
          <p className="text-sm text-ink-500">{orders.length} orders placed</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search orders…" className="input w-48 py-2 pl-9 sm:w-56" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Package size={48} />}
          title="No orders found"
          subtitle={q ? 'Try a different search.' : "You haven't placed any orders yet."}
          action={!q && <Link to="/shop" className="btn-gold">Start Shopping</Link>}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => (
            <Link key={o.id} to={`/account/orders/${o.id}`} className="group flex items-center gap-4 rounded-2xl border border-ink-100 bg-white p-5 hover:border-gold-300">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-ink-50 text-ink-500 group-hover:bg-gold-50 group-hover:text-gold-600">
                <Package size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink-900">{o.order_number}</p>
                <p className="text-xs text-ink-400">{formatDateTime(o.created_at)}</p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-xs text-ink-400">Total</p>
                <p className="font-bold text-ink-900">{formatINR(o.grand_total)}</p>
              </div>
              <span className={`chip ${STATUS_COLOR[o.status]}`}>{STATUS_LABEL[o.status]}</span>
              <ChevronRight size={18} className="text-ink-300 group-hover:text-gold-500" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
