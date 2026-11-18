import type { FormEvent, JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExerciseDraftList } from '../../exercises/components/ExerciseDraftList';
import { useCreateRoutine } from '../hooks';
import { useRoutineDraft } from '../useRoutineDraft';
import { FormActions } from './FormActions';
import { RoutineInfoFields } from './RoutineInfoFields';

/** Creates a routine together with its exercises (one atomic API call). */
export function RoutineCreateForm(): JSX.Element {
  const draft = useRoutineDraft();
  const createMutation = useCreateRoutine();
  const navigate = useNavigate();

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!draft.validate()) return;
    createMutation.mutate(draft.toInput(), {
      onSuccess: (routine) => navigate(`/routines/${routine.id}`, { replace: true }),
    });
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <RoutineInfoFields values={draft.info} errors={draft.infoErrors} onChange={draft.updateInfo} />
      <ExerciseDraftList
        drafts={draft.drafts}
        errors={draft.draftErrors}
        onAdd={draft.addDraft}
        onRemove={draft.removeDraft}
        onChange={draft.updateDraft}
      />
      <FormActions
        cancelTo="/"
        submitLabel="Crear rutina"
        pending={createMutation.isPending}
        error={createMutation.error}
      />
    </form>
  );
}
