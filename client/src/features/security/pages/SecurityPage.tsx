import type { JSX } from 'react';
import { PageHeader } from '../../../components/PageHeader';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { IdentityCard } from '../components/IdentityCard';
import { PasswordCard } from '../components/PasswordCard';

/** /security: login identity (username + email) and password change. */
export function SecurityPage(): JSX.Element {
  useDocumentTitle('Seguridad');
  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Seguridad" description="Tus datos de acceso a AuraWorkout." />
      <div className="space-y-4">
        <IdentityCard />
        <PasswordCard />
      </div>
    </div>
  );
}
