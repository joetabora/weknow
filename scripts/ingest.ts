import { MockMarketCollector } from "@/collectors/mock";
import {
  formatUnknownError,
  getSupabaseAdminClient,
} from "@/lib/database/supabase-admin";
import { runIngestion } from "@/lib/ingestion/run";

async function preflightSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(
    /^["']|["']$/g,
    "",
  );
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !key) {
    throw new Error("Missing Supabase env vars before preflight.");
  }

  const origin = new URL(url).origin;
  const healthUrl = `${origin}/auth/v1/health`;

  console.log(`Preflight: GET ${healthUrl}`);
  const response = await fetch(healthUrl, {
    headers: {
      apikey: key,
    },
  });
  console.log(`Preflight status: ${response.status} ${response.statusText}`);

  // Force client construction so URL/key validation runs early.
  getSupabaseAdminClient();
  console.log("Preflight: Supabase admin client constructed.");
}

async function main() {
  try {
    await preflightSupabase();
  } catch (error) {
    throw new Error(`Supabase preflight failed: ${formatUnknownError(error)}`);
  }

  const collector = new MockMarketCollector();
  const result = await runIngestion(collector);

  console.log(
    `Ingestion complete: fetched=${result.fetched} upserted=${result.upserted} snapshots=${result.snapshots}`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  if (error instanceof Error && error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});
