-- Create user_chapter_purchases table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_chapter_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chapter_id TEXT NOT NULL,
  coins_spent INTEGER NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, chapter_id)
);

-- Enable row level security
ALTER TABLE user_chapter_purchases ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own purchases" ON user_chapter_purchases;
CREATE POLICY "Users can view their own purchases"
  ON user_chapter_purchases FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own purchases" ON user_chapter_purchases;
CREATE POLICY "Users can insert their own purchases"
  ON user_chapter_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE user_chapter_purchases;
