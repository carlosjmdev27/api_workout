import type { JSX, ReactNode } from 'react';
import { AlertCircle, ArrowLeft, Loader2, RefreshCw, type LucideIcon } from 'lucide-react';
import { Button } from './Button';
import { LinkButton } from './LinkButton';

export function LoadingState({ label = 'Cargando…' }: { label?: string }): JSX.Element {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  backTo?: string;
}

export function ErrorState({ message, onRetry, backTo }: ErrorStateProps): JSX.Element {
  return (
    <div role="alert" className="flex flex-col items-center gap-4 py-16 text-center">
      <AlertCircle className="h-10 w-10 text-destructive" aria-hidden="true" />
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      <div className="flex gap-2">
        {backTo && (
          <LinkButton to={backTo} variant="secondary" icon={ArrowLeft}>
            Volver
          </LinkButton>
        )}
        {onRetry && (
          <Button variant="secondary" icon={RefreshCw} onClick={onRetry}>
            Reintentar
          </Button>
        )}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border px-6 py-12 text-center">
      <Icon className="h-10 w-10 text-muted-foreground/50" aria-hidden="true" />
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}
