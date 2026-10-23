import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { RoleBadge } from '../features/auth/RoleBadge';
import { reportService, type ReportsSummary } from '../services/reportService';
import { downloadCSV } from '../utils/csvExport';
import {
  BarChart3,
  Download,
  Users,
  TrendingUp,
  RotateCw,
  Layers,
  FileSpreadsheet,
  Check,
} from 'lucide-react';

type ReportTab = 'source' | 'counselor' | 'export';

export const ReportsPage: React.FC = () => {
  const [summary, setSummary] = useState<ReportsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<ReportTab>('source');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Export Feedback states
  const [exportingLeads, setExportingLeads] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    reportService.getReportsSummary().then((res) => {
      if (!ignore) {
        if (res.data) {
          setSummary(res.data);
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

  const getTodayDateString = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  };

  const handleExportAllLeads = async () => {
    setExportingLeads(true);
    setExportFeedback(null);
    try {
      const { headers, rows, count } = await reportService.getLeadsExportData();
      const filename = `brightpath_leads_export_${getTodayDateString()}.csv`;
      const success = downloadCSV(filename, headers, rows);

      if (success) {
        setExportFeedback(`Successfully downloaded ${count} leads!`);
        setTimeout(() => setExportFeedback(null), 4000);
      } else {
        setExportFeedback('Export failed. Please check browser permissions.');
      }
    } finally {
      setExportingLeads(false);
    }
  };

  const handleExportSourceReport = () => {
    if (!summary) return;
    const { headers, rows } = reportService.generateSourceCSV(summary.sourceReport);
    const filename = `brightpath_source_funnel_${getTodayDateString()}.csv`;
    downloadCSV(filename, headers, rows);
  };

  const handleExportCounselorReport = () => {
    if (!summary) return;
    const { headers, rows } = reportService.generateCounselorCSV(summary.counselorReport);
    const filename = `brightpath_counselor_workload_${getTodayDateString()}.csv`;
    downloadCSV(filename, headers, rows);
  };

  // Find top converting source
  const topSource = summary?.sourceReport?.find((s) => s.totalLeads > 0 && s.conversionRate > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '1.55rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Managerial Reports & Analytics
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Conversion rates by acquisition source, counselor productivity metrics, and CSV exports
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
            variant="primary"
            onClick={handleExportAllLeads}
            loading={exportingLeads}
            icon={<Download size={16} />}
          >
            Export Leads (CSV)
          </Button>
        </div>
      </div>

      {/* Export notification feedback */}
      {exportFeedback && (
        <div
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            color: '#34d399',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Check size={16} />
          <span>{exportFeedback}</span>
        </div>
      )}

      {/* Top Highlight Summary Cards */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <Skeleton height="95px" />
          <Skeleton height="95px" />
          <Skeleton height="95px" />
        </div>
      ) : summary ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Audited Inquiries
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
                  {summary.totalLeads}
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
          </Card>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Overall Conversion
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#34d399', marginTop: '4px' }}>
                  {summary.overallConversionRate}%
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
          </Card>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Top Performing Channel
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
                  {topSource ? topSource.source : 'N/A'}
                </div>
              </div>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BarChart3 size={18} />
              </div>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {topSource ? `${topSource.conversionRate}% conversion (${topSource.convertedLeads} admitted)` : 'No conversions recorded yet'}
            </div>
          </Card>
        </div>
      ) : null}

      {/* Tabs navigation */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '12px',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('source')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: activeTab === 'source' ? '1px solid var(--primary)' : '1px solid transparent',
            background: activeTab === 'source' ? 'var(--primary-light)' : 'transparent',
            color: activeTab === 'source' ? 'var(--accent)' : 'var(--text-muted)',
            transition: 'all 0.15s ease',
          }}
        >
          <Layers size={16} />
          <span>Source Conversion Funnel</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('counselor')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: activeTab === 'counselor' ? '1px solid var(--primary)' : '1px solid transparent',
            background: activeTab === 'counselor' ? 'var(--primary-light)' : 'transparent',
            color: activeTab === 'counselor' ? 'var(--accent)' : 'var(--text-muted)',
            transition: 'all 0.15s ease',
          }}
        >
          <Users size={16} />
          <span>Counselor Performance</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('export')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: activeTab === 'export' ? '1px solid var(--primary)' : '1px solid transparent',
            background: activeTab === 'export' ? 'var(--primary-light)' : 'transparent',
            color: activeTab === 'export' ? 'var(--accent)' : 'var(--text-muted)',
            transition: 'all 0.15s ease',
          }}
        >
          <FileSpreadsheet size={16} />
          <span>Data Export Center</span>
        </button>
      </div>

      {/* Tab 1: Source Funnel Report */}
      {activeTab === 'source' && summary && (
        <Card padding="none">
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Acquisition Channel Performance
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Analysis of inquiries, progression status, and conversion rate by acquisition channel
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportSourceReport}
              icon={<Download size={14} />}
            >
              Export Source Summary (CSV)
            </Button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '12px 18px', color: 'var(--text-subtle)', fontWeight: 600 }}>Source Channel</th>
                  <th style={{ padding: '12px 18px', color: 'var(--text-subtle)', fontWeight: 600 }}>Total Inquiries</th>
                  <th style={{ padding: '12px 18px', color: 'var(--text-subtle)', fontWeight: 600 }}>New</th>
                  <th style={{ padding: '12px 18px', color: 'var(--text-subtle)', fontWeight: 600 }}>Contacted</th>
                  <th style={{ padding: '12px 18px', color: 'var(--text-subtle)', fontWeight: 600 }}>Qualified</th>
                  <th style={{ padding: '12px 18px', color: 'var(--text-subtle)', fontWeight: 600 }}>Converted</th>
                  <th style={{ padding: '12px 18px', color: 'var(--text-subtle)', fontWeight: 600 }}>Lost</th>
                  <th style={{ padding: '12px 18px', color: 'var(--text-subtle)', fontWeight: 600 }}>Conversion Rate</th>
                </tr>
              </thead>
              <tbody>
                {summary.sourceReport.map((s) => (
                  <tr
                    key={s.source}
                    style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 0.15s ease' }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-canvas)')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {s.source}
                    </td>
                    <td style={{ padding: '12px 18px', color: 'var(--text-main)', fontWeight: 600 }}>
                      {s.totalLeads}
                    </td>
                    <td style={{ padding: '12px 18px', color: 'var(--status-new)' }}>
                      {s.newLeads}
                    </td>
                    <td style={{ padding: '12px 18px', color: 'var(--status-contacted)' }}>
                      {s.contactedLeads}
                    </td>
                    <td style={{ padding: '12px 18px', color: 'var(--status-qualified)' }}>
                      {s.qualifiedLeads}
                    </td>
                    <td style={{ padding: '12px 18px', color: 'var(--status-converted)', fontWeight: 700 }}>
                      {s.convertedLeads}
                    </td>
                    <td style={{ padding: '12px 18px', color: 'var(--status-lost)' }}>
                      {s.lostLeads}
                    </td>
                    <td style={{ padding: '12px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: s.conversionRate > 0 ? '#34d399' : 'var(--text-muted)' }}>
                          {s.conversionRate}%
                        </span>
                        <div style={{ width: '60px', height: '6px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-canvas)', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${s.conversionRate}%`,
                              height: '100%',
                              backgroundColor: s.conversionRate > 0 ? '#10b981' : 'transparent',
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 2: Counselor Performance */}
      {activeTab === 'counselor' && summary && (
        <Card padding="none">
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Team Workload & Counselor Performance
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Track student inquiry handling, follow-up execution, and admissions conversion
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportCounselorReport}
              icon={<Download size={14} />}
            >
              Export Counselor Summary (CSV)
            </Button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '12px 18px', color: 'var(--text-subtle)', fontWeight: 600 }}>Counselor Name</th>
                  <th style={{ padding: '12px 18px', color: 'var(--text-subtle)', fontWeight: 600 }}>Role</th>
                  <th style={{ padding: '12px 18px', color: 'var(--text-subtle)', fontWeight: 600 }}>Leads Assigned</th>
                  <th style={{ padding: '12px 18px', color: 'var(--text-subtle)', fontWeight: 600 }}>Leads Converted</th>
                  <th style={{ padding: '12px 18px', color: 'var(--text-subtle)', fontWeight: 600 }}>Conversion Rate</th>
                  <th style={{ padding: '12px 18px', color: 'var(--text-subtle)', fontWeight: 600 }}>Follow-ups Completed</th>
                  <th style={{ padding: '12px 18px', color: 'var(--text-subtle)', fontWeight: 600 }}>Follow-up Rate</th>
                  <th style={{ padding: '12px 18px', color: 'var(--text-subtle)', fontWeight: 600 }}>Overdue</th>
                </tr>
              </thead>
              <tbody>
                {summary.counselorReport.map((c) => (
                  <tr
                    key={c.counselorId}
                    style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 0.15s ease' }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-canvas)')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {c.counselorName}
                    </td>
                    <td style={{ padding: '12px 18px' }}>
                      {c.counselorId === 'unassigned' ? (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>General Queue</span>
                      ) : (
                        <RoleBadge role={c.role} />
                      )}
                    </td>
                    <td style={{ padding: '12px 18px', color: 'var(--text-main)', fontWeight: 600 }}>
                      {c.leadsHandled}
                    </td>
                    <td style={{ padding: '12px 18px', color: 'var(--status-converted)', fontWeight: 700 }}>
                      {c.leadsConverted}
                    </td>
                    <td style={{ padding: '12px 18px', fontWeight: 700, color: c.conversionRate > 0 ? '#34d399' : 'var(--text-muted)' }}>
                      {c.conversionRate}%
                    </td>
                    <td style={{ padding: '12px 18px', color: 'var(--text-main)' }}>
                      {c.followupsCompleted} / {c.followupsTotal}
                    </td>
                    <td style={{ padding: '12px 18px', color: 'var(--accent)' }}>
                      {c.followupCompletionRate}%
                    </td>
                    <td style={{ padding: '12px 18px' }}>
                      {c.overdueFollowups > 0 ? (
                        <span style={{ color: '#f87171', fontWeight: 700, backgroundColor: 'rgba(239, 68, 68, 0.15)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem' }}>
                          {c.overdueFollowups} overdue
                        </span>
                      ) : (
                        <span style={{ color: '#34d399', fontSize: '0.8rem' }}>0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: Data Export Center */}
      {activeTab === 'export' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {/* Card 1: All Leads Export */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Complete Student Enquiries Dataset
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                  RFC 4180 CSV with UTF-8 BOM
                </span>
              </div>
            </div>

            <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Export all student names, contact numbers, email addresses, course interests, acquisition channels, statuses, loss reasons, counselor notes, and timestamps.
            </p>

            <Button
              variant="primary"
              onClick={handleExportAllLeads}
              loading={exportingLeads}
              icon={<Download size={15} />}
              style={{ width: '100%' }}
            >
              Download Full Leads Dataset (CSV)
            </Button>
          </Card>

          {/* Card 2: Source Channel Analytics Export */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Source Channel Conversion Summary
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                  Marketing acquisition funnels
                </span>
              </div>
            </div>

            <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Export total inquiries, qualified numbers, enrollments, lost counts, and conversion percentages grouped by acquisition channel for marketing analysis.
            </p>

            <Button
              variant="secondary"
              onClick={handleExportSourceReport}
              icon={<Download size={15} />}
              style={{ width: '100%' }}
            >
              Download Source Summary (CSV)
            </Button>
          </Card>

          {/* Card 3: Counselor Performance Export */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Counselor Productivity & Conversion
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                  Staff workload & audit
                </span>
              </div>
            </div>

            <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Export staff workload distribution, total leads handled, enrollments closed, follow-ups completed, and overdue follow-up counts for managerial review.
            </p>

            <Button
              variant="secondary"
              onClick={handleExportCounselorReport}
              icon={<Download size={15} />}
              style={{ width: '100%' }}
            >
              Download Counselor Summary (CSV)
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};
