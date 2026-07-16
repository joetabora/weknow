import { KalshiMarketCollector } from "@/collectors/kalshi";
import { MockMarketCollector } from "@/collectors/mock";
import type { MarketCollector } from "@/collectors/types";
import {
  formatUnknownError,
  getSupabaseAdminClient,
} from "@/lib/database/supabase-admin";
import { runIngestion } from "@/lib/ingestion/run";

function createCollector(): MarketCollector {
  const source = (process.env.COLLECTOR_SOURCE ?? "mock").trim().toLowerCase();

  if (source === "mock") {
    return new MockMarketCollector();
  }

  if (source === "kalshi") {
    return new KalshiMarketCollector();
  }

  throw new Error(
    `Unknown COLLECTOR_SOURCE="${source}". Use "mock" or "kalshi".`,
  );
}

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

  console.log(`Preflight: HEAD ${origin}`);
  const response = await fetch(origin, { method: "HEAD" });
  console.log(`Preflight status: ${response.status} ${response.statusText}`);
  if (!response.ok) {
    throw new Error(
      `Supabase host responded with ${response.status} ${response.statusText}`,
    );
  }

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

  const source = (process.env.COLLECTOR_SOURCE ?? "mock").trim().toLowerCase();
  console.log(`Using collector source: ${source}`);

  const collector = createCollector();
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
