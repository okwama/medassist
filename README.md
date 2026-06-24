# MedAssist Academy — Enrollment & Payment System

A full-stack Next.js web application for managing course enrollments and payments for **MedAssist Academy & Agency**, a Kenyan online training institution for aspiring Medical Virtual Assistants (MVAs).

Built on the [Untitled UI React](https://www.untitledui.com/react) component library with Next.js 16, Neon PostgreSQL, and M-Pesa (Daraja API) integration.

---

## Overview

MedAssist Academy offers a **6-week intensive online Medical Virtual Assistant certification course**. This platform handles:

- A fully branded **public-facing landing page** with course information, testimonials, countdown timer, and FAQ
- A **guided multi-step checkout wizard** supporting M-Pesa STK Push and card payments
- A **secure admin panel** for managing enrollments, analytics, and admin users

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| UI Library | Untitled UI React (open-source) |
| Styling | Tailwind CSS v4.1 + Vanilla CSS (landing page) |
| Language | TypeScript 5.8 |
| Database | Neon PostgreSQL (`@neondatabase/serverless`) |
| Payments | Safaricom Daraja API (M-Pesa STK Push) |
| Auth | JWT cookies (8h expiry) |
| Icons | `@untitledui/icons` |
| Fonts | Inter (Google Fonts) |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Public landing page (SPA-style, all sections)
│   ├── checkout/
│   │   └── page.tsx              # Multi-step enrollment & payment wizard
│   ├── success/                  # Post-payment confirmation page
│   ├── admin/
│   │   ├── page.tsx              # Admin login
│   │   ├── dashboard/            # Enrollment dashboard (payments table)
│   │   ├── analytics/            # Analytics & reports (charts, CSV export)
│   │   └── users/                # Admin user management
│   └── api/
│       ├── initiate/             # M-Pesa STK Push initiation
│       ├── callback/             # M-Pesa payment callback webhook
│       ├── status/               # Payment status polling
│       └── admin/
│           ├── login/            # Admin authentication (JWT)
│           ├── logout/           # Session invalidation
│           ├── payments/         # Enrollment records CRUD
│           ├── analytics/        # Aggregated stats & chart data
│           └── users/            # Admin user management CRUD
├── lib/
│   ├── db.ts                     # Neon PostgreSQL client & all DB helpers
│   └── daraja.ts                 # Daraja API (M-Pesa) integration
├── components/                   # Untitled UI component library
│   ├── base/                     # Buttons, Inputs, Badges, Avatars, etc.
│   ├── application/              # Navigation, tables, modals
│   ├── marketing/                # Header navigation components
│   └── foundations/              # Design tokens & primitives
├── providers/
│   └── theme.tsx                 # Theme provider (forced light mode)
└── styles/
    └── theme.css                 # Brand color overrides & global tokens
```

---

## Features

### Public Landing Page (`/`)
- Sticky navigation with smooth scroll between sections: Home, Program, About Us, FAQ, Contact
- Hero section with countdown timer to cohort start date (July 6, 2026)
- Feature stats cards, curriculum overview, instructor bios, testimonials
- **FAQ accordion** — 16 questions covering prerequisites, schedule, assessments, certification, payments, and support
- Contact form + social/WhatsApp links
- Fully responsive (mobile-first)

### Checkout Wizard (`/checkout`)
- Step 1: Personal details (name, email, phone, county, referral source)
- Step 2: Payment plan selection (Full / Installment / Monthly)
- Step 3: Payment method (M-Pesa STK Push or card)
- Step 4: Confirmation & receipt
- Real-time M-Pesa STK push with polling for payment status

### Admin Panel (`/admin/*`)

> Protected by JWT cookie middleware. Access requires `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables.

| Route | Description |
|---|---|
| `/admin` | Login page |
| `/admin/dashboard` | Enrollment records table with search, filter, status badges, CSV export |
| `/admin/analytics` | KPI cards, CSS bar charts (by day/course/county/referral), CSV export |
| `/admin/users` | Admin user management — view, add, edit roles, delete |

---

## Database Schema

Tables are auto-created on first use via `initDb()` / `initAdminUsers()` in `src/lib/db.ts`.

### `enrollments`
| Column | Type | Description |
|---|---|---|
| `id` | SERIAL | Primary key |
| `full_name` | TEXT | Student name |
| `email` | TEXT | Contact email |
| `phone` | TEXT | M-Pesa phone number |
| `county` | TEXT | County of residence |
| `referral` | TEXT | How they heard about the course |
| `payment_plan` | TEXT | full / installment / monthly |
| `amount` | NUMERIC | Amount paid (KES) |
| `mpesa_code` | TEXT | M-Pesa confirmation code |
| `payment_status` | TEXT | pending / completed / failed |
| `created_at` | TIMESTAMP | Enrollment timestamp |

### `admin_users`
| Column | Type | Description |
|---|---|---|
| `id` | SERIAL | Primary key |
| `username` | TEXT | Unique login username |
| `password_hash` | TEXT | bcrypt-hashed password |
| `role` | TEXT | super_admin / admin / viewer |
| `created_at` | TIMESTAMP | Account creation timestamp |

---

## Environment Variables

Create a `.env.local` file in the project root with the following:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Admin credentials (legacy env-var login)
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_secure_password

# JWT secret
JWT_SECRET=your_jwt_secret_key

# M-Pesa Daraja API
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_PASSKEY=your_lipa_na_mpesa_passkey
MPESA_SHORTCODE=your_business_shortcode
MPESA_CALLBACK_URL=https://yourdomain.com/api/callback

# App URL (for internal API calls)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm / yarn / pnpm
- A [Neon](https://neon.tech) PostgreSQL database
- Safaricom Daraja API credentials (for M-Pesa)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd "payment access system/untitled-ui"

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The database tables are created automatically on first request — no migration step required.

---

## API Reference

### Payment APIs

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/initiate` | Initiate M-Pesa STK Push |
| `POST` | `/api/callback` | M-Pesa payment webhook (called by Safaricom) |
| `GET` | `/api/status?checkoutRequestId=` | Poll payment status |

### Admin APIs (JWT protected)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/admin/login` | Authenticate and issue JWT cookie |
| `POST` | `/api/admin/logout` | Clear JWT cookie |
| `GET` | `/api/admin/payments` | List all enrollments |
| `PATCH` | `/api/admin/payments` | Update enrollment status |
| `GET` | `/api/admin/analytics` | Aggregated stats and chart data |
| `GET` | `/api/admin/users` | List admin users |
| `POST` | `/api/admin/users` | Create admin user |
| `PATCH` | `/api/admin/users` | Update admin user role |
| `DELETE` | `/api/admin/users` | Delete admin user |

---

## Brand Guidelines

| Token | Value |
|---|---|
| Primary color | `#00A3A3` (teal) |
| Primary dark | `#008282` |
| Primary light | `#e6f6f6` |
| Background | `#FFFFFF` |
| Dark text | `#0A0A0A` |
| Gray text | `#666666` |
| Mode | Light only (forced) |

---

## License

The Untitled UI open-source components used in this project are licensed under the [MIT License](https://www.untitledui.com/license).

Application-level code (checkout flow, admin panel, API routes, database layer) is proprietary to MedAssist Academy & Agency.

---

> **MedAssist Academy & Agency** — Empowering Kenyans to build global healthcare careers from home.  
> 📧 medassistacademy@gmail.com · 📞 0143869393 · [LinkedIn](https://www.linkedin.com/company/medva-assist-academy/)
