import type { JSX } from 'react';
import { AlertCircle } from 'lucide-react';

interface AlertProps {
  message: string;
  details?: string[];
}

/** Inline error banner. */
export function Alert({ message, details = [] }: AlertProps): JSX.Element {
  return (
    <div role="alert" className="flex gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
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
