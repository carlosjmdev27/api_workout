import { useId, type InputHTMLAttributes, type JSX, type ReactNode, type TextareaHTMLAttributes } from 'react';

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

const CONTROL_BASE =
  'block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm ' +
  'placeholder:text-slate-400 focus:outline-2 focus:outline-offset-0';

function controlClasses(hasError: boolean): string {
  return hasError
    ? `${CONTROL_BASE} border-red-400 focus:outline-red-500`
    : `${CONTROL_BASE} border-slate-300 focus:outline-indigo-600`;
}

function describedBy(id: string, meta: FieldMeta): string | undefined {
  if (meta.error) return `${id}-error`;
  if (meta.hint) return `${id}-hint`;
  return undefined;
}

function FieldShell({ id, label, error, hint, required, children }: FieldShellProps): JSX.Element {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-red-600">{error}</p>
      ) : (
        hint && <p id={`${id}-hint`} className="text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}

type TextFieldProps = FieldMeta & InputHTMLAttributes<HTMLInputElement>;

export function TextField({ label, error, hint, required, ...inputProps }: TextFieldProps): JSX.Element {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required}>
      <input
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, { label, error, hint })}
        className={controlClasses(Boolean(error))}
        {...inputProps}
      />
    </FieldShell>
  );
}

type TextAreaFieldProps = FieldMeta & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function TextAreaField({ label, error, hint, required, ...areaProps }: TextAreaFieldProps): JSX.Element {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required}>
      <textarea
        id={id}
        rows={3}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, { label, error, hint })}
        className={`${controlClasses(Boolean(error))} resize-y`}
        {...areaProps}
      />
    </FieldShell>
  );
}
