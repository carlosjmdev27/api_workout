import type { JSX } from 'react';
import { Alert } from './Alert';
import { Button } from './Button';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Confirmation step for destructive actions. */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  loading = false,
  error = null,
  onConfirm,
  onCancel,
}: ConfirmDialogProps): JSX.Element {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600">{message}</p>
        {error && <Alert message={error} />}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
