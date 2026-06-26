'use server';

import { createClient } from '@/lib/supabase/server';
import { renderWtnPdf } from '@/lib/pdf';
import { revalidatePath } from 'next/cache';
import type {
  TransferorInput,
  TransfereeInput,
  WasteDetailsInput,
  TransferDetailsInput,
  SignaturesInput,
} from '@/lib/validations/wtn';

interface FinalisePayload {
  transferor: TransferorInput;
  transferee: TransfereeInput;
  waste: WasteDetailsInput;
  transfer: TransferDetailsInput;
  signatures: SignaturesInput;
}

async function getWorkspaceContext() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw new Error('Not signed in');

  const { data: membership } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .single();
  if (!membership) throw new Error('No workspace found for this account');

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, trial_ends_at')
    .eq('workspace_id', membership.workspace_id)
    .maybeSingle();

  const now = new Date();
  const trialActive = subscription?.trial_ends_at
    ? new Date(subscription.trial_ends_at) > now
    : false;
  const billingActive =
    subscription?.status === 'active' || subscription?.status === 'trialing';
  if (!trialActive && !billingActive) {
    throw new Error('Your trial has ended. Add a payment method to create new notes.');
  }

  return { supabase, user, workspaceId: membership.workspace_id as string };
}

function dataUrlToBuffer(dataUrl: string) {
  const base64 = dataUrl.split(',')[1] ?? '';
  return Buffer.from(base64, 'base64');
}

export async function saveDraft(payload: {
  transferor?: Partial<TransferorInput>;
  transferee?: Partial<TransfereeInput>;
  waste?: Partial<WasteDetailsInput>;
  transfer?: Partial<TransferDetailsInput>;
  draftId?: string;
}) {
  const { supabase, user, workspaceId } = await getWorkspaceContext();

  const wtnData = {
    workspace_id: workspaceId,
    status: 'draft' as const,
    transfer_date: payload.transfer?.transfer_date || null,
    transfer_time: payload.transfer?.transfer_time || null,
    place_of_transfer: payload.transfer?.place_of_transfer || null,
    broker_dealer_name: payload.transfer?.broker_dealer_name || null,
    broker_dealer_registration_number:
      payload.transfer?.broker_dealer_registration_number || null,
    waste_description: payload.waste?.waste_description || null,
    ewc_code: payload.waste?.ewc_code || null,
    quantity: payload.waste?.quantity || null,
    containment_type: payload.waste?.containment_type || null,
    containment_other: payload.waste?.containment_other || null,
    created_by: user.id,
  };

  let wtnId: string;

  if (payload.draftId) {
    const { error } = await supabase
      .from('wtns')
      .update(wtnData)
      .eq('id', payload.draftId)
      .eq('status', 'draft');
    if (error) throw new Error(error.message);
    wtnId = payload.draftId;
    await supabase.from('wtn_parties').delete().eq('wtn_id', wtnId);
  } else {
    const { data: wtn, error } = await supabase
      .from('wtns')
      .insert(wtnData)
      .select('id')
      .single();
    if (error || !wtn) throw new Error(error?.message || 'Could not save draft');
    wtnId = wtn.id;
  }

  const partyRows: Record<string, unknown>[] = [];
  if (payload.transferor) {
    partyRows.push({ wtn_id: wtnId, party_type: 'transferor', ...payload.transferor });
  }
  if (payload.transferee) {
    partyRows.push({ wtn_id: wtnId, party_type: 'transferee', ...payload.transferee });
  }
  if (partyRows.length) {
    await supabase.from('wtn_parties').insert(partyRows);
  }

  revalidatePath('/dashboard/wtns');
  return wtnId as string;
}

export async function finaliseWtn(payload: FinalisePayload) {
  const { supabase, user, workspaceId } = await getWorkspaceContext();
  const { transferor, transferee, waste, transfer, signatures } = payload;

  const { data: wtn, error: wtnError } = await supabase
    .from('wtns')
    .insert({
      workspace_id: workspaceId,
      status: 'final',
      transfer_date: transfer.transfer_date,
      transfer_time: transfer.transfer_time,
      place_of_transfer: transfer.place_of_transfer,
      broker_dealer_name: transfer.broker_dealer_name || null,
      broker_dealer_registration_number:
        transfer.broker_dealer_registration_number || null,
      waste_description: waste.waste_description,
      ewc_code: waste.ewc_code,
      quantity: waste.quantity,
      containment_type: waste.containment_type,
      containment_other: waste.containment_other || null,
      waste_hierarchy_confirmed: true,
      created_by: user.id,
      finalised_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (wtnError || !wtn) throw new Error(wtnError?.message || 'Could not create transfer note');

  const { error: partyError } = await supabase.from('wtn_parties').insert([
    { wtn_id: wtn.id, party_type: 'transferor', ...transferor },
    { wtn_id: wtn.id, party_type: 'transferee', ...transferee },
  ]);
  if (partyError) throw new Error(partyError.message);

  const transferorBuf = dataUrlToBuffer(signatures.transferor_signature_data);
  const transfereeBuf = dataUrlToBuffer(signatures.transferee_signature_data);
  const transferorPath = `${workspaceId}/signatures/${wtn.id}-transferor.png`;
  const transfereePath = `${workspaceId}/signatures/${wtn.id}-transferee.png`;

  const [u1, u2] = await Promise.all([
    supabase.storage
      .from('wtn-private')
      .upload(transferorPath, transferorBuf, { contentType: 'image/png', upsert: true }),
    supabase.storage
      .from('wtn-private')
      .upload(transfereePath, transfereeBuf, { contentType: 'image/png', upsert: true }),
  ]);
  if (u1.error) throw new Error(u1.error.message);
  if (u2.error) throw new Error(u2.error.message);

  const signedAt = new Date().toISOString();
  const transferorSigRow = {
    wtn_id: wtn.id,
    party_type: 'transferor' as const,
    signed_name: signatures.transferor_signed_name,
    represented_as: signatures.transferor_represented_as,
    signed_at: signedAt,
    signature_path: transferorPath,
  };
  const transfereeSigRow = {
    wtn_id: wtn.id,
    party_type: 'transferee' as const,
    signed_name: signatures.transferee_signed_name,
    represented_as: signatures.transferee_represented_as,
    signed_at: signedAt,
    signature_path: transfereePath,
  };

  const { error: sigError } = await supabase
    .from('wtn_signatures')
    .insert([transferorSigRow, transfereeSigRow]);
  if (sigError) throw new Error(sigError.message);

  const pdfBuffer = await renderWtnPdf(
    wtn,
    [
      { wtn_id: wtn.id, party_type: 'transferor', ...transferor },
      { wtn_id: wtn.id, party_type: 'transferee', ...transferee },
    ],
    [transferorSigRow, transfereeSigRow],
    {
      transferor: signatures.transferor_signature_data,
      transferee: signatures.transferee_signature_data,
    }
  );

  const pdfPath = `${workspaceId}/pdfs/${wtn.id}.pdf`;
  const { error: pdfErr } = await supabase.storage
    .from('wtn-private')
    .upload(pdfPath, pdfBuffer, { contentType: 'application/pdf', upsert: true });
  if (pdfErr) throw new Error(pdfErr.message);

  await supabase.from('wtns').update({ pdf_path: pdfPath }).eq('id', wtn.id);

  revalidatePath('/dashboard/wtns');
  revalidatePath('/dashboard');
  return wtn.id as string;
}
