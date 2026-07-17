import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Heart, ShoppingCart, Menu, X, ChevronDown, LogOut,
  LayoutDashboard, Package,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { fetchProducts } from '../lib/api';
import type { Product } from '../lib/types';
import { formatINR } from '../lib/config';
import { cn } from '../lib/utils';

const NAV = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'T-Shirts', to: '/category/t-shirts' },
  { label: 'Shirts', to: '/category/shirts' },
  { label: 'Pants', to: '/category/pants' },
  { label: 'Sneakers', to: '/category/sneakers' },
  { label: 'Perfumes', to: '/category/perfumes' },
];

export function Header() {
  const { user, profile, signOut } = useAuth();
  const { count } = useCart();
  const { items: wishItems } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Live search debounce
  useEffect(() => {
    if (q.trim().length < 2) { setResults([]); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetchProducts({ search: q.trim(), limit: 6 });
        setResults(r);
      } catch { setResults([]); }
      setSearching(false);
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      navigate(`/shop?search=${encodeURIComponent(q.trim())}`);
      setSearchOpen(false);
      setQ('');
    }
  };

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-ink-950 text-center text-xs font-medium text-gold-300">
        <div className="container-x py-2 flex items-center justify-center gap-2">
          <span className="hidden sm:inline">Free delivery on orders over ₹1499</span>
          <span className="hidden sm:inline text-ink-600">•</span>
          <span>Use code <strong className="text-gold-400">WELCOME10</strong> for 10% off your first order</span>
        </div>
      </div>

      <header className={cn(
        'sticky top-0 z-50 border-b transition-all duration-300',
        scrolled ? 'border-ink-100 bg-white/95 backdrop-blur shadow-sm' : 'border-transparent bg-white'
      )}>
        <div className="container-x flex h-16 items-center justify-between gap-4 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink-950 font-display text-xl font-bold text-gold-400">H</span>
            <span className="hidden flex-col leading-none sm:flex">
              <span className="font-display text-lg font-bold tracking-tight text-ink-900">Harsh Trending Cloth</span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-gold-600">Premium Fashion</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  'link-underline rounded-full px-3 py-2 text-sm font-medium transition',
                  location.pathname === n.to ? 'text-gold-600' : 'text-ink-700 hover:text-ink-950'
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => { setSearchOpen((s) => !s); setTimeout(() => searchRef.current?.focus(), 50); }}
              aria-label="Search"
              className="grid h-10 w-10 place-items-center rounded-full text-ink-700 hover:bg-ink-50"
            >
              <Search size={20} />
            </button>

            <Link to="/wishlist" aria-label="Wishlist" className="relative hidden h-10 w-10 place-items-center rounded-full text-ink-700 hover:bg-ink-50 sm:grid">
              <Heart size={20} />
              {wishItems.length > 0 && <Dot count={wishItems.length} />}
            </Link>

            <Link to="/cart" aria-label="Cart" className="relative grid h-10 w-10 place-items-center rounded-full text-ink-700 hover:bg-ink-50">
              <ShoppingCart size={20} />
              {count > 0 && <Dot count={count} />}
            </Link>

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-1.5 rounded-full border border-ink-200 py-1.5 pl-1.5 pr-2 hover:border-gold-400"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-ink-900 text-xs font-bold text-gold-400">
                    {(profile?.full_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                  </span>
                  <ChevronDown size={14} className="text-ink-500" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-12 w-56 animate-scale-in rounded-xl border border-ink-100 bg-white p-2 shadow-card">
                    <div className="border-b border-ink-100 px-3 py-2">
                      <p className="truncate text-sm font-semibold text-ink-900">{profile?.full_name || 'User'}</p>
                      <p className="truncate text-xs text-ink-500">{user.email}</p>
                    </div>
                    <MenuItem to="/account" icon={<LayoutDashboard size={16} />} label="My Account" />
                    <MenuItem to="/account/orders" icon={<Package size={16} />} label="My Orders" />
                    <MenuItem to="/wishlist" icon={<Heart size={16} />} label="Wishlist" />
                    <button
                      onClick={() => { signOut(); navigate('/'); }}
                      className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="ml-1 hidden rounded-full bg-ink-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink-800 sm:inline-flex">
                Sign In
              </Link>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Menu"
              className="grid h-10 w-10 place-items-center rounded-full text-ink-700 hover:bg-ink-50 lg:hidden"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Live search dropdown */}
        {searchOpen && (
          <div className="border-t border-ink-100 bg-white">
            <div className="container-x py-4">
              <form onSubmit={submitSearch} className="relative mx-auto max-w-2xl">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  ref={searchRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search for t-shirts, sneakers, perfumes…"
                  className="input pl-11"
                />
                {q.length >= 2 && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-2 max-h-96 overflow-auto rounded-xl border border-ink-100 bg-white shadow-card">
                    {searching && <div className="p-4 text-sm text-ink-400">Searching…</div>}
                    {!searching && results.length === 0 && (
                      <div className="p-4 text-sm text-ink-400">No products found for "{q}"</div>
                    )}
                    {results.map((p) => (
                      <Link
                        key={p.id}
                        to={`/product/${p.slug}`}
                        onClick={() => { setSearchOpen(false); setQ(''); }}
                        className="flex items-center gap-3 border-b border-ink-50 p-3 hover:bg-ink-50"
                      >
                        <img src={p.primary_image_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-ink-900">{p.name}</p>
                          <p className="text-xs text-gold-600">{p.brand}</p>
                        </div>
                        <span className="text-sm font-bold text-ink-900">{formatINR(p.price)}</span>
                      </Link>
                    ))}
                    {results.length > 0 && (
                      <button onClick={submitSearch} className="w-full p-3 text-center text-sm font-semibold text-gold-600 hover:bg-ink-50">
                        See all results →
                      </button>
                    )}
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 max-w-[80%] animate-fade-in overflow-y-auto bg-white p-4 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-lg font-bold text-ink-900">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="text-ink-400"><X size={22} /></button>
            </div>
            <nav className="flex flex-col gap-1">
              {NAV.map((n) => (
                <Link key={n.to} to={n.to} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50">
                  {n.label}
                </Link>
              ))}
              <div className="my-2 h-px bg-ink-100" />
              <Link to="/wishlist" className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50">Wishlist</Link>
              <Link to="/cart" className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50">Cart</Link>
              <Link to="/about" className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50">About Us</Link>
              <Link to="/contact" className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50">Contact Us</Link>
              {!user && (
                <Link to="/login" className="btn-dark mt-3">Sign In</Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

function Dot({ count }: { count: number }) {
  return (
    <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-[20px] place-items-center rounded-full bg-gold-400 px-1 text-[10px] font-bold text-ink-950">
      {count > 99 ? '99+' : count}
    </span>
  );
}

function MenuItem({ to, icon, label, gold }: { to: string; icon: React.ReactNode; label: string; gold?: boolean }) {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-ink-50',
        gold ? 'text-gold-600' : 'text-ink-700'
      )}
    >
      {icon} {label}
    </Link>
  );
}
