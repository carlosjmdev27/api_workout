import { useState, type FormEvent, type JSX } from 'react';
import { CalendarDays, Save } from 'lucide-react';
import { COUNTRIES, LIMITS, personalProfileSchema, type User } from '@gym/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '../../../components/Alert';
import { Button } from '../../../components/Button';
import { SelectField, TextField } from '../../../components/FormField';
import { getErrorMessage } from '../../../utils/errors';
import { ageFrom, todayInput } from '../../../utils/dates';
import { formatDate, pluralize } from '../../../utils/format';
import { validateWith, type FieldErrors } from '../../../utils/validation';
import { useCurrentUser } from '../../auth/auth-context';
import { useUpdatePersonal } from '../hooks';

interface FormValues {
  name: string;
  lastName: string;
  /** "" = not set. */
  country: string;
  /** "YYYY-MM-DD" or "". */
  birthDate: string;
}

const toValues = (user: User): FormValues => ({
  name: user.name,
  lastName: user.lastName ?? '',
  country: user.country ?? '',
  birthDate: user.birthDate ?? '',
});

const toCandidate = (values: FormValues) => ({
  name: values.name,
  lastName: values.lastName,
  country: values.country === '' ? null : values.country,
  birthDate: values.birthDate === '' ? null : values.birthDate,
});

const isUnchanged = (values: FormValues, user: User): boolean =>
  values.name.trim() === user.name &&
  (values.lastName.trim() || null) === user.lastName &&
  (values.country || null) === user.country &&
  (values.birthDate || null) === user.birthDate;

/** Live age next to the birth date: recalculated on every change of the field. */
function AgeBadge({ birthDate }: { birthDate: string }): JSX.Element | null {
  const age = ageFrom(birthDate);
  if (age === null) return null;
  return (
    <span aria-live="polite" className="inline-flex h-9 shrink-0 items-center rounded-lg bg-primary/10 px-3 text-sm font-semibold tabular-nums text-primary">
      {pluralize(age, 'año', 'años')}
    </span>
  );
}

/** Perfil: name, last name, country and birth date (with the age computed live). */
export function PersonalDataCard(): JSX.Element {
  const user = useCurrentUser();
  const mutation = useUpdatePersonal();
  const [values, setValues] = useState<FormValues>(() => toValues(user));
  const [errors, setErrors] = useState<FieldErrors>({});

  const edit = (field: keyof FormValues, value: string): void => {
    setValues((current) => ({ ...current, [field]: value }));
    mutation.reset(); // A new edit hides the previous success / error message.
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const result = validateWith(personalProfileSchema, toCandidate(values));
    if (!result.ok) return setErrors(result.errors);
    setErrors({});
    mutation.mutate(result.data, { onSuccess: (saved) => setValues(toValues(saved)) });
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
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Nombre" autoComplete="given-name" required maxLength={LIMITS.NAME_MAX} value={values.name} error={errors.name} onChange={(e) => edit('name', e.target.value)} />
            <TextField label="Apellidos" autoComplete="family-name" maxLength={LIMITS.NAME_MAX} value={values.lastName} error={errors.lastName} onChange={(e) => edit('lastName', e.target.value)} />
          </div>
          <SelectField label="País" autoComplete="country" value={values.country} error={errors.country} onChange={(e) => edit('country', e.target.value)}>
            <option value="">Sin especificar</option>
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>{country.name}</option>
            ))}
          </SelectField>
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <TextField
                label="Fecha de nacimiento"
                type="date"
                autoComplete="bday"
                min={LIMITS.BIRTH_DATE_MIN}
                max={todayInput()}
                value={values.birthDate}
                error={errors.birthDate ? 'Elige una fecha real que no sea futura' : undefined}
                onChange={(e) => edit('birthDate', e.target.value)}
              />
            </div>
            {/* Aligned with the input, below the label (label ≈ 1.25rem + gap). */}
            <div className="pt-7"><AgeBadge birthDate={values.birthDate} /></div>
          </div>
          {mutation.isError && <Alert message={getErrorMessage(mutation.error)} />}
          {mutation.isSuccess && <Alert tone="success" message="Datos guardados." />}
          <Button type="submit" icon={Save} loading={mutation.isPending} disabled={isUnchanged(values, user)}>Guardar cambios</Button>
        </form>
      </CardContent>
    </Card>
  );
}
