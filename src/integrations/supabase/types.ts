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
          avatar_url: string | null
          cargo: string | null
          created_at: string
          display_name: string | null
          email: string | null
          empresa: string | null
          has_completed_diagnostic: boolean
          id: string
          nombre: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          apellido?: string | null
          avatar_url?: string | null
          cargo?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          empresa?: string | null
          has_completed_diagnostic?: boolean
          id?: string
          nombre?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          apellido?: string | null
          avatar_url?: string | null
          cargo?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          empresa?: string | null
          has_completed_diagnostic?: boolean
          id?: string
          nombre?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
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
    }
    Views: {
      [_ in never]: never
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
