'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transferorSchema, type TransferorInput } from '@/lib/validations/wtn';
import { PartyFields } from './party-fields';
import { Button } from '@/components/ui/button';

export function StepTransferor({
  defaultValues,
  onNext,
}: {
  defaultValues: Partial<TransferorInput>;
  onNext: (data: TransferorInput) => void;
}) {
  const form = useForm<TransferorInput>({
    resolver: zodResolver(transferorSchema),
    defaultValues,
  });

  return (
    <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-ink">1. Transferor</h2>
        <p className="mt-1 text-sm text-slate">
          The person or business handing over the waste. Prefilled from your
          company profile — edit if a different entity is transferring.
        </p>
      </div>
      <PartyFields form={form} isTransferor />
      <div className="flex justify-end">
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
}
