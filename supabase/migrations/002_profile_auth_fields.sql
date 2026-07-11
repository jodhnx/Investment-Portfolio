-- Erweiterung profiles für Registrierung + aktualisierter Trigger
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username)
  WHERE username IS NOT NULL;

-- Profil-Trigger: Metadaten aus auth.users übernehmen
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_first_name TEXT := NEW.raw_user_meta_data->>'first_name';
  v_last_name  TEXT := NEW.raw_user_meta_data->>'last_name';
  v_username   TEXT := NEW.raw_user_meta_data->>'username';
  v_full_name  TEXT;
BEGIN
  v_full_name := TRIM(COALESCE(v_first_name, '') || ' ' || COALESCE(v_last_name, ''));

  INSERT INTO public.profiles (
    auth_user_id,
    email,
    name,
    first_name,
    last_name,
    username,
    language,
    currency,
    avatar
  )
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(v_full_name, ''),
    NULLIF(v_first_name, ''),
    NULLIF(v_last_name, ''),
    NULLIF(v_username, ''),
    COALESCE(NEW.raw_user_meta_data->>'language', 'de'),
    COALESCE(NEW.raw_user_meta_data->>'currency', 'EUR'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  );
  RETURN NEW;
END;
$$;
