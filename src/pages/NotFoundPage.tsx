import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="text-center">
        <div className="relative">
          <p className="font-display text-[120px] font-bold leading-none text-ink-100 sm:text-[180px]">404</p>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-[120px] font-bold leading-none text-gold-400/20 sm:text-[180px]">404</span>
          </div>
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-ink-900 sm:text-3xl">Page Not Found</h1>
        <p className="mx-auto mt-3 max-w-md text-ink-500">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-gold"><Home size={16} /> Back to Home</Link>
          <Link to="/shop" className="btn-outline"><Search size={16} /> Browse Products</Link>
        </div>
        <button onClick={() => window.history.back()} className="mt-6 inline-flex items-center gap-1 text-sm text-ink-400 hover:text-gold-600">
          <ArrowLeft size={14} /> Go back
        </button>
      </div>
    </div>
  );
}
