import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { User, Package, Heart, MapPin, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { initials } from '../../lib/utils';
import { cn } from '../../lib/utils';

const LINKS = [
  { to: '/account', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/account/profile', label: 'My Profile', icon: User },
  { to: '/account/orders', label: 'My Orders', icon: Package },
  { to: '/account/addresses', label: 'Saved Addresses', icon: MapPin },
  { to: '/wishlist', label: 'Wishlist', icon: Heart },
];

export function AccountLayout() {
  const { profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="container-x py-8">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-ink-100 bg-white p-5">
            <div className="flex items-center gap-3 border-b border-ink-100 pb-4">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <span className="grid h-12 w-12 place-items-center rounded-full bg-ink-900 font-bold text-gold-400">
                  {initials(profile?.full_name)}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink-900">{profile?.full_name || 'User'}</p>
                <p className="truncate text-xs text-ink-500">{profile?.email}</p>
                {isAdmin && <span className="chip-gold mt-1 text-[10px]">Super Admin</span>}
              </div>
            </div>
            <nav className="mt-3 flex flex-col gap-1">
              {LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                    isActive ? 'bg-gold-50 text-gold-700' : 'text-ink-600 hover:bg-ink-50'
                  )}
                >
                  <l.icon size={18} /> {l.label}
                </NavLink>
              ))}
              {isAdmin && (
                <NavLink to="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-50">
                  <ShieldCheck size={18} /> Admin Panel
                </NavLink>
              )}
              <button
                onClick={() => { signOut(); navigate('/'); }}
                className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </nav>
          </div>
        </aside>

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
