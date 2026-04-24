// filepath: src/Componenets/Loading.jsx
import React from 'react';

const Loading = ({ size = 'md', text, fullScreen = false, className = '' }) => {
  const sizes = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-16 h-16' };
  const spinner = (
    <svg className={`animate-spin ${sizes[size]} text-[#c0392b]`} viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          {spinner}
          {text && <p className="text-gray-600 dark:text-gray-400">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      {spinner}
      {text && <p className="text-gray-600 dark:text-gray-400">{text}</p>}
    </div>
  );
};

export default Loading;