import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function getCurrentWorkspace() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) redirect('/login');

  const { data: membership } = await supabase
    .from('workspace_members')
    .select('workspace_id, role, workspaces(id, name, slug)')
    .eq('user_id', user.id)
    .single();

  if (!membership) {
    // Trigger hasn't provisioned the workspace yet (e.g. right after
    // signup before the DB trigger ran) — send them back to refresh.
    redirect('/login');
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('workspace_id', membership.workspace_id)
    .maybeSingle();

  const now = new Date();
  const trialActive = subscription?.trial_ends_at
    ? new Date(subscription.trial_ends_at) > now
    : false;
  const billingActive = subscription?.status === 'active' || subscription?.status === 'trialing';
  const canWrite = trialActive || billingActive;

  return {
    user,
    workspaceId: membership.workspace_id as string,
    role: membership.role as string,
    subscription,
    canWrite,
    trialActive,
  };
}
