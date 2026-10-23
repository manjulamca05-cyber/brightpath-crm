// ==============================================================================
// BrightPath CRM — Metric & Analytics Service Layer
// Real-time KPI aggregation, strict conversion rate math, and reconciliation
// ==============================================================================

import { supabase } from '../lib/supabaseClient';
import type { Lead, FollowUp, LeadStatus, LeadSource } from '../types/database';

export interface DashboardMetrics {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  lostLeads: number;
  activePipelineLeads: number; // Contacted + Qualified
  overdueFollowups: number;
  upcomingFollowups: number;
  completedFollowups: number;
  conversionRate: number; // (converted / total) * 100, guarded against division by zero
  statusCounts: Record<LeadStatus, number>;
  sourceCounts: Record<LeadSource, number>;
  recentLeads: Lead[];
  urgentFollowups: FollowUp[];
}

export const ALL_STATUSES: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];
export const ALL_SOURCES: LeadSource[] = ['Website', 'Phone Call', 'WhatsApp', 'Referral', 'Walk-in', 'Other'];

export const metricService = {
  /**
   * Calculate all dashboard KPIs, distributions, and recent items
   * Fully reconciled with accessible leads and follow-ups under user's RLS scope
   */
  async getDashboardMetrics(): Promise<{ data: DashboardMetrics | null; error?: string }> {
    try {
      const nowMs = Date.now();

      // 1. Fetch accessible leads
      const leadsPromise = supabase
        .from('leads')
        .select(`
          *,
          assigned_profile:profiles!assigned_to(id, full_name, role)
        `)
        .order('created_at', { ascending: false });

      // 2. Fetch accessible follow-ups with joined leads
      const followupsPromise = supabase
        .from('follow_ups')
        .select(`
          *,
          lead:leads!lead_id(id, full_name, phone, course_interest, status),
          assigned_profile:profiles!assigned_to(id, full_name, role)
        `)
        .order('due_at', { ascending: true });

      const [leadsResult, followupsResult] = await Promise.all([leadsPromise, followupsPromise]);

      if (leadsResult.error) {
        return { data: null, error: leadsResult.error.message };
      }
      if (followupsResult.error) {
        return { data: null, error: followupsResult.error.message };
      }

      const leads = (leadsResult.data as Lead[]) || [];
      const followups = (followupsResult.data as FollowUp[]) || [];

      // Initialise status counts
      const statusCounts: Record<LeadStatus, number> = {
        New: 0,
        Contacted: 0,
        Qualified: 0,
        Converted: 0,
        Lost: 0,
      };

      // Initialise source counts
      const sourceCounts: Record<LeadSource, number> = {
        Website: 0,
        'Phone Call': 0,
        WhatsApp: 0,
        Referral: 0,
        'Walk-in': 0,
        Other: 0,
      };

      // Aggregate leads
      for (const lead of leads) {
        if (lead.status in statusCounts) {
          statusCounts[lead.status]++;
        }
        if (lead.source in sourceCounts) {
          sourceCounts[lead.source]++;
        }
      }

      const totalLeads = leads.length;
      const newLeads = statusCounts.New;
      const contactedLeads = statusCounts.Contacted;
      const qualifiedLeads = statusCounts.Qualified;
      const convertedLeads = statusCounts.Converted;
      const lostLeads = statusCounts.Lost;
      const activePipelineLeads = contactedLeads + qualifiedLeads;

      // Strict Conversion Rate % with zero division guard: (converted / total) * 100
      const conversionRate = totalLeads > 0
        ? Math.round((convertedLeads / totalLeads) * 1000) / 10
        : 0;

      // Aggregate follow-ups
      let overdueFollowups = 0;
      let upcomingFollowups = 0;
      let completedFollowups = 0;
      const urgentFollowups: FollowUp[] = [];

      for (const fu of followups) {
        if (fu.status === 'completed') {
          completedFollowups++;
        } else if (fu.status === 'pending') {
          const dueMs = new Date(fu.due_at).getTime();
          if (dueMs < nowMs) {
            overdueFollowups++;
            urgentFollowups.push(fu);
          } else {
            upcomingFollowups++;
          }
        }
      }

      // Sort urgent follow-ups (oldest overdue first) and take top 5
      urgentFollowups.sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());
      const topUrgentFollowups = urgentFollowups.slice(0, 5);

      // Top 5 recent leads
      const topRecentLeads = leads.slice(0, 5);

      return {
        data: {
          totalLeads,
          newLeads,
          contactedLeads,
          qualifiedLeads,
          convertedLeads,
          lostLeads,
          activePipelineLeads,
          overdueFollowups,
          upcomingFollowups,
          completedFollowups,
          conversionRate,
          statusCounts,
          sourceCounts,
          recentLeads: topRecentLeads,
          urgentFollowups: topUrgentFollowups,
        },
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error calculating dashboard metrics';
      return { data: null, error: msg };
    }
  },
};
