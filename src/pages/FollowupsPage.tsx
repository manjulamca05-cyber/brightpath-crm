import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CalendarPlus, CalendarCheck } from 'lucide-react';

export const FollowupsPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="primary" size="sm">Overdue</Button>
          <Button variant="secondary" size="sm">Upcoming</Button>
          <Button variant="secondary" size="sm">Completed</Button>
        </div>
        <Button variant="primary" icon={<CalendarPlus size={16} />}>
          Schedule Follow-up
        </Button>
      </div>

      <Card padding="none">
        <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'var(--status-contacted-bg)',
            color: 'var(--status-contacted)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px',
          }}>
            <CalendarCheck size={22} />
          </div>
          <h4 style={{ margin: '0 0 6px', fontSize: '1rem', color: 'var(--text-main)' }}>
            Follow-ups Engine Ready for Phase 6
          </h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-subtle)', maxWidth: '440px', display: 'inline-block' }}>
            Strict overdue date calculations, scheduled reminders, completion logs, and activity timeline hooks will be built in Phase 6.
          </p>
        </div>
      </Card>
    </div>
  );
};
