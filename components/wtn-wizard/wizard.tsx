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

const STEP_LABELS = ['Transferor', 'Transferee', 'Waste', 'Transfer', 'Sign', 'Review'];

export function Wizard({
  transferorDefaults,
}: {
  transferorDefaults: Partial<TransferorInput>;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [transferor, setTransferor] = useState<TransferorInput | undefined>();
  const [transferee, setTransferee] = useState<TransfereeInput | undefined>();
  const [waste, setWaste] = useState<WasteDetailsInput | undefined>();
  const [transfer, setTransfer] = useState<TransferDetailsInput | undefined>();
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

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <ol className="flex gap-1.5">
          {STEP_LABELS.map((label, i) => (
            <li
              key={label}
              className={`h-1.5 w-8 rounded-full ${i <= step ? 'bg-ink' : 'bg-steel'}`}
              title={label}
            />
          ))}
        </ol>
        {hasProgress && (
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving}
            className="text-xs font-medium text-slate underline disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save draft & exit'}
          </button>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      {step === 0 && (
        <StepTransferor
          defaultValues={transferor ?? transferorDefaults}
          onNext={(data) => {
            setTransferor(data);
            setStep(1);
          }}
        />
      )}
      {step === 1 && (
        <StepTransferee
          defaultValues={transferee ?? {}}
          onBack={() => setStep(0)}
          onNext={(data) => {
            setTransferee(data);
            setStep(2);
          }}
        />
      )}
      {step === 2 && (
        <StepWaste
          defaultValues={waste ?? {}}
          onBack={() => setStep(1)}
          onNext={(data) => {
            setWaste(data);
            setStep(3);
          }}
        />
      )}
      {step === 3 && (
        <StepTransfer
          defaultValues={transfer ?? {}}
          onBack={() => setStep(2)}
          onNext={(data) => {
            setTransfer(data);
            setStep(4);
          }}
        />
      )}
      {step === 4 && (
        <StepSignatures
          defaultValues={signatures ?? {}}
          transferorName={transferor?.company_name ?? ''}
          transfereeName={transferee?.company_name ?? ''}
          onBack={() => setStep(3)}
          onNext={(data) => {
            setSignatures(data);
            setStep(5);
          }}
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
