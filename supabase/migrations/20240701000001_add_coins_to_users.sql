-- Add coins column to users table if it doesn't exist
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0;

-- Create coin_transactions table to track coin purchases and usage
CREATE TABLE IF NOT EXISTS public.coin_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL,
  description TEXT,
  reference_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB
);

-- Create manhwa table
CREATE TABLE IF NOT EXISTS public.manhwa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  banner_image TEXT,
  author TEXT,
  artist TEXT,
  status TEXT DEFAULT 'ongoing',
  rating DECIMAL(3,1) DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create genres table
CREATE TABLE IF NOT EXISTS public.genres (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create manhwa_genres junction table
CREATE TABLE IF NOT EXISTS public.manhwa_genres (
  manhwa_id UUID REFERENCES public.manhwa(id) ON DELETE CASCADE,
  genre_id UUID REFERENCES public.genres(id) ON DELETE CASCADE,
  PRIMARY KEY (manhwa_id, genre_id)
);

-- Create chapters table
CREATE TABLE IF NOT EXISTS public.chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manhwa_id UUID NOT NULL REFERENCES public.manhwa(id) ON DELETE CASCADE,
  number DECIMAL(8,1) NOT NULL,
  title TEXT,
  is_premium BOOLEAN DEFAULT false,
  coin_price INTEGER DEFAULT 0,
  pages JSONB,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (manhwa_id, number)
);

-- Create user_chapter_purchases table
CREATE TABLE IF NOT EXISTS public.user_chapter_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  coins_spent INTEGER NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, chapter_id)
);

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  manhwa_id UUID NOT NULL REFERENCES public.manhwa(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, manhwa_id)
);

-- Create reading_history table
CREATE TABLE IF NOT EXISTS public.reading_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  manhwa_id UUID NOT NULL REFERENCES public.manhwa(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, chapter_id)
);

-- Enable row level security
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manhwa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manhwa_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_chapter_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_history ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Coin transactions - users can only see their own transactions
CREATE POLICY "Users can view their own coin transactions"
  ON public.coin_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Manhwa - anyone can view
CREATE POLICY "Anyone can view manhwa"
  ON public.manhwa
  FOR SELECT
  USING (true);

-- Genres - anyone can view
CREATE POLICY "Anyone can view genres"
  ON public.genres
  FOR SELECT
  USING (true);

-- Manhwa genres - anyone can view
CREATE POLICY "Anyone can view manhwa genres"
  ON public.manhwa_genres
  FOR SELECT
  USING (true);

-- Chapters - anyone can view
CREATE POLICY "Anyone can view chapters"
  ON public.chapters
  FOR SELECT
  USING (true);

-- User chapter purchases - users can only see their own purchases
CREATE POLICY "Users can view their own chapter purchases"
  ON public.user_chapter_purchases
  FOR SELECT
  USING (auth.uid() = user_id);

-- Bookmarks - users can only see their own bookmarks
CREATE POLICY "Users can view their own bookmarks"
  ON public.bookmarks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks"
  ON public.bookmarks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON public.bookmarks
  FOR DELETE
  USING (auth.uid() = user_id);

-- Reading history - users can only see their own reading history
CREATE POLICY "Users can view their own reading history"
  ON public.reading_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reading history"
  ON public.reading_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading history"
  ON public.reading_history
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Enable realtime for relevant tables
alter publication supabase_realtime add table public.users;
alter publication supabase_realtime add table public.coin_transactions;
alter publication supabase_realtime add table public.bookmarks;
alter publication supabase_realtime add table public.reading_history;
