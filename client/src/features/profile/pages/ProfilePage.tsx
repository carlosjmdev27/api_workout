import type { JSX } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '../../../components/Button';
import { PageHeader } from '../../../components/PageHeader';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useLogout } from '../../auth/useLogout';
import { PasswordCard } from '../components/PasswordCard';
import { PersonalDataCard } from '../components/PersonalDataCard';

/** /profile: personal data, password change and a logout button handy on mobile. */
export function ProfilePage(): JSX.Element {
  useDocumentTitle('Perfil');
  const logout = useLogout();

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Perfil" backTo="/" backLabel="My Workouts" />
      <div className="space-y-4">
        <PersonalDataCard />
        <PasswordCard />
        <div className="flex justify-center pt-2">
          <Button variant="ghost" icon={LogOut} onClick={logout}>Cerrar sesión</Button>
        </div>
      </div>
    </div>
  );
}
