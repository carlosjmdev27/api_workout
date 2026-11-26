import { useState, type FormEvent, type JSX } from 'react';
import { AtSign, Save } from 'lucide-react';
import { LIMITS, identityUpdateSchema, type User } from '@gym/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '../../../components/Alert';
import { Button } from '../../../components/Button';
import { TextField } from '../../../components/FormField';
import { getErrorMessage } from '../../../utils/errors';
import { validateWith, type FieldErrors } from '../../../utils/validation';
import { useCurrentUser } from '../../auth/auth-context';
import { useUpdateIdentity } from '../hooks';

const toValues = (user: User) => ({ username: user.username, email: user.email });

/** Seguridad, card 1: the login identity (username + email). A new email must have a real domain. */
export function IdentityCard(): JSX.Element {
  const user = useCurrentUser();
  const mutation = useUpdateIdentity();
  const [values, setValues] = useState(() => toValues(user));
  const [errors, setErrors] = useState<FieldErrors>({});
  const unchanged =
    values.username.trim().toLowerCase() === user.username && values.email.trim().toLowerCase() === user.email;

  const edit = (field: 'username' | 'email', value: string): void => {
    setValues((current) => ({ ...current, [field]: value }));
    mutation.reset();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const result = validateWith(identityUpdateSchema, values);
    if (!result.ok) return setErrors(result.errors);
    setErrors({});
    // Shows the normalized values (lowercase username / email) once saved.
    mutation.mutate(result.data, { onSuccess: (saved) => setValues(toValues(saved)) });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AtSign className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="text-base font-semibold">Identidad de acceso</h2>
        </CardTitle>
        <CardDescription>Puedes iniciar sesión con tu nombre de usuario o con tu correo.</CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="Nombre de usuario"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
            maxLength={LIMITS.USERNAME_MAX}
            hint={`${LIMITS.USERNAME_MIN}-${LIMITS.USERNAME_MAX} letras, números o "_".`}
            value={values.username}
            error={errors.username}
            onChange={(e) => edit('username', e.target.value)}
          />
          <TextField
            label="Correo electrónico"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            maxLength={LIMITS.EMAIL_MAX}
            value={values.email}
            error={errors.email}
            onChange={(e) => edit('email', e.target.value)}
          />
          {mutation.isError && <Alert message={getErrorMessage(mutation.error)} />}
          {mutation.isSuccess && <Alert tone="success" message="Datos de acceso guardados." />}
          <Button type="submit" icon={Save} loading={mutation.isPending} disabled={unchanged}>Guardar cambios</Button>
        </form>
      </CardContent>
    </Card>
  );
}
