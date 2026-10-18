import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { useAuth } from './features/auth/useAuth';
import { LoginPage } from './features/auth/LoginPage';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { RoleBadge } from './features/auth/RoleBadge';
import { isSupabaseConfigured, supabase } from './lib/supabaseClient';
import { ConfigMissingBanner } from './components/common/ConfigMissingBanner';
import './App.css';

// Authenticated Home view demonstrating Phase 3 session & role hydration
const AuthenticatedHome: React.FC = () => {
  const { user, profile, role, signOut } = useAuth();
  const [accessibleLeadsCount, setAccessibleLeadsCount] = useState<number | null>(null);
  const [loadingQuery, setLoadingQuery] = useState(false);

  // Probe database as the authenticated user to verify RLS permissions
  useEffect(() => {
    const fetchPermittedLeads = async () => {
      setLoadingQuery(true);
      const { count, error } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });

      if (!error && count !== null) {
        setAccessibleLeadsCount(count);
      }
      setLoadingQuery(false);
    };

    fetchPermittedLeads();
  }, [role]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0f1d',
      color: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top Navigation Bar */}
      <nav style={{
        backgroundColor: '#0f172a',
        borderBottom: '1px solid #1e293b',
        padding: '14px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
          }}>
            🎯
          </div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.01em' }}>
              BrightPath CRM
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
              Phase 3 Milestone
            </div>
          </div>
        </div>

        {/* User Profile & Sign Out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'right' }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f1f5f9' }}>
                {profile?.full_name || user?.email?.split('@')[0]}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                {user?.email}
              </div>
            </div>
            <RoleBadge role={role} size="sm" />
          </div>

          <button
            onClick={() => signOut()}
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)')}
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main style={{ maxWidth: '960px', width: '100%', margin: '40px auto', padding: '0 20px', boxSizing: 'border-box' }}>
        {/* Verification Card */}
        <div style={{
          background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
          border: '1px solid #334155',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
              }}>
                🔐
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 700, color: '#f8fafc' }}>
                  Phase 3 Verified: Authentication & Role Lifecycle
                </h1>
                <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                  Supabase Auth session active & PostgreSQL profile hydrated
                </p>
              </div>
            </div>
            <span style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}>
              AUTHENTICATED
            </span>
          </div>

          {/* Session Attributes Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}>
            <div style={{ background: '#0a0f1d', padding: '16px', borderRadius: '10px', border: '1px solid #1e293b' }}>
              <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Active User
              </div>
              <div style={{ color: '#f8fafc', fontSize: '0.95rem', fontWeight: 600, marginTop: '6px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </div>
            </div>

            <div style={{ background: '#0a0f1d', padding: '16px', borderRadius: '10px', border: '1px solid #1e293b' }}>
              <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Resolved Role (from DB)
              </div>
              <div style={{ marginTop: '8px' }}>
                <RoleBadge role={role} size="md" />
              </div>
            </div>

            <div style={{ background: '#0a0f1d', padding: '16px', borderRadius: '10px', border: '1px solid #1e293b' }}>
              <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                RLS Permitted Leads
              </div>
              <div style={{ color: '#38bdf8', fontSize: '1.4rem', fontWeight: 700, marginTop: '4px' }}>
                {loadingQuery ? 'Checking...' : `${accessibleLeadsCount ?? 0} Inquiries`}
              </div>
            </div>
          </div>

          {/* Security & RLS Explanation Note */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: '10px',
            padding: '16px 20px',
            border: '1px solid #334155',
            fontSize: '0.9rem',
            color: '#cbd5e1',
            lineHeight: 1.5,
          }}>
            <strong style={{ color: '#38bdf8' }}>RLS Security Guard Active: </strong>
            Your session token is verified on every query. If your role is <strong>counsellor</strong>, you see inquiries you created or are assigned to. If you are elevated to <strong>manager</strong> or <strong>admin</strong> via database procedures, team-wide inquiries unlock automatically.
          </div>
        </div>

        {/* Next Phase Callout */}
        <div style={{
          background: 'rgba(37, 99, 235, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '12px',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ color: '#bfdbfe', fontWeight: 600, fontSize: '1rem' }}>
              Ready for Phase 4: Modern SaaS Design System & Application Shell
            </div>
            <div style={{ color: '#93c5fd', fontSize: '0.875rem', marginTop: '4px' }}>
              We will build the responsive desktop sidebar, mobile navigation drawer, and modular page layouts.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export function App() {
  if (!isSupabaseConfigured()) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0f1d', padding: '40px 20px' }}>
        <ConfigMissingBanner />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AuthenticatedHome />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
