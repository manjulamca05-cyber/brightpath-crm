// ==============================================================================
// BrightPath CRM — Global Error Boundary
// Catches unhandled React runtime rendering errors with clean recovery UI
// ==============================================================================

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[BrightPath CRM Unhandled Exception]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public handleReload = (): void => {
    window.location.reload();
  };

  public handleGoHome = (): void => {
    window.location.href = '/';
  };

  public toggleDetails = (): void => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorMessage = this.state.error?.message || 'Unknown runtime error occurred';
      const stack = this.state.error?.stack || this.state.errorInfo?.componentStack;

      return (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-canvas, #0a0f1d)',
            color: 'var(--text-main, #f8fafc)',
            padding: '24px',
            fontFamily: 'var(--font-sans, system-ui, sans-serif)',
          }}
        >
          <div
            style={{
              maxWidth: '540px',
              width: '100%',
              backgroundColor: 'var(--bg-surface, #0f172a)',
              border: '1px solid var(--border-default, #2d3b55)',
              borderRadius: 'var(--radius-lg, 14px)',
              padding: '36px 30px',
              boxShadow: 'var(--shadow-xl, 0 20px 25px -5px rgba(0,0,0,0.5))',
              textAlign: 'center',
            }}
          >
            {/* Warning Shield Icon */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <AlertTriangle size={32} aria-hidden="true" />
            </div>

            <h1
              style={{
                margin: '0 0 10px',
                fontSize: '1.45rem',
                fontWeight: 700,
                color: 'var(--text-main, #f8fafc)',
                letterSpacing: '-0.02em',
              }}
            >
              Application Encountered an Error
            </h1>

            <p
              style={{
                margin: '0 0 24px',
                fontSize: '0.92rem',
                color: 'var(--text-muted, #94a3b8)',
                lineHeight: 1.55,
              }}
            >
              An unexpected issue occurred while rendering this view. Your saved records in Supabase
              remain intact. You can try recovering or reloading the page.
            </p>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '24px',
              }}
            >
              <button
                type="button"
                onClick={this.handleReset}
                aria-label="Try recovering view"
                style={{
                  minHeight: '44px',
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-md, 10px)',
                  backgroundColor: 'var(--primary, #2563eb)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'opacity 0.15s ease',
                }}
              >
                <RefreshCw size={16} aria-hidden="true" />
                <span>Try Again</span>
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                aria-label="Reload entire application"
                style={{
                  minHeight: '44px',
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-md, 10px)',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: 'var(--text-main, #f8fafc)',
                  border: '1px solid var(--border-default, #2d3b55)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={16} aria-hidden="true" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                aria-label="Navigate back to Dashboard"
                style={{
                  minHeight: '44px',
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-md, 10px)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-muted, #94a3b8)',
                  border: '1px solid transparent',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                }}
              >
                <Home size={16} aria-hidden="true" />
                <span>Dashboard</span>
              </button>
            </div>

            {/* Expandable Technical Details */}
            <div
              style={{
                borderTop: '1px solid var(--border-subtle, #1e293b)',
                paddingTop: '16px',
                textAlign: 'left',
              }}
            >
              <button
                type="button"
                onClick={this.toggleDetails}
                aria-expanded={this.state.showDetails}
                aria-controls="error-details-panel"
                style={{
                  minHeight: '44px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-subtle, #64748b)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  fontSize: '0.82rem',
                  padding: '6px 0',
                }}
              >
                <span>Technical Diagnostic Details</span>
                {this.state.showDetails ? (
                  <ChevronUp size={16} aria-hidden="true" />
                ) : (
                  <ChevronDown size={16} aria-hidden="true" />
                )}
              </button>

              {this.state.showDetails && (
                <div
                  id="error-details-panel"
                  style={{
                    marginTop: '10px',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm, 6px)',
                    backgroundColor: 'var(--bg-input, #080d19)',
                    border: '1px solid var(--border-subtle, #1e293b)',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.75rem',
                    color: '#f87171',
                    maxHeight: '160px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '6px' }}>{errorMessage}</div>
                  {stack && (
                    <div style={{ color: 'var(--text-subtle, #64748b)', fontSize: '0.7rem' }}>
                      {stack}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
