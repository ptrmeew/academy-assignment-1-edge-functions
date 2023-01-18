export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      ios_subscription: {
        Row: {
          id: string;
          will_auto_renew: boolean;
          original_transaction_id: string;
          expires_date_ms: string;
          product_id: string | null;
          auto_renew_product_id: string | null;
        };
        Insert: {
          id?: string;
          will_auto_renew: boolean;
          original_transaction_id: string;
          expires_date_ms: string;
          product_id?: string | null;
          auto_renew_product_id?: string | null;
        };
        Update: {
          id?: string;
          will_auto_renew?: boolean;
          original_transaction_id?: string;
          expires_date_ms?: string;
          product_id?: string | null;
          auto_renew_product_id?: string | null;
        };
      };
      permission: {
        Row: {
          id: string;
          name: string;
        };
        Insert: {
          id?: string;
          name: string;
        };
        Update: {
          id?: string;
          name?: string;
        };
      };
      product_description: {
        Row: {
          product_id: string;
        };
        Insert: {
          product_id: string;
        };
        Update: {
          product_id?: string;
        };
      };
      role: {
        Row: {
          id: string;
          name: string;
        };
        Insert: {
          id?: string;
          name: string;
        };
        Update: {
          id?: string;
          name?: string;
        };
      };
      role_permission_junction: {
        Row: {
          role_fk: string;
          permission_fk: string;
        };
        Insert: {
          role_fk: string;
          permission_fk: string;
        };
        Update: {
          role_fk?: string;
          permission_fk?: string;
        };
      };
      subscription_notification: {
        Row: {
          id: string;
          message: string;
          message_sub_type: string | null;
          timestamp: string;
          ios_subscription_fk: string | null;
        };
        Insert: {
          id?: string;
          message: string;
          message_sub_type?: string | null;
          timestamp: string;
          ios_subscription_fk?: string | null;
        };
        Update: {
          id?: string;
          message?: string;
          message_sub_type?: string | null;
          timestamp?: string;
          ios_subscription_fk?: string | null;
        };
      };
      user: {
        Row: {
          id: string;
          auth_fk: string;
          first_name: string;
          last_name: string;
          age: number;
          ios_subscription_fk: string | null;
          subscription_active: boolean;
        };
        Insert: {
          id?: string;
          auth_fk: string;
          first_name: string;
          last_name: string;
          age: number;
          ios_subscription_fk?: string | null;
          subscription_active?: boolean;
        };
        Update: {
          id?: string;
          auth_fk?: string;
          first_name?: string;
          last_name?: string;
          age?: number;
          ios_subscription_fk?: string | null;
          subscription_active?: boolean;
        };
      };
      user_role_junction: {
        Row: {
          user_fk: string;
          role_fk: string;
        };
        Insert: {
          user_fk: string;
          role_fk: string;
        };
        Update: {
          user_fk?: string;
          role_fk?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_id: {
        Args: { p_auth_id: string };
        Returns: string;
      };
      has_permission: {
        Args: { p_permission_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
