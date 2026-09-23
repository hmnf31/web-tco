/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  TCO LEAGUE ⇄ GOOGLE SPREADSHEET SYNC  (Google Apps Script)
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Sinkronisasi dua arah antara website TCO (Supabase) dan Google Spreadsheet.
 *
 * ▸ DARI SPREADSHEET KE WEBSITE (Import): edit baris di tab PLAYERS / SCHEDULES /
 *   RESULTS lalu klik menu  TCO Sync → 1. Import dari Sheet. Semua perubahan
 *   di-upload (upsert) ke database website.
 *
 * ▸ DARI WEBSITE KE SPREADSHEET (Pull): klik menu  TCO Sync → 2. Pull dari Website
 *   atau atur auto-sync agar spreadsheet ter-update otomatis setiap X menit.
 *
 * ── KONFIGURASI AWAL ───────────────────────────────────────────────────────────
 *  1. Buka spreadsheet Google → Ekstensi → Apps Script.
 *  2. Tempel seluruh file ini, simpan.
 *  3. Di sidebar kiri pilih "Project Settings" (ikon ⚙).
 *  4. Di bagian "Script properties" tambahkan:
 *       WEBSITE_URL  = https://nama-situs.vercel.app   (apa adanya, tanpa / di akhir)
 *       SHEET_SECRET = <nilai SHEET_SYNC_SECRET dari .env.local / Vercel>
 *  5. Jalankan sekali fungsi `setup()` → beri izin akses ke Spreadsheet & Internet.
 *  6. Buka kembali spreadsheet → menu baru "TCO Sync" sudah muncul.
 *  7. (Opsional) Auto-sync: menu TCO Sync → 3. Aktifkan Auto-Sync (tiap 5 menit).
 *
 * ── TAB YANG DIPERLUKAN DI SPREADSHEET ────────────────────────────────────────
 *  setup() otomatis membuat 4 tab: PLAYERS, SCHEDULES, RESULTS, SEASON.
 *  ❗ Jangan ganti nama tab / header. Baris pertama = header (id, name, ...).
 *  ❗ Jangan mengubah kolom `id` (kunci utama). Tambah/ubah baris dibolehkan.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

var LIGA_HEADERS = {
  PLAYERS: ["id", "name", "username", "league", "elo", "elo_avg", "pp", "wo_count", "status"],
  SCHEDULES: ["id", "league", "round", "player1_id", "player2_id", "date", "time", "status"],
  RESULTS: ["id", "schedule_id", "score1", "score2", "pgn"],
  SEASON: ["season"]
};

function props() {
  return PropertiesService.getScriptProperties().getProperties();
}

function siteUrl() {
  var url = props().WEBSITE_URL;
  if (!url) throw new Error("Atur WEBSITE_URL di Script Properties (Project Settings).");
  return url.replace(/\/+$/, "");
}

function sheetSecret() {
  return props().SHEET_SECRET || "";
}

function ensureSheets_(ss) {
  var names = Object.keys(LIGA_HEADERS);
  names.forEach(function (name) {
    var sh = ss.getSheetByName(name);
    if (!sh) {
      sh = ss.insertSheet(name);
    }
    sh.getRange(1, 1, 1, LIGA_HEADERS[name].length).setValues([LIGA_HEADERS[name]]).setFontWeight("bold").setBackground("#0b1522").setFontColor("#00d9ff");
    sh.setFrozenRows(1);
  });
  return ss;
}

function callJson_(path, options) {
  var url = siteUrl() + path;
  var req = {
    method: options.method || "GET",
    contentType: "application/json",
    muteHttpExceptions: true,
    headers: {},
    followRedirects: true
  };
  if (options.method === "POST") req.payload = JSON.stringify(options.body || {});
  var secret = sheetSecret();
  if (secret) req.headers["x-sheet-secret"] = secret;
  var res = UrlFetchApp.fetch(url, req);
  var code = res.getResponseCode();
  var text = res.getContentText();
  if (code < 200 || code >= 300) throw new Error("HTTP " + code + ": " + text);
  return JSON.parse(text);
}

