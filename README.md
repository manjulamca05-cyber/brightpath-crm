# BrightPath CRM — Coaching Academy Admissions & Lead Management

A robust, production-ready Student Inquiry & Admissions CRM built for coaching institutes (NEET, JEE, Foundation, and Professional Academies). Engineered with **React 19**, **TypeScript**, **Vite**, **Supabase** (PostgreSQL + Row-Level Security), and a customized high-contrast Dark Canvas SaaS design system.

---

## 🎯 Architecture Overview & Component Mapping

```
brightpath-crm/
├── src/
│   ├── components/
│   │   ├── common/             # Global error boundary, network status banner, config warning
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── NetworkStatusBanner.tsx
│   │   │   └── ConfigMissingBanner.tsx
│   │   ├── layout/             # Responsive shell, header, sidebar, mobile slide-over drawer
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── MobileNav.tsx
│   │   └── ui/                 # Accessible atomic UI components (min 44px touch targets)
│   │       ├── Badge.tsx, Button.tsx, Card.tsx, EmptyState.tsx, Input.tsx, Modal.tsx, Select.tsx, Skeleton.tsx
│   ├── features/
│   │   ├── auth/               # Role-based auth context, login view, role badges, protected routes
│   │   │   ├── AuthContext.tsx, LoginPage.tsx, ProtectedRoute.tsx, RoleBadge.tsx, useAuth.ts
│   │   ├── followups/          # Scheduling modals, urgency cards, one-click completion
│   │   │   ├── FollowupCard.tsx, ScheduleFollowupModal.tsx
│   │   └── leads/              # Lead creation modal, chronological activity timeline, detail views
│   │       ├── ActivityTimeline.tsx, CreateLeadModal.tsx, LeadDetailPage.tsx
│   │   └── reports/            # Funnel breakdown and counselor performance cards
│   ├── pages/                  # Top-level view controllers
│   │   ├── DashboardPage.tsx   # Real-time pipeline KPIs, conversion rate, urgent follow-up widgets
│   │   ├── LeadsPage.tsx       # Search, multi-criteria filters, pagination, lead CRUD
│   │   ├── FollowupsPage.tsx   # Overdue, upcoming, completed tabs with live counters
│   │   ├── ReportsPage.tsx     # Source conversion funnel, counselor workload, CSV export center
│   │   ├── SettingsPage.tsx    # User profile, role authorizations, theme diagnostics
│   │   └── NotFoundPage.tsx    # Accessible 404 recovery view
│   ├── services/               # Typed data access layers with zero-division guards & RLS conformance
│   │   ├── activityService.ts  # Automated audit log generation and lead interaction histories
│   │   ├── followupService.ts  # Overdue calculation math and follow-up status lifecycle
│   │   ├── leadService.ts      # CRUD, status transitions, and mandatory loss reason enforcement
│   │   ├── metricService.ts    # Reconciled dashboard KPI calculations and pipeline aggregations
│   │   └── reportService.ts    # Tabular managerial summaries and dataset formatting
│   ├── utils/
│   │   ├── csvExport.ts        # RFC 4180 compliant CSV generator with UTF-8 BOM (\uFEFF) for Excel
│   │   └── dateUtils.ts        # Strict overdue calculations, HTML5 datetime converters, relative time
│   ├── types/
│   │   └── database.ts         # Supabase PostgreSQL schema contracts and TypeScript enums
│   └── App.tsx                 # Top-level routing wrapped in ErrorBoundary and AuthProvider
├── supabase/
│   ├── migrations/             # Idempotent DDL migrations with RLS policies and audit triggers
│   │   └── 20261018000001_initial_schema.sql
│   ├── seed.sql                # Seed staff accounts (Admin, Manager, Counselor) and student inquiries
│   └── verify_setup.sql        # Database health check verification script
├── tests/                      # Automated test suites for all phases (187 passing assertions)
│   ├── phase6.test.mjs         # Follow-ups engine and date math invariants
│   ├── phase7.test.mjs         # Activity history and automated audit hooks
│   ├── phase8.test.mjs         # Dashboard analytics & KPI reconciliation
│   ├── phase9.test.mjs         # Reports & RFC 4180 CSV export
│   └── phase10.test.mjs        # Accessibility, ErrorBoundary, touch targets & offline detection
└── vercel.json                 # Single Page Application rewrites for deep route support on Vercel
```

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- A free **Supabase** account ([supabase.com](https://supabase.com))

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/manjulamca05-cyber/brightpath-crm.git
cd brightpath-crm
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-publishable-anon-key
```

### 3. Run Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:5173`.

### 4. Build & Lint Checks
```bash
# Verify static build
npm run build

# Run Oxlint (0 warnings / 0 errors across 52 files)
npm run lint

# Run all test suites
npm run test:all
```

---

## 🗄️ Supabase Database Setup & Migrations

1. Go to your Supabase project dashboard -> **SQL Editor**.
2. Run the initial migration script located in [`supabase/migrations/20261018000001_initial_schema.sql`](file:///e:/AN-Projects/brightpath-crm/supabase/migrations/20261018000001_initial_schema.sql):
   - Creates `profiles`, `leads`, `follow_ups`, and `activities` tables.
   - Configures `status_enum` (`New`, `Contacted`, `Qualified`, `Converted`, `Lost`) and `source_enum`.
   - Enables Row Level Security (RLS) on all tables.
3. Run [`supabase/seed.sql`](file:///e:/AN-Projects/brightpath-crm/supabase/seed.sql) to populate initial academy staff roles and student leads.
4. Run [`supabase/verify_setup.sql`](file:///e:/AN-Projects/brightpath-crm/supabase/verify_setup.sql) to verify that tables, triggers, and foreign key relationships are healthy.

---

## 🔐 Row-Level Security (RLS) & Role Lifecycle

BrightPath CRM enforces strict security at the database layer:

| User Role | Leads Access | Follow-ups Access | Audit Trail | User Management |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | Full access to all leads across all branches | Full access | View all staff activity logs | Can manage profiles & roles |
| **Branch Manager** | Full access across their assigned academy branch | Full access | View branch activities | Can assign leads to counselors |
| **Counselor** | Reads and modifies only inquiries assigned to them | Own follow-ups | Can log interactions & notes | No profile management |
| **Receptionist** | Can create new inquiries and view walk-ins | Basic view | Basic activity view | No profile management |

---

## ☁️ Deploying to Vercel

### Step 1: Import Repository
1. Navigate to [vercel.com](https://vercel.com) and log into your account.
2. Click **"Add New..."** -> **"Project"**.
3. Select your GitHub repository: `manjulamca05-cyber/brightpath-crm`.

### Step 2: Configure Build Settings & Environment Variables
- **Framework Preset**: `Vite` (automatically detected via `vercel.json`)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_SUPABASE_URL` = `https://<your-project>.supabase.co`
  - `VITE_SUPABASE_ANON_KEY` = `<your-publishable-anon-key>`

### Step 3: Deploy & Verify
Click **"Deploy"**. Thanks to [`vercel.json`](file:///e:/AN-Projects/brightpath-crm/vercel.json), all single-page routes (`/leads`, `/followups`, `/reports`, `/settings`) rewrite cleanly to `/index.html` without 404 errors on deep refreshes.

---

## 🧪 Automated Testing & Verification Matrix

| Suite | Description | Test File | Results |
| :--- | :--- | :--- | :--- |
| **Phase 6** | Follow-ups Engine & Overdue Date Math | `tests/phase6.test.mjs` | **32 / 32 Passed (100%)** |
| **Phase 7** | Activity History & Automated Audit Hooks | `tests/phase7.test.mjs` | **33 / 33 Passed (100%)** |
| **Phase 8** | Dashboard Analytics & Metric Reconciliation | `tests/phase8.test.mjs` | **34 / 34 Passed (100%)** |
| **Phase 9** | Managerial Reports & RFC 4180 CSV Export | `tests/phase9.test.mjs` | **34 / 34 Passed (100%)** |
| **Phase 10** | Accessibility, Error Boundary & Mobile Targets | `tests/phase10.test.mjs` | **54 / 54 Passed (100%)** |
| **Total** | Full Regression Verification Suite | `npm run test:all` | **187 / 187 Passed (100%)** |

---

## 💡 Production Considerations & Best Practices

1. **Excel UTF-8 Compatibility**: The CSV export utility automatically prepends the UTF-8 Byte-Order Mark (`\uFEFF`) to prevent Indian names and phone numbers from being corrupted by Windows versions of Microsoft Excel.
2. **Zero-Division Invariants**: All conversion calculations (`(converted / total) * 100`) include zero-division guards returning `0.0%` rather than `NaN` or `Infinity`.
3. **Graceful Offline Degradation**: The `NetworkStatusBanner` detects network disconnects instantly and provides retry triggers without crashing active form inputs.
4. **Accessible Touch Targets**: All interactive elements (buttons, inputs, select dropdowns, close icons, navigation drawers) strictly guarantee `>= 44px` touch targets for mobile responsiveness.
5. **Session Persistence**: Supabase auth tokens are managed via secure browser storage, with automatic redirection between unauthenticated and protected views.

---

## 📄 License
This project is licensed under the MIT License.
