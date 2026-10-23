import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { NetworkStatusBanner } from '../common/NetworkStatusBanner';

export const AppLayout: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/leads':
        return { title: 'Lead Management', subtitle: 'Student pipeline, enquiry status & tracking' };
      case '/followups':
        return { title: 'Follow-ups Engine', subtitle: 'Scheduled reminders & overdue task management' };
      case '/reports':
        return { title: 'Reports & Analytics', subtitle: 'Conversion metrics & source channel breakdown' };
      case '/settings':
        return { title: 'Settings & Profile', subtitle: 'User preferences & role authorizations' };
      case '/':
      default:
        return { title: 'Pipeline Dashboard', subtitle: 'Real-time enquiry metrics & key performance indicators' };
    }
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-canvas)' }}>
      {/* Desktop Persistent Sidebar */}
      <div className="desktop-sidebar-container">
        <Sidebar />
      </div>

      {/* Mobile Slide-over Drawer */}
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Right Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <NetworkStatusBanner />
        <Header
          onMenuClick={() => setMobileNavOpen(true)}
          title={title}
          subtitle={subtitle}
        />

        <main style={{
          flex: 1,
          padding: '28px',
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        .desktop-sidebar-container {
          display: block;
        }
        @media (max-width: 1024px) {
          .desktop-sidebar-container {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
