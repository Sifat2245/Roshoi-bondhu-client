import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  className = '',
}) => {
  const icons = {
    info: <Info size={18} className="text-blue-500 shrink-0" />,
    success: <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />,
    warning: <AlertTriangle size={18} className="text-amber-500 shrink-0" />,
    error: <AlertCircle size={18} className="text-red-500 shrink-0" />,
  };

  const bgStyles = {
    info: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/40 text-blue-800 dark:text-blue-200',
    success: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-200',
    warning: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-200',
    error: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/40 text-red-800 dark:text-red-200',
  };

  return (
    <div className={`p-4.5 rounded-2xl border flex items-start gap-3.5 text-sm ${bgStyles[type]} ${className}`}>
      {icons[type]}
      <div>
        {title && <p className="font-bold text-base">{title}</p>}
        <p className="mt-0.5 opacity-90 leading-relaxed">{message}</p>
      </div>
    </div>
  );
};

export default Alert;

