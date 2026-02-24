# Supabase Real OTP Setup (Email + SMS)

This project now uses Supabase Edge Functions for real OTP delivery.

## 1) Required credentials

### Supabase (frontend `.env`)
- `VITE_BACKEND_PROVIDER=supabase`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_FUNCTIONS_URL` (optional, auto-derived if omitted)

### Edge Function secrets (server-side in Supabase)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY` (for email OTP)
- `OTP_FROM_EMAIL` (verified sender, e.g. `otp@yourdomain.com`)
- `TWILIO_ACCOUNT_SID` (for SMS OTP)
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER` (E.164 format, e.g. `+14155550123`)

## 2) Deploy functions

Install Supabase CLI and login:

```bash
npm install -g supabase
supabase login
```

Link your project:

```bash
supabase link --project-ref <your-project-ref>
```

Deploy functions:

```bash
supabase functions deploy send-otp
supabase functions deploy verify-otp
```

## 3) Set function secrets

```bash
supabase secrets set SUPABASE_URL=https://<project-ref>.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
supabase secrets set RESEND_API_KEY=<resend-api-key>
supabase secrets set OTP_FROM_EMAIL=otp@yourdomain.com
supabase secrets set TWILIO_ACCOUNT_SID=<twilio-account-sid>
supabase secrets set TWILIO_AUTH_TOKEN=<twilio-auth-token>
supabase secrets set TWILIO_FROM_NUMBER=+14155550123
```

## 4) Initialize tables and policies

Run these in Supabase SQL Editor:
- `supabase-temp-setup.sql`
- (optional) `supabase-temp-seed.sql`

## 5) Smoke tests

### Send email OTP
```bash
curl -X POST "https://<project-ref>.functions.supabase.co/send-otp" \
  -H "Content-Type: application/json" \
  -H "apikey: <anon-key>" \
  -H "Authorization: Bearer <anon-key>" \
  -d '{"contact":"you@example.com","method":"email","tokenNumber":"TESTOTP123"}'
```

### Verify OTP
```bash
curl -X POST "https://<project-ref>.functions.supabase.co/verify-otp" \
  -H "Content-Type: application/json" \
  -H "apikey: <anon-key>" \
  -H "Authorization: Bearer <anon-key>" \
  -d '{"tokenNumber":"TESTOTP123","contact":"you@example.com","otp":"123456"}'
```

## 6) Notes
- Email sends only if your sender domain/email is verified in Resend.
- SMS sends only to Twilio-allowed numbers in trial accounts.
- In production, replace temporary open RLS policies with strict user-bound policies.
