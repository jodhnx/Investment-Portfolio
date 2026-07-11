# InvestTrack – Portfolio & Investment Rechner

Moderne Web-App für Krypto, Aktien, ETFs, Gold und Silber mit **Supabase** Authentifizierung und Cloud-Sync.

## Features

- **Supabase Auth** – E-Mail/Passwort, Google, GitHub OAuth
- **Row Level Security** – Jeder Benutzer sieht nur eigene Daten
- **Cloud-Sync** – Automatische Synchronisierung aller Änderungen
- **Onboarding** – Geführtes Setup nach Registrierung
- **Dashboard** – KPIs, Charts, Assetverteilung
- **Portfolio** – Excel-ähnliche Tabelle mit Sortierung & Filter
- **Rechner** – Investment, Sparplan, DCA
- **Watchlist, Dividenden, Statistik**

## Setup

### 1. Supabase-Projekt erstellen

1. [supabase.com](https://supabase.com) → Neues Projekt
2. SQL Editor → Inhalt von `supabase/migrations/001_initial_schema.sql` ausführen
3. Authentication → Providers: Email aktivieren, optional Google/GitHub
4. Authentication → URL Configuration:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

### 2. Umgebungsvariablen

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Starten

```bash
npm install
npm run dev
```

→ [http://localhost:3000](http://localhost:3000)

## Datenbank-Schema

| Tabelle | Beschreibung |
|---------|-------------|
| `profiles` | Benutzerprofil (Name, Währung, Sprache) |
| `portfolios` | Portfolios pro Benutzer |
| `assets` | Positionen (Krypto, Aktien, ETFs…) |
| `transactions` | Käufe & Verkäufe |
| `dividends` | Dividenden pro Asset |
| `watchlist` | Beobachtete Assets |
| `price_alerts` | Preisalarme |
| `notes` | Notizen |
| `portfolio_snapshots` | Chart-Verlauf |

Alle Tabellen haben **RLS** aktiviert.

## Sicherheit

- Row Level Security auf allen Tabellen
- Session-basierte Auth via Supabase SSR
- Middleware schützt alle Routen (Login erforderlich)
- Passwort-Validierung client- & serverseitig
- Parametrisierte DB-Queries (SQL-Injection-Schutz)

## Deployment (Vercel)

1. Supabase-Projekt mit Production-URLs konfigurieren
2. Env-Variablen in Vercel setzen
3. Deploy

## Tech Stack

- Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- Supabase (Auth + PostgreSQL + RLS)
- Recharts, TanStack Table, Zustand
