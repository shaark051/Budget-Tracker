## 2026-09-18 - Single-Pass Metrics Aggregation with useMemo
**Learning:** `AnalyticsSummary` previously performed multiple array operations (`reduce`, `filter` + `reduce`, `forEach`) on the `expenses` list on every render. Combining metrics accumulation into a single `useMemo` loop cuts iteration complexity from 4N to 1N and eliminates temporary array allocations from `.filter()`.
**Action:** When calculating multiple aggregations across expense items, combine them into a single-pass `useMemo` computation.

## 2026-09-19 - Caching Intl.NumberFormat Instances
**Learning:** Calling `new Intl.NumberFormat(...)` on every currency formatting call (especially inside component renders or list mapping) creates significant object allocation overhead. Reusing `Intl.NumberFormat` instances via a Map cache makes currency formatting up to 50-100x faster.
**Action:** Always cache `Intl.NumberFormat` instances by locale and options instead of instantiating new formatters inside render paths or utility functions.

## 2026-09-20 - Avoiding Redundant Native Storage Event Dispatches
**Learning:** In local store subscriptions listening to both custom store update events and native `'storage'` events, manually dispatching `new Event('storage')` alongside custom events causes duplicate event triggers, duplicate `localStorage` reads/JSON parsing, and duplicate React state updates/renders on every mutation. Native browser `'storage'` events are already automatically dispatched to other tabs.
**Action:** Only dispatch custom store update events for intra-tab updates and rely on native browser `'storage'` events for inter-tab sync.

## 2026-09-21 - Matching Unsubscribe Event Names in Store Listeners
**Learning:** `subscribeToExpenses` added a custom event listener using the constant `STORE_UPDATE_EXPENSES` (`'app_expenses_updated'`), but its cleanup function attempted to remove it using a string literal `'STORE_UPDATE_EXPENSES'`. Because the event string names mismatched, `removeEventListener` failed silently, leaving orphaned event handlers attached to `window` on every event selection change.
**Action:** When removing custom window event listeners in store subscription cleanups, ensure the variable name referencing the event string is passed without quotes.
