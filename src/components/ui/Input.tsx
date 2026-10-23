import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  id,
  style,
  disabled,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: error ? '#f87171' : 'var(--text-muted)',
            letterSpacing: '0.01em',
          }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        disabled={disabled}
        aria-invalid={!!error}
        style={{
          width: '100%',
          minHeight: '44px',
          padding: '10px 14px',
          background: 'var(--bg-input)',
          border: `1px solid ${error ? '#ef4444' : 'var(--border-default)'}`,
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-main)',
          fontSize: '0.9rem',
          fontFamily: 'inherit',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s ease',
          opacity: disabled ? 0.6 : 1,
          ...style,
        }}
        onFocus={(e) => {
          if (!error) e.currentTarget.style.borderColor = 'var(--accent)';
        }}
        onBlur={(e) => {
          if (!error) e.currentTarget.style.borderColor = 'var(--border-default)';
        }}
        {...props}
      />
      {error && (
        <span style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 500 }}>
          {error}
        </span>
      )}
      {!error && helperText && (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
          {helperText}
        </span>
      )}
    </div>
  );
};
