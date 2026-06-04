-- TCO Announcements Table (for admin dashboard announcements)
CREATE TABLE IF NOT EXISTS tco_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  link_url TEXT NOT NULL DEFAULT '',
  link_text TEXT NOT NULL DEFAULT ''
);

-- Enable Row Level Security
ALTER TABLE tco_announcements ENABLE ROW LEVEL SECURITY;

-- Allow anonymous select (public read for active announcements)
CREATE POLICY "Allow anonymous select announcements" ON tco_announcements
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Allow service role all (admin management)
CREATE POLICY "Allow service role all" ON tco_announcements
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes for faster queries
CREATE INDEX idx_tco_announcements_is_active ON tco_announcements(is_active);
CREATE INDEX idx_tco_announcements_start_date ON tco_announcements(start_date);
CREATE INDEX idx_tco_announcements_end_date ON tco_announcements(end_date);