import type { JSX, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buttonClasses, type ButtonSize, type ButtonVariant } from './button-styles';

interface LinkButtonProps {
  to: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  children: ReactNode;
}

/** Navigation link styled as a button. */
export function LinkButton({
  to,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  children,
}: LinkButtonProps): JSX.Element {
  return (
    <Link to={to} className={buttonClasses(variant, size)}>
      {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
      {children}
    </Link>
  );
}
