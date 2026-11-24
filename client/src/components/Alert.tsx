import type { JSX } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface AlertProps {
  message: string;
  details?: string[];
  /** 'success' = discreet confirmation, announced politely (role="status"). */
  tone?: 'error' | 'success';
}

const TONES = {
  error: { role: 'alert', icon: AlertCircle, classes: 'border-destructive/40 bg-destructive/10 text-destructive' },
  success: { role: 'status', icon: CheckCircle2, classes: 'border-primary/40 bg-primary/10 text-primary' },
} as const;

/** Inline banner: errors (default) or success confirmations. */
export function Alert({ message, details = [], tone = 'error' }: AlertProps): JSX.Element {
  const { role, icon: Icon, classes } = TONES[tone];
  return (
    <div role={role} className={`flex gap-3 rounded-lg border p-3 text-sm ${classes}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>
        <p>{message}</p>
        {details.length > 0 && (
          <ul className="mt-1 list-disc pl-4 text-xs">
            {details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
