-- Tambah kolom ELO rata-rata (lintas mode Chess.com) dan avatar (profile picture)
ALTER TABLE tco_league_players ADD COLUMN IF NOT EXISTS elo_avg INTEGER NOT NULL DEFAULT 0;
ALTER TABLE tco_league_players ADD COLUMN IF NOT EXISTS pp TEXT NOT NULL DEFAULT '';