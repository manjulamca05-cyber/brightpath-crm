import React from 'react';
import type { UserRole } from '../../types/database';

interface RoleBadgeProps {
  role?: UserRole | null;
  size?: 'sm' | 'md';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role = 'counsellor', size = 'md' }) => {
  const getBadgeStyle = () => {
    switch (role) {
      case 'admin':
        return {
          bg: 'rgba(168, 85, 247, 0.15)',
          border: '1px solid rgba(168, 85, 247, 0.4)',
          color: '#c084fc',
          label: 'Admin',
        };
      case 'manager':
        return {
          bg: 'rgba(59, 130, 246, 0.15)',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          color: '#60a5fa',
          label: 'Manager',
        };
      case 'counsellor':
      default:
        return {
          bg: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: '#34d399',
          label: 'Counsellor',
        };
    }
  };

  const style = getBadgeStyle();
  const isSm = size === 'sm';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: isSm ? '2px 8px' : '4px 12px',
      borderRadius: '9999px',
      fontSize: isSm ? '0.75rem' : '0.825rem',
      fontWeight: 600,
      background: style.bg,
      border: style.border,
      color: style.color,
      letterSpacing: '0.02em',
      textTransform: 'capitalize',
    }}>
      <span style={{
        width: isSm ? '6px' : '7px',
        height: isSm ? '6px' : '7px',
        borderRadius: '50%',
        backgroundColor: style.color,
      }} />
      {style.label}
    </span>
  );
};
