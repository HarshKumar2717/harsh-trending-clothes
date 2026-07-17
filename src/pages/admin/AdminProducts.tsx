import { useEffect, useState } from 'react';
import {
  Plus, Edit2, Trash2, Search, X, Package, AlertTriangle, Upload,
  ImageIcon, ToggleLeft, ToggleRight, Banknote,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { fetchCategories } from '../../lib/api';
import { slugify, downloadFile, toCSV } from '../../lib/utils';
import { formatINR } from '../../lib/config';
import { Modal, Spinner, EmptyState } from '../../components/ui';
import type { Product, Category, ProductImage } from '../../lib/types';
import { cn } from '../../lib/utils';

const EMPTY = {
  name: '', slug: '', description: '', price: 0, mrp: 0, stock: 0, low_stock_threshold: 10,
  category_id: '', brand: '', rating: 4.0, rating_count: 0,
  is_featured: false, is_trending: false, is_best_seller: false, is_new: true,
  primary_image_url: '', badges: '', colors: '', sizes: '', discount: 0, cod_available: true,
};

const SUGGESTED_SIZES = ['S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', '36', '38', '6', '7', '8', '9', '10', '11', '50ml', '75ml', '100ml', '120ml', '150ml'];

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
  const [images, setImages] = useState<ProductImage[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

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

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(q.toLowerCase()) &&
      (!filterCat || p.category_id === filterCat)
  );
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY, category_id: categories[0]?.id || '' });
    setImages([]);
    setModal(true);
  };

  const openEdit = async (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, slug: p.slug, description: p.description || '', price: p.price, mrp: p.mrp || 0,
      stock: p.stock, low_stock_threshold: p.low_stock_threshold, category_id: p.category_id || '',
      brand: p.brand || '', rating: Number(p.rating), rating_count: p.rating_count,
      is_featured: p.is_featured, is_trending: p.is_trending, is_best_seller: p.is_best_seller, is_new: p.is_new,
      primary_image_url: p.primary_image_url, badges: p.badges.join(', '),
      colors: p.colors.join(', '), sizes: p.sizes.join(', '), discount: p.discount, cod_available: p.cod_available,
    });
    const { data: imgs } = await supabase.from('product_images').select('*').eq('product_id', p.id).order('position');
    setImages(imgs || []);
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
        colors: form.colors.split(',').map((c) => c.trim()).filter(Boolean),
        sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
        discount: Number(form.discount),
        cod_available: form.cod_available,
      };
      if (editing) {
        const { error } = await supabase.from('products').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast('Product updated');
      } else {
        const { data, error } = await supabase.from('products').insert(payload).select().single();
        if (error) throw error;
        if (form.primary_image_url) {
          await supabase.from('product_images').insert({ product_id: data.id, image_url: form.primary_image_url, position: 0 });
        }
        toast('Product added');
      }
      setModal(false);
      await load();
    } catch (err: any) { toast(err.message || 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('products').delete().eq('id', deleteId);
    if (error) { toast(error.message, 'error'); return; }
    setDeleteId(null);
    await load();
    toast('Product deleted');
  };

  const toggleStock = async (p: Product) => {
    const newStock = p.stock > 0 ? 0 : 10;
    const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', p.id);
    if (error) { toast(error.message, 'error'); return; }
    await load();
    toast(newStock === 0 ? 'Marked as Out of Stock' : 'Marked as In Stock');
  };

  const toggleCOD = async (p: Product) => {
    const { error } = await supabase.from('products').update({ cod_available: !p.cod_available }).eq('id', p.id);
    if (error) { toast(error.message, 'error'); return; }
    await load();
    toast(`COD ${!p.cod_available ? 'enabled' : 'disabled'}`);
  };

  const addImage = async () => {
    if (!editing || !newImageUrl.trim()) return;
    const { data, error } = await supabase
      .from('product_images')
      .insert({ product_id: editing.id, image_url: newImageUrl.trim(), position: images.length })
      .select()
      .single();
    if (error) { toast(error.message, 'error'); return; }
    setImages((prev) => [...prev, data]);
    setNewImageUrl('');
    toast('Image added');
  };

  const removeImage = async (imgId: string) => {
    const { error } = await supabase.from('product_images').delete().eq('id', imgId);
    if (error) { toast(error.message, 'error'); return; }
    setImages((prev) => prev.filter((i) => i.id !== imgId));
    toast('Image removed');
  };

  const exportCSV = () => {
    const rows = filtered.map((p) => ({
      name: p.name, brand: p.brand, price: p.price, mrp: p.mrp, stock: p.stock,
      category: p.category?.name, rating: p.rating, rating_count: p.rating_count,
      colors: p.colors.join(';'), sizes: p.sizes.join(';'), discount: p.discount,
    }));
    downloadFile('products.csv', toCSV(rows), 'text/csv');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Inventory Management</h1>
          <p className="text-sm text-ink-500">{products.length} products · {products.filter((p) => p.stock <= p.low_stock_threshold).length} low stock · {products.filter((p) => p.stock === 0).length} out of stock</p>
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
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search products…" className="input pl-9 py-2" />
        </div>
        <select value={filterCat} onChange={(e) => { setFilterCat(e.target.value); setPage(1); }} className="input w-auto py-2">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {loading ? <div className="flex justify-center py-12"><Spinner /></div> :
       paginated.length === 0 ? <EmptyState icon={<Package size={40} />} title="No products" action={<button onClick={openAdd} className="btn-gold">Add Product</button>} /> : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-ink-100 bg-ink-50/50 text-left text-xs uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">COD</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {paginated.map((p) => (
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
                      <button onClick={() => toggleCOD(p)} className={cn('transition', p.cod_available ? 'text-gold-600' : 'text-ink-300')}>
                        {p.cod_available ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => toggleStock(p)} title={p.stock > 0 ? 'Mark out of stock' : 'Mark in stock'} className="grid h-8 w-8 place-items-center rounded-full text-ink-400 hover:bg-ink-50 hover:text-ink-700">
                          {p.stock > 0 ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>
                        <button onClick={() => openEdit(p)} className="grid h-8 w-8 place-items-center rounded-full text-ink-400 hover:bg-gold-50 hover:text-gold-600"><Edit2 size={15} /></button>
                        <button onClick={() => setDeleteId(p.id)} className="grid h-8 w-8 place-items-center rounded-full text-ink-400 hover:bg-red-50 hover:text-red-500"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="btn-outline px-3 py-1.5 text-sm disabled:opacity-40">Prev</button>
              <span className="text-sm text-ink-500">Page {page} of {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="btn-outline px-3 py-1.5 text-sm disabled:opacity-40">Next</button>
            </div>
          )}
        </>
      )}

      {/* Add/Edit modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Product' : 'Add Product'} maxWidth="max-w-2xl">
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><label className="label">Name</label><input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })} /></div>
          <div><label className="label">Slug</label><input className="input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
          <div><label className="label">Brand</label><input className="input" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="label">Description</label><textarea rows={2} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><label className="label">Price (Rs)</label><input type="number" required className="input" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
          <div><label className="label">MRP (Rs)</label><input type="number" className="input" value={form.mrp} onChange={(e) => setForm({ ...form, mrp: Number(e.target.value) })} /></div>
          <div><label className="label">Discount (%)</label><input type="number" min={0} max={100} className="input" value={form.discount} onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })} /></div>
          <div><label className="label">Stock</label><input type="number" required className="input" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></div>
          <div><label className="label">Low Stock Threshold</label><input type="number" className="input" value={form.low_stock_threshold} onChange={(e) => setForm({ ...form, low_stock_threshold: Number(e.target.value) })} /></div>
          <div><label className="label">Category</label>
            <select className="input" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
              <option value="">— None —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label className="label">Primary Image URL</label><input className="input" value={form.primary_image_url} onChange={(e) => setForm({ ...form, primary_image_url: e.target.value })} placeholder="https://…" /></div>
          <div className="sm:col-span-2"><label className="label">Colors (comma separated)</label><input className="input" value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} placeholder="Black, White, Navy" /></div>
          <div className="sm:col-span-2">
            <label className="label">Sizes (comma separated)</label>
            <input className="input" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} placeholder="S, M, L, XL" />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SUGGESTED_SIZES.map((s) => (
                <button key={s} type="button" onClick={() => {
                  const current = form.sizes.split(',').map((x) => x.trim()).filter(Boolean);
                  if (!current.includes(s)) setForm({ ...form, sizes: [...current, s].join(', ') });
                }} className="rounded-md border border-ink-200 px-2 py-0.5 text-xs text-ink-500 hover:border-gold-400 hover:text-gold-600">
                  + {s}
                </button>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2"><label className="label">Badges (comma separated)</label><input className="input" value={form.badges} onChange={(e) => setForm({ ...form, badges: e.target.value })} placeholder="Bestseller, Oversized" /></div>
          <div className="sm:col-span-2">
            <label className="label">Flags</label>
            <div className="flex flex-wrap gap-4">
              {([['is_featured', 'Featured'], ['is_trending', 'Trending'], ['is_best_seller', 'Best Seller'], ['is_new', 'New'], ['cod_available', 'COD Available']] as const).map(([k, l]) => (
                <label key={k} className="flex items-center gap-2 text-sm text-ink-700">
                  <input type="checkbox" checked={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.checked })} className="accent-gold-500" /> {l}
                </label>
              ))}
            </div>
          </div>

          {/* Image gallery (edit mode) */}
          {editing && (
            <div className="sm:col-span-2">
              <label className="label">Image Gallery</label>
              <div className="flex flex-wrap gap-3">
                {images.map((img) => (
                  <div key={img.id} className="relative">
                    <img src={img.image_url} alt="" className="h-20 w-20 rounded-lg border border-ink-100 object-cover" />
                    <button type="button" onClick={() => removeImage(img.id)} className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-white hover:bg-red-600">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input className="input flex-1" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="Paste image URL…" />
                <button type="button" onClick={addImage} className="btn-outline px-3"><Upload size={16} /></button>
              </div>
            </div>
          )}

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
