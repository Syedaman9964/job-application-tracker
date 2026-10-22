# JobTrack — Personal Job Application & Pipeline Manager

> A local-first, privacy-focused SaaS-style job search tracker built with React 19, Vite, Recharts, and custom Vanilla CSS.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Netlify-success?style=flat&logo=netlify)](https://silly-cobbler-3a5f27.netlify.app)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-purple?style=flat&logo=vite)](https://vite.dev/)
[![Vitest](https://img.shields.io/badge/Tests-Vitest_Passing-brightgreen?style=flat&logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-lightgrey)](./LICENSE)

---

## 🌐 Live Demo & Repository

- **Live Application:** [https://silly-cobbler-3a5f27.netlify.app](https://silly-cobbler-3a5f27.netlify.app)
- **GitHub Repository:** [https://github.com/Syedaman9964/job-application-tracker](https://github.com/Syedaman9964/job-application-tracker)

---

## 💡 Overview

Searching for software engineering opportunities involves juggling dozens of concurrent applications, interview rounds, recruiter follow-ups, and salary negotiations. Most spreadsheet trackers are clunky on mobile and lack actionable deadline alerts, while third-party SaaS platforms often sell user data or require monthly subscriptions.

**JobTrack** is designed as a thoughtfully crafted, personal command center for tech job seekers:
- **Local-First & 100% Private:** Your job search details, targets, interview schedules, and compensation notes are saved directly in your browser's local storage and never leave your device.
- **Restrained Editorial Aesthetic:** Tailored with a warm ivory background (`#f8f7f2`), crisp charcoal typography, and subtle muted olive green accents (`#5d6b42`), avoiding generic templates and noisy gradient dashboards.
- **Zero-Friction Dual Views:** Seamlessly switch between a high-density directory table and a Kanban pipeline board without losing your active filters or context.

---

## ✨ Verified Feature Tour

### 1. 📊 Real-Time Career Dashboard
- **True Calculated KPIs:** Total Applications, Active in Pipeline (`Applied` + `Interview`), Scheduled Interviews, and Offers Received.
- **Conversion Analytics:** Accurately computes interview conversion rates from active records without fabricating numbers.
- **Personal Weekly Target Tracker:** Configurable weekly application goal with an automated progress bar reflecting actual submissions within the calendar week.
- **Visual Analytics:** Interactive Recharts Donut chart displaying stage distribution with central counter, plus a responsive stage comparison Bar chart.
- **Urgent Actions & Deadlines:** Live widget summarizing overdue tasks, today's actions, and interviews scheduled within the next 7 days.
- **Recent Submissions:** Quick-access feed showing the latest opportunities added to the pipeline.

### 2. 📋 Applications Directory (Table View)
- **Deep Search:** Instant fuzzy searching across company name, role, location, and personal notes.
- **Multi-Faceted Filtering:** Filter by pipeline stage (`Wishlist`, `Applied`, `Interview`, `Offer`, `Rejected`) and employment type (`Full-time`, `Internship`, `Contract`, `Part-time`).
- **Flexible Sorting:** Sort by newest applied, oldest applied, company name (A-Z, Z-A), or stage.
- **Pagination & Ergonomics:** Fast client-side pagination with clear result counts and quick stage dropdowns per row.
- **Accessible Action Controls:** Inspect details, edit fields, or delete records with accessible confirmation dialogs.

### 3. 📌 Pipeline Board (Kanban View)
- **5 Distinct Stages:** `Wishlist` ➔ `Applied` ➔ `Interview` ➔ `Offer` ➔ `Rejected`.
- **Drag-and-Drop & Dropdowns:** Support for native HTML5 drag-and-drop between columns, complemented by accessible stage-selection dropdowns on every card.
- **Rich Card Metadata:** Displays company avatar, role, location tags, compensation range, and date applied.
- **Column-Level Actions:** One-click quick creation directly into any selected stage.

### 4. ⏰ Follow-ups & Action Items Hub
- **Unified Timeline:** Aggregates all recruiter follow-up dates and scheduled interview rounds in one dedicated view.
- **Status Filters:** Instant filters for Active Tasks, Due This Week, Overdue Actions, Interview Rounds, and Completed Tasks.
- **Interactive Checkboxes:** Toggle task completion with automated timestamp updates.
- **Interview Highlights:** Distinct visual badges for upcoming technical, system design, or HR rounds.

### 5. 🔒 Data Safety, Privacy & Portability
- **JSON Backup:** Download a full timestamped JSON backup (`jobtrack-backup-YYYY-MM-DD.json`) anytime.
- **Safe JSON Restore:** Validates file structure, previews record counts, and allows choosing between **"Merge with existing"** (deduplicating by company and role) or **"Replace all"**.
- **RFC-4180 CSV Export:** Exports a clean, spreadsheet-ready CSV compatible with Excel, Google Sheets, and Apple Numbers.
- **Storage Meter:** Displays actual kilobytes consumed in the browser against standard localStorage quotas.
- **100% Backward Compatible:** Safely loads legacy application records without data corruption or loss.

---

## 🛠️ Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | [React 19](https://react.dev/) | Modern component architecture, functional hooks, and high rendering efficiency. |
| **Build Tool** | [Vite 8](https://vite.dev/) | Instant hot module replacement (HMR) and optimized rollup production bundles. |
| **Styling** | Custom Vanilla CSS | 100% control over design tokens, responsive breakpoints, accessible focus rings, and zero bundle bloat. |
| **Charts** | [Recharts](https://recharts.org/) | Responsive SVG charts (Pie/Donut and Bar) styled to match the editorial palette. |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, consistent, lightweight stroke iconography. |
| **Testing** | [Vitest](https://vitest.dev/) | Ultra-fast unit testing for storage migrations, date arithmetic, and CSV generation. |
| **Linter** | [Oxlint](https://oxc.rs/) | High-speed Rust-based static code analysis ensuring React purity and clean code standards. |
| **Deployment** | [Netlify](https://www.netlify.com/) | Continuous deployment linked directly to GitHub `main` branch. |

---

## 🏗️ Architecture & Project Structure

```text
job-application-tracker/
├── .planning/                       # GSD Spec-driven development documentation
│   ├── PROJECT.md                   # Vision and constraints
│   ├── ROADMAP.md                   # Multi-phase milestones
│   └── STATE.md                     # Current project state
├── public/                          # Static assets and favicons
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── components/
│   │   ├── applications/            # Directory table, add/edit form, details modal
│   │   │   ├── ApplicationDetailModal.jsx
│   │   │   ├── ApplicationFormModal.jsx
│   │   │   └── ApplicationsTable.jsx
│   │   ├── common/                  # Shared accessible primitives
│   │   │   ├── Badge.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Toast.jsx
│   │   ├── dashboard/               # KPI cards, charts, urgent actions widget
│   │   │   └── DashboardView.jsx
│   │   ├── data/                    # Storage meter, JSON backup/restore, CSV export
│   │   │   └── DataSafetyHub.jsx
│   │   ├── followups/               # Tasks, reminders, interview schedule
│   │   │   └── FollowUpHub.jsx
│   │   ├── kanban/                  # Pipeline board, columns, and cards
│   │   │   └── KanbanBoard.jsx
│   │   ├── layout/                  # Responsive sidebar and app header
│   │   │   ├── Header.jsx
│   │   │   └── Sidebar.jsx
│   │   └── settings/                # Preferences and portfolio about section
│   │       └── SettingsView.jsx
│   ├── utils/
│   │   ├── __tests__/               # Automated unit tests
│   │   │   ├── date.test.js
│   │   │   └── storage.test.js
│   │   ├── date.js                  # Pure date calculations and relative formatters
│   │   └── storage.js               # Normalization, localStorage, CSV & JSON parsers
│   ├── App.css                      # Cohesive editorial SaaS design system
│   ├── App.jsx                      # Root application controller and routing
│   ├── index.css                    # Design tokens, CSS reset, and variables
│   └── main.jsx                     # Entry mounting with React StrictMode
├── index.html                       # HTML5 entry with preconnected Google Fonts
├── package.json                     # Scripts, dependencies, and metadata
└── vite.config.js                   # Vite configuration
```

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or higher recommended; verified on v24)
- npm (v9 or higher)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Syedaman9964/job-application-tracker.git
   cd job-application-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 🧪 Testing & Verification

The project includes an automated test suite and static analysis configuration:

- **Run unit tests:**
  ```bash
  npm test
  ```
  Runs Vitest tests covering backward compatibility, legacy normalization, RFC-4180 CSV escaping, JSON envelope parsing, and date calculation accuracy.

- **Run code quality linter:**
  ```bash
  npm run lint
  ```
  Runs Oxlint to check for React purity warnings, unused identifiers, and syntax correctness.

- **Run production build:**
  ```bash
  npm run build
  ```
  Compiles optimized production bundles in `dist/`.

---

## 📸 Genuine Screenshot Capturing Guide

To showcase genuine screenshots of the application in your portfolio:

1. Start the application locally via `npm run dev` or open the [live site](https://silly-cobbler-3a5f27.netlify.app).
2. Go to **Settings** and click **"Load Curated Demo Applications"** to populate realistic records across all pipeline stages.
3. Capture full-resolution screenshots:
   - **Dashboard Overview:** Navigate to `Dashboard` and capture the KPI cards, Weekly Target bar, and Recharts donut and bar charts.
   - **Applications Directory:** Navigate to `Applications` and capture the filtered table with company logos, status badges, and search results.
   - **Pipeline Board:** Navigate to `Pipeline Board` and capture the 5-column Kanban board with cards distributed across stages.
   - **Follow-ups & Interviews:** Navigate to `Follow-ups & Dates` and capture the scheduled interview cards and active task items.
4. Save the images to an `assets/` or `screenshots/` directory and link them in this README.

---

## 🔐 Data Privacy & Limitations

- **Browser-Bound Storage:** All applications are stored in your device's browser `localStorage`. Clearing your browser data will delete local records. Always use the **"Download JSON Backup"** feature in **Data & Backups** to keep an archive.
- **Single Device:** Because this application does not use an external cloud database or authentication server, data does not automatically synchronize across different browsers or devices. Transfer data between devices by exporting and restoring JSON backups.
- **Storage Limits:** Standard browser localStorage provides approximately 5 MB of capacity, which is sufficient to store several thousand detailed job applications and interview notes.

---

## 🗺️ Roadmap & Future Enhancements

- [ ] Chrome extension integration to clip job postings directly from LinkedIn and Indeed.
- [ ] Resume version matching: associate specific resume PDFs or links with individual applications.
- [ ] Email reminder integration using `.ics` calendar invitation downloads for scheduled interviews.
- [ ] Dark mode toggle respecting system preferences while preserving the warm editorial palette.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
Built with craftsmanship for software engineering fresher portfolios.
