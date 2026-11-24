import type { JSX, ReactNode } from 'react';
import { Dumbbell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '../../../theme/ThemeToggle';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Link to the other auth screen. */
  footer: ReactNode;
}

/** Minimal centered shadcn/ui Card shared by the login and register screens. */
export function AuthCard({ title, subtitle, children, footer }: AuthCardProps): JSX.Element {
  return (
    // 100dvh, not 100vh: exactly the visible screen on mobile, so the form never scrolls when it fits.
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-10">
      {/* No header on these screens: the theme switch sits in the top-right corner. */}
      <ThemeToggle className="absolute top-3 right-3" />
      <div className="mb-6 flex items-center gap-2 text-lg font-semibold text-foreground">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
          <Dumbbell className="h-5 w-5 text-primary" aria-hidden="true" />
        </span>
        AuraWorkout
      </div>
      <main className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle><h1 className="text-xl font-bold">{title}</h1></CardTitle>
            <CardDescription>{subtitle}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </main>
      <p className="mt-4 text-sm text-muted-foreground">{footer}</p>
    </div>
  );
}
