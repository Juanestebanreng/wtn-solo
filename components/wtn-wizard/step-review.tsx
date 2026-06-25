'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type {
  TransferorInput,
  TransfereeInput,
  WasteDetailsInput,
  TransferDetailsInput,
  SignaturesInput,
} from '@/lib/validations/wtn';

interface ReviewProps {
  transferor: TransferorInput;
  transferee: TransfereeInput;
  waste: WasteDetailsInput;
  transfer: TransferDetailsInput;
  signatures: SignaturesInput;
  onBack: () => void;
  onFinalise: () => Promise<void>;
}

export function StepReview({
  transferor,
  transferee,
  waste,
  transfer,
  signatures,
  onBack,
  onFinalise,
}: ReviewProps) {
  const [submitting, setSubmitting] = useState(false);

  async function handleFinalise() {
    setSubmitting(true);
    try {
      await onFinalise();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-ink">6. Review &amp; finalise</h2>
        <p className="mt-1 text-sm text-slate">
          Once finalised, this note locks. To fix a mistake afterwards
          you&rsquo;ll create a corrected copy instead of editing it directly.
        </p>
      </div>

      <SummaryBlock title="Transferor">
        <p className="font-medium text-ink">{transferor.full_name} — {transferor.company_name}</p>
        <p className="text-slate">
          {transferor.address_line_1}, {transferor.city} {transferor.postcode}
        </p>
        <p className="text-slate">SIC code: {transferor.sic_code}</p>
      </SummaryBlock>

      <SummaryBlock title="Transferee">
        <p className="font-medium text-ink">{transferee.full_name} — {transferee.company_name}</p>
        <p className="text-slate">
          {transferee.address_line_1}, {transferee.city} {transferee.postcode}
        </p>
      </SummaryBlock>

      <SummaryBlock title="Waste">
        <p className="text-ink">{waste.waste_description}</p>
        <p className="text-slate">
          EWC {waste.ewc_code} · {waste.quantity} · {waste.containment_type}
        </p>
      </SummaryBlock>

      <SummaryBlock title="Transfer">
        <p className="text-ink">
          {transfer.transfer_date} at {transfer.transfer_time}
        </p>
        <p className="text-slate">{transfer.place_of_transfer}</p>
      </SummaryBlock>

      <SummaryBlock title="Signatures">
        <div className="flex gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- inline base64 data URLs, not a fit for next/image */}
          <img
            src={signatures.transferor_signature_data}
            alt="Transferor signature"
            className="h-16 rounded border border-steel bg-white p-1"
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- inline base64 data URLs, not a fit for next/image */}
          <img
            src={signatures.transferee_signature_data}
            alt="Transferee signature"
            className="h-16 rounded border border-steel bg-white p-1"
          />
        </div>
      </SummaryBlock>

      <div className="flex justify-between">
        <Button type="button" variant="secondary" onClick={onBack} disabled={submitting}>
          Back
        </Button>
        <Button type="button" onClick={handleFinalise} disabled={submitting}>
          {submitting ? 'Finalising…' : 'Finalise & generate PDF'}
        </Button>
      </div>
    </div>
  );
}

function SummaryBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded border border-steel bg-white p-4 text-sm">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate">{title}</p>
      {children}
    </div>
  );
}
