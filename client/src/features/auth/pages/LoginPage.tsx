import { useState, type FormEvent, type JSX } from 'react';
import { LogIn } from 'lucide-react';
import { LIMITS, loginInputSchema } from '@gym/shared';
import { Link } from 'react-router-dom';
import { Alert } from '../../../components/Alert';
import { Button } from '../../../components/Button';
import { TextField } from '../../../components/FormField';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { getErrorMessage } from '../../../utils/errors';
import { validateWith, type FieldErrors } from '../../../utils/validation';
import { useAuth } from '../auth-context';
import { AuthCard } from '../components/AuthCard';

/** On success the session changes and <PublicOnlyRoute> takes the user where they were going. */
export function LoginPage(): JSX.Element {
  useDocumentTitle('Iniciar sesión');
  const { state, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<unknown>(null);
  const [pending, setPending] = useState(false);
  const expired = state.status === 'anonymous' && state.expired === true;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const result = validateWith(loginInputSchema, { email, password });
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
      footer={<>¿No tienes cuenta? <Link to="/register" className="font-medium text-indigo-600 hover:underline">Crear cuenta</Link></>}
    >
      <form noValidate onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
        {expired && apiError === null && <Alert message="Tu sesión ha caducado. Vuelve a iniciar sesión." />}
        {apiError !== null && <Alert message={getErrorMessage(apiError)} />}
        <TextField label="Email" type="email" autoComplete="email" inputMode="email" required maxLength={LIMITS.EMAIL_MAX} value={email} error={errors.email} onChange={(e) => setEmail(e.target.value)} />
        <TextField label="Contraseña" type="password" autoComplete="current-password" required value={password} error={errors.password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" icon={LogIn} loading={pending} className="w-full">Entrar</Button>
      </form>
    </AuthCard>
  );
}
