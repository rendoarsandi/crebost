import React from 'react';
import { cn } from '../../lib/utils';

interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  from?: string;
  via?: string;
  to?: string;
}

export const GradientText = ({
  children,
  className,
  from = 'from-primary', // Default from Tailwind theme
  via,                  // Optional via color
  to = 'to-purple-600', // Default to, example
  ...props
}: GradientTextProps) => {
  const gradientClasses = `bg-gradient-to-r ${from} ${via || ''} ${to}`;

  return (
    <span
      className={cn(
        gradientClasses,
        'bg-clip-text text-transparent',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
