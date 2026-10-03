import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading data...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 gap-3 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-slate-600">{text}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8 gap-3 text-slate-500">
      <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      <span className="text-sm font-medium text-slate-600">{text}</span>
    </div>
  );
};

export default LoadingSpinner;
