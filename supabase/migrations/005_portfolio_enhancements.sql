-- Portfolio enhancements: icon, start capital, archive, default, active portfolio, watchlist per portfolio

ALTER TABLE public.portfolios
  ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'Briefcase',
  ADD COLUMN IF NOT EXISTS start_capital NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS active_portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE SET NULL;

ALTER TABLE public.watchlist
  ADD COLUMN IF NOT EXISTS portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE;

-- Backfill watchlist portfolio_id with user's first portfolio
UPDATE public.watchlist w
SET portfolio_id = (
  SELECT p.id FROM public.portfolios p
  WHERE p.profile_id = w.profile_id
  ORDER BY p.created_at ASC
  LIMIT 1
)
WHERE w.portfolio_id IS NULL;

-- Ensure one default portfolio per profile (oldest non-archived)
UPDATE public.portfolios p
SET is_default = TRUE
WHERE p.id = (
  SELECT p2.id FROM public.portfolios p2
  WHERE p2.profile_id = p.profile_id AND p2.archived = FALSE
  ORDER BY p2.created_at ASC
  LIMIT 1
)
AND NOT EXISTS (
  SELECT 1 FROM public.portfolios p3
  WHERE p3.profile_id = p.profile_id AND p3.is_default = TRUE
);

CREATE INDEX IF NOT EXISTS idx_watchlist_portfolio_id ON public.watchlist(portfolio_id);
