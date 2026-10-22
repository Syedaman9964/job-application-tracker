# Project Specification: Job Application Tracker

## Vision
Transform the existing personal Job Application Tracker into a market-ready, professional SaaS-grade web application tailored for a software engineering portfolio and fresher applications.

## Technical Architecture
- **Framework:** React 19 + Vite
- **Language:** JavaScript (ES Modules)
- **Styling:** Custom Vanilla CSS (Restrained Editorial: Warm Ivory `#f8f7f2`, Charcoal `#22241d`, Olive `#5d6b42`)
- **Data Persistence:** Local-first with `localStorage` key `jobtrack-applications`
- **Portability:** JSON Backup & Restore, RFC-4180 CSV Exporter
- **Data Analytics:** Recharts + Custom pure statistical calculations
- **Testing:** Vitest unit test suite + Oxlint static analysis
- **Hosting & CI:** GitHub `main` -> Netlify automatic continuous deployment

## Non-Negotiables
1. Preserve existing data in `jobtrack-applications` with safe backward compatibility.
2. Zero paid or remote backend dependencies (pure local-first privacy).
3. No fake/fabricated analytics or statistics.
4. Clean, modular, accessible, and responsive across desktop, tablet, and mobile.
