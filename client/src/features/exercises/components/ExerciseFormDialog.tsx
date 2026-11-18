import type { JSX } from 'react';
import { Modal } from '../../../components/Modal';
import type { Exercise, ExerciseInput } from '../../../types/exercise';
import { EMPTY_EXERCISE, exerciseToFormValues } from '../exercise-form';
import { ExerciseForm } from './ExerciseForm';

interface ExerciseFormDialogProps {
  open: boolean;
  /** null = create a new exercise. */
  exercise: Exercise | null;
  pending: boolean;
  error: unknown;
  onSubmit: (input: ExerciseInput) => void;
  onClose: () => void;
}

export function ExerciseFormDialog({
  open,
  exercise,
  pending,
  error,
  onSubmit,
  onClose,
}: ExerciseFormDialogProps): JSX.Element {
  const isEdit = exercise !== null;

  return (
    <Modal open={open} title={isEdit ? 'Editar ejercicio' : 'Nuevo ejercicio'} onClose={onClose}>
      {/* key: a fresh form (and state) for each exercise opened. */}
      <ExerciseForm
        key={exercise?.id ?? 'new'}
        initialValues={isEdit ? exerciseToFormValues(exercise) : EMPTY_EXERCISE}
        submitLabel={isEdit ? 'Guardar cambios' : 'Añadir ejercicio'}
        pending={pending}
        error={error}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
}
