'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { wasteDetailsSchema, type WasteDetailsInput } from '@/lib/validations/wtn';
import { Input, Label, FieldError, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const containmentOptions = [
  { value: 'loose', label: 'Loose' },
  { value: 'sacks', label: 'Sacks' },
  { value: 'skip', label: 'Skip' },
  { value: 'drum', label: 'Drum' },
  { value: 'other', label: 'Other' },
] as const;

export function StepWaste({
  defaultValues,
  onNext,
  onBack,
}: {
  defaultValues: Partial<WasteDetailsInput>;
  onNext: (data: WasteDetailsInput) => void;
  onBack: () => void;
}) {
  const form = useForm<WasteDetailsInput>({
    resolver: zodResolver(wasteDetailsSchema),
    defaultValues: { containment_type: 'loose', ...defaultValues },
  });
  const { register, watch, formState: { errors } } = form;
  const containment = watch('containment_type');

  return (
    <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-ink">3. Waste details</h2>
        <p className="mt-1 text-sm text-slate">What&rsquo;s being transferred, and how.</p>
      </div>

      <div>
        <Label htmlFor="waste_description" required>
          Waste description
        </Label>
        <Textarea
          id="waste_description"
          rows={3}
          placeholder="e.g. Mixed construction and demolition waste"
          {...register('waste_description')}
        />
        <FieldError message={errors.waste_description?.message} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="ewc_code" required>
            EWC code
          </Label>
          <Input id="ewc_code" placeholder="17 09 04" {...register('ewc_code')} />
          <FieldError message={errors.ewc_code?.message} />
        </div>
        <div>
          <Label htmlFor="quantity" required>
            Quantity
          </Label>
          <Input id="quantity" placeholder="e.g. 1 x 8yd skip, 0.5 tonnes" {...register('quantity')} />
          <FieldError message={errors.quantity?.message} />
        </div>
      </div>

      <div>
        <Label required>How is it contained?</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {containmentOptions.map((opt) => (
            <label
              key={opt.value}
              className={cn(
                'cursor-pointer rounded border border-steel px-3 py-2 text-center text-sm',
                containment === opt.value && 'border-ink bg-paper2 font-medium'
              )}
            >
              <input
                type="radio"
                value={opt.value}
                className="sr-only"
                {...register('containment_type')}
              />
              {opt.label}
            </label>
          ))}
        </div>
        {containment === 'other' && (
          <div className="mt-3">
            <Input placeholder="Describe containment" {...register('containment_other')} />
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
}
