import React from 'react';
import type { LeadStatus } from '../../types/database';

export interface BadgeProps {
  status?: LeadStatus | string;
  variant?: 'status' | 'neutral' | 'primary';
  size?: 'sm' | 'md';
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  variant = 'status',
  size = 'md',
  children,
}) => {
  const getStyles = () => {
    if (variant === 'status' && status) {
      switch (status) {
        case 'New':
          return { bg: 'var(--status-new-bg)', border: 'var(--status-new-border)', color: 'var(--status-new)' };
        case 'Contacted':
          return { bg: 'var(--status-contacted-bg)', border: 'var(--status-contacted-border)', color: 'var(--status-contacted)' };
        case 'Qualified':
          return { bg: 'var(--status-qualified-bg)', border: 'var(--status-qualified-border)', color: 'var(--status-qualified)' };
        case 'Converted':
          return { bg: 'var(--status-converted-bg)', border: 'var(--status-converted-border)', color: 'var(--status-converted)' };
        case 'Lost':
          return { bg: 'var(--status-lost-bg)', border: 'var(--status-lost-border)', color: 'var(--status-lost)' };
        default:
          return { bg: 'rgba(148, 163, 184, 0.1)', border: 'rgba(148, 163, 184, 0.3)', color: '#94a3b8' };
      }
    }

    if (variant === 'primary') {
      return { bg: 'var(--primary-light)', border: 'rgba(37, 99, 235, 0.4)', color: 'var(--accent)' };
    }

    return { bg: 'rgba(255, 255, 255, 0.05)', border: 'var(--border-subtle)', color: 'var(--text-muted)' };
  };

  const current = getStyles();
  const isSm = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: isSm ? '2px 8px' : '4px 12px',
        borderRadius: 'var(--radius-full)',
        fontSize: isSm ? '0.75rem' : '0.825rem',
        fontWeight: 600,
        background: current.bg,
        border: `1px solid ${current.border}`,
        color: current.color,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: isSm ? '5px' : '6px',
          height: isSm ? '5px' : '6px',
          borderRadius: '50%',
          backgroundColor: current.color,
        }}
      />
      {children || status}
    </span>
  );
};
