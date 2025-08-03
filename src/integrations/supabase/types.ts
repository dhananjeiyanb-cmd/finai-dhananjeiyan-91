export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      budget_categories: {
        Row: {
          budget: number | null
          color: string | null
          created_at: string
          icon: string | null
          id: number
          name: string
          spent: number | null
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          budget?: number | null
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: number
          name: string
          spent?: number | null
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          budget?: number | null
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: number
          name?: string
          spent?: number | null
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      form16_history: {
        Row: {
          form16_data: Json
          generated_at: string
          id: string
          tax_information_id: string
          user_id: string
        }
        Insert: {
          form16_data: Json
          generated_at?: string
          id?: string
          tax_information_id: string
          user_id: string
        }
        Update: {
          form16_data?: Json
          generated_at?: string
          id?: string
          tax_information_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "form16_history_tax_information_id_fkey"
            columns: ["tax_information_id"]
            isOneToOne: false
            referencedRelation: "tax_information"
            referencedColumns: ["id"]
          },
        ]
      }
      income_sources: {
        Row: {
          amount: number | null
          created_at: string
          date: string
          id: number
          name: string
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          date: string
          id?: number
          name: string
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          date?: string
          id?: number
          name?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "income_sources_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          amount: number
          auto_pay: boolean | null
          category: string
          created_at: string
          description: string | null
          due_date: string
          frequency: string
          id: string
          status: string
          tenant_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          auto_pay?: boolean | null
          category?: string
          created_at?: string
          description?: string | null
          due_date: string
          frequency?: string
          id?: string
          status?: string
          tenant_id: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          auto_pay?: boolean | null
          category?: string
          created_at?: string
          description?: string | null
          due_date?: string
          frequency?: string
          id?: string
          status?: string
          tenant_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      savings_goals: {
        Row: {
          auto_debit: boolean | null
          created_at: string
          current_amount: number
          description: string | null
          icon: string | null
          id: string
          monthly_contribution: number | null
          priority: string | null
          status: string
          target_amount: number
          target_date: string | null
          tenant_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_debit?: boolean | null
          created_at?: string
          current_amount?: number
          description?: string | null
          icon?: string | null
          id?: string
          monthly_contribution?: number | null
          priority?: string | null
          status?: string
          target_amount?: number
          target_date?: string | null
          tenant_id: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_debit?: boolean | null
          created_at?: string
          current_amount?: number
          description?: string | null
          icon?: string | null
          id?: string
          monthly_contribution?: number | null
          priority?: string | null
          status?: string
          target_amount?: number
          target_date?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tax_information: {
        Row: {
          address: string | null
          basic_salary: number | null
          bonus: number | null
          created_at: string
          employer_address: string | null
          employer_name: string | null
          financial_year: string
          home_loan_interest: number | null
          hra: number | null
          id: string
          lic_premium: number | null
          medical_insurance: number | null
          name: string
          other_allowances: number | null
          other_deductions: number | null
          pan_number: string
          professional_tax: number | null
          provident_fund: number | null
          special_allowance: number | null
          tax_payable: number | null
          tds_deducted: number | null
          total_gross_salary: number | null
          tuition_fees: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          basic_salary?: number | null
          bonus?: number | null
          created_at?: string
          employer_address?: string | null
          employer_name?: string | null
          financial_year: string
          home_loan_interest?: number | null
          hra?: number | null
          id?: string
          lic_premium?: number | null
          medical_insurance?: number | null
          name: string
          other_allowances?: number | null
          other_deductions?: number | null
          pan_number: string
          professional_tax?: number | null
          provident_fund?: number | null
          special_allowance?: number | null
          tax_payable?: number | null
          tds_deducted?: number | null
          total_gross_salary?: number | null
          tuition_fees?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          basic_salary?: number | null
          bonus?: number | null
          created_at?: string
          employer_address?: string | null
          employer_name?: string | null
          financial_year?: string
          home_loan_interest?: number | null
          hra?: number | null
          id?: string
          lic_premium?: number | null
          medical_insurance?: number | null
          name?: string
          other_allowances?: number | null
          other_deductions?: number | null
          pan_number?: string
          professional_tax?: number | null
          provident_fund?: number | null
          special_allowance?: number | null
          tax_payable?: number | null
          tds_deducted?: number | null
          total_gross_salary?: number | null
          tuition_fees?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string
          id: number
          mode: string | null
          status: string | null
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date: string
          description: string
          id?: number
          mode?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: number
          mode?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_tenant_id: {
        Args: { user_name: string }
        Returns: string
      }
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
    Enums: {},
  },
} as const
