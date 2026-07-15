import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Ticket, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../lib/config';
import { Modal, Spinner, EmptyState } from '../../components/ui';
import type { Coupon } from '../../lib/types';

const EMPTY = {
  code: '', description: '', discount_type: 'flat' as 'flat' | 'percent',
  discount_value: 0, min_order: 0, max_discount: 0, usage_limit: 100, is_active: true,
};

export function AdminCoupons() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    setCoupons(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm({ code: c.code, description: c.description || '', discount_type: c.discount_type, discount_value: c.discount_value, min_order: c.min_order, max_discount: c.max_discount, usage_limit: c.usage_limit, is_active: c.is_active });
    setModal(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, code: form.code.toUpperCase(), discount_value: Number(form.discount_value), min_order: Number(form.min_order), max_discount: Number(form.max_discount), usage_limit: Number(form.usage_limit) };
      if (editing) { await supabase.from('coupons').update(payload).eq('id', editing.id); toast('Coupon updated'); }
      else { await supabase.from('coupons').insert(payload); toast('Coupon created'); }
      setModal(false); await load();
    } catch (err: any) { toast(err.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await supabase.from('coupons').delete().eq('id', deleteId);
    setDeleteId(null); await load(); toast('Coupon deleted');
  };

  if (loading) return <div className="flex justify-center py-12"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl font-bold text-ink-900">Coupons</h1><p className="text-sm text-ink-500">{coupons.length} coupons</p></div>
        <button onClick={openAdd} className="btn-gold py-2"><Plus size={16} /> Add Coupon</button>
      </div>

      {coupons.length === 0 ? <EmptyState icon={<Ticket size={40} />} title="No coupons yet" action={<button onClick={openAdd} className="btn-gold">Add Coupon</button>} /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.map((c) => (
            <div key={c.id} className="rounded-2xl border border-ink-100 bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="chip-dark text-sm">{c.code}</span>
                  <p className="mt-2 text-sm text-ink-600">{c.description || '—'}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(c)} className="grid h-8 w-8 place-items-center rounded-full text-ink-400 hover:bg-gold-50 hover:text-gold-600"><Edit2 size={15} /></button>
                  <button onClick={() => setDeleteId(c.id)} className="grid h-8 w-8 place-items-center rounded-full text-ink-400 hover:bg-red-50 hover:text-red-500"><Trash2 size={15} /></button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-ink-100 pt-3 text-sm">
                <div><p className="text-xs text-ink-400">Discount</p><p className="font-semibold text-ink-900">{c.discount_type === 'percent' ? `${c.discount_value}%` : formatINR(c.discount_value)}</p></div>
                <div><p className="text-xs text-ink-400">Min Order</p><p className="font-semibold text-ink-900">{formatINR(c.min_order)}</p></div>
                <div><p className="text-xs text-ink-400">Used</p><p className="font-semibold text-ink-900">{c.used_count}/{c.usage_limit}</p></div>
                <div><p className="text-xs text-ink-400">Status</p><span className={c.is_active ? 'chip-green text-[10px]' : 'chip bg-ink-100 text-ink-500 text-[10px]'}>{c.is_active ? 'Active' : 'Inactive'}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Coupon' : 'Add Coupon'}>
        <form onSubmit={save} className="space-y-4">
          <div><label className="label">Code</label><input required className="input uppercase" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="SAVE20" /></div>
          <div><label className="label">Description</label><input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Type</label><select className="input" value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value as any })}><option value="flat">Flat (₹)</option><option value="percent">Percent (%)</option></select></div>
            <div><label className="label">Value</label><input type="number" required className="input" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} /></div>
            <div><label className="label">Min Order (₹)</label><input type="number" className="input" value={form.min_order} onChange={(e) => setForm({ ...form, min_order: Number(e.target.value) })} /></div>
            <div><label className="label">Max Discount (₹)</label><input type="number" className="input" value={form.max_discount} onChange={(e) => setForm({ ...form, max_discount: Number(e.target.value) })} /></div>
            <div><label className="label">Usage Limit</label><input type="number" className="input" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: Number(e.target.value) })} /></div>
            <div><label className="label">Active</label><label className="flex h-12 items-center gap-2"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-gold-500" /> Active</label></div>
          </div>
          <div className="flex gap-2 pt-2">
            <button disabled={saving} className="btn-gold flex-1">{saving ? 'Saving…' : 'Save Coupon'}</button>
            <button type="button" onClick={() => setModal(false)} className="btn-ghost"><X size={16} /></button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Coupon?" maxWidth="max-w-sm">
        <p className="text-sm text-ink-600">This coupon will be permanently removed.</p>
        <div className="mt-5 flex gap-2">
          <button onClick={confirmDelete} className="btn bg-red-600 text-white hover:bg-red-700 flex-1">Delete</button>
          <button onClick={() => setDeleteId(null)} className="btn-ghost flex-1">Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
