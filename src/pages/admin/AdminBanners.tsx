import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, X, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { Modal, Spinner, EmptyState } from '../../components/ui';
import type { Banner } from '../../lib/types';

const EMPTY = { title: '', subtitle: '', image_url: '', cta_text: 'Shop Now', cta_link: '/shop', position: 1, is_active: true };

export function AdminBanners() {
  const { toast } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('banners').select('*').order('position', { ascending: true });
    setBanners(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (b: Banner) => {
    setEditing(b);
    setForm({ title: b.title, subtitle: b.subtitle || '', image_url: b.image_url, cta_text: b.cta_text || 'Shop Now', cta_link: b.cta_link || '/shop', position: b.position, is_active: b.is_active });
    setModal(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, position: Number(form.position) };
      if (editing) { await supabase.from('banners').update(payload).eq('id', editing.id); toast('Banner updated'); }
      else { await supabase.from('banners').insert(payload); toast('Banner added'); }
      setModal(false); await load();
    } catch (err: any) { toast(err.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await supabase.from('banners').delete().eq('id', deleteId);
    setDeleteId(null); await load(); toast('Banner deleted');
  };

  const toggleActive = async (b: Banner) => {
    await supabase.from('banners').update({ is_active: !b.is_active }).eq('id', b.id);
    await load();
  };

  if (loading) return <div className="flex justify-center py-12"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl font-bold text-ink-900">Banners</h1><p className="text-sm text-ink-500">{banners.length} banners · {banners.filter((b) => b.is_active).length} active</p></div>
        <button onClick={openAdd} className="btn-gold py-2"><Plus size={16} /> Add Banner</button>
      </div>

      {banners.length === 0 ? <EmptyState icon={<ImageIcon size={40} />} title="No banners yet" action={<button onClick={openAdd} className="btn-gold">Add Banner</button>} /> : (
        <div className="grid gap-4 sm:grid-cols-2">
          {banners.map((b) => (
            <div key={b.id} className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
              <div className="relative aspect-video bg-ink-100">
                <img src={b.image_url} alt="" className="h-full w-full object-cover" />
                <div className="absolute left-3 top-3 flex gap-2">
                  <span className="chip bg-ink-900/80 text-white text-[10px]">#{b.position}</span>
                  {b.is_active ? <span className="chip-green text-[10px]">Active</span> : <span className="chip bg-ink-100 text-ink-500 text-[10px]">Hidden</span>}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-ink-900">{b.title}</h3>
                <p className="text-sm text-ink-500">{b.subtitle}</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => openEdit(b)} className="btn-outline py-1.5 text-xs"><Edit2 size={13} /> Edit</button>
                  <button onClick={() => toggleActive(b)} className="btn-ghost py-1.5 text-xs">{b.is_active ? <><EyeOff size={13} /> Hide</> : <><Eye size={13} /> Show</>}</button>
                  <button onClick={() => setDeleteId(b.id)} className="ml-auto grid h-8 w-8 place-items-center rounded-full text-ink-400 hover:bg-red-50 hover:text-red-500"><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Banner' : 'Add Banner'}>
        <form onSubmit={save} className="space-y-4">
          <div><label className="label">Title</label><input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><label className="label">Subtitle</label><input className="input" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></div>
          <div><label className="label">Image URL</label><input required className="input" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://…" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">CTA Text</label><input className="input" value={form.cta_text} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} /></div>
            <div><label className="label">CTA Link</label><input className="input" value={form.cta_link} onChange={(e) => setForm({ ...form, cta_link: e.target.value })} /></div>
            <div><label className="label">Position</label><input type="number" className="input" value={form.position} onChange={(e) => setForm({ ...form, position: Number(e.target.value) })} /></div>
            <div><label className="label">Active</label><label className="flex h-12 items-center gap-2"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-gold-500" /> Show on site</label></div>
          </div>
          <div className="flex gap-2 pt-2">
            <button disabled={saving} className="btn-gold flex-1">{saving ? 'Saving…' : 'Save Banner'}</button>
            <button type="button" onClick={() => setModal(false)} className="btn-ghost"><X size={16} /></button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Banner?" maxWidth="max-w-sm">
        <p className="text-sm text-ink-600">This banner will be permanently removed.</p>
        <div className="mt-5 flex gap-2">
          <button onClick={confirmDelete} className="btn bg-red-600 text-white hover:bg-red-700 flex-1">Delete</button>
          <button onClick={() => setDeleteId(null)} className="btn-ghost flex-1">Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
