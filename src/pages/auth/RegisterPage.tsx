import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AuthLayout, Field } from './AuthLayout';

export function RegisterPage() {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [agree, setAgree] = useState(false);

  const strength = passwordStrength(password);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast('Passwords do not match', 'error'); return; }
    if (password.length < 6) { toast('Password must be at least 6 characters', 'error'); return; }
    if (!agree) { toast('Please accept the terms', 'error'); return; }
    setBusy(true);
    try {
      await signUp(email, password, name);
      toast('Account created! Welcome to Harsh Trending Cloth.');
      navigate('/');
    } catch (err: any) {
      toast(err.message || 'Could not create account', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join the Harsh Circle for premium fashion & exclusive offers."
      footer={<>Already have an account? <Link to="/login" className="font-semibold text-gold-600">Sign in</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Full Name" value={name} onChange={setName} placeholder="Your name" required icon={<User size={16} />} />
        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required icon={<Mail size={16} />} />
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Min 6 characters"
              className="input pl-10 pr-10"
            />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {password && (
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`h-1 flex-1 rounded ${i <= strength ? 'bg-gold-400' : 'bg-ink-200'}`} />
              ))}
            </div>
          )}
        </div>
        <Field label="Confirm Password" type={show ? 'text' : 'password'} value={confirm} onChange={setConfirm} placeholder="Re-enter password" required />
        <label className="flex items-start gap-2 text-sm text-ink-600">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 accent-gold-500" />
          <span>I agree to the <Link to="/terms" className="font-semibold text-gold-600">Terms</Link> & <Link to="/return-policy" className="font-semibold text-gold-600">Return Policy</Link></span>
        </label>
        <button disabled={busy} className="btn-gold w-full">
          {busy ? 'Creating account…' : <>Create Account <ArrowRight size={16} /></>}
        </button>
      </form>
    </AuthLayout>
  );
}

function passwordStrength(p: string): number {
  let s = 0;
  if (p.length >= 6) s++;
  if (p.length >= 10) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/[0-9]/.test(p) || /[^a-zA-Z0-9]/.test(p)) s++;
  return s;
}
