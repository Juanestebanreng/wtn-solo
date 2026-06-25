import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// `transfer_date` is stored as a date-only Postgres column ("2026-06-24").
// Parsing that with `new Date(str)` treats it as UTC midnight, then
// `.toLocaleDateString()` re-renders it in the viewer's local timezone —
// which silently shifts the date back a day for anyone west of UTC. This
// formats the literal calendar date instead of round-tripping it through a
// timezone conversion.
export function formatUkDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-GB', {
    timeZone: 'UTC',
  });
}
