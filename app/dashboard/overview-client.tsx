"use client";

import { useState } from "react";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { formatUkDate } from "@/lib/utils";

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

type Filter = "all" | "today" | "week" | "month" | "year";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "year", label: "This year" },
  { key: "all", label: "All time" },
];

function inRange(dateStr: string | null, filter: Filter): boolean {
  if (filter === "all") return true;
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  if (filter === "today") return d.toDateString() === now.toDateString();
  if (filter === "week") {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    return d >= start;
  }
  if (filter === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  if (filter === "year") return d.getFullYear() === now.getFullYear();
  return true;
}

export function OverviewClient({
  wtns,
  signedUrls,
  canWrite,
}: {
  wtns: Wtn[];
  signedUrls: Record<string, string>;
  canWrite: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const filtered = wtns.filter((w) => {
    if (!inRange(w.transfer_date, filter)) return false;
    if (search) {
      const s = search.toLowerCase();
      const transferee = w.wtn_parties.find((p) => p.party_type === "transferee");
      return (
        w.reference_number?.toLowerCase().includes(s) ||
        w.waste_description?.toLowerCase().includes(s) ||
        w.ewc_code?.toLowerCase().includes(s) ||
        transferee?.company_name?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Overview</h1>
        {canWrite && (
          <Link href="/dashboard/wtns/new" className={buttonClasses("primary")}>
            New transfer note
          </Link>
        )}
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(({ key, label }) => {
          const count = wtns.filter((w) => inRange(w.transfer_date, key)).length;
          const active = filter === key;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "border-ink bg-ink text-white"
                  : "border-steel bg-white text-slate hover:border-ink hover:text-ink"
              }`}
            >
              {label}
              <span className={`ml-1.5 text-xs ${active ? "text-white/70" : "text-slate"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <input
        type="text"
        placeholder="Search by company, waste, EWC..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-3 w-full rounded border border-steel px-3 py-2 text-sm text-ink placeholder:text-slate focus:border-ink focus:outline-none"
      />

      <div className="mt-3 divide-y divide-steel rounded border border-steel bg-white">
        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm font-medium text-ink">No transfer notes for this period</p>
            {canWrite && filter === "all" && (
              <Link href="/dashboard/wtns/new" className={"mt-4 inline-block " + buttonClasses("primary")}>
                Create your first note
              </Link>
            )}
          </div>
        )}
        {filtered.map((w) => {
          const transferee = w.wtn_parties.find((p) => p.party_type === "transferee");
          const pdfUrl = signedUrls[w.id];
          return (
            <div key={w.id} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-paper2">
              <Link href={`/dashboard/wtns/${w.id}`} className="min-w-0 flex-1">
                <p className="font-mono text-ink">{w.reference_number}</p>
                <p className="mt-0.5 truncate text-slate">
                  {transferee?.company_name && <span className="font-medium">{transferee.company_name}</span>}
                  {w.waste_description && <span> &mdash; {w.waste_description}</span>}
                </p>
              </Link>
              <div className="shrink-0 text-right">
                <p className="text-xs text-slate">{w.transfer_date ? formatUkDate(w.transfer_date) : "-"}</p>
                {pdfUrl && (
                  <a href={pdfUrl} target="_blank" rel="noreferrer" className="mt-1 block text-xs font-medium text-ink underline hover:no-underline">PDF</a>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-slate">Records kept indefinitely. UK regulations require a minimum of 2 years retention.</p>
    </div>
  );
}
