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
          hero_title: string | null
          hero_subtitle: string | null
          about_text: string | null
          logo_url: string | null
          show_properties: boolean
          show_features: boolean
          show_cta: boolean
          sections_order: Json | null
          custom_sections: Json | null
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
          hero_title?: string | null
          hero_subtitle?: string | null
          about_text?: string | null
          logo_url?: string | null
          show_properties?: boolean
          show_features?: boolean
          show_cta?: boolean
          sections_order?: Json | null
          custom_sections?: Json | null
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
          hero_title?: string | null
          hero_subtitle?: string | null
          about_text?: string | null
          logo_url?: string | null
          show_properties?: boolean
          show_features?: boolean
          show_cta?: boolean
          sections_order?: Json | null
          custom_sections?: Json | null
          is_active?: boolean
          license_status?: string
          license_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      page_sections: {
        Row: {
          id: string
          agent_id: string | null
          section_type: string
          section_order: number
          is_visible: boolean
          props: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agent_id?: string | null
          section_type: string
          section_order?: number
          is_visible?: boolean
          props?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agent_id?: string | null
          section_type?: string
          section_order?: number
          is_visible?: boolean
          props?: Json
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          agent_id: string | null
          title: string
          description: string | null
          price: number | null
          property_type: string | null
          room_count: string | null
          square_meters: number | null
          location: string | null
          district: string | null
          city: string | null
          images: string[] | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agent_id?: string | null
          title: string
          description?: string | null
          price?: number | null
          property_type?: string | null
          room_count?: string | null
          square_meters?: number | null
          location?: string | null
          district?: string | null
          city?: string | null
          images?: string[] | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agent_id?: string | null
          title?: string
          description?: string | null
          price?: number | null
          property_type?: string | null
          room_count?: string | null
          square_meters?: number | null
          location?: string | null
          district?: string | null
          city?: string | null
          images?: string[] | null
          status?: string
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
          email: string | null
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
          email?: string | null
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
          email?: string | null
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
      lead_notes: {
        Row: {
          id: string
          lead_id: string
          agent_id: string | null
          note: string
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          agent_id?: string | null
          note: string
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          agent_id?: string | null
          note?: string
          created_at?: string
        }
      }
    }
  }
}
