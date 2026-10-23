import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import type { FollowUp } from '../../types/database';
import {
  isFollowupOverdue,
  formatDateTime,
  getRelativeTimeDescription,
} from '../../utils/dateUtils';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Phone,
  BookOpen,
  User,
  ArrowRight,
  XCircle,
} from 'lucide-react';

export interface FollowupCardProps {
  followup: FollowUp;
  onComplete: (id: string) => Promise<void>;
  onCancel?: (id: string) => Promise<void>;
}

export const FollowupCard: React.FC<FollowupCardProps> = ({
  followup,
  onComplete,
  onCancel,
}) => {
  const [loadingAction, setLoadingAction] = useState(false);
  const isOverdue = isFollowupOverdue(followup.due_at, followup.status);
  const relativeText = getRelativeTimeDescription(followup.due_at, followup.status);

  const handleMarkComplete = async () => {
    setLoadingAction(true);
    try {
      await onComplete(followup.id);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this scheduled follow-up?')) {
      return;
    }
    if (onCancel) {
      setLoadingAction(true);
      try {
        await onCancel(followup.id);
      } finally {
        setLoadingAction(false);
      }
    }
  };

  return (
    <Card
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderLeft: isOverdue
          ? '4px solid #ef4444'
          : followup.status === 'completed'
          ? '4px solid #10b981'
          : '4px solid var(--accent)',
        position: 'relative',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      <div>
        {/* Top Header: Timing & Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            marginBottom: '12px',
            flexWrap: 'wrap',
          }}
        >
          {/* Overdue / Timing Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isOverdue && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  letterSpacing: '0.02em',
                }}
              >
                <AlertTriangle size={13} />
                {relativeText}
              </span>
            )}

            {!isOverdue && followup.status === 'pending' && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'rgba(56, 189, 248, 0.12)',
                  color: 'var(--accent)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                }}
              >
                <Clock size={13} />
                {relativeText}
              </span>
            )}

            {followup.status === 'completed' && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                }}
              >
                <CheckCircle2 size={13} />
                Completed
              </span>
            )}

            {followup.status === 'cancelled' && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'rgba(148, 163, 184, 0.1)',
                  color: '#94a3b8',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                }}
              >
                <XCircle size={13} />
                Cancelled
              </span>
            )}
          </div>

          {/* Exact due date/time */}
          <div
            style={{
              fontSize: '0.8rem',
              color: isOverdue ? '#fca5a5' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Clock size={13} />
            {formatDateTime(followup.due_at)}
          </div>
        </div>

        {/* Lead Info Section */}
        {followup.lead && (
          <div
            style={{
              background: 'var(--bg-canvas)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                marginBottom: '6px',
              }}
            >
              <Link
                to={`/leads/${followup.lead.id}`}
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
              >
                {followup.lead.full_name}
                <ArrowRight size={13} style={{ opacity: 0.6 }} />
              </Link>
              <Badge status={followup.lead.status} size="sm" />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
              }}
            >
              <a
                href={`tel:${followup.lead.phone}`}
                style={{
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <Phone size={12} />
                {followup.lead.phone}
              </a>

              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <BookOpen size={12} />
                {followup.lead.course_interest}
              </span>
            </div>
          </div>
        )}

        {/* Note / Follow-up Objective */}
        <div
          style={{
            fontSize: '0.875rem',
            lineHeight: 1.5,
            color: 'var(--text-main)',
            marginBottom: '14px',
            whiteSpace: 'pre-wrap',
          }}
        >
          {followup.note}
        </div>
      </div>

      {/* Footer: Assignee & Action Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '12px',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        {/* Assignee */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            color: 'var(--text-subtle)',
          }}
        >
          <User size={13} />
          <span>
            {followup.assigned_profile?.full_name || 'Unassigned'}
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {followup.status === 'pending' && (
            <>
              {onCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={loadingAction}
                  onClick={handleCancel}
                  style={{ color: '#94a3b8' }}
                >
                  Cancel
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                loading={loadingAction}
                onClick={handleMarkComplete}
                icon={<CheckCircle2 size={14} />}
                style={{
                  backgroundColor: '#059669',
                  borderColor: '#10b981',
                }}
              >
                Mark Complete
              </Button>
            </>
          )}

          {followup.status === 'completed' && followup.completed_at && (
            <span style={{ fontSize: '0.75rem', color: '#34d399' }}>
              Done {formatDateTime(followup.completed_at)}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};
