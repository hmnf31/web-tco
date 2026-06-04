-- TCO Esports Database Schema
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS tco_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  full_name TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  game_username TEXT NOT NULL,
  division TEXT NOT NULL CHECK (division IN ('Chess', 'MLBB', 'Both')),
  payment_info TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Pending'
);

-- Enable Row Level Security
ALTER TABLE tco_members ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for registration form)
CREATE POLICY "Allow anonymous insert" ON tco_members
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated select (for admin dashboard)
CREATE POLICY "Allow authenticated select" ON tco_members
  FOR SELECT
  TO authenticated
  USING (true);

-- Create an index on status for faster admin queries
CREATE INDEX idx_tco_members_status ON tco_members(status);
CREATE INDEX idx_tco_members_division ON tco_members(division);

-- TCO News Articles Table (for autonomous news aggregator)
CREATE TABLE IF NOT EXISTS tco_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  source_url TEXT NOT NULL,
  source_url_hash TEXT UNIQUE NOT NULL,
  image_url TEXT NOT NULL DEFAULT '',
  watermarked_image_url TEXT NOT NULL DEFAULT '',
  published_at TIMESTAMPTZ,
  author TEXT NOT NULL DEFAULT 'TCO Official',
  category TEXT NOT NULL DEFAULT 'News',
  is_published BOOLEAN NOT NULL DEFAULT true,
  language TEXT NOT NULL DEFAULT 'id',
  games_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  image_caption TEXT NOT NULL DEFAULT ''
);

-- Enable Row Level Security
ALTER TABLE tco_articles ENABLE ROW LEVEL SECURITY;

-- Allow anonymous select (public read)
CREATE POLICY "Allow anonymous select articles" ON tco_articles
  FOR SELECT
  TO anon
  USING (true);

-- Allow service role insert/update (admin)
CREATE POLICY "Allow service role all" ON tco_articles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Index for faster queries
CREATE INDEX idx_tco_articles_slug ON tco_articles(slug);
CREATE INDEX idx_tco_articles_published_at ON tco_articles(published_at DESC);
CREATE INDEX idx_tco_articles_source_url_hash ON tco_articles(source_url_hash);

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
