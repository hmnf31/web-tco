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
  is_published BOOLEAN NOT NULL DEFAULT true
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
