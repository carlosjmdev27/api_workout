import type { JSX, ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  description?: string | null;
  backTo?: string;
  backLabel?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({
  title,
  description,
  backTo,
  backLabel = 'Volver',
  actions,
  children,
}: PageHeaderProps): JSX.Element {
  return (
    <div className="mb-6 space-y-3">
      {backTo && (
        <Link to={backTo} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {backLabel}
        </Link>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="break-words text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          {description && <p className="whitespace-pre-line text-slate-600">{description}</p>}
          {children}
        </div>
        {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
      </div>
    </div>
  );
}
