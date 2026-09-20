## 2026-09-18 - Single-Pass Metrics Aggregation with useMemo
**Learning:** `AnalyticsSummary` previously performed multiple array operations (`reduce`, `filter` + `reduce`, `forEach`) on the `expenses` list on every render. Combining metrics accumulation into a single `useMemo` loop cuts iteration complexity from 4N to 1N and eliminates temporary array allocations from `.filter()`.
**Action:** When calculating multiple aggregations across expense items, combine them into a single-pass `useMemo` computation.

## 2026-09-20 - Cache Intl.NumberFormat Instances
**Learning:** `Intl.NumberFormat` constructor overhead is heavy (~800ms vs ~8ms per 10,000 calls). Invoking `new Intl.NumberFormat()` inside inline helper functions during React table and header render cycles introduces significant main-thread latency.
**Action:** Cache `Intl.NumberFormat` instances in a module-level Map by currency code instead of re-instantiating on every format call.
