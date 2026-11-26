import { useState, type JSX } from 'react';
import { Trash2 } from 'lucide-react';
import { convertWeight, type WeightLog, type WeightUnit } from '@gym/shared';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { IconButton } from '../../../components/IconButton';
import { getErrorMessage } from '../../../utils/errors';
import { formatDate, formatWeight } from '../../../utils/format';
import { ProgressChart, type ChartPoint } from '../../history/components/ProgressChart';
import { useDeleteWeightLog } from '../hooks';

/**
 * Chart points in the user's CURRENT unit. Entries recorded in the other unit are converted
 * for display only (stored values never change) and say so in the tooltip.
 */
function toChartPoints(logs: WeightLog[], unit: WeightUnit): ChartPoint[] {
  return logs.map((log) => ({
    id: log.id,
    date: log.recordedAt,
    value: convertWeight(log.weight, log.unit, unit),
    detail: log.unit === unit ? 'peso corporal' : `registrado como ${formatWeight(log.weight, log.unit)}`,
  }));
}

/** Mi progreso, block 2: fluctuation chart (Recharts, themed) + chronological list with delete. */
export function WeightHistory({ logs, unit }: { logs: WeightLog[]; unit: WeightUnit }): JSX.Element {
  const deleteMutation = useDeleteWeightLog();
  const [toDelete, setToDelete] = useState<WeightLog | null>(null);
  const newestFirst = [...logs].reverse();

  if (logs.length === 0) {
    return <p className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">Aún no has registrado tu peso. Empieza con el formulario de arriba.</p>;
  }

  return (
    <div className="space-y-4">
      {logs.length >= 2 ? (
        <ProgressChart points={toChartPoints(logs, unit)} unit={unit} color="var(--chart-1)" label="Evolución del peso corporal" />
      ) : (
        <p className="text-sm text-muted-foreground">Registra al menos dos pesajes para ver la gráfica.</p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">Registros de peso corporal, del más reciente al más antiguo</caption>
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th scope="col" className="py-2 font-medium">Fecha</th>
              <th scope="col" className="py-2 text-right font-medium">Peso</th>
              <th scope="col" className="w-10 py-2"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 tabular-nums">
            {newestFirst.map((log) => (
              <tr key={log.id}>
                <td className="py-1.5 text-muted-foreground">{formatDate(log.recordedAt)}</td>
                <td className="py-1.5 text-right font-semibold">{formatWeight(log.weight, log.unit)}</td>
                <td className="py-1 text-right">
                  <IconButton icon={Trash2} tone="danger" label={`Eliminar el registro del ${formatDate(log.recordedAt)}`} onClick={() => setToDelete(log)} className="p-1.5" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        open={toDelete !== null}
        title="Eliminar registro de peso"
        message={toDelete ? `Se eliminará el registro de ${formatWeight(toDelete.weight, toDelete.unit)} del ${formatDate(toDelete.recordedAt)}.` : ''}
        confirmLabel="Eliminar registro"
        loading={deleteMutation.isPending}
        error={deleteMutation.isError ? getErrorMessage(deleteMutation.error) : null}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })}
        onCancel={() => {
          deleteMutation.reset();
          setToDelete(null);
        }}
      />
    </div>
  );
}
