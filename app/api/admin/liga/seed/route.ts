import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { requireAdmin } from "@/lib/admin-guard"
import type { Player, Schedule, GameResult } from "@/lib/league"

const SAMPLE_PGN = `1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Na5 10. Bc2 c5 11. d4 Qc7 12. Nbd2 cxd4 13. cxd4 Nc6 14. d5 Nb4 15. Bb1 a5 16. a3 Na6 17. b4 axb4 18. axb4 Nb8 19. Bb2 Nbd7 20. Nf1 Rfc8`
const PGN2 = `1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3 Nbd7 7. Rc1 c6 8. Bd3 dxc4 9. Bxc4 Nd5 10. Bxe7 Qxe7 11. O-O Nxc3 12. Rxc3 e5 13. dxe5 Nxe5 14. Nxe5 Qxe5 15. Qc2`
const PGN3 = `1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be3 e6 7. f3 b5 8. Qd2 Bb7 9. g4 h6 10. O-O-O b4 11. Nce2 Nbd7 12. h4 Qa5`

// Data awal mengikuti prototype TCO Chess League (Figma Make)
const PLAYER_DATA: [string, string, string, string, number][] = [
  ["p01", "Dimas Arkan", "dimas_ark", "Liga 1", 1986], ["p02", "Raka Pratama", "raka64", "Liga 1", 1942],
  ["p03", "Naufal Rizky", "naufalchess", "Liga 1", 1901], ["p04", "M. Fikri", "fichezz", "Liga 1", 1870],
  ["p05", "Aldi Firdaus", "aldfir", "Liga 1", 1844], ["p06", "Gilang Ramadhan", "gilang_r", "Liga 1", 1812],
  ["p07", "Fahmi Aulia", "fahmi_99", "Liga 1", 1789], ["p08", "Daffa Akbar", "daffaag", "Liga 1", 1742],
  ["p09", "Rizal Hidayat", "rizal_h", "Liga 1", 1706], ["p10", "Reno Maulana", "reno_blitz", "Liga 1", 1688],
  ["p11", "Bima Kurnia", "bima_k", "Liga 1", 1640], ["p12", "Ilham Putra", "ilham_king", "Liga 1", 1618],
  ["p13", "Arif Budiman", "arifB88", "Liga 2", 1598], ["p14", "Deni Santoso", "deni_chess", "Liga 2", 1572],
  ["p15", "Fauzan Malik", "fauzanM", "Liga 2", 1550], ["p16", "Hendra Wijaya", "hendra_w", "Liga 2", 1533],
  ["p17", "Ikhsan Fahri", "ikhsan_f", "Liga 2", 1510], ["p18", "Jaka Sanjaya", "jaka_s", "Liga 2", 1492],
  ["p19", "Kevin Prasetyo", "kevinP", "Liga 2", 1475], ["p20", "Luthfi Aziz", "luthfi_az", "Liga 2", 1455],
  ["p21", "Maulana Ihsan", "maulanaI", "Liga 2", 1440], ["p22", "Nanda Kurniawan", "nandaK", "Liga 2", 1422],
  ["p23", "Oki Prasetya", "oki_prs", "Liga 2", 1408], ["p24", "Putra Ramadan", "putraR", "Liga 2", 1392],
  ["p25", "Qiandra Saiful", "qiandra", "Liga 3", 1375], ["p26", "Rafi Akbar", "rafi_ak", "Liga 3", 1358],
  ["p27", "Satria Nugraha", "satriaNG", "Liga 3", 1342], ["p28", "Taufik Hidayat", "taufik_h", "Liga 3", 1325],
  ["p29", "Umar Bakrie", "umarB", "Liga 3", 1310], ["p30", "Vino Ardiansyah", "vinoA", "Liga 3", 1294],
  ["p31", "Wahyu Santoso", "wahyuS", "Liga 3", 1278], ["p32", "Yoga Purnama", "yogaP", "Liga 3", 1262],
  ["p33", "Zainal Abidin", "zainalA", "Liga 3", 1246], ["p34", "Andi Setiawan", "andiSW", "Liga 3", 1231],
  ["p35", "Bagas Saputra", "bagasS", "Liga 3", 1216], ["p36", "Candra Malik", "candraM", "Liga 3", 1201],
  ["p37", "Dika Pratama", "dikaP", "Liga 4", 1185], ["p38", "Egi Ramadhani", "egiR", "Liga 4", 1170],
  ["p39", "Fahrul Razi", "fahrulR", "Liga 4", 1154], ["p40", "Galih Permana", "galihP", "Liga 4", 1138],
  ["p41", "Hamid Fauzi", "hamidF", "Liga 4", 1122], ["p42", "Indra Setyawan", "indraS", "Liga 4", 1107],
  ["p43", "Jefri Nugraha", "jefriN", "Liga 4", 1091], ["p44", "Komang Suda", "komangS", "Liga 4", 1075],
  ["p45", "Lukas Tobing", "lukasT", "Liga 4", 1059], ["p46", "Made Gading", "madeG", "Liga 4", 1043],
  ["p47", "Nanang Prabu", "nanangP", "Liga 4", 1028], ["p48", "Okto Siregar", "oktoS", "Liga 4", 1012],
]

