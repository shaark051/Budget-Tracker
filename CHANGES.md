# Changelog & System Overview

All notable changes and architectural overview for the **Apple x Notion Event Budget & Expenditure Tracker**.

---

## [1.0.0] - 2025-04-15

### Initial Release Features
- 🍏 **Apple x Notion Design System**:
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
