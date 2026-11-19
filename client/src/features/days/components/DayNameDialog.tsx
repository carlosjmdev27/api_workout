import { useState, type FormEvent, type JSX } from 'react';
import { LIMITS, workoutDayInputSchema, type WorkoutDayInput } from '@gym/shared';
import { Alert } from '../../../components/Alert';
import { Button } from '../../../components/Button';
import { TextField } from '../../../components/FormField';
import { Modal } from '../../../components/Modal';
import { getErrorMessage } from '../../../utils/errors';
import { validateWith, type FieldErrors } from '../../../utils/validation';

interface DayNameFormProps {
  initialName: string;
  submitLabel: string;
  pending: boolean;
  error: unknown;
  onSubmit: (input: WorkoutDayInput) => void;
  onCancel: () => void;
}

function DayNameForm({ initialName, submitLabel, pending, error, onSubmit, onCancel }: DayNameFormProps): JSX.Element {
  const [name, setName] = useState(initialName);
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const result = validateWith(workoutDayInputSchema, { name });
    setErrors(result.ok ? {} : result.errors);
    if (result.ok) onSubmit(result.data);
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <TextField
        label="Nombre de la tabla"
        required
        autoFocus
        value={name}
        error={errors.name}
        maxLength={LIMITS.NAME_MAX}
        placeholder="Torso A"
        onChange={(event) => setName(event.target.value)}
      />
      {error !== null && <Alert message={getErrorMessage(error)} />}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={pending}>
          Cancelar
        </Button>
        <Button type="submit" loading={pending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

interface DayNameDialogProps extends Omit<DayNameFormProps, 'onCancel'> {
  open: boolean;
  title: string;
  onClose: () => void;
}

/** Create or rename a workout day. */
export function DayNameDialog({ open, title, onClose, ...formProps }: DayNameDialogProps): JSX.Element {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <DayNameForm {...formProps} onCancel={onClose} />
    </Modal>
  );
}
