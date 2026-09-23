import { useState, useMemo, useCallback } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

// ── Types ──────────────────────────────────────────────────────────────────────
type League = "Liga 1" | "Liga 2" | "Liga 3" | "Liga 4";
type AppView = "league" | "rules" | "admin";
type LeagueTab = "standing" | "coming" | "results";
type AdminTab = "players" | "schedule" | "score" | "season";

interface Player {
  id: string; name: string; username: string;
  league: League; elo: number;
  woCount: number; status: "active" | "disqualified";
}
interface Schedule {
  id: string; league: League; round: number;
  player1Id: string; player2Id: string;
  date: string; time: string;
  status: "upcoming" | "live" | "completed";
}
interface GameResult {
  id: string; scheduleId: string;
  score1: number; score2: number;
  pgn?: string;
}

// ── Config ─────────────────────────────────────────────────────────────────────
const LEAGUES: League[] = ["Liga 1", "Liga 2", "Liga 3", "Liga 4"];
const LC: Record<League, { color: string; soft: string; level: string; label: string }> = {
  "Liga 1": { color: "#00d9ff", soft: "rgba(0,217,255,.14)", level: "KASTA TERTINGGI", label: "CYBER BLUE" },
  "Liga 2": { color: "#ffad19", soft: "rgba(255,173,25,.14)", level: "PENANTANG ELIT", label: "FIRE AMBER" },
  "Liga 3": { color: "#66f24a", soft: "rgba(102,242,74,.14)", level: "ARENA KOMPETITIF", label: "ELECTRIC GREEN" },
  "Liga 4": { color: "#ff3aae", soft: "rgba(255,58,174,.14)", level: "KASTA AWAL", label: "NEON MAGENTA" },
};
const SCORE_OPTS = [
  { label: "2 – 0   (Player 1 menang semua)", s1: 2, s2: 0, wo: 0 },
  { label: "1.5 – 0.5   (Player 1 unggul)", s1: 1.5, s2: 0.5, wo: 0 },
  { label: "1 – 1   (Imbang / Draw)", s1: 1, s2: 1, wo: 0 },
  { label: "0.5 – 1.5   (Player 2 unggul)", s1: 0.5, s2: 1.5, wo: 0 },
  { label: "0 – 2   (Player 2 menang semua)", s1: 0, s2: 2, wo: 0 },
  { label: "WO — Player 1 forfeit (0 – 2)", s1: 0, s2: 2, wo: 1 },
  { label: "WO — Player 2 forfeit (2 – 0)", s1: 2, s2: 0, wo: 2 },
];

// ── Initial Data ───────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);
const mkP = (id: string, name: string, username: string, league: League, elo: number): Player =>
  ({ id, name, username, league, elo, woCount: 0, status: "active" });
const mkS = (id: string, league: League, round: number, p1: string, p2: string, date: string, time: string, status: Schedule["status"]): Schedule =>
  ({ id, league, round, player1Id: p1, player2Id: p2, date, time, status });
const mkR = (id: string, scheduleId: string, score1: number, score2: number, pgn?: string): GameResult =>
  ({ id, scheduleId, score1, score2, pgn });

const SAMPLE_PGN = `1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Na5 10. Bc2 c5 11. d4 Qc7 12. Nbd2 cxd4 13. cxd4 Nc6 14. d5 Nb4 15. Bb1 a5 16. a3 Na6 17. b4 axb4 18. axb4 Nb8 19. Bb2 Nbd7 20. Nf1 Rfc8`;
const PGN2 = `1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3 Nbd7 7. Rc1 c6 8. Bd3 dxc4 9. Bxc4 Nd5 10. Bxe7 Qxe7 11. O-O Nxc3 12. Rxc3 e5 13. dxe5 Nxe5 14. Nxe5 Qxe5 15. Qc2`;
const PGN3 = `1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be3 e6 7. f3 b5 8. Qd2 Bb7 9. g4 h6 10. O-O-O b4 11. Nce2 Nbd7 12. h4 Qa5`;

const INIT_PLAYERS: Player[] = [
  mkP("p01","Dimas Arkan","dimas_ark","Liga 1",1986),
  mkP("p02","Raka Pratama","raka64","Liga 1",1942),
  mkP("p03","Naufal Rizky","naufalchess","Liga 1",1901),
  mkP("p04","M. Fikri","fichezz","Liga 1",1870),
  mkP("p05","Aldi Firdaus","aldfir","Liga 1",1844),
  mkP("p06","Gilang Ramadhan","gilang_r","Liga 1",1812),
  mkP("p07","Fahmi Aulia","fahmi_99","Liga 1",1789),
  mkP("p08","Daffa Akbar","daffaag","Liga 1",1742),
  mkP("p09","Rizal Hidayat","rizal_h","Liga 1",1706),
  mkP("p10","Reno Maulana","reno_blitz","Liga 1",1688),
  mkP("p11","Bima Kurnia","bima_k","Liga 1",1640),
  mkP("p12","Ilham Putra","ilham_king","Liga 1",1618),
  mkP("p13","Arif Budiman","arifB88","Liga 2",1598),
  mkP("p14","Deni Santoso","deni_chess","Liga 2",1572),
  mkP("p15","Fauzan Malik","fauzanM","Liga 2",1550),
  mkP("p16","Hendra Wijaya","hendra_w","Liga 2",1533),
  mkP("p17","Ikhsan Fahri","ikhsan_f","Liga 2",1510),
  mkP("p18","Jaka Sanjaya","jaka_s","Liga 2",1492),
  mkP("p19","Kevin Prasetyo","kevinP","Liga 2",1475),
  mkP("p20","Luthfi Aziz","luthfi_az","Liga 2",1455),
  mkP("p21","Maulana Ihsan","maulanaI","Liga 2",1440),
  mkP("p22","Nanda Kurniawan","nandaK","Liga 2",1422),
  mkP("p23","Oki Prasetya","oki_prs","Liga 2",1408),
  mkP("p24","Putra Ramadan","putraR","Liga 2",1392),
  mkP("p25","Qiandra Saiful","qiandra","Liga 3",1375),
  mkP("p26","Rafi Akbar","rafi_ak","Liga 3",1358),
  mkP("p27","Satria Nugraha","satriaNG","Liga 3",1342),
  mkP("p28","Taufik Hidayat","taufik_h","Liga 3",1325),
  mkP("p29","Umar Bakrie","umarB","Liga 3",1310),
  mkP("p30","Vino Ardiansyah","vinoA","Liga 3",1294),
  mkP("p31","Wahyu Santoso","wahyuS","Liga 3",1278),
  mkP("p32","Yoga Purnama","yogaP","Liga 3",1262),
  mkP("p33","Zainal Abidin","zainalA","Liga 3",1246),
  mkP("p34","Andi Setiawan","andiSW","Liga 3",1231),
  mkP("p35","Bagas Saputra","bagasS","Liga 3",1216),
  mkP("p36","Candra Malik","candraM","Liga 3",1201),
  mkP("p37","Dika Pratama","dikaP","Liga 4",1185),
  mkP("p38","Egi Ramadhani","egiR","Liga 4",1170),
  mkP("p39","Fahrul Razi","fahrulR","Liga 4",1154),
  mkP("p40","Galih Permana","galihP","Liga 4",1138),
  mkP("p41","Hamid Fauzi","hamidF","Liga 4",1122),
  mkP("p42","Indra Setyawan","indraS","Liga 4",1107),
  mkP("p43","Jefri Nugraha","jefriN","Liga 4",1091),
  mkP("p44","Komang Suda","komangS","Liga 4",1075),
  mkP("p45","Lukas Tobing","lukasT","Liga 4",1059),
  mkP("p46","Made Gading","madeG","Liga 4",1043),
  mkP("p47","Nanang Prabu","nanangP","Liga 4",1028),
  mkP("p48","Okto Siregar","oktoS","Liga 4",1012),
];

