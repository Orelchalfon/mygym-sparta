
CREATE TABLE public.exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area TEXT NOT NULL,
  name TEXT NOT NULL,
  weight NUMERIC NOT NULL DEFAULT 0,
  reps INTEGER NOT NULL DEFAULT 7,
  sets INTEGER NOT NULL DEFAULT 3,
  completed_sets INTEGER NOT NULL DEFAULT 0,
  last_completed_date DATE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.exercises TO authenticated;
GRANT ALL ON public.exercises TO service_role;

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own exercises" ON public.exercises
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX exercises_user_area_idx ON public.exercises(user_id, area, sort_order);
