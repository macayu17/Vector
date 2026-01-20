-- Vector Job Tracker - Feature Migrations
-- Run this in Supabase SQL Editor after the initial schema.sql
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- ============================================
-- RESUMES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  file_url TEXT,
  version TEXT,
  is_default BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for resumes
CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON resumes(user_id);

-- Enable RLS on resumes
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for resumes
CREATE POLICY "Users can view own resumes" ON resumes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes" ON resumes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes" ON resumes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes" ON resumes
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger to auto-update updated_at for resumes
CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TAGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#7c3aed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for tags
CREATE INDEX IF NOT EXISTS tags_user_id_idx ON tags(user_id);

-- Enable RLS on tags
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tags
CREATE POLICY "Users can view own tags" ON tags
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tags" ON tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags" ON tags
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags" ON tags
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- APPLICATION_TAGS JUNCTION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS application_tags (
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (application_id, tag_id)
);

-- Indexes for application_tags
CREATE INDEX IF NOT EXISTS application_tags_app_idx ON application_tags(application_id);
CREATE INDEX IF NOT EXISTS application_tags_tag_idx ON application_tags(tag_id);

-- Enable RLS on application_tags
ALTER TABLE application_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for application_tags (based on application ownership)
CREATE POLICY "Users can view own application_tags" ON application_tags
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM applications WHERE id = application_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can insert own application_tags" ON application_tags
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM applications WHERE id = application_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete own application_tags" ON application_tags
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM applications WHERE id = application_id AND user_id = auth.uid())
  );

-- ============================================
-- ADD RESUME_ID TO APPLICATIONS
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'applications' AND column_name = 'resume_id'
  ) THEN
    ALTER TABLE applications ADD COLUMN resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Index for resume_id
CREATE INDEX IF NOT EXISTS applications_resume_id_idx ON applications(resume_id);
