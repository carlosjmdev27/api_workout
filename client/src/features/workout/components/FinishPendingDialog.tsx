import type { JSX } from 'react';
import { Button } from '../../../components/Button';
import { Modal } from '../../../components/Modal';
import { pluralize } from '../../../utils/format';

interface FinishPendingDialogProps {
  open: boolean;
  pendingCount: number;
  onSaveAll: () => void;
  onSaveCompletedOnly: () => void;
  onCancel: () => void;
}

/** Some sets have reps typed but were not ticked: ask before finishing. */
export function FinishPendingDialog({ open, pendingCount, onSaveAll, onSaveCompletedOnly, onCancel }: FinishPendingDialogProps): JSX.Element {
  return (
    <Modal open={open} title="Series sin marcar" onClose={onCancel}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Tienes {pluralize(pendingCount, 'serie', 'series')} con repeticiones escritas pero sin marcar como hecha.
          ¿Qué quieres hacer con ellas?
        </p>
        <div className="flex flex-col gap-2">
          <Button onClick={onSaveAll}>Guardarlas también como hechas</Button>
          <Button variant="secondary" onClick={onSaveCompletedOnly}>Guardar solo las marcadas</Button>
          <Button variant="ghost" onClick={onCancel}>Volver al entrenamiento</Button>
        </div>
      </div>
    </Modal>
  );
}
