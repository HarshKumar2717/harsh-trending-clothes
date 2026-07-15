import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Ticket, Image as ImageIcon,
  AlertTriangle, BarChart3,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { to: '/admin/banners', label: 'Banners', icon: ImageIcon },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
];

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-ink-50/40">
      <div className="container-x py-6">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-ink-100 bg-white p-3">
              <div className="mb-3 flex items-center gap-2 border-b border-ink-100 px-3 pb-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink-950 font-display font-bold text-gold-400">A</span>
                <div>
                  <p className="text-sm font-bold text-ink-900">Admin Panel</p>
                  <p className="text-[10px] uppercase tracking-wider text-gold-600">Harsh Trending Cloth</p>
                </div>
              </div>
              <nav className="flex flex-col gap-1">
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
              <div className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
                <p className="flex items-center gap-1 font-semibold"><AlertTriangle size={14} /> Low Stock Alert</p>
                <p className="mt-1">Check products with stock below threshold.</p>
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
