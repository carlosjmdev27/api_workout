import { useId, useState, type JSX } from 'react';
import { EQUIPMENT, MUSCLE_GROUPS, catalogExerciseInputSchema, type CatalogExercise } from '@gym/shared';
import { Alert } from '../../../components/Alert';
import { Button } from '../../../components/Button';
import { getErrorMessage } from '../../../utils/errors';
import { validateWith } from '../../../utils/validation';
import { useCreateCatalogExercise } from '../hooks';

interface QuickCreateExerciseProps {
  name: string;
  onCreated: (exercise: CatalogExercise) => void;
  onCancel: () => void;
}

const SELECT = 'h-9 w-full rounded-lg border border-input bg-card px-2 text-sm focus:outline-2 focus:outline-ring';

/**
 * One-line form to add a new exercise to the catalog without leaving the editor.
 * Not a <form>: it lives inside the exercise editor form (nested forms are invalid HTML).
 * The muscle group is always chosen explicitly: pre-filling it from a leftover search
 * filter created mis-classified exercises with a single click.
 */
export function QuickCreateExercise({ name, onCreated, onCancel }: QuickCreateExerciseProps): JSX.Element {
  const [muscle, setMuscle] = useState('');
  const [equipment, setEquipment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const createMutation = useCreateCatalogExercise();
  const id = useId();

  const create = (): void => {
    const result = validateWith(catalogExerciseInputSchema, { name, muscleGroup: muscle, equipment: equipment || null });
    if (!result.ok) {
      setError(result.errors.muscleGroup ? 'Elige el grupo muscular.' : 'Revisa los datos del ejercicio.');
      return;
    }
    setError(null);
    createMutation.mutate(result.data, { onSuccess: onCreated });
  };

  return (
    <div className="mt-2 space-y-2 rounded-xl border border-primary/30 bg-primary/10 p-3" role="group" aria-label="Crear ejercicio nuevo">
      <p className="text-sm text-foreground/90">Nuevo ejercicio en tu catálogo: <strong>«{name}»</strong></p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor={`${id}-muscle`} className="block text-[11px] font-medium text-muted-foreground">Grupo muscular *</label>
          <select id={`${id}-muscle`} value={muscle} onChange={(e) => setMuscle(e.target.value)} className={SELECT}>
            <option value="">Elegir…</option>
            {MUSCLE_GROUPS.map((group) => <option key={group} value={group}>{group}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-equipment`} className="block text-[11px] font-medium text-muted-foreground">Equipamiento</label>
          <select id={`${id}-equipment`} value={equipment} onChange={(e) => setEquipment(e.target.value)} className={SELECT}>
            <option value="">—</option>
            {EQUIPMENT.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {createMutation.isError && <Alert message={getErrorMessage(createMutation.error)} />}
      <div className="flex gap-2">
        <Button size="sm" loading={createMutation.isPending} onClick={create}>Crear y añadir</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancelar</Button>
      </div>
    </div>
  );
}
