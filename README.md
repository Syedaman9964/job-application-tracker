# JobTrack — Secure, Single-Admin Personal Career Manager

> A production-ready, single-admin personal job search tracker built with React 19, Supabase (PostgreSQL with Row Level Security), Netlify Serverless Functions, Resend transactional emails, and custom Vanilla CSS.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Netlify-success?style=flat&logo=netlify)](https://silly-cobbler-3a5f27.netlify.app)
[![Admin](https://img.shields.io/badge/Admin-syedaman996455%40gmail.com-blue?style=flat&logo=google)](mailto:syedaman996455@gmail.com)
[![Database](https://img.shields.io/badge/Database-PostgreSQL_RLS-336791?style=flat&logo=postgresql)](https://supabase.com)
[![Notifications](https://img.shields.io/badge/Alerts-Resend_Email-black?style=flat&logo=resend)](https://resend.com)
[![Tests](https://img.shields.io/badge/Tests-13_Passing-brightgreen?style=flat&logo=vitest)](https://vitest.dev/)
[![Security](https://img.shields.io/badge/Security-RLS_+_Netlify_CSP-darkgreen)](./supabase/migrations/01_init.sql)

---

## 🌐 Live Demo & Repository

- **Live Application:** [https://silly-cobbler-3a5f27.netlify.app](https://silly-cobbler-3a5f27.netlify.app)
- **GitHub Repository:** [https://github.com/Syedaman9964/job-application-tracker](https://github.com/Syedaman9964/job-application-tracker)
- **Authorized Administrator:** `syedaman996455@gmail.com`

---

## 🛡️ Security Architecture & Access Control

JobTrack enforces a strict **Deny-by-Default** access control model designed exclusively for one verified administrator:

```
[ Your Browser ]
      │
      ├── (1. Log in with Email/Password) ────────► [ Supabase Auth ]
      │                                                   │ (Signed JWT Token)
      │◄──────────────────────────────────────────────────┘
      │
      ├── (2. Queries with JWT Bearer) ───────────► [ PostgreSQL Database ]
      │                                                   │
      │                                        [ Row Level Security (RLS) ]
      │                                        Checks: auth.email == 'syedaman996455@gmail.com'
      │                                        ✅ Allow  |  ❌ Reject 403 Forbidden
      │
      └── (3. On Change: Trigger Alert) ──────────► [ Netlify Function (Backend) ]
                                                          │
                                               [ Verify JWT & Admin Email ]
                                                          │
                                                   [ Resend Email API ]
                                                          │
                                            📧 Alert to: syedaman996455@gmail.com
```

### Key Security Safeguards
1. **Disabled Public Registration:** Public registration is disabled. Only the designated administrator account (`syedaman996455@gmail.com`) can authenticate.
2. **Database Row Level Security (RLS):** All database operations (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) are verified inside the PostgreSQL engine itself via `auth.jwt() ->> 'email' = 'syedaman996455@gmail.com'`. Tampering with client code or sending direct HTTP requests cannot bypass database-level authorization.
3. **Protected Serverless Email Dispatch:** Netlify Functions (`netlify/functions/notify.js`) inspect the Supabase JWT token before sending emails via Resend. Anonymous callers are rejected with `401 Unauthorized`.
4. **Zero Frontend Secrets:** Private API keys (`RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are kept exclusively in Netlify serverless environment variables and are never bundled into client-side JavaScript.
5. **Strict Security Headers:** `netlify.toml` configures Content-Security-Policy (CSP), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and disabled sensitive browser permissions.

---

## ✨ Feature Breakdown

### 1. 📊 Career Dashboard
- **True Calculated Metrics:** Total Applications, Active in Pipeline, Interviews, and Offers.
- **Conversion Rate:** Computes interview progression percentage from active applications.
- **Weekly Target Tracker:** User-configurable goal progress bar reflecting actual submissions within the calendar week.
- **Visual Analytics:** Interactive Recharts Donut chart (pipeline stage breakdown) and Bar chart (volume comparison).
- **Upcoming Deadlines Widget:** Surfaces overdue actions, today's tasks, and interviews scheduled in the next 7 days.

### 2. 📋 Applications Directory (Table View)
- **Deep Search:** Instant filtering across company name, role, location, and notes.
- **Multi-Filter & Sort:** Filter by Pipeline Stage and Employment Type; sort by date, company name, or status.
- **Pagination & Ergonomics:** Fast client-side pagination with clear result counts and per-row quick status selectors.

### 3. 📌 Pipeline Board (Kanban View)
- **5 Distinct Stages:** `Wishlist` ➔ `Applied` ➔ `Interview` ➔ `Offer` ➔ `Rejected`.
- **HTML5 Drag-and-Drop:** Drag cards across columns or use the accessible stage dropdown on any card.
- **Card Badges:** Displays location tags, compensation range, and deadline alerts.

### 4. ⏰ Follow-ups & Scheduled Interviews Hub
- **Unified Action Timeline:** Centralized hub for next action items, recruiter deadlines, and scheduled rounds.
- **Status Chips:** Filter by Active Tasks, This Week, Overdue, Interviews, and Completed.
- **Task Completion Checkbox:** Toggle task completion with automated timestamp updates.

### 5. 📧 Real-Time Admin Email Alerts (Resend)
Dispatches automated email notifications directly to `syedaman996455@gmail.com` when:
- 🆕 A new application is created
- 📝 An application is edited
- 🔄 An application changes stage (e.g. Applied ➔ Interview)
- 🗑️ An application is deleted
*(Non-blocking: email provider downtime never disrupts database writes).*

### 6. 🔒 Safe Migration & Data Portability
- **Non-Destructive Cloud Migration:** Automatically prompts to download a local JSON backup before syncing browser `localStorage` records into PostgreSQL.
- **Manual Backups:** One-click JSON backup download and RFC-4180 CSV export for spreadsheets.

---

## 🛠️ Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | [React 19](https://react.dev/) + [Vite 8](https://vite.dev/) | Modern component architecture, instant HMR, high performance. |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL) | Managed PostgreSQL with native Row Level Security (RLS) and JWT auth. |
| **Serverless Backend** | [Netlify Functions](https://www.netlify.com/platform/core/functions/) | Secure server-side execution for email dispatch without secret leakage. |
| **Email Delivery** | [Resend](https://resend.com/) | Modern transactional email API with 3,000 free monthly emails. |
| **Styling** | Custom Vanilla CSS | Tailored warm ivory, charcoal, and olive palette with zero CSS bundle bloat. |
| **Charts** | [Recharts](https://recharts.org/) | Responsive SVG charts (Pie/Donut and Bar). |
| **Testing** | [Vitest](https://vitest.dev/) | Unit test suite covering auth logic, database mapping, and data utilities. |
| **Linter** | [Oxlint](https://oxc.rs/) | High-speed Rust linter ensuring React purity and clean code standards. |

---

## 🚀 Setup Guide & Environment Variables

### 1. Supabase Setup (2 Minutes)
1. Log in to [Supabase](https://supabase.com) and create a new project.
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Paste and run the contents of [`supabase/migrations/01_init.sql`](./supabase/migrations/01_init.sql). This creates the `applications` table, indexes, updated_at trigger, and Row Level Security policies.
4. Go to **Authentication** ➔ **Users** and click **Add User** ➔ **Create User**:
   - Email: `syedaman996455@gmail.com`
   - Password: Choose a strong master password.
5. In **Authentication** ➔ **Providers** ➔ **Email**, ensure **Confirm email** is set or confirmed.
6. Copy your **Project URL** and **anon public key** from **Project Settings** ➔ **API**.

### 2. Resend Setup (1 Minute)
1. Sign up at [Resend](https://resend.com).
2. Go to **API Keys** and generate a new key (e.g. `re_...`).

### 3. Netlify Environment Variables Configuration
In your Netlify Dashboard for `silly-cobbler-3a5f27`:
Navigate to **Site configuration** ➔ **Environment variables**, and add:

```env
# Frontend (Public)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_ADMIN_EMAIL=syedaman996455@gmail.com

# Backend / Serverless (Private)
RESEND_API_KEY=re_your_secret_resend_api_key
ADMIN_NOTIFICATION_EMAIL=syedaman996455@gmail.com
RESEND_FROM_EMAIL=JobTrack Alerts <onboarding@resend.dev>
```

---

## 🧪 Testing & Verification

```bash
# Run automated Vitest unit tests (13 tests)
npm test

# Run Oxlint static analysis
npm run lint

# Compile optimized production bundle
npm run build
```

---

## 🔐 Data Ownership & Free-Tier Limits

- **Hosting & Database:** Data is stored in Supabase's managed AWS PostgreSQL. Data is encrypted in transit (TLS 1.3) and at rest.
- **Free Tier Allocations:**
  - Supabase: 500 MB database (stores 50,000+ applications). Inactive projects pause after 7 days without queries; logging in keeps it active.
  - Resend: 3,000 emails/month (100 emails/day), more than sufficient for personal job tracking.
  - Netlify: 100 GB bandwidth, 125,000 function invocations/month.
- **Ongoing Cost:** **$0 / month**.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).  
Designed with engineering craftsmanship for personal career tracking and software engineering portfolios.
