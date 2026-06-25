import { createClient } from '@/lib/supabase/server';
import { getCurrentWorkspace } from '@/lib/workspace';
import { Input, Label } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { saveCompanyProfile } from './actions';

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { saved?: string };
}) {
  const { workspaceId } = await getCurrentWorkspace();
  const supabase = createClient();
  const { data: profile } = await supabase
    .from('company_profiles')
    .select('*')
    .eq('workspace_id', workspaceId)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-ink">Company profile</h1>
      <p className="mt-1 text-sm text-slate">
        Used to prefill the transferor on every new transfer note.
      </p>

      {searchParams.saved && (
        <p className="mt-4 rounded border border-compliant/30 bg-compliant-light px-3 py-2 text-sm text-compliant">
          Saved.
        </p>
      )}

      <form action={saveCompanyProfile} className="mt-6 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="company_name" required>
              Company name
            </Label>
            <Input id="company_name" name="company_name" defaultValue={profile?.company_name} required />
          </div>
          <div>
            <Label htmlFor="contact_name" required>
              Contact name
            </Label>
            <Input id="contact_name" name="contact_name" defaultValue={profile?.contact_name} required />
          </div>
        </div>

        <div>
          <Label htmlFor="address_line_1" required>
            Address line 1
          </Label>
          <Input id="address_line_1" name="address_line_1" defaultValue={profile?.address_line_1} required />
        </div>
        <div>
          <Label htmlFor="address_line_2">Address line 2</Label>
          <Input id="address_line_2" name="address_line_2" defaultValue={profile?.address_line_2 ?? ''} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="city" required>
              Town / city
            </Label>
            <Input id="city" name="city" defaultValue={profile?.city} required />
          </div>
          <div>
            <Label htmlFor="postcode" required>
              Postcode
            </Label>
            <Input id="postcode" name="postcode" defaultValue={profile?.postcode} required />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={profile?.phone ?? ''} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={profile?.email ?? ''} />
          </div>
        </div>

        <div>
          <Label htmlFor="sic_code" required>
            SIC code
          </Label>
          <Input id="sic_code" name="sic_code" defaultValue={profile?.sic_code ?? ''} placeholder="e.g. 38110" />
        </div>

        <div>
          <Label>Status</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            <Checkbox label="Registered carrier" name="is_carrier" defaultChecked={profile?.is_carrier} />
            <Checkbox label="Broker" name="is_broker" defaultChecked={profile?.is_broker} />
            <Checkbox label="Dealer" name="is_dealer" defaultChecked={profile?.is_dealer} />
            <Checkbox label="Permit holder" name="is_permit_holder" defaultChecked={profile?.is_permit_holder} />
            <Checkbox
              label="Registered exemption holder"
              name="is_exemption_holder"
              defaultChecked={profile?.is_exemption_holder}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="carrier_registration_number">Carrier registration number</Label>
            <Input
              id="carrier_registration_number"
              name="carrier_registration_number"
              defaultValue={profile?.carrier_registration_number ?? ''}
            />
          </div>
          <div>
            <Label htmlFor="permit_number">Permit number</Label>
            <Input id="permit_number" name="permit_number" defaultValue={profile?.permit_number ?? ''} />
          </div>
        </div>

        <Button type="submit">Save</Button>
      </form>
    </div>
  );
}
