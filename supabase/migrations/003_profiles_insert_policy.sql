-- Profil-INSERT für authentifizierte User (Fallback wenn Trigger fehlschlägt)
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT
  WITH CHECK (auth_user_id = auth.uid());
