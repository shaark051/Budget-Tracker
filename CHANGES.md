# Changelog & System Overview

All notable changes and architectural overview for the **@shaarky Event Budget & Expenditure Tracker**.

---

## [Unreleased]

### Accessibility & Micro-UX
- **Modal Dialog Keyboard & Backdrop Navigation**:
  - Added `Escape` key keyboard listeners to close active modals (`New Event`, `Edit Event`, `New Expense`, `New Category`) and dropdowns.
  - Added backdrop overlay click-to-dismiss behavior for all modal dialogs.
  - Added standard dialog ARIA attributes (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`) to enhance screen reader support.

### Performance
- **ExpenseTable memoization & search query optimization**:
  - Wrapped `ExpenseTable` in `React.memo` to skip redundant re-renders when parent components update state that does not affect table props (e.g. dark mode toggling).
  - Hoisted `searchQuery` lowercasing outside the `.filter()` loop in `useMemo` to run query normalization once per filter pass instead of up to $3N$ times.
  - Added short-circuit logic (`!query`) to bypass string lowercasing and substring matching for all items when the search input is empty.
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
