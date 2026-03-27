import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  children: ReactNode;
  className?: string;
}

export function Alert({ variant = 'info', children, className }: AlertProps) {
  return (
    <div
      className={clsx(
        'p-4 rounded-lg border-l-4',
        {
          'bg-blue-50 border-blue-500 text-blue-900': variant === 'info',
          'bg-green-50 border-green-500 text-green-900': variant === 'success',
          'bg-yellow-50 border-yellow-500 text-yellow-900': variant === 'warning',
          'bg-red-50 border-red-500 text-red-900': variant === 'danger',
        },
        className
      )}
    >
      {children}
    </div>
  );
}
