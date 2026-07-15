import { useEffect } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../lib/utils';

export function Stars({ value, size = 14, className }: { value: number; size?: number; className?: string }) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(value) ? 'fill-gold-400 text-gold-400' : 'text-ink-200'}
        />
      ))}
    </div>
  );
}

export function Spinner({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <div
      className={cn('animate-spin-slow rounded-full border-2 border-ink-200 border-t-gold-400', className)}
      style={{ width: size, height: size }}
    />
  );
}

export function FullPageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="h-16 w-16 animate-spin-slow rounded-full border-4 border-ink-100 border-t-gold-400" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-lg font-bold text-gold-500">H</span>
        </div>
      </div>
      <p className="text-sm font-medium text-ink-400">{label}</p>
    </div>
  );
}

export function SectionLoader() {
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <div className="skeleton aspect-[3/4] w-full" />
          <div className="space-y-2 p-4">
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-4 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  icon, title, subtitle, action,
}: { icon?: React.ReactNode; title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink-200 bg-ink-50/50 px-6 py-16 text-center">
      {icon && <div className="text-gold-400">{icon}</div>}
      <h3 className="font-display text-xl font-semibold text-ink-800">{title}</h3>
      {subtitle && <p className="max-w-md text-sm text-ink-500">{subtitle}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function useScrollTop(dep?: unknown) {
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [dep]);
}

export function Modal({
  open, onClose, children, title, maxWidth = 'max-w-lg',
}: { open: boolean; onClose: () => void; children: React.ReactNode; title?: string; maxWidth?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={cn('relative z-10 w-full animate-scale-in rounded-2xl bg-white shadow-card', maxWidth)}>
        {title && (
          <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
            <h3 className="font-display text-lg font-semibold text-ink-900">{title}</h3>
            <button onClick={onClose} className="text-ink-400 hover:text-ink-800">✕</button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function Badge({ children, variant = 'gold' }: { children: React.ReactNode; variant?: 'gold' | 'dark' | 'red' | 'green' }) {
  const cls = {
    gold: 'bg-gold-100 text-gold-700',
    dark: 'bg-ink-900 text-gold-400',
    red: 'bg-red-100 text-red-700',
    green: 'bg-emerald-100 text-emerald-700',
  }[variant];
  return <span className={cn('chip', cls)}>{children}</span>;
}