function rowsFromSheet_(ss, tab, headers) {
  var sh = ss.getSheetByName(tab);
  if (!sh) throw new Error("Tab '" + tab + "' tidak ditemukan.");
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return [];
  var values = sh.getRange(1, 1, lastRow, headers.length).getValues();
  var rows = [];
  for (var r = 1; r < values.length; r++) {
    var cell = values[r];
    if (cell.join("").trim() === "") continue;
    var obj = {};
    for (var c = 0; c < headers.length; c++) obj[headers[c]] = normalizeCell_(cell[c]);
    if (!absId_Defined(obj)) continue;
    rows.push(obj);
  }
  return rows;
}

function normalizeCell_(v) {
  if (v instanceof Date) {
    return Utilities.formatDate(v, "UTC", "yyyy-MM-dd");
  }
  return v;
}

function absId_Defined(obj) {
  return Object.keys(obj).some(function (k) { return String(obj[k]).trim() !== ""; });
}

function writeRows_(ss, tab, headers, rows) {
  var sh = ss.getSheetByName(tab);
  if (!sh) { sh = ss.insertSheet(tab); }
  ensureSheets_(ss);
  var matrix = [headers].concat(rows.map(function (r) { return headers.map(function (h) { return r[h] == null ? "" : r[h]; }); }));
  sh.clearContents().clearFormats();
  sh.getRange(1, 1, matrix.length, headers.length).setValues(matrix);
  sh.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#0b1522").setFontColor("#00d9ff");
  sh.setFrozenRows(1);
  return rows.length;
}

// ── MENU ────────────────────────────────────────────────────────────────────────
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("TCO Sync")
    .addItem("1. Import dari Sheet → Website", "importFromSheet")
    .addItem("2. Pull dari Website → Sheet", "pullFromWebsite")
    .addItem("3. Aktifkan Auto-Sync (tiap 5 menit)", "enableAutoSync")
    .addItem("4. Matikan Auto-Sync", "disableAutoSync")
    .addSeparator()
    .addItem("5. Lihat log terakhir", "showLastLog")
    .toSpreadsheetUi();
}

function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheets_(ss);
  var ui = SpreadsheetApp.getUi();
  ui.alert("Setup selesai", "Tab PLAYERS/SCHEDULES/RESULTS/SEASON siap digunakan.\n\nKlik menu TCO Sync → 2. Pull dari Website untuk mengisi data pertama.", ui.ButtonSet.OK);
}

function setStatus_(msg) {
  PropertiesService.getScriptProperties().setProperty("LAST_LOG", new Date().toISOString() + " — " + msg);
}

function showLastLog() {
  SpreadsheetApp.getUi().alert("Log terakhir", PropertiesService.getScriptProperties().getProperty("LAST_LOG") || "(belum ada)", SpreadsheetApp.getUi().ButtonSet.OK);
}

// ── PULL: Website → Spreadsheet ────────────────────────────────────────────────
function pullFromWebsite() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheets_(ss);
  var body = callJson_("/api/liga");
  var data = body.data || body;
  var players = (data.players || []).map(function (p) {
    return { id: p.id, name: p.name, username: p.username, league: p.league, elo: p.elo, elo_avg: p.elo_avg || 0, pp: p.pp || "", wo_count: p.wo_count || 0, status: p.status };
  });
  var schedules = (data.schedules || []).map(function (s) {
    return { id: s.id, league: s.league, round: s.round, player1_id: s.player1_id, player2_id: s.player2_id, date: s.date || "", time: s.time || "", status: s.status };
  });
  var results = (data.results || []).map(function (r) {
    return { id: r.id, schedule_id: r.schedule_id, score1: r.score1, score2: r.score2, pgn: r.pgn || "" };
  });
  writeRows_(ss, "PLAYERS", LIGA_HEADERS.PLAYERS, players);
  writeRows_(ss, "SCHEDULES", LIGA_HEADERS.SCHEDULES, schedules);
  writeRows_(ss, "RESULTS", LIGA_HEADERS.RESULTS, results);
  writeRows_(ss, "SEASON", LIGA_HEADERS.SEASON, [{ season: data.season || "1" }]);
  var msg = "Pull selesai: " + players.length + " pemain, " + schedules.length + " jadwal, " + results.length + " hasil, season " + (data.season || "1");
  setStatus_(msg);
  SpreadsheetApp.getUi().alert("Pull dari Website", msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

// ── IMPORT: Spreadsheet → Website ──────────────────────────────────────────────
function importFromSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheets_(ss);
  var players = rowsFromSheet_(ss, "PLAYERS", LIGA_HEADERS.PLAYERS);
  var schedules = rowsFromSheet_(ss, "SCHEDULES", LIGA_HEADERS.SCHEDULES);
  var results = rowsFromSheet_(ss, "RESULTS", LIGA_HEADERS.RESULTS);

  var emptyPlayers = players.length === 0 && ss.getSheetByName("PLAYERS").getLastRow() < 2;
  if (emptyPlayers && schedules.length === 0 && results.length === 0) {
    throw new Error("Sheet masih kosong. Pull dulu dari Website atau isi manual.");
  }

  var seasonRow = rowsFromSheet_(ss, "SEASON", LIGA_HEADERS.SEASON);
  var body = { action: "import" };
  if (players.length) body.players = players;
  if (schedules.length) body.schedules = schedules;
  if (results.length) body.results = results;
  if (seasonRow.length && seasonRow[0].season) body.season = String(seasonRow[0].season);

  var res = callJson_("/api/admin/liga/sheet-sync", { method: "POST", body: body });
  var imported = res.imported || {};
  var msg = "Import selesai → pemain:" + (imported.players || 0) +
    " jadwal:" + (imported.schedules || 0) +
    " hasil:" + (imported.results || 0) +
    (imported.season ? " season:1" : "");
  setStatus_(msg);
  SpreadsheetApp.getUi().alert("Import ke Website", msg + "\n\nLalu klik TCO Sync → 2. Pull untuk menormalkan ulang kolom di sheet.", SpreadsheetApp.getUi().ButtonSet.OK);
}

