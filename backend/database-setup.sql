-- =============================================
-- Secrets Store Database Setup
-- =============================================
-- Run this SQL in your Supabase SQL Editor

-- Create secrets table
CREATE TABLE IF NOT EXISTS secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  encrypted_content TEXT NOT NULL,
  iv VARCHAR(255) NOT NULL,
  auth_tag VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_secrets_user_id ON secrets(user_id);
CREATE INDEX IF NOT EXISTS idx_secrets_created_at ON secrets(created_at DESC);

-- Enable Row Level Security
ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running script)
DROP POLICY IF EXISTS "Users can view own secrets" ON secrets;
DROP POLICY IF EXISTS "Users can insert own secrets" ON secrets;
DROP POLICY IF EXISTS "Users can update own secrets" ON secrets;
DROP POLICY IF EXISTS "Users can delete own secrets" ON secrets;

-- Create RLS policies

-- Users can only view their own secrets
CREATE POLICY "Users can view own secrets" ON secrets
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert secrets for themselves
CREATE POLICY "Users can insert own secrets" ON secrets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own secrets
CREATE POLICY "Users can update own secrets" ON secrets
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own secrets
CREATE POLICY "Users can delete own secrets" ON secrets
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_secrets_updated_at ON secrets;
CREATE TRIGGER update_secrets_updated_at
  BEFORE UPDATE ON secrets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verify setup
SELECT
  'Setup completed successfully! You can now use the secrets table.' AS status;
