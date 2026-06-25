import { z } from 'zod';

const partySchema = z
  .object({
    full_name: z.string().min(2, 'Enter a full name'),
    company_name: z.string().min(1, 'Enter a company name'),
    address_line_1: z.string().min(1, 'Enter an address'),
    address_line_2: z.string().optional(),
    city: z.string().min(1, 'Enter a town or city'),
    postcode: z.string().min(2, 'Enter a postcode'),
    role_producer: z.boolean().optional(),
    role_importer: z.boolean().optional(),
    role_local_authority: z.boolean().optional(),
    role_permit_holder: z.boolean().optional(),
    permit_number: z.string().optional(),
    role_exemption_holder: z.boolean().optional(),
    exemption_details: z.string().optional(),
    role_carrier: z.boolean().optional(),
    role_broker: z.boolean().optional(),
    role_dealer: z.boolean().optional(),
    registration_number: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role_permit_holder && !data.permit_number) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Permit number is required for a permit holder',
        path: ['permit_number'],
      });
    }
    if (
      (data.role_carrier || data.role_broker || data.role_dealer) &&
      !data.registration_number
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Registration number is required for carriers, brokers, and dealers',
        path: ['registration_number'],
      });
    }
    if (data.role_exemption_holder && !data.exemption_details) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Add details of the registered exemption',
        path: ['exemption_details'],
      });
    }
  });

export const transferorSchema = partySchema.and(
  z.object({
    sic_code: z.string().min(1, 'SIC code is required for the transferor'),
  })
);

export const transfereeSchema = partySchema;

export const wasteDetailsSchema = z.object({
  waste_description: z.string().min(3, 'Describe the waste'),
  ewc_code: z.string().min(2, 'Enter an EWC code'),
  quantity: z.string().min(1, 'Enter a quantity'),
  containment_type: z.enum(['loose', 'sacks', 'skip', 'drum', 'other']),
  containment_other: z.string().optional(),
});

export const transferDetailsSchema = z.object({
  transfer_date: z.string().min(1, 'Pick a date'),
  transfer_time: z.string().min(1, 'Pick a time'),
  place_of_transfer: z.string().min(2, 'Enter where the transfer happened'),
  broker_dealer_name: z.string().optional(),
  broker_dealer_registration_number: z.string().optional(),
});

export const signaturesSchema = z.object({
  transferor_signed_name: z.string().min(2, 'Transferor must sign'),
  transferor_represented_as: z.string().min(1, 'Add a role, e.g. Director'),
  transferor_signature_data: z.string().min(1, 'Capture the transferor signature'),
  transferee_signed_name: z.string().min(2, 'Transferee must sign'),
  transferee_represented_as: z.string().min(1, 'Add a role, e.g. Site manager'),
  transferee_signature_data: z.string().min(1, 'Capture the transferee signature'),
  waste_hierarchy_confirmed: z.literal(true, {
    errorMap: () => ({
      message: 'Confirm the waste hierarchy duty before finalising',
    }),
  }),
});

export const wtnDraftSchema = z.object({
  transferor: transferorSchema,
  transferee: transfereeSchema,
  waste: wasteDetailsSchema,
  transfer: transferDetailsSchema,
});

export type TransferorInput = z.infer<typeof transferorSchema>;
export type TransfereeInput = z.infer<typeof transfereeSchema>;
export type WasteDetailsInput = z.infer<typeof wasteDetailsSchema>;
export type TransferDetailsInput = z.infer<typeof transferDetailsSchema>;
export type SignaturesInput = z.infer<typeof signaturesSchema>;
