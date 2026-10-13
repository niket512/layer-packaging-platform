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
      access_requests: {
        Row: {
          brand: string
          created_at: string
          email: string
          id: string
          requirement: string
        }
        Insert: {
          brand: string
          created_at?: string
          email: string
          id?: string
          requirement: string
        }
        Update: {
          brand?: string
          created_at?: string
          email?: string
          id?: string
          requirement?: string
        }
        Relationships: []
      }
      catalogue_uploads: {
        Row: {
          created_at: string
          error: string | null
          file_name: string
          file_path: string
          id: string
          owner_id: string
          status: string
          store_id: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          file_name: string
          file_path: string
          id?: string
          owner_id?: string
          status?: string
          store_id: string
        }
        Update: {
          created_at?: string
          error?: string | null
          file_name?: string
          file_path?: string
          id?: string
          owner_id?: string
          status?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalogue_uploads_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      market_products: {
        Row: {
          bbox: Json | null
          capacity: string | null
          category: string | null
          created_at: string
          description: string | null
          dimensions: string | null
          id: string
          image_url: string | null
          material: string | null
          moq: string | null
          name: string
          owner_id: string
          page: number | null
          status: string
          store_id: string
          updated_at: string
          upload_id: string | null
        }
        Insert: {
          bbox?: Json | null
          capacity?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          dimensions?: string | null
          id?: string
          image_url?: string | null
          material?: string | null
          moq?: string | null
          name: string
          owner_id?: string
          page?: number | null
          status?: string
          store_id: string
          updated_at?: string
          upload_id?: string | null
        }
        Update: {
          bbox?: Json | null
          capacity?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          dimensions?: string | null
          id?: string
          image_url?: string | null
          material?: string | null
          moq?: string | null
          name?: string
          owner_id?: string
          page?: number | null
          status?: string
          store_id?: string
          updated_at?: string
          upload_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_products_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "catalogue_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      po_updates: {
        Row: {
          author_id: string | null
          created_at: string
          id: string
          note: string | null
          po_id: string
          status: string | null
        }
        Insert: {
          author_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          po_id: string
          status?: string | null
        }
        Update: {
          author_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          po_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "po_updates_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      purchase_orders: {
        Row: {
          created_at: string
          expected_ship_date: string | null
          id: string
          notes: string | null
          owner_id: string
          po_number: string
          quantity: number | null
          quote_id: string | null
          rfq_id: string | null
          status: string
          supplier_id: string
          title: string
          total: number | null
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          expected_ship_date?: string | null
          id?: string
          notes?: string | null
          owner_id?: string
          po_number: string
          quantity?: number | null
          quote_id?: string | null
          rfq_id?: string | null
          status?: string
          supplier_id: string
          title: string
          total?: number | null
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          expected_ship_date?: string | null
          id?: string
          notes?: string | null
          owner_id?: string
          po_number?: string
          quantity?: number | null
          quote_id?: string | null
          rfq_id?: string | null
          status?: string
          supplier_id?: string
          title?: string
          total?: number | null
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          created_at: string
          id: string
          lead_time_days: number | null
          moq: number | null
          notes: string | null
          rfq_id: string
          status: string
          submitted_by: string | null
          supplier_id: string
          terms: string | null
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          lead_time_days?: number | null
          moq?: number | null
          notes?: string | null
          rfq_id: string
          status?: string
          submitted_by?: string | null
          supplier_id: string
          terms?: string | null
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          lead_time_days?: number | null
          moq?: number | null
          notes?: string | null
          rfq_id?: string
          status?: string
          submitted_by?: string | null
          supplier_id?: string
          terms?: string | null
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      requirement_submissions: {
        Row: {
          contact: string
          created_at: string
          id: string
          images: string[]
          requirement: string
        }
        Insert: {
          contact: string
          created_at?: string
          id?: string
          images?: string[]
          requirement: string
        }
        Update: {
          contact?: string
          created_at?: string
          id?: string
          images?: string[]
          requirement?: string
        }
        Relationships: []
      }
      rfq_invites: {
        Row: {
          created_at: string
          id: string
          rfq_id: string
          supplier_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rfq_id: string
          supplier_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rfq_id?: string
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfq_invites_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_invites_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      rfqs: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          owner_id: string
          quantity: number | null
          specs: string | null
          status: string
          target_price: number | null
          title: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          owner_id?: string
          quantity?: number | null
          specs?: string | null
          status?: string
          target_price?: number | null
          title: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          owner_id?: string
          quantity?: number | null
          specs?: string | null
          status?: string
          target_price?: number | null
          title?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      shortlist_items: {
        Row: {
          brand: string
          created_at: string
          id: string
          item_id: string
          kind: string
        }
        Insert: {
          brand: string
          created_at?: string
          id?: string
          item_id: string
          kind?: string
        }
        Update: {
          brand?: string
          created_at?: string
          id?: string
          item_id?: string
          kind?: string
        }
        Relationships: []
      }
      stores: {
        Row: {
          categories: string | null
          created_at: string
          description: string | null
          id: string
          location: string | null
          name: string
          owner_id: string
          status: string
          updated_at: string
        }
        Insert: {
          categories?: string | null
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          name: string
          owner_id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          categories?: string | null
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          owner_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          category: string | null
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          location: string | null
          name: string
          notes: string | null
          owner_id: string
          phone: string | null
          rating: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          owner_id?: string
          phone?: string | null
          rating?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          owner_id?: string
          phone?: string | null
          rating?: number | null
          updated_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_po: { Args: { _po_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      invited_to_rfq: { Args: { _rfq_id: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      is_supplier_contact: { Args: { _supplier_id: string }; Returns: boolean }
      owns_rfq: { Args: { _rfq_id: string }; Returns: boolean }
      supplier_update_po: {
        Args: { _note: string; _po_id: string; _ship: string; _status: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "founder" | "supplier" | "manufacturer" | "admin"
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
      app_role: ["founder", "supplier", "manufacturer", "admin"],
    },
  },
} as const
