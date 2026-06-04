-- Create tco_announcements table if not exists
CREATE TABLE IF NOT EXISTS tco_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  link_url TEXT NOT NULL DEFAULT '',
  link_text TEXT NOT NULL DEFAULT ''
);

ALTER TABLE tco_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow anonymous select announcements" ON tco_announcements
  FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY IF NOT EXISTS "Allow service role all announcements" ON tco_announcements
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_tco_announcements_is_active ON tco_announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_tco_announcements_start_date ON tco_announcements(start_date);
CREATE INDEX IF NOT EXISTS idx_tco_announcements_end_date ON tco_announcements(end_date);

-- Add missing columns to tco_articles
ALTER TABLE tco_articles ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'id';
ALTER TABLE tco_articles ADD COLUMN IF NOT EXISTS games_json TEXT DEFAULT '[]';
ALTER TABLE tco_articles ADD COLUMN IF NOT EXISTS image_caption TEXT DEFAULT '';
