import { createClient } from '@/lib/supabase/server';
import { getCurrentWorkspace } from '@/lib/workspace';
import { Card, Badge } from '@/components/ui/card';
import { BillingButton } from '@/components/billing-button';

export default async function BillingPage() {
  const { workspaceId } = await getCurrentWorkspace();
  const supabase = createClient();
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('workspace_id', workspaceId)
    .maybeSingle();

  const trialEnds = subscription?.trial_ends_at
    ? new Date(subscription.trial_ends_at)
    : null;
  const trialActive = trialEnds ? trialEnds > new Date() : false;
  const hasBilling = Boolean(subscription?.stripe_customer_id);
  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-2xl font-bold text-ink">Billing</h1>

      <Card className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-ink">Tilo WTN — £15/month</p>
            <p className="mt-1 text-sm text-slate">
              {isActive && 'Subscription active'}
              {!isActive && trialActive && trialEnds &&
                `Free trial — ends ${trialEnds.toLocaleDateString('en-GB')}`}
              {!isActive && !trialActive && 'No active subscription'}
            </p>
          </div>
          <Badge tone={isActive || trialActive ? 'compliant' : 'default'}>
            {isActive ? 'active' : trialActive ? 'trial' : subscription?.status || 'none'}
          </Badge>
        </div>

        <div className="mt-5">
          {hasBilling ? (
            <BillingButton endpoint="/api/stripe/portal">Manage billing</BillingButton>
          ) : (
            <BillingButton endpoint="/api/stripe/checkout">Add payment method</BillingButton>
          )}
        </div>
      </Card>
    </div>
  );
}
