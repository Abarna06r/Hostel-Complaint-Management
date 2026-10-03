import React, { forwardRef } from 'react';

export const Textarea = forwardRef(
  (
    {
      label,
      error,
      helperText,
      rows = 4,
      className = '',
      required = false,
      disabled = false,
      maxLength,
      value,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <label className="block text-sm font-medium text-slate-700">
              {label}
              {required && <span className="text-rose-500 ml-1">*</span>}
            </label>
          )}
          {maxLength && value !== undefined && (
            <span className="text-xs text-slate-400">
              {value.length}/{maxLength}
            </span>
          )}
        </div>
        <textarea
          ref={ref}
          rows={rows}
          value={value}
          maxLength={maxLength}
          disabled={disabled}
          className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors
            ${
              error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
                : 'border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
            }
            ${disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
        {!error && helperText && (
          <p className="mt-1 text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;
