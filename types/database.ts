export type MarketRow = {
  id: string;
  external_id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type MarketSnapshotRow = {
  id: string;
  market_id: string;
  yes_price: number;
  no_price: number;
  volume: number;
  liquidity: number;
  captured_at: string;
};

export type MarketInsert = {
  id?: string;
  external_id: string;
  title: string;
  description?: string | null;
  category: string;
  status: string;
  created_at?: string;
  updated_at?: string;
};

export type MarketUpdate = {
  id?: string;
  external_id?: string;
  title?: string;
  description?: string | null;
  category?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
};

export type MarketSnapshotInsert = {
  id?: string;
  market_id: string;
  yes_price: number;
  no_price: number;
  volume: number;
  liquidity: number;
  captured_at?: string;
};

export type MarketSnapshotUpdate = {
  id?: string;
  market_id?: string;
  yes_price?: number;
  no_price?: number;
  volume?: number;
  liquidity?: number;
  captured_at?: string;
};

export type MarketResolutionRow = {
  id: string;
  market_id: string;
  resolved_at: string;
  winning_outcome: "yes" | "no";
  final_yes_price: number;
  final_no_price: number;
  created_at: string;
};

export type MarketResolutionInsert = {
  id?: string;
  market_id: string;
  resolved_at: string;
  winning_outcome: "yes" | "no";
  final_yes_price: number;
  final_no_price: number;
  created_at?: string;
};

export type MarketResolutionUpdate = {
  id?: string;
  market_id?: string;
  resolved_at?: string;
  winning_outcome?: "yes" | "no";
  final_yes_price?: number;
  final_no_price?: number;
  created_at?: string;
};

export type MarketWatchlistRow = {
  id: string;
  user_id: string;
  market_id: string;
  created_at: string;
  notes: string;
};

export type MarketWatchlistInsert = {
  id?: string;
  user_id: string;
  market_id: string;
  created_at?: string;
  notes?: string;
};

export type MarketWatchlistUpdate = {
  id?: string;
  user_id?: string;
  market_id?: string;
  created_at?: string;
  notes?: string;
};

export type MarketJournalEntryRow = {
  id: string;
  market_id: string;
  created_at: string;
  updated_at: string;
  thesis: string;
  confidence_level: "Low" | "Medium" | "High";
  expected_probability: number;
  status: "Open" | "Resolved" | "Archived";
};

export type MarketJournalEntryInsert = {
  id?: string;
  market_id: string;
  created_at?: string;
  updated_at?: string;
  thesis: string;
  confidence_level: "Low" | "Medium" | "High";
  expected_probability: number;
  status?: "Open" | "Resolved" | "Archived";
};

export type MarketJournalEntryUpdate = {
  id?: string;
  market_id?: string;
  created_at?: string;
  updated_at?: string;
  thesis?: string;
  confidence_level?: "Low" | "Medium" | "High";
  expected_probability?: number;
  status?: "Open" | "Resolved" | "Archived";
};

export type Database = {
  public: {
    Tables: {
      markets: {
        Row: MarketRow;
        Insert: MarketInsert;
        Update: MarketUpdate;
        Relationships: [];
      };
      market_snapshots: {
        Row: MarketSnapshotRow;
        Insert: MarketSnapshotInsert;
        Update: MarketSnapshotUpdate;
        Relationships: [
          {
            foreignKeyName: "market_snapshots_market_id_fkey";
            columns: ["market_id"];
            isOneToOne: false;
            referencedRelation: "markets";
            referencedColumns: ["id"];
          },
        ];
      };
      market_resolutions: {
        Row: MarketResolutionRow;
        Insert: MarketResolutionInsert;
        Update: MarketResolutionUpdate;
        Relationships: [
          {
            foreignKeyName: "market_resolutions_market_id_fkey";
            columns: ["market_id"];
            isOneToOne: true;
            referencedRelation: "markets";
            referencedColumns: ["id"];
          },
        ];
      };
      market_watchlist: {
        Row: MarketWatchlistRow;
        Insert: MarketWatchlistInsert;
        Update: MarketWatchlistUpdate;
        Relationships: [
          {
            foreignKeyName: "market_watchlist_market_id_fkey";
            columns: ["market_id"];
            isOneToOne: false;
            referencedRelation: "markets";
            referencedColumns: ["id"];
          },
        ];
      };
      market_journal_entries: {
        Row: MarketJournalEntryRow;
        Insert: MarketJournalEntryInsert;
        Update: MarketJournalEntryUpdate;
        Relationships: [
          {
            foreignKeyName: "market_journal_entries_market_id_fkey";
            columns: ["market_id"];
            isOneToOne: false;
            referencedRelation: "markets";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_market_movers: {
        Args: {
          lookback: string;
          result_limit?: number;
        };
        Returns: {
          market_id: string;
          title: string;
          current_yes_price: number;
          previous_yes_price: number;
          previous_captured_at: string;
          change_abs: number;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
