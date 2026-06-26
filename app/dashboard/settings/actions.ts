'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function saveCompanyProfile(formData: FormData) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect('/login');

  const { data: membership } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .single();
  if (!membership) throw new Error('No workspace found for this account');

  const payload = {
    workspace_id: membership.workspace_id,
    company_name: String(formData.get('company_name') || ''),
    contact_name: String(formData.get('contact_name') || ''),
    address_line_1: String(formData.get('address_line_1') || ''),
    address_line_2: String(formData.get('address_line_2') || ''),
    city: String(formData.get('city') || ''),
    postcode: String(formData.get('postcode') || ''),
    sic_code: String(formData.get('sic_code') || ''),
    notification_email: String(formData.get('notification_email') || ''),
    phone: String(formData.get('phone') || ''),
    email: String(formData.get('email') || ''),
    carrier_registration_number: String(formData.get('carrier_registration_number') || ''),
    permit_number: String(formData.get('permit_number') || ''),
    is_carrier: formData.get('is_carrier') === 'on',
    is_broker: formData.get('is_broker') === 'on',
    is_dealer: formData.get('is_dealer') === 'on',
    is_permit_holder: formData.get('is_permit_holder') === 'on',
    is_exemption_holder: formData.get('is_exemption_holder') === 'on',
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('company_profiles')
    .upsert(payload, { onConflict: 'workspace_id' });

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/settings');
  redirect('/dashboard/settings?saved=1');
}
