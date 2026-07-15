import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AuthLayout } from './AuthLayout';

export function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast('Passwords do not match', 'error'); return; }
    if (password.length < 6) { toast('Password must be at least 6 characters', 'error'); return; }
    setBusy(true);
    try {
      await updatePassword(password);
      toast('Password updated! Please sign in.');
      navigate('/login');
    } catch (err: any) {
      toast(err.message || 'Could not update password', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Set New Password"
      subtitle="Choose a new password for your account."
      footer={<Link to="/login" className="font-semibold text-gold-600">Back to sign in</Link>}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">New Password</label>
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
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div>
          <label className="label">Confirm Password</label>
          <input
            type={show ? 'text' : 'password'}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="input"
          />
        </div>
        <button disabled={busy} className="btn-gold w-full">
          {busy ? 'Updating…' : <>Update Password <ArrowRight size={16} /></>}
        </button>
      </form>
    </AuthLayout>
  );
}
