# FixAm — AI Artisan Marketplace (WhatsApp-First)

## What Is FixAm?
WhatsApp-first AI marketplace connecting customers with verified artisans in Nigeria and Ghana. Customers book via WhatsApp chatbot or mobile web app. Artisans receive jobs, accept/decline, get paid — all through WhatsApp.

## Who's Building It
- Solo founder based in UK (from Lagos)
- Operating remotely, targeting Nigeria + Ghana
- Ghana may launch first — 10,000 pre-certified YEA artisans available
- Diaspora use case is key: UK-based users booking for family in Lagos/Accra

## Revenue Model
- **15% commission** on every digital payment (Paystack split)
- Escrow: 100% held → 85% transferred to artisan on job completion
- Cash payments = no commission (revenue leakage)
- Emergency jobs at 1.5x rate → higher commission
- Premium subscriptions planned (₦5,000/month)

---

## Architecture

### Backend (Express + TypeScript)
- **Runtime**: Node.js on Railway (auto-deploys from git push to `main`)
- **Database**: PostgreSQL via Sequelize ORM
- **Payments**: Paystack (subaccounts for split, Transfers API for escrow release)
- **WhatsApp**: Meta Cloud API (Graph API v18.0)
- **Push**: web-push (VAPID-based)
- **Repo**: github.com/deejaycodes/FixAm

### Mobile Web App (Next.js static export)
- **Deployed to**: out-one-red.vercel.app
- **PWA**: manifest.json + service worker + 192/512 PNG icons
- **Static export**: `next build` → `out/` folder → Vercel

### Admin Dashboard (Next.js)
- **Deployed to**: fix-am-ui.vercel.app
- **Root dir**: `admin/` in repo
- Pages: Dashboard, Artisans (approval queue), Disputes, Requests

### Landing Page (Next.js)
- **Deployed to**: landing-zeta-rouge-63.vercel.app
- **Root dir**: `landing/` in repo

---

## Database Models (src/models/index.ts)

### Customer
id, name, phone, whatsappId, location (JSONB), referralCode, referredBy, discountUsed, pushSubscription (JSONB)

### Artisan
id, name, phone, whatsappId, services (JSONB array), location (JSONB), rating, totalJobs, verified, available, ninVerified, referralCode, referredBy, priorityBoost, paystackSubaccount, bankCode, accountNumber, profileSlug, bio, sharingLocation, liveLocation (JSONB), portfolioPhotos (JSONB string array)

### ServiceRequest
id, serviceType, description, location (JSONB), estimatedPrice, finalPrice, status (pending|assigned|accepted|in_progress|completed|cancelled), rating, review, completedAt, discount, photos (JSONB), guaranteeUsed, CustomerId, ArtisanId, scheduledAt

### Payment
id, amount, commission, paystackRef, status (pending|paid|failed), ServiceRequestId

### Quote
id, price, message, status (pending|accepted|rejected), ArtisanId, ServiceRequestId

### Message (in-app chat)
id, text, sender (customer|artisan), ServiceRequestId

### AdminUser
id, email, password, name

---

## Key Backend Files

| File | Purpose |
|------|---------|
| `src/server.ts` | Express app, routes, public `/api/popular` endpoint |
| `src/models/index.ts` | All Sequelize models + relationships |
| `src/routes/customerRequests.ts` | Customer API: create request, pay, escrow, release, messages, quotes, push, profile |
| `src/routes/requests.ts` | Admin API: list/update requests, disputes, resolve, popular services |
| `src/routes/artisans.ts` | Admin artisan management |
| `src/routes/customerAuth.ts` | Customer login/register (JWT) |
| `src/routes/webhook.ts` | WhatsApp webhook receiver |
| `src/services/chatbot.ts` | Full WhatsApp chatbot: customer flow, artisan onboarding, commands, job responses |
| `src/services/whatsapp.ts` | WhatsApp Graph API: sendMessage, sendButtons, sendList, sendImage, sendLocation, getMediaUrl |
| `src/services/paystack.ts` | Paystack: initializePayment, createSubaccount, createTransferRecipient, initiateTransfer, createDedicatedAccount |
| `src/services/matching.ts` | findBestArtisan (location + rating + availability) |
| `src/services/pricing.ts` | estimatePrice, applyLoyaltyDiscount |
| `src/services/push.ts` | web-push notifications to customers |
| `src/services/sessions.ts` | WhatsApp conversation session management |
| `src/services/transcription.ts` | Voice note transcription |
| `src/services/referral.ts` | Referral code system |
| `src/services/quotes.ts` | Multi-quote request/submit/accept |
| `src/services/subscription.ts` | Premium check (isPremium) |
| `src/services/sms.ts` | SMS fallback when WhatsApp fails |
| `src/middleware/auth.ts` | JWT auth middleware |

