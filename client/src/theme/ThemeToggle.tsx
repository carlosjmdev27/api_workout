import type { JSX } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from './theme-context';

/**
 * Compact icon button (shadcn ghost/icon). Sun while dark = "switch to light";
 * Moon while light = "switch to dark". The label always says what a click will do.
 */
export function ThemeToggle({ className }: { className?: string }): JSX.Element {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const label = isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
  const Icon = isDark ? Sun : Moon;

  return (
    <Button type="button" variant="ghost" size="icon" onClick={toggleTheme} aria-label={label} title={label} className={className}>
      <Icon className="size-4" aria-hidden="true" />
    </Button>
  );
}
