-- STEP 1: Drop table if exists (clean slate)
DROP TABLE IF EXISTS generations CASCADE;

-- STEP 2: Create generations table
CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  generation_type VARCHAR(50) NOT NULL,
  s3_key VARCHAR(500) NOT NULL,
  s3_url TEXT NOT NULL,
  prompt TEXT,
  settings JSONB,
  file_size INTEGER,
  content_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 3: Create indexes
CREATE INDEX idx_generations_user_id ON generations(user_id);
CREATE INDEX idx_generations_created_at ON generations(created_at DESC);
CREATE INDEX idx_generations_type ON generations(generation_type);
CREATE INDEX idx_generations_user_type ON generations(user_id, generation_type, created_at DESC);

-- STEP 4: Enable Row Level Security
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- STEP 5: Create policies
CREATE POLICY "Users can view own generations"
  ON generations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generations"
  ON generations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own generations"
  ON generations
  FOR DELETE
  USING (auth.uid() = user_id);

-- STEP 6: Create trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 7: Create trigger
CREATE TRIGGER update_generations_updated_at
  BEFORE UPDATE ON generations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
