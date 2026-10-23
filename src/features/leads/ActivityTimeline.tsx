import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { activityService } from '../../services/activityService';
import type { Activity } from '../../types/database';
import { formatDateTime, getEventRelativeTime } from '../../utils/dateUtils';
import {
  Clock,
  UserPlus,
  RefreshCw,
  FileText,
  Calendar,
  CheckCircle2,
  XCircle,
  MessageSquare,
  UserCheck,
  Activity as ActivityIcon,
  Send,
  Plus,
} from 'lucide-react';

export interface ActivityTimelineProps {
  leadId: string;
  refreshTrigger?: number;
  onActivityAdded?: () => void;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  leadId,
  refreshTrigger = 0,
  onActivityAdded,
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // Manual note logging state
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  const loadActivities = useCallback(async () => {
    try {
      const res = await activityService.getActivitiesByLead(leadId);
      if (res.data) {
        setActivities(res.data);
      }
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    let ignore = false;

    activityService.getActivitiesByLead(leadId).then((res) => {
      if (!ignore) {
        if (res.data) {
          setActivities(res.data);
        }
        setLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, [leadId, refreshTrigger]);

  const handleAddManualNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) {
      setNoteError('Please enter a note or discussion summary.');
      return;
    }

    setSubmittingNote(true);
    setNoteError(null);

    const res = await activityService.logActivity({
      leadId,
      activityType: 'manual_note',
      description: noteText.trim(),
    });

    setSubmittingNote(false);

    if (res.error) {
      setNoteError(res.error);
    } else {
      setNoteText('');
      setShowAddNote(false);
      await loadActivities();
      if (onActivityAdded) {
        onActivityAdded();
      }
    }
  };

  const getActivityConfig = (type: string) => {
    switch (type) {
      case 'lead_created':
        return {
          icon: <UserPlus size={15} />,
          color: 'var(--accent)',
          bgColor: 'rgba(56, 189, 248, 0.12)',
          borderColor: 'rgba(56, 189, 248, 0.3)',
          label: 'Enquiry Registered',
        };
      case 'status_changed':
        return {
          icon: <RefreshCw size={15} />,
          color: '#f59e0b',
          bgColor: 'rgba(245, 158, 11, 0.12)',
          borderColor: 'rgba(245, 158, 11, 0.3)',
          label: 'Status Transition',
        };
      case 'notes_updated':
        return {
          icon: <FileText size={15} />,
          color: '#818cf8',
          bgColor: 'rgba(129, 140, 248, 0.12)',
          borderColor: 'rgba(129, 140, 248, 0.3)',
          label: 'Notes Updated',
        };
      case 'followup_scheduled':
        return {
          icon: <Calendar size={15} />,
          color: 'var(--accent)',
          bgColor: 'rgba(56, 189, 248, 0.12)',
          borderColor: 'rgba(56, 189, 248, 0.3)',
          label: 'Follow-up Scheduled',
        };
      case 'followup_completed':
        return {
          icon: <CheckCircle2 size={15} />,
          color: '#34d399',
          bgColor: 'rgba(16, 185, 129, 0.12)',
          borderColor: 'rgba(16, 185, 129, 0.3)',
          label: 'Follow-up Completed',
        };
      case 'followup_cancelled':
        return {
          icon: <XCircle size={15} />,
          color: '#94a3b8',
          bgColor: 'rgba(148, 163, 184, 0.12)',
          borderColor: 'rgba(148, 163, 184, 0.3)',
          label: 'Follow-up Cancelled',
        };
      case 'assignment_changed':
        return {
          icon: <UserCheck size={15} />,
          color: '#38bdf8',
          bgColor: 'rgba(56, 189, 248, 0.12)',
          borderColor: 'rgba(56, 189, 248, 0.3)',
          label: 'Counselor Assigned',
        };
      case 'manual_note':
        return {
          icon: <MessageSquare size={15} />,
          color: '#c084fc',
          bgColor: 'rgba(192, 132, 252, 0.12)',
          borderColor: 'rgba(192, 132, 252, 0.3)',
          label: 'Interaction Note',
        };
      default:
        return {
          icon: <ActivityIcon size={15} />,
          color: '#94a3b8',
          bgColor: 'rgba(148, 163, 184, 0.1)',
          borderColor: 'rgba(148, 163, 184, 0.25)',
          label: 'Activity',
        };
    }
  };

  return (
    <Card>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '18px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Activity & Audit History
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Chronological audit trail of staff actions, calls, status changes, and follow-ups
          </p>
        </div>

        <Button
          variant={showAddNote ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => {
            setShowAddNote(!showAddNote);
            setNoteError(null);
          }}
          icon={showAddNote ? undefined : <Plus size={14} />}
        >
          {showAddNote ? 'Cancel' : 'Log Interaction'}
        </Button>
      </div>

      {/* Manual Note / Interaction Form */}
      {showAddNote && (
        <form
          onSubmit={handleAddManualNote}
          style={{
            backgroundColor: 'var(--bg-canvas)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            marginBottom: '18px',
          }}
        >
          <div style={{ marginBottom: '10px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.825rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                marginBottom: '6px',
              }}
            >
              Log Student Interaction / Call Note
            </label>
            <textarea
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Spoke with mother regarding scholarship syllabus. Student scheduled for weekend demo session..."
              disabled={submittingNote}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--bg-input)',
                border: `1px solid ${noteError ? '#ef4444' : 'var(--border-default)'}`,
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'vertical',
              }}
            />
            {noteError && (
              <span style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '4px', display: 'block' }}>
                {noteError}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={submittingNote}
              onClick={() => setShowAddNote(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submittingNote}
              icon={<Send size={13} />}
            >
              Log Entry
            </Button>
          </div>
        </form>
      )}

      {/* Timeline List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '10px 0' }}>
          <Skeleton height="54px" />
          <Skeleton height="54px" />
          <Skeleton height="54px" />
        </div>
      ) : activities.length === 0 ? (
        <div
          style={{
            padding: '32px 16px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-canvas)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-default)',
            color: 'var(--text-muted)',
          }}
        >
          <ActivityIcon size={26} style={{ opacity: 0.5, marginBottom: '8px' }} />
          <p style={{ margin: 0, fontSize: '0.875rem' }}>No activity logged for this enquiry yet.</p>
          <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
            Actions like status updates, notes, and follow-ups will automatically appear here.
          </p>
        </div>
      ) : (
        <div
          style={{
            position: 'relative',
            paddingLeft: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          {/* Vertical continuous line */}
          <div
            style={{
              position: 'absolute',
              left: '11px',
              top: '8px',
              bottom: '8px',
              width: '2px',
              backgroundColor: 'var(--border-subtle)',
            }}
          />

          {activities.map((item) => {
            const config = getActivityConfig(item.activity_type);
            const actorName = item.actor_profile?.full_name || 'System / Counselor';

            return (
              <div
                key={item.id}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                {/* Timeline node icon */}
                <div
                  style={{
                    position: 'absolute',
                    left: '-28px',
                    top: '2px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-surface)',
                    border: `1.5px solid ${config.borderColor}`,
                    color: config.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 8px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  {config.icon}
                </div>

                {/* Event Header: Type tag, actor & timestamp */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: config.bgColor,
                        color: config.color,
                        border: `1px solid ${config.borderColor}`,
                        letterSpacing: '0.01em',
                      }}
                    >
                      {config.label}
                    </span>

                    <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                      by <strong style={{ color: 'var(--text-main)', fontWeight: 500 }}>{actorName}</strong>
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    title={formatDateTime(item.created_at)}
                  >
                    <Clock size={12} />
                    <span>{getEventRelativeTime(item.created_at)}</span>
                  </div>
                </div>

                {/* Event Description / Content */}
                <div
                  style={{
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                    color: 'var(--text-main)',
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '9px 12px',
                    marginTop: '4px',
                    wordBreak: 'break-word',
                  }}
                >
                  {item.description}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
