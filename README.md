# Fashion & Lifestyle Week – Event Management Platform

A complete full-stack event website and administration system for a **Fashion & Lifestyle Week**.  
Designed for **college students** who need to deploy without using a terminal or writing code.

---

## What this platform includes

- Public fashion-editorial website (Home, About, Agenda, Registration, Ticket pages, etc.)
- Configurable event identity, branding, venue, dates (no hardcoded event details)
- Dynamic registration with multiple ticket categories
- Unique registration ID + ticket number + **QR code** per registrant
- Confirmation emails via **Resend**
- SPOC (Single Point of Contact) assignment on tickets
- Admin dashboard with live statistics
- Role-based access (Super Admin, Event Manager, Check-in Staff, …)
- QR check-in API for staff
- Database-backed agenda, speakers, sponsors, exhibitors, stalls, competitions
- One-time **browser-based setup** (`/setup`) – no `npm` or SQL required by students

---

## Student deployment (no terminal required)

### STEP 1 – Use this repository
This GitHub repository is ready to import into Vercel.

### STEP 2 – Import into Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New… → Project**.
3. Import `fashion-lifestyle-week-platform`.
4. Framework Preset should detect **Next.js**.
5. Do **not** change build settings.

### STEP 3 – Environment variables (Vercel)
In the Vercel project → **Settings → Environment Variables**, add:

| Variable | Required | Where to get it |
|----------|----------|-----------------|
| `DATABASE_URL` | **Yes** | Neon console → Connection string (pooled) |
| `NEXTAUTH_SECRET` | **Yes** | Generate a long random string |
| `NEXTAUTH_URL` | **Yes** | Your Vercel URL, e.g. `https://your-app.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | **Yes** | Same as above |
| `RESEND_API_KEY` | **Yes** for emails | resend.com → API Keys |
| `RESEND_FROM_EMAIL` | Recommended | Verified sender in Resend |
| `RESEND_FROM_NAME` | Optional | e.g. `Fashion Lifestyle Week` |

**Neon database:** Sign up at [neon.tech](https://neon.tech), create a project, copy the pooled connection string.

**Resend:** Sign up at [resend.com](https://resend.com), create an API key.

### STEP 4 – Deploy
Click **Deploy**. Vercel will install dependencies, run Prisma generate, and build the app.

### STEP 5 – Initialize the database (browser only)
1. Open `https://your-app.vercel.app/setup`
2. Enter admin email and password
3. Click **Initialize Database**
4. Go to `/admin/login` and sign in

Default if you accept defaults: `admin@fashionweek.local` / `Admin@12345` — **change after first login**.

---

## Tech stack

- **Frontend / Backend**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS – fashion-editorial, minimal, high-contrast
- **Database**: Neon Serverless PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (credentials + JWT) with RBAC
- **Email**: Resend
- **QR**: `qrcode` library (server-side)
- **Hosting**: Vercel (serverless)

---

## Local development (optional)

```bash
npm install
cp .env.example .env.local
# fill DATABASE_URL, NEXTAUTH_SECRET, etc.
npx prisma db push
npm run db:seed   # optional sample data
npm run dev
```

---

## Security notes

- Passwords are hashed with bcrypt.
- API routes check session + permissions server-side.
- QR codes contain only a secure random token (no personal data).
- Never commit `.env` files or real API keys.
