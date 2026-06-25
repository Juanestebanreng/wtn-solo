'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transferDetailsSchema, type TransferDetailsInput } from '@/lib/validations/wtn';
import { Input, Label, FieldError } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function StepTransfer({
  defaultValues,
  onNext,
  onBack,
}: {
  defaultValues: Partial<TransferDetailsInput>;
  onNext: (data: TransferDetailsInput) => void;
  onBack: () => void;
}) {
  const form = useForm<TransferDetailsInput>({
    resolver: zodResolver(transferDetailsSchema),
    defaultValues,
  });
  const { register, formState: { errors } } = form;

  return (
    <form onSubmit={form.handleSubmit(onNext)} className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-bold text-ink">Transfer details</h2>
        <p className="mt-1 text-sm text-slate">Where and when the handover happened.</p>
      </div>

      <div>
        <Label htmlFor="transfer_date" required>Date</Label>
        <Input id="transfer_date" type="date" {...register('transfer_date')} />
        <FieldError message={errors.transfer_date?.message} />
      </div>

      <div>
        <Label htmlFor="transfer_time" required>Time</Label>
        <Input id="transfer_time" type="time" {...register('transfer_time')} />
        <FieldError message={errors.transfer_time?.message} />
      </div>

      <div>
        <Label htmlFor="place_of_transfer" required>Place of transfer</Label>
        <Input
          id="place_of_transfer"
          placeholder="Site address or postcode"
          {...register('place_of_transfer')}
        />
        <FieldError message={errors.place_of_transfer?.message} />
      </div>

      <div>
        <Label htmlFor="broker_dealer_name">Broker / dealer who arranged transfer</Label>
        <Input id="broker_dealer_name" {...register('broker_dealer_name')} />
      </div>

      <div>
        <Label htmlFor="broker_dealer_registration_number">Their registration number</Label>
        <Input id="broker_dealer_registration_number" {...register('broker_dealer_registration_number')} />
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="secondary" onClick={onBack}>Back</Button>
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
}
