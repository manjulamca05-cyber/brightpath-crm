import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RoleBadge } from '../features/auth/RoleBadge';
import { useAuth } from '../features/auth/useAuth';
import { Shield, LogOut } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, profile, role, signOut } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      {/* User Profile Card */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            color: '#fff',
            fontWeight: 700,
          }}>
            {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {profile?.full_name || 'Team Member'}
            </h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '2px' }}>
              {user?.email}
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          padding: '16px',
          background: 'var(--bg-canvas)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}>
          <div>
            <div style={{ color: 'var(--text-subtle)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              System Role
            </div>
            <div style={{ marginTop: '6px' }}>
              <RoleBadge role={role} size="md" />
            </div>
          </div>

          <div>
            <div style={{ color: 'var(--text-subtle)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Account UUID
            </div>
            <div style={{ color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 500, marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
              {user?.id ? `${user.id.substring(0, 14)}...` : 'N/A'}
            </div>
          </div>
        </div>
      </Card>

      {/* Role & Security Card */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <Shield size={20} color="var(--accent)" />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Role Permissions & Immutability
          </h3>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 16px' }}>
          Per the master security specification, users cannot elevate their own role through client requests. Roles are strictly enforced at the PostgreSQL Row Level Security (RLS) layer.
        </p>

        <div style={{
          background: 'var(--bg-canvas)',
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: 600 }}>
            Admin Elevation Query (Run in Supabase SQL Editor):
          </div>
          <pre style={{
            margin: 0,
            padding: '10px',
            background: '#020617',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--accent)',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-mono)',
            overflowX: 'auto',
          }}>
{`UPDATE public.profiles 
SET role = 'admin' 
WHERE id = '${user?.id || 'YOUR_USER_ID'}';`}
          </pre>
        </div>
      </Card>

      {/* Account Session Actions */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Active Session
            </h4>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-subtle)' }}>
              Signed in via Supabase Auth secure token
            </p>
          </div>
          <Button variant="danger" onClick={() => signOut()} icon={<LogOut size={16} />}>
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
};