---

## Key Mobile Files (mobile/app/)

| File | Purpose |
|------|---------|
| `page.tsx` | Root: auth state, push subscription, tab routing |
| `lib.ts` | Country config (NG/GH), getServices(), formatPrice(), statusMap, API helper |
| `components/Login.tsx` | Phone login + country selector (🇳🇬/🇬🇭 toggle) |
| `components/Home.tsx` | Service grid, popular near you (location-based), recent bookings, promos |
| `components/NewRequest.tsx` | Book a service: type, description, urgency/scheduling, location (GPS + autocomplete), book-for-others, photos |
| `components/Status.tsx` | Job tracking: 5-step stepper, artisan card, portfolio gallery, ETA, chat, payment (4 options), quote comparison |
| `components/Profile.tsx` | Edit profile, Help/FAQ, country display, referral sharing |
| `components/Onboarding.tsx` | First-time user onboarding slides |

---

## Features Implemented

### Customer-Facing (Mobile + WhatsApp)
- [x] WhatsApp chatbot: full booking flow (service → describe → location → match → rate)
- [x] Mobile web app (PWA) with all booking features
- [x] Multi-country: Nigeria (₦) + Ghana (GH₵) with localized pricing/testimonials
- [x] 5-step progress: Requested → Matched → Accepted → On the way → Done
- [x] In-app two-way chat (customer ↔ artisan, bridged via WhatsApp)
- [x] Date/time scheduling with "Flexible" option + date picker
- [x] Book for someone else (diaspora feature) — name + phone for on-site contact
- [x] Address autocomplete via OpenStreetMap Nominatim (Nigeria + Ghana)
- [x] GPS location hidden when booking for others, geocodes typed address instead
- [x] Multi-quote comparison cards (all users, no premium gate)
- [x] Artisan ETA display (Haversine distance, ~25km/h Lagos traffic estimate)
- [x] Artisan portfolio photo gallery (thumbnails + full view)
- [x] 4 payment options: 🛡️ Secure Pay (escrow, highlighted), Pay Online, Transfer, Cash
- [x] Escrow: money held until customer confirms → 85% transferred to artisan via Paystack Transfers API
- [x] Push notifications (artisan matched, accepted, declined)
- [x] Auto-rematch when artisan declines (finds next best, notifies customer)
- [x] Referral system (₦1,000 / GH₵15 discount)
- [x] Loyalty discount (5% after 3 completed jobs)
- [x] Voice note transcription in WhatsApp
- [x] Job guarantee (redo at no cost)
- [x] Repeat booking (same artisan shortcut)

### Artisan-Facing (WhatsApp only)
- [x] Onboarding: name → service → location → bank setup
- [x] Bank account setup: 18 Nigerian banks, auto-creates Paystack subaccount
- [x] Commands: earnings, jobs, online/offline, profile, help, bank
- [x] Accept/decline jobs with auto-rematch on decline
- [x] Live location sharing for customer tracking
- [x] Portfolio photos: send photos without active job → saved to portfolio
- [x] Job photos: send during active job → saved to request
- [x] WhatsApp media downloaded as base64 data URLs (viewable in app)
- [x] Quote submission (reply with price number)
- [x] In-app chat: artisan free-text forwarded to customer's chat

