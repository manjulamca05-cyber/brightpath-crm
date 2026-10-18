import React from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Users, CalendarCheck, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, role } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(56, 189, 248, 0.08) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Welcome back, {profile?.full_name || 'Counsellor'}! 👋
          </h2>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            BrightPath Academy enquiry pipeline is operating normally. Role: <strong>{role}</strong>.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="primary" onClick={() => navigate('/leads')} icon={<Users size={16} />}>
            View Leads
          </Button>
          <Button variant="secondary" onClick={() => navigate('/followups')} icon={<CalendarCheck size={16} />}>
            Follow-ups
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '18px',
      }}>
        <Card hoverable>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: 'var(--text-subtle)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Leads
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '6px' }}>
                --
              </div>
            </div>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary-light)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Users size={20} />
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <Badge status="New" size="sm">Phase 5 Lead Engine</Badge>
          </div>
        </Card>

        <Card hoverable>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: 'var(--text-subtle)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                New Inquiries
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--status-new)', marginTop: '6px' }}>
                --
              </div>
            </div>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--status-new-bg)',
              color: 'var(--status-new)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Requires immediate contact
          </div>
        </Card>

        <Card hoverable>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: 'var(--text-subtle)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Converted (Enrolled)
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--status-converted)', marginTop: '6px' }}>
                --
              </div>
            </div>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--status-converted-bg)',
              color: 'var(--status-converted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Badge status="Converted" size="sm">Admitted</Badge>
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Target: 25% conversion
          </div>
        </Card>

        <Card hoverable>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: 'var(--text-subtle)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Overdue Follow-ups
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--status-lost)', marginTop: '6px' }}>
                --
              </div>
            </div>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--status-lost-bg)',
              color: 'var(--status-lost)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <AlertCircle size={20} />
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#f87171' }}>
            Past scheduled time
          </div>
        </Card>
      </div>

      {/* Phase 4 Milestone Callout Card */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}>
                PHASE 4 COMPLETE
              </span>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 600 }}>
                Design System & Application Shell Active
              </h3>
            </div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '640px', lineHeight: 1.5 }}>
              Responsive desktop sidebar, animated mobile slide-over drawer, accessible UI primitives library, and theme design tokens are now fully integrated.
            </p>
          </div>
          <Button variant="primary" onClick={() => navigate('/leads')} icon={<ArrowRight size={16} />}>
            Proceed to Leads
          </Button>
        </div>
      </Card>
    </div>
  );
};
