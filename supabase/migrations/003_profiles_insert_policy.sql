-- Profil-INSERT für authentifizierte User (Fallback wenn Trigger fehlschlägt)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'profiles_insert_own'
  ) THEN
    CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT
      WITH CHECK (auth_user_id = auth.uid());
  END IF;
END $$;
