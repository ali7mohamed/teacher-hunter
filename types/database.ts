export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      lead_sources: {
        Row: {
          confidence: string | null
          created_at: string
          id: string
          lead_id: string
          source_title: string | null
          source_type: string
          source_url: string | null
        }
        Insert: {
          confidence?: string | null
          created_at?: string
          id?: string
          lead_id: string
          source_title?: string | null
          source_type: string
          source_url?: string | null
        }
        Update: {
          confidence?: string | null
          created_at?: string
          id?: string
          lead_id?: string
          source_title?: string | null
          source_type?: string
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_sources_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_status_history: {
        Row: {
          created_at: string
          id: string
          lead_id: string
          new_status: string
          old_status: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id: string
          new_status: string
          old_status?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string
          new_status?: string
          old_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_status_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          activity_score: number | null
          average_recent_views: number | null
          business_email: string | null
          business_phone: string | null
          business_whatsapp: string | null
          contact_confidence: string | null
          contact_score: number | null
          contact_source_url: string | null
          country: string | null
          created_at: string
          education_level: string | null
          id: string
          last_video_at: string | null
          lead_score: number | null
          name: string | null
          notes: string | null
          score_breakdown: Json
          status: string
          subject: string | null
          subscriber_count: number | null
          teacher_relevance_score: number | null
          thumbnail_opportunity_score: number | null
          total_view_count: number | null
          updated_at: string
          user_id: string
          video_count: number | null
          website_url: string | null
          youtube_channel_id: string
          youtube_description: string | null
          youtube_thumbnail_url: string | null
          youtube_title: string | null
          youtube_url: string | null
        }
        Insert: {
          activity_score?: number | null
          average_recent_views?: number | null
          business_email?: string | null
          business_phone?: string | null
          business_whatsapp?: string | null
          contact_confidence?: string | null
          contact_score?: number | null
          contact_source_url?: string | null
          country?: string | null
          created_at?: string
          education_level?: string | null
          id?: string
          last_video_at?: string | null
          lead_score?: number | null
          name?: string | null
          notes?: string | null
          score_breakdown?: Json
          status?: string
          subject?: string | null
          subscriber_count?: number | null
          teacher_relevance_score?: number | null
          thumbnail_opportunity_score?: number | null
          total_view_count?: number | null
          updated_at?: string
          user_id: string
          video_count?: number | null
          website_url?: string | null
          youtube_channel_id: string
          youtube_description?: string | null
          youtube_thumbnail_url?: string | null
          youtube_title?: string | null
          youtube_url?: string | null
        }
        Update: {
          activity_score?: number | null
          average_recent_views?: number | null
          business_email?: string | null
          business_phone?: string | null
          business_whatsapp?: string | null
          contact_confidence?: string | null
          contact_score?: number | null
          contact_source_url?: string | null
          country?: string | null
          created_at?: string
          education_level?: string | null
          id?: string
          last_video_at?: string | null
          lead_score?: number | null
          name?: string | null
          notes?: string | null
          score_breakdown?: Json
          status?: string
          subject?: string | null
          subscriber_count?: number | null
          teacher_relevance_score?: number | null
          thumbnail_opportunity_score?: number | null
          total_view_count?: number | null
          updated_at?: string
          user_id?: string
          video_count?: number | null
          website_url?: string | null
          youtube_channel_id?: string
          youtube_description?: string | null
          youtube_thumbnail_url?: string | null
          youtube_title?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      searches: {
        Row: {
          created_at: string
          filters: Json
          id: string
          query: string
          results_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json
          id?: string
          query: string
          results_count?: number
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          query?: string
          results_count?: number
          user_id?: string
        }
        Relationships: []
      }
      thumbnail_analysis_cache: {
        Row: {
          analysis: Json
          channel_id: string
          fetched_at: string
          video_ids_hash: string
        }
        Insert: {
          analysis: Json
          channel_id: string
          fetched_at?: string
          video_ids_hash: string
        }
        Update: {
          analysis?: Json
          channel_id?: string
          fetched_at?: string
          video_ids_hash?: string
        }
        Relationships: []
      }
      youtube_channel_cache: {
        Row: {
          channel_id: string
          data: Json
          fetched_at: string
        }
        Insert: {
          channel_id: string
          data: Json
          fetched_at?: string
        }
        Update: {
          channel_id?: string
          data?: Json
          fetched_at?: string
        }
        Relationships: []
      }
      youtube_video_cache: {
        Row: {
          channel_id: string
          fetched_at: string
          videos: Json
        }
        Insert: {
          channel_id: string
          fetched_at?: string
          videos: Json
        }
        Update: {
          channel_id?: string
          fetched_at?: string
          videos?: Json
        }
        Relationships: [
          {
            foreignKeyName: "youtube_video_cache_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: true
            referencedRelation: "youtube_channel_cache"
            referencedColumns: ["channel_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals["public"]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
