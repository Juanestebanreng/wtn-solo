export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl font-bold text-ink">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate">Last updated: June 2026</p>

      <div className="mt-8 space-y-6 text-sm text-slate leading-relaxed">
        <section>
          <h2 className="font-display text-lg font-bold text-ink mb-2">Who we are</h2>
          <p>Tilo WTN is operated by Tilo Studio. We provide a digital Waste Transfer Note service for UK waste carriers and operators. Our website is wtn.tilostudio.net.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink mb-2">What data we collect</h2>
          <p>We collect the following information when you use Tilo WTN:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Your name and email address (for your account)</li>
            <li>Your company details (name, address, registration numbers)</li>
            <li>Waste transfer note data you enter (waste descriptions, EWC codes, quantities, dates, locations)</li>
            <li>Electronic signatures captured during WTN completion</li>
            <li>Payment information (processed securely by Stripe — we never store card details)</li>
            <li>Usage data (pages visited, actions taken — collected via PostHog)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink mb-2">Why we collect it</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>To provide the WTN creation and storage service</li>
            <li>To generate legally compliant PDF records</li>
            <li>To process your subscription payment</li>
            <li>To improve the app based on how it is used</li>
            <li>To comply with UK waste duty-of-care regulations</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink mb-2">How long we keep it</h2>
          <p>WTN records are kept indefinitely, in line with the legal requirement to retain records for a minimum of 2 years. Account data is kept for as long as your account is active. You may request deletion of your account and associated data at any time.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink mb-2">Who we share it with</h2>
          <p>We use the following third-party services:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li><strong>Supabase</strong> — database and file storage (EU region)</li>
            <li><strong>Stripe</strong> — payment processing</li>
            <li><strong>PostHog</strong> — usage analytics (EU region)</li>
            <li><strong>Vercel</strong> — hosting</li>
            <li><strong>Resend</strong> — transactional email</li>
          </ul>
          <p className="mt-2">We do not sell your data to any third parties.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink mb-2">Your rights</h2>
          <p>Under UK GDPR you have the right to access, correct, or delete your personal data. To exercise these rights, contact us at hello@tilostudio.net.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink mb-2">Contact</h2>
          <p>For any privacy-related questions: hello@tilostudio.net</p>
        </section>
      </div>
    </main>
  );
}
