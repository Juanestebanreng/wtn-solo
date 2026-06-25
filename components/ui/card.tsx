import { cn } from '@/lib/utils';

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded border border-steel bg-white p-5', className)}
      {...props}
    />
  );
}

export function Checkbox({
  className,
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex items-start gap-2.5 text-sm text-ink">
      <input
        type="checkbox"
        className={cn(
          'mt-0.5 h-4 w-4 rounded-sm border-steel text-ink accent-ink',
          className
        )}
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}

export function Badge({
  tone = 'default',
  children,
}: {
  tone?: 'default' | 'compliant' | 'amber';
  children: React.ReactNode;
}) {
  const tones = {
    default: 'bg-paper2 text-slate',
    compliant: 'bg-compliant-light text-compliant',
    amber: 'bg-amber/15 text-amber-dark',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium uppercase tracking-wide',
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}
