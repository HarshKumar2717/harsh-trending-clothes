import { LegalLayout } from './LegalLayout';

export function ReturnPolicyPage() {
  return (
    <LegalLayout title="Return & Refund Policy" updated="July 2026">
      <p>We want you to love every purchase. If something isn't right, we're here to help with easy returns.</p>
      <h2>1. Return Window</h2>
      <p>You may return most items within 7 days of delivery for a full refund or exchange. Items must be unworn, unwashed and in their original packaging with tags intact.</p>
      <h2>2. Non-Returnable Items</h2>
      <ul className="list-disc space-y-1 pl-6">
        <li>Perfumes and fragrances (for hygiene reasons).</li>
        <li>Items marked as final sale or clearance.</li>
        <li>Gift cards and promotional items.</li>
      </ul>
      <h2>3. How to Initiate a Return</h2>
      <ul className="list-decimal space-y-1 pl-6">
        <li>Go to My Orders in your account dashboard.</li>
        <li>Select the order and click "Request Return".</li>
        <li>Choose the items you wish to return and provide a reason.</li>
        <li>We will send you a return authorization and pickup instructions within 24 hours.</li>
      </ul>
      <h2>4. Refund Processing</h2>
      <p>Once we receive and inspect the returned item, your refund will be processed within 5-7 business days to the original payment method. COD orders will be refunded via bank transfer.</p>
      <h2>5. Exchange</h2>
      <p>Want a different size or colour? Initiate a return and place a new order for the desired item — we'll refund the original once received.</p>
      <h2>6. Damaged or Wrong Items</h2>
      <p>If you receive a damaged or incorrect item, contact us within 48 hours with photos and we'll arrange a free replacement or full refund.</p>
      <h2>7. Shipping Costs</h2>
      <p>Return shipping is free for damaged or wrong items. For other returns, a flat ₹99 shipping fee may apply, deducted from your refund.</p>
    </LegalLayout>
  );
}
