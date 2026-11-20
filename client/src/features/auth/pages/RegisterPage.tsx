import { useState, type FormEvent, type JSX } from 'react';
import { UserPlus } from 'lucide-react';
import { LIMITS, registerInputSchema } from '@gym/shared';
import { Link } from 'react-router-dom';
import { Alert } from '../../../components/Alert';
import { Button } from '../../../components/Button';
import { TextField } from '../../../components/FormField';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { getErrorMessage } from '../../../utils/errors';
import { validateWith, type FieldErrors } from '../../../utils/validation';
import { useAuth } from '../auth-context';
import { AuthCard } from '../components/AuthCard';

export function RegisterPage(): JSX.Element {
  useDocumentTitle('Crear cuenta');
  const { register } = useAuth();
  const [values, setValues] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<unknown>(null);
  const [pending, setPending] = useState(false);
  const field = (key: keyof typeof values) => ({
    value: values[key],
    error: errors[key],
    onChange: (event: { target: { value: string } }) => setValues((prev) => ({ ...prev, [key]: event.target.value })),
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const result = validateWith(registerInputSchema, values);
    if (!result.ok) return setErrors(result.errors);
    setErrors({});
    setApiError(null);
    setPending(true);
    try {
      await register(result.data); // <PublicOnlyRoute> then takes the user to the app.
    } catch (error) {
      setApiError(error);
      setPending(false);
    }
  };

  return (
    <AuthCard
      title="Crear cuenta"
      subtitle="Tus rutinas e historial serán privados: solo tú podrás verlos."
      footer={<>¿Ya tienes cuenta? <Link to="/login" className="font-medium text-indigo-600 hover:underline">Inicia sesión</Link></>}
    >
      <form noValidate onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
        {apiError !== null && <Alert message={getErrorMessage(apiError)} />}
        <TextField label="Nombre" autoComplete="name" required maxLength={LIMITS.NAME_MAX} {...field('name')} />
        <TextField label="Email" type="email" autoComplete="email" inputMode="email" required maxLength={LIMITS.EMAIL_MAX} {...field('email')} />
        <TextField label="Contraseña" type="password" autoComplete="new-password" required hint={`Mínimo ${LIMITS.PASSWORD_MIN} caracteres.`} {...field('password')} />
        <Button type="submit" icon={UserPlus} loading={pending} className="w-full">Crear cuenta</Button>
      </form>
    </AuthCard>
  );
}
