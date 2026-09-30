-- Ganti input PGN mentah menjadi link game Chessigma (2 game per match).
-- Kolom `pgn` tetap ada agar data lama tidak hilang, tapi tidak lagi dipakai UI.
--
-- Aman untuk liga yang sedang berjalan:
-- 1. ADD COLUMN nullable tanpa DEFAULT tidak menulis ulang tabel (Postgres 11+),
--    jadi tidak ada lock lama pada 264 jadwal + 12 hasil yang sedang aktif.
-- 2. Constraint di-add NOT VALID lalu di-validate terpisah, supaya tabel tidak
--    ditahan lock SHARE ROW EXCLUSIVE selama pemindaian.
-- 3. Kolom lama tidak di-drop, jadi rollback cukup mengabaikan kolom baru.

ALTER TABLE public.tco_league_results
  ADD COLUMN IF NOT EXISTS game1_url TEXT,
  ADD COLUMN IF NOT EXISTS game2_url TEXT;

-- Hanya host Chessigma yang boleh, supaya tidak ada iframe ke situs lain.
ALTER TABLE public.tco_league_results
  DROP CONSTRAINT IF EXISTS league_result_game1_url_valid;

ALTER TABLE public.tco_league_results
  DROP CONSTRAINT IF EXISTS league_result_game2_url_valid;

ALTER TABLE public.tco_league_results
  ADD CONSTRAINT league_result_game1_url_valid
  CHECK (
    game1_url IS NULL
    OR game1_url ~ '^https://(www\.)?chessigma\.com/[^[:space:]]*$'
  ) NOT VALID;

ALTER TABLE public.tco_league_results
  ADD CONSTRAINT league_result_game2_url_valid
  CHECK (
    game2_url IS NULL
    OR game2_url ~ '^https://(www\.)?chessigma\.com/[^[:space:]]*$'
  ) NOT VALID;

-- Validasi terpisah: lock SHARE UPDATE EXCLUSIVE, tidak memblokir baca/tulis liga.
ALTER TABLE public.tco_league_results
  VALIDATE CONSTRAINT league_result_game1_url_valid;

ALTER TABLE public.tco_league_results
  VALIDATE CONSTRAINT league_result_game2_url_valid;
