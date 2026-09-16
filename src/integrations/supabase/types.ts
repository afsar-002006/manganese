export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity: string
          entity_id: string | null
          id: string
          metadata: Json
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
          metadata?: Json
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
          metadata?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      boreholes: {
        Row: {
          borehole_code: string
          created_at: string
          depth_m: number
          id: string
          is_demo: boolean
          lat: number
          lng: number
          location_accuracy: string
          logged_on: string
          mine_id: string
          mn_percent: number
        }
        Insert: {
          borehole_code: string
          created_at?: string
          depth_m: number
          id?: string
          is_demo?: boolean
          lat: number
          lng: number
          location_accuracy?: string
          logged_on: string
          mine_id: string
          mn_percent: number
        }
        Update: {
          borehole_code?: string
          created_at?: string
          depth_m?: number
          id?: string
          is_demo?: boolean
          lat?: number
          lng?: number
          location_accuracy?: string
          logged_on?: string
          mine_id?: string
          mn_percent?: number
        }
        Relationships: [
          {
            foreignKeyName: "boreholes_mine_id_fkey"
            columns: ["mine_id"]
            isOneToOne: false
            referencedRelation: "mines"
            referencedColumns: ["id"]
          },
        ]
      }
      data_uploads: {
        Row: {
          created_at: string
          dataset_type: string
          file_name: string
          file_size_bytes: number
          id: string
          issues: Json
          mime_type: string
          mine_id: string | null
          quality_score: number | null
          row_count: number | null
          storage_path: string
          user_id: string
          validation_status: string
        }
        Insert: {
          created_at?: string
          dataset_type: string
          file_name: string
          file_size_bytes: number
          id?: string
          issues?: Json
          mime_type: string
          mine_id?: string | null
          quality_score?: number | null
          row_count?: number | null
          storage_path: string
          user_id: string
          validation_status?: string
        }
        Update: {
          created_at?: string
          dataset_type?: string
          file_name?: string
          file_size_bytes?: number
          id?: string
          issues?: Json
          mime_type?: string
          mine_id?: string | null
          quality_score?: number | null
          row_count?: number | null
          storage_path?: string
          user_id?: string
          validation_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_uploads_mine_id_fkey"
            columns: ["mine_id"]
            isOneToOne: false
            referencedRelation: "mines"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          asset_code: string
          asset_type: string
          assigned_zone: string | null
          availability_pct: number
          created_at: string
          id: string
          is_demo: boolean
          mine_id: string
          status: string
          utilisation_pct: number
        }
        Insert: {
          asset_code: string
          asset_type: string
          assigned_zone?: string | null
          availability_pct: number
          created_at?: string
          id?: string
          is_demo?: boolean
          mine_id: string
          status: string
          utilisation_pct: number
        }
        Update: {
          asset_code?: string
          asset_type?: string
          assigned_zone?: string | null
          availability_pct?: number
          created_at?: string
          id?: string
          is_demo?: boolean
          mine_id?: string
          status?: string
          utilisation_pct?: number
        }
        Relationships: [
          {
            foreignKeyName: "equipment_mine_id_fkey"
            columns: ["mine_id"]
            isOneToOne: false
            referencedRelation: "mines"
            referencedColumns: ["id"]
          },
        ]
      }
      forecasts: {
        Row: {
          confidence: number
          created_at: string
          id: string
          is_demo: boolean
          mine_id: string
          model_version: string
          period: string
          predicted_tonnes: number
          target_tonnes: number
        }
        Insert: {
          confidence?: number
          created_at?: string
          id?: string
          is_demo?: boolean
          mine_id: string
          model_version?: string
          period: string
          predicted_tonnes: number
          target_tonnes: number
        }
        Update: {
          confidence?: number
          created_at?: string
          id?: string
          is_demo?: boolean
          mine_id?: string
          model_version?: string
          period?: string
          predicted_tonnes?: number
          target_tonnes?: number
        }
        Relationships: [
          {
            foreignKeyName: "forecasts_mine_id_fkey"
            columns: ["mine_id"]
            isOneToOne: false
            referencedRelation: "mines"
            referencedColumns: ["id"]
          },
        ]
      }
      mines: {
        Row: {
          area_sq_km: number
          center_lat: number
          center_lng: number
          code: string
          created_at: string
          district: string
          id: string
          is_demo: boolean
          name: string
          state: string
        }
        Insert: {
          area_sq_km: number
          center_lat: number
          center_lng: number
          code: string
          created_at?: string
          district: string
          id?: string
          is_demo?: boolean
          name: string
          state: string
        }
        Update: {
          area_sq_km?: number
          center_lat?: number
          center_lng?: number
          code?: string
          created_at?: string
          district?: string
          id?: string
          is_demo?: boolean
          name?: string
          state?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          read_at: string | null
          severity: string
          title: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          read_at?: string | null
          severity?: string
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read_at?: string | null
          severity?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      production_records: {
        Row: {
          actual_tonnes: number
          created_at: string
          id: string
          is_demo: boolean
          mine_id: string
          period: string
          target_tonnes: number
        }
        Insert: {
          actual_tonnes: number
          created_at?: string
          id?: string
          is_demo?: boolean
          mine_id: string
          period: string
          target_tonnes: number
        }
        Update: {
          actual_tonnes?: number
          created_at?: string
          id?: string
          is_demo?: boolean
          mine_id?: string
          period?: string
          target_tonnes?: number
        }
        Relationships: [
          {
            foreignKeyName: "production_records_mine_id_fkey"
            columns: ["mine_id"]
            isOneToOne: false
            referencedRelation: "mines"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          org: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          org?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          org?: string | null
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          category: string
          engine_version: string
          generated_at: string
          id: string
          impact: string
          is_demo: boolean
          mine_id: string
          rank: number
          rationale: string
          status: string
          title: string
        }
        Insert: {
          category: string
          engine_version?: string
          generated_at?: string
          id?: string
          impact: string
          is_demo?: boolean
          mine_id: string
          rank: number
          rationale: string
          status?: string
          title: string
        }
        Update: {
          category?: string
          engine_version?: string
          generated_at?: string
          id?: string
          impact?: string
          is_demo?: boolean
          mine_id?: string
          rank?: number
          rationale?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_mine_id_fkey"
            columns: ["mine_id"]
            isOneToOne: false
            referencedRelation: "mines"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          id: string
          mine_id: string
          payload: Json
          period_end: string
          period_start: string
          report_type: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mine_id: string
          payload: Json
          period_end: string
          period_start: string
          report_type: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mine_id?: string
          payload?: Json
          period_end?: string
          period_start?: string
          report_type?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_mine_id_fkey"
            columns: ["mine_id"]
            isOneToOne: false
            referencedRelation: "mines"
            referencedColumns: ["id"]
          },
        ]
      }
      scenario_runs: {
        Row: {
          created_at: string
          id: string
          inputs: Json
          mine_id: string
          name: string
          outputs: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          inputs: Json
          mine_id: string
          name: string
          outputs: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          inputs?: Json
          mine_id?: string
          name?: string
          outputs?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scenario_runs_mine_id_fkey"
            columns: ["mine_id"]
            isOneToOne: false
            referencedRelation: "mines"
            referencedColumns: ["id"]
          },
        ]
      }
      shortfall_drivers: {
        Row: {
          contribution_pct: number
          created_at: string
          factor: string
          id: string
          is_demo: boolean
          mine_id: string
          period: string
        }
        Insert: {
          contribution_pct: number
          created_at?: string
          factor: string
          id?: string
          is_demo?: boolean
          mine_id: string
          period: string
        }
        Update: {
          contribution_pct?: number
          created_at?: string
          factor?: string
          id?: string
          is_demo?: boolean
          mine_id?: string
          period?: string
        }
        Relationships: [
          {
            foreignKeyName: "shortfall_drivers_mine_id_fkey"
            columns: ["mine_id"]
            isOneToOne: false
            referencedRelation: "mines"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weather_records: {
        Row: {
          created_at: string
          id: string
          is_demo: boolean
          is_forecast: boolean
          mine_id: string
          observed_on: string
          rainfall_mm: number
          risk_level: string
          temperature_c: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_demo?: boolean
          is_forecast?: boolean
          mine_id: string
          observed_on: string
          rainfall_mm: number
          risk_level: string
          temperature_c: number
        }
        Update: {
          created_at?: string
          id?: string
          is_demo?: boolean
          is_forecast?: boolean
          mine_id?: string
          observed_on?: string
          rainfall_mm?: number
          risk_level?: string
          temperature_c?: number
        }
        Relationships: [
          {
            foreignKeyName: "weather_records_mine_id_fkey"
            columns: ["mine_id"]
            isOneToOne: false
            referencedRelation: "mines"
            referencedColumns: ["id"]
          },
        ]
      }
      zones: {
        Row: {
          category: string
          centroid_lat: number
          centroid_lng: number
          created_at: string
          id: string
          is_demo: boolean
          label: string
          location_accuracy: string
          mine_id: string
          model_version: string
          polygon: Json
          prospectivity_score: number
        }
        Insert: {
          category: string
          centroid_lat: number
          centroid_lng: number
          created_at?: string
          id?: string
          is_demo?: boolean
          label: string
          location_accuracy?: string
          mine_id: string
          model_version?: string
          polygon: Json
          prospectivity_score: number
        }
        Update: {
          category?: string
          centroid_lat?: number
          centroid_lng?: number
          created_at?: string
          id?: string
          is_demo?: boolean
          label?: string
          location_accuracy?: string
          mine_id?: string
          model_version?: string
          polygon?: Json
          prospectivity_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "zones_mine_id_fkey"
            columns: ["mine_id"]
            isOneToOne: false
            referencedRelation: "mines"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_write: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "analyst" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "analyst", "viewer"],
    },
  },
} as const
