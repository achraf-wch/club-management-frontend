// filepath: src/Componenets/Card.jsx
import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  footer,
  variant = 'default',
  padding = 'md',
  className = '',
  onClick,
  ...props
}) => {
  const variants = {
    default: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
    elevated: 'bg-white dark:bg-gray-900 shadow-xl',
    outlined: 'bg-transparent border-2 border-gray-200 dark:border-gray-700',
    glass: 'bg-white/10 backdrop-blur-xl border border-white/20',
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-3xl transition-all duration-300 ${variants[variant]} ${paddings[padding]} ${onClick ? 'cursor-pointer hover:shadow-2xl hover:scale-[1.02]' : ''} ${className}`}
      {...props}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;