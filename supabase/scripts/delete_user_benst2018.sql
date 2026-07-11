-- ============================================================
-- Benutzer benst2018@gmail.com vollständig löschen
-- Ausführen im Supabase SQL Editor (Dashboard → SQL → New query)
--
-- HINWEIS: Der Auth-Benutzer muss ZUSÄTZLICH manuell gelöscht werden:
--   Supabase Dashboard → Authentication → Users → benst2018@gmail.com → Delete user
--   ODER mit Service Role Key: node scripts/delete-user.mjs benst2018@gmail.com
-- ============================================================

DO $$
DECLARE
  target_email TEXT := 'benst2018@gmail.com';
  target_auth_id UUID;
  target_profile_id UUID;
BEGIN
  SELECT id INTO target_auth_id
  FROM auth.users
  WHERE email = target_email
  LIMIT 1;

  IF target_auth_id IS NULL THEN
    RAISE NOTICE 'Kein Auth-Benutzer mit E-Mail % gefunden.', target_email;
    RETURN;
  END IF;

  SELECT id INTO target_profile_id
  FROM public.profiles
  WHERE auth_user_id = target_auth_id
  LIMIT 1;

  IF target_profile_id IS NOT NULL THEN
    -- Snapshots (über Portfolios)
    DELETE FROM public.portfolio_snapshots
    WHERE portfolio_id IN (
      SELECT id FROM public.portfolios WHERE profile_id = target_profile_id
    );

    -- Transaktionen & Dividenden (über Assets)
    DELETE FROM public.transactions
    WHERE asset_id IN (
      SELECT a.id FROM public.assets a
      JOIN public.portfolios p ON p.id = a.portfolio_id
      WHERE p.profile_id = target_profile_id
    );

    DELETE FROM public.dividends
    WHERE asset_id IN (
      SELECT a.id FROM public.assets a
      JOIN public.portfolios p ON p.id = a.portfolio_id
      WHERE p.profile_id = target_profile_id
    );

    -- Assets (Cascade würde Transaktionen mitlöschen, aber explizit ist sicherer)
    DELETE FROM public.assets
    WHERE portfolio_id IN (
      SELECT id FROM public.portfolios WHERE profile_id = target_profile_id
    );

    DELETE FROM public.portfolios WHERE profile_id = target_profile_id;
    DELETE FROM public.watchlist WHERE profile_id = target_profile_id;
    DELETE FROM public.price_alerts WHERE profile_id = target_profile_id;
    DELETE FROM public.notes WHERE profile_id = target_profile_id;
    DELETE FROM public.profiles WHERE id = target_profile_id;

    RAISE NOTICE 'Profil-Daten für % gelöscht (profile_id: %).', target_email, target_profile_id;
  ELSE
    RAISE NOTICE 'Kein Profil für % gefunden.', target_email;
  END IF;

  -- Auth-User: erfordert Superuser / service_role
  -- DELETE FROM auth.users WHERE id = target_auth_id;
  RAISE NOTICE 'Auth-User % (id: %) muss manuell unter Authentication → Users gelöscht werden.', target_email, target_auth_id;
END $$;
