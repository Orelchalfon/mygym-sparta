-- User-managed training areas. Built-ins are seeded per user with their old slug as key,
-- so exercises.area / set_logs.area keep working with no data change.

CREATE TABLE public.areas (
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 40),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.areas TO authenticated;
GRANT ALL ON public.areas TO service_role;

ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own areas" ON public.areas
  FOR ALL USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

-- First load seeds the defaults; no-op once the user has any area, so concurrent loads can't duplicate.
CREATE OR REPLACE FUNCTION public.seed_default_areas(p_rows JSONB)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_count INTEGER;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated' USING ERRCODE = '28000';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtext('seed_areas:' || v_uid::text));
  IF EXISTS (SELECT 1 FROM areas WHERE user_id = v_uid) THEN
    RETURN 0;
  END IF;
  INSERT INTO areas (user_id, key, name, sort_order)
  SELECT v_uid, r->>'key', r->>'name', (r->>'sort_order')::integer
  FROM jsonb_array_elements(p_rows) AS r;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.seed_default_areas(JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.seed_default_areas(JSONB) TO authenticated, service_role;
