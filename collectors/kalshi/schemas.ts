import { z } from "zod";

/** Documented fixed-point dollar string (e.g. "0.5800"). */
export const fixedPointDollarsSchema = z.string().min(1);

/** Documented fixed-point count string (e.g. "10.00"). */
export const fixedPointCountSchema = z.string().min(1);

export const kalshiMarketStatusSchema = z.enum([
  "initialized",
  "inactive",
  "active",
  "closed",
  "determined",
  "disputed",
  "amended",
  "finalized",
]);

/**
 * Nested Market fields used by this collector.
 * Field names and requirements match the official Get Markets / Market schema.
 */
export const kalshiMarketSchema = z.object({
  ticker: z.string().min(1),
  event_ticker: z.string().min(1),
  yes_sub_title: z.string(),
  status: kalshiMarketStatusSchema,
  yes_bid_dollars: fixedPointDollarsSchema,
  no_bid_dollars: fixedPointDollarsSchema,
  volume_fp: fixedPointCountSchema,
  rules_primary: z.string(),
  title: z.string().optional(),
});

export const kalshiEventSchema = z.object({
  event_ticker: z.string().min(1),
  series_ticker: z.string().min(1),
  title: z.string().min(1),
  markets: z.array(kalshiMarketSchema).optional(),
});

export const getEventsResponseSchema = z.object({
  events: z.array(kalshiEventSchema),
  cursor: z.string(),
});

export const kalshiSeriesSchema = z.object({
  ticker: z.string().min(1),
  category: z.string().min(1),
  title: z.string().optional(),
});

export const getSeriesResponseSchema = z.object({
  series: kalshiSeriesSchema,
});

export type KalshiMarket = z.infer<typeof kalshiMarketSchema>;
export type KalshiEvent = z.infer<typeof kalshiEventSchema>;
export type GetEventsResponse = z.infer<typeof getEventsResponseSchema>;
export type KalshiSeries = z.infer<typeof kalshiSeriesSchema>;
export type GetSeriesResponse = z.infer<typeof getSeriesResponseSchema>;
