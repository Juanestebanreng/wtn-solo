'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signaturesSchema, type SignaturesInput } from '@/lib/validations/wtn';
import { Input, Label, FieldError } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SignaturePad } from './signature-pad';

export function StepSignatures({
  defaultValues,
  transferorName,
  transfereeName,
  onNext,
  onBack,
}: {
  defaultValues: Partial<SignaturesInput>;
  transferorName: string;
  transfereeName: string;
  onNext: (data: SignaturesInput) => void;
  onBack: () => void;
}) {
  const form = useForm<SignaturesInput>({
    resolver: zodResolver(signaturesSchema),
    defaultValues,
  });
  const { register, setValue, watch, formState: { errors } } = form;

  return (
    <form onSubmit={form.handleSubmit(onNext)} className="space-y-8">
      <div>
        <h2 className="font-display text-xl font-bold text-ink">5. Sign &amp; confirm</h2>
        <p className="mt-1 text-sm text-slate">
          Both parties sign on this device before the note can be finalised.
        </p>
      </div>

      <fieldset className="rounded border border-steel p-4">
        <legend className="px-1 text-sm font-medium text-ink">
          Transferor — {transferorName || 'unnamed'}
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="transferor_signed_name" required>
              Signed by
            </Label>
            <Input id="transferor_signed_name" {...register('transferor_signed_name')} />
            <FieldError message={errors.transferor_signed_name?.message} />
          </div>
          <div>
            <Label htmlFor="transferor_represented_as" required>
              Role
            </Label>
            <Input
              id="transferor_represented_as"
              placeholder="e.g. Director"
              {...register('transferor_represented_as')}
            />
            <FieldError message={errors.transferor_represented_as?.message} />
          </div>
        </div>
        <div className="mt-3">
          <SignaturePad
            value={watch('transferor_signature_data')}
            onChange={(v) => setValue('transferor_signature_data', v, { shouldValidate: true })}
          />
          <FieldError message={errors.transferor_signature_data?.message} />
        </div>
      </fieldset>

      <fieldset className="rounded border border-steel p-4">
        <legend className="px-1 text-sm font-medium text-ink">
          Transferee — {transfereeName || 'unnamed'}
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="transferee_signed_name" required>
              Signed by
            </Label>
            <Input id="transferee_signed_name" {...register('transferee_signed_name')} />
            <FieldError message={errors.transferee_signed_name?.message} />
          </div>
          <div>
            <Label htmlFor="transferee_represented_as" required>
              Role
            </Label>
            <Input
              id="transferee_represented_as"
              placeholder="e.g. Site manager"
              {...register('transferee_represented_as')}
            />
            <FieldError message={errors.transferee_represented_as?.message} />
          </div>
        </div>
        <div className="mt-3">
          <SignaturePad
            value={watch('transferee_signature_data')}
            onChange={(v) => setValue('transferee_signature_data', v, { shouldValidate: true })}
          />
          <FieldError message={errors.transferee_signature_data?.message} />
        </div>
      </fieldset>

      <div className="rounded border border-steel bg-paper2 p-4">
        <Checkbox
          label="The transferor confirms it has applied the waste hierarchy when transferring this waste, as required by the Waste (England and Wales) Regulations 2011."
          {...register('waste_hierarchy_confirmed')}
        />
        <FieldError message={errors.waste_hierarchy_confirmed?.message} />
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Review &amp; finalise</Button>
      </div>
    </form>
  );
}
