import React from 'react';

interface ConfigMissingBannerProps {
  errorMessage?: string;
}

export const ConfigMissingBanner: React.FC<ConfigMissingBannerProps> = ({ errorMessage }) => {
  return (
    <div style={{
      maxWidth: '680px',
      margin: '40px auto',
      padding: '24px 28px',
      borderRadius: '12px',
      background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
      border: '1px solid #334155',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
      color: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      lineHeight: '1.6',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
        }}>
          ⚠️
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#fef3c7' }}>
            Supabase Connection Required
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.875rem', color: '#94a3b8' }}>
            Phase 2: Environment Configuration
          </p>
        </div>
      </div>

      <p style={{ margin: '0 0 16px', fontSize: '0.95rem', color: '#cbd5e1' }}>
        {errorMessage || 'The application detected that Supabase API keys are missing or using placeholder values. Real persistence is required to run BrightPath CRM.'}
      </p>

      <div style={{
        backgroundColor: '#090d16',
        borderRadius: '8px',
        padding: '16px',
        border: '1px solid #1e293b',
        marginBottom: '20px',
      }}>
        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '8px', fontWeight: 600 }}>
          Quick Setup Steps:
        </div>
        <ol style={{ margin: 0, paddingLeft: '20px', color: '#e2e8f0', fontSize: '0.9rem' }}>
          <li style={{ marginBottom: '6px' }}>
            Create a local <code>.env</code> file in your project root (copied from <code>.env.example</code>).
          </li>
          <li style={{ marginBottom: '6px' }}>
            Open your <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none' }}>Supabase Dashboard</a> &rarr; <strong>Project Settings &rarr; API</strong>.
          </li>
          <li style={{ marginBottom: '6px' }}>
            Copy the <strong>Project URL</strong> and <strong>anon / public key</strong> into your <code>.env</code>:
          </li>
        </ol>
        <pre style={{
          margin: '12px 0 0',
          padding: '12px',
          background: '#020617',
          borderRadius: '6px',
          border: '1px solid #1e293b',
          color: '#38bdf8',
          fontSize: '0.85rem',
          overflowX: 'auto',
          fontFamily: 'Consolas, Monaco, monospace',
        }}>
{`VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key`}
        </pre>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '12px',
        borderTop: '1px solid #1e293b',
        fontSize: '0.85rem',
        color: '#64748b',
      }}>
        <span>Restart Vite after updating <code>.env</code></span>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = '#1d4ed8')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#2563eb')}
        >
          Check Connection Again
        </button>
      </div>
    </div>
  );
};
