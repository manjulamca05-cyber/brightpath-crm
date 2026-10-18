import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { StatusModal } from './StatusModal';
import { leadService } from '../../services/leadService';
import type { Lead, LeadStatus } from '../../types/database';
import { ArrowLeft, Phone, Mail, BookOpen, Clock, AlertTriangle, Save } from 'lucide-react';

export const LeadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Status transition modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<LeadStatus | null>(null);

  // Counselor notes editor
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesFeedback, setNotesFeedback] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    if (!id) return;

    leadService.getLeadById(id).then((res) => {
      if (!ignore) {
        if (res.error || !res.data) {
          setError(res.error || 'Student inquiry not found');
        } else {
          setLead(res.data);
          setNotes(res.data.notes || '');
        }
        setLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, [id, refreshTrigger]);

  const handleOpenStatusModal = (status: LeadStatus) => {
    setTargetStatus(status);
    setStatusModalOpen(true);
  };

  const handleSaveNotes = async () => {
    if (!lead) return;
    setSavingNotes(true);
    setNotesFeedback(null);
    const res = await leadService.updateLead(lead.id, { notes: notes.trim() });
    setSavingNotes(false);

    if (res.success) {
      setNotesFeedback('Notes saved successfully!');
      setTimeout(() => setNotesFeedback(null), 3000);
    } else {
      setNotesFeedback('Failed to save notes.');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid var(--border-subtle)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px',
        }} />
        Loading student record...
      </div>
    );
  }

  if (error || !lead) {
    return (
      <Card style={{ textAlign: 'center', padding: '40px' }}>
        <h3 style={{ color: '#f87171', margin: '0 0 10px' }}>Inquiry Not Found</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
          {error || 'The requested student inquiry does not exist or you do not have permission to view it.'}
        </p>
        <Button variant="secondary" onClick={() => navigate('/leads')} icon={<ArrowLeft size={16} />}>
          Back to Leads
        </Button>
      </Card>
    );
  }

  const allStatuses: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Navigation & Status Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => navigate('/leads')}
            aria-label="Back to leads list"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-muted)',
              borderRadius: 'var(--radius-md)',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {lead.full_name}
              </h1>
              <Badge status={lead.status} size="md" />
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '3px' }}>
              Inquired for: <strong>{lead.course_interest}</strong>
            </div>
          </div>
        </div>

        {/* Quick Status Transition Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', fontWeight: 600, marginRight: '4px' }}>
            Set Status:
          </span>
          {allStatuses.map((st) => (
            <Button
              key={st}
              size="sm"
              variant={lead.status === st ? 'primary' : 'secondary'}
              disabled={lead.status === st}
              onClick={() => handleOpenStatusModal(st)}
            >
              {st}
            </Button>
          ))}
        </div>
      </div>

      {/* Loss Reason Alert Banner */}
      {lead.status === 'Lost' && lead.loss_reason && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#fca5a5',
          fontSize: '0.9rem',
        }}>
          <AlertTriangle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
          <div>
            <strong>Marked as Lost:</strong> {lead.loss_reason}
          </div>
        </div>
      )}

      {/* Information Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Contact Details Card */}
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Student Information
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Phone Number</div>
                <a href={`tel:${lead.phone}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }}>
                  {lead.phone}
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Email Address</div>
                <div style={{ color: lead.email ? 'var(--text-main)' : 'var(--text-subtle)', fontSize: '0.9rem' }}>
                  {lead.email || 'Not provided'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Course of Interest</div>
                <div style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 500 }}>
                  {lead.course_interest}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Acquisition Source</div>
                <div style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>
                  {lead.source}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Counselor Notes Editor Card */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Counselor Notes
            </h3>
            {notesFeedback && (
              <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>
                {notesFeedback}
              </span>
            )}
          </div>

          <textarea
            rows={5}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Record interaction history, parental feedback, discount discussions..."
            style={{
              width: '100%',
              padding: '12px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              fontFamily: 'inherit',
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: '12px',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="secondary"
              size="sm"
              loading={savingNotes}
              onClick={handleSaveNotes}
              icon={<Save size={14} />}
            >
              Save Notes
            </Button>
          </div>
        </Card>
      </div>

      {/* Status Modal */}
      <StatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        lead={lead}
        targetStatus={targetStatus}
        onSuccess={() => {
          setLoading(true);
          setRefreshTrigger((prev) => prev + 1);
        }}
      />
    </div>
  );
};