const INIT_SCHEDULES: Schedule[] = [
  mkS("s01","Liga 1",1,"p01","p02","2026-09-01","19:00","completed"),
  mkS("s02","Liga 1",1,"p03","p04","2026-09-02","20:00","completed"),
  mkS("s03","Liga 1",1,"p05","p06","2026-09-03","19:30","completed"),
  mkS("s04","Liga 1",2,"p07","p08","2026-09-08","19:00","completed"),
  mkS("s05","Liga 1",2,"p09","p10","2026-09-09","20:00","completed"),
  mkS("s06","Liga 1",2,"p11","p12","2026-09-10","20:00","completed"),
  mkS("s07","Liga 1",5,"p01","p07","2026-09-16","19:00","live"),
  mkS("s08","Liga 1",5,"p02","p06","2026-09-17","20:00","upcoming"),
  mkS("s09","Liga 1",5,"p03","p05","2026-09-18","19:30","upcoming"),
  mkS("s10","Liga 2",1,"p13","p14","2026-09-01","19:00","completed"),
  mkS("s11","Liga 2",1,"p15","p16","2026-09-02","20:00","completed"),
  mkS("s12","Liga 2",5,"p13","p15","2026-09-16","19:00","upcoming"),
  mkS("s13","Liga 2",5,"p14","p16","2026-09-17","20:00","upcoming"),
  mkS("s14","Liga 3",1,"p25","p26","2026-09-01","19:00","completed"),
  mkS("s15","Liga 3",5,"p25","p27","2026-09-16","19:00","upcoming"),
  mkS("s16","Liga 4",1,"p37","p38","2026-09-01","19:00","completed"),
  mkS("s17","Liga 4",5,"p37","p39","2026-09-16","19:00","upcoming"),
];

const INIT_RESULTS: GameResult[] = [
  mkR("r01","s01",1.5,0.5,SAMPLE_PGN),
  mkR("r02","s02",1,1,PGN2),
  mkR("r03","s03",0,2,PGN3),
  mkR("r04","s04",2,0),
  mkR("r05","s05",1,1),
  mkR("r06","s06",0.5,1.5),
  mkR("r07","s10",1.5,0.5),
  mkR("r08","s11",0.5,1.5),
  mkR("r09","s14",2,0),
  mkR("r10","s16",1,1),
];

// ── Standings computation ──────────────────────────────────────────────────────
function computeStandings(players: Player[], schedules: Schedule[], results: GameResult[]) {
  const rMap = new Map(results.map(r => [r.scheduleId, r]));
  type Stat = { mp: number; w: number; d: number; l: number; pts: number };
  const stats = new Map<string, Stat>(players.map(p => [p.id, { mp: 0, w: 0, d: 0, l: 0, pts: 0 }]));
  for (const s of schedules) {
    if (s.status !== "completed") continue;
    const r = rMap.get(s.id);
    if (!r) continue;
    const s1 = stats.get(s.player1Id);
    const s2 = stats.get(s.player2Id);
    if (s1) { s1.mp++; s1.pts += r.score1; if (r.score1 > r.score2) s1.w++; else if (r.score1 === r.score2) s1.d++; else s1.l++; }
    if (s2) { s2.mp++; s2.pts += r.score2; if (r.score2 > r.score1) s2.w++; else if (r.score2 === r.score1) s2.d++; else s2.l++; }
  }
  return players.map(p => ({ ...p, ...stats.get(p.id)! })).sort((a, b) => b.pts - a.pts || b.w - a.w || b.elo - a.elo);
}

// ── Small shared components ────────────────────────────────────────────────────
function Logo() {
  return (
    <div className="brand">
      <span className="brand-piece">♞</span><span>TCO</span><small>LEAGUE</small>
    </div>
  );
}

function Av({ name, color, size = 31 }: { name: string; color: string; size?: number }) {
  return (
    <span className="avatar" style={{ borderColor: color, width: size, height: size, fontSize: size < 30 ? 8 : 9 }}>
      {name.split(" ").map(x => x[0]).slice(0, 2).join("")}
    </span>
  );
}

function ScoreTag({ s1, s2 }: { s1: number; s2: number }) {
  const col = s1 > s2 ? "#65f396" : s1 < s2 ? "#ff6b7a" : "#c8d6e8";
  return <b style={{ color: col, fontFamily: "Oxanium", fontSize: 16 }}>{s1} — {s2}</b>;
}

