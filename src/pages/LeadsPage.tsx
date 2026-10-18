import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { UserPlus, Filter, Search } from 'lucide-react';
import { Input } from '../components/ui/Input';

export const LeadsPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Action Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{ flex: 1, minWidth: '240px', maxWidth: '400px' }}>
          <Input
            placeholder="Search by student name, phone, course..."
            style={{ marginBottom: 0 }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="secondary" icon={<Filter size={16} />}>
            Filters
          </Button>
          <Button variant="primary" icon={<UserPlus size={16} />}>
            New Lead
          </Button>
        </div>
      </div>

      {/* Leads Table Container / Shell */}
      <Card padding="none">
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Student Inquiries Directory
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.825rem', color: 'var(--text-subtle)' }}>
                Phase 5 Target: Full CRUD, Multi-filter & Status Transitions
              </p>
            </div>
          </div>
        </div>

        <div style={{
          padding: '60px 24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--accent)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px',
          }}>
            <Search size={22} />
          </div>
          <h4 style={{ margin: '0 0 6px', fontSize: '1rem', color: 'var(--text-main)' }}>
            Lead Management Module Ready for Phase 5
          </h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-subtle)', maxWidth: '440px', display: 'inline-block' }}>
            We will implement live PostgreSQL inquiry queries, search, multi-faceted filtering, create lead modal with validation, and lead detail view.
          </p>
        </div>
      </Card>
    </div>
  );
};
