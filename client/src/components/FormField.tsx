import { useId, type InputHTMLAttributes, type JSX, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface FieldMeta {
  label: string;
  error?: string;
  hint?: string;
}

interface FieldShellProps extends FieldMeta {
  id: string;
  required?: boolean;
  children: ReactNode;
}

function describedBy(id: string, meta: FieldMeta): string | undefined {
  if (meta.error) return `${id}-error`;
  if (meta.hint) return `${id}-hint`;
  return undefined;
}

function FieldShell({ id, label, error, hint, required, children }: FieldShellProps): JSX.Element {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive" aria-hidden="true">*</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">{error}</p>
      ) : (
        hint && <p id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

type TextFieldProps = FieldMeta & InputHTMLAttributes<HTMLInputElement>;

/** Labelled shadcn/ui Input; aria-invalid switches it to the error style. */
export function TextField({ label, error, hint, required, className, ...inputProps }: TextFieldProps): JSX.Element {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required}>
      <Input
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, { label, error, hint })}
        className={`h-9 ${className ?? ''}`}
        {...inputProps}
      />
    </FieldShell>
  );
}

type TextAreaFieldProps = FieldMeta & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function TextAreaField({ label, error, hint, required, className, ...areaProps }: TextAreaFieldProps): JSX.Element {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required}>
      <Textarea
        id={id}
        rows={3}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, { label, error, hint })}
        className={`resize-y ${className ?? ''}`}
        {...areaProps}
      />
    </FieldShell>
  );
}