### Admin Dashboard
- [x] Artisan approval workflow: pending queue (amber) + verified list
- [x] Bank setup status per artisan
- [x] Dispute management: low-rated jobs (≤2 stars) + cancellations
- [x] Resolution actions: Release payment / Refund / Redo with new artisan
- [x] Request management with status updates

### Backend/Infrastructure
- [x] Dynamic popular services: `/api/popular?lat=&lng=` with ~20km radius filtering
- [x] Real Paystack Transfers on escrow release (createTransferRecipient + initiateTransfer)
- [x] SMS fallback when WhatsApp API fails
- [x] JWT authentication for mobile app
- [x] Admin auth (separate)

---

## Deployment

```bash
# Mobile web app
cd mobile && npx next build && cd out && npx vercel --prod --yes
# → out-one-red.vercel.app

# Landing page
cd landing && npx next build && npx vercel --prod --yes
# → landing-zeta-rouge-63.vercel.app

# Admin dashboard (deploy from repo root, Vercel root dir = admin/)
cd /repo-root && npx vercel --prod --yes
# → fix-am-ui.vercel.app

# Backend — auto-deploys from git push to Railway
git push origin main

# Type check
npx tsc --noEmit
```

---

## Environment Variables (Railway backend)

```
DATABASE_URL          — PostgreSQL connection string
WHATSAPP_TOKEN        — Meta Cloud API token (needs regeneration on Meta Business dashboard)
WHATSAPP_PHONE_NUMBER_ID — WhatsApp Business phone number ID
WHATSAPP_VERIFY_TOKEN — Webhook verification token
PAYSTACK_SECRET_KEY   — Paystack secret key
JWT_SECRET            — JWT signing secret
VAPID_PUBLIC_KEY      — Web push public key (generate: npx web-push generate-vapid-keys)
VAPID_PRIVATE_KEY     — Web push private key
```

---

## Status Map (5 steps)

```typescript
pending: step 0      // Request created, searching for artisan
assigned: step 1     // Artisan matched, awaiting their response
accepted: step 2     // Artisan accepted the job
in_progress: step 3  // Artisan on the way / working
completed: step 4    // Job done + rated
cancelled: step -1   // Cancelled by customer
```

---

## Country Config (mobile/app/lib.ts)

```typescript
NG: { currency: 'NGN', currencySymbol: '₦', phonePrefix: '+234', city: 'Lagos', idType: 'NIN' }
GH: { currency: 'GHS', currencySymbol: 'GH₵', phonePrefix: '+233', city: 'Accra', idType: 'Ghana Card' }
```

---

## Launch Blockers

1. **Regenerate WhatsApp token** on Meta Business dashboard — only founder can do this, blocks entire WhatsApp flow
2. **Generate VAPID keys** (`npx web-push generate-vapid-keys`) and set as env vars on Railway — blocks push notifications
3. **Test full end-to-end flow** with real phone number

## Remaining Roadmap

1. Capacitor Android build for Play Store
2. SMS notifications as WhatsApp fallback (service exists, needs wiring to more events)
3. Ghana bank codes (currently only Nigerian banks in chatbot bank map)
4. Artisan verification workflow (NIN/Ghana Card check)
5. Admin: revenue dashboard, artisan payout history
6. Rate limiting on public endpoints
7. Image compression for portfolio photos (base64 is large)

## Strategic Notes

- Ghana launch strategy: find ops person in Accra, recruit from YEA graduate pool (10,000 pre-certified artisans)
- Diaspora marketing: UK-Ghana/Nigeria corridor — people booking for family back home
- Investor prep: pitch deck, unit economics (15% take rate, ₦2,250 avg commission per job)
- WhatsApp-first is the core differentiator vs competitors who are app-only
- Cash payment leakage is the main revenue risk — Secure Pay (escrow) UI nudges digital payment

---

## Git Info

- **Repo**: github.com/deejaycodes/FixAm
- **Branch**: main
- **Last commit**: `8adfeb1` — "feat: real Paystack transfers, location-based popular, WhatsApp media download"

## Coding Preferences

- TypeScript throughout
- Minimal code — no verbose implementations
- Nigerian + Ghanaian market focus
