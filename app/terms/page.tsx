export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl font-bold text-ink">Terms of Service</h1>
      <p className="mt-2 text-sm text-slate">Last updated: June 2026</p>

      <div className="mt-8 space-y-6 text-sm text-slate leading-relaxed">
        <section>
          <h2 className="font-display text-lg font-bold text-ink mb-2">The service</h2>
          <p>Tilo WTN is a software service that allows UK waste carriers and operators to create, sign, store, and export digital Waste Transfer Notes. It is operated by Tilo Studio.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink mb-2">Your account</h2>
          <p>You are responsible for keeping your login details secure. You must be 18 or over to use this service. You agree to provide accurate information when creating your account and completing WTNs.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink mb-2">Compliance</h2>
          <p>Tilo WTN helps you create digital Waste Transfer Notes that meet the requirements of the Environmental Protection Act 1990 and the Controlled Waste (Registration of Carriers and Seizure of Vehicles) Regulations 1991. You are responsible for ensuring the information you enter is accurate and complete. Tilo Studio is not liable for fines or penalties resulting from incorrect or incomplete WTNs.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink mb-2">Subscription and payment</h2>
          <p>Tilo WTN costs £15/month after a 14-day free trial. Payment is processed by Stripe. You can cancel at any time. Cancellation takes effect at the end of your current billing period. We do not offer refunds for partial months.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink mb-2">Data and records</h2>
          <p>Your WTN records are stored securely. We keep them indefinitely to help you meet the 2-year legal retention requirement. If you close your account, you should export any records you need before doing so.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink mb-2">Availability</h2>
          <p>We aim to keep Tilo WTN available at all times but cannot guarantee uninterrupted service. We are not liable for any losses resulting from downtime.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink mb-2">Changes</h2>
          <p>We may update these terms from time to time. We will notify you by email if we make significant changes.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink mb-2">Contact</h2>
          <p>Questions about these terms: hello@tilostudio.net</p>
        </section>
      </div>
    </main>
  );
}
