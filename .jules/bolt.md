## 2026-09-18 - Single-Pass Metrics Aggregation with useMemo
**Learning:** `AnalyticsSummary` previously performed multiple array operations (`reduce`, `filter` + `reduce`, `forEach`) on the `expenses` list on every render. Combining metrics accumulation into a single `useMemo` loop cuts iteration complexity from 4N to 1N and eliminates temporary array allocations from `.filter()`.
**Action:** When calculating multiple aggregations across expense items, combine them into a single-pass `useMemo` computation.

## 2026-09-19 - Caching Intl.NumberFormat Instances
**Learning:** Calling `new Intl.NumberFormat(...)` on every currency formatting call (especially inside component renders or list mapping) creates significant object allocation overhead. Reusing `Intl.NumberFormat` instances via a Map cache makes currency formatting up to 50-100x faster.
**Action:** Always cache `Intl.NumberFormat` instances by locale and options instead of instantiating new formatters inside render paths or utility functions.

## 2026-09-20 - Avoiding Redundant Native Storage Event Dispatches
**Learning:** In local store subscriptions listening to both custom store update events and native `'storage'` events, manually dispatching `new Event('storage')` alongside custom events causes duplicate event triggers, duplicate `localStorage` reads/JSON parsing, and duplicate React state updates/renders on every mutation. Native browser `'storage'` events are already automatically dispatched to other tabs.
**Action:** Only dispatch custom store update events for intra-tab updates and rely on native browser `'storage'` events for inter-tab sync.

## 2026-09-21 - Table Row Memoization & Allocation-Free Direct Sorting
**Learning:** Rendering complex table rows inline causes every modal state change or keystroke in form inputs to re-evaluate and re-render all table rows in the list. Extracting rows into a `React.memo` component (`ExpenseRow`) with stable `useCallback` handlers allows React to completely skip unchanged row subtrees. Furthermore, sorting directly via comparators avoids allocating intermediate `{ exp, key }` wrapper objects and extra array mappings on every sort or filter execution.
**Action:** Extract list item rows into `React.memo` components with stable callbacks, and use direct comparator sorting to eliminate temporary object wrapper allocations during list filter/sort passes.
