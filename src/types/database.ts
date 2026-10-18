// ==============================================================================
// BrightPath CRM — Database TypeScript Definitions
// Schema version: 20261018000001_initial_schema
// ==============================================================================

export type UserRole = 'admin' | 'manager' | 'counsellor';

export type LeadSource = 
  | 'Website'
  | 'Phone Call'
  | 'WhatsApp'
  | 'Referral'
  | 'Walk-in'
  | 'Other';

export type LeadStatus = 
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Converted'
  | 'Lost';

export type FollowupStatus = 
  | 'pending'
  | 'completed'
  | 'cancelled';

export interface Profile {
  id: string; // References auth.users(id)
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
  course_interest: string;
  source: LeadSource;
  status: LeadStatus;
  loss_reason: string | null;
  assigned_to: string | null;
  created_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined relation fields (optional)
  assigned_profile?: Profile | null;
  created_profile?: Profile | null;
}

export interface FollowUp {
  id: string;
  lead_id: string;
  assigned_to: string | null;
  due_at: string;
  note: string;
  status: FollowupStatus;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
  // Joined relation fields (optional)
  lead?: Lead | null;
  assigned_profile?: Profile | null;
}

export interface Activity {
  id: string;
  lead_id: string;
  actor_id: string | null;
  activity_type: string;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
  // Joined relation fields (optional)
  actor_profile?: Profile | null;
}

// Database typing for Supabase client
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      leads: {
        Row: Lead;
        Insert: Omit<Lead, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Lead, 'id' | 'created_at'>>;
      };
      follow_ups: {
        Row: FollowUp;
        Insert: Omit<FollowUp, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<FollowUp, 'id' | 'created_at'>>;
      };
      activities: {
        Row: Activity;
        Insert: Omit<Activity, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Activity, 'id' | 'created_at'>>;
      };
    };
  };
}
