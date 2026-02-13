# Virtuoso D365 CRM

A Dynamics 365-style Sales CRM demo application built with Vue 2, Vuex, and Vue Router.

## Features

- **Dashboard** — KPI cards, sales pipeline overview, activity feed, revenue charts
- **Contacts** — Full CRUD for person and company contacts with detail views
- **Opportunities** — Sales opportunity tracking with business process flow and pipeline board
- **Activities** — Calls, emails, meetings, and tasks with due date tracking
- **Sales Documents** — Quotes, orders, and invoices with line items and PDF generation
- **Items / Products** — Product catalog management
- **Campaigns** — Marketing campaign tracking with member management
- **Salespersons** — Sales team management with territory and quota tracking
- **Reports** — Sales analytics and reporting dashboards
- **Recycle Bin** — Soft-delete with restore capability (auto-purge after 30 days)

### UI Features

- D365-inspired header with global "Tell Me" search across all entities
- Collapsible side navigation
- Toast notifications (success, error, warning, info)
- Quick Create panel for rapid record entry
- Keyboard shortcuts (press `?` to view)
- Filter builder, bulk edit, and data grid components
- Responsive layout with Segoe UI / Fluent Design styling

### Authentication

- D365-style login page with hardcoded demo credentials
- Route guards protecting all pages
- Session persistence via localStorage
- **Demo login:** `suhas.r@spotqa.com` / `Virtuoso1!`

## Tech Stack

| Layer       | Technology                  |
|-------------|-----------------------------|
| Framework   | Vue 2.6                     |
| State       | Vuex 3                      |
| Routing     | Vue Router 3 (hash mode)    |
| Styling     | Tailwind CSS 2 + custom CSS |
| Build       | Vue CLI 5 / Webpack         |
| Persistence | localStorage                |

## Getting Started

### Prerequisites

- Node.js 14+
- npm 6+

### Install and Run

```bash
# Install dependencies
npm install

# Start dev server
npm run serve

# Build for production
npm run build

# Lint
npm run lint
```

The dev server runs at `http://localhost:8080` by default.

## Project Structure

```
src/
├── assets/styles/       # Global CSS (d365.css, tailwind.css)
├── components/
│   ├── common/          # Reusable components (DataGrid, AlertContainer, FilterBuilder, etc.)
│   └── layout/          # AppHeader, SideNav, CommandBar
├── data/                # Seed data for all entities
├── directives/          # Custom Vue directives
├── mixins/              # Keyboard shortcuts mixin
├── router/              # Vue Router config with auth guards
├── store/
│   └── modules/         # Vuex modules (auth, contacts, opportunities, sales, ui, etc.)
├── utils/               # PDF generator utility
└── views/               # Page components organized by entity
    ├── activities/
    ├── campaigns/
    ├── contacts/
    ├── items/
    ├── opportunities/
    ├── reports/
    ├── sales/
    └── salespersons/
```

## License

This is a demo application for testing and educational purposes.
