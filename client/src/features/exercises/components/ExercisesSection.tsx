import { useState, type JSX } from 'react';
import { ListChecks, Plus } from 'lucide-react';
import { Alert } from '../../../components/Alert';
import { Button } from '../../../components/Button';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { EmptyState } from '../../../components/StatusViews';
import type { Exercise, ExerciseInput } from '../../../types/exercise';
import { getErrorMessage } from '../../../utils/errors';
import { LIMITS } from '../../../utils/limits';
import {
  useCreateExercise,
  useDeleteExercise,
  useReorderExercises,
  useUpdateExercise,
} from '../hooks';
import { ExerciseFormDialog } from './ExerciseFormDialog';
import { ExerciseItem } from './ExerciseItem';

type EditorState = { mode: 'create' } | { mode: 'edit'; exercise: Exercise } | null;

interface ExercisesSectionProps {
  routineId: string;
  exercises: Exercise[];
}

/** Exercise list of a routine with add / edit / delete / reorder. */
export function ExercisesSection({ routineId, exercises }: ExercisesSectionProps): JSX.Element {
  const [editor, setEditor] = useState<EditorState>(null);
  const [toDelete, setToDelete] = useState<Exercise | null>(null);
  const createMutation = useCreateExercise(routineId);
  const updateMutation = useUpdateExercise(routineId);
  const deleteMutation = useDeleteExercise(routineId);
  const reorderMutation = useReorderExercises(routineId);
  const isEdit = editor?.mode === 'edit';
  const limitReached = exercises.length >= LIMITS.EXERCISES_PER_ROUTINE_MAX;

  const openEditor = (next: EditorState): void => {
    createMutation.reset();
    updateMutation.reset();
    setEditor(next);
  };

  const handleSubmit = (input: ExerciseInput): void => {
    const options = { onSuccess: () => setEditor(null) };
    if (editor?.mode === 'edit') {
      updateMutation.mutate({ exerciseId: editor.exercise.id, input }, options);
    } else {
      createMutation.mutate(input, options);
    }
  };

  const handleMove = (index: number, offset: -1 | 1): void => {
    const ids = exercises.map((exercise) => exercise.id);
    const target = index + offset;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    reorderMutation.mutate(ids);
  };

  const handleDelete = (): void => {
    if (!toDelete) return;
    deleteMutation.mutate(toDelete.id, { onSuccess: () => setToDelete(null) });
  };

  const closeDelete = (): void => {
    deleteMutation.reset();
    setToDelete(null);
  };

  return (
    <section aria-labelledby="exercises-title" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 id="exercises-title" className="text-lg font-semibold text-slate-900">
          Ejercicios
        </h2>
        <Button
          size="sm"
          icon={Plus}
          disabled={limitReached}
          title={limitReached ? `Máximo ${LIMITS.EXERCISES_PER_ROUTINE_MAX} ejercicios` : undefined}
          onClick={() => openEditor({ mode: 'create' })}
        >
          Añadir
        </Button>
      </div>

      {reorderMutation.isError && <Alert message={getErrorMessage(reorderMutation.error)} />}

      {exercises.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="Sin ejercicios todavía"
          description="Añade el primer ejercicio de esta rutina."
        />
      ) : (
        <ol className="space-y-3">
          {exercises.map((exercise, index) => (
            <ExerciseItem
              key={exercise.id}
              exercise={exercise}
              isFirst={index === 0}
              isLast={index === exercises.length - 1}
              busy={reorderMutation.isPending}
              onMoveUp={() => handleMove(index, -1)}
              onMoveDown={() => handleMove(index, 1)}
              onEdit={() => openEditor({ mode: 'edit', exercise })}
              onDelete={() => setToDelete(exercise)}
            />
          ))}
        </ol>
      )}

      <ExerciseFormDialog
        open={editor !== null}
        exercise={isEdit ? editor.exercise : null}
        pending={isEdit ? updateMutation.isPending : createMutation.isPending}
        error={isEdit ? updateMutation.error : createMutation.error}
        onSubmit={handleSubmit}
        onClose={() => setEditor(null)}
      />
      <ConfirmDialog
        open={toDelete !== null}
        title="Eliminar ejercicio"
        message={`¿Seguro que quieres eliminar «${toDelete?.name ?? ''}»? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        loading={deleteMutation.isPending}
        error={deleteMutation.isError ? getErrorMessage(deleteMutation.error) : null}
        onConfirm={handleDelete}
        onCancel={closeDelete}
      />
    </section>
  );
}
