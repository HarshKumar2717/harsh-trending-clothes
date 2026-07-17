import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AuthLayout, Field } from './AuthLayout';

export function LoginPage() {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get('redirect') || (location.state as any)?.from || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await signIn(email, password);
      toast('Welcome back!');
      navigate(redirect);
    } catch (err: any) {
      toast(err.message || 'Invalid credentials', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue your premium fashion journey."
      footer={<>Don't have an account? <Link to="/register" className="font-semibold text-gold-600">Create one</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email or Phone" value={email} onChange={setEmail} placeholder="you@example.com" required icon={<Mail size={16} />} />
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="input pl-10 pr-10"
            />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-ink-600">
            <input type="checkbox" className="accent-gold-500" /> Remember me
          </label>
          <Link to="/forgot-password" className="font-semibold text-gold-600 hover:underline">Forgot password?</Link>
        </div>
        <button disabled={busy} className="btn-gold w-full">
          {busy ? 'Signing in…' : <>Sign In <ArrowRight size={16} /></>}
        </button>
      </form>
    </AuthLayout>
  );
}
