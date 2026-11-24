import { useState, type JSX } from 'react';
import { MailCheck, Send } from 'lucide-react';
import { Button } from '../../../components/Button';
import { authApi } from '../../../services/auth.api';
import { getErrorMessage } from '../../../utils/errors';

type Status = 'idle' | 'sending' | 'sent' | 'error';

/**
 * "Reenviar correo": asks for a new confirmation link. The API answers the same whether
 * or not the account exists, so the message is deliberately neutral.
 */
export function ResendVerificationButton({ identifier }: { identifier: string }): JSX.Element {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<unknown>(null);

  const resend = async (): Promise<void> => {
    setStatus('sending');
    try {
      await authApi.resendVerification({ identifier });
      setStatus('sent');
    } catch (caught) {
      setError(caught);
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <p role="status" className="flex items-center gap-1.5 text-sm font-medium text-primary">
        <MailCheck className="h-4 w-4" aria-hidden="true" />
        Si la cuenta está pendiente de confirmar, te hemos enviado un enlace nuevo.
      </p>
    );
  }
  return (
    <div className="space-y-1">
      <Button type="button" variant="secondary" size="sm" icon={Send} loading={status === 'sending'} onClick={() => void resend()}>
        Reenviar correo
      </Button>
      {status === 'error' && <p role="alert" className="text-xs text-destructive">{getErrorMessage(error)}</p>}
    </div>
  );
}
