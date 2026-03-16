# FixAm — AI Artisan Marketplace for Nigeria 🇳🇬

WhatsApp-first platform connecting Nigerians with verified artisans.

## Services
- 🔧 Plumbing · ⚡ Electrical · ❄️ AC Repair · ⚙️ Generator Repair · 🪚 Carpentry

## Architecture

```
WhatsApp (Meta Cloud API)
    ↓
  Webhook → Chatbot State Machine → Matching Service (location + rating)
    ↓                                    ↓
  PostgreSQL ←── REST API ──→ Admin Dashboard (Next.js)
    ↓                              ↓
  Redis (sessions)           Analytics & Disputes
    ↓
  Paystack (split payments)
```

## Tech Stack
- **Backend:** Node.js, Express 5, TypeScript, Sequelize, PostgreSQL, Redis
- **Admin:** Next.js 14 (App Router)
- **Payments:** Paystack (auto-split 85/15)
- **Messaging:** WhatsApp Cloud API + Termii SMS fallback
- **AI:** OpenAI Whisper (voice transcription)
- **Identity:** VerifyMe (NIN verification)

## Local Development

```bash
# 1. Install dependencies
npm install
cd admin && npm install && cd ..

# 2. Set up environment
cp .env.example .env
# Fill in your credentials

# 3. Start backend (port 3000)
npm run dev

# 4. Start admin dashboard (port 3001)
cd admin && npm run dev

# 5. Seed sample data (requires DATABASE_URL)
npm run seed
```

## Deploy to Railway (Backend)

1. Push to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add services: **PostgreSQL** and **Redis**
4. Railway auto-detects `railway.toml` and builds
5. Set environment variables in Railway dashboard (see `.env.example`)
6. Your API is live at `https://your-app.railway.app`

## Deploy to Vercel (Admin Dashboard)

1. Go to [vercel.com](https://vercel.com) → Import → select repo
2. Set root directory to `admin`
3. Add environment variable: `NEXT_PUBLIC_API_URL` = your Railway URL
4. Deploy — admin is live at `https://your-admin.vercel.app`

## Configure WhatsApp

1. Go to [Meta Developer Portal](https://developers.facebook.com)
2. Create a WhatsApp Business app
3. Set webhook URL to `https://your-app.railway.app/webhook`
4. Set verify token to match your `WHATSAPP_VERIFY_TOKEN`
5. Subscribe to `messages` webhook field

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | — | Health check |
| GET/POST | `/webhook` | — | WhatsApp webhook |
| POST | `/api/auth/register` | — | Create admin account |
| POST | `/api/auth/login` | — | Login, get JWT |
| GET/POST | `/api/artisans` | ✅ | List/create artisans |
| PATCH | `/api/artisans/:id` | ✅ | Update artisan |
| POST | `/api/artisans/:id/verify-nin` | ✅ | Verify NIN |
| POST | `/api/artisans/:id/bank` | ✅ | Set up bank account |
| GET | `/api/artisans/banks/list` | ✅ | List Nigerian banks |
| GET | `/api/requests` | ✅ | List service requests |
| PATCH | `/api/requests/:id/assign` | ✅ | Assign artisan |
| PATCH | `/api/requests/:id/complete` | ✅ | Complete job |
| POST | `/api/payments/initialize` | ✅ | Start payment |
| GET | `/api/payments/verify` | ✅ | Verify payment |
| POST | `/api/payments/webhook` | — | Paystack webhook |
| GET | `/api/analytics/overview` | ✅ | Dashboard stats |
| GET | `/api/analytics/revenue` | ✅ | Revenue over time |
| GET | `/api/analytics/services` | ✅ | Popular services |
| GET | `/api/analytics/areas` | ✅ | Busiest areas |
| GET | `/api/analytics/disputes` | ✅ | Reported issues |

## WhatsApp Flows

**Customer:**
```
"Hi" → Service menu → Describe problem (text/voice) → Share location
→ Artisan matched → "cancel" / rate 1-5 / "problem"
```

**Artisan signup:**
```
"join" → Name → Service → Location → Profile created (pending verification)
```

**Artisan commands:**
```
"earnings" · "jobs" · "online" · "offline" · "help" · "accept" · "decline"
📸 Send photos during active jobs
```
