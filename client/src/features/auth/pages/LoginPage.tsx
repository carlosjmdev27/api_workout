import { useState, type FormEvent, type JSX } from 'react';
import { LogIn } from 'lucide-react';
import { LIMITS, loginInputSchema } from '@gym/shared';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert } from '../../../components/Alert';
import { Button } from '../../../components/Button';
import { TextField } from '../../../components/FormField';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { ApiRequestError } from '../../../services/http-client';
import { getErrorMessage } from '../../../utils/errors';
import { validateWith, type FieldErrors } from '../../../utils/validation';
import { useAuth } from '../auth-context';
import { AuthCard } from '../components/AuthCard';
import { ResendVerificationButton } from '../components/ResendVerificationButton';

const isNotVerified = (error: unknown): boolean => error instanceof ApiRequestError && error.code === 'EMAIL_NOT_VERIFIED';

/** Result of the email confirmation link (the API redirects here with ?verified=…). */
function VerifiedBanner({ outcome }: { outcome: string | null }): JSX.Element | null {
  if (outcome === 'true') return <Alert tone="success" message="¡Correo confirmado! Ya puedes iniciar sesión." />;
  if (outcome === 'invalid') {
    return <Alert message="El enlace de confirmación no es válido o ha caducado. Inicia sesión para pedir uno nuevo." />;
  }
  return null;
}

/** On success the session changes and <PublicOnlyRoute> takes the user where they were going. */
export function LoginPage(): JSX.Element {
  useDocumentTitle('Iniciar sesión');
  const { state, login } = useAuth();
  const [params] = useSearchParams();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<unknown>(null);
  const [pending, setPending] = useState(false);
  const expired = state.status === 'anonymous' && state.expired === true;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const result = validateWith(loginInputSchema, { identifier, password });
    if (!result.ok) return setErrors(result.errors);
    setErrors({});
    setApiError(null);
    setPending(true);
    try {
      await login(result.data);
    } catch (error) {
      setApiError(error);
      setPending(false);
    }
  };

  return (
    <AuthCard
      title="Iniciar sesión"
      subtitle="Entra para ver tus rutinas y tu progreso."
      footer={<>¿No tienes cuenta? <Link to="/register" className="font-medium text-primary hover:underline">Crear cuenta</Link></>}
    >
      <form noValidate onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
        {apiError === null && <VerifiedBanner outcome={params.get('verified')} />}
        {expired && apiError === null && <Alert message="Tu sesión ha caducado. Vuelve a iniciar sesión." />}
        {apiError !== null && (
          <Alert
            message={getErrorMessage(apiError)}
            // Same identifier the user just typed: the new link goes to that account's email.
            action={isNotVerified(apiError) ? <ResendVerificationButton identifier={identifier.trim().toLowerCase()} /> : undefined}
          />
        )}
        <TextField
          label="Correo electrónico o nombre de usuario"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          maxLength={LIMITS.EMAIL_MAX}
          value={identifier}
          error={errors.identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
        <TextField label="Contraseña" type="password" autoComplete="current-password" required value={password} error={errors.password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" icon={LogIn} loading={pending} className="w-full">Entrar</Button>
      </form>
    </AuthCard>
  );
}
