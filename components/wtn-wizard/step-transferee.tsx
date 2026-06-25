'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transfereeSchema, type TransfereeInput } from '@/lib/validations/wtn';
import { PartyFields } from './party-fields';
import { Button } from '@/components/ui/button';

export function StepTransferee({
  defaultValues,
  onNext,
  onBack,
}: {
  defaultValues: Partial<TransfereeInput>;
  onNext: (data: TransfereeInput) => void;
  onBack: () => void;
}) {
  const form = useForm<TransfereeInput>({
    resolver: zodResolver(transfereeSchema),
    defaultValues,
  });

  return (
    <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-ink">2. Transferee</h2>
        <p className="mt-1 text-sm text-slate">
          The person or business receiving the waste.
        </p>
      </div>
      <PartyFields form={form} isTransferor={false} />
      <div className="flex justify-between">
        <Button type="button" variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
}
