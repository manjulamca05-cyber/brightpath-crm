import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { BarChart3, Download } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Pipeline & Source Funnels
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-subtle)' }}>
            Aggregated conversion rates matching dashboard KPI formulas
          </p>
        </div>
        <Button variant="secondary" icon={<Download size={16} />}>
          Export CSV
        </Button>
      </div>

      <Card padding="none">
        <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'var(--status-qualified-bg)',
            color: 'var(--status-qualified)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px',
          }}>
            <BarChart3 size={22} />
          </div>
          <h4 style={{ margin: '0 0 6px', fontSize: '1rem', color: 'var(--text-main)' }}>
            Reports & Analytics Ready for Phase 9
          </h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-subtle)', maxWidth: '440px', display: 'inline-block' }}>
            Comprehensive source channel conversion analytics, team workload reporting, and CSV data export will be built in Phase 9.
          </p>
        </div>
      </Card>
    </div>
  );
};
