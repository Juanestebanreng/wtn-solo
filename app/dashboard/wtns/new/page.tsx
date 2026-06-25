import { createClient } from '@/lib/supabase/server';
import { getCurrentWorkspace } from '@/lib/workspace';
import { Wizard } from '@/components/wtn-wizard/wizard';
import { redirect } from 'next/navigation';

export default async function NewWtnPage() {
  const { workspaceId, canWrite } = await getCurrentWorkspace();
  if (!canWrite) redirect('/dashboard/billing');

  const supabase = createClient();
  const { data: profile } = await supabase
    .from('company_profiles')
    .select('*')
    .eq('workspace_id', workspaceId)
    .maybeSingle();

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

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">New transfer note</h1>
      <div className="mt-6">
        <Wizard transferorDefaults={transferorDefaults} />
      </div>
    </div>
  );
}
