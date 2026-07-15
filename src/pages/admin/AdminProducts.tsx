import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, X, Package, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { fetchCategories } from '../../lib/api';
import { slugify, downloadFile, toCSV } from '../../lib/utils';
import { formatINR } from '../../lib/config';
import { Modal, Spinner, EmptyState } from '../../components/ui';
import type { Product, Category } from '../../lib/types';

const EMPTY = {
  name: '', slug: '', description: '', price: 0, mrp: 0, stock: 0, low_stock_threshold: 10,
  category_id: '', brand: '', rating: 4.0, rating_count: 0,
  is_featured: false, is_trending: false, is_best_seller: false, is_new: true,
  primary_image_url: '', badges: '',
};

export function AdminProducts() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: p }, cats] = await Promise.all([
      supabase.from('products').select('*, category:categories(*)').order('created_at', { ascending: false }),
      fetchCategories(),
    ]);
    setProducts(p || []);
    setCategories(cats);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(q.toLowerCase()) &&
    (!filterCat || p.category_id === filterCat)
  );

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY, category_id: categories[0]?.id || '' });
    setModal(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, slug: p.slug, description: p.description || '', price: p.price, mrp: p.mrp || 0,
      stock: p.stock, low_stock_threshold: p.low_stock_threshold, category_id: p.category_id || '',
      brand: p.brand || '', rating: Number(p.rating), rating_count: p.rating_count,
      is_featured: p.is_featured, is_trending: p.is_trending, is_best_seller: p.is_best_seller, is_new: p.is_new,
      primary_image_url: p.primary_image_url, badges: p.badges.join(', '),
    });
    setModal(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        description: form.description,
        price: Number(form.price),
        mrp: Number(form.mrp) || null,
        stock: Number(form.stock),
        low_stock_threshold: Number(form.low_stock_threshold),
        category_id: form.category_id || null,
        brand: form.brand,
        rating: Number(form.rating),
        rating_count: Number(form.rating_count),
        is_featured: form.is_featured, is_trending: form.is_trending,
        is_best_seller: form.is_best_seller, is_new: form.is_new,
        primary_image_url: form.primary_image_url,
        badges: form.badges.split(',').map((b) => b.trim()).filter(Boolean),
      };
      if (editing) {
        await supabase.from('products').update(payload).eq('id', editing.id);
        toast('Product updated');
      } else {
        await supabase.from('products').insert(payload);
        toast('Product added');
      }
      setModal(false);
      await load();
    } catch (err: any) { toast(err.message || 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await supabase.from('products').delete().eq('id', deleteId);
    setDeleteId(null);
    await load();
    toast('Product deleted');
  };

  const exportCSV = () => {
    const rows = filtered.map((p) => ({
      name: p.name, brand: p.brand, price: p.price, mrp: p.mrp, stock: p.stock,
      category: p.category?.name, rating: p.rating, rating_count: p.rating_count,
    }));
    downloadFile('products.csv', toCSV(rows), 'text/csv');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Products</h1>
          <p className="text-sm text-ink-500">{products.length} products · {products.filter((p) => p.stock <= p.low_stock_threshold).length} low stock</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-outline py-2 text-xs">Export CSV</button>
          <button onClick={openAdd} className="btn-gold py-2"><Plus size={16} /> Add Product</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="input pl-9 py-2" />
        </div>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="input w-auto py-2">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {loading ? <div className="flex justify-center py-12"><Spinner /></div> :
       filtered.length === 0 ? <EmptyState icon={<Package size={40} />} title="No products" action={<button onClick={openAdd} className="btn-gold">Add Product</button>} /> : (
        <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-100 bg-ink-50/50 text-left text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Flags</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-ink-50/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.primary_image_url} alt="" className="h-12 w-10 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink-900">{p.name}</p>
                        <p className="text-xs text-ink-400">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-600">{p.category?.name || '—'}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink-900">{formatINR(p.price)}</p>
                    {p.mrp && p.mrp > p.price && <p className="text-xs text-ink-400 line-through">{formatINR(p.mrp)}</p>}
                  </td>
                  <td className="px-4 py-3">
                    {p.stock === 0 ? <span className="chip-red text-[10px]">Out</span> :
                     p.stock <= p.low_stock_threshold ? <span className="chip bg-amber-100 text-amber-700 text-[10px]"><AlertTriangle size={10} /> {p.stock}</span> :
                     <span className="chip-green text-[10px]">{p.stock}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.is_featured && <span className="chip bg-blue-100 text-blue-700 text-[10px]">Featured</span>}
                      {p.is_trending && <span className="chip bg-gold-100 text-gold-700 text-[10px]">Trending</span>}
                      {p.is_best_seller && <span className="chip bg-emerald-100 text-emerald-700 text-[10px]">Best</span>}
                      {p.is_new && <span className="chip bg-purple-100 text-purple-700 text-[10px]">New</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="grid h-8 w-8 place-items-center rounded-full text-ink-400 hover:bg-gold-50 hover:text-gold-600"><Edit2 size={15} /></button>
                      <button onClick={() => setDeleteId(p.id)} className="grid h-8 w-8 place-items-center rounded-full text-ink-400 hover:bg-red-50 hover:text-red-500"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Product' : 'Add Product'} maxWidth="max-w-2xl">
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><label className="label">Name</label><input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })} /></div>
          <div><label className="label">Slug</label><input className="input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
          <div><label className="label">Brand</label><input className="input" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="label">Description</label><textarea rows={2} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><label className="label">Price (₹)</label><input type="number" required className="input" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
          <div><label className="label">MRP (₹)</label><input type="number" className="input" value={form.mrp} onChange={(e) => setForm({ ...form, mrp: Number(e.target.value) })} /></div>
          <div><label className="label">Stock</label><input type="number" required className="input" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></div>
          <div><label className="label">Low Stock Threshold</label><input type="number" className="input" value={form.low_stock_threshold} onChange={(e) => setForm({ ...form, low_stock_threshold: Number(e.target.value) })} /></div>
          <div><label className="label">Category</label>
            <select className="input" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
              <option value="">— None —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label className="label">Image URL</label><input className="input" value={form.primary_image_url} onChange={(e) => setForm({ ...form, primary_image_url: e.target.value })} placeholder="https://…" /></div>
          <div className="sm:col-span-2"><label className="label">Badges (comma separated)</label><input className="input" value={form.badges} onChange={(e) => setForm({ ...form, badges: e.target.value })} placeholder="Bestseller, Oversized" /></div>
          <div className="sm:col-span-2">
            <label className="label">Flags</label>
            <div className="flex flex-wrap gap-4">
              {([['is_featured', 'Featured'], ['is_trending', 'Trending'], ['is_best_seller', 'Best Seller'], ['is_new', 'New']] as const).map(([k, l]) => (
                <label key={k} className="flex items-center gap-2 text-sm text-ink-700">
                  <input type="checkbox" checked={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.checked })} className="accent-gold-500" /> {l}
                </label>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2 flex gap-2 pt-2">
            <button disabled={saving} className="btn-gold flex-1">{saving ? 'Saving…' : 'Save Product'}</button>
            <button type="button" onClick={() => setModal(false)} className="btn-ghost"><X size={16} /> Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Product?" maxWidth="max-w-sm">
        <p className="text-sm text-ink-600">This action cannot be undone. The product will be permanently removed.</p>
        <div className="mt-5 flex gap-2">
          <button onClick={confirmDelete} className="btn bg-red-600 text-white hover:bg-red-700 flex-1">Delete</button>
          <button onClick={() => setDeleteId(null)} className="btn-ghost flex-1">Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
