import type { FormEvent, JSX } from 'react';
import { LIMITS, type DayExercise, type DayExerciseInput } from '@gym/shared';
import { Alert } from '../../../components/Alert';
import { Button } from '../../../components/Button';
import { TextAreaField, TextField } from '../../../components/FormField';
import { Modal } from '../../../components/Modal';
import { getErrorDetails, getErrorMessage } from '../../../utils/errors';
import { emptyExercise, exerciseToFormValues, type ExerciseFormValues } from '../exercise-form';
import { useExerciseEditor } from '../useExerciseEditor';
import { SetRowsEditor } from './SetRowsEditor';

interface EditorFormProps {
  initialValues: ExerciseFormValues;
  submitLabel: string;
  pending: boolean;
  error: unknown;
  onSubmit: (input: DayExerciseInput) => void;
  onCancel: () => void;
}

function ExerciseEditorForm({ initialValues, submitLabel, pending, error, onSubmit, onCancel }: EditorFormProps): JSX.Element {
  const editor = useExerciseEditor(initialValues);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const input = editor.validate();
    if (input) onSubmit(input);
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5">
      <TextField
        label="Ejercicio"
        required
        autoFocus
        value={editor.values.name}
        error={editor.errors.name}
        maxLength={LIMITS.NAME_MAX}
        placeholder="Press de banca con barra"
        onChange={(event) => editor.setText('name', event.target.value)}
      />
      <SetRowsEditor editor={editor} />
      <TextAreaField
        label="Notas técnicas"
        rows={2}
        value={editor.values.notes}
        error={editor.errors.notes}
        maxLength={LIMITS.NOTES_MAX}
        placeholder="Tempo, agarre, cues…"
        onChange={(event) => editor.setText('notes', event.target.value)}
      />
      {error !== null && <Alert message={getErrorMessage(error)} details={getErrorDetails(error)} />}
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

interface ExerciseEditorDialogProps {
  open: boolean;
  /** null = create a new exercise. */
  exercise: DayExercise | null;
  pending: boolean;
  error: unknown;
  onSubmit: (input: DayExerciseInput) => void;
  onClose: () => void;
}

export function ExerciseEditorDialog({ open, exercise, pending, error, onSubmit, onClose }: ExerciseEditorDialogProps): JSX.Element {
  const isEdit = exercise !== null;
  return (
    <Modal open={open} size="lg" title={isEdit ? 'Editar ejercicio' : 'Nuevo ejercicio'} onClose={onClose}>
      {/* key: fresh form state for each exercise opened. */}
      <ExerciseEditorForm
        key={exercise?.id ?? 'new'}
        initialValues={isEdit ? exerciseToFormValues(exercise) : emptyExercise()}
        submitLabel={isEdit ? 'Guardar cambios' : 'Añadir ejercicio'}
        pending={pending}
        error={error}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
}
