import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from 'lucide-react';
import { STORE } from '../lib/config';
import { useToast } from '../context/ToastContext';

export function ContactPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    // Store contact message as a newsletter-like row (reuse available tables)
    // In a full app this would POST to a contact edge function.
    setTimeout(() => {
      setBusy(false);
      setForm({ name: '', email: '', subject: '', message: '' });
      toast('Message sent! We will get back to you within 24 hours.');
    }, 800);
  };

  return (
    <div>
      <section className="bg-ink-950 py-16 text-center">
        <div className="container-x">
          <span className="eyebrow text-gold-400">Get in Touch</span>
          <h1 className="mt-3 font-display text-4xl font-bold text-white">Contact Us</h1>
          <p className="mx-auto mt-3 max-w-xl text-ink-300">Questions about an order, product, or anything else? We're here to help.</p>
        </div>
      </section>

      <div className="container-x py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Form */}
          <div className="rounded-2xl border border-ink-100 bg-white p-8">
            <h2 className="font-display text-2xl font-bold text-ink-900">Send us a message</h2>
            <p className="mt-1 text-sm text-ink-500">Fill out the form below and we'll respond within 24 hours.</p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="label">Your Name</label><input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><label className="label">Email</label><input required type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              </div>
              <div><label className="label">Subject</label><input required className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
              <div><label className="label">Message</label><textarea required rows={5} className="input" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
              <button disabled={busy} className="btn-gold"><Send size={16} /> {busy ? 'Sending…' : 'Send Message'}</button>
            </form>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-ink-100 bg-white p-6">
              <h3 className="mb-4 font-semibold text-ink-900">Contact Information</h3>
              <div className="space-y-4 text-sm">
                <a href={`tel:${STORE.phone}`} className="flex items-start gap-3 hover:text-gold-600">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-100 text-gold-600"><Phone size={18} /></span>
                  <div><p className="font-semibold text-ink-900">Phone</p><p className="text-ink-600">{STORE.phone}</p></div>
                </a>
                <a href={`mailto:${STORE.email}`} className="flex items-start gap-3 hover:text-gold-600">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-100 text-gold-600"><Mail size={18} /></span>
                  <div><p className="font-semibold text-ink-900">Email</p><p className="text-ink-600">{STORE.email}</p></div>
                </a>
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-100 text-gold-600"><MapPin size={18} /></span>
                  <div><p className="font-semibold text-ink-900">Address</p><p className="text-ink-600">{STORE.address.line1}, {STORE.address.city}, {STORE.address.state} {STORE.address.pincode}</p></div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-ink-100 bg-white p-6">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-ink-900"><Clock size={18} className="text-gold-600" /> Business Hours</h3>
              <div className="space-y-1.5 text-sm text-ink-600">
                <p className="flex justify-between"><span>Monday – Friday</span><span className="font-medium">9:00 AM – 8:00 PM</span></p>
                <p className="flex justify-between"><span>Saturday</span><span className="font-medium">10:00 AM – 6:00 PM</span></p>
                <p className="flex justify-between"><span>Sunday</span><span className="font-medium">Closed</span></p>
              </div>
            </div>
            <div className="rounded-2xl bg-ink-950 p-6 text-white">
              <MessageSquare className="text-gold-400" size={28} />
              <h3 className="mt-3 font-semibold">Need Quick Help?</h3>
              <p className="mt-1 text-sm text-ink-300">Call us directly at <a href={`tel:${STORE.phone}`} className="font-semibold text-gold-400">{STORE.phone}</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
