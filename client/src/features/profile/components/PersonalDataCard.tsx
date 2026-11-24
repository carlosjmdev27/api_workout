import { useState, type FormEvent, type JSX } from 'react';
import { CalendarDays, Save } from 'lucide-react';
import { LIMITS, profileUpdateSchema } from '@gym/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '../../../components/Alert';
import { Button } from '../../../components/Button';
import { TextField } from '../../../components/FormField';
import { getErrorMessage } from '../../../utils/errors';
import { formatDate } from '../../../utils/format';
import { validateWith, type FieldErrors } from '../../../utils/validation';
import { useCurrentUser } from '../../auth/auth-context';
import { useUpdateProfile } from '../hooks';

/** Card 1: account date (read only) + editable name and email. */
export function PersonalDataCard(): JSX.Element {
  const user = useCurrentUser();
  const mutation = useUpdateProfile();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [errors, setErrors] = useState<FieldErrors>({});
  const unchanged = name.trim() === user.name && email.trim().toLowerCase() === user.email;

  const edit = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    mutation.reset(); // A new edit hides the previous success / error message.
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const result = validateWith(profileUpdateSchema, { name, email });
    if (!result.ok) return setErrors(result.errors);
    setErrors({});
    mutation.mutate(result.data, {
      onSuccess: (saved) => {
        setName(saved.name); // Shows the normalized values (trimmed, lowercase email).
        setEmail(saved.email);
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle><h2 className="text-base font-semibold">Datos personales</h2></CardTitle>
        <CardDescription className="flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          Miembro desde el {formatDate(user.createdAt)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          <TextField label="Nombre de usuario" autoComplete="name" required maxLength={LIMITS.NAME_MAX} value={name} error={errors.name} onChange={(e) => edit(setName)(e.target.value)} />
          <TextField label="Correo electrónico" type="email" inputMode="email" autoComplete="email" required maxLength={LIMITS.EMAIL_MAX} value={email} error={errors.email} onChange={(e) => edit(setEmail)(e.target.value)} />
          {mutation.isError && <Alert message={getErrorMessage(mutation.error)} />}
          {mutation.isSuccess && <Alert tone="success" message="Datos guardados." />}
          <Button type="submit" icon={Save} loading={mutation.isPending} disabled={unchanged}>Guardar cambios</Button>
        </form>
      </CardContent>
    </Card>
  );
}
