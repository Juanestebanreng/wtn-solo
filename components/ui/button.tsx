import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-paper hover:bg-ink/90 border border-ink',
  secondary: 'bg-paper text-ink border border-ink hover:bg-paper2',
  ghost: 'bg-transparent text-ink hover:bg-paper2 border border-transparent',
  danger: 'bg-danger text-white hover:bg-danger/90 border border-danger',
};

export function buttonClasses(variant: ButtonVariant = 'primary', className?: string) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded px-4 py-2.5 text-sm font-medium tracking-tight transition-colors disabled:opacity-40 disabled:pointer-events-none',
    variants[variant],
    className
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    return (
      <button ref={ref} className={buttonClasses(variant, className)} {...props} />
    );
  }
);
Button.displayName = 'Button';
