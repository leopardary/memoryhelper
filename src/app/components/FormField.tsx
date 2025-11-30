import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';

export interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  error?: FieldError;
  register: UseFormRegister<any>;
  validation?: Record<string, any>;
  autoComplete?: string;
  disabled?: boolean;
  className?: string;
}

export function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  register,
  validation = {},
  autoComplete,
  disabled = false,
  className = ''
}: FormFieldProps) {
  return (
    <div className="w-full">
      <label htmlFor={name} className="block text-sm font-medium mb-1">
        {label}
      </label>
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        className={`
          w-full rounded-lg border px-3 py-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-primary/50
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-destructive focus:ring-destructive/50' : 'border-border'}
          ${className}
        `}
        {...register(name, validation)}
      />
      {error && (
        <p className="mt-1 text-sm text-destructive flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error.message}
        </p>
      )}
    </div>
  );
}

export interface TextAreaFieldProps {
  label: string;
  name: string;
  placeholder?: string;
  error?: FieldError;
  register: UseFormRegister<any>;
  validation?: Record<string, any>;
  disabled?: boolean;
  rows?: number;
  className?: string;
}

export function TextAreaField({
  label,
  name,
  placeholder,
  error,
  register,
  validation = {},
  disabled = false,
  rows = 3,
  className = ''
}: TextAreaFieldProps) {
  return (
    <div className="w-full">
      <label htmlFor={name} className="block text-sm font-medium mb-1">
        {label}
      </label>
      <textarea
        id={name}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`
          w-full rounded-lg border px-3 py-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-primary/50
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-destructive focus:ring-destructive/50' : 'border-border'}
          ${className}
        `}
        {...register(name, validation)}
      />
      {error && (
        <p className="mt-1 text-sm text-destructive flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error.message}
        </p>
      )}
    </div>
  );
}
