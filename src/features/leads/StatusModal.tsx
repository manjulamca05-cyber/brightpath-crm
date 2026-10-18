import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import type { Lead, LeadStatus } from '../../types/database';
import { leadService } from '../../services/leadService';

export interface StatusModalProps {
  lead: Lead | null;
  targetStatus: LeadStatus | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LOSS_REASON_PRESETS = [
  'Fee structure out of budget',
  'Opted for local competitor coaching',
  'Relocating to another city',
  'Timing or batch schedule clash',
  'Student postponed exam preparation',
  'Unreachable / no response after multiple calls',
];

export const StatusModal: React.FC<StatusModalProps> = ({
  lead,
  targetStatus,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [lossReason, setLossReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!lead || !targetStatus) return null;

  const isLoss = targetStatus === 'Lost';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isLoss && !lossReason.trim()) {
      setError('A descriptive loss reason is required by database policy.');
      return;
    }

    setLoading(true);
    const res = await leadService.updateLeadStatus(
      lead.id,
      targetStatus,
      isLoss ? lossReason : undefined,
      lead.status
    );
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Failed to update lead status');
    } else {
      setLossReason('');
      onSuccess();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isLoss ? 'Record Reason for Lost Lead' : `Change Status to "${targetStatus}"`}
      maxWidth="500px"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Updating status for <strong>{lead.full_name}</strong> from{' '}
            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{lead.status}</span> &rarr;{' '}
            <span style={{ color: isLoss ? '#f87171' : 'var(--accent)', fontWeight: 600 }}>
              {targetStatus}
            </span>.
          </p>

          {isLoss && (
            <>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Quick Preset Reasons:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {LOSS_REASON_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setLossReason(preset)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-default)',
                        background: lossReason === preset ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-canvas)',
                        color: lossReason === preset ? '#f87171' : 'var(--text-muted)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Loss Reason (Required) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={lossReason}
                  onChange={(e) => setLossReason(e.target.value)}
                  placeholder="Provide detailed feedback on why this student did not enroll..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </>
          )}

          {error && (
            <div style={{
              marginTop: '12px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.85rem',
            }}>
              {error}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <Button variant="ghost" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={isLoss ? 'danger' : 'primary'}
            type="submit"
            loading={loading}
            disabled={isLoss && !lossReason.trim()}
          >
            Confirm Status Update
          </Button>
        </div>
      </form>
    </Modal>
  );
};
