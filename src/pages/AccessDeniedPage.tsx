import { Link } from 'react-router-dom';
import { ShieldX, Home, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AccessDeniedPage() {
  const { user, profile } = useAuth();
  const home = profile && (profile.role === 'SUPER_ADMIN' || profile.role === 'ADMIN') ? '/admin' : '/account';

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-red-50 text-red-500">
          <ShieldX size={40} />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold text-ink-900">Access Denied</h1>
        <p className="mt-3 text-ink-500">
          You don't have permission to view this page. If you believe this is an error,
          please contact support.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {user ? (
            <Link to={home} className="btn-gold"><Home size={16} /> Go to Dashboard</Link>
          ) : (
            <Link to="/login" className="btn-gold"><LogIn size={16} /> Sign In</Link>
          )}
          <Link to="/" className="btn-outline"><Home size={16} /> Home</Link>
        </div>
      </div>
    </div>
  );
}
