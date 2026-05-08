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
      admin_config: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      content_categories: {
        Row: {
          activa: boolean
          created_at: string
          descripcion: string | null
          icono: string | null
          id: string
          nombre: string
          slug: string
        }
        Insert: {
          activa?: boolean
          created_at?: string
          descripcion?: string | null
          icono?: string | null
          id?: string
          nombre: string
          slug: string
        }
        Update: {
          activa?: boolean
          created_at?: string
          descripcion?: string | null
          icono?: string | null
          id?: string
          nombre?: string
          slug?: string
        }
        Relationships: []
      }
      content_guidelines: {
        Row: {
          category_id: string | null
          created_at: string
          ejemplos: string | null
          id: string
          instrucciones: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          ejemplos?: string | null
          id?: string
          instrucciones: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          ejemplos?: string | null
          id?: string
          instrucciones?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_guidelines_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      content_posts: {
        Row: {
          category_id: string | null
          contenido: string
          content_type: string
          created_at: string
          created_by: string | null
          estado: string
          fuente: string | null
          id: string
          imagen_url: string | null
          pdf_url: string | null
          published_at: string | null
          resumen: string | null
          scheduled_for: string | null
          titulo: string
          video_url: string | null
        }
        Insert: {
          category_id?: string | null
          contenido: string
          content_type?: string
          created_at?: string
          created_by?: string | null
          estado?: string
          fuente?: string | null
          id?: string
          imagen_url?: string | null
          pdf_url?: string | null
          published_at?: string | null
          resumen?: string | null
          scheduled_for?: string | null
          titulo: string
          video_url?: string | null
        }
        Update: {
          category_id?: string | null
          contenido?: string
          content_type?: string
          created_at?: string
          created_by?: string | null
          estado?: string
          fuente?: string | null
          id?: string
          imagen_url?: string | null
          pdf_url?: string | null
          published_at?: string | null
          resumen?: string | null
          scheduled_for?: string | null
          titulo?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_results: {
        Row: {
          created_at: string
          id: string
          perfil: string
          puntaje_total: number
          respuestas: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          perfil: string
          puntaje_total: number
          respuestas?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          perfil?: string
          puntaje_total?: number
          respuestas?: Json
          user_id?: string
        }
        Relationships: []
      }
      moderation_log: {
        Row: {
          action: string
          created_at: string
          id: string
          post_id: string | null
          reason: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          post_id?: string | null
          reason?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          post_id?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_log_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "wall_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      novedades: {
        Row: {
          contenido: string | null
          created_at: string
          enlace_externo: string | null
          id: string
          imagen_url: string | null
          publicado: boolean
          published_at: string | null
          resumen: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          contenido?: string | null
          created_at?: string
          enlace_externo?: string | null
          id?: string
          imagen_url?: string | null
          publicado?: boolean
          published_at?: string | null
          resumen?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          contenido?: string | null
          created_at?: string
          enlace_externo?: string | null
          id?: string
          imagen_url?: string | null
          publicado?: boolean
          published_at?: string | null
          resumen?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          apellido: string | null
          access_level: Database["public"]["Enums"]["access_level"]
          avatar_url: string | null
          bio: string | null
          birthday: string | null
          cargo: string | null
          created_at: string
          display_name: string | null
          email: string | null
          empresa: string | null
          has_completed_diagnostic: boolean
          id: string
          last_badge_earned: string | null
          last_badge_earned_at: string | null
          linkedin: string | null
          membership_expires_at: string | null
          nickname: string | null
          nombre: string | null
          phone: string | null
          updated_at: string
          user_id: string
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          apellido?: string | null
          access_level?: Database["public"]["Enums"]["access_level"]
          avatar_url?: string | null
          bio?: string | null
          birthday?: string | null
          cargo?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          empresa?: string | null
          has_completed_diagnostic?: boolean
          id?: string
          last_badge_earned?: string | null
          last_badge_earned_at?: string | null
          linkedin?: string | null
          membership_expires_at?: string | null
          nickname?: string | null
          nombre?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          apellido?: string | null
          access_level?: Database["public"]["Enums"]["access_level"]
          avatar_url?: string | null
          bio?: string | null
          birthday?: string | null
          cargo?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          empresa?: string | null
          has_completed_diagnostic?: boolean
          id?: string
          last_badge_earned?: string | null
          last_badge_earned_at?: string | null
          linkedin?: string | null
          membership_expires_at?: string | null
          nickname?: string | null
          nombre?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wall_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_id: string | null
          post_id: string
          status: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id: string
          status?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wall_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "wall_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wall_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "wall_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      wall_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wall_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "wall_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      wall_posts: {
        Row: {
          comments_count: number
          content: string
          created_at: string
          id: string
          likes_count: number
          status: string
          user_id: string
        }
        Insert: {
          comments_count?: number
          content: string
          created_at?: string
          id?: string
          likes_count?: number
          status?: string
          user_id: string
        }
        Update: {
          comments_count?: number
          content?: string
          created_at?: string
          id?: string
          likes_count?: number
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          event_date: string
          location: string | null
          max_attendees: number | null
          min_access_level: Database["public"]["Enums"]["access_level"]
          image_url: string | null
          qr_code: string | null
          status: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          event_date: string
          location?: string | null
          max_attendees?: number | null
          min_access_level?: Database["public"]["Enums"]["access_level"]
          image_url?: string | null
          qr_code?: string | null
          status?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          event_date?: string
          location?: string | null
          max_attendees?: number | null
          min_access_level?: Database["public"]["Enums"]["access_level"]
          image_url?: string | null
          qr_code?: string | null
          status?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          id: string
          event_id: string
          user_id: string
          status: string
          registered_at: string
          attended_at: string | null
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          status?: string
          registered_at?: string
          attended_at?: string | null
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          status?: string
          registered_at?: string
          attended_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          id: string
          user_id: string
          amount: number
          currency: string
          payment_method: string | null
          external_id: string | null
          status: string
          access_level_granted: Database["public"]["Enums"]["access_level"] | null
          period_start: string | null
          period_end: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          currency?: string
          payment_method?: string | null
          external_id?: string | null
          status?: string
          access_level_granted?: Database["public"]["Enums"]["access_level"] | null
          period_start?: string | null
          period_end?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          currency?: string
          payment_method?: string | null
          external_id?: string | null
          status?: string
          access_level_granted?: Database["public"]["Enums"]["access_level"] | null
          period_start?: string | null
          period_end?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      emergencies: {
        Row: {
          id: string
          user_id: string
          message: string | null
          whatsapp_sent: boolean | null
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message?: string | null
          whatsapp_sent?: boolean | null
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message?: string | null
          whatsapp_sent?: boolean | null
          sent_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      business_mirror_tests: {
        Row: {
          id: string
          slug: string
          title: string
          subtitle: string | null
          description: string | null
          category: string
          icon: string | null
          color: string | null
          bg_color: string | null
          min_access_level: Database["public"]["Enums"]["access_level"]
          game_type: string
          time_estimate_min: number | null
          questions: unknown
          scoring_rules: unknown | null
          profiles: unknown | null
          is_active: boolean | null
          sort_order: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          subtitle?: string | null
          description?: string | null
          category: string
          icon?: string | null
          color?: string | null
          bg_color?: string | null
          min_access_level?: Database["public"]["Enums"]["access_level"]
          game_type?: string
          time_estimate_min?: number | null
          questions: unknown
          scoring_rules?: unknown | null
          profiles?: unknown | null
          is_active?: boolean | null
          sort_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          subtitle?: string | null
          description?: string | null
          category?: string
          icon?: string | null
          color?: string | null
          bg_color?: string | null
          min_access_level?: Database["public"]["Enums"]["access_level"]
          game_type?: string
          time_estimate_min?: number | null
          questions?: unknown
          scoring_rules?: unknown | null
          profiles?: unknown | null
          is_active?: boolean | null
          sort_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      business_mirror_results: {
        Row: {
          id: string
          user_id: string
          test_id: string
          answers: unknown
          score: number | null
          profile: string | null
          profile_data: unknown | null
          time_spent_seconds: number | null
          completed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          test_id: string
          answers: unknown
          score?: number | null
          profile?: string | null
          profile_data?: unknown | null
          time_spent_seconds?: number | null
          completed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          test_id?: string
          answers?: unknown
          score?: number | null
          profile?: string | null
          profile_data?: unknown | null
          time_spent_seconds?: number | null
          completed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_mirror_results_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "business_mirror_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          id: string
          user_id: string
          endpoint: string
          keys_p256dh: string
          keys_auth: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          endpoint: string
          keys_p256dh: string
          keys_auth: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          endpoint?: string
          keys_p256dh?: string
          keys_auth?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      crm_clients: {
        Row: {
          id: string
          name: string
          company: string | null
          contact_name: string | null
          segment: string | null
          location: string | null
          province: string | null
          address: string | null
          whatsapp: string | null
          email: string | null
          channel: string | null
          first_contact_date: string | null
          status: string
          notes: string | null
          assigned_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          company?: string | null
          contact_name?: string | null
          segment?: string | null
          location?: string | null
          province?: string | null
          address?: string | null
          whatsapp?: string | null
          email?: string | null
          channel?: string | null
          first_contact_date?: string | null
          status?: string
          notes?: string | null
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          company?: string | null
          contact_name?: string | null
          segment?: string | null
          location?: string | null
          province?: string | null
          address?: string | null
          whatsapp?: string | null
          email?: string | null
          channel?: string | null
          first_contact_date?: string | null
          status?: string
          notes?: string | null
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      crm_products: {
        Row: {
          id: string
          name: string
          category: string | null
          price: number | null
          unit: string
          unit_label: string
          currency: string
          description: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category?: string | null
          price?: number | null
          unit?: string
          unit_label?: string
          currency?: string
          description?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string | null
          price?: number | null
          unit?: string
          unit_label?: string
          currency?: string
          description?: string | null
          active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      crm_interactions: {
        Row: {
          id: string
          client_id: string
          user_id: string
          interaction_date: string
          result: string
          medium: string
          quote_path: string | null
          total_amount: number | null
          currency: string | null
          attachment_url: string | null
          reference_quote_id: string | null
          followup_scenario: string | null
          negotiation_state: string | null
          followup_motive: string | null
          historic_quote_amount: number | null
          historic_quote_date: string | null
          loss_reason: string | null
          estimated_loss: number | null
          next_step: string | null
          follow_up_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          user_id: string
          interaction_date?: string
          result: string
          medium: string
          quote_path?: string | null
          total_amount?: number | null
          currency?: string | null
          attachment_url?: string | null
          reference_quote_id?: string | null
          followup_scenario?: string | null
          negotiation_state?: string | null
          followup_motive?: string | null
          historic_quote_amount?: number | null
          historic_quote_date?: string | null
          loss_reason?: string | null
          estimated_loss?: number | null
          next_step?: string | null
          follow_up_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          user_id?: string
          interaction_date?: string
          result?: string
          medium?: string
          quote_path?: string | null
          total_amount?: number | null
          currency?: string | null
          attachment_url?: string | null
          reference_quote_id?: string | null
          followup_scenario?: string | null
          negotiation_state?: string | null
          followup_motive?: string | null
          historic_quote_amount?: number | null
          historic_quote_date?: string | null
          loss_reason?: string | null
          estimated_loss?: number | null
          next_step?: string | null
          follow_up_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      crm_interaction_lines: {
        Row: {
          id: string
          interaction_id: string
          product_id: string
          quantity: number
          unit_price: number
          line_total: number
        }
        Insert: {
          id?: string
          interaction_id: string
          product_id: string
          quantity: number
          unit_price: number
          line_total: number
        }
        Update: {
          id?: string
          interaction_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          line_total?: number
        }
        Relationships: []
      }
      crm_seller_ranking: {
        Row: {
          user_id: string
          display_name: string
          ventas: number
          ingresos: number
          interactions: number
        }
        Relationships: []
      }
    }
    Views: {
      community_ranking: {
        Row: {
          user_id: string
          display_name: string
          empresa: string
          post_count: number
          comment_count: number
          total_likes_received: number
          activity_score: number
          badge_count: number
        }
        Relationships: []
      }
      mentor_stats: {
        Row: {
          total_users: number
          total_conversations: number
          total_messages: number
          active_users_24h: number
          active_users_7d: number
          avg_messages_per_conversation: number
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      access_level: "N0" | "N1" | "N2" | "ADMIN"
      app_role: "admin" | "moderator" | "user"
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

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      access_level: ["N0", "N1", "N2", "ADMIN"],
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
