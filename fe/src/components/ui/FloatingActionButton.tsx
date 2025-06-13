import React from 'react';
import { Button } from '@nextui-org/react';
import { Plus, Edit3, MessageCircle, Camera } from 'react-feather';

interface FloatingActionButtonProps {
  onClick?: () => void;
  icon?: 'plus' | 'edit' | 'message' | 'camera';
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  tooltip?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon = 'plus',
  variant = 'primary',
  size = 'md',
  className = '',
  tooltip
}) => {
  const icons = {
    plus: Plus,
    edit: Edit3,
    message: MessageCircle,
    camera: Camera
  };

  const IconComponent = icons[icon];

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 18,
    md: 20,
    lg: 24
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-primary-500/25',
    secondary: 'bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 shadow-secondary-500/25',
    accent: 'bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 shadow-accent-500/25'
  };

  return (
    <div className="group relative">
      <Button
        isIconOnly
        onPress={onClick}
        className={`
          fixed bottom-6 right-6 z-50
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          text-white
          rounded-full
          shadow-large hover:shadow-glow
          transition-all duration-300
          transform hover:scale-110 active:scale-95
          border-2 border-white/20
          ${className}
        `}
        aria-label={tooltip || 'Floating action button'}
      >
        <IconComponent 
          size={iconSizes[size]} 
          className="transition-transform duration-300 group-hover:rotate-90" 
        />
      </Button>

      {/* Tooltip */}
      {tooltip && (
        <div className="fixed bottom-6 right-20 z-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-dark-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
            {tooltip}
            <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-dark-800 rotate-45"></div>
          </div>
        </div>
      )}

      {/* Ripple effect */}
      <div className={`
        fixed bottom-6 right-6 z-40
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        rounded-full
        opacity-0 group-hover:opacity-20
        animate-ping
        pointer-events-none
      `}></div>
    </div>
  );
};

export default FloatingActionButton;
