import React from 'react';

export interface BadgeProps {
  variant?: 'neutral' | 'accent' | 'success' | 'warning' | 'urgent';
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  className = '',
  dot = false
}) => {
  const variantClasses = {
    neutral: 'bg-[#F3EFE8] text-[#78716C] border-[#E5DFD5]',
    accent: 'bg-[#EBF2EE] text-[#1B4332] border-[#C6E7D2]',
    success: 'bg-[#EAF5EE] text-[#1B4332] border-[#C6E7D2]',
    warning: 'bg-[#FEF9C3] text-[#854D0E] border-[#FDE047]',
    urgent: 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]'
  }[variant];

  const dotClasses = {
    neutral: 'bg-[#78716C]',
    accent: 'bg-[#1B4332]',
    success: 'bg-[#1B4332]',
    warning: 'bg-[#854D0E]',
    urgent: 'bg-[#991B1B]'
  }[variant];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border leading-tight ${variantClasses} ${className}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotClasses}`} />}
      {children}
    </span>
  );
};
