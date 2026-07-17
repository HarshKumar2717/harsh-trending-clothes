import { CreditCard, Check, Info } from 'lucide-react';

export function AdminPayment() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Payment Management</h1>
        <p className="text-sm text-ink-500">Configure accepted payment methods.</p>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 text-white"><CreditCard size={20} /></span>
          <div>
            <p className="font-semibold text-emerald-800">Cash on Delivery (COD)</p>
            <p className="text-sm text-emerald-700">Active — customers pay when they receive their order.</p>
          </div>
          <span className="ml-auto chip bg-emerald-600 text-white"><Check size={12} /> Enabled</span>
        </div>
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white p-6">
        <h2 className="mb-4 font-display text-lg font-bold text-ink-900">Payment Methods</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
            <div className="flex items-center gap-3">
              <CreditCard size={20} className="text-emerald-600" />
              <div><p className="font-medium text-ink-900">Cash on Delivery (COD)</p><p className="text-xs text-ink-500">Pay with cash upon delivery</p></div>
            </div>
            <span className="chip bg-emerald-600 text-white"><Check size={12} /> Active</span>
          </div>

          {['UPI', 'Credit Card', 'Debit Card', 'Wallet', 'Net Banking', 'PayPal', 'Stripe', 'Razorpay'].map((m) => (
            <div key={m} className="flex items-center justify-between rounded-xl border border-ink-100 bg-ink-50/50 p-4 opacity-60">
              <div className="flex items-center gap-3">
                <CreditCard size={20} className="text-ink-400" />
                <div><p className="font-medium text-ink-600">{m}</p><p className="text-xs text-ink-400">Disabled</p></div>
              </div>
              <span className="chip bg-ink-200 text-ink-500">Disabled</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-ink-100 bg-ink-50/50 p-4">
        <p className="flex items-start gap-2 text-sm text-ink-600">
          <Info size={16} className="mt-0.5 shrink-0 text-gold-600" />
          Only Cash on Delivery is enabled on this store. All online payment methods (UPI, Cards, Wallets, Net Banking, PayPal, Stripe, Razorpay) are disabled and hidden from customers throughout the website.
        </p>
      </div>
    </div>
  );
}
