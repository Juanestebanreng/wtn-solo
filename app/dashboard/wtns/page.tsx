import { formatUkDate } from '@/lib/utils';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentWorkspace } from '@/lib/workspace';
import { Input } from '@/components/ui/input';
import { Button, buttonClasses } from '@/components/ui/button';
import { Badge } from '@/components/ui/card';

interface SearchParams {
  company?: string;
  postcode?: string;
  date?: string;
  ewc?: string;
}

export default async function WtnListPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { workspaceId, canWrite } = await getCurrentWorkspace();
  const supabase = createClient();

  let query = supabase
    .from('wtns')
    .select(
      'id, reference_number, status, transfer_date, waste_description, ewc_code, wtn_parties!inner(company_name, postcode)'
    )
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (searchParams.company) {
    query = query.ilike('wtn_parties.company_name', `%${searchParams.company}%`);
  }
  if (searchParams.postcode) {
    query = query.ilike('wtn_parties.postcode', `%${searchParams.postcode}%`);
  }
  if (searchParams.date) {
    query = query.eq('transfer_date', searchParams.date);
  }
  if (searchParams.ewc) {
    query = query.ilike('ewc_code', `%${searchParams.ewc}%`);
  }

  const { data: results } = await query.limit(100);

  const hasFilters = searchParams.company || searchParams.postcode || searchParams.date || searchParams.ewc;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Transfer notes</h1>
        {canWrite && (
          <Link href="/dashboard/wtns/new" className={buttonClasses('primary')}>
            New transfer note
          </Link>
        )}
      </div>

      <form className="mt-4 grid gap-3 rounded border border-steel bg-white p-4 sm:grid-cols-4">
        <Input name="company" placeholder="Company name" defaultValue={searchParams.company} />
        <Input name="postcode" placeholder="Postcode" defaultValue={searchParams.postcode} />
        <Input name="date" type="date" defaultValue={searchParams.date} />
        <Input name="ewc" placeholder="EWC code" defaultValue={searchParams.ewc} />
        <div className="sm:col-span-4">
          <Button type="submit" variant="secondary">Search</Button>
          {hasFilters && (
            <Link href="/dashboard/wtns" className="ml-3 text-sm text-slate underline">
              Clear filters
            </Link>
          )}
        </div>
      </form>

      <div className="mt-4 divide-y divide-steel rounded border border-steel bg-white">
        {(results ?? []).length === 0 && !hasFilters && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm font-medium text-ink">No transfer notes yet</p>
            <p className="mt-1 text-sm text-slate">Create your first one to get started.</p>
            {canWrite && (
              <Link href="/dashboard/wtns/new" className={`mt-4 inline-block ${buttonClasses('primary')}`}>
                New transfer note
              </Link>
            )}
          </div>
        )}
        {(results ?? []).length === 0 && hasFilters && (
          <p className="px-4 py-6 text-sm text-slate">No matching transfer notes.</p>
        )}
        {results?.map((w: any) => (
          <Link
            key={w.id}
            href={`/dashboard/wtns/${w.id}`}
            className={`flex items-center justify-between px-4 py-3 text-sm hover:bg-paper2 ${w.status === 'draft' ? 'bg-amber/5' : ''}`}
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-mono text-ink">{w.reference_number}</p>
                {w.status === 'draft' && (
                  <span className="rounded bg-amber/20 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-dark">
                    Draft
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-slate">
                {w.waste_description ? `${w.waste_description} — EWC ${w.ewc_code}` : 'Incomplete draft'}
              </p>
            </div>
            <div className="text-right">
              {w.status === 'final' && (
                <Badge tone="compliant">Final</Badge>
              )}
              <p className="mt-1 text-xs text-slate">
                {w.transfer_date ? formatUkDate(w.transfer_date) : 'No date yet'}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-4 text-xs text-slate">
        Records are kept indefinitely. UK regulations require a minimum of 2 years retention.
      </p>
    </div>
  );
}
