import Link from 'next/link';
import { getCurrentWorkspace } from '@/lib/workspace';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '⊞' },
  { href: '/dashboard/wtns', label: 'Notes', icon: '📋' },
  { href: '/dashboard/settings', label: 'Profile', icon: '🏢' },
  { href: '/dashboard/billing', label: 'Billing', icon: '💳' },
];

async function logout() {
  'use server';
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { canWrite, trialActive, subscription } = await getCurrentWorkspace();

  return (
    <div className="min-h-screen bg-paper">
      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="no-print hidden w-56 shrink-0 border-r border-steel bg-white px-4 py-6 md:block">
          <Link href="/" className="font-display text-lg font-bold text-ink">
            Tilo&nbsp;WTN
          </Link>
          <nav className="mt-8 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded px-3 py-2 text-sm font-medium text-ink hover:bg-paper2"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={logout} className="mt-8">
            <button className="rounded px-3 py-2 text-sm text-slate hover:bg-paper2">
              Log out
            </button>
          </form>
        </aside>

        <div className="flex-1 pb-20 md:pb-0">
          {/* Mobile top bar */}
          <div className="no-print flex items-center justify-between border-b border-steel bg-white px-4 py-3 md:hidden">
            <Link href="/" className="font-display text-lg font-bold text-ink">
              Tilo&nbsp;WTN
            </Link>
            <form action={logout}>
              <button className="text-sm text-slate">Log out</button>
            </form>
          </div>

          {!canWrite && (
            <div className="no-print border-b border-amber/40 bg-amber/10 px-4 py-2.5 text-sm text-ink">
              Your trial has ended.{' '}
              <Link href="/dashboard/billing" className="font-medium underline">
                Add a payment method
              </Link>
            </div>
          )}
          {canWrite && trialActive && (
            <div className="no-print border-b border-steel bg-paper2 px-4 py-2 text-xs text-slate">
              Free trial active
              {subscription?.trial_ends_at &&
                ` — ends ${new Date(subscription.trial_ends_at).toLocaleDateString('en-GB')}`}
            </div>
          )}

          <main className="px-4 py-6 md:px-8">{children}</main>
        </div>
      </div>

      {/* Mobile bottom navigation bar */}
      <nav className="no-print fixed bottom-0 left-0 right-0 z-50 flex border-t border-steel bg-white md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 py-3 text-ink hover:bg-paper2"
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
