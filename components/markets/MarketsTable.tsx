import type { Market } from "@/types/market";

type MarketsTableProps = {
  markets: Market[];
};

const volumeFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});

export function MarketsTable({ markets }: MarketsTableProps) {
  return (
    <div className="overflow-x-auto border-y border-slate-200">
      <table className="w-full min-w-[780px] border-collapse text-left">
        <thead>
          <tr className="text-xs uppercase tracking-[0.12em] text-slate-500">
            <th className="py-4 pr-6 font-medium">Market Name</th>
            <th className="px-6 py-4 font-medium">Category</th>
            <th className="px-6 py-4 text-right font-medium">Probability</th>
            <th className="px-6 py-4 text-right font-medium">Volume</th>
            <th className="py-4 pl-6 text-right font-medium">Updated Time</th>
          </tr>
        </thead>
        <tbody>
          {markets.map((market) => (
            <tr
              key={market.name}
              className="border-t border-slate-200 text-sm text-slate-700 transition-colors duration-200 hover:bg-white/70"
            >
              <td className="py-5 pr-6 font-medium text-slate-950">
                {market.name}
              </td>
              <td className="px-6 py-5">{market.category}</td>
              <td className="px-6 py-5 text-right font-mono text-slate-950">
                {market.probability}%
              </td>
              <td className="px-6 py-5 text-right font-mono">
                {volumeFormatter.format(market.volume)}
              </td>
              <td className="py-5 pl-6 text-right font-mono text-xs">
                {timeFormatter.format(new Date(market.updatedAt))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
