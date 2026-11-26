import {
  useId,
  useState,
  type InputHTMLAttributes,
  type JSX,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
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

type TextFieldProps = FieldMeta &
  InputHTMLAttributes<HTMLInputElement> & {
    /** Short visual suffix inside the input (e.g. the unit "kg"); also add it to the label. */
    suffix?: string;
  };

/** Labelled shadcn/ui Input; aria-invalid switches it to the error style. */
export function TextField({ label, error, hint, required, className, suffix, ...inputProps }: TextFieldProps): JSX.Element {
  const id = useId();
  const input = (
    <Input
      id={id}
      required={required}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, { label, error, hint })}
      className={`h-9 ${suffix ? 'pr-10' : ''} ${className ?? ''}`}
      {...inputProps}
    />
  );
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required}>
      {suffix ? (
        <div className="relative">
          {input}
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
            {suffix}
          </span>
        </div>
      ) : (
        input
      )}
    </FieldShell>
  );
}

type SelectFieldProps = FieldMeta & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> & { children: ReactNode };

/** Labelled native <select> (shadcn NativeSelect): fast, accessible and mobile-friendly for long lists. */
export function SelectField({ label, error, hint, required, className, children, ...selectProps }: SelectFieldProps): JSX.Element {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required}>
      <NativeSelect
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, { label, error, hint })}
        // Same height as the text inputs (h-9) so mixed rows line up.
        className={`w-full [&_select]:h-9 ${className ?? ''}`}
        {...selectProps}
      >
        {children}
      </NativeSelect>
    </FieldShell>
  );
}

type PasswordFieldProps =FieldMeta &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
    /** Accessible name of the eye button; default "Mostrar <label>". */
    toggleLabel?: string;
  };

/**
 * Password input with an eye button to show / hide what was typed (Eye / EyeOff).
 * Toggle button: fixed accessible name, state in aria-pressed. Hidden by default.
 */
export function PasswordField({ label, error, hint, required, className, toggleLabel, ...inputProps }: PasswordFieldProps): JSX.Element {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required}>
      <div className="relative">
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          required={required}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, { label, error, hint })}
          className={`h-9 pr-10 ${className ?? ''}`}
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={toggleLabel ?? `Mostrar ${label.toLowerCase()}`}
          aria-pressed={visible}
          aria-controls={id}
          title={visible ? 'Ocultar' : 'Mostrar'}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </FieldShell>
  );
}

type TextAreaFieldProps =FieldMeta & TextareaHTMLAttributes<HTMLTextAreaElement>;

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
