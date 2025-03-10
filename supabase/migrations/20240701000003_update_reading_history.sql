-- Update reading_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS reading_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  manhwa_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  progress FLOAT DEFAULT 0,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, chapter_id)
);

-- Enable row level security
ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own reading history" ON reading_history;
CREATE POLICY "Users can view their own reading history"
  ON reading_history FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own reading history" ON reading_history;
CREATE POLICY "Users can insert their own reading history"
  ON reading_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reading history" ON reading_history;
CREATE POLICY "Users can update their own reading history"
  ON reading_history FOR UPDATE
  USING (auth.uid() = user_id);

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE reading_history;
