import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function AdminLoginPage() {
  const { signInAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get('redirect') || (location.state as any)?.from || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await signInAdmin(email, password);
      toast('Welcome, Super Admin');
      navigate(redirect);
    } catch (err: any) {
      toast(err.message || 'Access denied', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Visual side */}
      <div className="relative hidden overflow-hidden bg-ink-950 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-ink-950 via-ink-900 to-gold-900/30" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #d4af37 0%, transparent 40%), radial-gradient(circle at 80% 70%, #d4af37 0%, transparent 40%)' }} />
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-400 font-display text-xl font-bold text-ink-950">H</span>
            <span className="font-display text-lg font-bold text-white">Harsh Trending Cloth</span>
          </div>
          <div>
            <ShieldCheck className="text-gold-400" size={48} />
            <h2 className="mt-4 font-display text-4xl font-bold leading-tight text-white">
              Super Admin<br /><span className="gold-text">Control Center</span>
            </h2>
            <p className="mt-4 max-w-md text-ink-300">
              Secure administrative access to manage products, orders, users and system settings.
            </p>
          </div>
          <p className="text-xs text-ink-500">Authorized personnel only. All actions are logged.</p>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center bg-ink-50/40 p-6 sm:p-12">
        <div className="w-full max-w-md animate-fade-up">
          <div className="mb-8 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-ink-950 text-gold-400">
              <ShieldCheck size={28} />
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold text-ink-900">Super Admin Login</h1>
          <p className="mt-2 text-sm text-ink-500">Authorized access only.</p>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
            <p className="flex items-center gap-2"><AlertCircle size={14} className="shrink-0" /> Only Super Admin accounts can sign in here.</p>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label">Admin Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input type={show ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input pl-10 pr-10" />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button disabled={busy} className="btn-gold w-full">
              {busy ? 'Authenticating…' : <>Sign In to Admin Panel <ArrowRight size={16} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
