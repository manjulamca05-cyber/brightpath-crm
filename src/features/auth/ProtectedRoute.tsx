import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import type { UserRole } from '../../types/database';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0f1d',
        color: '#94a3b8',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: '3px solid #1e293b',
          borderTopColor: '#38bdf8',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '16px',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: '0.95rem' }}>Authenticating BrightPath session...</span>
      </div>
    );
  }

  // Not logged in -> redirect to /login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role restriction check
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0f1d',
        color: '#f8fafc',
        padding: '20px',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <div style={{
          maxWidth: '480px',
          background: '#0f172a',
          border: '1px solid #dc2626',
          borderRadius: '12px',
          padding: '32px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚫</div>
          <h2 style={{ margin: '0 0 10px', fontSize: '1.4rem', color: '#f87171' }}>Access Restricted</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0 0 20px', lineHeight: 1.5 }}>
            Your account role (<strong>{role}</strong>) does not have authorization to view this resource. 
            Contact an administrator if you require elevated privileges.
          </p>
          <a
            href="/"
            style={{
              display: 'inline-block',
              background: '#2563eb',
              color: '#fff',
              textDecoration: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
