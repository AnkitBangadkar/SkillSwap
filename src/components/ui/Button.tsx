import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 
      'inline-flex items-center justify-center font-bold rounded-lg transition-all active:scale-[0.98] focus:outline-none disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 uppercase tracking-wide';

    const variants = {
      primary:
        'btn-primary',
      secondary:
        'bg-[var(--bg-surface)] text-[var(--text-primary)] border-2 border-[var(--border-default)] hover:bg-[var(--bg-surface-highlight)]',
      outline:
        'btn-outline',
      ghost:
        'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-surface-highlight)] hover:text-[var(--text-primary)] hover:underline decoration-2 underline-offset-4',
      danger:
        'bg-[var(--color-error)] text-white hover:opacity-90 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2',
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
