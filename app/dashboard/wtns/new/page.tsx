import { createClient } from '@/lib/supabase/server';
import { getCurrentWorkspace } from '@/lib/workspace';
import { Wizard } from '@/components/wtn-wizard/wizard';
import { redirect } from 'next/navigation';

export default async function NewWtnPage({
  searchParams,
}: {
  searchParams: { clone?: string };
}) {
  const { workspaceId, canWrite } = await getCurrentWorkspace();
  if (!canWrite) redirect('/dashboard/billing');

  const supabase = createClient();

  // Load company profile for transferor prefill
  const { data: profile } = await supabase
    .from('company_profiles')
    .select('*')
    .eq('workspace_id', workspaceId)
    .maybeSingle();

  const hasCompanyProfile = Boolean(profile?.company_name);

  const transferorDefaults = profile
    ? {
        full_name: profile.contact_name ?? '',
        company_name: profile.company_name ?? '',
        address_line_1: profile.address_line_1 ?? '',
        address_line_2: profile.address_line_2 ?? '',
        city: profile.city ?? '',
        postcode: profile.postcode ?? '',
        sic_code: profile.sic_code ?? '',
        role_permit_holder: profile.is_permit_holder ?? false,
        permit_number: profile.permit_number ?? '',
        role_exemption_holder: profile.is_exemption_holder ?? false,
        role_carrier: profile.is_carrier ?? false,
        role_broker: profile.is_broker ?? false,
        role_dealer: profile.is_dealer ?? false,
        registration_number: profile.carrier_registration_number ?? '',
      }
    : {};

  // Clone mode: load source WTN and copy its fields
  let cloneDefaults: object | undefined;
  if (searchParams.clone) {
    const { data: source } = await supabase
      .from('wtns')
      .select('*, wtn_parties(*)')
      .eq('id', searchParams.clone)
      .eq('workspace_id', workspaceId) // RLS: only own workspace
      .single();

    if (source) {
      const sourceTransferor = source.wtn_parties?.find(
        (p: { party_type: string }) => p.party_type === 'transferor'
      );
      const sourceTransferee = source.wtn_parties?.find(
        (p: { party_type: string }) => p.party_type === 'transferee'
      );

      cloneDefaults = {
        transferor: sourceTransferor
          ? {
              full_name: sourceTransferor.full_name,
              company_name: sourceTransferor.company_name,
              address_line_1: sourceTransferor.address_line_1,
              address_line_2: sourceTransferor.address_line_2,
              city: sourceTransferor.city,
              postcode: sourceTransferor.postcode,
              sic_code: source.sic_code ?? '',
              role_producer: sourceTransferor.role_producer,
              role_importer: sourceTransferor.role_importer,
              role_local_authority: sourceTransferor.role_local_authority,
              role_permit_holder: sourceTransferor.role_permit_holder,
              permit_number: sourceTransferor.permit_number,
              role_exemption_holder: sourceTransferor.role_exemption_holder,
              exemption_details: sourceTransferor.exemption_details,
              role_carrier: sourceTransferor.role_carrier,
              role_broker: sourceTransferor.role_broker,
              role_dealer: sourceTransferor.role_dealer,
              registration_number: sourceTransferor.registration_number,
            }
          : undefined,
        transferee: sourceTransferee
          ? {
              full_name: sourceTransferee.full_name,
              company_name: sourceTransferee.company_name,
              address_line_1: sourceTransferee.address_line_1,
              address_line_2: sourceTransferee.address_line_2,
              city: sourceTransferee.city,
              postcode: sourceTransferee.postcode,
              role_producer: sourceTransferee.role_producer,
              role_importer: sourceTransferee.role_importer,
              role_local_authority: sourceTransferee.role_local_authority,
              role_permit_holder: sourceTransferee.role_permit_holder,
              permit_number: sourceTransferee.permit_number,
              role_exemption_holder: sourceTransferee.role_exemption_holder,
              exemption_details: sourceTransferee.exemption_details,
              role_carrier: sourceTransferee.role_carrier,
              role_broker: sourceTransferee.role_broker,
              role_dealer: sourceTransferee.role_dealer,
              registration_number: sourceTransferee.registration_number,
            }
          : undefined,
        waste: {
          waste_description: source.waste_description,
          ewc_code: source.ewc_code,
          quantity: source.quantity,
          containment_type: source.containment_type,
          containment_other: source.containment_other,
        },
        transfer: {
          // date/time intentionally omitted — wizard resets them to now
          place_of_transfer: source.place_of_transfer,
          broker_dealer_name: source.broker_dealer_name,
          broker_dealer_registration_number: source.broker_dealer_registration_number,
        },
      };
    }
  }

  const isClone = Boolean(cloneDefaults);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">
        {isClone ? 'New WTN from existing job' : 'New transfer note'}
      </h1>
      {isClone && (
        <p className="mt-1 text-sm text-slate">
          All details copied — just confirm, then collect fresh signatures.
        </p>
      )}
      <div className="mt-6">
        <Wizard
          transferorDefaults={transferorDefaults}
          hasCompanyProfile={hasCompanyProfile}
          initialStep={isClone ? 3 : 0}
          cloneDefaults={cloneDefaults}
        />
      </div>
    </div>
  );
}
