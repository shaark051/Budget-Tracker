# Changelog & System Overview

All notable changes and architectural overview for the **@shaarky Event Budget & Expenditure Tracker**.

---

## [Unreleased]

### Features & Vendor Booking Advance Tracking
- **Vendor Advance Payments & Remaining Balance Tracking**:
  - Added support for recording advance/deposit payments on expense items (`advanceAmount`).
  - Added "Advance / Deposit" input field with live remaining balance calculation in the expense item create/edit modal.
  - Displayed inline advance paid and remaining balance due breakdown under amounts in the expense table list view.
  - Updated CSV export to include "Advance Paid" and "Remaining Due" columns for offline vendor reporting.
  - Updated `AnalyticsSummary` card stats to calculate and present total "Advance Paid" and "Remaining Due" across all vendor expenses in real-time.

### Accessibility & Micro-UX
- **Modal Dialog Keyboard & Backdrop Navigation**:
  - Added `Escape` key keyboard listeners to close active modals (`New Event`, `Edit Event`, `New Expense`, `New Category`) and dropdowns.
  - Added backdrop overlay click-to-dismiss behavior for all modal dialogs.
  - Added standard dialog ARIA attributes (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`) to enhance screen reader support.
- **Category Swatch Focus-Visible Indicators**:
  - Added distinct `focus-visible` ring/outline indicators (`focus-visible:ring-2 focus-visible:ring-offset-2`) to category tag color selection buttons in the "Create New Category" modal for improved keyboard accessibility.

### Performance
- **Header memoization & callback stabilization**:
  - Wrapped `Header` in `React.memo` and stabilized `handleAddEvent` in `App.jsx` using `useCallback` to prevent redundant re-renders of the header navigation, modal dialogs, and event switcher dropdown whenever expense items or loading states update in `App`.
- **ExpenseTable memoization & search/sorting key optimization**:
  - Wrapped `ExpenseTable` in `React.memo` to skip redundant re-renders when parent components update state that does not affect table props (e.g. dark mode toggling).
  - Pre-computed sort keys once per item in `useMemo` before sorting, eliminating $O(N \log N)$ redundant string lowercasing and float parsing conversions inside JavaScript's sort comparator.
  - Hoisted `searchQuery` lowercasing outside the `.filter()` loop in `useMemo` to run query normalization once per filter pass instead of up to $3N$ times.
  - Added short-circuit logic (`!query`) to bypass string lowercasing and substring matching for all items when the search input is empty.
- **Category labels Set hoisting**:
  - Hoisted `DEFAULT_CATEGORY_LABELS_SET` to module scope in `src/services/store.js` to avoid re-allocating a `Set` on every category snapshot subscription event.
- **Analytics calculations & Badge memoization**:
  - Optimized `AnalyticsSummary` calculations into a single-pass `useMemo` loop, reducing iteration complexity from $O(4N)$ to $O(N)$ and eliminating temporary intermediate array allocations.
  - Wrapped `AnalyticsSummary`, `CategoryBadge`, and `StatusBadge` in `React.memo` to prevent unnecessary component re-renders when unrelated parent state updates.

### Fixed
- **Category Selection & Default Categories Preservation**:
  - Updated category store subscription to automatically merge `DEFAULT_CATEGORIES` with custom Firestore/Local Storage categories, ensuring default options never disappear from category dropdowns and filter selectors.
- **Vibrant Category Tag Colors**:
  - Enhanced `CategoryBadge` color mapping and added a deterministic fallback hashing algorithm (`VIBRANT_COLOR_CLASSES`) so custom/new categories are always assigned vibrant Notion-style tag colors instead of defaulting to plain gray.
  - Added interactive tag color picker swatches (Blue, Green, Pink, Purple, Orange, Yellow, Brown, Gray) inside the "Create New Category" modal.
- **Modal Positioning**:
  - Used React `createPortal` to render modal dialogs (`New Event`, `Edit Event`, `New Expense`, `New Category`) onto `document.body` to resolve top clipping and overflow issues caused by header CSS stacking contexts.
  - Added max-height constraint (`max-h-[90vh] overflow-y-auto`) to ensure full modal visibility and scrollability on all screens.
- **Cloudflare Wrangler Deployment**:
  - Configured `"not_found_handling": "single-page-application"` in `wrangler.jsonc` to support single-page application route fallback.
  - Removed `public/_redirects` to resolve Cloudflare Wrangler asset validation error (infinite loop check).
  - Updated Node.js version specifications (`.nvmrc`, `.node-version`, and `package.json` engines) to Node.js 22+ to fix Wrangler 4+ engine requirement deployment failures.

---

## [1.0.0] - 2025-04-15

### Initial Release Features
- 🍏 **@shaarky Design System**:
  - Translucent glassmorphism headers and cards with soft drop-shadows (`shadow-apple`).
  - Notion-inspired colored badge pills for categories and payment status tags.
  - Full Light and Dark Mode toggle with automatic system preference detection.
- 📊 **Multi-Event Management**:
  - Create, edit, switch between, and delete multiple event workspaces (e.g. Conferences, Retreats, Galas).
  - Customizable currency (`USD`, `EUR`, `GBP`, `CAD`, `AUD`, `JPY`) and target budget limit.
- 📈 **Real-Time Analytics Summary**:
  - Cards tracking Total Budget, Total Expenditure, Remaining Balance, and Paid vs. Pending totals.
  - Multi-segment progress bar displaying budget utilization.
  - Interactive category spend breakdown chart.
- 📝 **Expense Table & Operations**:
  - Add, edit, and delete expense items with title, category, amount, status, date, vendor, and notes.
  - Instant live search across expense titles, vendor names, and notes.
  - Filtering by Category and Payment Status.
  - Column sorting by Expense name, Amount, or Date.
  - One-click CSV Export (`Export CSV`) for offline reporting.
- ☁️ **Cloudflare Pages & Firebase Firestore Integration**:
  - Real-time synchronization powered by Firebase Firestore collections.
  - Zero Auth requirement (public read/write mode for anyone with the event link).
  - Built-in Local Storage fallback mode when Firebase keys are not provided.

---

## Cloudflare Pages Deployment Instructions

1. **Push to GitHub**:
   Ensure the codebase is pushed to your GitHub repository.

2. **Connect to Cloudflare Pages**:
   - Log into Cloudflare Dashboard -> **Workers & Pages** -> **Create Application** -> **Pages**.
   - Connect your GitHub account and select this repository.

3. **Build Settings**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`

4. **Environment Variables**:
   In Cloudflare Pages settings (or during setup), add the following environment variables:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

---

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
