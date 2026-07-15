import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, RefreshCw, Headphones, Quote } from 'lucide-react';
import { fetchBanners, fetchCategories, fetchProducts } from '../lib/api';
import type { Banner, Category, Product } from '../lib/types';
import { ProductCard } from '../components/ProductCard';
import { SectionLoader, Stars } from '../components/ui';

export function HomePage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newDrop, setNewDrop] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [b, c, t, bs, f, nd] = await Promise.all([
          fetchBanners(),
          fetchCategories(),
          fetchProducts({ trending: true, limit: 8 }),
          fetchProducts({ bestSeller: true, limit: 4 }),
          fetchProducts({ featured: true, limit: 8 }),
          fetchProducts({ isNew: true, limit: 4 }),
        ]);
        setBanners(b); setCategories(c); setTrending(t); setBestSellers(bs); setFeatured(f); setNewDrop(nd);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-950">
        <div className="absolute inset-0">
          <img
            src={banners[0]?.image_url || 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1600'}
            alt=""
            className="h-full w-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/80 to-transparent" />
        </div>
        <div className="container-x relative z-10 flex min-h-[80vh] items-center py-20">
          <div className="max-w-xl animate-fade-up">
            <span className="eyebrow">Premium Fashion Store</span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl text-balance">
              Wear the <span className="gold-text">Trend</span>.<br />Own the Moment.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink-300">
              Discover premium apparel, footwear and fragrances curated for the modern man.
              Crafted with quality, designed in India.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="btn-gold">
                Shop Collection <ArrowRight size={18} />
              </Link>
              <Link to="/category/t-shirts" className="btn border border-white/20 text-white hover:border-gold-400 hover:text-gold-400">
                Explore Tees
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6">
              {[
                { n: '30+', l: 'Products' },
                { n: '5', l: 'Categories' },
                { n: '4.7★', l: 'Avg Rating' },
              ].map((s) => (
                <div key={s.l}>
                  <p className="font-display text-2xl font-bold text-gold-400">{s.n}</p>
                  <p className="text-xs uppercase tracking-wider text-ink-400">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-b border-ink-100 bg-white">
        <div className="container-x grid grid-cols-2 gap-4 py-8 md:grid-cols-4">
          {[
            { Icon: Truck, t: 'Free Shipping', s: 'On orders over ₹1499' },
            { Icon: ShieldCheck, t: 'Secure Payments', s: 'UPI, Cards & COD' },
            { Icon: RefreshCw, t: 'Easy Returns', s: '7-day return policy' },
            { Icon: Headphones, t: '24/7 Support', s: 'Always here to help' },
          ].map((f) => (
            <div key={f.t} className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold-100 text-gold-600">
                <f.Icon size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink-900">{f.t}</p>
                <p className="text-xs text-ink-500">{f.s}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-x py-16">
        <SectionHeader eyebrow="Browse" title="Shop by Category" link="/shop" />
        {loading ? <SectionLoader /> : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((c, i) => (
              <Link
                key={c.id}
                to={`/category/${c.slug}`}
                className="group relative aspect-[3/4] animate-fade-up overflow-hidden rounded-2xl bg-ink-900"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <img src={c.image_url || ''} alt={c.name} className="h-full w-full object-cover opacity-70 transition duration-700 group-hover:scale-110 group-hover:opacity-50" />
                <div className="absolute inset-0 flex flex-col items-center justify-end p-4 text-center">
                  <h3 className="font-display text-lg font-bold text-white">{c.name}</h3>
                  <span className="mt-1 flex items-center gap-1 text-xs font-medium text-gold-300 opacity-0 transition group-hover:opacity-100">
                    Shop now <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Trending */}
      <section className="bg-ink-50/60 py-16">
        <div className="container-x">
          <SectionHeader eyebrow="Hot Right Now" title="Trending Products" link="/shop?trending=1" />
          {loading ? <SectionLoader /> : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {trending.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </div>
      </section>

      {/* Promo banner */}
      {banners[1] && (
        <section className="container-x py-16">
          <div className="relative overflow-hidden rounded-3xl bg-ink-950">
            <img src={banners[1].image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
            <div className="relative z-10 flex flex-col items-start gap-4 p-10 sm:p-16 lg:w-2/3">
              <span className="eyebrow text-gold-400">{banners[1].subtitle}</span>
              <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">{banners[1].title}</h2>
              <Link to={banners[1].cta_link || '/shop'} className="btn-gold mt-2">
                {banners[1].cta_text || 'Shop Now'} <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Best sellers */}
      <section className="container-x py-16">
        <SectionHeader eyebrow="Customer Favourites" title="Best Sellers" link="/shop?sort=popular" />
        {loading ? <SectionLoader /> : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {bestSellers.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </section>

      {/* New drop */}
      <section className="bg-ink-50/60 py-16">
        <div className="container-x">
          <SectionHeader eyebrow="Just Arrived" title="New Collection" link="/shop?sort=newest" />
          {loading ? <SectionLoader /> : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {newDrop.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </div>
      </section>

      {/* Featured */}
      <section className="container-x py-16">
        <SectionHeader eyebrow="Handpicked" title="Featured Products" link="/shop?featured=1" />
        {loading ? <SectionLoader /> : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </section>

      {/* Reviews */}
      <section className="bg-ink-950 py-16 text-white">
        <div className="container-x">
          <div className="mb-10 text-center">
            <span className="eyebrow text-gold-400">Loved by Thousands</span>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">What Our Customers Say</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="animate-fade-up rounded-2xl border border-white/10 bg-white/5 p-6" style={{ animationDelay: `${i * 100}ms` }}>
                <Quote className="text-gold-400" size={28} />
                <p className="mt-4 text-sm leading-relaxed text-ink-300">"{t.text}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-gold-400 font-bold text-ink-950">{t.name[0]}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <Stars value={5} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="container-x py-16">
        <div className="mb-8 text-center">
          <span className="eyebrow">Our Brands</span>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink-900">Trusted Labels We Carry</h2>
        </div>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
          {['Harsh Co.', 'Harsh Luxe', 'Harsh Formals', 'Harsh Denim', 'Harsh Sport', 'Dior', 'Versace', 'Armani', 'Bella Vita', 'Wild Stone', 'Park Avenue', 'Harsh Footwear'].map((b) => (
            <div key={b} className="grid h-16 place-items-center rounded-xl border border-ink-100 bg-white text-sm font-semibold text-ink-500 transition hover:border-gold-400 hover:text-gold-600">
              {b}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ eyebrow, title, link }: { eyebrow: string; title: string; link?: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="mt-2 section-title">{title}</h2>
      </div>
      {link && (
        <Link to={link} className="link-underline hidden shrink-0 items-center gap-1 text-sm font-semibold text-gold-600 sm:flex">
          View all <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}

const TESTIMONIALS = [
  { name: 'Aarav Sharma', text: 'The quality is unreal for the price. The oversized tee became my instant favourite. Delivery was super quick!' },
  { name: 'Rohan Mehta', text: 'Dior Sauvage at this price point is unbeatable. Genuine product, premium packaging. Highly recommend Harsh Trending Cloth.' },
  { name: 'Karan Verma', text: 'Bought the white sneakers and slim fit jeans. Both fit perfectly and look premium. This is my go-to store now.' },
];
