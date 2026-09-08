# AutoPipeline — Automotive Dealership Sales Operating System

**Live Production URL:** [https://agitated-rutherford.vercel.app](https://agitated-rutherford.vercel.app)

Production-grade sales pipeline, F&I finance desk, showroom up-system, demo fleet scheduling, and delivery turnover OS engineered for automotive retail dealerships in the Philippines.

Built with **React 18**, **TypeScript**, **Tailwind CSS**, and **Vitest**. Supports standalone in-memory operation out of the box with zero external dependencies, plus optional Supabase backend synchronization.

---

## ⚡ Quick Start

Clone and run the application locally in 3 simple steps:

```bash
# 1. Clone the repository
git clone https://github.com/mvquinacman/autopipeline.git
cd autopipeline

# 2. Install dependencies
npm install

# 3. Start the Vite development server
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser.

---

## 🧪 Testing & Verification

The codebase includes comprehensive unit and end-to-end user journey tests:

```bash
# Run all test suites (107 tests across 20 suites)
npm test

# Build for production
npm run build
```

---

## 👥 Demo Profiles & Role-Based Access Control (RBAC)

AutoPipeline simulates dealership hierarchy and Row-Level Security (RLS) out of the box:

| Role | Profile Name | Scope / View Access |
| :--- | :--- | :--- |
| **Sales Consultant** | **Paolo Morales** | Only sees assigned personal leads (7 leads) |
| **Sales Consultant** | **Camille Dizon** | Only sees assigned personal leads |
| **General Sales Manager (GSM)** | **Rafael Alcantara** | Sees all leads across team roster (14 leads) + Leaderboard + Overrides |
| **Dealer Principal (Owner)** | **Vicente Tan** | Unrestricted dealership-wide view + Compensation approvals |

*Click the user badge in the header or use the **Terminal Auth Modal** to switch profiles instantly.*

---

## 🚗 Core Dealership Capabilities

1. **Pipeline & Chevron Stage Rail:** 7-stage interlocking chevron visualizer (`New` → `Contacted` → `Showroom` → `Test Drive` → `Application` → `Approved` → `Released`).
2. **Global Toast & 1-Click Undo System:** Floating action alerts with 5-second countdowns. Revert accidental stage advancements or task completions with one tap.
3. **Smart Sort & Fast Filter Strip:** Filter chips (`Overdue Tasks`, `High Value ≥₱2M`, `Test Drive`, `In Financing`) and 6 multi-attribute sort orders.
4. **Showroom Floor Board & Up-System:** Consultant rotation queue, active walk-in client assignments, and anti-poaching timer controls.
5. **Used Car Appraisal & Trade-In Desk:** Vehicle evaluation, loan payoff calculation, Metro Manila number-coding checks, and net trade-in equity credit.
6. **Physical Vehicle Stock Matrix:** Real VIN fleet management, aged unit tracking (>60d), 48-hour reservation holds with ₱20,000 deposits, and double-booking prevention.
7. **Multi-Bank Auto Financing Approval Matrix:** BPI, BDO, Metrobank, PSBank, Security Bank, TFS side-by-side comparison, bank PO issuance, and dealer reserve tracking.
8. **Service Drive Upsell & Workshop Buyback Desk:** Lift bay inspection board (Bays 1-6), repair vs. trade-up equity comparison, and 1-click sales conversion.
9. **Vehicle Sales Order (VSO) & Official Quotation Generator:** Dealership letterhead contract generator with BIR TIN, LTO accreditation, accessory options, and 4-tier signature blocks.
10. **Delivery Bay Turnover & Releasing Ceremony Desk:** 10-point technical PDI QC inspection, 7-piece release kit validation, ceremonial ribbon setup, and security gate pass clearance.
11. **Sales Commission & Dealer Incentive Desk:** Unit base commission tiers, 20/30/50 bank financing reserve split, accessories cut, agent earnings wallet, and GSM clearance ledger with bank CSV export.
12. **Omnichannel Marketing & Social Intake Hub:** Meta/Facebook Lead Ads, Viber community inquiries, and website leads with a real-time 15-minute SLA countdown timer.

---

## 🛠️ Tech Stack

- **Framework:** React 18.3.1 (React DOM)
- **Language:** TypeScript 5.7.3 (Strict Mode)
- **Bundler:** Vite 6.2.0
- **Styling:** Tailwind CSS 3.4.17 with custom dealership design tokens
- **Icons:** Lucide React
- **Validation:** Zod 4
- **Testing:** Vitest 3.0.7, @testing-library/react 16.3.3, jsdom
- **Backend Ready:** Supabase Client (`@supabase/supabase-js`) + SQL migrations in `supabase/migrations/`

---

## 🗄️ Optional Supabase Configuration

To connect a live Supabase PostgreSQL database:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Set your Supabase project credentials in `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
3. Run the migrations in `supabase/migrations/` in your Supabase SQL editor.
