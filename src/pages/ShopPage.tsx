import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, X, Search, ChevronRight, ChevronLeft } from 'lucide-react';
import {
  fetchCategories, fetchProducts, fetchBrands, fetchColors, fetchSizes, type ProductQuery,
} from '../lib/api';
import type { Category, Product } from '../lib/types';
import { ProductCard } from '../components/ProductCard';
import { SectionLoader, EmptyState, Stars } from '../components/ui';
import { cn } from '../lib/utils';

const SORTS = [
  { v: 'popular', l: 'Most Popular' },
  { v: 'newest', l: 'Newest First' },
  { v: 'best_selling', l: 'Best Selling' },
  { v: 'price_low', l: 'Price: Low to High' },
  { v: 'price_high', l: 'Price: High to Low' },
  { v: 'rating', l: 'Top Rated' },
] as const;

const PAGE_SIZE = 12;

export function ShopPage() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [allColors, setAllColors] = useState<string[]>([]);
  const [allSizes, setAllSizes] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [total, setTotal] = useState(0);

  const category = params.get('category') || undefined;
  const search = params.get('search') || undefined;
  const sort = (params.get('sort') as ProductQuery['sort']) || 'popular';
  const minPrice = params.get('minPrice') ? Number(params.get('minPrice')) : undefined;
  const maxPrice = params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined;
  const minRating = params.get('minRating') ? Number(params.get('minRating')) : undefined;
  const brand = params.get('brand') || undefined;
  const color = params.get('color') || undefined;
  const size = params.get('size') || undefined;
  const page = params.get('page') ? Number(params.get('page')) : 1;

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
    fetchBrands().then(setBrands).catch(() => {});
    fetchColors().then(setAllColors).catch(() => {});
    fetchSizes().then(setAllSizes).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const q: ProductQuery = { category, search, sort, minPrice, maxPrice, minRating, brand, color, size };
    fetchProducts(q)
      .then((all) => {
        setTotal(all.length);
        const start = (page - 1) * PAGE_SIZE;
        setProducts(all.slice(start, start + PAGE_SIZE));
      })
      .catch(() => { setProducts([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [category, search, sort, minPrice, maxPrice, minRating, brand, color, size, page]);

  const update = (key: string, val?: string) => {
    const next = new URLSearchParams(params);
    if (val) next.set(key, val); else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  const activeCat = categories.find((c) => c.slug === category);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="container-x py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1 text-sm text-ink-400">
        <Link to="/" className="hover:text-ink-800">Home</Link>
        <ChevronRight size={14} />
        <span className="text-ink-800">{activeCat ? activeCat.name : search ? `Results for "${search}"` : 'All Products'}</span>
      </nav>

      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900 sm:text-4xl">
            {activeCat ? activeCat.name : search ? `Results for "${search}"` : 'All Products'}
          </h1>
          <p className="mt-1 text-sm text-ink-500">{loading ? 'Loading…' : `${total} products found`}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(true)} className="btn-outline py-2 lg:hidden">
            <SlidersHorizontal size={16} /> Filters
          </button>
          <select
            value={sort}
            onChange={(e) => update('sort', e.target.value)}
            className="input w-auto py-2"
          >
            {SORTS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className={cn(
          'lg:block',
          showFilters ? 'fixed inset-0 z-50 overflow-y-auto bg-white p-5' : 'hidden'
        )}>
          {showFilters && (
            <div className="mb-4 flex items-center justify-between lg:hidden">
              <h3 className="font-display text-lg font-bold">Filters</h3>
              <button onClick={() => setShowFilters(false)}><X size={22} /></button>
            </div>
          )}

          <FilterGroup title="Category">
            <FilterLink active={!category} onClick={() => update('category')} label="All Products" />
            {categories.map((c) => (
              <FilterLink key={c.id} active={category === c.slug} onClick={() => update('category', c.slug)} label={c.name} />
            ))}
          </FilterGroup>

          <FilterGroup title="Price Range">
            <div className="space-y-2">
              {[
                { l: 'Under ₹500', min: '0', max: '500' },
                { l: '₹500 - ₹1000', min: '500', max: '1000' },
                { l: '₹1000 - ₹2500', min: '1000', max: '2500' },
                { l: '₹2500 - ₹5000', min: '2500', max: '5000' },
                { l: 'Above ₹5000', min: '5000', max: '' },
              ].map((r) => {
                const active = minPrice === Number(r.min) && (r.max === '' ? !maxPrice : maxPrice === Number(r.max));
                return (
                  <button
                    key={r.l}
                    onClick={() => { update('minPrice', r.min); update('maxPrice', r.max); }}
                    className={cn('block w-full text-left text-sm', active ? 'font-semibold text-gold-600' : 'text-ink-600 hover:text-ink-900')}
                  >
                    {r.l}
                  </button>
                );
              })}
              {(minPrice || maxPrice) && (
                <button onClick={() => { update('minPrice'); update('maxPrice'); }} className="text-xs text-red-500 hover:underline">
                  Clear price
                </button>
              )}
            </div>
          </FilterGroup>

          {brands.length > 0 && (
            <FilterGroup title="Brand">
              <FilterLink active={!brand} onClick={() => update('brand')} label="All Brands" />
              {brands.map((b) => (
                <FilterLink key={b} active={brand === b} onClick={() => update('brand', b)} label={b} />
              ))}
            </FilterGroup>
          )}

          {allSizes.length > 0 && (
            <FilterGroup title="Size">
              <FilterLink active={!size} onClick={() => update('size')} label="All Sizes" />
              <div className="flex flex-wrap gap-2 pt-1">
                {allSizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => update('size', size === s ? '' : s)}
                    className={cn(
                      'min-w-[36px] rounded-lg border px-2 py-1 text-xs font-medium transition',
                      size === s ? 'border-gold-400 bg-gold-50 text-gold-700' : 'border-ink-200 text-ink-600 hover:border-ink-300'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </FilterGroup>
          )}

          {allColors.length > 0 && (
            <FilterGroup title="Color">
              <FilterLink active={!color} onClick={() => update('color')} label="All Colors" />
              <div className="flex flex-wrap gap-2 pt-1">
                {allColors.map((c) => (
                  <button
                    key={c}
                    onClick={() => update('color', color === c ? '' : c)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition',
                      color === c ? 'border-gold-400 bg-gold-50 text-gold-700' : 'border-ink-200 text-ink-600 hover:border-ink-300'
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </FilterGroup>
          )}

          <FilterGroup title="Rating">
            {[4, 3, 2].map((r) => (
              <button
                key={r}
                onClick={() => update('minRating', minRating === r ? '' : String(r))}
                className={cn('flex w-full items-center gap-2 py-1 text-sm', minRating === r ? 'text-gold-600' : 'text-ink-600 hover:text-ink-900')}
              >
                <Stars value={r} /> <span>& up</span>
              </button>
            ))}
          </FilterGroup>

          <FilterGroup title="Quick Links">
            <FilterLink active={!!params.get('trending')} onClick={() => update('trending', params.get('trending') ? '' : '1')} label="Trending" />
            <FilterLink active={!!params.get('bestSeller')} onClick={() => update('bestSeller', params.get('bestSeller') ? '' : '1')} label="Best Sellers" />
            <FilterLink active={!!params.get('isNew')} onClick={() => update('isNew', params.get('isNew') ? '' : '1')} label="New Arrivals" />
          </FilterGroup>

          {showFilters && (
            <button onClick={() => setShowFilters(false)} className="btn-gold mt-6 w-full lg:hidden">
              Show {total} Results
            </button>
          )}
        </aside>

        {/* Products */}
        <div>
          {loading ? <SectionLoader /> : products.length === 0 ? (
            <EmptyState
              icon={<Search size={40} />}
              title="No products found"
              subtitle="Try adjusting your filters or search for something else."
              action={<Link to="/shop" className="btn-dark">Clear all filters</Link>}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
                {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button
                    onClick={() => update('page', String(page - 1))}
                    disabled={page <= 1}
                    className="grid h-10 w-10 place-items-center rounded-lg border border-ink-200 text-ink-600 transition hover:border-gold-400 hover:text-gold-600 disabled:opacity-40 disabled:hover:border-ink-200 disabled:hover:text-ink-600"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                    .map((p, idx, arr) => (
                      <span key={p} className="flex items-center gap-2">
                        {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-ink-300">…</span>}
                        <button
                          onClick={() => update('page', String(p))}
                          className={cn(
                            'grid h-10 min-w-[40px] place-items-center rounded-lg border text-sm font-medium transition',
                            p === page ? 'border-gold-400 bg-gold-500 text-white' : 'border-ink-200 text-ink-600 hover:border-gold-400 hover:text-gold-600'
                          )}
                        >
                          {p}
                        </button>
                      </span>
                    ))}
                  <button
                    onClick={() => update('page', String(page + 1))}
                    disabled={page >= totalPages}
                    className="grid h-10 w-10 place-items-center rounded-lg border border-ink-200 text-ink-600 transition hover:border-gold-400 hover:text-gold-600 disabled:opacity-40 disabled:hover:border-ink-200 disabled:hover:text-ink-600"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 border-b border-ink-100 pb-5">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-500">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function FilterLink({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn('block w-full text-left text-sm transition', active ? 'font-semibold text-gold-600' : 'text-ink-600 hover:text-ink-900')}
    >
      {label}
    </button>
  );
}
