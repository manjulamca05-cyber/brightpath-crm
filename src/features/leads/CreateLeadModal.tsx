import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { leadService } from '../../services/leadService';
import type { LeadSource, LeadStatus } from '../../types/database';

export interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const COURSE_OPTIONS = [
  { value: 'NEET Comprehensive (2-Year)', label: 'NEET Comprehensive (2-Year)' },
  { value: 'JEE Advanced Intensive', label: 'JEE Advanced Intensive' },
  { value: 'Grade 10 Foundation Math & Science', label: 'Grade 10 Foundation Math & Science' },
  { value: 'NEET Repeater Batch', label: 'NEET Repeater Batch' },
  { value: 'JEE Mains FastTrack', label: 'JEE Mains FastTrack' },
  { value: 'CUET General Test + English', label: 'CUET General Test + English' },
  { value: 'Digital Marketing & Analytics', label: 'Digital Marketing & Analytics' },
];

const SOURCE_OPTIONS: { value: LeadSource; label: string }[] = [
  { value: 'Website', label: 'Website' },
  { value: 'Phone Call', label: 'Phone Call' },
  { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'Referral', label: 'Referral' },
  { value: 'Walk-in', label: 'Walk-in' },
  { value: 'Other', label: 'Other' },
];

export const CreateLeadModal: React.FC<CreateLeadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [courseInterest, setCourseInterest] = useState('NEET Comprehensive (2-Year)');
  const [source, setSource] = useState<LeadSource>('Website');
  const [status, setStatus] = useState<LeadStatus>('New');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setFullName('');
    setPhone('');
    setEmail('');
    setCourseInterest('NEET Comprehensive (2-Year)');
    setSource('Website');
    setStatus('New');
    setNotes('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form-level validation
    if (!fullName.trim()) {
      setError('Student full name is required.');
      return;
    }

    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 8) {
      setError('Please provide a valid contact phone number (at least 8 digits).');
      return;
    }

    if (email && email.trim() && !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const res = await leadService.createLead({
      full_name: fullName,
      phone: cleanPhone,
      email: email.trim() || null,
      course_interest: courseInterest,
      source,
      status,
      notes: notes.trim() || null,
    });
    setLoading(false);

    if (!res.data) {
      setError(res.error || 'Failed to save student inquiry.');
    } else {
      resetForm();
      onSuccess();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Register New Student Inquiry"
      maxWidth="580px"
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '0.85rem',
            marginBottom: '18px',
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          <Input
            label="Student Full Name *"
            placeholder="e.g. Aarav Sharma"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={loading}
            required
          />

          <Input
            label="Phone Number *"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          <Input
            label="Email Address (Optional)"
            type="email"
            placeholder="student@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <Select
            label="Lead Source *"
            value={source}
            onChange={(e) => setSource(e.target.value as LeadSource)}
            options={SOURCE_OPTIONS}
            disabled={loading}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          <Select
            label="Target Course *"
            value={courseInterest}
            onChange={(e) => setCourseInterest(e.target.value)}
            options={COURSE_OPTIONS}
            disabled={loading}
          />

          <Select
            label="Initial Status *"
            value={status}
            onChange={(e) => setStatus(e.target.value as LeadStatus)}
            options={[
              { value: 'New', label: 'New (Uncontacted)' },
              { value: 'Contacted', label: 'Contacted' },
              { value: 'Qualified', label: 'Qualified' },
            ]}
            disabled={loading}
          />
        </div>

        <div style={{ marginTop: '4px', marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
            Counselor Notes (Optional)
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add background details, parental discussion notes, batch preferences..."
            disabled={loading}
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

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <Button variant="ghost" type="button" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            Create Inquiry
          </Button>
        </div>
      </form>
    </Modal>
  );
};
