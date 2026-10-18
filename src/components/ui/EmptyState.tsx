import React from 'react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        background: 'var(--bg-card)',
        border: '1px dashed var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        color: 'var(--text-muted)',
      }}
    >
      {icon && (
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          color: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}>
          {icon}
        </div>
      )}
      <h3 style={{ margin: '0 0 8px', fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)' }}>
        {title}
      </h3>
      <p style={{ margin: '0 0 20px', fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '420px', lineHeight: 1.5 }}>
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
