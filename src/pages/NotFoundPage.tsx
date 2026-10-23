// ==============================================================================
// BrightPath CRM — 404 Not Found Page
// Clean recovery UI with accessible touch targets and navigation actions
// ==============================================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Home, Users } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main
      role="main"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-canvas, #0a0f1d)',
        color: 'var(--text-main, #f8fafc)',
        padding: '24px',
        textAlign: 'center',
        fontFamily: 'inherit',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          backgroundColor: 'var(--bg-surface, #0f172a)',
          border: '1px solid var(--border-default, #2d3b55)',
          borderRadius: 'var(--radius-lg, 14px)',
          padding: '48px 32px',
          boxShadow: 'var(--shadow-xl, 0 20px 25px -5px rgba(0,0,0,0.5))',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            fontSize: '4rem',
            fontWeight: 800,
            lineHeight: 1,
            background: 'linear-gradient(135deg, var(--primary, #2563eb), var(--accent, #38bdf8))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '16px',
            userSelect: 'none',
          }}
        >
          404
        </div>

        <h1
          style={{
            margin: '0 0 12px',
            fontSize: '1.45rem',
            fontWeight: 700,
            color: 'var(--text-main, #f8fafc)',
            letterSpacing: '-0.02em',
          }}
        >
          Page Not Found
        </h1>

        <p
          style={{
            margin: '0 0 28px',
            fontSize: '0.92rem',
            color: 'var(--text-muted, #94a3b8)',
            lineHeight: 1.55,
          }}
        >
          The requested route does not exist or has been relocated. Return to your pipeline
          dashboard or view active student leads.
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant="primary"
            onClick={() => navigate('/')}
            icon={<Home size={16} aria-hidden="true" />}
            style={{ minHeight: '44px', minWidth: '150px' }}
            aria-label="Return to Dashboard"
          >
            Dashboard
          </Button>

          <Button
            variant="secondary"
            onClick={() => navigate('/leads')}
            icon={<Users size={16} aria-hidden="true" />}
            style={{ minHeight: '44px', minWidth: '150px' }}
            aria-label="View Student Leads"
          >
            View Leads
          </Button>
        </div>
      </div>
    </main>
  );
};
