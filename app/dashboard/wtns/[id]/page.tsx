import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentWorkspace } from '@/lib/workspace';
import { Badge, Card } from '@/components/ui/card';
import { buttonClasses } from '@/components/ui/button';
import { formatUkDate } from '@/lib/utils';
import { notFound } from 'next/navigation';

export default async function WtnDetailPage({ params }: { params: { id: string } }) {
  const { workspaceId } = await getCurrentWorkspace();
  const supabase = createClient();

  const { data: wtn } = await supabase
    .from('wtns')
    .select('*, wtn_parties(*), wtn_signatures(*)')
    .eq('id', params.id)
    .eq('workspace_id', workspaceId)
    .single();

  if (!wtn) notFound();

  const transferor = wtn.wtn_parties.find((p: any) => p.party_type === 'transferor');
  const transferee = wtn.wtn_parties.find((p: any) => p.party_type === 'transferee');

  let pdfUrl: string | null = null;
  if (wtn.pdf_path) {
    const { data } = await supabase.storage
      .from('wtn-private')
      .createSignedUrl(wtn.pdf_path, 60 * 10);
    pdfUrl = data?.signedUrl ?? null;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="no-print flex flex-wrap items-center justify-between gap-2">
        <Link href="/dashboard/wtns" className="text-sm text-slate hover:underline">
          ← All transfer notes
        </Link>
        <div className="flex flex-wrap gap-2">
          {pdfUrl && (
            <a href={pdfUrl} target="_blank" rel="noreferrer" className={buttonClasses('secondary')}>
              Download PDF
            </a>
          )}
          {/* Clone button — available for any finalised WTN */}
          {wtn.status === 'final' && (
            <Link
              href={`/dashboard/wtns/new?clone=${wtn.id}`}
              className={buttonClasses('primary')}
            >
              Use for new job
            </Link>
          )}
          {wtn.status === 'final' && (
            <Link
              href={`/dashboard/wtns/new?correct=${wtn.id}`}
              className={buttonClasses('ghost')}
            >
              Create corrected copy
            </Link>
          )}
        </div>
      </div>

      <Card className="print-page mt-4">
        <div className="flex items-start justify-between border-b border-steel pb-4">
          <div>
            <h1 className="font-display text-xl font-bold text-ink">
              Waste Transfer Note
            </h1>
            <p className="font-mono text-sm text-slate">{wtn.reference_number}</p>
          </div>
          <Badge tone={wtn.status === 'final' ? 'compliant' : 'default'}>
            {wtn.status}
          </Badge>
        </div>

        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <PartyView title="Transferor" party={transferor} />
          <PartyView title="Transferee" party={transferee} />
        </div>

        <Section title="Waste">
          <Field label="Description" value={wtn.waste_description} />
          <Field label="EWC code" value={wtn.ewc_code} />
          <Field label="Quantity" value={wtn.quantity} />
          <Field
            label="Containment"
            value={
              wtn.containment_type === 'other' ? wtn.containment_other : wtn.containment_type
            }
          />
        </Section>

        <Section title="Transfer">
          <Field
            label="Date / time"
            value={`${formatUkDate(wtn.transfer_date)} at ${wtn.transfer_time}`}
          />
          <Field label="Place" value={wtn.place_of_transfer} />
          {wtn.broker_dealer_name && (
            <Field label="Broker / dealer" value={wtn.broker_dealer_name} />
          )}
        </Section>

        {wtn.wtn_signatures?.length > 0 && (
          <Section title="Signatures">
            <div className="grid gap-4 sm:grid-cols-2">
              {wtn.wtn_signatures.map((s: any) => (
                <div key={s.id} className="text-sm">
                  <p className="text-xs uppercase tracking-wide text-slate">{s.party_type}</p>
                  <p className="text-ink">{s.signed_name}</p>
                  <p className="text-slate">{s.represented_as}</p>
                  <p className="text-xs text-slate">
                    Signed {new Date(s.signed_at).toLocaleString('en-GB')}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        )}
      </Card>
    </div>
  );
}

function PartyView({ title, party }: { title: string; party: any }) {
  if (!party) return null;
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate">{title}</p>
      <p className="mt-1 font-medium text-ink">{party.full_name}</p>
      <p className="text-sm text-slate">{party.company_name}</p>
      <p className="text-sm text-slate">
        {party.address_line_1}, {party.city} {party.postcode}
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 border-t border-steel pt-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate">{title}</p>
      <div className="space-y-1 text-sm">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      <span className="w-32 shrink-0 text-slate">{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}
