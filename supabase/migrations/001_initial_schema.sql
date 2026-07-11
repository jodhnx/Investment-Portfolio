-- InvestTrack Supabase Schema mit Row Level Security
-- Ausführen im Supabase SQL Editor oder via CLI: supabase db push

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT NOT NULL,
  avatar TEXT,
  currency TEXT NOT NULL DEFAULT 'EUR' CHECK (currency IN ('EUR', 'USD', 'CHF')),
  country TEXT,
  language TEXT NOT NULL DEFAULT 'de',
  timezone TEXT DEFAULT 'Europe/Berlin',
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PORTFOLIOS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Hauptportfolio',
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  currency TEXT NOT NULL DEFAULT 'EUR' CHECK (currency IN ('EUR', 'USD', 'CHF')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ASSETS (Positionen)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('CRYPTO', 'STOCK', 'ETF', 'GOLD', 'SILVER', 'COMMODITY', 'OTHER')),
  exchange TEXT,
  currency TEXT NOT NULL DEFAULT 'EUR',
  logo_url TEXT,
  external_id TEXT,
  notes TEXT,
  color TEXT,
  current_price NUMERIC,
  price_change_24h NUMERIC,
  price_change_percent_24h NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assets_portfolio_id ON public.assets(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_assets_symbol ON public.assets(symbol);

-- ============================================================
-- TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('BUY', 'SELL')),
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  price NUMERIC NOT NULL CHECK (price >= 0),
  fees NUMERIC NOT NULL DEFAULT 0 CHECK (fees >= 0),
  taxes NUMERIC NOT NULL DEFAULT 0 CHECK (taxes >= 0),
  date TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_asset_id ON public.transactions(asset_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);

-- ============================================================
-- DIVIDENDS (Erweiterung für Dividenden-Seite)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.dividends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  date TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dividends_asset_id ON public.dividends(asset_id);

-- ============================================================
-- WATCHLIST
-- ============================================================
CREATE TABLE IF NOT EXISTS public.watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  asset_type TEXT NOT NULL DEFAULT 'OTHER',
  logo_url TEXT,
  external_id TEXT,
  current_price NUMERIC,
  price_change_24h NUMERIC,
  price_change_percent_24h NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, symbol)
);

CREATE INDEX IF NOT EXISTS idx_watchlist_profile_id ON public.watchlist(profile_id);

-- ============================================================
-- PRICE ALERTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  target_price NUMERIC NOT NULL CHECK (target_price > 0),
  direction TEXT NOT NULL CHECK (direction IN ('BELOW', 'ABOVE')),
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  triggered BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_alerts_profile_id ON public.price_alerts(profile_id);

-- ============================================================
-- NOTES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_profile_id ON public.notes(profile_id);

-- ============================================================
-- PORTFOLIO SNAPSHOTS (Chart-Daten)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.portfolio_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  total_value NUMERIC NOT NULL,
  invested NUMERIC NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_snapshots_portfolio_date ON public.portfolio_snapshots(portfolio_id, date DESC);

-- ============================================================
-- HELPER: Profil-ID des aktuellen Users
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_profile_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (auth_user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER portfolios_updated_at BEFORE UPDATE ON public.portfolios
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER assets_updated_at BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER notes_updated_at BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_snapshots ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT
  USING (auth_user_id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE
  USING (auth_user_id = auth.uid());
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE
  USING (auth_user_id = auth.uid());

-- PORTFOLIOS
CREATE POLICY "portfolios_all_own" ON public.portfolios FOR ALL
  USING (profile_id = public.get_profile_id())
  WITH CHECK (profile_id = public.get_profile_id());

-- ASSETS
CREATE POLICY "assets_all_own" ON public.assets FOR ALL
  USING (
    portfolio_id IN (SELECT id FROM public.portfolios WHERE profile_id = public.get_profile_id())
  )
  WITH CHECK (
    portfolio_id IN (SELECT id FROM public.portfolios WHERE profile_id = public.get_profile_id())
  );

-- TRANSACTIONS
CREATE POLICY "transactions_all_own" ON public.transactions FOR ALL
  USING (
    asset_id IN (
      SELECT a.id FROM public.assets a
      JOIN public.portfolios p ON p.id = a.portfolio_id
      WHERE p.profile_id = public.get_profile_id()
    )
  )
  WITH CHECK (
    asset_id IN (
      SELECT a.id FROM public.assets a
      JOIN public.portfolios p ON p.id = a.portfolio_id
      WHERE p.profile_id = public.get_profile_id()
    )
  );

-- DIVIDENDS
CREATE POLICY "dividends_all_own" ON public.dividends FOR ALL
  USING (
    asset_id IN (
      SELECT a.id FROM public.assets a
      JOIN public.portfolios p ON p.id = a.portfolio_id
      WHERE p.profile_id = public.get_profile_id()
    )
  )
  WITH CHECK (
    asset_id IN (
      SELECT a.id FROM public.assets a
      JOIN public.portfolios p ON p.id = a.portfolio_id
      WHERE p.profile_id = public.get_profile_id()
    )
  );

-- WATCHLIST
CREATE POLICY "watchlist_all_own" ON public.watchlist FOR ALL
  USING (profile_id = public.get_profile_id())
  WITH CHECK (profile_id = public.get_profile_id());

-- PRICE ALERTS
CREATE POLICY "price_alerts_all_own" ON public.price_alerts FOR ALL
  USING (profile_id = public.get_profile_id())
  WITH CHECK (profile_id = public.get_profile_id());

-- NOTES
CREATE POLICY "notes_all_own" ON public.notes FOR ALL
  USING (profile_id = public.get_profile_id())
  WITH CHECK (profile_id = public.get_profile_id());

-- PORTFOLIO SNAPSHOTS
CREATE POLICY "snapshots_all_own" ON public.portfolio_snapshots FOR ALL
  USING (
    portfolio_id IN (SELECT id FROM public.portfolios WHERE profile_id = public.get_profile_id())
  )
  WITH CHECK (
    portfolio_id IN (SELECT id FROM public.portfolios WHERE profile_id = public.get_profile_id())
  );

-- ============================================================
-- STORAGE BUCKET für Avatare (optional im Dashboard anlegen)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- CREATE POLICY "avatar_upload_own" ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "avatar_read_public" ON storage.objects FOR SELECT
--   USING (bucket_id = 'avatars');
