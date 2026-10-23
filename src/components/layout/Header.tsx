import React from 'react';
import { Menu } from 'lucide-react';
import { RoleBadge } from '../../features/auth/RoleBadge';
import { useAuth } from '../../features/auth/useAuth';

export interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  title = 'BrightPath CRM',
  subtitle,
}) => {
  const { role } = useAuth();

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Hamburger Menu on Mobile */}
        <button
          onClick={onMenuClick}
          aria-label="Toggle navigation menu"
          className="mobile-nav-toggle"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '10px',
            minWidth: '44px',
            minHeight: '44px',
            borderRadius: 'var(--radius-sm)',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Menu size={22} aria-hidden="true" />
        </button>

        {/* Title & Breadcrumb */}
        <div>
          <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
            {title}
          </h1>
          {subtitle && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {/* Header Actions & Role */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.8rem',
          color: '#34d399',
          background: 'rgba(16, 185, 129, 0.1)',
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          <span>Supabase Live</span>
        </div>
        <RoleBadge role={role} size="sm" />
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .mobile-nav-toggle {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
};
