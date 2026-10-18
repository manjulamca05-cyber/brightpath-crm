import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarCheck, BarChart3, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../features/auth/useAuth';
import { RoleBadge } from '../../features/auth/RoleBadge';

export const Sidebar: React.FC = () => {
  const { user, profile, role, signOut } = useAuth();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={19} /> },
    { to: '/leads', label: 'Leads', icon: <Users size={19} /> },
    { to: '/followups', label: 'Follow-ups', icon: <CalendarCheck size={19} /> },
    { to: '/reports', label: 'Reports', icon: <BarChart3 size={19} /> },
    { to: '/settings', label: 'Settings', icon: <Settings size={19} /> },
  ];

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        boxSizing: 'border-box',
        zIndex: 20,
      }}
    >
      {/* Brand Header */}
      <div style={{
        padding: '20px 22px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)',
          flexShrink: 0,
        }}>
          🎯
        </div>
        <div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
            BrightPath CRM
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 500 }}>
            Coaching Academy
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              color: isActive ? '#ffffff' : 'var(--text-muted)',
              backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: isActive ? 600 : 500,
              transition: 'all 0.15s ease',
            })}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Profile & Sign Out Footer */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {profile?.full_name || user?.email?.split('@')[0]}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </div>
          </div>
          <RoleBadge role={role} size="sm" />
        </div>

        <button
          onClick={() => signOut()}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '7px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            background: 'rgba(239, 68, 68, 0.08)',
            color: '#f87171',
            fontSize: '0.8rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)')}
          onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)')}
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
