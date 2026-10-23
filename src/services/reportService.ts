// ==============================================================================
// BrightPath CRM — Report Service Layer
// Source conversion summaries, counselor performance analytics, and CSV export
// ==============================================================================

import { supabase } from '../lib/supabaseClient';
import type { Lead, FollowUp, Profile, LeadSource } from '../types/database';
import { ALL_SOURCES } from './metricService';
import type { CSVRow } from '../utils/csvExport';

export interface SourceReportItem {
  source: LeadSource;
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  lostLeads: number;
  conversionRate: number; // Percentage, 0-100 rounded to 1 decimal place
}

export interface CounselorReportItem {
  counselorId: string;
  counselorName: string;
  role: string;
  leadsHandled: number;
  leadsConverted: number;
  conversionRate: number;
  followupsTotal: number;
  followupsCompleted: number;
  followupCompletionRate: number;
  overdueFollowups: number;
}

export interface ReportsSummary {
  sourceReport: SourceReportItem[];
  counselorReport: CounselorReportItem[];
  totalLeads: number;
  overallConversionRate: number;
}

export const reportService = {
  /**
   * Fetch comprehensive report metrics for source channels and counselor performance
   */
  async getReportsSummary(): Promise<{ data: ReportsSummary | null; error?: string }> {
    try {
      const nowMs = Date.now();

      // 1. Fetch leads with joined profiles
      const leadsPromise = supabase
        .from('leads')
        .select(`
          *,
          assigned_profile:profiles!assigned_to(id, full_name, role)
        `);

      // 2. Fetch follow-ups
      const followupsPromise = supabase
        .from('follow_ups')
        .select('id, lead_id, assigned_to, due_at, status, completed_at');

      // 3. Fetch staff profiles
      const profilesPromise = supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      const [leadsRes, followupsRes, profilesRes] = await Promise.all([
        leadsPromise,
        followupsPromise,
        profilesPromise,
      ]);

      if (leadsRes.error) return { data: null, error: leadsRes.error.message };
      if (followupsRes.error) return { data: null, error: followupsRes.error.message };

      const leads = (leadsRes.data as Lead[]) || [];
      const followups = (followupsRes.data as FollowUp[]) || [];
      const profiles = (profilesRes.data as Profile[]) || [];

      // -------------------------------------------------------------
      // 1. Source Conversion Performance
      // -------------------------------------------------------------
      const sourceMap = new Map<LeadSource, SourceReportItem>();

      for (const src of ALL_SOURCES) {
        sourceMap.set(src, {
          source: src,
          totalLeads: 0,
          newLeads: 0,
          contactedLeads: 0,
          qualifiedLeads: 0,
          convertedLeads: 0,
          lostLeads: 0,
          conversionRate: 0,
        });
      }

      for (const lead of leads) {
        const item = sourceMap.get(lead.source);
        if (item) {
          item.totalLeads++;
          if (lead.status === 'New') item.newLeads++;
          else if (lead.status === 'Contacted') item.contactedLeads++;
          else if (lead.status === 'Qualified') item.qualifiedLeads++;
          else if (lead.status === 'Converted') item.convertedLeads++;
          else if (lead.status === 'Lost') item.lostLeads++;
        }
      }

      // Compute conversion rates with division by zero guard
      const sourceReport: SourceReportItem[] = Array.from(sourceMap.values()).map((item) => ({
        ...item,
        conversionRate:
          item.totalLeads > 0
            ? Math.round((item.convertedLeads / item.totalLeads) * 1000) / 10
            : 0,
      }));

      // Sort by total leads descending
      sourceReport.sort((a, b) => b.totalLeads - a.totalLeads);

      // -------------------------------------------------------------
      // 2. Counselor Performance
      // -------------------------------------------------------------
      // Map follow-up stats by assigned_to
      const followupsByCounselor = new Map<
        string,
        { total: number; completed: number; overdue: number }
      >();

      for (const fu of followups) {
        const key = fu.assigned_to || 'unassigned';
        if (!followupsByCounselor.has(key)) {
          followupsByCounselor.set(key, { total: 0, completed: 0, overdue: 0 });
        }
        const stat = followupsByCounselor.get(key)!;
        stat.total++;
        if (fu.status === 'completed') {
          stat.completed++;
        } else if (fu.status === 'pending') {
          const dueMs = new Date(fu.due_at).getTime();
          if (dueMs < nowMs) {
            stat.overdue++;
          }
        }
      }

      // Map leads by assigned_to
      const leadsByCounselor = new Map<string, { total: number; converted: number }>();

      for (const lead of leads) {
        const key = lead.assigned_to || 'unassigned';
        if (!leadsByCounselor.has(key)) {
          leadsByCounselor.set(key, { total: 0, converted: 0 });
        }
        const stat = leadsByCounselor.get(key)!;
        stat.total++;
        if (lead.status === 'Converted') {
          stat.converted++;
        }
      }

      const counselorReport: CounselorReportItem[] = [];

      for (const profile of profiles) {
        const leadStat = leadsByCounselor.get(profile.id) || { total: 0, converted: 0 };
        const fuStat = followupsByCounselor.get(profile.id) || { total: 0, completed: 0, overdue: 0 };

        const conversionRate =
          leadStat.total > 0
            ? Math.round((leadStat.converted / leadStat.total) * 1000) / 10
            : 0;

        const followupCompletionRate =
          fuStat.total > 0
            ? Math.round((fuStat.completed / fuStat.total) * 1000) / 10
            : 0;

        counselorReport.push({
          counselorId: profile.id,
          counselorName: profile.full_name,
          role: profile.role,
          leadsHandled: leadStat.total,
          leadsConverted: leadStat.converted,
          conversionRate,
          followupsTotal: fuStat.total,
          followupsCompleted: fuStat.completed,
          followupCompletionRate,
          overdueFollowups: fuStat.overdue,
        });
      }

      // Add unassigned pool if any leads or followups are unassigned
      const unassignedLeads = leadsByCounselor.get('unassigned');
      const unassignedFollowups = followupsByCounselor.get('unassigned');
      if (
        (unassignedLeads && unassignedLeads.total > 0) ||
        (unassignedFollowups && unassignedFollowups.total > 0)
      ) {
        const total = unassignedLeads?.total || 0;
        const converted = unassignedLeads?.converted || 0;
        const fuTotal = unassignedFollowups?.total || 0;
        const fuCompleted = unassignedFollowups?.completed || 0;
        const fuOverdue = unassignedFollowups?.overdue || 0;

        counselorReport.push({
          counselorId: 'unassigned',
          counselorName: 'Unassigned Queue',
          role: 'General Pool',
          leadsHandled: total,
          leadsConverted: converted,
          conversionRate: total > 0 ? Math.round((converted / total) * 1000) / 10 : 0,
          followupsTotal: fuTotal,
          followupsCompleted: fuCompleted,
          followupCompletionRate: fuTotal > 0 ? Math.round((fuCompleted / fuTotal) * 1000) / 10 : 0,
          overdueFollowups: fuOverdue,
        });
      }

      // Sort counselors by leads handled descending
      counselorReport.sort((a, b) => b.leadsHandled - a.leadsHandled);

      const totalLeads = leads.length;
      const totalConverted = leads.filter((l) => l.status === 'Converted').length;
      const overallConversionRate =
        totalLeads > 0 ? Math.round((totalConverted / totalLeads) * 1000) / 10 : 0;

      return {
        data: {
          sourceReport,
          counselorReport,
          totalLeads,
          overallConversionRate,
        },
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error generating reports summary';
      return { data: null, error: msg };
    }
  },

  /**
   * Prepares raw leads dataset for CSV export
   */
  async getLeadsExportData(): Promise<{ headers: string[]; rows: CSVRow[]; count: number }> {
    const { data: leads } = await supabase
      .from('leads')
      .select(`
        *,
        assigned_profile:profiles!assigned_to(id, full_name, role),
        created_profile:profiles!created_by(id, full_name, role)
      `)
      .order('created_at', { ascending: false });

    const headers = [
      'Lead ID',
      'Student Name',
      'Phone Number',
      'Email Address',
      'Course Interest',
      'Acquisition Source',
      'Current Status',
      'Loss Reason',
      'Assigned Counselor',
      'Notes Preview',
      'Created Date',
      'Last Updated',
    ];

    if (!leads || leads.length === 0) {
      return { headers, rows: [], count: 0 };
    }

    const rows: CSVRow[] = leads.map((l) => [
      l.id,
      l.full_name,
      l.phone,
      l.email || '',
      l.course_interest,
      l.source,
      l.status,
      l.loss_reason || '',
      l.assigned_profile?.full_name || 'Unassigned',
      l.notes || '',
      l.created_at,
      l.updated_at,
    ]);

    return { headers, rows, count: rows.length };
  },

  /**
   * Prepares source performance summary for CSV export
   */
  generateSourceCSV(sourceReport: SourceReportItem[]): { headers: string[]; rows: CSVRow[] } {
    const headers = [
      'Source Channel',
      'Total Inquiries',
      'New Leads',
      'Contacted',
      'Qualified',
      'Converted',
      'Lost',
      'Conversion Rate (%)',
    ];

    const rows: CSVRow[] = sourceReport.map((s) => [
      s.source,
      s.totalLeads,
      s.newLeads,
      s.contactedLeads,
      s.qualifiedLeads,
      s.convertedLeads,
      s.lostLeads,
      `${s.conversionRate}%`,
    ]);

    return { headers, rows };
  },

  /**
   * Prepares counselor performance summary for CSV export
   */
  generateCounselorCSV(counselorReport: CounselorReportItem[]): { headers: string[]; rows: CSVRow[] } {
    const headers = [
      'Counselor / Staff Name',
      'Role',
      'Leads Assigned',
      'Leads Converted',
      'Conversion Rate (%)',
      'Total Follow-ups',
      'Completed Follow-ups',
      'Follow-up Completion Rate (%)',
      'Overdue Follow-ups',
    ];

    const rows: CSVRow[] = counselorReport.map((c) => [
      c.counselorName,
      c.role,
      c.leadsHandled,
      c.leadsConverted,
      `${c.conversionRate}%`,
      c.followupsTotal,
      c.followupsCompleted,
      `${c.followupCompletionRate}%`,
      c.overdueFollowups,
    ]);

    return { headers, rows };
  },
};
