import type { ButtonHTMLAttributes, JSX } from 'react';
import type { LucideIcon } from 'lucide-react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  /** Accessible name (icon-only buttons have no visible text). */
  label: string;
  tone?: 'neutral' | 'danger';
}

const TONES = {
  neutral: 'text-muted-foreground hover:bg-muted hover:text-foreground',
  danger: 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive',
} as const;

export function IconButton({
  icon: Icon,
  label,
  tone = 'neutral',
  type = 'button',
  className = '',
  ...rest
}: IconButtonProps): JSX.Element {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`rounded-lg p-2 transition-colors focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-30 ${TONES[tone]} ${className}`}
      {...rest}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
