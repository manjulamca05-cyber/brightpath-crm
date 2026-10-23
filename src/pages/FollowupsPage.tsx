import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { FollowupCard } from '../features/followups/FollowupCard';
import { ScheduleFollowupModal } from '../features/followups/ScheduleFollowupModal';
import { followupService, type FollowupCounts } from '../services/followupService';
import { authService } from '../services/authService';
import type { FollowUp, Profile } from '../types/database';
import {
  CalendarPlus,
  CalendarCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Search,
  RotateCw,
  ListFilter,
} from 'lucide-react';

type TabType = 'overdue' | 'upcoming' | 'completed' | 'all';

export const FollowupsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overdue');
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [counts, setCounts] = useState<FollowupCounts>({
    overdue: 0,
    upcoming: 0,
    completed: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('');
  const [staffProfiles, setStaffProfiles] = useState<Profile[]>([]);

  // Schedule modal
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  // Load staff profiles once
  useEffect(() => {
    let ignore = false;
    authService.getStaffProfiles().then((profiles) => {
      if (!ignore) {
        setStaffProfiles(profiles);
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    Promise.all([
      followupService.getFollowups({
        tab: activeTab,
        search: searchTerm,
        assignedTo: assignedFilter || undefined,
      }),
      followupService.getFollowupCounts(),
    ]).then(([listRes, countRes]) => {
      if (!ignore) {
        setFollowups(listRes.data);
        setCounts(countRes);
        setLoading(false);
        setRefreshing(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, [activeTab, searchTerm, assignedFilter, refreshTrigger]);

  const handleRefresh = () => {
    setRefreshing(true);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleComplete = async (id: string) => {
    const res = await followupService.completeFollowup(id);
    if (res.success) {
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  const handleCancel = async (id: string) => {
    const res = await followupService.cancelFollowup(id);
    if (res.success) {
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
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
          <h1
            style={{
              fontSize: '1.6rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              margin: '0 0 4px',
            }}
          >
            Follow-up Reminders
          </h1>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
              margin: 0,
            }}
          >
            Track overdue student enquiries, scheduled callbacks, and consultation outcomes
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setScheduleModalOpen(true)}
          icon={<CalendarPlus size={16} />}
        >
          Schedule Follow-up
        </Button>
      </div>

      {/* Tabs & Filter Bar */}
      <Card padding="sm">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Tab Navigation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {/* Overdue Tab */}
              <button
                type="button"
                onClick={() => setActiveTab('overdue')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: activeTab === 'overdue' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid transparent',
                  background: activeTab === 'overdue' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                  color: activeTab === 'overdue' ? '#f87171' : 'var(--text-muted)',
                  transition: 'all 0.15s ease',
                }}
              >
                <AlertTriangle size={15} />
                <span>Overdue</span>
                <span
                  style={{
                    backgroundColor: activeTab === 'overdue' ? '#ef4444' : 'rgba(239, 68, 68, 0.2)',
                    color: '#ffffff',
                    padding: '1px 7px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  {counts.overdue}
                </span>
              </button>

              {/* Upcoming Tab */}
              <button
                type="button"
                onClick={() => setActiveTab('upcoming')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: activeTab === 'upcoming' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
                  background: activeTab === 'upcoming' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  color: activeTab === 'upcoming' ? 'var(--accent)' : 'var(--text-muted)',
                  transition: 'all 0.15s ease',
                }}
              >
                <Clock size={15} />
                <span>Upcoming</span>
                <span
                  style={{
                    backgroundColor: activeTab === 'upcoming' ? 'var(--primary)' : 'rgba(56, 189, 248, 0.2)',
                    color: '#ffffff',
                    padding: '1px 7px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  {counts.upcoming}
                </span>
              </button>

              {/* Completed Tab */}
              <button
                type="button"
                onClick={() => setActiveTab('completed')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: activeTab === 'completed' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
                  background: activeTab === 'completed' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  color: activeTab === 'completed' ? '#34d399' : 'var(--text-muted)',
                  transition: 'all 0.15s ease',
                }}
              >
                <CheckCircle2 size={15} />
                <span>Completed</span>
                <span
                  style={{
                    backgroundColor: activeTab === 'completed' ? '#059669' : 'rgba(16, 185, 129, 0.2)',
                    color: '#ffffff',
                    padding: '1px 7px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  {counts.completed}
                </span>
              </button>

              {/* All Tab */}
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: activeTab === 'all' ? '1px solid var(--border-default)' : '1px solid transparent',
                  background: activeTab === 'all' ? 'var(--bg-canvas)' : 'transparent',
                  color: activeTab === 'all' ? 'var(--text-main)' : 'var(--text-muted)',
                  transition: 'all 0.15s ease',
                }}
              >
                <CalendarCheck size={15} />
                <span>All</span>
                <span
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'var(--text-muted)',
                    padding: '1px 7px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  {counts.total}
                </span>
              </button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              loading={refreshing}
              icon={<RotateCw size={14} />}
            >
              Refresh
            </Button>
          </div>

          {/* Search and Assignee Filter row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            {/* Search Input */}
            <div
              style={{
                flex: 1,
                minWidth: '240px',
                position: 'relative',
              }}
            >
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-subtle)',
                }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search student name, phone, course, or note..."
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Counselor Filter */}
            {staffProfiles.length > 0 && (
              <div style={{ minWidth: '200px' }}>
                <select
                  value={assignedFilter}
                  onChange={(e) => setAssignedFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">All Counselors</option>
                  {staffProfiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.role})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Follow-up List Content */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          <Skeleton height="210px" />
          <Skeleton height="210px" />
          <Skeleton height="210px" />
        </div>
      ) : followups.length === 0 ? (
        <Card padding="none">
          <EmptyState
            icon={
              activeTab === 'overdue' ? (
                <AlertTriangle size={36} color="#34d399" />
              ) : (
                <ListFilter size={36} />
              )
            }
            title={
              activeTab === 'overdue'
                ? 'Zero Overdue Enquiries!'
                : activeTab === 'upcoming'
                ? 'No Upcoming Follow-ups Scheduled'
                : activeTab === 'completed'
                ? 'No Completed Follow-ups Yet'
                : 'No Follow-ups Found'
            }
            description={
              activeTab === 'overdue'
                ? 'Great work! All scheduled student enquiries are up to date and accounted for.'
                : 'Schedule a timely reminder or callback to ensure students progress through the admissions pipeline.'
            }
            action={
              <Button
                variant="primary"
                onClick={() => setScheduleModalOpen(true)}
                icon={<CalendarPlus size={16} />}
              >
                Schedule Follow-up
              </Button>
            }
          />
        </Card>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '16px',
          }}
        >
          {followups.map((item) => (
            <FollowupCard
              key={item.id}
              followup={item}
              onComplete={handleComplete}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}

      {/* Schedule Followup Modal */}
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
