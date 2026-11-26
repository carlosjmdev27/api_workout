import type { JSX, ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string | null;
  actions?: ReactNode;
  children?: ReactNode;
}

/** Page title (+ description / actions). No back link: going back is the browser's / the logo's job (Fase 18). */
export function PageHeader({ title, description, actions, children }: PageHeaderProps): JSX.Element {
  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="break-words text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {description && <p className="whitespace-pre-line text-muted-foreground">{description}</p>}
          {children}
        </div>
        {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
      </div>
    </div>
  );
}
