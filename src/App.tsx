import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { LoginPage } from './features/auth/LoginPage';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { LeadsPage } from './pages/LeadsPage';
import { LeadDetailPage } from './features/leads/LeadDetailPage';
import { FollowupsPage } from './pages/FollowupsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { isSupabaseConfigured } from './lib/supabaseClient';
import { ConfigMissingBanner } from './components/common/ConfigMissingBanner';
import './App.css';

export const App: React.FC = () => {
  if (!isSupabaseConfigured()) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-canvas)', padding: '40px 20px' }}>
        <ConfigMissingBanner />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Application Routes wrapped in AppLayout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="leads/:id" element={<LeadDetailPage />} />
            <Route path="followups" element={<FollowupsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all 404 Route */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
