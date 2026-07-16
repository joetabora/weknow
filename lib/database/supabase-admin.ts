import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import ws from "ws";

import type { Database } from "@/types/database";

let adminClient: SupabaseClient<Database> | undefined;

function normalizeSupabaseUrl(raw: string): string {
  const trimmed = raw.trim().replace(/^["']|["']$/g, "");

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL is not a valid URL: "${raw}". Expected https://YOUR_PROJECT_REF.supabase.co`,
    );
  }

  if (parsed.protocol !== "https:") {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL must use https://. Got: ${parsed.protocol}//${parsed.host}`,
    );
  }

  if (!parsed.hostname.endsWith(".supabase.co")) {
    console.warn(
      `Warning: NEXT_PUBLIC_SUPABASE_URL host is "${parsed.hostname}" (expected *.supabase.co). Continuing anyway.`,
    );
  }

  // Use origin only — no path/query fragments from a copied browser URL.
  return parsed.origin;
}

export function getSupabaseAdminClient(): SupabaseClient<Database> {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!rawUrl || !serviceRoleKey) {
    throw new Error(
      "Supabase admin environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (see .env.example).",
    );
  }

  const url = normalizeSupabaseUrl(rawUrl);

  if (serviceRoleKey.split(".").length !== 3) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY does not look like a JWT (expected three dot-separated segments). Confirm you copied the service_role key, not the anon key truncated.",
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

export function formatUnknownError(error: unknown): string {
  if (!(error instanceof Error)) {
    return String(error);
  }

  const parts = [error.message];
  let current: unknown = error.cause;
  let depth = 0;
  while (current instanceof Error && depth < 5) {
    parts.push(`cause: ${current.message}`);
    if ("code" in current && current.code) {
      parts.push(`code: ${String(current.code)}`);
    }
    current = current.cause;
    depth += 1;
  }

  return parts.join(" | ");
}
