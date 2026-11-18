import type { JSX } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ErrorState } from './StatusViews';

export function NotFound(): JSX.Element {
  useDocumentTitle('Página no encontrada');
  return <ErrorState message="La página que buscas no existe." backTo="/" />;
}
