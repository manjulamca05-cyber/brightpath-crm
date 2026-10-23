// ==============================================================================
// BrightPath CRM — Network Connectivity & Offline Detection Banner
// Accessible offline alert with automatic reconnection detection
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

export const NetworkStatusBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showRestoredNotice, setShowRestoredNotice] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestoredNotice(true);
      const timer = setTimeout(() => {
        setShowRestoredNotice(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestoredNotice(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
    }
  };

  if (isOnline && !showRestoredNotice) {
    return null;
  }

  if (!isOnline) {
    return (
      <aside
        role="alert"
        aria-live="assertive"
        style={{
          backgroundColor: '#991b1b',
          color: '#fee2e2',
          padding: '10px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          fontSize: '0.86rem',
          fontWeight: 500,
          borderBottom: '1px solid rgba(239, 68, 68, 0.4)',
          zIndex: 100,
          position: 'sticky',
          top: 0,
          boxShadow: 'var(--shadow-md, 0 4px 6px -1px rgba(0,0,0,0.3))',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <WifiOff size={18} aria-hidden="true" style={{ color: '#fca5a5', flexShrink: 0 }} />
          <span>You are currently offline. Check your network connection.</span>
        </div>
        <button
          type="button"
          onClick={handleRetry}
          aria-label="Check internet connection"
          style={{
            minHeight: '36px',
            padding: '4px 12px',
            borderRadius: 'var(--radius-sm, 6px)',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <RefreshCw size={14} aria-hidden="true" />
          <span>Retry</span>
        </button>
      </aside>
    );
  }

  // Connection Restored temporary toast banner
  return (
    <aside
      role="status"
      aria-live="polite"
      style={{
        backgroundColor: '#065f46',
        color: '#d1fae5',
        padding: '8px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontSize: '0.84rem',
        fontWeight: 500,
        zIndex: 100,
        position: 'sticky',
        top: 0,
        animation: 'fadeIn 0.25s ease forwards',
      }}
    >
      <Wifi size={16} aria-hidden="true" style={{ color: '#6ee7b7' }} />
      <span>Internet connection restored. Back online!</span>
    </aside>
  );
};
