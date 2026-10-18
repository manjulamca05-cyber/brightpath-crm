import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = 'md',
  hoverable = false,
  style,
  className = '',
  ...props
}) => {
  const getPadding = () => {
    switch (padding) {
      case 'none': return '0';
      case 'sm': return '12px 16px';
      case 'lg': return '28px 32px';
      case 'md':
      default: return '20px 24px';
    }
  };

  return (
    <div
      className={`animate-fade-in ${className}`}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        padding: getPadding(),
        transition: hoverable ? 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease' : undefined,
        ...style,
      }}
      onMouseOver={hoverable ? (e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'var(--border-hover)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
      } : undefined}
      onMouseOut={hoverable ? (e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      } : undefined}
      {...props}
    >
      {children}
    </div>
  );
};
