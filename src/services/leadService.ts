// ==============================================================================
// BrightPath CRM — Lead Service Layer
// Connects to Supabase PostgREST leads table and handles audit activity logging
// ==============================================================================

import { supabase } from '../lib/supabaseClient';
import type { Lead, LeadStatus, LeadSource } from '../types/database';

export interface LeadFilterOptions {
  search?: string;
  status?: LeadStatus | '';
  source?: LeadSource | '';
  assignedTo?: string;
  sortBy?: 'created_at' | 'full_name' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateLeadPayload {
  full_name: string;
  phone: string;
  email?: string | null;
  course_interest: string;
  source: LeadSource;
  status?: LeadStatus;
  notes?: string | null;
  assigned_to?: string | null;
}

export const leadService = {
  /**
   * Fetch leads with search, filtering, and sorting (scoped by user RLS)
   */
  async getLeads(options: LeadFilterOptions = {}): Promise<{ data: Lead[]; error?: string }> {
    try {
      let query = supabase
        .from('leads')
        .select(`
          *,
          assigned_profile:profiles!assigned_to(id, full_name, role),
          created_profile:profiles!created_by(id, full_name, role)
        `);

      // Search across name, phone, email, course
      if (options.search && options.search.trim()) {
        const term = options.search.trim();
        query = query.or(
          `full_name.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%,course_interest.ilike.%${term}%`
        );
      }

      // Filter by status
      if (options.status) {
        query = query.eq('status', options.status);
      }

      // Filter by source
      if (options.source) {
        query = query.eq('source', options.source);
      }

      // Filter by assignee
      if (options.assignedTo) {
        query = query.eq('assigned_to', options.assignedTo);
      }

      // Sort
      const sortBy = options.sortBy || 'created_at';
      const ascending = options.sortOrder === 'asc';
      query = query.order(sortBy, { ascending });

      const { data, error } = await query;

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: (data as Lead[]) || [] };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching leads';
      return { data: [], error: msg };
    }
  },

  /**
   * Fetch a single lead by UUID
   */
  async getLeadById(id: string): Promise<{ data: Lead | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          assigned_profile:profiles!assigned_to(id, full_name, role),
          created_profile:profiles!created_by(id, full_name, role)
        `)
        .eq('id', id)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data as Lead };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching lead detail';
      return { data: null, error: msg };
    }
  },

  /**
   * Create a new student inquiry & automatically record creation activity
   */
  async createLead(payload: CreateLeadPayload): Promise<{ data: Lead | null; error?: string }> {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = authData.user?.id || null;

      const newLeadData = {
        full_name: payload.full_name.trim(),
        phone: payload.phone.trim(),
        email: payload.email ? payload.email.trim() : null,
        course_interest: payload.course_interest.trim(),
        source: payload.source,
        status: payload.status || 'New',
        notes: payload.notes ? payload.notes.trim() : null,
        assigned_to: payload.assigned_to || currentUserId,
        created_by: currentUserId,
      };

      const { data, error } = await supabase
        .from('leads')
        .insert(newLeadData)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      // Log activity
      if (data) {
        await supabase.from('activities').insert({
          lead_id: data.id,
          actor_id: currentUserId,
          activity_type: 'lead_created',
          description: `Inquiry registered from ${payload.source} for ${payload.course_interest}`,
          metadata: { initial_status: data.status, source: payload.source },
        });
      }

      return { data: data as Lead };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating lead';
      return { data: null, error: msg };
    }
  },

  /**
   * Update lead status (enforces loss_reason constraint when marking Lost)
   */
  async updateLeadStatus(
    id: string,
    newStatus: LeadStatus,
    lossReason?: string,
    oldStatus?: LeadStatus
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (newStatus === 'Lost' && (!lossReason || !lossReason.trim())) {
        return { success: false, error: 'A descriptive loss reason is required when marking an inquiry as Lost.' };
      }

      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = authData.user?.id || null;

      const updateData: { status: LeadStatus; loss_reason: string | null } = {
        status: newStatus,
        loss_reason: newStatus === 'Lost' ? lossReason!.trim() : null,
      };

      const { error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Log status transition in activities
      await supabase.from('activities').insert({
        lead_id: id,
        actor_id: currentUserId,
        activity_type: 'status_changed',
        description: `Status changed from ${oldStatus || 'Previous'} to ${newStatus}${newStatus === 'Lost' ? `: ${lossReason}` : ''}`,
        metadata: { from: oldStatus, to: newStatus, loss_reason: lossReason || null },
      });

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating lead status';
      return { success: false, error: msg };
    }
  },

  /**
   * Update lead contact, notes, or assignment
   */
  async updateLead(id: string, updates: Partial<Lead>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating lead';
      return { success: false, error: msg };
    }
  },
};
