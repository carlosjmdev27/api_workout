import { useEffect, useId, useRef, useState, type JSX, type KeyboardEvent } from 'react';
import { MoreHorizontal, type LucideIcon } from 'lucide-react';

export interface MenuAction {
  label: string;
  icon: LucideIcon;
  onSelect: () => void;
  disabled?: boolean;
  tone?: 'neutral' | 'danger';
}

interface ActionMenuProps {
  /** Accessible name of the trigger, e.g. "Acciones de Press banca". */
  label: string;
  actions: MenuAction[];
}

/** "⋯" menu button (WAI-ARIA menu pattern): arrows / Home / End move, Escape and Tab close. */
export function ActionMenu({ label, actions }: ActionMenuProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();
  const enabled = actions.flatMap((action, index) => (action.disabled ? [] : [index]));

  const focusItem = (index: number | undefined): void => {
    if (index !== undefined) itemRefs.current[index]?.focus();
  };

  useEffect(() => {
    if (!open) return;
    rootRef.current?.querySelector<HTMLButtonElement>('[role=menuitem]:not(:disabled)')?.focus();
    const closeOnOutside = (event: PointerEvent): void => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutside);
    return () => document.removeEventListener('pointerdown', closeOnOutside);
  }, [open]);

  const close = (restoreFocus: boolean): void => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const current = enabled.indexOf(itemRefs.current.findIndex((item) => item === document.activeElement));
    const moves: Record<string, number | undefined> = {
      ArrowDown: enabled[(current + 1) % enabled.length],
      ArrowUp: enabled[(current - 1 + enabled.length) % enabled.length],
      Home: enabled[0],
      End: enabled.at(-1),
    };
    if (event.key in moves) {
      event.preventDefault();
      focusItem(moves[event.key]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation(); // Do not close an enclosing dialog.
      close(true);
    } else if (event.key === 'Tab') {
      close(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        title={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600"
      >
        <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={handleKeyDown}
          className="absolute right-0 top-full z-20 mt-1 min-w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {actions.map((action, index) => (
            <button
              key={action.label}
              ref={(node) => { itemRefs.current[index] = node; }}
              type="button"
              role="menuitem"
              tabIndex={-1}
              disabled={action.disabled}
              onClick={() => {
                close(true);
                action.onSelect();
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 ${
                action.tone === 'danger' ? 'text-red-600 hover:bg-red-50 focus:bg-red-50' : 'text-slate-700 hover:bg-slate-100 focus:bg-slate-100'
              }`}
            >
              <action.icon className="h-4 w-4" aria-hidden="true" />
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
