import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

export const LoginPage: React.FC = () => {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showBootstrapHelp, setShowBootstrapHelp] = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validation
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (isRegistering && !fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);

    if (isRegistering) {
      const res = await signUp(email, password, fullName);
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Failed to create account.');
      } else {
        setSuccessMessage('Account registered successfully! If email confirmation is required, please check your inbox.');
        setIsRegistering(false);
      }
    } else {
      const res = await signIn(email, password);
      setLoading(false);
      if (!res.success) {
        if (res.error?.toLowerCase().includes('email not confirmed')) {
          setError(
            'Email not confirmed yet by Supabase. Please check your inbox for the confirmation link, OR in Supabase Dashboard → Authentication → Users, click the "..." menu next to your email and select "Confirm user".'
          );
        } else {
          setError(res.error || 'Invalid credentials or connection issue.');
        }
      } else {
        navigate(from, { replace: true });
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, #1e293b 0%, #0a0f1d 70%)',
      padding: '24px 16px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxSizing: 'border-box',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '16px',
        padding: '36px 32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
        color: '#f8fafc',
      }}>
        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
            marginBottom: '14px',
            fontSize: '22px',
            boxShadow: '0 8px 16px rgba(37, 99, 235, 0.3)',
          }}>
            🎯
          </div>
          <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 700, color: '#f8fafc' }}>
            BrightPath CRM
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: '#94a3b8' }}>
            Student Enquiry & Pipeline Management
          </p>
        </div>

        {/* Tab Toggle */}
        <div style={{
          display: 'flex',
          background: '#090d16',
          padding: '4px',
          borderRadius: '8px',
          border: '1px solid #1e293b',
          marginBottom: '24px',
        }}>
          <button
            type="button"
            onClick={() => { setIsRegistering(false); setError(null); }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              background: !isRegistering ? '#1e293b' : 'transparent',
              color: !isRegistering ? '#f8fafc' : '#64748b',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegistering(true); setError(null); }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              background: isRegistering ? '#1e293b' : 'transparent',
              color: isRegistering ? '#f8fafc' : '#64748b',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Create Account
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '12px 14px',
            color: '#fca5a5',
            fontSize: '0.875rem',
            marginBottom: '20px',
            lineHeight: 1.4,
          }}>
            {error}
          </div>
        )}

        {successMessage && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            padding: '12px 14px',
            color: '#6ee7b7',
            fontSize: '0.875rem',
            marginBottom: '20px',
            lineHeight: 1.4,
          }}>
            {successMessage}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Ramesh Kumar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: '#090d16',
                  border: '1px solid #334155',
                  color: '#f8fafc',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="counsellor@brightpath.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                background: '#090d16',
                border: '1px solid #334155',
                color: '#f8fafc',
                fontSize: '0.95rem',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                background: '#090d16',
                border: '1px solid #334155',
                color: '#f8fafc',
                fontSize: '0.95rem',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              background: loading ? '#334155' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
            }}
          >
            {loading ? 'Please wait...' : isRegistering ? 'Create Counsellor Account' : 'Sign In to BrightPath CRM'}
          </button>
        </form>

        {/* Workshop Helper & Admin Bootstrap Information */}
        <div style={{ marginTop: '24px', borderTop: '1px solid #1e293b', paddingTop: '16px' }}>
          <button
            type="button"
            onClick={() => setShowBootstrapHelp(!showBootstrapHelp)}
            style={{
              background: 'none',
              border: 'none',
              color: '#38bdf8',
              fontSize: '0.825rem',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>{showBootstrapHelp ? '▼ Hide' : '▶ How do roles & admin bootstrap work?'}</span>
          </button>

          {showBootstrapHelp && (
            <div style={{
              marginTop: '12px',
              background: '#090d16',
              padding: '12px 14px',
              borderRadius: '8px',
              border: '1px solid #1e293b',
              fontSize: '0.8rem',
              color: '#94a3b8',
              lineHeight: 1.5,
            }}>
              <p style={{ margin: '0 0 8px' }}>
                1. <strong>Default Role</strong>: All new accounts created here automatically receive the least-privileged role: <code>counsellor</code>.
              </p>
              <p style={{ margin: '0 0 8px' }}>
                2. <strong>Admin Bootstrap</strong>: Per the master security specification, users cannot self-promote. To grant a user <code>admin</code> or <code>manager</code> privileges, run this query in your Supabase SQL Editor:
              </p>
              <pre style={{
                background: '#020617',
                padding: '8px',
                borderRadius: '6px',
                color: '#38bdf8',
                overflowX: 'auto',
                fontSize: '0.75rem',
                margin: 0,
              }}>
{`UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');`}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
