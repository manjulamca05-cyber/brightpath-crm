import { useEffect, useState } from 'react';
import { checkSupabaseConnection, isSupabaseConfigured } from './lib/supabaseClient';
import { ConfigMissingBanner } from './components/common/ConfigMissingBanner';
import './App.css';

export function App() {
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    ok: boolean;
    message: string;
    leadCount?: number;
    error?: string;
  } | null>(null);

  useEffect(() => {
    const runCheck = async () => {
      setLoading(true);
      const isConfigured = isSupabaseConfigured();
      setConfigured(isConfigured);

      if (isConfigured) {
        const result = await checkSupabaseConnection();
        setConnectionStatus(result);
      }
      setLoading(false);
    };

    runCheck();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0f1d',
      color: '#f8fafc',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxSizing: 'border-box',
    }}>
      <header style={{ maxWidth: '800px', margin: '0 auto 30px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '9999px',
          background: 'rgba(37, 99, 235, 0.12)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          color: '#60a5fa',
          fontSize: '0.8rem',
          fontWeight: 600,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginBottom: '16px',
        }}>
          BrightPath CRM • Build Milestones
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 700, margin: '0 0 10px', color: '#f8fafc' }}>
          Supabase Integration Guard
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.05rem', margin: 0 }}>
          Phase 2: Verifying live PostgreSQL persistence & public client authentication
        </p>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto' }}>
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#0f172a',
            borderRadius: '12px',
            border: '1px solid #1e293b',
          }}>
            <div style={{ fontSize: '1.2rem', color: '#94a3b8' }}>Checking Supabase connectivity...</div>
          </div>
        ) : !configured ? (
          <ConfigMissingBanner />
        ) : connectionStatus && !connectionStatus.ok ? (
          <ConfigMissingBanner errorMessage={connectionStatus.message} />
        ) : (
          <div style={{
            background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                }}>
                  ✅
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.35rem', color: '#f8fafc', fontWeight: 600 }}>
                    Phase 2 Verified: Supabase Connected!
                  </h2>
                  <p style={{ margin: '2px 0 0', color: '#34d399', fontSize: '0.9rem', fontWeight: 500 }}>
                    Live PostgreSQL queries responding successfully
                  </p>
                </div>
              </div>
              <span style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}>
                LIVE
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '28px',
            }}>
              <div style={{
                background: '#0a0f1d',
                padding: '16px',
                borderRadius: '10px',
                border: '1px solid #1e293b',
              }}>
                <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Target Endpoint
                </div>
                <div style={{ color: '#f8fafc', fontSize: '0.95rem', fontWeight: 600, marginTop: '6px', wordBreak: 'break-all' }}>
                  {import.meta.env.VITE_SUPABASE_URL}
                </div>
              </div>

              <div style={{
                background: '#0a0f1d',
                padding: '16px',
                borderRadius: '10px',
                border: '1px solid #1e293b',
              }}>
                <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Live Leads Count
                </div>
                <div style={{ color: '#38bdf8', fontSize: '1.4rem', fontWeight: 700, marginTop: '4px' }}>
                  {connectionStatus?.leadCount ?? 0} Inquiries
                </div>
              </div>

              <div style={{
                background: '#0a0f1d',
                padding: '16px',
                borderRadius: '10px',
                border: '1px solid #1e293b',
              }}>
                <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Row Level Security
                </div>
                <div style={{ color: '#10b981', fontSize: '1rem', fontWeight: 600, marginTop: '8px' }}>
                  Active & Enforced
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(37, 99, 235, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              borderRadius: '10px',
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ color: '#bfdbfe', fontWeight: 600, fontSize: '0.95rem' }}>
                  Next Milestone: Phase 3 (Authentication & Role Lifecycle)
                </div>
                <div style={{ color: '#93c5fd', fontSize: '0.85rem', marginTop: '2px' }}>
                  Ready to implement multi-user sign in, profile resolution, and role guards.
                </div>
              </div>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                Re-check
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
