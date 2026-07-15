import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { STORE } from '../lib/config';

export function LegalLayout({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="container-x py-12">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="text-sm font-semibold text-gold-600">← Home</Link>
        <h1 className="mt-4 font-display text-4xl font-bold text-ink-900">{title}</h1>
        <p className="mt-2 text-sm text-ink-400">Last updated: {updated}</p>
        <div className="prose mt-8 max-w-none space-y-6 text-ink-600 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink-900 [&_h2]:mt-8 [&_li]:leading-relaxed [&_p]:leading-relaxed">
          {children}
        </div>
        <div className="mt-12 rounded-2xl bg-ink-50 p-6 text-sm text-ink-600">
          <p className="font-semibold text-ink-900">Questions?</p>
          <p className="mt-1">Contact us at <a href={`mailto:${STORE.email}`} className="text-gold-600">{STORE.email}</a> or <a href={`tel:${STORE.phone}`} className="text-gold-600">{STORE.phone}</a>.</p>
        </div>
      </div>
    </div>
  );
}
