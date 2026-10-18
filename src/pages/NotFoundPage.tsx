import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-canvas)',
      color: 'var(--text-main)',
      padding: '24px',
      textAlign: 'center',
      fontFamily: 'inherit',
    }}>
      <div style={{
        maxWidth: '440px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '40px 32px',
        boxShadow: 'var(--shadow-xl)',
      }}>
        <div style={{
          fontSize: '3.5rem',
          fontWeight: 800,
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '12px',
        }}>
          404
        </div>
        <h2 style={{ margin: '0 0 10px', fontSize: '1.35rem', fontWeight: 600 }}>
          Page Not Found
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          The requested route does not exist or has been moved. Use the navigation sidebar or return to the main dashboard.
        </p>
        <Button variant="primary" onClick={() => navigate('/')} icon={<Home size={16} />}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};
