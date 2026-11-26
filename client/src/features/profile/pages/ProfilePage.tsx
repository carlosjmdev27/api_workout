import type { JSX } from 'react';
import { PageHeader } from '../../../components/PageHeader';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { PersonalDataCard } from '../components/PersonalDataCard';

/** /profile: personal data only (physical data -> /progress, credentials -> /security). */
export function ProfilePage(): JSX.Element {
  useDocumentTitle('Perfil');
  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Perfil" />
      <PersonalDataCard />
    </div>
  );
}
