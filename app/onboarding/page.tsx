import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentWorkspace } from '@/lib/workspace';
import { Input, Label } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

async function saveAndContinue(formData: FormData) {
  'use server';
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect('/login');

  const { data: membership } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', userData.user.id)
    .single();
  if (!membership) redirect('/dashboard');

  await supabase.from('company_profiles').upsert({
    workspace_id: membership.workspace_id,
    company_name: String(formData.get('company_name') || ''),
    contact_name: String(formData.get('contact_name') || ''),
    address_line_1: String(formData.get('address_line_1') || ''),
    city: String(formData.get('city') || ''),
    postcode: String(formData.get('postcode') || ''),
    sic_code: String(formData.get('sic_code') || ''),
    permit_number: String(formData.get('permit_number') || ''),
  }, { onConflict: 'workspace_id' });

  redirect('/dashboard');
}

export default function OnboardingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 overflow-x-hidden py-12">
      <div className="w-full max-w-md">
        <span className="font-display text-lg font-bold tracking-tight text-ink">
          Tilo WTN
        </span>

        <h1 className="mt-6 font-display text-2xl font-bold text-ink">
          Set up your company profile
        </h1>
        <p className="mt-2 text-sm text-slate">
          Save your details once and we&apos;ll pre-fill them on every new job — no typing your name and address each time.
        </p>

        <div className="mt-4 rounded border border-steel bg-white px-4 py-3 text-sm text-slate">
          Your name, address, SIC code and permit number will auto-fill on every new Waste Transfer Note. You can update these any time under <strong className="font-medium text-ink">Profile</strong>.
        </div>

        <form action={saveAndContinue} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="company_name" required>Company name</Label>
              <Input id="company_name" name="company_name" required />
            </div>
            <div>
              <Label htmlFor="contact_name" required>Your name</Label>
              <Input id="contact_name" name="contact_name" required />
            </div>
          </div>
          <div>
            <Label htmlFor="address_line_1" required>Address line 1</Label>
            <Input id="address_line_1" name="address_line_1" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="city" required>Town / city</Label>
              <Input id="city" name="city" required />
            </div>
            <div>
              <Label htmlFor="postcode" required>Postcode</Label>
              <Input id="postcode" name="postcode" required />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="sic_code" required>SIC code</Label>
              <Input id="sic_code" name="sic_code" placeholder="e.g. 38110" required />
            </div>
            <div>
              <Label htmlFor="permit_number">Permit number</Label>
              <Input id="permit_number" name="permit_number" placeholder="Optional" />
            </div>
          </div>

          <Button type="submit" className="w-full">Save and go to dashboard</Button>
        </form>

        <div className="mt-4 text-center">
          <Link href="/dashboard" className="text-sm text-slate underline hover:text-ink">
            Skip for now — I&apos;ll fill this in under Profile later
          </Link>
        </div>
      </div>
    </main>
  );
}
