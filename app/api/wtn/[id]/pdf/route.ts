import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const { data: wtn } = await supabase
    .from('wtns')
    .select('pdf_path, reference_number')
    .eq('id', params.id)
    .single();

  if (!wtn?.pdf_path) {
    return NextResponse.json({ error: 'No PDF available for this note yet' }, { status: 404 });
  }

  const { data, error } = await supabase.storage
    .from('wtn-private')
    .createSignedUrl(wtn.pdf_path, 60 * 10);

  if (error || !data) {
    return NextResponse.json({ error: 'Could not generate a download link' }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}