const SCHEDULE_DATA: [string, string, number, string, string, string, string, string][] = [
  ["s01", "Liga 1", 1, "p01", "p02", "2026-09-01", "19:00", "completed"],
  ["s02", "Liga 1", 1, "p03", "p04", "2026-09-02", "20:00", "completed"],
  ["s03", "Liga 1", 1, "p05", "p06", "2026-09-03", "19:30", "completed"],
  ["s04", "Liga 1", 2, "p07", "p08", "2026-09-08", "19:00", "completed"],
  ["s05", "Liga 1", 2, "p09", "p10", "2026-09-09", "20:00", "completed"],
  ["s06", "Liga 1", 2, "p11", "p12", "2026-09-10", "20:00", "completed"],
  ["s07", "Liga 1", 5, "p01", "p07", "2026-09-16", "19:00", "live"],
  ["s08", "Liga 1", 5, "p02", "p06", "2026-09-17", "20:00", "upcoming"],
  ["s09", "Liga 1", 5, "p03", "p05", "2026-09-18", "19:30", "upcoming"],
  ["s10", "Liga 2", 1, "p13", "p14", "2026-09-01", "19:00", "completed"],
  ["s11", "Liga 2", 1, "p15", "p16", "2026-09-02", "20:00", "completed"],
  ["s12", "Liga 2", 5, "p13", "p15", "2026-09-16", "19:00", "upcoming"],
  ["s13", "Liga 2", 5, "p14", "p16", "2026-09-17", "20:00", "upcoming"],
  ["s14", "Liga 3", 1, "p25", "p26", "2026-09-01", "19:00", "completed"],
  ["s15", "Liga 3", 5, "p25", "p27", "2026-09-16", "19:00", "upcoming"],
  ["s16", "Liga 4", 1, "p37", "p38", "2026-09-01", "19:00", "completed"],
  ["s17", "Liga 4", 5, "p37", "p39", "2026-09-16", "19:00", "upcoming"],
]

const RESULT_DATA: [string, string, number, number, string | null][] = [
  ["r01", "s01", 1.5, 0.5, SAMPLE_PGN],
  ["r02", "s02", 1, 1, PGN2],
  ["r03", "s03", 0, 2, PGN3],
  ["r04", "s04", 2, 0, null],
  ["r05", "s05", 1, 1, null],
  ["r06", "s06", 0.5, 1.5, null],
  ["r07", "s10", 1.5, 0.5, null],
  ["r08", "s11", 0.5, 1.5, null],
  ["r09", "s14", 2, 0, null],
  ["r10", "s16", 1, 1, null],
]

export async function POST(request: Request) {
  const guard = requireAdmin(request)
  if (guard instanceof NextResponse) return guard

  const supabase = getSupabaseAdmin()

  const { count } = await (supabase as any)
    .from("tco_league_players")
    .select("id", { count: "exact", head: true })

  if (count && count > 0) {
    return NextResponse.json({ success: false, error: "Data sudah ada. Hapus semua data player dulu untuk seed ulang." }, { status: 400 })
  }

  const players: Player[] = PLAYER_DATA.map(([id, name, username, league, elo]) => ({
    id, name, username, league: league as Player["league"], elo, elo_avg: 0, pp: "", wo_count: 0, status: "active",
  }))

  const schedules: Schedule[] = SCHEDULE_DATA.map(([id, league, round, p1, p2, date, time, status]) => ({
    id, league: league as Schedule["league"], round, player1_id: p1, player2_id: p2, date, time, status: status as Schedule["status"],
  }))

  const results: GameResult[] = RESULT_DATA.map(([id, sid, score1, score2, pgn]) => ({
    id, schedule_id: sid, score1, score2, pgn,
  }))

  const { error: playersErr } = await (supabase as any).from("tco_league_players").insert(players)
  if (playersErr) return NextResponse.json({ error: playersErr.message }, { status: 500 })

  const { error: schErr } = await (supabase as any).from("tco_league_schedules").insert(schedules)
  if (schErr) return NextResponse.json({ error: schErr.message }, { status: 500 })

  const { error: resErr } = await (supabase as any).from("tco_league_results").insert(results)
  if (resErr) return NextResponse.json({ error: resErr.message }, { status: 500 })

  const { data: seasonRow } = await (supabase as any)
    .from("tco_league_config")
    .select("*")
    .eq("key", "season")
    .single()
  if (!seasonRow) {
    await (supabase as any).from("tco_league_config").insert([{ key: "season", value: "1" }])
  }

  return NextResponse.json({ success: true, players: players.length, schedules: schedules.length, results: results.length })
}