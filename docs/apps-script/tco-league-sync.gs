/**
 * TCO Chess League → Google Sheets bridge.
 * CARA PAKAI:
 * 1. Buat spreadsheet Google kosong.
 * 2. Extension → Apps Script. Hapus semua, tempel kode ini, Simpan.
 * 3. Deploy → New deployment → type: Web app.
 *    - Execute as: Me; Who has access: Anyone.
 * 4. Salin URL Web App ke aplikasi TCO (Admin → Google Sheet).
 */
const SECRET = ""; // opsional: isi token sama seperti di aplikasi

function props() {
  return PropertiesService.getScriptProperties().getProperties();
}

function siteUrl() {
  const url = (props()["WEBSITE_URL"] || "").replace(/\/+$/, "");
  if (!url) throw new Error("Atur WEBSITE_URL di Script Properties (Project Settings) → WEBSITE_URL = https://nama-situs.vercel.app");
  return url;
}

function sheetSecret() {
  return props()["SHEET_SECRET"] || "";
}

function parsePayload(e) {
  const raw = (e && e.postData && e.postData.contents) || "";
  if (!raw) return {};
  return JSON.parse(raw);
}

function ensureSheets_(ss, names) {
  (names || []).forEach(function (name) {
    if (!ss.getSheetByName(name)) ss.insertSheet(name);
  });
  return ss;
}

function rowsFromSheet_(ss, tab, headers) {
  const sh = ss.getSheetByName(tab);
  if (!sh) throw new Error("Tab '" + tab + "' tidak ditemukan.");
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return [];
  const range = sh.getRange(1, 1, lastRow, headers.length);
  const values = range.getValues();
  const rows = [];
  for (let r = 1; r < values.length; r++) {
    const cell = values[r];
    if (cell.join("").trim() === "") continue;
    const obj = {};
    for (let c = 0; c < headers.length; c++) obj[headers[c]] = cell[c];
    rows.push(obj);
  }
  return rows;
}

function writeRows_(ss, tab, headers, rows) {
  const sh = ss.getSheetByName(tab);
  if (!sh) throw new Error("Tab '" + tab + "' tidak ditemukan.");
  ensureSheets_(ss, [tab]);
  const matrix = [headers].concat(rows.map(function (r) {
    return headers.map(function (h) { return r[h] == null ? "" : r[h]; });
  }));
  sh.clearContents().clearFormats();
  sh.getRange(1, 1, matrix.length, headers.length).setValues(matrix);
  sh.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#0b1522").setFontColor("#00d9ff");
  sh.setFrozenRows(1);
  return rows.length;
}

function callJson_(path, options) {
  const url = siteUrl() + path;
  const req = {
    method: options.method || "GET",
    contentType: "application/json",
    headers: {},
    muteHttpExceptions: true,
    followRedirects: true
  };
  if (options.method === "POST") req.payload = JSON.stringify(options.body || {});
  const secret = sheetSecret();
  if (secret) req.headers["x-sheet-secret"] = secret;
  const res = UrlFetchApp.fetch(url, req);
  const code = res.getResponseCode();
  const text = res.getContentText();
  if (code < 200 || code >= 300) throw new Error("HTTP " + code + ": " + text);
  return JSON.parse(text);
}

function writeBlock(ss, block) {
  if (!block || !block.headers) return;
  const headers = block.headers;
  const sh = ss.getSheetByName(block.tab || "DATA");
  ensureSheets_(ss, [block.tab || "DATA"]);
  const rows = (block.rows || []);
  const matrix = [headers].concat(rows.map(function (r) {
    return headers.map(function (h) { return r[h] == null ? "" : r[h]; });
  }));
  sh.clearContents().clearFormats();
  sh.getRange(1, 1, matrix.length, headers.length).setValues(matrix);
  sh.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#0b1522").setFontColor("#00d9ff");
  sh.setFrozenRows(1);
}

// ── PULL: Website → Spreadsheet ────────────────────────────────────────────────
function pullFromWebsite(ss) {
  const data = callJson_("/api/liga");
  const body = data.data || data;
  const players = (body.players || []).map(function (p) {
    return { id: p.id, name: p.name, username: p.username, league: p.league, elo: p.elo, elo_avg: p.elo_avg || 0, pp: p.pp || "", wo_count: p.wo_count || 0, status: p.status };
  });
  const schedules = (body.schedules || []).map(function (s) {
    return { id: s.id, league: s.league, round: s.round, player1_id: s.player1_id, player2_id: s.player2_id, date: s.date || "", time: s.time || "", status: s.status };
  });
  const results = (body.results || []).map(function (r) {
    return { id: r.id, schedule_id: r.schedule_id, score1: r.score1, score2: r.score2, pgn: r.pgn || "" };
  });
  writeRows_(ss, "PLAYERS", ["id", "name", "username", "league", "elo", "elo_avg", "pp", "wo_count", "status"], players);
  writeRows_(ss, "SCHEDULES", ["id", "league", "round", "player1_id", "player2_id", "date", "time", "status"], schedules);
  writeRows_(ss, "RESULTS", ["id", "schedule_id", "score1", "score2", "pgn"], results);
  writeRows_(ss, "SEASON", ["season"], [{ season: body.season || "1" }]);
  return players.length;
}

