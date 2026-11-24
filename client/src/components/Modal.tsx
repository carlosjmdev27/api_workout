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
      // shadcn/ui dialog look on top of the native <dialog> (kept for its built-in focus trap and
      // Esc handling, which the exercise combobox relies on to close only its own popup).
      className={`m-auto w-[calc(100%-2rem)] ${SIZES[size]} rounded-xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl dark:ring-1 dark:ring-white/5 backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm dark:backdrop:bg-black/70`}
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 id={titleId} className="text-lg font-semibold text-foreground">
          {title}
        </h2>
        <IconButton icon={X} label="Cerrar" onClick={onClose} />
      </div>
      <div className="max-h-[75vh] overflow-y-auto px-5 py-4">{open && children}</div>
    </dialog>
  );
}
