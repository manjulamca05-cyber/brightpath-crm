import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  disabled,
  style,
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'secondary':
        return {
          background: 'var(--bg-surface)',
          color: 'var(--text-main)',
          border: '1px solid var(--border-default)',
        };
      case 'danger':
        return {
          background: 'rgba(239, 68, 68, 0.15)',
          color: '#f87171',
          border: '1px solid rgba(239, 68, 68, 0.4)',
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: 'var(--text-muted)',
          border: 'none',
        };
      case 'outline':
        return {
          background: 'transparent',
          color: 'var(--primary)',
          border: '1px solid var(--primary)',
        };
      case 'primary':
      default:
        return {
          background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
        };
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return { padding: '6px 12px', fontSize: '0.8rem', minHeight: '36px', borderRadius: 'var(--radius-sm)' };
      case 'lg':
        return { padding: '12px 24px', fontSize: '1rem', minHeight: '48px', borderRadius: 'var(--radius-md)' };
      case 'md':
      default:
        return { padding: '8px 16px', fontSize: '0.875rem', minHeight: '44px', borderRadius: 'var(--radius-md)' };
    }
  };

  return (
    <button
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontWeight: 600,
        fontFamily: 'inherit',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.15s ease',
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style,
      }}
      {...props}
    >
      {loading && (
        <span
          style={{
            width: '14px',
            height: '14px',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }}
        />
      )}
      {!loading && icon}
      {children}
    </button>
  );
};
