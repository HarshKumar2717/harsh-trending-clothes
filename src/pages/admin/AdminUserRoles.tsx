import { useEffect, useState, useCallback } from 'react';
import { Search, ShieldCheck, AlertTriangle, Loader2, Mail, Phone, User as UserIcon, Crown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal, Spinner, EmptyState } from '../../components/ui';
import { formatDate, initials } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import type { Profile } from '../../lib/types';

type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: Role;
  created_at: string;
}

const ROLE_STYLE: Record<Role, string> = {
  USER: 'bg-ink-100 text-ink-600',
  ADMIN: 'bg-blue-100 text-blue-700',
  SUPER_ADMIN: 'bg-gold-100 text-gold-700',
};

export function AdminUserRoles() {
  const { user: me } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [confirm, setConfirm] = useState<{ user: AdminUser; newRole: Role } | null>(null);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const r = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-roles`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (!r.ok) throw new Error('Failed to load users');
      const { users: list } = await r.json();
      setUsers(list || []);
    } catch (err: any) {
      toast(err.message || 'Could not load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter((u) => {
    const s = q.toLowerCase();
    return u.email.toLowerCase().includes(s) || (u.phone || '').includes(q) || (u.full_name || '').toLowerCase().includes(s);
  });

  const startRoleChange = (u: AdminUser, newRole: Role) => {
    if (u.id === me?.id) { toast('You cannot change your own role', 'error'); return; }
    setConfirm({ user: u, newRole });
  };

  const confirmRoleChange = async () => {
    if (!confirm) return;
    setUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const r = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ targetUserId: confirm.user.id, newRole: confirm.newRole }),
      });
      const body = await r.json();
      if (!r.ok) throw new Error(body.error || 'Update failed');
      setUsers((us) => us.map((u) => u.id === confirm.user.id ? { ...u, role: confirm.newRole } : u));
      toast(`${confirm.user.email} is now ${confirm.newRole}`);
      setConfirm(null);
    } catch (err: any) {
      toast(err.message || 'Could not update role', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Manage User Roles</h1>
        <p className="text-sm text-ink-500">Search users and assign roles. Role changes are validated server-side.</p>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by email, phone or name…" className="input pl-9 py-2" />
      </div>

      {/* Role legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        <span className="chip bg-ink-100 text-ink-600">USER — Customer access</span>
        <span className="chip bg-blue-100 text-blue-700">ADMIN — Staff access</span>
        <span className="chip bg-gold-100 text-gold-700"><Crown size={11} /> SUPER_ADMIN — Full access</span>
      </div>

      {filtered.length === 0 ? <EmptyState title="No users found" subtitle="Try a different search." /> : (
        <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-100 bg-ink-50/50 text-left text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Current Role</th>
                <th className="px-4 py-3">Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-ink-50/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-ink-900 text-xs font-bold text-gold-400">{initials(u.full_name)}</span>
                      <div><p className="font-medium text-ink-900">{u.full_name || 'Unnamed'}</p>{u.id === me?.id && <p className="text-[10px] text-gold-600">You</p>}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="flex items-center gap-1.5 text-xs text-ink-600"><Mail size={12} /> {u.email}</p>
                    {u.phone && <p className="flex items-center gap-1.5 text-xs text-ink-400"><Phone size={12} /> {u.phone}</p>}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-500">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3"><span className={`chip text-[10px] ${ROLE_STYLE[u.role]}`}>{u.role}</span></td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      disabled={u.id === me?.id}
                      onChange={(e) => startRoleChange(u, e.target.value as Role)}
                      className="input w-auto py-1.5 text-xs disabled:opacity-50"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation modal */}
      <Modal open={!!confirm} onClose={() => setConfirm(null)} title="Confirm Role Change" maxWidth="max-w-md">
        {confirm && (
          <div className="space-y-4">
            <div className={`rounded-xl border p-4 ${confirm.newRole === 'SUPER_ADMIN' ? 'border-gold-300 bg-gold-50' : 'border-ink-200 bg-ink-50'}`}>
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-ink-900 font-bold text-gold-400">{initials(confirm.user.full_name)}</span>
                <div><p className="font-semibold text-ink-900">{confirm.user.full_name || 'Unnamed'}</p><p className="text-xs text-ink-500">{confirm.user.email}</p></div>
              </div>
              <div className="mt-3 flex items-center justify-center gap-3 text-sm">
                <span className={`chip ${ROLE_STYLE[confirm.user.role]}`}>{confirm.user.role}</span>
                <span className="text-ink-400">→</span>
                <span className={`chip ${ROLE_STYLE[confirm.newRole]}`}>{confirm.newRole}</span>
              </div>
            </div>
            {confirm.newRole === 'SUPER_ADMIN' && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <span><strong>Warning:</strong> This will grant full Super Admin access, including the ability to manage other users and change roles. Proceed with caution.</span>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={confirmRoleChange} disabled={updating} className="btn-gold flex-1">
                {updating ? <><Loader2 size={16} className="animate-spin" /> Updating…</> : <><ShieldCheck size={16} /> Confirm Change</>}
              </button>
              <button onClick={() => setConfirm(null)} className="btn-ghost flex-1">Cancel</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
