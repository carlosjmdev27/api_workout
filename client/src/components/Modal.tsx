import { useEffect, useId, useRef, type JSX, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** 'lg' for dense editors (e.g. the per-set exercise editor). */
  size?: 'md' | 'lg';
}

const SIZES = { md: 'max-w-lg', lg: 'max-w-2xl' } as const;

/**
 * Accessible modal built on the native <dialog>: focus trap, Esc to close
 * and backdrop come from the browser.
 */
export function Modal({ open, title, onClose, children, size = 'md' }: ModalProps): JSX.Element {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby={titleId}
      className={`m-auto w-[calc(100%-2rem)] ${SIZES[size]} rounded-2xl bg-white p-0 shadow-xl backdrop:bg-slate-900/50`}
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 id={titleId} className="text-lg font-semibold text-slate-900">
          {title}
        </h2>
        <IconButton icon={X} label="Cerrar" onClick={onClose} />
      </div>
      <div className="max-h-[75vh] overflow-y-auto px-5 py-4">{open && children}</div>
    </dialog>
  );
}
