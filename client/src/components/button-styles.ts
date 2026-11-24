import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

/** Our button API, mapped onto the shadcn/ui variants (single source of the look). */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'xl';

const VARIANTS = {
  primary: 'default',
  secondary: 'outline',
  danger: 'destructive',
  ghost: 'ghost',
} as const satisfies Record<ButtonVariant, string>;

/** sm = 32px (compact rows), md = 36px (page actions), xl = 48px (main call to action). */
const SIZES = { sm: 'default', md: 'lg', xl: 'lg' } as const satisfies Record<ButtonSize, string>;
const EXTRA: Record<ButtonSize, string> = { sm: '', md: 'px-3.5', xl: 'h-12 px-5 text-base' };

export function buttonClasses(variant: ButtonVariant, size: ButtonSize, className?: string): string {
  return cn(buttonVariants({ variant: VARIANTS[variant], size: SIZES[size] }), EXTRA[size], className);
}
