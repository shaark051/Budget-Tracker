## 2025-04-15 - Modal Dialog Keyboard & Overlay Accessibility
**Learning:** Modal overlays rendered using React portals can trap user focus and keyboard interaction if `Escape` key listeners and backdrop click handlers are omitted, leading to frustrating UX for keyboard and screen reader users.
**Action:** Always include a window `keydown` listener for `Escape` to close active modals, backdrop click handlers (`e.target === e.currentTarget`), and standard dialog ARIA roles (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`).

## 2025-05-20 - Actionable Table Empty States
**Learning:** Table components that support multi-field filtering (search, category, status) can leave users stranded with dead-end views when query criteria yield zero matches. Providing a single inline "Clear all filters" call-to-action reduces interaction friction.
**Action:** When filtering yields zero results, differentiate between empty datasets and filtered datasets, providing direct primary actions ("Add Item" vs "Clear Filters") directly within the empty state cell.
