-- TCO League Tables (TikTok Chess Online Internal League)
-- Run in Supabase SQL Editor or via CLI migration.

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

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE tco_league_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE tco_league_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE tco_league_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE tco_league_config ENABLE ROW LEVEL SECURITY;

-- Public read (anon)
CREATE POLICY "league players anon select" ON tco_league_players FOR SELECT TO anon USING (true);
CREATE POLICY "league schedules anon select" ON tco_league_schedules FOR SELECT TO anon USING (true);
CREATE POLICY "league results anon select" ON tco_league_results FOR SELECT TO anon USING (true);
CREATE POLICY "league config anon select" ON tco_league_config FOR SELECT TO anon USING (true);

-- Admin write (service role, dilindungi auth di API route)
CREATE POLICY "league players service all" ON tco_league_players FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "league schedules service all" ON tco_league_schedules FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "league results service all" ON tco_league_results FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "league config service all" ON tco_league_config FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_league_players_league ON tco_league_players(league);
CREATE INDEX IF NOT EXISTS idx_league_schedules_league ON tco_league_schedules(league);
CREATE INDEX IF NOT EXISTS idx_league_schedules_status ON tco_league_schedules(status);
CREATE INDEX IF NOT EXISTS idx_league_results_schedule ON tco_league_results(schedule_id);