// ── Analysis Modal ─────────────────────────────────────────────────────────────
function AnalysisModal({ result, schedule, players, onClose }: {
  result: GameResult; schedule: Schedule; players: Player[]; onClose: () => void;
}) {
  const p1 = players.find(p => p.id === schedule.player1Id);
  const p2 = players.find(p => p.id === schedule.player2Id);
  const color = LC[schedule.league]?.color || "#00d9ff";
  const [moveIdx, setMoveIdx] = useState(-1);

  const { positions, moveList } = useMemo(() => {
    const init = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    if (!result?.pgn) return { positions: [init], moveList: [] as string[] };
    try {
      const chess = new Chess();
      chess.loadPgn(result.pgn);
      const ml = chess.history();
      const pos = [init];
      const c = new Chess();
      ml.forEach(m => { c.move(m); pos.push(c.fen()); });
      return { positions: pos, moveList: ml };
    } catch {
      return { positions: [init], moveList: [] as string[] };
    }
  }, [result?.pgn]);

  const curFen = positions[Math.min(moveIdx + 1, positions.length - 1)] || positions[0];

  const evalScore = useMemo(() => {
    const pv: Record<string, number> = { Q: 9, R: 5, B: 3.2, N: 3, P: 1, q: -9, r: -5, b: -3.2, n: -3, p: -1 };
    return Math.round(curFen.split(" ")[0].split("").reduce((acc, c) => acc + (pv[c] || 0), 0) * 10) / 10;
  }, [curFen]);

  const evalPct = Math.max(5, Math.min(95, 50 - evalScore * 6));

  const nav = (dir: "first" | "prev" | "next" | "last") => {
    setMoveIdx(m => {
      if (dir === "first") return -1;
      if (dir === "last") return moveList.length - 1;
      if (dir === "prev") return Math.max(-1, m - 1);
      return Math.min(moveList.length - 1, m + 1);
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="am2" onClick={e => e.stopPropagation()}>
        <button className="close" onClick={onClose}>×</button>
        <div className="am2-head">
          <p className="eyebrow" style={{ color }}>DEEP ANALYSIS · ROUND {String(schedule.round).padStart(2, "0")}</p>
          <h2 style={{ fontFamily: "Oxanium", fontSize: 20, margin: "6px 0 2px", letterSpacing: -0.5 }}>
            {p1?.name} <span style={{ color }}>{result.score1} — {result.score2}</span> {p2?.name}
          </h2>
          <small style={{ color: "#7a8ea6", fontSize: 11 }}>@{p1?.username} vs @{p2?.username} · Blitz 5+0 · 2 Games · {new Date(schedule.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</small>
        </div>
        <div className="am2-body">
          <div className="am2-board-col">
            <div className="eval-bar" title={`Eval: ${evalScore > 0 ? "+" : ""}${evalScore}`}>
              <div className="eval-dark" style={{ height: `${evalPct}%` }} />
              <div className="eval-light" style={{ height: `${100 - evalPct}%` }} />
              <span className="eval-bar-num" style={{ top: evalPct > 50 ? "auto" : 2, bottom: evalPct <= 50 ? "auto" : 2 }}>
                {evalScore > 0 ? "+" : ""}{evalScore}
              </span>
            </div>
            <div style={{ width: 320 }}>
              <Chessboard
                options={{
                  position: curFen,
                  allowDragging: false,
                  darkSquareStyle: { backgroundColor: "#4b6a7c" },
                  lightSquareStyle: { backgroundColor: "#b8d0d9" },
                  boardStyle: { width: "100%" },
                }}
              />
            </div>
          </div>
          <div className="am2-side">
            <div className="eval-info-row">
              <span className="eval-num" style={{ color }}>{evalScore > 0 ? "+" : ""}{evalScore}</span>
              <span className="eval-desc">
                {evalScore > 1.5 ? "Putih unggul jelas" : evalScore > 0.5 ? "Putih unggul" : evalScore < -1.5 ? "Hitam unggul jelas" : evalScore < -0.5 ? "Hitam unggul" : "Posisi seimbang"}
              </span>
            </div>
            <div className="nav-btns">
              {(["first","prev","next","last"] as const).map(d => (
                <button key={d} className="nav-btn" onClick={() => nav(d)}>
                  {d === "first" ? "⏮" : d === "prev" ? "◀" : d === "next" ? "▶" : "⏭"}
                </button>
              ))}
            </div>
            <div className="move-counter">
              {moveIdx === -1 ? "Posisi awal" : `Langkah ${moveIdx + 1} dari ${moveList.length}`}
            </div>
            <div className="ml-scroll">
              {moveList.length === 0 ? (
                <div className="pgn-placeholder">
                  <span>🔬</span>
                  <p>PGN belum tersedia. Admin dapat menginput PGN di halaman Admin → Skor &amp; PGN untuk mengaktifkan analisis papan.</p>
                </div>
              ) : (
                Array.from({ length: Math.ceil(moveList.length / 2) }, (_, i) => (
                  <div key={i} className="ml-row">
                    <span className="ml-num">{i + 1}.</span>
                    <span className={`ml-move ${moveIdx === i * 2 ? "ml-cur" : ""}`} onClick={() => setMoveIdx(i * 2)}>
                      {moveList[i * 2]}
                    </span>
                    {moveList[i * 2 + 1] && (
                      <span className={`ml-move ${moveIdx === i * 2 + 1 ? "ml-cur" : ""}`} onClick={() => setMoveIdx(i * 2 + 1)}>
                        {moveList[i * 2 + 1]}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Admin: Players ─────────────────────────────────────────────────────────────
function AdminPlayers({ players, setPlayers }: {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
}) {
  const [form, setForm] = useState({ name: "", username: "", league: "Liga 1" as League, elo: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const [fetchErr, setFetchErr] = useState("");
  const [filter, setFilter] = useState<League | "">("");

  const displayed = filter ? players.filter(p => p.league === filter) : players;

  const fetchChesscom = async () => {
    if (!form.username.trim()) return;
    setFetching(true); setFetchErr("");
    try {
      const res = await fetch(`https://api.chess.com/pub/player/${form.username.trim()}/stats`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const elo = data.chess_blitz?.last?.rating || data.chess_rapid?.last?.rating || 0;
      if (!elo) throw new Error();
      setForm(f => ({ ...f, elo: String(elo) }));
    } catch {
      setFetchErr("Gagal ambil data. Isi ELO secara manual.");
    } finally {
      setFetching(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      setPlayers(prev => prev.map(p => p.id === editId
        ? { ...p, name: form.name, username: form.username, league: form.league, elo: Number(form.elo) }
        : p));
      setEditId(null);
    } else {
      setPlayers(prev => [...prev, { id: uid(), name: form.name, username: form.username, league: form.league, elo: Number(form.elo), woCount: 0, status: "active" }]);
    }
    setForm({ name: "", username: "", league: "Liga 1", elo: "" }); setFetchErr("");
  };

  const startEdit = (p: Player) => {
    setEditId(p.id);
    setForm({ name: p.name, username: p.username, league: p.league, elo: String(p.elo) });
  };

  const del = (id: string) => {
    if (window.confirm("Hapus peserta ini dari sistem?")) setPlayers(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="admin2-col">
      <form className="admin-card" onSubmit={submit}>
        <h3 className="ac-title">{editId ? "✎ Edit Peserta" : "+ Tambah Peserta Baru"}</h3>
        <label className="ac-label">Nama Lengkap
          <input required className="ac-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nama lengkap player" />
        </label>
        <label className="ac-label">Chess.com Username
          <div className="fetch-row">
            <input className="ac-input" style={{ flex: 1 }} value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="username_chesscom" />
            <button type="button" className="fetch-btn" onClick={fetchChesscom} disabled={fetching || !form.username.trim()}>
              {fetching ? "···" : "Fetch ELO"}
            </button>
          </div>
        </label>
        {fetchErr && <p className="err-msg">{fetchErr}</p>}
        <label className="ac-label">Blitz ELO
          <input required type="number" className="ac-input" value={form.elo} onChange={e => setForm(f => ({ ...f, elo: e.target.value }))} placeholder="Contoh: 1500" />
        </label>
        <label className="ac-label">Divisi
          <select className="ac-input" value={form.league} onChange={e => setForm(f => ({ ...f, league: e.target.value as League }))}>
            {LEAGUES.map(l => <option key={l}>{l}</option>)}
          </select>
        </label>
        <div className="form-actions">
          <button className="primary-btn" type="submit" style={{ flex: 1 }}>{editId ? "Simpan Perubahan" : "+ Tambah ke Liga"}</button>
          {editId && <button type="button" className="outline-btn" onClick={() => { setEditId(null); setForm({ name: "", username: "", league: "Liga 1", elo: "" }); }}>Batal</button>}
        </div>
      </form>

      <div className="admin-card" style={{ minHeight: 420 }}>
        <div className="player-list-top">
          <h3 className="ac-title">Semua Peserta <span className="ac-count">({displayed.length}/{players.length})</span></h3>
          <select className="ac-input" style={{ width: "auto", padding: "6px 10px" }} value={filter} onChange={e => setFilter(e.target.value as League | "")}>
            <option value="">Semua Liga</option>
            {LEAGUES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="player-list-body">
          {displayed.map(p => (
            <div key={p.id} className="pli">
              <Av name={p.name} color={LC[p.league].color} />
              <div className="pli-info">
                <b>{p.name}</b>
                <small>@{p.username} · {p.elo} ELO · <span style={{ color: LC[p.league].color }}>{p.league}</span>{p.woCount > 0 && <span className="wo-badge"> WO×{p.woCount}</span>}</small>
              </div>
              <div className="pli-actions">
                <button className="icon-btn" onClick={() => startEdit(p)} title="Edit">✎</button>
                <button className="icon-btn danger" onClick={() => del(p.id)} title="Hapus">×</button>
              </div>
            </div>
          ))}
          {displayed.length === 0 && <p className="muted" style={{ padding: "20px 0" }}>Tidak ada peserta.</p>}
        </div>
      </div>
    </div>
  );
}

// ── Admin: Schedule ────────────────────────────────────────────────────────────
function AdminSchedule({ players, schedules, setSchedules }: {
  players: Player[];
  schedules: Schedule[];
  setSchedules: React.Dispatch<React.SetStateAction<Schedule[]>>;
}) {
  const [form, setForm] = useState({ league: "Liga 1" as League, round: "1", player1Id: "", player2Id: "", date: "", time: "19:00", status: "upcoming" as Schedule["status"] });
  const [editId, setEditId] = useState<string | null>(null);
  const [filterL, setFilterL] = useState<League>("Liga 1");

  const lPlayers = players.filter(p => p.league === form.league);
  const displayed = schedules.filter(s => s.league === filterL).sort((a, b) => a.round - b.round || a.date.localeCompare(b.date));
  const getPlayer = (id: string) => players.find(p => p.id === id);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.player1Id === form.player2Id) { alert("Pilih player yang berbeda!"); return; }
    const data = { ...form, round: Number(form.round) };
    if (editId) {
      setSchedules(prev => prev.map(s => s.id === editId ? { ...s, ...data } : s));
      setEditId(null);
    } else {
      setSchedules(prev => [...prev, { id: uid(), ...data }]);
    }
    setForm({ league: "Liga 1", round: "1", player1Id: "", player2Id: "", date: "", time: "19:00", status: "upcoming" });
  };

  const startEdit = (s: Schedule) => {
    setEditId(s.id);
    setForm({ league: s.league, round: String(s.round), player1Id: s.player1Id, player2Id: s.player2Id, date: s.date, time: s.time, status: s.status });
  };

  const del = (id: string) => { if (window.confirm("Hapus jadwal ini?")) setSchedules(prev => prev.filter(s => s.id !== id)); };

  const statusColor: Record<string, string> = { upcoming: "#8a9ab5", live: "#65f396", completed: "#6a7a8a" };

  return (
    <div className="admin2-col">
      <form className="admin-card" onSubmit={submit}>
        <h3 className="ac-title">{editId ? "✎ Edit Jadwal" : "+ Tambah Jadwal Match"}</h3>
        <div className="form2">
          <label className="ac-label">Liga
            <select className="ac-input" value={form.league} onChange={e => setForm(f => ({ ...f, league: e.target.value as League, player1Id: "", player2Id: "" }))}>
              {LEAGUES.map(l => <option key={l}>{l}</option>)}
            </select>
          </label>
          <label className="ac-label">Round
            <input type="number" min={1} className="ac-input" value={form.round} onChange={e => setForm(f => ({ ...f, round: e.target.value }))} />
          </label>
        </div>
        <label className="ac-label">Player 1
          <select required className="ac-input" value={form.player1Id} onChange={e => setForm(f => ({ ...f, player1Id: e.target.value }))}>
            <option value="">— Pilih Player 1 —</option>
            {lPlayers.map(p => <option key={p.id} value={p.id}>{p.name} ({p.elo} ELO)</option>)}
          </select>
        </label>
        <label className="ac-label">Player 2
          <select required className="ac-input" value={form.player2Id} onChange={e => setForm(f => ({ ...f, player2Id: e.target.value }))}>
            <option value="">— Pilih Player 2 —</option>
            {lPlayers.filter(p => p.id !== form.player1Id).map(p => <option key={p.id} value={p.id}>{p.name} ({p.elo} ELO)</option>)}
          </select>
        </label>
        <div className="form2">
          <label className="ac-label">Tanggal
            <input type="date" required className="ac-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </label>
          <label className="ac-label">Jam (WIB)
            <input type="time" className="ac-input" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
          </label>
        </div>
        <label className="ac-label">Status
          <select className="ac-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Schedule["status"] }))}>
            <option value="upcoming">Upcoming</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
          </select>
        </label>
        <div className="form-actions">
          <button className="primary-btn" type="submit" style={{ flex: 1 }}>{editId ? "Simpan" : "Tambah Jadwal"}</button>
          {editId && <button type="button" className="outline-btn" onClick={() => setEditId(null)}>Batal</button>}
        </div>
      </form>

      <div className="admin-card" style={{ minHeight: 420 }}>
        <div className="player-list-top">
          <h3 className="ac-title">Jadwal <span className="ac-count">({displayed.length})</span></h3>
          <select className="ac-input" style={{ width: "auto", padding: "6px 10px" }} value={filterL} onChange={e => setFilterL(e.target.value as League)}>
            {LEAGUES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="player-list-body">
          {displayed.map(s => {
            const p1 = getPlayer(s.player1Id);
            const p2 = getPlayer(s.player2Id);
            return (
              <div key={s.id} className="sli">
                <div className="sli-info">
                  <div className="sli-round">RND {s.round} · <span style={{ color: statusColor[s.status], fontWeight: 700 }}>{s.status.toUpperCase()}</span></div>
                  <div className="sli-players">{p1?.name || "?"} <em>vs</em> {p2?.name || "?"}</div>
                  <div className="sli-date">{s.date} · {s.time} WIB</div>
                </div>
                <div className="pli-actions">
                  <button className="icon-btn" onClick={() => startEdit(s)}>✎</button>
                  <button className="icon-btn danger" onClick={() => del(s.id)}>×</button>
                </div>
              </div>
            );
          })}
          {displayed.length === 0 && <p className="muted" style={{ padding: "20px 0" }}>Belum ada jadwal di {filterL}.</p>}
        </div>
      </div>
    </div>
  );
}

// ── Admin: Score & PGN ─────────────────────────────────────────────────────────
function AdminScore({ players, schedules, setSchedules, results, setResults, setPlayers }: {
  players: Player[];
  schedules: Schedule[];
  setSchedules: React.Dispatch<React.SetStateAction<Schedule[]>>;
  results: GameResult[];
  setResults: React.Dispatch<React.SetStateAction<GameResult[]>>;
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
}) {
  const [filterL, setFilterL] = useState<League>("Liga 1");
  const [selId, setSelId] = useState<string>("");
  const [scoreIdx, setScoreIdx] = useState(2);
  const [pgn, setPgn] = useState("");
  const [saved, setSaved] = useState(false);

  const rMap = useMemo(() => new Map(results.map(r => [r.scheduleId, r])), [results]);
  const getPlayer = (id: string) => players.find(p => p.id === id);

  const lSchedules = schedules.filter(s => s.league === filterL).sort((a, b) => a.round - b.round || a.date.localeCompare(b.date));
  const sel = selId ? schedules.find(s => s.id === selId) : null;
  const existing = sel ? rMap.get(sel.id) : null;

  const selectMatch = (id: string) => {
    setSelId(id);
    setSaved(false);
    const ex = rMap.get(id);
    if (ex) {
      const idx = SCORE_OPTS.findIndex(o => o.s1 === ex.score1 && o.s2 === ex.score2);
      setScoreIdx(idx >= 0 ? idx : 2);
      setPgn(ex.pgn || "");
    } else {
      setScoreIdx(2); setPgn("");
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sel) return;
    const opt = SCORE_OPTS[scoreIdx];

    setResults(prev => [...prev.filter(r => r.scheduleId !== sel.id), { id: existing?.id || uid(), scheduleId: sel.id, score1: opt.s1, score2: opt.s2, pgn: pgn.trim() || undefined }]);
    setSchedules(prev => prev.map(s => s.id === sel.id ? { ...s, status: "completed" } : s));

    if (opt.wo === 1) setPlayers(prev => prev.map(p => p.id === sel.player1Id ? { ...p, woCount: p.woCount + 1, status: p.woCount >= 2 ? "disqualified" : "active" } : p));
    if (opt.wo === 2) setPlayers(prev => prev.map(p => p.id === sel.player2Id ? { ...p, woCount: p.woCount + 1, status: p.woCount >= 2 ? "disqualified" : "active" } : p));

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="admin2-col">
      <div className="admin-card">
        <h3 className="ac-title">Pilih Match</h3>
        <label className="ac-label">Liga
          <select className="ac-input" value={filterL} onChange={e => { setFilterL(e.target.value as League); setSelId(""); }}>
            {LEAGUES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>
        <div className="score-match-list">
          {lSchedules.map(s => {
            const p1 = getPlayer(s.player1Id);
            const p2 = getPlayer(s.player2Id);
            const r = rMap.get(s.id);
            return (
              <div key={s.id} className={`smi ${selId === s.id ? "smi-sel" : ""}`} onClick={() => selectMatch(s.id)}>
                <div className="smi-left">
                  <span className="smi-round">R{s.round}</span>
                  <span className="smi-players">{p1?.name || "?"} <em>vs</em> {p2?.name || "?"}</span>
                  <span className="smi-date">{s.date}</span>
                </div>
                <div className="smi-right">
                  {r ? <ScoreTag s1={r.score1} s2={r.score2} /> : <span className="smi-pending">{s.status === "live" ? "🔴 LIVE" : "—"}</span>}
                  {r?.pgn && <span className="pgn-dot" title="PGN tersedia">PGN</span>}
                </div>
              </div>
            );
          })}
          {lSchedules.length === 0 && <p className="muted" style={{ padding: "16px 0" }}>Belum ada jadwal di {filterL}.</p>}
        </div>
      </div>

      {sel ? (
        <form className="admin-card" onSubmit={submit}>
          <h3 className="ac-title">Update Skor & PGN</h3>
          <div className="match-preview">
            <div className="mp-player">
              <Av name={getPlayer(sel.player1Id)?.name || "?"} color={LC[filterL].color} size={36} />
              <div><b>{getPlayer(sel.player1Id)?.name}</b><small>Player 1</small></div>
            </div>
            <div className="mp-vs">VS</div>
            <div className="mp-player">
              <Av name={getPlayer(sel.player2Id)?.name || "?"} color={LC[filterL].color} size={36} />
              <div><b>{getPlayer(sel.player2Id)?.name}</b><small>Player 2</small></div>
            </div>
          </div>
          <label className="ac-label">Hasil (2 game · tanpa keterangan warna)
            <select className="ac-input" value={scoreIdx} onChange={e => setScoreIdx(Number(e.target.value))}>
              {SCORE_OPTS.map((o, i) => <option key={i} value={i}>{o.label}</option>)}
            </select>
          </label>
          <label className="ac-label">PGN Pertandingan <span style={{ color: "#6a7a8a", fontWeight: 400 }}>(opsional — untuk analisis papan)</span>
            <textarea className="ac-input ac-pgn" value={pgn} onChange={e => setPgn(e.target.value)} placeholder={"Paste PGN di sini...\nContoh: 1. e4 e5 2. Nf3 Nc6 3. Bb5..."} rows={5} />
          </label>
          <button className="primary-btn" type="submit" style={{ width: "100%", background: saved ? "#1c4a2a" : undefined, borderColor: saved ? "#65f396" : undefined }}>
            {saved ? "✓ Skor & PGN Tersimpan!" : "Simpan Skor & PGN"}
          </button>
        </form>
      ) : (
        <div className="admin-card" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 260 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>←</div>
            <p className="muted">Pilih match dari daftar untuk update skor dan input PGN</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Admin: Season Transition ───────────────────────────────────────────────────
function AdminSeason({ players, setPlayers, allSchedules, allResults, setNotice }: {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  allSchedules: Schedule[];
  allResults: GameResult[];
  setNotice: (s: string) => void;
}) {
  const preview = useMemo(() => {
    return LEAGUES.map(lg => {
      const lp = players.filter(p => p.league === lg);
      const ls = allSchedules.filter(s => s.league === lg);
      return { lg, standings: computeStandings(lp, ls, allResults) };
    });
  }, [players, allSchedules, allResults]);

  const simulate = () => {
    const moves: Record<string, League> = {};
    preview.forEach(({ lg, standings }, idx) => {
      if (idx > 0) standings.slice(0, 2).forEach(p => { moves[p.id] = LEAGUES[idx - 1]; });
      if (idx < 3) standings.slice(-2).forEach(p => { moves[p.id] = LEAGUES[idx + 1]; });
    });
    setPlayers(prev => prev.map(p => moves[p.id] ? { ...p, league: moves[p.id] } : p));
    setNotice("Transisi Season 02 diterapkan! Cek halaman Liga untuk melihat perubahan klasemen.");
  };

  return (
    <div className="season-page">
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <h3 className="ac-title">Transisi Season</h3>
        <p style={{ color: "#8fa0b3", margin: "10px 0 20px", fontSize: 13, lineHeight: 1.6 }}>
          Proses promosi 2 pemain teratas dan degradasi 2 pemain terbawah dari tiap liga.<br />
          Berdasarkan klasemen akhir, pemain akan dipindah ke divisi yang sesuai untuk Season 02.
        </p>
        <div className="season-preview">
          {preview.map(({ lg, standings }, idx) => (
            <div key={lg} className="sp-block" style={{ borderTopColor: LC[lg].color }}>
              <div className="sp-header" style={{ color: LC[lg].color }}>{lg}</div>
              {standings.slice(0, 2).map(p => (
                <div key={p.id} className="sp-row sp-promo">
                  ↑ {p.name} <span>{p.pts.toFixed(1)} pts</span>
                  {idx > 0 && <em style={{ color: LC[LEAGUES[idx - 1]].color }}>→ {LEAGUES[idx - 1]}</em>}
                </div>
              ))}
              <div className="sp-divider" />
              {standings.slice(-2).map(p => (
                <div key={p.id} className="sp-row sp-degrade">
                  ↓ {p.name} <span>{p.pts.toFixed(1)} pts</span>
                  {idx < 3 && <em style={{ color: LC[LEAGUES[idx + 1]].color }}>→ {LEAGUES[idx + 1]}</em>}
                </div>
              ))}
            </div>
          ))}
        </div>
        <button className="primary-btn" style={{ marginTop: 24 }} onClick={simulate}>
          🔄 Terapkan Transisi Season 02
        </button>
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [players, setPlayers] = useState<Player[]>(INIT_PLAYERS);
  const [schedules, setSchedules] = useState<Schedule[]>(INIT_SCHEDULES);
  const [results, setResults] = useState<GameResult[]>(INIT_RESULTS);
  const [league, setLeague] = useState<League>("Liga 1");
  const [leagueTab, setLeagueTab] = useState<LeagueTab>("standing");
  const [view, setView] = useState<AppView>("league");
  const [adminTab, setAdminTab] = useState<AdminTab>("players");
  const [analysis, setAnalysis] = useState<{ result: GameResult; schedule: Schedule } | null>(null);
  const [notice, setNotice] = useState("");

  const cfg = LC[league];
  const style = { "--league": cfg.color, "--league-soft": cfg.soft } as React.CSSProperties;

  const rMap = useMemo(() => new Map(results.map(r => [r.scheduleId, r])), [results]);
  const leaguePlayers = useMemo(() => players.filter(p => p.league === league), [players, league]);
  const leagueSchedules = useMemo(() => schedules.filter(s => s.league === league), [schedules, league]);
  const standings = useMemo(() => computeStandings(leaguePlayers, leagueSchedules, results), [leaguePlayers, leagueSchedules, results]);
  const comingUp = useMemo(() => leagueSchedules.filter(s => s.status === "upcoming" || s.status === "live").sort((a, b) => a.round - b.round || a.date.localeCompare(b.date)), [leagueSchedules]);
  const completed = useMemo(() => leagueSchedules.filter(s => s.status === "completed").sort((a, b) => b.date.localeCompare(a.date)), [leagueSchedules]);

  const getPlayer = useCallback((id: string) => players.find(p => p.id === id), [players]);

  const exportCsv = () => {
    const csv = ["Posisi,Nama,Chess.com,ELO,MP,W,D,L,Poin",
      ...standings.map((p, i) => [i + 1, p.name, p.username, p.elo, p.mp, p.w, p.d, p.l, p.pts.toFixed(1)].join(","))
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `tco-${league.toLowerCase().replace(" ", "-")}-s1.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    setNotice("CSV klasemen berhasil diunduh.");
  };

  const openAnalysis = (scheduleId: string) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    const result = rMap.get(scheduleId);
    if (schedule && result) setAnalysis({ schedule, result });
  };

  const rules = [
    "Setiap player bermain melawan seluruh player di divisinya (Round Robin).",
    "Dua game Blitz 5 menit, warna bergantian, rated, menggunakan akun Chess.com utama.",
    "Waktu bermain ditentukan kedua pemain; koordinasi lewat japri atau grup TCO.",
    "Periode ronde: Senin 01.00 WIB hingga Minggu 19.00 WIB.",
    "Wajib lapor di grup TCO sebelum bermain. Tanpa laporan, match dianggap tidak sah.",
    "Dilarang bermain sambil live streaming. Hasil dilaporkan ke koordinator liga.",
    "WO: 1× −1 poin, 2× −3 poin, 3× diskualifikasi dari Liga.",
    "Akun dan nama akun tidak boleh diganti selama kompetisi berlangsung.",
    "Minimal 48 player tanpa batas maksimal; player diratakan tiap divisi.",
    "Promosi dan degradasi 2 pemain per musim antara liga yang berdekatan.",
  ];

  return (
    <main style={style} className="app-shell">
      <div className="scanlines" />
      <header className="topbar">
        <Logo />
        <nav>
          <button onClick={() => setView("league")} className={view === "league" ? "active" : ""}>Liga</button>
          <button onClick={() => setView("rules")} className={view === "rules" ? "active" : ""}>Regulasi</button>
          <button onClick={() => setView("admin")} className={view === "admin" ? "active" : ""}>Admin</button>
        </nav>
        <button className="live-pill"><i /> SEASON 01 ACTIVE</button>
      </header>

      {/* ── LEAGUE VIEW ── */}
      {view === "league" && (
        <>
          <section className="hero">
            <div className="hero-copy">
              <p className="eyebrow">TIKTOK CHESS ONLINE PRESENTS</p>
              <h1><small>LIGA CATUR</small>TCO <span>SEASON 01</span></h1>
              <p className="subtitle">ROAD TO MASTER TCO — Kompetisi internal, empat kasta, satu arena.</p>
              <div className="hero-actions">
                <button className="primary-btn" onClick={() => { setView("league"); setLeagueTab("coming"); }}>Lihat Match Pekan Ini</button>
                <button className="text-btn" onClick={() => setView("rules")}>Pelajari aturan →</button>
              </div>
            </div>
            <div className="countdown">
              <span>RONDE BERIKUTNYA DIMULAI DALAM</span>
              <div><b>02</b><b>14</b><b>36</b></div>
              <small>HARI&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;JAM&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MENIT</small>
            </div>
          </section>

          <section className="league-picker">
            {LEAGUES.map(item => (
              <button key={item} onClick={() => { setLeague(item); setLeagueTab("standing"); }} className={league === item ? "selected" : ""} style={{ "--item": LC[item].color } as React.CSSProperties}>
                <small>{["01","02","03","04"][LEAGUES.indexOf(item)]}</small>
                <b>{item}</b><span>{LC[item].level}</span>
              </button>
            ))}
          </section>

          <section className="league-panel">
            <div className="panel-title">
              <div>
                <p className="eyebrow" style={{ color: cfg.color }}>{cfg.label}</p>
                <h2>TCO {league.toUpperCase()}</h2>
                <span>{cfg.level} · ROUND ROBIN · {leaguePlayers.length} PLAYER</span>
              </div>
              <div className="export-actions">
                <button onClick={exportCsv}>⇩ EXPORT CSV</button>
                <button onClick={() => window.print()}>▣ EXPORT JPG</button>
              </div>
            </div>
            <div className="tabs">
              {(["standing","coming","results"] as LeagueTab[]).map(t => (
                <button key={t} onClick={() => setLeagueTab(t)} className={leagueTab === t ? "selected" : ""}>
                  {t === "standing" ? "01 · Klasemen" : t === "coming" ? "02 · Coming Up" : "03 · Results"}
                </button>
              ))}
            </div>

            {/* STANDING */}
            {leagueTab === "standing" && (
              <section className="table-shell">
                <div className="table-head"><span>POS</span><span>PEMAIN</span><span>ELO</span><span>MP</span><span>W</span><span>D</span><span>L</span><span>PTS</span></div>
                {standings.map((p, i) => (
                  <div key={p.id} className={`standing-row ${i < 2 ? "promotion" : i >= standings.length - 2 ? "relegation" : ""}`}>
                    <span className="position">{i + 1}{i < 2 ? " ↑" : i >= standings.length - 2 ? " ↓" : ""}</span>
                    <span className="player"><Av name={p.name} color={cfg.color} /><b>{p.name}</b><small>@{p.username}</small></span>
                    <span>{p.elo}</span><span>{p.mp}</span><span>{p.w}</span><span>{p.d}</span><span>{p.l}</span>
                    <strong>{p.pts.toFixed(1)}</strong>
                  </div>
                ))}
                {standings.length === 0 && <p className="muted" style={{ padding: 24 }}>Belum ada peserta di {league}.</p>}
              </section>
            )}

            {/* COMING UP */}
            {leagueTab === "coming" && (
              <section className="match-list">
                {comingUp.length === 0 && <p className="muted" style={{ padding: 24 }}>Belum ada jadwal coming up di {league}.</p>}
                {comingUp.map(s => {
                  const p1 = getPlayer(s.player1Id);
                  const p2 = getPlayer(s.player2Id);
                  return (
                    <article key={s.id} className="match-card">
                      <div className="match-meta">
                        <span>ROUND {String(s.round).padStart(2, "0")}</span>
                        <span>{new Date(s.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} · {s.time} WIB</span>
                        <b>{s.status === "live" ? "🔴 LIVE THIS WEEK" : "COMING UP"}</b>
                      </div>
                      <div className="versus">
                        <div><Av name={p1?.name || "?"} color={cfg.color} /><strong>{p1?.name || "?"}</strong><small>{p1?.elo} ELO</small></div>
                        <em>VS</em>
                        <div><Av name={p2?.name || "?"} color={cfg.color} /><strong>{p2?.name || "?"}</strong><small>{p2?.elo} ELO</small></div>
                      </div>
                    </article>
                  );
                })}
              </section>
            )}

            {/* RESULTS */}
            {leagueTab === "results" && (
              <section className="results-list">
                {completed.length === 0 && <p className="muted" style={{ padding: 24 }}>Belum ada hasil di {league}.</p>}
                {completed.map(s => {
                  const r = rMap.get(s.id);
                  const p1 = getPlayer(s.player1Id);
                  const p2 = getPlayer(s.player2Id);
                  if (!r) return null;
                  return (
                    <article key={s.id} className="result-card">
                      <div>
                        <span className="round">ROUND {String(s.round).padStart(2, "0")} · {new Date(s.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
                        <h3>{p1?.name} <ScoreTag s1={r.score1} s2={r.score2} /> {p2?.name}</h3>
                        <p>Blitz 5+0 · 2 permainan · Rated{r.pgn ? " · PGN tersedia" : ""}</p>
                      </div>
                      <button className="outline-btn" onClick={() => openAnalysis(s.id)}>
                        {r.pgn ? "Analisis PGN ↗" : "Lihat Detail ↗"}
                      </button>
                    </article>
                  );
                })}
              </section>
            )}
          </section>
        </>
      )}

      {/* ── RULES VIEW ── */}
      {view === "rules" && (
        <section className="rules-page">
          <div className="rules-intro">
            <p className="eyebrow">PERATURAN RESMI</p>
            <h2>Main fair.<br /><span>Naik kasta.</span></h2>
            <p>Liga TCO dimainkan secara konsisten, sportif, dan terukur untuk menemukan Master TCO berikutnya.</p>
          </div>
          <div className="format-card">
            <div><span>KUOTA</span><b>MIN. 48</b><small>Tanpa batas maksimal</small></div>
            <div><span>FORMAT</span><b>4 DIVISI</b><small>Player diratakan tiap divisi</small></div>
            <div><span>PERTANDINGAN</span><b>2× BLITZ</b><small>5 menit per game</small></div>
          </div>
          <div className="rules-grid">
            <article>
              <p className="eyebrow">SYARAT PENDAFTARAN</p>
              <ol><li>Member TCO aktif.</li><li>Tidak mengganti akun / nama akun selama liga.</li><li>Komitmen bermain satu ronde per minggu.</li><li>Bersedia mengikuti seluruh regulasi Liga TCO.</li></ol>
            </article>
            <article>
              <p className="eyebrow">REGULASI LIGA</p>
              <ol>{rules.map(r => <li key={r}>{r}</li>)}</ol>
            </article>
          </div>
        </section>
      )}

      {/* ── ADMIN VIEW ── */}
      {view === "admin" && (
        <section className="admin-page">
          <div className="admin-heading">
            <div>
              <p className="eyebrow">CONTROL ROOM</p>
              <h2>Admin Dashboard</h2>
              <p>Kelola peserta, jadwal, skor & PGN, dan transisi season dari satu tempat.</p>
            </div>
            <span className="admin-badge">● LOCAL PROTOTYPE</span>
          </div>

          <div className="admin-tabs">
            {(["players","schedule","score","season"] as AdminTab[]).map(t => (
              <button key={t} className={`admin-tab-btn ${adminTab === t ? "atb-active" : ""}`} onClick={() => setAdminTab(t)}>
                {t === "players" ? "👥 Peserta" : t === "schedule" ? "📅 Jadwal" : t === "score" ? "📊 Skor & PGN" : "🔄 Transisi Season"}
              </button>
            ))}
          </div>

          <div className="admin-content">
            {adminTab === "players" && <AdminPlayers players={players} setPlayers={setPlayers} />}
            {adminTab === "schedule" && <AdminSchedule players={players} schedules={schedules} setSchedules={setSchedules} />}
            {adminTab === "score" && <AdminScore players={players} schedules={schedules} setSchedules={setSchedules} results={results} setResults={setResults} setPlayers={setPlayers} />}
            {adminTab === "season" && <AdminSeason players={players} setPlayers={setPlayers} allSchedules={schedules} allResults={results} setNotice={setNotice} />}
          </div>
        </section>
      )}

      {notice && <button className="toast" onClick={() => setNotice("")}>{notice} <span>×</span></button>}

      {analysis && (
        <AnalysisModal result={analysis.result} schedule={analysis.schedule} players={players} onClose={() => setAnalysis(null)} />
      )}
    </main>
  );
}
