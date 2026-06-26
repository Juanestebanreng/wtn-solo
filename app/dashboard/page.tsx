import { formatUkDate } from '@/lib/utils';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentWorkspace } from '@/lib/workspace';
import { buttonClasses } from '@/components/ui/button';
import { Card, Badge } from '@/components/ui/card';
import type { Wtn } from '@/lib/types';

export default async function DashboardPage() {
  const { workspaceId, canWrite } = await getCurrentWorkspace();
  const supabase = createClient();

  const { data: recent } = await supabase
    .from('wtns')
    .select('id, reference_number, status, transfer_date, waste_description')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
    .limit(5);

  const { count: totalCount } = await supabase
    .from('wtns')
    .select('id', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: monthCount } = await supabase
    .from('wtns')
    .select('id', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .gte('created_at', startOfMonth.toISOString());

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Overview</h1>
        {canWrite && (
          <Link href="/dashboard/wtns/new" className={buttonClasses('primary')}>
            New transfer note
          </Link>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-slate">
            This month
          </p>
          <p className="mt-1 font-display text-3xl font-bold tabular text-ink">
            {monthCount ?? 0}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-slate">
            All time
          </p>
          <p className="mt-1 font-display text-3xl font-bold tabular text-ink">
            {totalCount ?? 0}
          </p>
        </Card>
      </div>

      <h2 className="mt-8 font-display text-lg font-bold text-ink">Recent notes</h2>
      <div className="mt-3 divide-y divide-steel rounded border border-steel bg-white">
        {(recent ?? []).length === 0 && (
          <p className="px-4 py-6 text-sm text-slate">
            No transfer notes yet. Create your first one to see it here.
          </p>
        )}
        {(recent as Pick<Wtn, 'id' | 'reference_number' | 'status' | 'transfer_date' | 'waste_description'>[] | null)?.map(
          (w) => (
            <Link
              key={w.id}
              href={`/dashboard/wtns/${w.id}`}
              className="flex items-center justify-between px-4 py-3 text-sm hover:bg-paper2"
            >
              <div>
                <p className="font-mono text-ink">{w.reference_number}</p>
                <p className="mt-0.5 text-slate">{w.waste_description}</p>
              </div>
              <div className="text-right">
                <Badge tone={w.status === 'final' ? 'compliant' : 'default'}>
                  {w.status}
                </Badge>
                <p className="mt-1 text-xs text-slate">
                  {w.transfer_date ? formatUkDate(w.transfer_date) : "—"}
                </p>
              </div>
            </Link>
          )
        )}
      </div>
    </div>
  );
}
