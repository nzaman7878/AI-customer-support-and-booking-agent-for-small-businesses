import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'urgent';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 cursor-pointer user-select-none gap-1.5 focus-visible:outline-none';
  
  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2.5 py-1.5 leading-4' 
    : 'text-[13px] px-3.5 py-2 leading-[18px]';

  const variantClasses = {
    primary: 'bg-[#1E3A2F] text-white hover:bg-[#152B23] active:bg-[#0E1D18] focus-visible:ring-2 focus-visible:ring-[#1E3A2F] focus-visible:ring-offset-2',
    secondary: 'bg-white text-[#1C1917] border border-[#E5DFD5] hover:bg-[#F3EFE8] hover:border-[#D8D0C3] active:bg-[#EBE5DB] focus-visible:ring-2 focus-visible:ring-[#D8D0C3]',
    ghost: 'bg-transparent text-[#78716C] hover:text-[#1C1917] hover:bg-[#F3EFE8]',
    urgent: 'bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA] hover:bg-[#FEE2E2]'
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
