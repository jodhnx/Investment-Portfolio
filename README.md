# InvestTrack – Portfolio & Investment Rechner

Moderne Web-App für Krypto, Aktien, ETFs, Gold und Silber. Kombination aus Portfolio-Tracker, Excel-ähnlicher Tabelle und Investment-Rechnern.

## Features

- **Dashboard** – Gesamtwert, G/V, Tagesänderung, Portfolio-Chart, Assetverteilung
- **Portfolio-Tabelle** – Sortierbar, filterbar, verschiebbare/anpassbare Spalten, Virtualisierung für Performance
- **Asset-Suche** – CoinGecko (Krypto) + Yahoo Finance (Aktien/ETFs)
- **Käufe & Verkäufe** – Mehrere Transaktionen pro Position, automatischer Ø-Kaufpreis
- **Rechner** – Investment, Sparplan, DCA
- **Dividenden** – Erfassung und Auswertung
- **Watchlist** – Assets ohne Kauf beobachten
- **Import/Export** – CSV und JSON-Backup
- **Undo/Redo** – Änderungen rückgängig machen
- **Dark Mode** – Standard, Light Mode optional
- **Persistenz** – Automatisches Speichern in LocalStorage (kein Server nötig)

## Schnellstart

```bash
cd crypto-invest
npm install
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000)

> **Hinweis:** Der Ordner `K:\Crypto_Invest` war schreibgeschützt. Das Projekt liegt unter `C:\Users\benst\Crypto_Invest\crypto-invest`.

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- **Charts:** Recharts
- **Tabellen:** TanStack Table + Virtual
- **State:** Zustand + LocalStorage
- **Backend (optional):** Prisma + PostgreSQL + NextAuth

## PostgreSQL & Cloud-Sync (optional)

```bash
cp .env.example .env
# DATABASE_URL setzen
npx prisma migrate dev
npx prisma generate
```

## Deployment (Vercel)

1. Repository auf GitHub pushen
2. In Vercel importieren
3. Umgebungsvariablen setzen (`DATABASE_URL`, `NEXTAUTH_SECRET`, …)
4. Deploy

## Projektstruktur

```
src/
├── app/
│   ├── (dashboard)/     # Hauptseiten
│   └── api/             # Preis- & Such-APIs
├── components/
│   ├── calculators/
│   ├── dashboard/
│   ├── layout/
│   └── portfolio/
├── hooks/
├── lib/
│   ├── api/             # CoinGecko, Yahoo Finance
│   ├── calculations.ts  # G/V, DCA, Sparplan
│   └── storage.ts       # LocalStorage
└── store/               # Zustand Store
```

## API-Quellen

| Asset-Typ | API |
|-----------|-----|
| Krypto | CoinGecko |
| Aktien/ETFs | Yahoo Finance |
| Gold | CoinGecko |

Preise werden automatisch alle 60 Sekunden aktualisiert (einstellbar).

## Lizenz

Privates Projekt – frei verwendbar.
