import { useEffect, useState, type JSX } from 'react';
import { Timer } from 'lucide-react';

function format(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const mmss = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  return hours > 0 ? `${hours}:${mmss}` : mmss;
}

/** Live workout duration since `startedAt`. */
export function ElapsedTimer({ startedAt }: { startedAt: number }): JSX.Element {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <span className="inline-flex items-center gap-1 tabular-nums" aria-label="Tiempo de entrenamiento">
      <Timer className="h-4 w-4" aria-hidden="true" />
      {format(now - startedAt)}
    </span>
  );
}
