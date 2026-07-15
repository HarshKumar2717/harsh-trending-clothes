import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Heart, MapPin, ShoppingBag, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { supabase } from '../../lib/supabase';
import { formatINR } from '../../lib/config';
import { formatDateTime, STATUS_LABEL, STATUS_COLOR } from '../../lib/utils';
import type { Order } from '../../lib/types';
import { Spinner } from '../../components/ui';

export function AccountDashboard() {
  const { profile, user } = useAuth();
  const { count } = useCart();
  const { items: wish } = useWishlist();
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5)
      .then(({ data }) => {
        setOrders(data || []);
        setTotalSpent((data || []).reduce((s, o) => s + o.grand_total, 0));
        setLoading(false);
      });
  }, [user]);

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: Package, color: 'bg-blue-50 text-blue-600' },
    { label: 'Cart Items', value: count, icon: ShoppingBag, color: 'bg-gold-50 text-gold-600' },
    { label: 'Wishlist', value: wish.length, icon: Heart, color: 'bg-red-50 text-red-600' },
    { label: 'Total Spent', value: formatINR(totalSpent), icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Welcome, {profile?.full_name?.split(' ')[0] || 'there'}!</h1>
        <p className="text-sm text-ink-500">Here's an overview of your account.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-ink-100 bg-white p-5">
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${s.color}`}><s.icon size={20} /></span>
            <p className="mt-3 font-display text-2xl font-bold text-ink-900">{s.value}</p>
            <p className="text-xs text-ink-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink-900">Recent Orders</h2>
          <Link to="/account/orders" className="text-sm font-semibold text-gold-600">View all</Link>
        </div>
        {loading ? <div className="flex justify-center py-8"><Spinner /></div> : orders.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-400">No orders yet. <Link to="/shop" className="text-gold-600">Start shopping</Link></p>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <Link key={o.id} to={`/account/orders/${o.id}`} className="flex items-center justify-between rounded-xl border border-ink-100 p-4 hover:border-gold-300">
                <div>
                  <p className="font-semibold text-ink-900">{o.order_number}</p>
                  <p className="text-xs text-ink-400">{formatDateTime(o.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`chip ${STATUS_COLOR[o.status]}`}>{STATUS_LABEL[o.status]}</span>
                  <span className="font-bold text-ink-900">{formatINR(o.grand_total)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/account/profile" className="flex items-center gap-4 rounded-2xl border border-ink-100 bg-white p-5 hover:border-gold-300">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-ink-900 text-gold-400"><MapPin size={22} /></span>
          <div><p className="font-semibold text-ink-900">Manage Profile</p><p className="text-sm text-ink-500">Update your details & avatar</p></div>
        </Link>
        <Link to="/account/addresses" className="flex items-center gap-4 rounded-2xl border border-ink-100 bg-white p-5 hover:border-gold-300">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-ink-900 text-gold-400"><MapPin size={22} /></span>
          <div><p className="font-semibold text-ink-900">Saved Addresses</p><p className="text-sm text-ink-500">Add or edit shipping addresses</p></div>
        </Link>
      </div>
    </div>
  );
}
