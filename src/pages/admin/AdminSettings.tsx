import { ShieldCheck, Database, Mail, Phone, MapPin, Server, Lock } from 'lucide-react';
import { STORE } from '../../lib/config';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../lib/utils';

export function AdminSettings() {
  const { profile, user } = useAuth();

  const cards = [
    { icon: ShieldCheck, title: 'Authentication', items: [
      ['Method', 'Email / Password (Supabase Auth)'],
      ['Session', 'JWT-based, auto-refresh'],
      ['Role enforcement', 'DB RLS + Edge Function + Frontend'],
    ]},
    { icon: Lock, title: 'Security', items: [
      ['Self-role-change', 'Blocked (DB trigger + API check)'],
      ['Admin route access', 'SUPER_ADMIN only (403 on violation)'],
      ['RLS on profiles', 'Owner read/write, admin override'],
    ]},
    { icon: Server, title: 'Backend', items: [
      ['Database', 'Supabase PostgreSQL'],
      ['Edge Functions', 'user-roles (role management)'],
      ['Storage', 'avatars bucket (public read)'],
    ]},
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">System Settings</h1>
        <p className="text-sm text-ink-500">Platform configuration and security overview.</p>
      </div>

      {/* Admin profile card */}
      <div className="rounded-2xl border border-ink-100 bg-white p-6">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ink-950 font-display text-xl font-bold text-gold-400">
            {(profile?.full_name?.[0] || 'A').toUpperCase()}
          </span>
          <div>
            <p className="font-semibold text-ink-900">{profile?.full_name || 'Super Admin'}</p>
            <p className="text-sm text-ink-500">{profile?.email}</p>
            <span className="chip-gold mt-1 text-[10px]">{profile?.role}</span>
          </div>
          <div className="ml-auto text-right text-sm text-ink-400">
            <p>Account ID</p>
            <p className="font-mono text-xs">{user?.id?.slice(0, 8)}…</p>
            <p className="mt-1">Joined {profile && formatDate(profile.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Configuration cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.title} className="rounded-2xl border border-ink-100 bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-gold-100 text-gold-600"><c.icon size={18} /></span>
              <h2 className="font-semibold text-ink-900">{c.title}</h2>
            </div>
            <div className="space-y-2.5">
              {c.items.map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-ink-500">{k}</span>
                  <span className="text-right font-medium text-ink-800">{v}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Business info */}
      <div className="rounded-2xl border border-ink-100 bg-white p-6">
        <h2 className="mb-4 font-display text-lg font-bold text-ink-900">Business Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3"><Mail size={18} className="text-gold-600" /><span className="text-sm text-ink-700">{STORE.email}</span></div>
          <div className="flex items-center gap-3"><Phone size={18} className="text-gold-600" /><span className="text-sm text-ink-700">{STORE.phone}</span></div>
          <div className="flex items-start gap-3 sm:col-span-2"><MapPin size={18} className="mt-0.5 text-gold-600" /><span className="text-sm text-ink-700">{STORE.address.line1}, {STORE.address.city}, {STORE.address.state} {STORE.address.pincode}</span></div>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="flex items-center gap-2 text-sm text-emerald-700"><Database size={16} /> System operational. All security policies active.</p>
      </div>
    </div>
  );
}
