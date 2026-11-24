import { useEffect, useState, type JSX } from 'react';
import { Timer } from 'lucide-react';
import { formatClock } from '../../../utils/format';

/**
 * Live stopwatch. Always derived from `startedAt` (Date.now() - startedAt), never
 * by adding +1 per tick, so throttled background tabs or a locked phone cannot
 * make it drift: it is correct again the moment the page is visible.
 */
interface ActiveWorkoutTimerProps {
  startedAt: string;
  /** 'inverse': white text for dark backgrounds (the in-progress banner). */
  variant?: 'default' | 'inverse';
}

export function ActiveWorkoutTimer({ startedAt, variant = 'default' }: ActiveWorkoutTimerProps): JSX.Element {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = (): void => setNow(Date.now());
    const interval = window.setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', tick);
    };
  }, []);

  const inverse = variant === 'inverse';
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono font-semibold tabular-nums ${inverse ? 'text-sm text-primary-foreground' : 'text-lg text-foreground'}`}>
      <Timer className={inverse ? 'h-4 w-4' : 'h-5 w-5 text-primary'} aria-hidden="true" />
      <span aria-label="Tiempo de entrenamiento">{formatClock(now - Date.parse(startedAt))}</span>
    </span>
  );
}
