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
      doubts: {
        Row: {
          ai_answer: string | null
          answered_at: string | null
          created_at: string
          id: string
          question: string
          status: Database["public"]["Enums"]["doubt_status"]
          student_id: string
          subject: string
          teacher_answer: string | null
          teacher_id: string | null
        }
        Insert: {
          ai_answer?: string | null
          answered_at?: string | null
          created_at?: string
          id?: string
          question: string
          status?: Database["public"]["Enums"]["doubt_status"]
          student_id: string
          subject: string
          teacher_answer?: string | null
          teacher_id?: string | null
        }
        Update: {
          ai_answer?: string | null
          answered_at?: string | null
          created_at?: string
          id?: string
          question?: string
          status?: Database["public"]["Enums"]["doubt_status"]
          student_id?: string
          subject?: string
          teacher_answer?: string | null
          teacher_id?: string | null
        }
        Relationships: []
      }
      exam_attempts: {
        Row: {
          answers: Json
          concept_scores: Json
          correct_count: number
          exam_id: string
          id: string
          score: number
          student_id: string
          submitted_at: string
          total_count: number
        }
        Insert: {
          answers?: Json
          concept_scores?: Json
          correct_count?: number
          exam_id: string
          id?: string
          score?: number
          student_id: string
          submitted_at?: string
          total_count?: number
        }
        Update: {
          answers?: Json
          concept_scores?: Json
          correct_count?: number
          exam_id?: string
          id?: string
          score?: number
          student_id?: string
          submitted_at?: string
          total_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_questions: {
        Row: {
          concept: string | null
          correct_key: string
          exam_id: string
          explanation: string | null
          id: string
          options: Json
          position: number
          prompt: string
        }
        Insert: {
          concept?: string | null
          correct_key: string
          exam_id: string
          explanation?: string | null
          id?: string
          options: Json
          position?: number
          prompt: string
        }
        Update: {
          concept?: string | null
          correct_key?: string
          exam_id?: string
          explanation?: string | null
          id?: string
          options?: Json
          position?: number
          prompt?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          class_name: string
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          published: boolean
          subject: string
          teacher_id: string
          title: string
        }
        Insert: {
          class_name: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          published?: boolean
          subject: string
          teacher_id: string
          title: string
        }
        Update: {
          class_name?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          published?: boolean
          subject?: string
          teacher_id?: string
          title?: string
        }
        Relationships: []
      }
      leaves: {
        Row: {
          created_at: string
          decided_at: string | null
          decided_by: string | null
          from_date: string
          id: string
          reason: string
          status: Database["public"]["Enums"]["leave_status"]
          teacher_id: string
          to_date: string
        }
        Insert: {
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          from_date: string
          id?: string
          reason: string
          status?: Database["public"]["Enums"]["leave_status"]
          teacher_id: string
          to_date: string
        }
        Update: {
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          from_date?: string
          id?: string
          reason?: string
          status?: Database["public"]["Enums"]["leave_status"]
          teacher_id?: string
          to_date?: string
        }
        Relationships: []
      }
      materials: {
        Row: {
          class_name: string | null
          created_at: string
          file_size: number | null
          id: string
          material_type: Database["public"]["Enums"]["material_type"]
          mime_type: string | null
          session_id: string | null
          storage_path: string
          subject: string | null
          title: string
          uploaded_by: string
        }
        Insert: {
          class_name?: string | null
          created_at?: string
          file_size?: number | null
          id?: string
          material_type?: Database["public"]["Enums"]["material_type"]
          mime_type?: string | null
          session_id?: string | null
          storage_path: string
          subject?: string | null
          title: string
          uploaded_by: string
        }
        Update: {
          class_name?: string | null
          created_at?: string
          file_size?: number | null
          id?: string
          material_type?: Database["public"]["Enums"]["material_type"]
          mime_type?: string | null
          session_id?: string | null
          storage_path?: string
          subject?: string | null
          title?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "materials_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          class_name: string | null
          created_at: string
          department: string | null
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          class_name?: string | null
          created_at?: string
          department?: string | null
          full_name?: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          class_name?: string | null
          created_at?: string
          department?: string | null
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          class_name: string
          created_at: string
          end_time: string
          id: string
          learning_outcomes: string | null
          lesson_plan: string | null
          lesson_topics: string | null
          session_date: string
          start_time: string
          status: Database["public"]["Enums"]["session_status"]
          subject: string
          teacher_id: string
          teaching_method: string | null
          title: string
        }
        Insert: {
          class_name: string
          created_at?: string
          end_time: string
          id?: string
          learning_outcomes?: string | null
          lesson_plan?: string | null
          lesson_topics?: string | null
          session_date: string
          start_time: string
          status?: Database["public"]["Enums"]["session_status"]
          subject: string
          teacher_id: string
          teaching_method?: string | null
          title: string
        }
        Update: {
          class_name?: string
          created_at?: string
          end_time?: string
          id?: string
          learning_outcomes?: string | null
          lesson_plan?: string | null
          lesson_topics?: string | null
          session_date?: string
          start_time?: string
          status?: Database["public"]["Enums"]["session_status"]
          subject?: string
          teacher_id?: string
          teaching_method?: string | null
          title?: string
        }
        Relationships: []
      }
      teachers: {
        Row: {
          active: boolean
          employee_code: string | null
          joined_at: string
          subject: string
          user_id: string
        }
        Insert: {
          active?: boolean
          employee_code?: string | null
          joined_at?: string
          subject?: string
          user_id: string
        }
        Update: {
          active?: boolean
          employee_code?: string | null
          joined_at?: string
          subject?: string
          user_id?: string
        }
        Relationships: []
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
          role: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "teacher" | "student"
      doubt_status:
        | "ai_answered"
        | "escalated"
        | "teacher_answered"
        | "resolved"
      leave_status: "pending" | "approved" | "rejected"
      material_type:
        | "lecture_slides"
        | "notes"
        | "ppt"
        | "pdf"
        | "reference"
        | "lesson_plan"
        | "outcomes"
      session_status: "scheduled" | "completed" | "cancelled"
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
      app_role: ["admin", "teacher", "student"],
      doubt_status: [
        "ai_answered",
        "escalated",
        "teacher_answered",
        "resolved",
      ],
      leave_status: ["pending", "approved", "rejected"],
      material_type: [
        "lecture_slides",
        "notes",
        "ppt",
        "pdf",
        "reference",
        "lesson_plan",
        "outcomes",
      ],
      session_status: ["scheduled", "completed", "cancelled"],
    },
  },
} as const
