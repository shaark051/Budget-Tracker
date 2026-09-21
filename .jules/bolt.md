## 2026-09-18 - Single-Pass Metrics Aggregation with useMemo
**Learning:** `AnalyticsSummary` previously performed multiple array operations (`reduce`, `filter` + `reduce`, `forEach`) on the `expenses` list on every render. Combining metrics accumulation into a single `useMemo` loop cuts iteration complexity from 4N to 1N and eliminates temporary array allocations from `.filter()`.
**Action:** When calculating multiple aggregations across expense items, combine them into a single-pass `useMemo` computation.

## 2026-09-19 - Caching Intl.NumberFormat Instances
**Learning:** Calling `new Intl.NumberFormat(...)` on every currency formatting call (especially inside component renders or list mapping) creates significant object allocation overhead. Reusing `Intl.NumberFormat` instances via a Map cache makes currency formatting up to 50-100x faster.
**Action:** Always cache `Intl.NumberFormat` instances by locale and options instead of instantiating new formatters inside render paths or utility functions.
