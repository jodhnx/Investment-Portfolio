-- Kapitalbewegungen (Ein-/Auszahlungen) pro Portfolio
CREATE TABLE IF NOT EXISTS public.cash_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  flow_type TEXT NOT NULL CHECK (flow_type IN ('DEPOSIT', 'WITHDRAWAL')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  date TIMESTAMPTZ NOT NULL,
  category TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cash_flows_portfolio_id ON public.cash_flows(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_cash_flows_date ON public.cash_flows(date DESC);

ALTER TABLE public.cash_flows ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'cash_flows' AND policyname = 'cash_flows_all_own'
  ) THEN
    CREATE POLICY "cash_flows_all_own" ON public.cash_flows FOR ALL
      USING (
        portfolio_id IN (SELECT id FROM public.portfolios WHERE profile_id = public.get_profile_id())
      )
      WITH CHECK (
        portfolio_id IN (SELECT id FROM public.portfolios WHERE profile_id = public.get_profile_id())
      );
  END IF;
END $$;
