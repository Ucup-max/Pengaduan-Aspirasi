import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface AlertProps {
  type?: 'error' | 'success' | 'info';
  title?: string;
  message: string;
  className?: string;
}

export function Alert({ type = 'error', title, message, className = '' }: AlertProps) {
  if (type === 'success') {
    return (
      <div
        className={`p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200 ${className}`}
      >
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          {title && <span className="font-bold mr-1">{title}</span>}
          <span>{message}</span>
        </div>
      </div>
    );
  }

  if (type === 'info') {
    return (
      <div
        className={`p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200 ${className}`}
      >
        <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <div>
          {title && <span className="font-bold mr-1">{title}</span>}
          <span>{message}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      id="alertBox"
      className={`p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200 ${className}`}
    >
      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
      <div>
        {title && <span className="font-bold mr-1">{title}</span>}
        <span id="alertMessage">{message}</span>
      </div>
    </div>
  );
}
