# Event Budget & Expenditure Tracker (@shaarky Design)

An elegant, intuitive budget and expenditure web application inspired by the design philosophies of Apple and Notion.

![Design Preview](https://raw.githubusercontent.com/placeholder/preview.png)

## Features

- **@shaarky Aesthetics**: Clean layout, glassmorphic header, sleek typography, Notion-styled colored badges, and seamless Light/Dark mode.
- **Multi-Event Workspaces**: Easily manage multiple event budgets simultaneously.
- **Real-Time Analytics**: Monitor total budget vs. spent, remaining balance, status counts, and category breakdown progress.
- **Rich Expense Table**:
  - Live search across titles, vendors, and notes.
  - Category and Status filtering.
  - Sorting by date, amount, and item name.
  - CSV Export.
- **Cloudflare Pages & Firebase Ready**:
  - Real-time Firestore sync with public link sharing (no auth required).
  - Built-in Local Storage fallback mode if Firebase environment variables are absent.

## Quick Setup

```bash
# 1. Clone repository & install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build static distribution
npm run build
```

Refer to [`CHANGES.md`](./CHANGES.md) for full deployment instructions on Cloudflare Pages.