// ── AUTO-SYNC ──────────────────────────────────────────────────────────────────
function enableAutoSync() {
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger("autoSync").timeBased().everyMinutes(5).create();
  setStatus_("Auto-sync aktif tiap 5 menit (pull website → sheet).");
  SpreadsheetApp.getUi().alert("Auto-Sync diaktifkan", "Spreadsheet akan diperbarui otomatis dari website setiap 5 menit.", SpreadsheetApp.getUi().ButtonSet.OK);
}

function disableAutoSync() {
  ScriptApp.getProjectTriggers().forEach(function (t) { ScriptApp.deleteTrigger(t); });
  setStatus_("Auto-sync dimatikan.");
  SpreadsheetApp.getUi().alert("Auto-Sync dimatikan", "Amankan? Ya.", SpreadsheetApp.getUi().ButtonSet.OK);
}

function autoSync() {
  var ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(ScriptProperties.getProperty("ACTIVE_SHEET_ID") || "");
  if (!ss) {
    var ui = SpreadsheetApp.getUi();
    if (ui) { ss = ui.getActiveSpreadsheet(); }
  }
  if (!ss) throw new Error("Tidak bisa menemukan spreadsheet aktif untuk auto-sync.");
  ensureSheets_(ss);
  var body = callJson_("/api/liga");
  var data = body.data || body;
  writeRows_(ss, "PLAYERS", LIGA_HEADERS.PLAYERS, (data.players || []).map(function (p) {
    return { id: p.id, name: p.name, username: p.username, league: p.league, elo: p.elo, wo_count: p.wo_count || 0, status: p.status };
  }));
  writeRows_(ss, "SCHEDULES", LIGA_HEADERS.SCHEDULES, (data.schedules || []).map(function (s) {
    return { id: s.id, league: s.league, round: s.round, player1_id: s.player1_id, player2_id: s.player2_id, date: s.date || "", time: s.time || "", status: s.status };
  }));
  writeRows_(ss, "RESULTS", LIGA_HEADERS.RESULTS, (data.results || []).map(function (r) {
    return { id: r.id, schedule_id: r.schedule_id, score1: r.score1, score2: r.score2, pgn: r.pgn || "" };
  }));
  writeRows_(ss, "SEASON", LIGA_HEADERS.SEASON, [{ season: data.season || "1" }]);
  setStatus_("Auto-sync pull berjalan. " + ((data.players || []).length) + " pemain.");
}

function testConnection() {
  var data = callJson_("/api/liga");
  SpreadsheetApp.getUi().alert("Koneksi OK", "Website merespon. " + ((data.data ? data.data.players.length : 0)) + " pemain ditemukan.", SpreadsheetApp.getUi().ButtonSet.OK);
}