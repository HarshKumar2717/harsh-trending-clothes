import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, ShieldCheck, ShoppingBag, Settings,
  CreditCard, BarChart3, LogOut, Store, Package, Ticket, Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { initials } from '../../lib/utils';
import { cn } from '../../lib/utils';

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/roles', label: 'Manage Roles', icon: ShieldCheck },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { to: '/admin/banners', label: 'Banners', icon: ImageIcon },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
  { to: '/admin/payment', label: 'Payment (COD)', icon: CreditCard },
];

export function AdminLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-ink-50/40">
      <div className="container-x py-6">
        <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-ink-100 bg-white p-3">
              <div className="mb-3 flex items-center gap-2 border-b border-ink-100 px-3 pb-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink-950 font-display font-bold text-gold-400">H</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink-900">Super Admin</p>
                  <p className="truncate text-[10px] uppercase tracking-wider text-gold-600">{profile?.full_name || profile?.email}</p>
                </div>
              </div>
              <nav className="flex flex-col gap-0.5">
                {LINKS.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.end}
                    className={({ isActive }) => cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                      isActive ? 'bg-ink-950 text-gold-400' : 'text-ink-600 hover:bg-ink-50'
                    )}
                  >
                    <l.icon size={18} /> {l.label}
                  </NavLink>
                ))}
              </nav>
              <div className="mt-3 space-y-1 border-t border-ink-100 pt-3">
                <NavLink to="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink-500 hover:bg-ink-50">
                  <Store size={16} /> View Store
                </NavLink>
                <button
                  onClick={() => { signOut(); navigate('/admin/login'); }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
