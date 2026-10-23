import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { RoleBadge } from '../features/auth/RoleBadge';
import { useAuth } from '../features/auth/useAuth';
import { CreateLeadModal } from '../features/leads/CreateLeadModal';
import { ScheduleFollowupModal } from '../features/followups/ScheduleFollowupModal';
import { metricService, type DashboardMetrics, ALL_STATUSES, ALL_SOURCES } from '../services/metricService';
import { followupService } from '../services/followupService';
import { getEventRelativeTime, isFollowupOverdue, getRelativeTimeDescription } from '../utils/dateUtils';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  UserPlus,
  Clock,
  ArrowRight,
  RotateCw,
  CheckCircle2,
  PieChart,
  Layers,
  Sparkles,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, role } = useAuth();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modals
  const [createLeadOpen, setCreateLeadOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    metricService.getDashboardMetrics().then((res) => {
      if (!ignore) {
        if (res.data) {
          setMetrics(res.data);
        }
        setLoading(false);
        setRefreshing(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, [refreshTrigger]);

  const handleRefresh = () => {
    setRefreshing(true);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCompleteFollowup = async (id: string) => {
    setCompletingId(id);
    try {
      const res = await followupService.completeFollowup(id);
      if (res.success) {
        setRefreshTrigger((prev) => prev + 1);
      }
    } finally {
      setCompletingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'var(--status-new)';
      case 'Contacted':
        return 'var(--status-contacted)';
      case 'Qualified':
        return 'var(--status-qualified)';
      case 'Converted':
        return 'var(--status-converted)';
      case 'Lost':
        return 'var(--status-lost)';
      default:
        return 'var(--text-muted)';
    }
  };

  const getSourceColor = (index: number) => {
    const colors = ['#38bdf8', '#818cf8', '#34d399', '#f59e0b', '#ec4899', '#a855f7'];
    return colors[index % colors.length];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.35) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Welcome back, {profile?.full_name || 'Team Member'}! 👋
            </h1>
            {role && <RoleBadge role={role} />}
          </div>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            BrightPath CRM admissions pipeline overview • Role scope:{' '}
            <strong style={{ color: 'var(--text-main)' }}>{role === 'counsellor' ? 'My Assigned Inquiries' : 'Team-Wide Operations'}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            loading={refreshing}
            icon={<RotateCw size={14} />}
          >
            Refresh
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setScheduleModalOpen(true)}
            icon={<Clock size={15} />}
          >
            Schedule Callback
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setCreateLeadOpen(true)}
            icon={<UserPlus size={15} />}
          >
            New Lead
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <Skeleton height="110px" />
          <Skeleton height="110px" />
          <Skeleton height="110px" />
          <Skeleton height="110px" />
          <Skeleton height="110px" />
        </div>
      ) : metrics ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Card 1: Total Leads */}
          <Card hoverable onClick={() => navigate('/leads')} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ color: 'var(--text-subtle)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total Inquiries
                </div>
                <div style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
                  {metrics.totalLeads}
                </div>
              </div>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary-light)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Users size={18} />
              </div>
            </div>
            <div style={{ marginTop: '10px', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>Accessible student records</span>
              <ArrowRight size={12} style={{ opacity: 0.6 }} />
            </div>
          </Card>

          {/* Card 2: New Inquiries */}
          <Card hoverable onClick={() => navigate('/leads?status=New')} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ color: 'var(--text-subtle)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  New Leads
                </div>
                <div style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--status-new)', marginTop: '4px' }}>
                  {metrics.newLeads}
                </div>
              </div>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--status-new-bg)',
                  color: 'var(--status-new)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={18} />
              </div>
            </div>
            <div style={{ marginTop: '10px', fontSize: '0.78rem', color: 'var(--status-new)' }}>
              Requires first outreach
            </div>
          </Card>

          {/* Card 3: Active Pipeline */}
          <Card hoverable onClick={() => navigate('/leads')} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ color: 'var(--text-subtle)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Active Pipeline
                </div>
                <div style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--status-contacted)', marginTop: '4px' }}>
                  {metrics.activePipelineLeads}
                </div>
              </div>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--status-contacted-bg)',
                  color: 'var(--status-contacted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Layers size={18} />
              </div>
            </div>
            <div style={{ marginTop: '10px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {metrics.contactedLeads} Contacted • {metrics.qualifiedLeads} Qualified
            </div>
          </Card>

          {/* Card 4: Conversion Rate % */}
          <Card hoverable onClick={() => navigate('/leads?status=Converted')} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ color: 'var(--text-subtle)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Conversion Rate
                </div>
                <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#34d399', marginTop: '4px' }}>
                  {metrics.conversionRate}%
                </div>
              </div>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TrendingUp size={18} />
              </div>
            </div>
            <div style={{ marginTop: '10px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {metrics.convertedLeads} of {metrics.totalLeads} converted
            </div>
          </Card>

          {/* Card 5: Overdue Follow-ups */}
          <Card
            hoverable
            onClick={() => navigate('/followups')}
            style={{
              cursor: 'pointer',
              borderLeft: metrics.overdueFollowups > 0 ? '4px solid #ef4444' : undefined,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ color: 'var(--text-subtle)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Overdue Follow-ups
                </div>
                <div style={{ fontSize: '1.9rem', fontWeight: 700, color: metrics.overdueFollowups > 0 ? '#f87171' : 'var(--text-main)', marginTop: '4px' }}>
                  {metrics.overdueFollowups}
                </div>
              </div>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  background: metrics.overdueFollowups > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(148, 163, 184, 0.1)',
                  color: metrics.overdueFollowups > 0 ? '#ef4444' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertTriangle size={18} />
              </div>
            </div>
            <div style={{ marginTop: '10px', fontSize: '0.78rem', color: metrics.overdueFollowups > 0 ? '#fca5a5' : 'var(--text-muted)' }}>
              {metrics.overdueFollowups > 0 ? '⚠️ Immediate callback needed' : 'All follow-ups on schedule'}
            </div>
          </Card>
        </div>
      ) : null}

      {/* Analytics Breakdown Row: Status Funnel & Acquisition Channels */}
      {metrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Status Funnel Card */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="var(--accent)" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Pipeline by Status
                </h3>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                {metrics.totalLeads} total
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {ALL_STATUSES.map((st) => {
                const count = metrics.statusCounts[st];
                const pct = metrics.totalLeads > 0 ? Math.round((count / metrics.totalLeads) * 100) : 0;
                const color = getStatusColor(st);

                return (
                  <div key={st}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{st}</span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        <strong>{count}</strong> ({pct}%)
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div
                      style={{
                        height: '6px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--bg-canvas)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          backgroundColor: color,
                          borderRadius: 'var(--radius-full)',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Lead Source Distribution Card */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PieChart size={18} color="var(--accent)" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Acquisition Channels
                </h3>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                Source breakdown
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {ALL_SOURCES.map((src, idx) => {
                const count = metrics.sourceCounts[src];
                const pct = metrics.totalLeads > 0 ? Math.round((count / metrics.totalLeads) * 100) : 0;
                const color = getSourceColor(idx);

                return (
                  <div key={src}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{src}</span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        <strong>{count}</strong> ({pct}%)
                      </span>
                    </div>
                    <div
                      style={{
                        height: '6px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--bg-canvas)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          backgroundColor: color,
                          borderRadius: 'var(--radius-full)',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Actionable Widgets Grid: Urgent Follow-ups & Recent Leads */}
      {metrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Urgent Overdue Follow-ups Widget */}
          <Card>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color={metrics.overdueFollowups > 0 ? '#ef4444' : 'var(--accent)'} />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Urgent Overdue Follow-ups
                </h3>
              </div>
              <Link
                to="/followups"
                style={{
                  color: 'var(--accent)',
                  fontSize: '0.8rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                View all ({metrics.overdueFollowups})
                <ArrowRight size={12} />
              </Link>
            </div>

            {metrics.urgentFollowups.length === 0 ? (
              <div
                style={{
                  padding: '36px 16px',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-canvas)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px dashed var(--border-default)',
                }}
              >
                <CheckCircle2 size={32} color="#34d399" style={{ marginBottom: '8px' }} />
                <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  No Overdue Follow-ups!
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  All scheduled student callbacks and consultations are up to date.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {metrics.urgentFollowups.map((fu) => {
                  const overdue = isFollowupOverdue(fu.due_at, fu.status);
                  const relText = getRelativeTimeDescription(fu.due_at, fu.status);

                  return (
                    <div
                      key={fu.id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-canvas)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderLeft: '4px solid #ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: '180px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <Link
                            to={`/leads/${fu.lead_id}`}
                            style={{
                              color: 'var(--text-main)',
                              fontWeight: 600,
                              fontSize: '0.9rem',
                              textDecoration: 'none',
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                            onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
                          >
                            {fu.lead?.full_name || 'Student Lead'}
                          </Link>

                          {overdue && (
                            <span
                              style={{
                                fontSize: '0.7rem',
                                color: '#f87171',
                                fontWeight: 700,
                                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                padding: '1px 6px',
                                borderRadius: 'var(--radius-full)',
                              }}
                            >
                              {relText}
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                          {fu.lead?.course_interest} • <a href={`tel:${fu.lead?.phone}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{fu.lead?.phone}</a>
                        </div>

                        <div style={{ fontSize: '0.825rem', color: 'var(--text-main)' }}>
                          {fu.note}
                        </div>
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        loading={completingId === fu.id}
                        onClick={() => handleCompleteFollowup(fu.id)}
                        icon={<CheckCircle2 size={13} />}
                        style={{
                          backgroundColor: '#059669',
                          borderColor: '#10b981',
                        }}
                      >
                        Complete
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Recent Student Inquiries Widget */}
          <Card>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="var(--accent)" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Recent Inquiries
                </h3>
              </div>
              <Link
                to="/leads"
                style={{
                  color: 'var(--accent)',
                  fontSize: '0.8rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                View all ({metrics.totalLeads})
                <ArrowRight size={12} />
              </Link>
            </div>

            {metrics.recentLeads.length === 0 ? (
              <div
                style={{
                  padding: '36px 16px',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-canvas)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px dashed var(--border-default)',
                  color: 'var(--text-muted)',
                }}
              >
                <Users size={32} style={{ opacity: 0.5, marginBottom: '8px' }} />
                <p style={{ margin: 0, fontSize: '0.875rem' }}>No student inquiries recorded yet.</p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setCreateLeadOpen(true)}
                  style={{ marginTop: '12px' }}
                >
                  Create First Lead
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {metrics.recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-canvas)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <Link
                          to={`/leads/${lead.id}`}
                          style={{
                            color: 'var(--text-main)',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            textDecoration: 'none',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                          onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
                        >
                          {lead.full_name}
                        </Link>
                        <Badge status={lead.status} size="sm" />
                      </div>

                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: 'var(--text-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        <span>{lead.course_interest}</span>
                        <span>•</span>
                        <span>{lead.source}</span>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>
                      {getEventRelativeTime(lead.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Modals */}
      <CreateLeadModal
        isOpen={createLeadOpen}
        onClose={() => setCreateLeadOpen(false)}
        onSuccess={() => {
          setRefreshTrigger((prev) => prev + 1);
        }}
      />

      <ScheduleFollowupModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onSuccess={() => {
          setRefreshTrigger((prev) => prev + 1);
        }}
      />
    </div>
  );
};
