import { useState, type FormEvent, type JSX } from 'react';
import { Ruler, Save } from 'lucide-react';
import { LIMITS, physicalProfileSchema, type User, type WeightUnit } from '@gym/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '../../../components/Alert';
import { Button } from '../../../components/Button';
import { TextField } from '../../../components/FormField';
import { getErrorMessage } from '../../../utils/errors';
import { parseDecimal, validateWith, type FieldErrors } from '../../../utils/validation';
import { useCurrentUser } from '../../auth/auth-context';
import { useUpdatePhysical } from '../hooks';
import { WeightUnitSelector } from './WeightUnitSelector';

interface FormValues {
  /** As typed; "" = not set. */
  heightCm: string;
  weightUnit: WeightUnit;
}

const toValues = (user: User): FormValues => ({
  heightCm: user.heightCm === null ? '' : String(user.heightCm).replace('.', ','),
  weightUnit: user.weightUnit,
});

const HEIGHT_RANGE = `Entre ${LIMITS.HEIGHT_MIN_CM} y ${LIMITS.HEIGHT_MAX_CM} cm`;

/** Mi progreso, block 1a: height + preferred unit (propagated to routines, workouts and charts). */
export function PhysicalCard(): JSX.Element {
  const user = useCurrentUser();
  const mutation = useUpdatePhysical();
  const [values, setValues] = useState<FormValues>(() => toValues(user));
  const [errors, setErrors] = useState<FieldErrors>({});
  const unchanged = parseDecimal(values.heightCm) === user.heightCm && values.weightUnit === user.weightUnit;

  const edit = <K extends keyof FormValues>(field: K, value: FormValues[K]): void => {
    setValues((current) => ({ ...current, [field]: value }));
    mutation.reset();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const result = validateWith(physicalProfileSchema, { heightCm: parseDecimal(values.heightCm), weightUnit: values.weightUnit });
    if (!result.ok) return setErrors(result.errors.heightCm ? { ...result.errors, heightCm: HEIGHT_RANGE } : result.errors);
    setErrors({});
    mutation.mutate(result.data, { onSuccess: (saved) => setValues(toValues(saved)) });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ruler className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="text-base font-semibold">Medidas</h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,10rem)_1fr] sm:items-start">
            <TextField
              label="Altura (cm)"
              inputMode="numeric"
              autoComplete="off"
              placeholder="—"
              maxLength={5}
              suffix="cm"
              hint="Opcional"
              value={values.heightCm}
              error={errors.heightCm}
              onChange={(e) => edit('heightCm', e.target.value)}
              className="tabular-nums"
            />
            <WeightUnitSelector value={values.weightUnit} onChange={(unit) => edit('weightUnit', unit)} />
          </div>
          {mutation.isError && <Alert message={getErrorMessage(mutation.error)} />}
          {mutation.isSuccess && <Alert tone="success" message="Medidas guardadas." />}
          <Button type="submit" icon={Save} loading={mutation.isPending} disabled={unchanged}>Guardar cambios</Button>
        </form>
      </CardContent>
    </Card>
  );
}
