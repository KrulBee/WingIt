import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'accent' | 'white';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  variant = 'primary',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const variantClasses = {
    primary: 'border-primary-500 border-t-transparent',
    secondary: 'border-secondary-500 border-t-transparent',
    accent: 'border-accent-500 border-t-transparent',
    white: 'border-white border-t-transparent'
  };

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        ${variantClasses[variant]} 
        border-2 rounded-full animate-spin
        ${className}
      `}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
