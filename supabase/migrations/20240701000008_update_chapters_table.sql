-- Check if chapters table exists and create it if not
CREATE TABLE IF NOT EXISTS public.chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manhwa_id UUID NOT NULL REFERENCES public.manhwa(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  coin_price INTEGER DEFAULT 10,
  is_free BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  pages JSONB,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(manhwa_id, number)
);

-- Enable row level security
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

-- Create policies for chapters table
DROP POLICY IF EXISTS "Chapters are viewable by everyone" ON public.chapters;
CREATE POLICY "Chapters are viewable by everyone"
  ON public.chapters FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can insert chapters" ON public.chapters;
CREATE POLICY "Admins can insert chapters"
  ON public.chapters FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

DROP POLICY IF EXISTS "Admins can update chapters" ON public.chapters;
CREATE POLICY "Admins can update chapters"
  ON public.chapters FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

DROP POLICY IF EXISTS "Admins can delete chapters" ON public.chapters;
CREATE POLICY "Admins can delete chapters"
  ON public.chapters FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

-- Enable realtime for chapters table
ALTER PUBLICATION supabase_realtime ADD TABLE public.chapters;
