'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StepTransferor } from './step-transferor';
import { StepTransferee } from './step-transferee';
import { StepWaste } from './step-waste';
import { StepTransfer } from './step-transfer';
import { StepSignatures } from './step-signatures';
import { StepReview } from './step-review';
import { saveDraft, finaliseWtn } from '@/app/dashboard/wtns/new/actions';
import type {
  TransferorInput,
  TransfereeInput,
  WasteDetailsInput,
  TransferDetailsInput,
  SignaturesInput,
} from '@/lib/validations/wtn';

// Steps 0-4 shown to user as "Step 1 of 5" through "Step 5 of 5"
// Step 5 is the review screen (not counted in the progress bar — it's the finalise action)
const STEP_LABELS = [
  'Your details',
  'Customer',
  'Waste details',
  'Transfer details',
  'Signatures',
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
function nowTime() {
  return new Date().toTimeString().slice(0, 5);
}

export function Wizard({
  transferorDefaults,
  hasCompanyProfile,
  initialStep = 0,
  cloneDefaults,
}: {
  transferorDefaults: Partial<TransferorInput>;
  hasCompanyProfile: boolean;
  initialStep?: number;
  cloneDefaults?: {
    transferor?: Partial<TransferorInput>;
    transferee?: Partial<TransfereeInput>;
    waste?: Partial<WasteDetailsInput>;
    transfer?: Partial<TransferDetailsInput>;
  };
}) {
  const router = useRouter();
  const [step, setStep] = useState(initialStep);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [transferor, setTransferor] = useState<TransferorInput | undefined>(
    cloneDefaults?.transferor as TransferorInput | undefined
  );
  const [transferee, setTransferee] = useState<TransfereeInput | undefined>(
    cloneDefaults?.transferee as TransfereeInput | undefined
  );
  const [waste, setWaste] = useState<WasteDetailsInput | undefined>(
    cloneDefaults?.waste as WasteDetailsInput | undefined
  );
  // For clones, reset date/time to now
  const [transfer, setTransfer] = useState<TransferDetailsInput | undefined>(
    cloneDefaults?.transfer?.place_of_transfer
      ? {
          place_of_transfer: cloneDefaults.transfer.place_of_transfer,
          transfer_date: todayIso(),
          transfer_time: nowTime(),
          broker_dealer_name: cloneDefaults.transfer.broker_dealer_name,
          broker_dealer_registration_number: cloneDefaults.transfer.broker_dealer_registration_number,
        }
      : undefined
  );
  const [signatures, setSignatures] = useState<SignaturesInput | undefined>();

  async function handleSaveDraft() {
    setSaving(true);
    setError(null);
    try {
      const id = await saveDraft({ transferor, transferee, waste, transfer });
      router.push(`/dashboard/wtns/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save draft');
    } finally {
      setSaving(false);
    }
  }

  async function handleFinalise() {
    if (!transferor || !transferee || !waste || !transfer || !signatures) return;
    setError(null);
    try {
      const id = await finaliseWtn({ transferor, transferee, waste, transfer, signatures });
      router.push(`/dashboard/wtns/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not finalise this note');
    }
  }

  const hasProgress = Boolean(transferor || transferee || waste || transfer);
  // Progress bar covers steps 0-4; step 5 (review) shares the bar filled
  const progressStep = Math.min(step, STEP_LABELS.length - 1);

  return (
    <div className="mx-auto max-w-xl">
      {/* Progress text + save draft */}
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          {step < STEP_LABELS.length ? (
            <>
              <p className="text-xs font-medium uppercase tracking-wide text-slate">
                Step {step + 1} of {STEP_LABELS.length}
              </p>
              <p className="text-sm font-semibold text-ink">{STEP_LABELS[step]}</p>
            </>
          ) : (
            <p className="text-sm font-semibold text-ink">Review &amp; finalise</p>
          )}
        </div>
        {hasProgress && step < 5 && (
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving}
            className="shrink-0 text-xs font-medium text-slate underline disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save draft & exit'}
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-6 flex gap-1">
        {STEP_LABELS.map((label, i) => (
          <div
            key={label}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= progressStep ? 'bg-ink' : 'bg-steel'
            }`}
          />
        ))}
      </div>

      {/* No company profile banner on step 0 */}
      {!hasCompanyProfile && step === 0 && (
        <div className="mb-4 rounded border border-amber bg-amber/10 px-3 py-2 text-sm text-ink">
          Save your business details once and we&rsquo;ll auto‑fill this step next time.{' '}
          <a href="/dashboard/settings" className="font-medium underline">
            Go to Company profile →
          </a>
        </div>
      )}

      {error && (
        <p className="mb-4 rounded border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      {step === 0 && (
        <StepTransferor
          defaultValues={transferor ?? transferorDefaults}
          onNext={(data) => { setTransferor(data); setStep(1); }}
        />
      )}
      {step === 1 && (
        <StepTransferee
          defaultValues={transferee ?? {}}
          onBack={() => setStep(0)}
          onNext={(data) => { setTransferee(data); setStep(2); }}
        />
      )}
      {step === 2 && (
        <StepWaste
          defaultValues={waste ?? {}}
          onBack={() => setStep(1)}
          onNext={(data) => { setWaste(data); setStep(3); }}
        />
      )}
      {step === 3 && (
        <StepTransfer
          defaultValues={transfer ?? { transfer_date: todayIso(), transfer_time: nowTime() }}
          onBack={() => setStep(2)}
          onNext={(data) => { setTransfer(data); setStep(4); }}
        />
      )}
      {step === 4 && (
        <StepSignatures
          defaultValues={signatures ?? {}}
          transferorName={transferor?.company_name ?? ''}
          transfereeName={transferee?.company_name ?? ''}
          onBack={() => setStep(3)}
          onNext={(data) => { setSignatures(data); setStep(5); }}
        />
      )}
      {step === 5 && transferor && transferee && waste && transfer && signatures && (
        <StepReview
          transferor={transferor}
          transferee={transferee}
          waste={waste}
          transfer={transfer}
          signatures={signatures}
          onBack={() => setStep(4)}
          onFinalise={handleFinalise}
        />
      )}
    </div>
  );
}
