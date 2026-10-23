// ==============================================================================
// BrightPath CRM — Activity Service Layer
// Complete audit trail of student enquiry interactions and staff operations
// ==============================================================================

import { supabase } from '../lib/supabaseClient';
import type { Activity } from '../types/database';

export interface LogActivityPayload {
  leadId: string;
  activityType: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export const activityService = {
  /**
   * Fetch chronological activity audit log for a specific student lead
   */
  async getActivitiesByLead(leadId: string, limit = 50): Promise<{ data: Activity[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          actor_profile:profiles!actor_id(id, full_name, role)
        `)
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: (data as Activity[]) || [] };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching lead activities';
      return { data: [], error: msg };
    }
  },

  /**
   * Fetch recent activities across all accessible student leads (for dashboard/audit feed)
   */
  async getRecentActivities(limit = 10): Promise<{ data: (Activity & { lead?: { id: string; full_name: string } })[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          actor_profile:profiles!actor_id(id, full_name, role),
          lead:leads!lead_id(id, full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: (data as (Activity & { lead?: { id: string; full_name: string } })[]) || [] };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching recent activities';
      return { data: [], error: msg };
    }
  },

  /**
   * Log an immutable audit activity event for a student enquiry
   */
  async logActivity(payload: LogActivityPayload): Promise<{ data: Activity | null; error?: string }> {
    try {
      if (!payload.leadId) {
        return { data: null, error: 'leadId is required to record an activity.' };
      }
      if (!payload.description || !payload.description.trim()) {
        return { data: null, error: 'Activity description cannot be empty.' };
      }

      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = authData.user?.id || null;

      const newRecord = {
        lead_id: payload.leadId,
        actor_id: currentUserId,
        activity_type: payload.activityType || 'manual_note',
        description: payload.description.trim(),
        metadata: payload.metadata || {},
      };

      const { data, error } = await supabase
        .from('activities')
        .insert(newRecord)
        .select(`
          *,
          actor_profile:profiles!actor_id(id, full_name, role)
        `)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data as Activity };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error logging activity';
      return { data: null, error: msg };
    }
  },
};
