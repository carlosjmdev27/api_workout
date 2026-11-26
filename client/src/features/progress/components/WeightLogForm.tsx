import { useState, type FormEvent, type JSX } from 'react';
import { Scale } from 'lucide-react';
import { LIMITS, weightLogInputSchema } from '@gym/shared';
import { Alert } from '../../../components/Alert';
import { Button } from '../../../components/Button';
import { TextField } from '../../../components/FormField';
import { getErrorMessage } from '../../../utils/errors';
import { todayInput, weighInTimestamp } from '../../../utils/dates';
import { parseDecimal, validateWith, type FieldErrors } from '../../../utils/validation';
import { useWeightUnit } from '../../auth/useWeightUnit';
import { useAddWeightLog } from '../hooks';

/** Mi progreso, block 1b: quick weigh-in (today by default, any past date allowed). */
export function WeightLogForm(): JSX.Element {
  const unit = useWeightUnit();
  const mutation = useAddWeightLog();
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(todayInput);
  const [errors, setErrors] = useState<FieldErrors>({});
  const today = todayInput();

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const dateError = date === '' || date > today ? 'Elige una fecha que no sea futura' : null;
    const result = validateWith(weightLogInputSchema, {
      weight: parseDecimal(weight),
      unit,
      recordedAt: dateError ? undefined : weighInTimestamp(date),
    });
    if (!result.ok || dateError) {
      const next: FieldErrors = {};
      if (!result.ok && result.errors.weight) next.weight = `Entre ${LIMITS.BODY_WEIGHT_MIN} y ${LIMITS.BODY_WEIGHT_MAX} ${unit}`;
      if (dateError) next.date = dateError;
      return setErrors(next);
    }
    setErrors({});
    mutation.mutate(result.data, { onSuccess: () => setWeight('') });
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <TextField
          label={`Peso (${unit})`}
          inputMode="decimal"
          autoComplete="off"
          placeholder="—"
          maxLength={6}
          suffix={unit}
          value={weight}
          error={errors.weight}
          onChange={(e) => {
            setWeight(e.target.value);
            mutation.reset();
          }}
          className="tabular-nums"
        />
        <TextField label="Fecha" type="date" max={today} value={date} error={errors.date} onChange={(e) => setDate(e.target.value)} />
      </div>
      {mutation.isError && <Alert message={getErrorMessage(mutation.error)} />}
      {mutation.isSuccess && <Alert tone="success" message="Peso registrado." />}
      <Button type="submit" icon={Scale} loading={mutation.isPending}>Registrar peso</Button>
    </form>
  );
}
