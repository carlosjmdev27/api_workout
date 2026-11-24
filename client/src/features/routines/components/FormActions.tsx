import type { JSX } from 'react';
import { Save } from 'lucide-react';
import { Alert } from '../../../components/Alert';
import { Button } from '../../../components/Button';
import { LinkButton } from '../../../components/LinkButton';
import { getErrorDetails, getErrorMessage } from '../../../utils/errors';

interface FormActionsProps {
  cancelTo: string;
  submitLabel: string;
  pending: boolean;
  error: unknown;
}

/** Server error banner + Cancel / Submit buttons at the bottom of a form. */
export function FormActions({ cancelTo, submitLabel, pending, error }: FormActionsProps): JSX.Element {
  return (
    <div className="space-y-4">
      {error !== null && (
        <Alert message={getErrorMessage(error)} details={getErrorDetails(error)} />
      )}
      <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
        <LinkButton to={cancelTo} variant="secondary">
          Cancelar
        </LinkButton>
        <Button type="submit" icon={Save} loading={pending}>
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
