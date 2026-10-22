# Roadmap: Job Application Tracker

## Phase 0: Codebase Audit & Setup [DONE]
- [x] Audit current codebase, data models, git remotes, and deployment.
- [x] Set up Vitest test runner.
- [x] Create project specification and implementation plan.

## Phase 1: Core Foundation & Data Utilities [IN PROGRESS]
- [ ] Safe storage utility (`storage.js`): backward compatibility, schema migration, import/export, CSV export.
- [ ] Pure date helpers (`date.js`): relative time, due dates, formatters without impure render issues.
- [ ] Vitest unit test suite covering storage, migrations, and calculations.

## Phase 2: Design System & Reusable Components
- [ ] Warm Ivory, Charcoal, Olive CSS tokens & typography in `src/index.css` and `src/App.css`.
- [ ] Accessible Modal, ConfirmDialog, Toast feedback notification system.
- [ ] Form controls, badges, buttons, and empty state illustrations.

## Phase 3: Application Management & Dual Views
- [ ] Comprehensive Add/Edit Application Modal with validation.
- [ ] Application Details Drawer/Modal with note viewing and direct stage updates.
- [ ] Advanced Applications Table: multi-filtering, search, sorting, pagination.
- [ ] Kanban Pipeline Board: Wishlist, Applied, Interview, Offer, Rejected with stage drag/move.

## Phase 4: Dashboard & Data-Driven Insights
- [ ] Realistic metrics cards: Active, Interviews, Offers, Conversion Rate.
- [ ] Weekly goal tracker (configurable).
- [ ] Recharts visualizations: Pipeline donut breakdown & status distribution.
- [ ] Upcoming actions & follow-ups widget.

## Phase 5: Follow-ups Hub, Data Safety & Settings
- [ ] Follow-ups & Reminders management view.
- [ ] JSON backup download & safe JSON restore with schema check.
- [ ] CSV spreadsheet exporter.
- [ ] Settings view: goal setting, default view, sample data loader.

## Phase 6: Verification, QA, Portfolio Polish & Deployment
- [ ] Run test suite (`npm test`), lint (`npm run lint`), and build (`npm run build`).
- [ ] Responsive UI verification via browser subagent.
- [ ] Comprehensive README.md overhaul.
- [ ] Git commit, push to GitHub `main`, and verify Netlify live deployment.
