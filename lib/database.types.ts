export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      agents: {
        Row: {
          id: string
          user_id: string | null
          name: string
          email: string
          phone: string | null
          city: string | null
          domain: string | null
          whatsapp_number: string | null
          pin_code: string | null
          theme_color: string | null
          is_active: boolean
          license_status: string
          license_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          email: string
          phone?: string | null
          city?: string | null
          domain?: string | null
          whatsapp_number?: string | null
          pin_code?: string | null
          theme_color?: string | null
          is_active?: boolean
          license_status?: string
          license_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          email?: string
          phone?: string | null
          city?: string | null
          domain?: string | null
          whatsapp_number?: string | null
          pin_code?: string | null
          theme_color?: string | null
          is_active?: boolean
          license_status?: string
          license_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          agent_id: string | null
          name: string
          phone: string
          budget: string | null
          room_count: string | null
          district: string | null
          notes: string | null
          status: string
          source: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agent_id?: string | null
          name: string
          phone: string
          budget?: string | null
          room_count?: string | null
          district?: string | null
          notes?: string | null
          status?: string
          source?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agent_id?: string | null
          name?: string
          phone?: string
          budget?: string | null
          room_count?: string | null
          district?: string | null
          notes?: string | null
          status?: string
          source?: string
          created_at?: string
          updated_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
        }
      }
    }
  }
}
