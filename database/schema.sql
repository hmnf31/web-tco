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

-- ══════════════════════════════════════════════════════════════════════════════
-- TCO LEAGUE (fitur liga internal) — migrasi lengkap ada di
-- supabase/migrations/20260923000000_create_tco_league.sql
-- ══════════════════════════════════════════════════════════════════════════════

-- Players peserta liga
CREATE TABLE IF NOT EXISTS tco_league_players (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  username TEXT NOT NULL DEFAULT '',
  league TEXT NOT NULL DEFAULT 'Liga 1' CHECK (league IN ('Liga 1', 'Liga 2', 'Liga 3', 'Liga 4')),
  elo INTEGER NOT NULL DEFAULT 1000,
  wo_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disqualified'))
);

-- Jadwal pertandingan
CREATE TABLE IF NOT EXISTS tco_league_schedules (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  league TEXT NOT NULL DEFAULT 'Liga 1' CHECK (league IN ('Liga 1', 'Liga 2', 'Liga 3', 'Liga 4')),
  round INTEGER NOT NULL DEFAULT 1,
  player1_id TEXT NOT NULL,
  player2_id TEXT NOT NULL,
  date TEXT NOT NULL DEFAULT '',
  time TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed'))
);

-- Hasil pertandingan + PGN untuk analisis
CREATE TABLE IF NOT EXISTS tco_league_results (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  schedule_id TEXT UNIQUE NOT NULL,
  score1 NUMERIC NOT NULL DEFAULT 0,
  score2 NUMERIC NOT NULL DEFAULT 0,
  pgn TEXT DEFAULT NULL
);

-- Konfigurasi global (season number, dsb.)
CREATE TABLE IF NOT EXISTS tco_league_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

-- RLS
ALTER TABLE tco_league_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE tco_league_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE tco_league_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE tco_league_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "league players anon select" ON tco_league_players FOR SELECT TO anon USING (true);
CREATE POLICY "league schedules anon select" ON tco_league_schedules FOR SELECT TO anon USING (true);
CREATE POLICY "league results anon select" ON tco_league_results FOR SELECT TO anon USING (true);
CREATE POLICY "league config anon select" ON tco_league_config FOR SELECT TO anon USING (true);

CREATE POLICY "league players service all" ON tco_league_players FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "league schedules service all" ON tco_league_schedules FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "league results service all" ON tco_league_results FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "league config service all" ON tco_league_config FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_league_players_league ON tco_league_players(league);
CREATE INDEX IF NOT EXISTS idx_league_schedules_league ON tco_league_schedules(league);
CREATE INDEX IF NOT EXISTS idx_league_schedules_status ON tco_league_schedules(status);
CREATE INDEX IF NOT EXISTS idx_league_results_schedule ON tco_league_results(schedule_id);
