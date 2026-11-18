import type { JSX } from 'react';
import { PageHeader } from '../../../components/PageHeader';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { RoutineCreateForm } from '../components/RoutineCreateForm';

export function RoutineCreatePage(): JSX.Element {
  useDocumentTitle('Nueva rutina');
  return (
    <>
      <PageHeader title="Nueva rutina" backTo="/" backLabel="Mis rutinas" />
      <RoutineCreateForm />
    </>
  );
}
