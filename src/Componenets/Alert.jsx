// filepath: src/Componenets/Alert.jsx
import React from 'react';

const Alert = ({ type = 'info', title, children, dismissible = false, onDismiss, className = '' }) => {
  const types = {
    info: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', icon: 'text-blue-500', title: 'text-blue-800 dark:text-blue-200', text: 'text-blue-700 dark:text-blue-300' },
    success: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', icon: 'text-green-500', title: 'text-green-800 dark:text-green-200', text: 'text-green-700 dark:text-green-300' },
    warning: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', icon: 'text-yellow-500', title: 'text-yellow-800 dark:text-yellow-200', text: 'text-yellow-700 dark:text-yellow-300' },
    error: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', icon: 'text-red-500', title: 'text-red-800 dark:text-red-200', text: 'text-red-700 dark:text-red-300' },
  };

  const icons = {
    info: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    success: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    warning: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    error: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  };

  const style = types[type];

  return (
    <div className={`rounded-xl p-4 border ${style.bg} ${style.border} ${className}`}>
      <div className="flex items-start gap-3">
        <span className={`flex-shrink-0 ${style.icon}`}>{icons[type]}</span>
        <div className="flex-1">
          {title && <h4 className={`font-semibold ${style.title}`}>{title}</h4>}
          <div className={`${title ? 'mt-1' : ''} ${style.text}`}>{children}</div>
        </div>
        {dismissible && <button onClick={onDismiss} className={`flex-shrink-0 ${style.icon} hover:opacity-70`}><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>}
      </div>
    </div>
  );
};

export default Alert;