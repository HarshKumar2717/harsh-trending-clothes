import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AuthLayout, Field } from './AuthLayout';

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast('Reset link sent to your email');
    } catch (err: any) {
      toast(err.message || 'Could not send reset link', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout
        title="Check Your Email"
        subtitle="We've sent a password reset link."
        footer={<Link to="/login" className="font-semibold text-gold-600">Back to sign in</Link>}
      >
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <CheckCircle2 className="mx-auto text-emerald-600" size={48} />
          <p className="mt-4 text-sm text-ink-700">
            A password reset link has been sent to <strong>{email}</strong>.
            Click the link in the email to set a new password.
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={<>Remember your password? <Link to="/login" className="font-semibold text-gold-600">Sign in</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required icon={<Mail size={16} />} />
        <button disabled={busy} className="btn-gold w-full">
          {busy ? 'Sending…' : <>Send Reset Link <ArrowRight size={16} /></>}
        </button>
      </form>
    </AuthLayout>
  );
}
