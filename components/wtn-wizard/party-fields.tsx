'use client';

import type { UseFormReturn } from 'react-hook-form';
import { Input, Label, FieldError } from '@/components/ui/input';

export function PartyFields({
  form,
  isTransferor,
}: {
  form: UseFormReturn<any>;
  isTransferor: boolean;
}) {
  const { register, watch, formState: { errors } } = form;

  const watchPermit = watch('role_permit_holder');
  const watchExemption = watch('role_exemption_holder');
  const watchReg = watch('role_carrier') || watch('role_broker') || watch('role_dealer');

  const roles = [
    ...(isTransferor ? [{ key: 'role_producer', label: 'Producer' }, { key: 'role_importer', label: 'Importer' }] : []),
    { key: 'role_local_authority', label: 'Local authority' },
    { key: 'role_permit_holder', label: 'Permit holder' },
    { key: 'role_exemption_holder', label: 'Registered exemption' },
    { key: 'role_carrier', label: 'Carrier' },
    { key: 'role_broker', label: 'Broker' },
    { key: 'role_dealer', label: 'Dealer' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="full_name" required>Full name</Label>
          <Input id="full_name" {...register('full_name')} />
          <FieldError message={errors.full_name?.message as string} />
        </div>
        <div>
          <Label htmlFor="company_name" required>Company name</Label>
          <Input id="company_name" {...register('company_name')} />
          <FieldError message={errors.company_name?.message as string} />
        </div>
      </div>

      <div>
        <Label htmlFor="address_line_1" required>Address line 1</Label>
        <Input id="address_line_1" {...register('address_line_1')} />
        <FieldError message={errors.address_line_1?.message as string} />
      </div>
      <div>
        <Label htmlFor="address_line_2">Address line 2</Label>
        <Input id="address_line_2" {...register('address_line_2')} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="city" required>Town / city</Label>
          <Input id="city" {...register('city')} />
          <FieldError message={errors.city?.message as string} />
        </div>
        <div>
          <Label htmlFor="postcode" required>Postcode</Label>
          <Input id="postcode" {...register('postcode')} />
          <FieldError message={errors.postcode?.message as string} />
        </div>
      </div>

      {isTransferor && (
        <div>
          <Label htmlFor="sic_code" required>SIC code</Label>
          <Input id="sic_code" {...register('sic_code')} placeholder="e.g. 38110" />
          <FieldError message={errors.sic_code?.message as string} />
        </div>
      )}

      <div>
        <Label>Role</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {roles.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2.5 text-sm text-ink">
              <input
                type="checkbox"
                className="h-4 w-4 rounded-sm accent-ink"
                checked={!!watch(key)}
                onChange={(e) => form.setValue(key, e.target.checked, { shouldValidate: true })}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {watchPermit && (
        <div>
          <Label htmlFor="permit_number" required>Permit number</Label>
          <Input id="permit_number" {...register('permit_number')} />
          <FieldError message={errors.permit_number?.message as string} />
        </div>
      )}

      {watchExemption && (
        <div>
          <Label htmlFor="exemption_details" required>Exemption details</Label>
          <Input id="exemption_details" {...register('exemption_details')} placeholder="e.g. U10 registered exemption" />
          <FieldError message={errors.exemption_details?.message as string} />
        </div>
      )}

      {watchReg && (
        <div>
          <Label htmlFor="registration_number" required>Carrier / broker / dealer registration number</Label>
          <Input id="registration_number" {...register('registration_number')} />
          <FieldError message={errors.registration_number?.message as string} />
        </div>
      )}
    </div>
  );
}
