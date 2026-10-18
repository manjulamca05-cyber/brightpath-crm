import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { LeadFilters, type LeadFiltersState } from '../features/leads/LeadFilters';
import { CreateLeadModal } from '../features/leads/CreateLeadModal';
import { leadService } from '../services/leadService';
import type { Lead } from '../types/database';
import { UserPlus, Users, ChevronRight, Phone } from 'lucide-react';

const DEFAULT_FILTERS: LeadFiltersState = {
  search: '',
  status: '',
  source: '',
  sortBy: 'created_at',
  sortOrder: 'desc',
};

export const LeadsPage: React.FC = () => {
  const navigate = useNavigate();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<LeadFiltersState>(DEFAULT_FILTERS);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;

    leadService.getLeads({
      search: filters.search,
      status: filters.status,
      source: filters.source,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    }).then((res) => {
      if (!ignore) {
        if (res.data) {
          setLeads(res.data);
        }
        setLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, [filters, refreshTrigger]);

  const handleResetFilters = () => {
    setLoading(true);
    setFilters(DEFAULT_FILTERS);
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

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
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Student Inquiries Directory
          </h2>
          <p style={{ margin: '3px 0 0', fontSize: '0.85rem', color: 'var(--text-subtle)' }}>
            {loading ? 'Searching inquiries...' : `${leads.length} inquiries found matching criteria`}
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setCreateModalOpen(true)}
          icon={<UserPlus size={16} />}
        >
          New Student Inquiry
        </Button>
      </div>

      {/* Multi-Criteria Filter Bar */}
      <LeadFilters
        filters={filters}
        onChange={(newFilters) => {
          setLoading(true);
          setFilters(newFilters);
        }}
        onReset={handleResetFilters}
      />

      {/* Inquiries Table */}
      <Card padding="none">
        {loading ? (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Skeleton height="36px" />
            <Skeleton height="44px" />
            <Skeleton height="44px" />
            <Skeleton height="44px" />
            <Skeleton height="44px" />
          </div>
        ) : leads.length === 0 ? (
          <EmptyState
            icon={<Users size={24} />}
            title="No Inquiries Found"
            description={
              filters.search || filters.status || filters.source
                ? 'No student inquiries matched your filter criteria. Try clearing some filters or searching with different terms.'
                : 'There are no student inquiries registered in the system yet. Click below to add your first inquiry!'
            }
            action={
              filters.search || filters.status || filters.source ? (
                <Button variant="secondary" onClick={handleResetFilters}>
                  Reset All Filters
                </Button>
              ) : (
                <Button variant="primary" onClick={() => setCreateModalOpen(true)} icon={<UserPlus size={16} />}>
                  Register First Inquiry
                </Button>
              )
            }
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '0.875rem',
            }}>
              <thead>
                <tr style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  color: 'var(--text-subtle)',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em',
                  background: 'rgba(0, 0, 0, 0.2)',
                }}>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Student Name</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Contact Info</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Course</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Source</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Registered</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color 0.15s ease',
                      cursor: 'pointer',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    onClick={() => navigate(`/leads/${lead.id}`)}
                  >
                    {/* Student Name */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.925rem' }}>
                        {lead.full_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
                        ID: {lead.id.substring(0, 8)}...
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
                        <Phone size={13} color="var(--text-subtle)" />
                        <span>{lead.phone}</span>
                      </div>
                      {lead.email && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
                          {lead.email}
                        </div>
                      )}
                    </td>

                    {/* Target Course */}
                    <td style={{ padding: '14px 16px', color: 'var(--text-main)', maxWidth: '220px' }}>
                      <span style={{ fontWeight: 500 }}>{lead.course_interest}</span>
                    </td>

                    {/* Source */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        fontWeight: 500,
                      }}>
                        {lead.source}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '14px 16px' }}>
                      <Badge status={lead.status} size="sm" />
                    </td>

                    {/* Created Date */}
                    <td style={{ padding: '14px 16px', color: 'var(--text-subtle)', fontSize: '0.825rem' }}>
                      {formatDate(lead.created_at)}
                    </td>

                    {/* Action buttons */}
                    <td style={{ padding: '14px 20px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/leads/${lead.id}`)}
                          style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                        >
                          <span>View</span>
                          <ChevronRight size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create Lead Modal */}
      <CreateLeadModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          setLoading(true);
          setRefreshTrigger((prev) => prev + 1);
        }}
      />
    </div>
  );
};
