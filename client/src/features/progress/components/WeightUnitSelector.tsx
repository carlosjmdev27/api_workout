import { useId, type JSX } from 'react';
import { WEIGHT_UNITS, type WeightUnit } from '@gym/shared';

const LABELS: Record<WeightUnit, string> = { kg: 'Kilogramos (kg)', lb: 'Libras (lb)' };

interface WeightUnitSelectorProps {
  value: WeightUnit;
  onChange: (unit: WeightUnit) => void;
}

/**
 * Segmented control built on native radio buttons (arrow keys, form semantics and
 * screen readers work out of the box). Changing it only relabels weights: no conversion.
 */
export function WeightUnitSelector({ value, onChange }: WeightUnitSelectorProps): JSX.Element {
  const name = useId();
  const hintId = `${name}-hint`;
  return (
    <fieldset className="space-y-1.5" aria-describedby={hintId}>
      <legend className="mb-1.5 text-sm font-medium text-foreground">Unidad preferida</legend>
      <div className="grid grid-cols-2 rounded-lg border border-border bg-muted/50 p-0.5">
        {WEIGHT_UNITS.map((unit) => (
          <label
            key={unit}
            className="flex h-8 cursor-pointer items-center justify-center rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground has-[:checked]:bg-card has-[:checked]:text-foreground has-[:checked]:shadow-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring"
          >
            <input
              type="radio"
              name={name}
              value={unit}
              checked={value === unit}
              onChange={() => onChange(unit)}
              className="sr-only"
            />
            {LABELS[unit]}
          </label>
        ))}
      </div>
      <p id={hintId} className="text-xs text-muted-foreground">
        Se usa en rutinas, entrenamientos y gráficas. Los pesos ya guardados no se convierten.
      </p>
    </fieldset>
  );
}
