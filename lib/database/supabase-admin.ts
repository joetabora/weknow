import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import ws from "ws";

import type { Database } from "@/types/database";

let adminClient: SupabaseClient<Database> | undefined;

export function getSupabaseAdminClient(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase admin environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (see .env.example).",
    );
  }

  adminClient ??= createClient<Database>(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    realtime: {
      // Provide an explicit WebSocket impl so Node < 22 (and CI) can create the client.
      transport: ws as unknown as typeof WebSocket,
    },
  });

  return adminClient;
}
