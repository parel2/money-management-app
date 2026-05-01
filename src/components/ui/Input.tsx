import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefix?: string;
}

export function Input({ label, error, prefix, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3.5 text-gray-500 text-sm font-mono pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          {...props}
          className={`w-full bg-surface-700 border border-white/10 rounded-xl px-3.5 py-3 text-white placeholder-gray-600 text-sm
            focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all
            ${prefix ? 'pl-10' : ''}
            ${error ? 'border-red-500/50 focus:border-red-500' : ''}
            ${className}`}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        {...props}
        className={`w-full bg-surface-700 border border-white/10 rounded-xl px-3.5 py-3 text-white text-sm
          focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all
          appearance-none cursor-pointer ${className}`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-surface-700">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
