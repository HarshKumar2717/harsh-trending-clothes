import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

export function AuthLayout({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="grid min-h-[calc(100vh-5rem)] lg:grid-cols-2">
      {/* Visual side */}
      <div className="relative hidden overflow-hidden bg-ink-950 lg:block">
        <img
          src="https://images.pexels.com/photos/1655532/pexels-photo-1655532.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-400 font-display text-xl font-bold text-ink-950">H</span>
            <span className="font-display text-lg font-bold text-white">Harsh Trending Cloth</span>
          </Link>
          <div>
            <h2 className="font-display text-4xl font-bold leading-tight text-white">
              Premium Fashion,<br /><span className="gold-text">Crafted for You.</span>
            </h2>
            <p className="mt-4 max-w-md text-ink-300">
              Join thousands of customers who trust Harsh Trending Cloth for premium apparel,
              footwear and fragrances.
            </p>
            <div className="mt-8 flex gap-8">
              {[['30+', 'Products'], ['4.7★', 'Avg Rating'], ['5★', 'Categories']].map(([n, l]) => (
                <div key={l}>
                  <p className="font-display text-2xl font-bold text-gold-400">{n}</p>
                  <p className="text-xs uppercase tracking-wider text-ink-400">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-ink-500">© {new Date().getFullYear()} Harsh Trending Cloth</p>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-fade-up">
          <div className="mb-8 text-center lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink-950 font-display text-xl font-bold text-gold-400">H</span>
            </Link>
          </div>
          <h1 className="font-display text-3xl font-bold text-ink-900">{title}</h1>
          <p className="mt-2 text-sm text-ink-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-center text-sm text-ink-500">{footer}</div>
        </div>
      </div>
    </div>
  );
}

export function Field({ label, type = 'text', value, onChange, placeholder, required, icon }: {
  label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; icon?: ReactNode;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`input ${icon ? 'pl-10' : ''}`}
        />
      </div>
    </div>
  );
}
