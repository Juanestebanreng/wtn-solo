'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function BillingButton({
  endpoint,
  children,
}: {
  endpoint: '/api/stripe/checkout' | '/api/stripe/portal';
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch(endpoint, { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" onClick={handleClick} disabled={loading}>
      {loading ? 'Redirecting…' : children}
    </Button>
  );
}
