-- Sample research rows for Phase 2 layout/data validation.
-- These are not live market data. Run after schema.sql.

insert into public.markets (name, category, probability, volume, updated_at)
values
  (
    'Will inflation fall below 3% this year?',
    'Economics',
    62,
    148250,
    '2026-07-16T15:12:00.000Z'
  ),
  (
    'Will a major climate bill pass this year?',
    'Policy',
    41,
    86400,
    '2026-07-16T14:48:00.000Z'
  ),
  (
    'Will the next lunar mission launch on schedule?',
    'Science',
    73,
    52750,
    '2026-07-16T13:30:00.000Z'
  );
