import { createClient } from '@/lib/supabase/server';
import { getCurrentWorkspace } from '@/lib/workspace';
import { Wizard } from '@/components/wtn-wizard/wizard';
import { redirect, notFound } from 'next/navigation';

export default async function EditDraftPage({ params }: { params: { id: string } }) {
  const { workspaceId, canWrite } = await getCurrentWorkspace();
  if (!canWrite) redirect('/dashboard/billing');

  const supabase = createClient();

  // Load the draft
  const { data: wtn } = await supabase
    .from('wtns')
    .select('*, wtn_parties(*)')
    .eq('id', params.id)
    .eq('workspace_id', workspaceId)
    .eq('status', 'draft')
    .single();

  if (!wtn) notFound();

  const transferorParty = wtn.wtn_parties?.find((p: any) => p.party_type === 'transferor');
  const transfereeParty = wtn.wtn_parties?.find((p: any) => p.party_type === 'transferee');

  // Load company profile for transferor defaults
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

  // Pre-fill wizard with existing draft data
  const draftDefaults = {
    transferor: transferorParty ? {
      full_name: transferorParty.full_name ?? '',
      company_name: transferorParty.company_name ?? '',
      address_line_1: transferorParty.address_line_1 ?? '',
      address_line_2: transferorParty.address_line_2 ?? '',
      city: transferorParty.city ?? '',
      postcode: transferorParty.postcode ?? '',
      role_producer: transferorParty.role_producer ?? false,
      role_importer: transferorParty.role_importer ?? false,
      role_local_authority: transferorParty.role_local_authority ?? false,
      role_permit_holder: transferorParty.role_permit_holder ?? false,
      permit_number: transferorParty.permit_number ?? '',
      role_exemption_holder: transferorParty.role_exemption_holder ?? false,
      exemption_details: transferorParty.exemption_details ?? '',
      role_carrier: transferorParty.role_carrier ?? false,
      role_broker: transferorParty.role_broker ?? false,
      role_dealer: transferorParty.role_dealer ?? false,
      registration_number: transferorParty.registration_number ?? '',
    } : undefined,
    transferee: transfereeParty ? {
      full_name: transfereeParty.full_name ?? '',
      company_name: transfereeParty.company_name ?? '',
      address_line_1: transfereeParty.address_line_1 ?? '',
      address_line_2: transfereeParty.address_line_2 ?? '',
      city: transfereeParty.city ?? '',
      postcode: transfereeParty.postcode ?? '',
      role_producer: transfereeParty.role_producer ?? false,
      role_importer: transfereeParty.role_importer ?? false,
      role_local_authority: transfereeParty.role_local_authority ?? false,
      role_permit_holder: transfereeParty.role_permit_holder ?? false,
      permit_number: transfereeParty.permit_number ?? '',
      role_exemption_holder: transfereeParty.role_exemption_holder ?? false,
      exemption_details: transfereeParty.exemption_details ?? '',
      role_carrier: transfereeParty.role_carrier ?? false,
      role_broker: transfereeParty.role_broker ?? false,
      role_dealer: transfereeParty.role_dealer ?? false,
      registration_number: transfereeParty.registration_number ?? '',
    } : undefined,
    waste: wtn.waste_description ? {
      waste_description: wtn.waste_description ?? '',
      ewc_code: wtn.ewc_code ?? '',
      quantity: wtn.quantity ?? '',
      containment_type: wtn.containment_type ?? 'loose',
      containment_other: wtn.containment_other ?? '',
    } : undefined,
    transfer: wtn.place_of_transfer ? {
      transfer_date: wtn.transfer_date ?? '',
      transfer_time: wtn.transfer_time ?? '',
      place_of_transfer: wtn.place_of_transfer ?? '',
      broker_dealer_name: wtn.broker_dealer_name ?? '',
      broker_dealer_registration_number: wtn.broker_dealer_registration_number ?? '',
    } : undefined,
  };

  // Figure out which step to start on based on what's already filled in
  let initialStep = 0;
  if (draftDefaults.transferor) initialStep = 1;
  if (draftDefaults.transferee) initialStep = 2;
  if (draftDefaults.waste) initialStep = 3;
  if (draftDefaults.transfer) initialStep = 4;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Continue draft</h1>
      <p className="mt-1 text-sm text-slate">Pick up where you left off.</p>
      <div className="mt-6">
        <Wizard
          transferorDefaults={transferorDefaults}
          hasCompanyProfile={hasCompanyProfile}
          initialStep={0}
          draftId={params.id}
          cloneDefaults={draftDefaults as any}
        />
      </div>
    </div>
  );
}
