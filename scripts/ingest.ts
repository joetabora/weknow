import { MockMarketCollector } from "@/collectors/mock";
import { runIngestion } from "@/lib/ingestion/run";

async function main() {
  const collector = new MockMarketCollector();
  const result = await runIngestion(collector);

  console.log(
    `Ingestion complete: fetched=${result.fetched} upserted=${result.upserted} snapshots=${result.snapshots}`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
