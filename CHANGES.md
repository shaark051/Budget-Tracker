# Changelog & System Overview

All notable changes and architectural overview for the **@shaarky Event Budget & Expenditure Tracker**.

---

## [Unreleased]

### Performance
- **Analytics calculations & Badge memoization**:
  - Optimized `AnalyticsSummary` calculations into a single-pass `useMemo` loop, reducing iteration complexity from $O(4N)$ to $O(N)$ and eliminating temporary intermediate array allocations.
  - Wrapped `AnalyticsSummary`, `CategoryBadge`, and `StatusBadge` in `React.memo` to prevent unnecessary component re-renders when unrelated parent state updates.

### Fixed
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
