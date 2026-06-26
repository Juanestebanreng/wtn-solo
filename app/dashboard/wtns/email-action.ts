'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentWorkspace } from '@/lib/workspace';
import { Resend } from 'resend';

export async function sendWtnsByEmail(wtnIds: string[], recipientEmail: string) {
  const { supabase, workspaceId } = await getCurrentWorkspace();
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data: wtns } = await supabase
    .from('wtns')
    .select('id, reference_number, pdf_path, transfer_date')
    .in('id', wtnIds)
    .eq('workspace_id', workspaceId)
    .eq('status', 'final');

  if (!wtns || wtns.length === 0) throw new Error('No finalised WTNs found');

  const attachments: { filename: string; content: Buffer }[] = [];

  for (const wtn of wtns) {
    if (!wtn.pdf_path) continue;
    const { data: fileData, error } = await supabase.storage
      .from('wtn-private')
      .download(wtn.pdf_path);
    if (error || !fileData) continue;
    const arrayBuffer = await fileData.arrayBuffer();
    const safeRef = (wtn.reference_number || wtn.id).replace(/[^a-zA-Z0-9-]/g, '-');
    attachments.push({
      filename: `${safeRef}.pdf`,
      content: Buffer.from(arrayBuffer),
    });
  }

  if (attachments.length === 0) throw new Error('No PDFs could be retrieved');

  const noteWord = attachments.length === 1 ? 'note' : 'notes';
  const refs = wtns.map(w => w.reference_number).filter(Boolean).join(', ');

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'records@tilostudio.net',
    to: recipientEmail,
    subject: `Waste Transfer ${noteWord.charAt(0).toUpperCase() + noteWord.slice(1)}: ${refs}`,
    html: `<p>Please find attached ${attachments.length} Waste Transfer ${noteWord} as requested.</p><p>References: ${refs}</p><p style="color:#888;font-size:12px">Sent via Tilo WTN &mdash; tilostudio.net</p>`,
    attachments,
  });

  return { sent: attachments.length };
}
