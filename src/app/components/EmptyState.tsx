import React from 'react';
import { Button } from '@/app/components/button';
import Link from 'next/link';

export interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  variant?: 'default' | 'compact';
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = 'default'
}: EmptyStateProps) {
  const isCompact = variant === 'compact';

  return (
    <div className={`flex flex-col items-center justify-center ${isCompact ? 'py-8' : 'py-12'} px-4`}>
      <div className={`rounded-full bg-muted p-4 mb-4 ${isCompact ? '' : 'mb-6'}`}>
        <Icon className={`${isCompact ? 'h-8 w-8' : 'h-12 w-12'} text-muted-foreground`} />
      </div>

      <h3 className={`${isCompact ? 'text-base' : 'text-lg'} font-semibold mb-2 text-center`}>
        {title}
      </h3>

      <p className={`${isCompact ? 'text-xs' : 'text-sm'} text-muted-foreground text-center max-w-md mb-6`}>
        {description}
      </p>

      {action && (
        action.href ? (
          <Link href={action.href}>
            <Button size={isCompact ? 'sm' : 'default'}>
              {action.label}
            </Button>
          </Link>
        ) : (
          <Button size={isCompact ? 'sm' : 'default'} onClick={action.onClick}>
            {action.label}
          </Button>
        )
      )}
    </div>
  );
}
