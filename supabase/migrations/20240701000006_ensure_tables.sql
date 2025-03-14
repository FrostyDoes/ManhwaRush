-- Ensure users table has role and coins columns
ALTER TABLE IF EXISTS public.users
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0;

-- Ensure coin_transactions table has transaction_type column
ALTER TABLE IF EXISTS public.coin_transactions
ADD COLUMN IF NOT EXISTS transaction_type TEXT DEFAULT 'purchase';

-- Ensure reading_history table has progress_percentage column
ALTER TABLE IF EXISTS public.reading_history
ADD COLUMN IF NOT EXISTS progress FLOAT DEFAULT 0;

-- Ensure chapters table has is_premium and coin_price columns
ALTER TABLE IF EXISTS public.chapters
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS coin_price INTEGER DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_id ON public.coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_user_id ON public.reading_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_chapter_purchases_user_id ON public.user_chapter_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_chapter_purchases_chapter_id ON public.user_chapter_purchases(chapter_id);
CREATE INDEX IF NOT EXISTS idx_chapters_manhwa_id ON public.chapters(manhwa_id);

-- Add realtime subscriptions for tables
BEGIN;
  -- Enable realtime for coin_transactions
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.coin_transactions;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.reading_history;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.user_chapter_purchases;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.manhwa;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.chapters;
COMMIT;
