import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import type { LeadStatus, LeadSource } from '../../types/database';

export interface LeadFiltersState {
  search: string;
  status: LeadStatus | '';
  source: LeadSource | '';
  sortBy: 'created_at' | 'full_name';
  sortOrder: 'asc' | 'desc';
}

export interface LeadFiltersProps {
  filters: LeadFiltersState;
  onChange: (updated: LeadFiltersState) => void;
  onReset: () => void;
}

export const LeadFilters: React.FC<LeadFiltersProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const isFiltered = Boolean(filters.search || filters.status || filters.source || filters.sortBy !== 'created_at' || filters.sortOrder !== 'desc');

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '12px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '14px 18px',
    }}>
      {/* Search Input */}
      <div style={{
        position: 'relative',
        flex: '1 1 240px',
        minWidth: '220px',
      }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-subtle)',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          placeholder="Search name, phone, course..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
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

      {/* Status Filter */}
      <div style={{ minWidth: '140px' }}>
        <select
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value as LeadStatus | '' })}
          aria-label="Filter leads by status"
          style={{
            width: '100%',
            padding: '9px 12px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            color: filters.status ? 'var(--text-main)' : 'var(--text-muted)',
            fontSize: '0.875rem',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="" style={{ background: '#0f172a' }}>All Statuses</option>
          <option value="New" style={{ background: '#0f172a' }}>New</option>
          <option value="Contacted" style={{ background: '#0f172a' }}>Contacted</option>
          <option value="Qualified" style={{ background: '#0f172a' }}>Qualified</option>
          <option value="Converted" style={{ background: '#0f172a' }}>Converted</option>
          <option value="Lost" style={{ background: '#0f172a' }}>Lost</option>
        </select>
      </div>

      {/* Source Filter */}
      <div style={{ minWidth: '140px' }}>
        <select
          value={filters.source}
          onChange={(e) => onChange({ ...filters, source: e.target.value as LeadSource | '' })}
          aria-label="Filter leads by source"
          style={{
            width: '100%',
            padding: '9px 12px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            color: filters.source ? 'var(--text-main)' : 'var(--text-muted)',
            fontSize: '0.875rem',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="" style={{ background: '#0f172a' }}>All Sources</option>
          <option value="Website" style={{ background: '#0f172a' }}>Website</option>
          <option value="Phone Call" style={{ background: '#0f172a' }}>Phone Call</option>
          <option value="WhatsApp" style={{ background: '#0f172a' }}>WhatsApp</option>
          <option value="Referral" style={{ background: '#0f172a' }}>Referral</option>
          <option value="Walk-in" style={{ background: '#0f172a' }}>Walk-in</option>
          <option value="Other" style={{ background: '#0f172a' }}>Other</option>
        </select>
      </div>

      {/* Sort By */}
      <div style={{ minWidth: '140px' }}>
        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-') as ['created_at' | 'full_name', 'asc' | 'desc'];
            onChange({ ...filters, sortBy, sortOrder });
          }}
          aria-label="Sort leads by"
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
          <option value="created_at-desc" style={{ background: '#0f172a' }}>Newest First</option>
          <option value="created_at-asc" style={{ background: '#0f172a' }}>Oldest First</option>
          <option value="full_name-asc" style={{ background: '#0f172a' }}>Name (A-Z)</option>
        </select>
      </div>

      {/* Reset Button */}
      {isFiltered && (
        <button
          onClick={onReset}
          title="Reset filters"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#f87171',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
        >
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
};
