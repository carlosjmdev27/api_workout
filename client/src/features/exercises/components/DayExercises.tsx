import { useState, type JSX } from 'react';
import { ListChecks, Plus } from 'lucide-react';
import { LIMITS, type DayExercise, type DayExerciseInput } from '@gym/shared';
import { Alert } from '../../../components/Alert';
import { Button } from '../../../components/Button';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { EmptyState } from '../../../components/StatusViews';
import { getErrorMessage } from '../../../utils/errors';
import { useCreateExercise, useDeleteExercise, useReorderExercises, useUpdateExercise } from '../hooks';
import { withExtraSet } from '../exercise-form';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseEditorDialog } from './ExerciseEditorDialog';

type EditorState = { mode: 'create' } | { mode: 'edit'; exercise: DayExercise } | null;

interface DayExercisesProps {
  routineId: string;
  dayId: string;
  exercises: DayExercise[];
}

/** Exercises of one workout day with add / edit / delete / reorder. */
export function DayExercises({ routineId, dayId, exercises }: DayExercisesProps): JSX.Element {
  const [editor, setEditor] = useState<EditorState>(null);
  const [toDelete, setToDelete] = useState<DayExercise | null>(null);
  const createMutation = useCreateExercise(routineId, dayId);
  const updateMutation = useUpdateExercise(routineId);
  const deleteMutation = useDeleteExercise(routineId);
  const reorderMutation = useReorderExercises(routineId, dayId);
  const addSetMutation = useUpdateExercise(routineId); // Separate from the editor's mutation state.
  const busy = reorderMutation.isPending || addSetMutation.isPending;
  const isEdit = editor?.mode === 'edit';
  const limitReached = exercises.length >= LIMITS.EXERCISES_PER_DAY_MAX;

  const openEditor = (next: EditorState): void => {
    createMutation.reset();
    updateMutation.reset();
    setEditor(next);
  };

  const handleSubmit = (input: DayExerciseInput): void => {
    const options = { onSuccess: () => setEditor(null) };
    if (editor?.mode === 'edit') updateMutation.mutate({ exerciseId: editor.exercise.id, input }, options);
    else createMutation.mutate(input, options);
  };

  const handleMove = (index: number, offset: -1 | 1): void => {
    const ids = exercises.map((exercise) => exercise.id);
    const target = index + offset;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    reorderMutation.mutate(ids);
  };

  const handleAddSet = (exercise: DayExercise): void => {
    const result = withExtraSet(exercise);
    if (result.ok) addSetMutation.mutate({ exerciseId: exercise.id, input: result.data });
  };

  const closeDelete = (): void => {
    deleteMutation.reset();
    setToDelete(null);
  };

  return (
    <div className="space-y-3">
      {reorderMutation.isError && <Alert message={getErrorMessage(reorderMutation.error)} />}
      {addSetMutation.isError && <Alert message={getErrorMessage(addSetMutation.error)} />}

      {exercises.length === 0 ? (
        <EmptyState icon={ListChecks} title="Tabla sin ejercicios" description="Añade el primer ejercicio y configura sus series." />
      ) : (
        <ol className="space-y-2">
          {exercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              isFirst={index === 0}
              isLast={index === exercises.length - 1}
              busy={busy}
              onAddSet={() => handleAddSet(exercise)}
              onMoveUp={() => handleMove(index, -1)}
              onMoveDown={() => handleMove(index, 1)}
              onEdit={() => openEditor({ mode: 'edit', exercise })}
              onDelete={() => setToDelete(exercise)}
            />
          ))}
        </ol>
      )}

      <Button icon={Plus} disabled={limitReached} onClick={() => openEditor({ mode: 'create' })}>
        Añadir ejercicio
      </Button>

      <ExerciseEditorDialog
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
        message={`¿Eliminar «${toDelete?.name ?? ''}» y sus series? El historial de entrenamientos ya registrado se conserva.`}
        confirmLabel="Eliminar"
        loading={deleteMutation.isPending}
        error={deleteMutation.isError ? getErrorMessage(deleteMutation.error) : null}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })}
        onCancel={closeDelete}
      />
    </div>
  );
}
