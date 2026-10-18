import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  placeholder,
  id,
  style,
  disabled,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
      {label && (
        <label
          htmlFor={selectId}
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
      <select
        id={selectId}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '10px 14px',
          background: 'var(--bg-input)',
          border: `1px solid ${error ? '#ef4444' : 'var(--border-default)'}`,
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-main)',
          fontSize: '0.9rem',
          fontFamily: 'inherit',
          outline: 'none',
          boxSizing: 'border-box',
          cursor: disabled ? 'not-allowed' : 'pointer',
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
      >
        {placeholder && (
          <option value="" disabled style={{ background: '#0f172a', color: '#64748b' }}>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: '#0f172a', color: '#f8fafc' }}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 500 }}>
          {error}
        </span>
      )}
    </div>
  );
};
