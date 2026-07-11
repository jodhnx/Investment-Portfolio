# InvestTrack – Portfolio & Investment Rechner

Moderne Web-App mit **Supabase Auth** und Cloud-Sync.

## Supabase Auth einrichten (Produktion)

### 1. Umgebungsvariablen (Vercel)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
NEXT_PUBLIC_SITE_URL=https://meine-app.vercel.app
```

`NEXT_PUBLIC_SITE_URL` steuert alle E-Mail-Links (Bestätigung, Passwort-Reset).

### 2. Supabase Dashboard → Authentication → URL Configuration

| Einstellung | Wert |
|-------------|------|
| **Site URL** | `https://meine-app.vercel.app` |
| **Redirect URLs** | `https://meine-app.vercel.app/auth/callback` |
| | `http://localhost:3000/auth/callback` (nur Dev) |

### 3. E-Mail-Bestätigung aktivieren

Authentication → Providers → Email → **Confirm email** aktivieren.

### 4. SQL-Migrationen ausführen

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_profile_auth_fields.sql`

### 5. E-Mail-Templates (optional)

Authentication → Email Templates → Confirm signup:
- Redirect nutzt automatisch `{{ .RedirectTo }}` aus der App.

## Auth-Flows

| Flow | Route |
|------|-------|
| Registrierung | `/register` → E-Mail → `/auth/callback` → `/onboarding` |
| Login | `/login` → Dashboard |
| Passwort vergessen | `/forgot-password` → E-Mail → `/auth/callback?type=recovery` → `/reset-password` |
| Fehler | `/auth/error` |

## Lokal entwickeln

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Supabase Redirect URLs muss `http://localhost:3000/auth/callback` enthalten.

```bash
npm install
npm run dev
```

## Tech Stack

Next.js 16 · Supabase Auth · PostgreSQL · RLS · Tailwind · shadcn/ui
