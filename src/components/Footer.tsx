import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Instagram, Facebook, Twitter, Youtube, Phone, Mail, MapPin, Send,
} from 'lucide-react';
import { STORE } from '../lib/config';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

const COLS = [
  {
    title: 'Shop',
    links: [
      { label: 'All Products', to: '/shop' },
      { label: 'T-Shirts', to: '/category/t-shirts' },
      { label: 'Shirts', to: '/category/shirts' },
      { label: 'Pants', to: '/category/pants' },
      { label: 'Sneakers', to: '/category/sneakers' },
      { label: 'Perfumes', to: '/category/perfumes' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Contact Us', to: '/contact' },
      { label: 'Privacy Policy', to: '/privacy-policy' },
      { label: 'Return Policy', to: '/return-policy' },
      { label: 'Terms & Conditions', to: '/terms' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'My Account', to: '/account' },
      { label: 'My Orders', to: '/account/orders' },
      { label: 'Wishlist', to: '/wishlist' },
      { label: 'Cart', to: '/cart' },
      { label: 'Sign In', to: '/login' },
    ],
  },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    try {
      await supabase.from('newsletter_subscribers').insert({ email: email.trim().toLowerCase() });
      toast('Subscribed! Check your inbox for offers.');
      setEmail('');
    } catch (err: any) {
      toast(err.message?.includes('duplicate') ? 'You are already subscribed!' : 'Could not subscribe', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <footer className="mt-20 bg-ink-950 text-ink-300">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="container-x grid items-center gap-8 py-12 lg:grid-cols-2">
          <div>
            <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">Join the Harsh Circle</h3>
            <p className="mt-2 text-sm text-ink-400">Get early access to drops, exclusive offers & style tips. No spam, ever.</p>
          </div>
          <form onSubmit={subscribe} className="flex w-full max-w-md gap-2 lg:ml-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="w-full rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm text-white placeholder:text-ink-500 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/30"
            />
            <button disabled={busy} className="btn-gold shrink-0">
              <Send size={16} /> {busy ? '…' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>

      {/* Main */}
      <div className="container-x grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-400 font-display text-xl font-bold text-ink-950">H</span>
            <span className="font-display text-xl font-bold text-white">Harsh Trending Cloth</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-400">
            Premium fashion crafted for the modern man. From everyday essentials to statement pieces —
            discover quality that speaks for itself.
          </p>
          <div className="mt-5 space-y-2.5 text-sm">
            <a href={`tel:${STORE.phone}`} className="flex items-center gap-3 hover:text-gold-400">
              <Phone size={16} className="text-gold-400" /> {STORE.phone}
            </a>
            <a href={`mailto:${STORE.email}`} className="flex items-center gap-3 hover:text-gold-400">
              <Mail size={16} className="text-gold-400" /> {STORE.email}
            </a>
            <p className="flex items-start gap-3">
              <MapPin size={16} className="mt-0.5 shrink-0 text-gold-400" />
              <span>{STORE.address.line1}, {STORE.address.city}, {STORE.address.state} {STORE.address.pincode}</span>
            </p>
          </div>
          <div className="mt-5 flex gap-3">
            {[
              { Icon: Instagram, href: STORE.social.instagram },
              { Icon: Facebook, href: STORE.social.facebook },
              { Icon: Twitter, href: STORE.social.twitter },
              { Icon: Youtube, href: STORE.social.youtube },
            ].map(({ Icon, href }, i) => (
              <a key={i} href={href} target="_blank" rel="noreferrer"
                className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-ink-300 transition hover:border-gold-400 hover:bg-gold-400 hover:text-ink-950">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {COLS.map((col) => (
          <div key={col.title}>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-gold-400">{col.title}</h4>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-ink-400 transition hover:text-white">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-ink-500 sm:flex-row">
          <p>© {new Date().getFullYear()} {STORE.name}. All rights reserved.</p>
          <p className="flex items-center gap-2">
            Crafted with <span className="text-gold-400">◆</span> in Ghaziabad, India
          </p>
        </div>
      </div>
    </footer>
  );
}
