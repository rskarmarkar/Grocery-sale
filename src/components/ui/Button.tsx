import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
type ButtonSize = 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-honey border-2 border-ink text-ink hover:opacity-90 active:opacity-80',
  secondary: 'bg-pale border-2 border-ink text-ink hover:opacity-90 active:opacity-80',
  tertiary: 'bg-sprout-600 border-2 border-transparent text-white hover:bg-sprout-700 active:opacity-80'
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: 'h-11 px-6 text-sm',
  lg: 'h-[3.125rem] px-8 text-base'
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  disabled,
  ...rest
}) => {
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-heading font-bold transition-all duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:opacity-50 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};
