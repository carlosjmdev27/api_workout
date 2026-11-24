import { useState, type FormEvent, type JSX } from 'react';
import { CircleCheck, LogIn, MailCheck, UserPlus } from 'lucide-react';
import { LIMITS, registerInputSchema, type RegisterResponse } from '@gym/shared';
import { Link } from 'react-router-dom';
import { Alert } from '../../../components/Alert';
import { Button } from '../../../components/Button';
import { LinkButton } from '../../../components/LinkButton';
import { PasswordField, TextField } from '../../../components/FormField';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { getErrorMessage } from '../../../utils/errors';
import { validateWith, type FieldErrors } from '../../../utils/validation';
import { useAuth } from '../auth-context';
import { AuthCard } from '../components/AuthCard';
import { ResendVerificationButton } from '../components/ResendVerificationButton';

const toLogin = <>¿Ya tienes cuenta? <Link to="/login" className="font-medium text-primary hover:underline">Inicia sesión</Link></>;

/** Verification switched off on the server: the account is ready to use. */
function AccountReady({ email }: { email: string }): JSX.Element {
  return (
    <AuthCard title="¡Cuenta creada!" subtitle="Ya puedes entrar con tu nombre de usuario o tu correo." footer={toLogin}>
      <div className="space-y-4 text-sm">
        <div className="flex items-start gap-3 rounded-lg bg-primary/10 p-3 text-foreground">
          <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <p>Tu cuenta con <strong className="break-all">{email}</strong> está lista.</p>
        </div>
        <LinkButton to="/login" icon={LogIn}>Iniciar sesión</LinkButton>
      </div>
    </AuthCard>
  );
}

/** After sign-up: the account exists but stays locked until the emailed link is opened. */
function CheckInbox({ result }: { result: RegisterResponse }): JSX.Element {
  if (!result.verificationRequired) return <AccountReady email={result.email} />;
  return (
    <AuthCard title="Revisa tu bandeja de entrada" subtitle="Solo falta confirmar tu correo para activar la cuenta." footer={toLogin}>
      <div className="space-y-4 text-sm">
        <div className="flex items-start gap-3 rounded-lg bg-primary/10 p-3 text-foreground">
          <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          {result.emailSent ? (
            <p>Te hemos enviado un enlace a <strong className="break-all">{result.email}</strong>. Caduca en {LIMITS.VERIFICATION_TTL_HOURS} horas.</p>
          ) : (
            <p>Tu cuenta está creada, pero no pudimos enviar el correo a <strong className="break-all">{result.email}</strong>. Pide uno nuevo.</p>
          )}
        </div>
        <p className="text-muted-foreground">¿No te ha llegado? Mira en la carpeta de spam o pide otro enlace.</p>
        <ResendVerificationButton identifier={result.email} />
        <LinkButton to="/login" variant="secondary" icon={LogIn}>Ir a iniciar sesión</LinkButton>
      </div>
    </AuthCard>
  );
}

export function RegisterPage(): JSX.Element {
  useDocumentTitle('Crear cuenta');
  const { register } = useAuth();
  const [values, setValues] = useState({ name: '', username: '', email: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<unknown>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<RegisterResponse | null>(null);
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
      setDone(await register(result.data)); // No session yet: the email must be confirmed.
    } catch (error) {
      setApiError(error);
    } finally {
      setPending(false);
    }
  };

  if (done) return <CheckInbox result={done} />;

  return (
    <AuthCard title="Crear cuenta" subtitle="Tus rutinas e historial serán privados: solo tú podrás verlos." footer={toLogin}>
      <form noValidate onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
        {apiError !== null && <Alert message={getErrorMessage(apiError)} />}
        <TextField label="Nombre" autoComplete="name" required maxLength={LIMITS.NAME_MAX} {...field('name')} />
        <TextField
          label="Nombre de usuario"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          maxLength={LIMITS.USERNAME_MAX}
          hint={`${LIMITS.USERNAME_MIN}-${LIMITS.USERNAME_MAX} letras, números o "_". Podrás entrar con él o con tu correo.`}
          {...field('username')}
        />
        <TextField label="Correo electrónico" type="email" autoComplete="email" inputMode="email" required maxLength={LIMITS.EMAIL_MAX} hint="Usa un correo real: comprobamos que su dominio existe." {...field('email')} />
        <PasswordField label="Contraseña" autoComplete="new-password" required hint={`Mínimo ${LIMITS.PASSWORD_MIN} caracteres.`} {...field('password')} />
        <Button type="submit" icon={UserPlus} loading={pending} className="w-full">Crear cuenta</Button>
      </form>
    </AuthCard>
  );
}
