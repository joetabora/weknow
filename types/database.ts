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

export type Database = {
  public: {
    Tables: {
      markets: {
        Row: MarketRow;
        Insert: {
          id?: string;
          external_id: string;
          title: string;
          description?: string | null;
          category: string;
          status: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          external_id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      market_snapshots: {
        Row: MarketSnapshotRow;
        Insert: {
          id?: string;
          market_id: string;
          yes_price: number;
          no_price: number;
          volume: number;
          liquidity: number;
          captured_at?: string;
        };
        Update: {
          id?: string;
          market_id?: string;
          yes_price?: number;
          no_price?: number;
          volume?: number;
          liquidity?: number;
          captured_at?: string;
        };
      };
    };
  };
};
