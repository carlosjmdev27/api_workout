import type { JSX } from 'react';
import { StickyNote } from 'lucide-react';

interface NoteToggleButtonProps {
  open: boolean;
  /** id of the <NotePanel> it shows / hides. */
  controls: string;
  /** e.g. "Notas de Press banca". */
  label: string;
  onToggle: () => void;
}

/** Small icon button that expands a collapsed note (disclosure pattern). */
export function NoteToggleButton({ open, controls, label, onToggle }: NoteToggleButtonProps): JSX.Element {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={controls}
      aria-label={label}
      title={label}
      onClick={onToggle}
      className={`rounded-lg p-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-ring ${
        open ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300' : 'text-muted-foreground/70 hover:bg-muted hover:text-foreground/90'
      }`}
    >
      <StickyNote className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

export function NotePanel({ id, open, text }: { id: string; open: boolean; text: string }): JSX.Element {
  return (
    <p id={id} hidden={!open} className="mt-1.5 whitespace-pre-line break-words rounded-lg bg-amber-500/10 px-2.5 py-1.5 text-sm text-muted-foreground">
      {text}
    </p>
  );
}
