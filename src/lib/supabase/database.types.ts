export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          auth_user_id: string;
          name: string | null;
          email: string;
          avatar: string | null;
          currency: string;
          country: string | null;
          language: string;
          timezone: string | null;
          onboarding_complete: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          name?: string | null;
          email: string;
          avatar?: string | null;
          currency?: string;
          country?: string | null;
          language?: string;
          timezone?: string | null;
          onboarding_complete?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string;
          name?: string | null;
          email?: string;
          avatar?: string | null;
          currency?: string;
          country?: string | null;
          language?: string;
          timezone?: string | null;
          onboarding_complete?: boolean;
          updated_at?: string;
        };
      };
      portfolios: {
        Row: {
          id: string;
          profile_id: string;
          name: string;
          description: string | null;
          color: string | null;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          name?: string;
          description?: string | null;
          color?: string | null;
          currency?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          color?: string | null;
          currency?: string;
        };
      };
      assets: {
        Row: {
          id: string;
          portfolio_id: string;
          symbol: string;
          asset_name: string;
          asset_type: string;
          exchange: string | null;
          currency: string;
          logo_url: string | null;
          external_id: string | null;
          notes: string | null;
          color: string | null;
          current_price: number | null;
          price_change_24h: number | null;
          price_change_percent_24h: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          portfolio_id: string;
          symbol: string;
          asset_name: string;
          asset_type: string;
          exchange?: string | null;
          currency?: string;
          logo_url?: string | null;
          external_id?: string | null;
          notes?: string | null;
          color?: string | null;
          current_price?: number | null;
          price_change_24h?: number | null;
          price_change_percent_24h?: number | null;
        };
        Update: {
          symbol?: string;
          asset_name?: string;
          asset_type?: string;
          exchange?: string | null;
          notes?: string | null;
          color?: string | null;
          current_price?: number | null;
          price_change_24h?: number | null;
          price_change_percent_24h?: number | null;
        };
      };
      transactions: {
        Row: {
          id: string;
          asset_id: string;
          transaction_type: string;
          quantity: number;
          price: number;
          fees: number;
          taxes: number;
          date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          asset_id: string;
          transaction_type: string;
          quantity: number;
          price: number;
          fees?: number;
          taxes?: number;
          date: string;
          notes?: string | null;
        };
        Update: {
          transaction_type?: string;
          quantity?: number;
          price?: number;
          fees?: number;
          taxes?: number;
          date?: string;
          notes?: string | null;
        };
      };
      dividends: {
        Row: {
          id: string;
          asset_id: string;
          amount: number;
          date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          asset_id: string;
          amount: number;
          date: string;
          notes?: string | null;
        };
        Update: {
          amount?: number;
          date?: string;
          notes?: string | null;
        };
      };
      watchlist: {
        Row: {
          id: string;
          profile_id: string;
          symbol: string;
          asset_name: string;
          asset_type: string;
          logo_url: string | null;
          external_id: string | null;
          current_price: number | null;
          price_change_24h: number | null;
          price_change_percent_24h: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          symbol: string;
          asset_name: string;
          asset_type?: string;
          logo_url?: string | null;
          external_id?: string | null;
          current_price?: number | null;
        };
        Update: {
          current_price?: number | null;
          price_change_24h?: number | null;
          price_change_percent_24h?: number | null;
        };
      };
      price_alerts: {
        Row: {
          id: string;
          profile_id: string;
          symbol: string;
          target_price: number;
          direction: string;
          enabled: boolean;
          triggered: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          symbol: string;
          target_price: number;
          direction: string;
          enabled?: boolean;
        };
        Update: {
          target_price?: number;
          direction?: string;
          enabled?: boolean;
          triggered?: boolean;
        };
      };
      notes: {
        Row: {
          id: string;
          profile_id: string;
          title: string;
          content: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          title: string;
          content?: string | null;
        };
        Update: {
          title?: string;
          content?: string | null;
        };
      };
      portfolio_snapshots: {
        Row: {
          id: string;
          portfolio_id: string;
          total_value: number;
          invested: number;
          date: string;
        };
        Insert: {
          id?: string;
          portfolio_id: string;
          total_value: number;
          invested: number;
          date?: string;
        };
        Update: {
          total_value?: number;
          invested?: number;
        };
      };
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
