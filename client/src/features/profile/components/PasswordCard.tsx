import { useState, type FormEvent, type JSX } from 'react';
import { Check, Circle, KeyRound } from 'lucide-react';
import { LIMITS, passwordChangeSchema } from '@gym/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '../../../components/Alert';
import { Button } from '../../../components/Button';
import { PasswordField } from '../../../components/FormField';
import { getErrorMessage } from '../../../utils/errors';
import { validateWith, type FieldErrors } from '../../../utils/validation';
import { useChangePassword } from '../hooks';

const EMPTY = { currentPassword: '', newPassword: '', confirm: '' };

/** Live checklist under the new password (also read out by screen readers). */
function Requirement({ met, children }: { met: boolean; children: string }): JSX.Element {
  const Icon = met ? Check : Circle;
  return (
    <li className={`flex items-center gap-1.5 ${met ? 'text-primary' : 'text-muted-foreground'}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {children}
      <span className="sr-only">{met ? ': cumplido' : ': pendiente'}</span>
    </li>
  );
}

/** Card 2: change password (needs the current one). Fields are cleared after success. */
export function PasswordCard(): JSX.Element {
  const mutation = useChangePassword();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const longEnough = values.newPassword.length >= LIMITS.PASSWORD_MIN;
  const matches = values.confirm !== '' && values.confirm === values.newPassword;
  const ready = values.currentPassword !== '' && longEnough && matches;

  const field = (key: keyof typeof EMPTY) => ({
    value: values[key],
    error: errors[key],
    onChange: (event: { target: { value: string } }) => {
      setValues((prev) => ({ ...prev, [key]: event.target.value }));
      mutation.reset();
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const result = validateWith(passwordChangeSchema, { currentPassword: values.currentPassword, newPassword: values.newPassword });
    const nextErrors: FieldErrors = result.ok ? {} : { ...result.errors };
    if (!matches) nextErrors.confirm = 'Las contraseñas no coinciden';
    if (!result.ok || !matches) return setErrors(nextErrors);
    setErrors({});
    mutation.mutate(result.data, { onSuccess: () => setValues(EMPTY) });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle><h2 className="flex items-center gap-2 text-base font-semibold"><KeyRound className="h-4 w-4" aria-hidden="true" />Seguridad</h2></CardTitle>
        <CardDescription>Cambia tu contraseña. Necesitas la actual.</CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          <PasswordField label="Contraseña actual" autoComplete="current-password" required {...field('currentPassword')} />
          <PasswordField label="Nueva contraseña" autoComplete="new-password" required {...field('newPassword')} />
          <PasswordField label="Confirmar nueva contraseña" toggleLabel="Mostrar la confirmación de la contraseña" autoComplete="new-password" required {...field('confirm')} />
          <ul className="space-y-1 text-xs" aria-label="Requisitos de la nueva contraseña">
            <Requirement met={longEnough}>{`Al menos ${LIMITS.PASSWORD_MIN} caracteres`}</Requirement>
            <Requirement met={matches}>Las dos contraseñas coinciden</Requirement>
          </ul>
          {mutation.isError && <Alert message={getErrorMessage(mutation.error)} />}
          {mutation.isSuccess && <Alert tone="success" message="Contraseña actualizada." />}
          <Button type="submit" icon={KeyRound} loading={mutation.isPending} disabled={!ready}>Cambiar contraseña</Button>
        </form>
      </CardContent>
    </Card>
  );
}
