'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';
import { formatUkDate } from '@/lib/utils';
import { sendWtnsByEmail } from './email-action';

type Wtn = {
  id: string;
  reference_number: string;
  status: string;
  transfer_date: string | null;
  waste_description: string | null;
  ewc_code: string | null;
  pdf_path: string | null;
  wtn_parties: { company_name: string; party_type: string }[];
};

type Filter = 'all' | 'today' | 'week' | 'month' | 'year';

const FILTER_LABELS: Record<Filter, string> = {
  all: 'All time',
  today: 'Today',
  week: 'This week',
  month: 'This month',
  year: 'This year',
};

function inRange(dateStr: string | null, filter: Filter): boolean {
  if (filter === 'all') return true;
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  if (filter === 'today') {
    return d.toDateString() === now.toDateString();
  }
  if (filter === 'week') {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    return d >= start;
  }
  if (filter === 'month') {
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }
  if (filter === 'year') {
    return d.getFullYear() === now.getFullYear();
  }
  return true;
}

export default function NotesClient({
  wtns,
  defaultEmail,
  canWrite,
  signedUrls,
}: {
  wtns: Wtn[];
  defaultEmail: string;
  canWrite: boolean;
  signedUrls: Record<string, string>;
}) {
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [email, setEmail] = useState(defaultEmail);
  const [showEmailBar, setShowEmailBar] = useState(false);
  const [sending, startSending] = useTransition();
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState('');

  const filtered = wtns.filter((w) => {
    if (!inRange(w.transfer_date, filter)) return false;
    if (search) {
      const s = search.toLowerCase();
      const transferee = w.wtn_parties.find((p) => p.party_type === 'transferee');
      return (
        w.reference_number?.toLowerCase().includes(s) ||
        w.waste_description?.toLowerCase().includes(s) ||
        w.ewc_code?.toLowerCase().includes(s) ||
        transferee?.company_name?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(filtered.map((w) => w.id)));
  }

  function clearSelection() {
    setSelected(new Set());
    setShowEmailBar(false);
  }

  function handleSend() {
    if (!email) return;
    setSendError('');
    startSending(async () => {
      try {
        await sendWtnsByEmail(Array.from(selected), email);
        setSent(true);
        setSelected(new Set());
        setShowEmailBar(false);
        setTimeout(() => setSent(false), 4000);
      } catch (e) {
        setSendError(e instanceof Error ? e.message : 'Could not send email');
      }
    });
  }

  const filters: Filter[] = ['all', 'today', 'week', 'month', 'year'];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Transfer notes</h1>
        {canWrite && (
          <Link href="/dashboard/wtns/new" className={buttonClasses('primary')}>
            New transfer note
          </Link>
        )}
      </div>

      <div className="mt-4 flex gap-1 overflow-x-auto rounded border border-steel bg-white p-1">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f ? 'bg-ink text-white' : 'text-slate hover:bg-paper2'
            }`}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Search by company, waste, EWC code..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-3 w-full rounded border border-steel px-3 py-2 text-sm text-ink placeholder:text-slate focus:border-ink focus:outline-none"
      />

      {selected.size > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded border border-steel bg-white px-4 py-3 text-sm">
          <span className="font-medium text-ink">{selected.size} selected</span>
          <button
            onClick={() => setShowEmailBar(true)}
            className="rounded border border-steel px-3 py-1.5 text-xs font-medium text-ink hover:bg-paper2"
          >
            Send by email
          </button>
          <button onClick={clearSelection} className="text-xs text-slate underline">
            Clear
          </button>
          <button onClick={selectAll} className="text-xs text-slate underline">
            Select all {filtered.length}
          </button>
        </div>
      )}

      {showEmailBar && (
        <div className="mt-2 flex flex-wrap items-center gap-3 rounded border border-steel bg-white px-4 py-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="min-w-0 flex-1 rounded border border-steel px-3 py-1.5 text-sm text-ink focus:border-ink focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={sending || !email}
            className={`rounded px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50 ${
              sending ? 'bg-slate' : 'bg-ink hover:bg-ink/90'
            }`}
          >
            {sending ? 'Sending\u2026' : `Send ${selected.size} PDF${selected.size > 1 ? 's' : ''}`}
          </button>
          <button onClick={() => setShowEmailBar(false)} className="text-xs text-slate underline">
            Cancel
          </button>
          {sendError && <p className="w-full text-xs text-danger">{sendError}</p>}
        </div>
      )}

      {sent && (
        <p className="mt-2 rounded border border-compliant/30 bg-compliant-light px-3 py-2 text-sm text-compliant">
          Sent successfully.
        </p>
      )}

      <div className="mt-3 divide-y divide-steel rounded border border-steel bg-white">
        {filtered.length === 0 && (
          <p className="px-4 py-6 text-sm text-slate">No transfer notes for this period.</p>
        )}
        {filtered.map((w) => {
          const transferee = w.wtn_parties.find((p) => p.party_type === 'transferee');
          const isSelected = selected.has(w.id);
          const pdfUrl = signedUrls[w.id];
          return (
            <div
              key={w.id}
              className={`flex items-center gap-3 px-4 py-3 text-sm ${
                isSelected ? 'bg-amber/5' : 'hover:bg-paper2'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelect(w.id)}
                className="h-4 w-4 shrink-0 accent-ink"
              />
              <Link href={`/dashboard/wtns/${w.id}`} className="min-w-0 flex-1">
                <p className="font-mono text-ink">{w.reference_number}</p>
                <p className="mt-0.5 truncate text-slate">
                  {transferee?.company_name && (
                    <span className="font-medium">{transferee.company_name}</span>
                  )}
                  {w.waste_description && <span> &mdash; {w.waste_description}</span>}
                </p>
              </Link>
              <div className="shrink-0 text-right">
                <p className="text-xs text-slate">
                  {w.transfer_date ? formatUkDate(w.transfer_date) : '\u2014'}
                </p>
                {pdfUrl && (
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 block text-xs font-medium text-ink underline hover:no-underline"
                  >
                    Download PDF
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-slate">
        Records kept indefinitely. UK regulations require a minimum of 2 years retention.
      </p>
    </div>
  );
}
