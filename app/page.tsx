import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';
import { Badge } from '@/components/ui/card';

const bullets = [
  'Unlimited digital WTNs',
  'Capture both signatures on one phone',
  'Search and store records for 2+ years',
  'Export a clean PDF the moment it\'s signed',
];

const steps = [
  {
    label: 'Transferor',
    copy: 'Pull company details from a saved profile — name, address, SIC code, permit number.',
  },
  {
    label: 'Transferee',
    copy: 'Add who is receiving the waste, and their carrier or exemption status.',
  },
  {
    label: 'Waste & transfer',
    copy: 'EWC code, quantity, containment, and where and when the handover happened.',
  },
  {
    label: 'Sign & finalise',
    copy: 'Both parties sign on screen. The note locks and a PDF is filed automatically.',
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-paper overflow-x-hidden">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <span className="font-display text-lg font-bold tracking-tight text-ink">
          Tilo WTN
        </span>
        <nav className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-ink hover:underline">
            Log in
          </Link>
          <Link href="/signup" className={buttonClasses('primary', 'px-4 py-2 text-sm')}>
            Start free trial
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-5xl gap-10 px-6 pb-20 pt-10 md:grid-cols-2 md:items-center">
        <div>
          <Badge tone="amber">For UK one-van carriers</Badge>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink md:text-5xl">
            Create a compliant Waste Transfer Note in 60 seconds.
          </h1>
          <p className="mt-4 max-w-md text-base text-slate">
            Built for one-van carriers, clearance firms, and small UK waste
            operators who are still doing this on a carbon-copy pad.
          </p>
          <ul className="mt-6 space-y-2">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-ink">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
                {b}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex items-center gap-4">
            <Link href="/signup" className={buttonClasses('primary', 'px-6 py-3 text-base')}>
              Start 14-day free trial
            </Link>
            <span className="text-xs text-slate">No card needed to start</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <div className="rotate-1 rounded bg-white p-6 font-mono text-xs text-ink shadow-[6px_6px_0_0_#C9CDC6]">
            <div className="flex items-center justify-between border-b border-dashed border-steel pb-3">
              <span className="font-display text-sm font-bold">
                Waste Transfer Note
              </span>
              <span className="text-slate">No. WTN-0847</span>
            </div>
            <dl className="mt-3 space-y-2">
              <Row k="Transferor" v="Riverside Clearance Ltd" />
              <Row k="Transferee" v="Greenfield Skip Hire" />
              <Row k="EWC code" v="17 09 04" />
              <Row k="Quantity" v="1 x 8yd skip — mixed C&D" />
              <Row k="Date / time" v="24 Jun 2026, 14:10" />
            </dl>
            <div className="mt-4 flex items-center justify-between border-t border-dashed border-steel pt-3">
              <span className="text-slate">Hierarchy duty confirmed</span>
              <span className="font-display rotate-[-6deg] rounded-sm border-2 border-compliant px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-compliant">
                Compliant
              </span>
            </div>
          </div>
          <div className="absolute -bottom-3 left-4 right-4 h-3 bg-perforation" />
        </div>
      </section>

      <section className="border-t border-steel bg-white py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
            Four steps. One signed record.
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.label} className="border-t-2 border-ink pt-3">
                <span className="font-mono text-xs text-slate">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-1 font-display text-base font-bold text-ink">
                  {s.label}
                </h3>
                <p className="mt-1.5 text-sm text-slate">{s.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
            £14.99/month. 14-day free trial.
          </h2>
          <p className="mt-2 text-sm text-slate">
            One plan. Unlimited notes. Cancel any time.
          </p>
          <Link href="/signup" className={buttonClasses('primary', 'mt-6 px-6 py-3 text-base')}>
            Start free trial
          </Link>
        </div>
      </section>

      <footer className="border-t border-steel py-8">
        <div className="mx-auto max-w-5xl px-6 text-xs text-slate">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p>Tilo WTN helps you create and store digital Waste Transfer Notes. UK regulations require records to be kept for at least 2 years — Tilo WTN keeps them indefinitely.</p>
            <div className="flex gap-4">
              <a href="/terms" className="underline hover:text-ink">Terms</a>
              <a href="/privacy" className="underline hover:text-ink">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-slate">{k}</dt>
      <dd className="text-right text-ink">{v}</dd>
    </div>
  );
}
