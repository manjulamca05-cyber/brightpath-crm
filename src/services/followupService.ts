// ==============================================================================
// BrightPath CRM — Follow-up Service Layer
// Strict overdue calculations, reminder scheduling, and activity audit logging
// ==============================================================================

import { supabase } from '../lib/supabaseClient';
import type { FollowUp, FollowupStatus } from '../types/database';
import { formatDateTime } from '../utils/dateUtils';

export interface FollowupFilterOptions {
  leadId?: string;
  tab?: 'overdue' | 'upcoming' | 'completed' | 'all';
  assignedTo?: string;
  search?: string;
}

export interface CreateFollowupPayload {
  lead_id: string;
  due_at: string;
  note: string;
  assigned_to?: string | null;
}

export interface FollowupCounts {
  overdue: number;
  upcoming: number;
  completed: number;
  total: number;
}

export const followupService = {
  /**
   * Fetch follow-ups with joined Lead and Assignee Profile data
   */
  async getFollowups(options: FollowupFilterOptions = {}): Promise<{ data: FollowUp[]; error?: string }> {
    try {
      let query = supabase
        .from('follow_ups')
        .select(`
          *,
          lead:leads!lead_id(id, full_name, phone, email, course_interest, status, source),
          assigned_profile:profiles!assigned_to(id, full_name, role)
        `);

      // Filter by specific lead if requested
      if (options.leadId) {
        query = query.eq('lead_id', options.leadId);
      }

      // Filter by assignee
      if (options.assignedTo) {
        query = query.eq('assigned_to', options.assignedTo);
      }

      const nowIso = new Date().toISOString();

      // Tab filtering with strict date math
      if (options.tab === 'overdue') {
        query = query
          .eq('status', 'pending')
          .lt('due_at', nowIso)
          .order('due_at', { ascending: true }); // Most overdue first
      } else if (options.tab === 'upcoming') {
        query = query
          .eq('status', 'pending')
          .gte('due_at', nowIso)
          .order('due_at', { ascending: true }); // Soonest upcoming first
      } else if (options.tab === 'completed') {
        query = query
          .eq('status', 'completed')
          .order('completed_at', { ascending: false });
      } else {
        // 'all' tab or default
        query = query.order('due_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        return { data: [], error: error.message };
      }

      let results = (data as FollowUp[]) || [];

      // Client-side text search across lead name, phone, course, or followup note
      if (options.search && options.search.trim()) {
        const term = options.search.trim().toLowerCase();
        results = results.filter((fu) => {
          const leadMatch =
            fu.lead?.full_name?.toLowerCase().includes(term) ||
            fu.lead?.phone?.toLowerCase().includes(term) ||
            fu.lead?.course_interest?.toLowerCase().includes(term);
          const noteMatch = fu.note?.toLowerCase().includes(term);
          return leadMatch || noteMatch;
        });
      }

      return { data: results };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching follow-ups';
      return { data: [], error: msg };
    }
  },

  /**
   * Fetch aggregate counts for Overdue, Upcoming, Completed, and Total
   */
  async getFollowupCounts(leadId?: string): Promise<FollowupCounts> {
    try {
      let query = supabase.from('follow_ups').select('id, status, due_at');

      if (leadId) {
        query = query.eq('lead_id', leadId);
      }

      const { data, error } = await query;

      if (error || !data) {
        return { overdue: 0, upcoming: 0, completed: 0, total: 0 };
      }

      const now = Date.now();
      let overdue = 0;
      let upcoming = 0;
      let completed = 0;

      for (const item of data) {
        if (item.status === 'completed') {
          completed++;
        } else if (item.status === 'pending') {
          const dueMs = new Date(item.due_at).getTime();
          if (dueMs < now) {
            overdue++;
          } else {
            upcoming++;
          }
        }
      }

      return {
        overdue,
        upcoming,
        completed,
        total: data.length,
      };
    } catch {
      return { overdue: 0, upcoming: 0, completed: 0, total: 0 };
    }
  },

  /**
   * Schedule a new follow-up & automatically record activity audit log
   */
  async createFollowup(payload: CreateFollowupPayload): Promise<{ data: FollowUp | null; error?: string }> {
    try {
      if (!payload.lead_id) {
        return { data: null, error: 'A lead must be selected for the follow-up.' };
      }
      if (!payload.note || !payload.note.trim()) {
        return { data: null, error: 'Follow-up objective / note is required.' };
      }
      if (!payload.due_at) {
        return { data: null, error: 'Due date and time is required.' };
      }

      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = authData.user?.id || null;

      const newRecord = {
        lead_id: payload.lead_id,
        due_at: new Date(payload.due_at).toISOString(),
        note: payload.note.trim(),
        status: 'pending' as FollowupStatus,
        assigned_to: payload.assigned_to || currentUserId,
        created_by: currentUserId,
      };

      const { data, error } = await supabase
        .from('follow_ups')
        .insert(newRecord)
        .select(`
          *,
          lead:leads!lead_id(id, full_name, phone, email, course_interest, status, source),
          assigned_profile:profiles!assigned_to(id, full_name, role)
        `)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      // Automatically log audit activity
      if (data) {
        await supabase.from('activities').insert({
          lead_id: payload.lead_id,
          actor_id: currentUserId,
          activity_type: 'followup_scheduled',
          description: `Follow-up scheduled for ${formatDateTime(data.due_at)}: "${payload.note.trim()}"`,
          metadata: { followup_id: data.id, due_at: data.due_at },
        });
      }

      return { data: data as FollowUp };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating follow-up';
      return { data: null, error: msg };
    }
  },

  /**
   * Mark a follow-up complete, record completed_at timestamp, and log activity
   */
  async completeFollowup(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = authData.user?.id || null;
      const completedAt = new Date().toISOString();

      // 1. Update the follow-up status
      const { data, error } = await supabase
        .from('follow_ups')
        .update({
          status: 'completed',
          completed_at: completedAt,
        })
        .eq('id', id)
        .select('id, lead_id, note')
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // 2. Automatically log audit activity for completion
      if (data) {
        await supabase.from('activities').insert({
          lead_id: data.lead_id,
          actor_id: currentUserId,
          activity_type: 'followup_completed',
          description: `Follow-up marked completed: "${data.note}"`,
          metadata: { followup_id: data.id, completed_at: completedAt },
        });
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error completing follow-up';
      return { success: false, error: msg };
    }
  },

  /**
   * Cancel a scheduled follow-up
   */
  async cancelFollowup(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = authData.user?.id || null;

      const { data, error } = await supabase
        .from('follow_ups')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select('id, lead_id, note')
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      if (data) {
        await supabase.from('activities').insert({
          lead_id: data.lead_id,
          actor_id: currentUserId,
          activity_type: 'followup_cancelled',
          description: `Follow-up cancelled: "${data.note}"`,
          metadata: { followup_id: data.id },
        });
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error cancelling follow-up';
      return { success: false, error: msg };
    }
  },
};
