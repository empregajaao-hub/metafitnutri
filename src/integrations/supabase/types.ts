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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      favorite_recipes: {
        Row: {
          calories: number | null
          carbs_g: number | null
          created_at: string
          difficulty: string | null
          fat_g: number | null
          id: string
          ingredients: string[] | null
          protein_g: number | null
          recipe_description: string | null
          recipe_name: string
          steps: string[] | null
          time_minutes: number | null
          user_id: string
          why_recommended: string | null
        }
        Insert: {
          calories?: number | null
          carbs_g?: number | null
          created_at?: string
          difficulty?: string | null
          fat_g?: number | null
          id?: string
          ingredients?: string[] | null
          protein_g?: number | null
          recipe_description?: string | null
          recipe_name: string
          steps?: string[] | null
          time_minutes?: number | null
          user_id: string
          why_recommended?: string | null
        }
        Update: {
          calories?: number | null
          carbs_g?: number | null
          created_at?: string
          difficulty?: string | null
          fat_g?: number | null
          id?: string
          ingredients?: string[] | null
          protein_g?: number | null
          recipe_description?: string | null
          recipe_name?: string
          steps?: string[] | null
          time_minutes?: number | null
          user_id?: string
          why_recommended?: string | null
        }
        Relationships: []
      }
      meal_analyses: {
        Row: {
          carbs_g: number | null
          confidence: number | null
          created_at: string | null
          estimated_calories: number | null
          fat_g: number | null
          id: string
          image_url: string | null
          portion_size: string | null
          protein_g: number | null
          suggestions: Json | null
          user_id: string
        }
        Insert: {
          carbs_g?: number | null
          confidence?: number | null
          created_at?: string | null
          estimated_calories?: number | null
          fat_g?: number | null
          id?: string
          image_url?: string | null
          portion_size?: string | null
          protein_g?: number | null
          suggestions?: Json | null
          user_id: string
        }
        Update: {
          carbs_g?: number | null
          confidence?: number | null
          created_at?: string | null
          estimated_calories?: number | null
          fat_g?: number | null
          id?: string
          image_url?: string | null
          portion_size?: string | null
          protein_g?: number | null
          suggestions?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          daily_plan: boolean | null
          id: string
          meal_reminders: boolean | null
          motivation: boolean | null
          muscle_gain_tips: boolean | null
          updated_at: string | null
          user_id: string
          water_reminders: boolean | null
          weight_loss_tips: boolean | null
          workout_reminders: boolean | null
        }
        Insert: {
          created_at?: string | null
          daily_plan?: boolean | null
          id?: string
          meal_reminders?: boolean | null
          motivation?: boolean | null
          muscle_gain_tips?: boolean | null
          updated_at?: string | null
          user_id: string
          water_reminders?: boolean | null
          weight_loss_tips?: boolean | null
          workout_reminders?: boolean | null
        }
        Update: {
          created_at?: string | null
          daily_plan?: boolean | null
          id?: string
          meal_reminders?: boolean | null
          motivation?: boolean | null
          muscle_gain_tips?: boolean | null
          updated_at?: string | null
          user_id?: string
          water_reminders?: boolean | null
          weight_loss_tips?: boolean | null
          workout_reminders?: boolean | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read_by: string[] | null
          sent_by: string
          target_audience: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read_by?: string[] | null
          sent_by: string
          target_audience?: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read_by?: string[] | null
          sent_by?: string
          target_audience?: string
          title?: string
        }
        Relationships: []
      }
      Pagamentos: {
        Row: {
          created_at: string | null
          estado: Database["public"]["Enums"]["payment_status"] | null
          "Forma de Pag": string | null
          id: string
          plano: Database["public"]["Enums"]["subscription_plan"]
          receipt_url: string | null
          updated_at: string | null
          user_id: string
          Valor: number
        }
        Insert: {
          created_at?: string | null
          estado?: Database["public"]["Enums"]["payment_status"] | null
          "Forma de Pag"?: string | null
          id?: string
          plano: Database["public"]["Enums"]["subscription_plan"]
          receipt_url?: string | null
          updated_at?: string | null
          user_id: string
          Valor: number
        }
        Update: {
          created_at?: string | null
          estado?: Database["public"]["Enums"]["payment_status"] | null
          "Forma de Pag"?: string | null
          id?: string
          plano?: Database["public"]["Enums"]["subscription_plan"]
          receipt_url?: string | null
          updated_at?: string | null
          user_id?: string
          Valor?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          Altura: number | null
          avatar_url: string | null
          created_at: string | null
          id: string
          Idade: number | null
          "Nivel de Atividade": string | null
          "Nome Completo": string | null
          Objetivo: Database["public"]["Enums"]["goal_type"] | null
          peso: number | null
          updated_at: string | null
        }
        Insert: {
          Altura?: number | null
          avatar_url?: string | null
          created_at?: string | null
          id: string
          Idade?: number | null
          "Nivel de Atividade"?: string | null
          "Nome Completo"?: string | null
          Objetivo?: Database["public"]["Enums"]["goal_type"] | null
          peso?: number | null
          updated_at?: string | null
        }
        Update: {
          Altura?: number | null
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          Idade?: number | null
          "Nivel de Atividade"?: string | null
          "Nome Completo"?: string | null
          Objetivo?: Database["public"]["Enums"]["goal_type"] | null
          peso?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      recipes_generated: {
        Row: {
          calories_per_portion: number | null
          carbs_g: number | null
          created_at: string | null
          difficulty: string | null
          fat_g: number | null
          id: string
          ingredients: string[]
          protein_g: number | null
          steps: string[]
          suitable_for: Database["public"]["Enums"]["goal_type"][] | null
          time_minutes: number | null
          title: string
          user_id: string
        }
        Insert: {
          calories_per_portion?: number | null
          carbs_g?: number | null
          created_at?: string | null
          difficulty?: string | null
          fat_g?: number | null
          id?: string
          ingredients: string[]
          protein_g?: number | null
          steps: string[]
          suitable_for?: Database["public"]["Enums"]["goal_type"][] | null
          time_minutes?: number | null
          title: string
          user_id: string
        }
        Update: {
          calories_per_portion?: number | null
          carbs_g?: number | null
          created_at?: string | null
          difficulty?: string | null
          fat_g?: number | null
          id?: string
          ingredients?: string[]
          protein_g?: number | null
          steps?: string[]
          suitable_for?: Database["public"]["Enums"]["goal_type"][] | null
          time_minutes?: number | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      student_plans: {
        Row: {
          created_at: string
          id: string
          plan_data: Json
          plan_type: string
          student_id: string
          trainer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan_data: Json
          plan_type: string
          student_id: string
          trainer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          plan_data?: Json
          plan_type?: string
          student_id?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_plans_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "trainer_students"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_students: {
        Row: {
          activity_level: string | null
          age: number | null
          created_at: string
          email: string | null
          full_name: string
          goal: string
          height: number | null
          id: string
          notes: string | null
          phone: string | null
          trainer_id: string
          updated_at: string
          weight: number | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          created_at?: string
          email?: string | null
          full_name: string
          goal: string
          height?: number | null
          id?: string
          notes?: string | null
          phone?: string | null
          trainer_id: string
          updated_at?: string
          weight?: number | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          created_at?: string
          email?: string | null
          full_name?: string
          goal?: string
          height?: number | null
          id?: string
          notes?: string | null
          phone?: string | null
          trainer_id?: string
          updated_at?: string
          weight?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          Assinaturas: Database["public"]["Enums"]["payment_status"] | null
          created_at: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          plan: Database["public"]["Enums"]["subscription_plan"] | null
          start_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          Assinaturas?: Database["public"]["Enums"]["payment_status"] | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          plan?: Database["public"]["Enums"]["subscription_plan"] | null
          start_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          Assinaturas?: Database["public"]["Enums"]["payment_status"] | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          plan?: Database["public"]["Enums"]["subscription_plan"] | null
          start_date?: string | null
          updated_at?: string | null
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
      app_role: "admin" | "user"
      goal_type: "lose" | "maintain" | "gain"
      payment_status: "pending" | "approved" | "rejected"
      subscription_plan: "free" | "monthly" | "annual" | "personal_trainer"
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
      app_role: ["admin", "user"],
      goal_type: ["lose", "maintain", "gain"],
      payment_status: ["pending", "approved", "rejected"],
      subscription_plan: ["free", "monthly", "annual", "personal_trainer"],
    },
  },
} as const
