'use client';

import { useEffect, useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function SignaturePad({
  onChange,
  value,
}: {
  onChange: (dataUrl: string) => void;
  value: string;
}) {
  const padRef = useRef<SignatureCanvas>(null);
  const [empty, setEmpty] = useState(!value);

  // If we're remounting with a signature already captured (e.g. the user
  // went Back then Continue again), redraw it — react-signature-canvas
  // doesn't read `value` on its own, it only exposes an imperative API.
  useEffect(() => {
    if (value && padRef.current) {
      padRef.current.fromDataURL(value);
      setEmpty(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleEnd() {
    const pad = padRef.current;
    if (!pad) return;
    setEmpty(pad.isEmpty());
    if (!pad.isEmpty()) {
      onChange(pad.getTrimmedCanvas().toDataURL('image/png'));
    }
  }

  function clear() {
    padRef.current?.clear();
    setEmpty(true);
    onChange('');
  }

  return (
    <div>
      <div
        className={cn(
          'overflow-hidden rounded border-2 border-dashed border-steel bg-white',
          !empty && 'border-solid border-ink'
        )}
      >
        <SignatureCanvas
          ref={padRef}
          penColor="#1B2330"
          canvasProps={{ className: 'h-40 w-full touch-none' }}
          onEnd={handleEnd}
        />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-slate">
          {empty ? 'Sign with your finger or mouse' : 'Signature captured'}
        </span>
        <Button type="button" variant="ghost" className="px-2 py-1 text-xs" onClick={clear}>
          Clear
        </Button>
      </div>
    </div>
  );
}
