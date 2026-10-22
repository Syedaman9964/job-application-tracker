# Roadmap: Job Application Tracker

## Phase 0: Codebase Audit & Setup [DONE]
- [x] Audit current codebase, data models, git remotes, and deployment.
- [x] Set up Vitest test runner.
- [x] Create project specification and implementation plan.

## Phase 1: Core Foundation & Data Utilities [DONE]
- [x] Safe storage utility (`storage.js`): backward compatibility, schema migration, import/export, CSV export.
- [x] Pure date helpers (`date.js`): relative time, due dates, formatters without impure render issues.
- [x] Vitest unit test suite covering storage, migrations, and calculations.

## Phase 2: Design System & Reusable Components [DONE]
- [x] Warm Ivory, Charcoal, Olive CSS tokens & typography in `src/index.css` and `src/App.css`.
- [x] Accessible Modal, ConfirmDialog, Toast feedback notification system.
- [x] Form controls, badges, buttons, and empty state illustrations.

## Phase 3: Application Management & Dual Views [DONE]
- [x] Comprehensive Add/Edit Application Modal with validation.
- [x] Application Details Drawer/Modal with note viewing and direct stage updates.
- [x] Advanced Applications Table: multi-filtering, search, sorting, pagination.
- [x] Kanban Pipeline Board: Wishlist, Applied, Interview, Offer, Rejected with stage drag/move.

## Phase 4: Dashboard & Data-Driven Insights [DONE]
- [x] Realistic metrics cards: Active, Interviews, Offers, Conversion Rate.
- [x] Weekly goal tracker (configurable).
- [x] Recharts visualizations: Pipeline donut breakdown & status distribution.
- [x] Upcoming actions & follow-ups widget.

## Phase 5: Follow-ups Hub, Data Safety & Settings [DONE]
- [x] Follow-ups & Reminders management view.
- [x] JSON backup download & safe JSON restore with schema check.
- [x] CSV spreadsheet exporter.
- [x] Settings view: goal setting, default view, sample data loader.

## Phase 6: Verification, QA, Portfolio Polish & Deployment [DONE]
- [x] Run test suite (`npm test`), lint (`npm run lint`), and build (`npm run build`).
- [x] Responsive UI verification via browser subagent.
- [x] Comprehensive README.md overhaul.
- [x] Git commit, push to GitHub `main`, and verify Netlify live deployment.
