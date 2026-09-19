## 2025-04-15 - Modal Dialog Keyboard & Overlay Accessibility
**Learning:** Modal overlays rendered using React portals can trap user focus and keyboard interaction if `Escape` key listeners and backdrop click handlers are omitted, leading to frustrating UX for keyboard and screen reader users.
**Action:** Always include a window `keydown` listener for `Escape` to close active modals, backdrop click handlers (`e.target === e.currentTarget`), and standard dialog ARIA roles (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`).
