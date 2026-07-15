import { Link } from 'react-router-dom';
import { ArrowRight, Award, Truck, ShieldCheck, Heart, Users } from 'lucide-react';

export function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-ink-950 py-24">
        <img src="https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="container-x relative z-10 text-center">
          <span className="eyebrow text-gold-400">Our Story</span>
          <h1 className="mt-4 font-display text-4xl font-bold text-white sm:text-5xl">Crafted in India, Worn Worldwide</h1>
          <p className="mx-auto mt-5 max-w-2xl text-ink-300">
            Harsh Trending Cloth was born from a simple idea: premium fashion shouldn't cost a fortune.
            We design and curate apparel, footwear and fragrances for the modern man who values quality.
          </p>
        </div>
      </section>

      <section className="container-x py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="section-title">Who We Are</h2>
            <p className="mt-4 leading-relaxed text-ink-600">
              Based in Ghaziabad, Uttar Pradesh, Harsh Trending Cloth is a premium fashion destination
              offering a carefully curated collection of t-shirts, shirts, pants, sneakers and trending perfumes.
              Every product is selected for its quality, fit and value.
            </p>
            <p className="mt-4 leading-relaxed text-ink-600">
              We believe that great fashion is about more than just clothing — it's about confidence,
              expression and feeling your best. That's why we obsess over fabric, fit and finish on every piece.
            </p>
            <Link to="/shop" className="btn-gold mt-6">Explore Collection <ArrowRight size={16} /></Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { n: '30+', l: 'Premium Products' },
              { n: '5', l: 'Curated Categories' },
              { n: '4.7★', l: 'Average Rating' },
              { n: '1000+', l: 'Happy Customers' },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border border-ink-100 bg-white p-6 text-center">
                <p className="font-display text-3xl font-bold text-gold-500">{s.n}</p>
                <p className="mt-1 text-sm text-ink-500">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink-50/60 py-16">
        <div className="container-x">
          <div className="mb-10 text-center">
            <span className="eyebrow">What We Stand For</span>
            <h2 className="mt-2 section-title">Our Values</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { I: Award, t: 'Premium Quality', d: 'Every product is hand-checked for quality before it reaches you.' },
              { I: Truck, t: 'Fast Delivery', d: 'Free shipping on orders over ₹1499, dispatched within 24 hours.' },
              { I: ShieldCheck, t: 'Authentic Only', d: '100% genuine products, sourced directly from authorized brands.' },
              { I: Heart, t: 'Customer First', d: 'A 7-day return policy and responsive support that actually cares.' },
            ].map((v) => (
              <div key={v.t} className="rounded-2xl border border-ink-100 bg-white p-6 text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gold-100 text-gold-600"><v.I size={24} /></span>
                <h3 className="mt-4 font-semibold text-ink-900">{v.t}</h3>
                <p className="mt-1 text-sm text-ink-500">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-16 text-center">
        <Users className="mx-auto text-gold-500" size={40} />
        <h2 className="mt-4 section-title">Join the Harsh Circle</h2>
        <p className="mx-auto mt-3 max-w-lg text-ink-600">Discover premium fashion crafted for the modern man. New drops every week.</p>
        <Link to="/shop" className="btn-gold mt-6">Start Shopping <ArrowRight size={16} /></Link>
      </section>
    </div>
  );
}
