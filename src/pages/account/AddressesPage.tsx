import { useEffect, useState } from 'react';
import { Plus, MapPin, Trash2, Edit2, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { supabase } from '../../lib/supabase';
import type { Address } from '../../lib/types';
import { Spinner, EmptyState } from '../../components/ui';
import { cn } from '../../lib/utils';

const EMPTY = { label: 'Home', full_name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' };

export function AddressesPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false });
    setAddresses(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);
  useEffect(() => { if (showForm && !editing) setForm((f) => ({ ...f, full_name: profile?.full_name || '', phone: profile?.phone || '' })); }, [showForm, editing, profile]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      if (editing) {
        await supabase.from('addresses').update(form).eq('id', editing);
      } else {
        await supabase.from('addresses').insert({ ...form, user_id: user.id });
      }
      await load();
      setShowForm(false); setEditing(null); setForm(EMPTY);
      toast('Address saved');
    } catch (err: any) { toast(err.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const edit = (a: Address) => {
    setEditing(a.id);
    setForm({ label: a.label, full_name: a.full_name, phone: a.phone, line1: a.line1, line2: a.line2 || '', city: a.city, state: a.state, pincode: a.pincode });
    setShowForm(true);
  };

  const remove = async (id: string) => {
    await supabase.from('addresses').delete().eq('id', id);
    await load();
    toast('Address removed');
  };

  const setDefault = async (id: string) => {
    if (!user) return;
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
    await supabase.from('addresses').update({ is_default: true }).eq('id', id);
    await load();
    toast('Default address updated');
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink-900">Saved Addresses</h1>
        {!showForm && (
          <button onClick={() => { setEditing(null); setForm(EMPTY); setShowForm(true); }} className="btn-gold py-2">
            <Plus size={16} /> Add New
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={save} className="rounded-2xl border border-gold-200 bg-gold-50/50 p-6">
          <h2 className="mb-4 font-semibold text-ink-900">{editing ? 'Edit Address' : 'Add New Address'}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">Label</label><input className="input" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} /></div>
            <div><label className="label">Full Name</label><input required className="input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
            <div><label className="label">Phone</label><input required className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><label className="label">Pincode</label><input required className="input" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label">Address Line 1</label><input required className="input" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label">Address Line 2</label><input className="input" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} /></div>
            <div><label className="label">City</label><input required className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
            <div><label className="label">State</label><input required className="input" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></div>
          </div>
          <div className="mt-4 flex gap-2">
            <button disabled={saving} className="btn-gold">{saving ? 'Saving…' : 'Save Address'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-ghost"><X size={16} /> Cancel</button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !showForm ? (
        <EmptyState icon={<MapPin size={48} />} title="No saved addresses" subtitle="Add a shipping address for faster checkout."
          action={<button onClick={() => setShowForm(true)} className="btn-gold"><Plus size={16} /> Add Address</button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a.id} className={cn('rounded-2xl border bg-white p-5', a.is_default ? 'border-gold-300' : 'border-ink-100')}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="chip bg-ink-100 text-ink-600">{a.label}</span>
                  {a.is_default && <span className="chip-gold">Default</span>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => edit(a)} className="grid h-8 w-8 place-items-center rounded-full text-ink-400 hover:bg-ink-50 hover:text-gold-600"><Edit2 size={15} /></button>
                  <button onClick={() => remove(a.id)} className="grid h-8 w-8 place-items-center rounded-full text-ink-400 hover:bg-red-50 hover:text-red-500"><Trash2 size={15} /></button>
                </div>
              </div>
              <p className="mt-3 font-semibold text-ink-900">{a.full_name}</p>
              <p className="text-sm text-ink-600">{a.line1}{a.line2 ? ', ' + a.line2 : ''}</p>
              <p className="text-sm text-ink-600">{a.city}, {a.state} {a.pincode}</p>
              <p className="text-sm text-ink-500">Phone: {a.phone}</p>
              {!a.is_default && (
                <button onClick={() => setDefault(a.id)} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-gold-600 hover:underline">
                  <Check size={14} /> Set as default
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
