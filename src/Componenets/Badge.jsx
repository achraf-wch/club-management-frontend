// filepath: src/Componenets/Badge.jsx
import React from 'react';

const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    primary: 'bg-[#c0392b]/10 text-[#c0392b] dark:bg-[#c0392b]/20',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  };

  const sizes = { sm: 'px-2 py-0.5 text-xs', md: 'px-2.5 py-1 text-sm' };

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;