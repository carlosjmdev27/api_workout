import type { JSX } from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '../../../components/PageHeader';
import { ErrorState, LoadingState } from '../../../components/StatusViews';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { getErrorMessage } from '../../../utils/errors';
import { formatWeight } from '../../../utils/format';
import { useCurrentUser } from '../../auth/auth-context';
import { PhysicalCard } from '../components/PhysicalCard';
import { WeightHistory } from '../components/WeightHistory';
import { WeightLogForm } from '../components/WeightLogForm';
import { useWeightLogs } from '../hooks';

/** Body weight card: weigh-in form + chart + list (one query shared by the chart and the list). */
function BodyWeightCard(): JSX.Element {
  const user = useCurrentUser();
  const logs = useWeightLogs();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="text-base font-semibold">Peso corporal</h2>
        </CardTitle>
        <CardDescription>
          {user.bodyWeight === null ? 'Sin registros todavía.' : <>Peso actual: <strong className="tabular-nums text-foreground">{formatWeight(user.bodyWeight, user.weightUnit)}</strong></>}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <WeightLogForm />
        {logs.isPending && <LoadingState label="Cargando registros…" />}
        {logs.isError && <ErrorState message={getErrorMessage(logs.error)} onRetry={() => void logs.refetch()} />}
        {logs.isSuccess && <WeightHistory logs={logs.data} unit={user.weightUnit} />}
      </CardContent>
    </Card>
  );
}

/** /progress: physical data (height, unit) and the body weight evolution. */
export function ProgressPage(): JSX.Element {
  useDocumentTitle('Mi progreso');
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Mi progreso" description="Tus medidas y la evolución de tu peso corporal." />
      <div className="space-y-4">
        <PhysicalCard />
        <BodyWeightCard />
      </div>
    </div>
  );
}