// ── IMPORT: Spreadsheet → Website ──────────────────────────────────────────────
function importFromSheet(ss) {
  const players = rowsFromSheet_(ss, "PLAYERS", ["id", "name", "username", "league", "elo", "elo_avg", "pp", "wo_count", "status"]);
  const schedules = rowsFromSheet_(ss, "SCHEDULES", ["id", "league", "round", "player1_id", "player2_id", "date", "time", "status"]);
  const results = rowsFromSheet_(ss, "RESULTS", ["id", "schedule_id", "score1", "score2", "pgn"]);
  const body = { action: "import" };
  if (players.length) body.players = players;
  if (schedules.length) body.schedules = schedules;
  if (results.length) body.results = results;
  const res = callJson_("/api/admin/liga/sheet-sync", { method: "POST", body: body });
  return res.imported || {};
}

// ── WEB APP HANDLERS ───────────────────────────────────────────────────────────
function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, message: "TCO league bridge aktif" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const out = { ok: true };
  try {
    const body = parsePayload(e);
    if (SECRET && body.token !== SECRET) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, message: "token salah" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    const ss = SpreadsheetApp.openById(body.sheet_id) ||
      (body.sheet_id ? null : SpreadsheetApp.getActiveSpreadsheet());
    if (!ss) throw new Error("Tidak bisa membuka spreadsheet: sheet_id kosong. Kirim sheet_id pada payload.");
    ensureSheets_(ss, ["PLAYERS", "SCHEDULES", "RESULTS", "SEASON"]);

    const action = body.action || "pull";
    if (action === "pull") {
      out.players = pullFromWebsite(ss);
      out.schedules = writeRowsCount_(ss, "SCHEDULES");
      out.message = "Pull dari Website selesai.";
    } else if (action === "import") {
      out.imported = importFromSheet(ss);
      out.message = "Import dari Sheet ke Website selesai.";
    } else if (action === "auto") {
      if (body.write_players) writeRows_(ss, "PLAYERS", headers_("PLAYERS"), body.write_players);
      if (body.write_schedules) writeRows_(ss, "SCHEDULES", headers_("SCHEDULES"), body.write_schedules);
      if (body.write_results) writeRows_(ss, "RESULTS", headers_("RESULTS"), body.write_results);
      if (body.season) writeRows_(ss, "SEASON", ["season"], [{ season: body.season }]);
      out.message = "Auto-sync (website → sheet) berjalan.";
    }
  } catch (err) {
    out.ok = false;
    out.message = String(err.message || err);
  }
  return ContentService.createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── AUTO-SYNC (time-based trigger, tanpa klik menu) ─────────────────────────────
// Jalankan ENABLE_AUTO_SYNC sekali dari Script Editor → otomatis selamanya
// (trigger Apps Script setiap 5 menit, gratis, tidak tergantung plan Vercel Cron).
function ENABLE_AUTO_SYNC() {
  DELETE_AUTO_SYNC();
  ScriptApp.newTrigger("autoSync")
    .timeBased().everyMinutes(5).create();
  return "Auto-sync aktif: trigger tiap 5 menit.";
}

function DELETE_AUTO_SYNC() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "autoSync") ScriptApp.deleteTrigger(t);
  });
  return "Semua trigger autoSync dihapus.";
}

function autoSync() {
  const ss = SpreadsheetApp.getActiveSpreadsheet() ||
    SpreadsheetApp.openById(props_()["SHEET_ID"] || "");
  if (!ss) return logWarn_("autoSync: tidak ada spreadsheet aktif & SHEET_ID kosong.");
  const n = pullFromWebsite(ss); // Website → Spreadsheet
  return "autoSync selesai: " + n + " player ditulis.";
}

function logWarn_(msg) {
  console.warn(msg);
  return msg;
}

function headers_(tab) {
  const map = {
    PLAYERS: ["id", "name", "username", "league", "elo", "elo_avg", "pp", "wo_count", "status"],
    SCHEDULES: ["id", "league", "round", "player1_id", "player2_id", "date", "time", "status"],
    RESULTS: ["id", "schedule_id", "score1", "score2", "pgn"],
    SEASON: ["season"]
  };
  return map[tab] || [];
}

function writeRowsCount_(ss, tab) {
  const sh = ss.getSheetByName(tab);
  return sh ? sh.getLastRow() - 1 : 0;
}
