import { LegalLayout } from './LegalLayout';
import { STORE } from '../lib/config';

export function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="July 2026">
      <p>At {STORE.name}, we take your privacy seriously. This policy explains how we collect, use and protect your personal information.</p>
      <h2>1. Information We Collect</h2>
      <ul className="list-disc space-y-1 pl-6">
        <li>Account information: name, email, phone number and password (encrypted).</li>
        <li>Shipping addresses you save for faster checkout.</li>
        <li>Order history and payment metadata (we never store full card numbers).</li>
        <li>Browsing data such as pages viewed and products searched.</li>
      </ul>
      <h2>2. How We Use Your Information</h2>
      <ul className="list-disc space-y-1 pl-6">
        <li>To process and fulfil your orders and provide order tracking.</li>
        <li>To communicate with you about your account, orders and promotions.</li>
        <li>To improve our products, services and website experience.</li>
        <li>To prevent fraud and keep our platform secure.</li>
      </ul>
      <h2>3. Data Security</h2>
      <p>We use industry-standard encryption and secure authentication. Payment details are processed by trusted payment gateways and are never stored on our servers.</p>
      <h2>4. Cookies</h2>
      <p>We use cookies to remember your session, cart and preferences. You can disable cookies in your browser, though some features may not work as expected.</p>
      <h2>5. Your Rights</h2>
      <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us at {STORE.email}.</p>
      <h2>6. Third-Party Services</h2>
      <p>We may use third-party tools for analytics, email and payments. These providers have their own privacy policies governing your data.</p>
      <h2>7. Changes to This Policy</h2>
      <p>We may update this policy from time to time. Any changes will be posted on this page with an updated revision date.</p>
    </LegalLayout>
  );
}
