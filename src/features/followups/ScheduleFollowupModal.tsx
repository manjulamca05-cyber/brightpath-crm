import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useAuth } from '../auth/useAuth';
import { followupService } from '../../services/followupService';
import { leadService } from '../../services/leadService';
import { authService } from '../../services/authService';
import type { Lead, Profile } from '../../types/database';
import { toDatetimeLocalInputString, getPresetDate } from '../../utils/dateUtils';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

export interface ScheduleFollowupModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedLeadId?: string;
  preselectedLeadName?: string;
  onSuccess: () => void;
}

export const ScheduleFollowupModal: React.FC<ScheduleFollowupModalProps> = ({
  isOpen,
  onClose,
  preselectedLeadId,
  preselectedLeadName,
  onSuccess,
}) => {
  const { user } = useAuth();

  // Form State
  const [leadId, setLeadId] = useState(preselectedLeadId || '');
  const [dueAt, setDueAt] = useState(() => toDatetimeLocalInputString(getPresetDate('plus2hours')));
  const [note, setNote] = useState('');
  const [assignedTo, setAssignedTo] = useState(user?.id || '');

  // Options & Loading State
  const [leadsList, setLeadsList] = useState<Lead[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setNote('');
    setError(null);
    setDueAt(toDatetimeLocalInputString(getPresetDate('plus2hours')));
    setAssignedTo(user?.id || '');
    if (!preselectedLeadId && leadsList.length > 0) {
      setLeadId(leadsList[0].id);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Load available leads (if no preselected lead) and staff profiles
  useEffect(() => {
    if (!isOpen) return;
    let ignore = false;

    Promise.all([
      !preselectedLeadId ? leadService.getLeads() : Promise.resolve({ data: [] }),
      authService.getStaffProfiles(),
    ]).then(([leadsRes, staffProfiles]) => {
      if (!ignore) {
        if (leadsRes.data) {
          setLeadsList(leadsRes.data);
          if (!preselectedLeadId && leadsRes.data.length > 0) {
            setLeadId(leadsRes.data[0].id);
          }
        }
        if (staffProfiles) {
          setProfiles(staffProfiles);
        }
        setLoadingInitial(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, [isOpen, preselectedLeadId]);

  const handleApplyPreset = (preset: 'plus2hours' | 'tomorrow10am' | 'in2days' | 'nextmonday') => {
    const targetDate = getPresetDate(preset);
    setDueAt(toDatetimeLocalInputString(targetDate));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const selectedLead = preselectedLeadId || leadId;
    if (!selectedLead) {
      setError('Please select a student enquiry for this follow-up.');
      return;
    }

    if (!note.trim()) {
      setError('Please enter a follow-up objective or discussion note.');
      return;
    }

    if (!dueAt) {
      setError('Please specify the scheduled date and time.');
      return;
    }

    const dueDateObj = new Date(dueAt);
    if (isNaN(dueDateObj.getTime())) {
      setError('Invalid date and time format.');
      return;
    }

    setSubmitting(true);

    const res = await followupService.createFollowup({
      lead_id: selectedLead,
      due_at: dueDateObj.toISOString(),
      note: note.trim(),
      assigned_to: assignedTo || null,
    });

    setSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else {
      onSuccess();
      handleClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={preselectedLeadName ? `Schedule Follow-up for ${preselectedLeadName}` : 'Schedule Student Follow-up'}
      maxWidth="560px"
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#f87171',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Lead selection if not preselected */}
        {!preselectedLeadId && (
          <div style={{ marginBottom: '16px' }}>
            <Select
              label="Select Student Enquiry *"
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              disabled={loadingInitial || submitting}
              options={
                leadsList.length === 0
                  ? [{ value: '', label: 'No enquiries found' }]
                  : leadsList.map((l) => ({
                      value: l.id,
                      label: `${l.full_name} (${l.course_interest} • ${l.status})`,
                    }))
              }
            />
          </div>
        )}

        {/* Quick Date Presets */}
        <div style={{ marginBottom: '14px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              marginBottom: '8px',
            }}
          >
            Quick Presets
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleApplyPreset('plus2hours')}
              style={{
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-main)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
              onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}
            >
              <Clock size={12} /> +2 Hours
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('tomorrow10am')}
              style={{
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-main)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
              onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}
            >
              <Calendar size={12} /> Tomorrow 10 AM
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('in2days')}
              style={{
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-main)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
              onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}
            >
              <Calendar size={12} /> In 2 Days
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('nextmonday')}
              style={{
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-main)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
              onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}
            >
              <Calendar size={12} /> Next Monday
            </button>
          </div>
        </div>

        {/* Due Date & Time Input */}
        <Input
          label="Due Date & Time *"
          type="datetime-local"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
          required
          disabled={submitting}
        />

        {/* Note / Objective */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
          <label
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
            }}
          >
            Follow-up Objective / Discussion Note *
          </label>
          <textarea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required
            disabled={submitting}
            placeholder="e.g. Call to discuss syllabus overview, clarify scholarship query, invite for campus counseling..."
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              fontFamily: 'inherit',
              outline: 'none',
              boxSizing: 'border-box',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Assignee Selection */}
        <div style={{ marginBottom: '24px' }}>
          <Select
            label="Assign To Counselor"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            disabled={submitting}
            options={[
              { value: '', label: 'Unassigned (General Queue)' },
              ...profiles.map((p) => ({
                value: p.id,
                label: `${p.full_name} (${p.role})`,
              })),
            ]}
          />
        </div>

        {/* Modal Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '16px',
          }}
        >
          <Button type="button" variant="ghost" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            icon={<Clock size={16} />}
          >
            Schedule Follow-up
          </Button>
        </div>
      </form>
    </Modal>
  );
};
