import { createClient } from '@/lib/supabase/server';
import { getCurrentWorkspace } from '@/lib/workspace';
import { buttonClasses } from '@/components/ui/button';
import Link from 'next/link';
import NotesClient from './notes-client';

export default async function WtnListPage() {
  const { workspaceId, canWrite } = await getCurrentWorkspace();
  const supabase = createClient();

  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

  const { data: wtns } = await supabase
    .from('wtns')
    .select('id, reference_number, status, transfer_date, waste_description, ewc_code, pdf_path, wtn_parties(company_name, party_type)')
    .eq('workspace_id', workspaceId)
    .eq('status', 'final')
    .gte('created_at', threeYearsAgo.toISOString())
    .order('transfer_date', { ascending: false })
    .limit(500);

  const { data: profile } = await supabase
    .from('company_profiles')
    .select('notification_email')
    .eq('workspace_id', workspaceId)
    .maybeSingle();

  const signedUrls: Record<string, string> = {};
  for (const wtn of wtns ?? []) {
    if (wtn.pdf_path) {
      const { data } = await supabase.storage
        .from('wtn-private')
        .createSignedUrl(wtn.pdf_path, 60 * 60);
      if (data?.signedUrl) signedUrls[wtn.id] = data.signedUrl;
    }
  }

  return (
    <NotesClient
      wtns={(wtns ?? []) as any}
      defaultEmail={profile?.notification_email || ''}
      canWrite={canWrite}
      signedUrls={signedUrls}
    />
  );
}
