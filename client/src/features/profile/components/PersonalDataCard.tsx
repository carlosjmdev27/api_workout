import { useState, type FormEvent, type JSX } from 'react';
import { CalendarDays, Save } from 'lucide-react';
import { LIMITS, profileUpdateSchema, type User, type WeightUnit } from '@gym/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '../../../components/Alert';
import { Button } from '../../../components/Button';
import { TextField } from '../../../components/FormField';
import { getErrorMessage } from '../../../utils/errors';
import { formatDate } from '../../../utils/format';
import { parseDecimal, validateWith, type FieldErrors } from '../../../utils/validation';
import { useCurrentUser } from '../../auth/auth-context';
import { useUpdateProfile } from '../hooks';
import { WeightUnitSelector } from './WeightUnitSelector';

interface FormValues {
  name: string;
  email: string;
  /** As typed ("80,5"); empty = no body weight. */
  bodyWeight: string;
  weightUnit: WeightUnit;
}

const toValues = (user: User): FormValues => ({
  name: user.name,
  email: user.email,
  bodyWeight: user.bodyWeight === null ? '' : String(user.bodyWeight).replace('.', ','),
  weightUnit: user.weightUnit,
});

const toCandidate = (values: FormValues) => ({ ...values, bodyWeight: parseDecimal(values.bodyWeight) });

function isUnchanged(values: FormValues, user: User): boolean {
  const candidate = toCandidate(values);
  return (
    values.name.trim() === user.name &&
    values.email.trim().toLowerCase() === user.email &&
    candidate.bodyWeight === user.bodyWeight &&
    values.weightUnit === user.weightUnit
  );
}

const BODY_WEIGHT_RANGE = `Entre ${LIMITS.BODY_WEIGHT_MIN} y ${LIMITS.BODY_WEIGHT_MAX}`;

/** Card 1: account date (read only) + name, email, body weight and preferred unit. */
export function PersonalDataCard(): JSX.Element {
  const user = useCurrentUser();
  const mutation = useUpdateProfile();
  const [values, setValues] = useState<FormValues>(() => toValues(user));
  const [errors, setErrors] = useState<FieldErrors>({});

  const edit = <K extends keyof FormValues>(field: K, value: FormValues[K]): void => {
    setValues((current) => ({ ...current, [field]: value }));
    mutation.reset(); // A new edit hides the previous success / error message.
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const result = validateWith(profileUpdateSchema, toCandidate(values));
    if (!result.ok) {
      const { bodyWeight, ...rest } = result.errors;
      return setErrors(bodyWeight ? { ...rest, bodyWeight: `${BODY_WEIGHT_RANGE} ${values.weightUnit}` } : rest);
    }
    setErrors({});
    // Shows the normalized values (trimmed name, lowercase email) once saved.
    mutation.mutate(result.data, { onSuccess: (saved) => setValues(toValues(saved)) });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle><h2 className="text-base font-semibold">Datos personales y físicos</h2></CardTitle>
        <CardDescription className="flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          Miembro desde el {formatDate(user.createdAt)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          <TextField label="Nombre de usuario" autoComplete="name" required maxLength={LIMITS.NAME_MAX} value={values.name} error={errors.name} onChange={(e) => edit('name', e.target.value)} />
          <TextField label="Correo electrónico" type="email" inputMode="email" autoComplete="email" required maxLength={LIMITS.EMAIL_MAX} value={values.email} error={errors.email} onChange={(e) => edit('email', e.target.value)} />
          <div className="grid gap-4 sm:grid-cols-[minmax(0,10rem)_1fr] sm:items-start">
            <TextField
              label={`Peso corporal (${values.weightUnit})`}
              inputMode="decimal"
              autoComplete="off"
              placeholder="—"
              maxLength={6}
              suffix={values.weightUnit}
              value={values.bodyWeight}
              error={errors.bodyWeight}
              hint="Opcional"
              onChange={(e) => edit('bodyWeight', e.target.value)}
              className="tabular-nums"
            />
            <WeightUnitSelector value={values.weightUnit} onChange={(unit) => edit('weightUnit', unit)} />
          </div>
          {mutation.isError && <Alert message={getErrorMessage(mutation.error)} />}
          {mutation.isSuccess && <Alert tone="success" message="Datos guardados." />}
          <Button type="submit" icon={Save} loading={mutation.isPending} disabled={isUnchanged(values, user)}>Guardar cambios</Button>
        </form>
      </CardContent>
    </Card>
  );
}
