/**
 * TCO Chess League → Google Sheets bridge.
 * MUDAH: tempel ke Apps Script → Save.
 *  1. Script Properties (Project Settings ⚙): tidak wajib kalau pakai versi READY.
 *  2. Jalankan ENABLE_AUTO_SYNC sekali → otomatis tiap 5 menit.
 *  3. Deploy → New deployment → Web app → Execute as Me / Anyone.
 */

// ── KONSTANTA ────────────────────────────────────────────────────────────────────
var WEBSITE_URL = "https://web-tco.vercel.app"; // ganti ke domain-mu
var SECRET      = "";  // sama seperti env SHEET_SYNC_SECRET di Vercel
var SHEET_ID    = "";  // ID spreadsheet (bagian /d/…/ pada URL), opsional

// ══ UTIL ═════════════════════════════════════════════════════════════════════════
function props_() { return PropertiesService.getScriptProperties().getProperties(); }
function siteUrl_() {
  var p = props_()["WEBSITE_URL"] || WEBSITE_URL;
  if (!p) throw new Error("Set WEBSITE_URL di Script Properties atau konstanta.");
  return String(p).replace(/\/+$/, "");
}
function secret_() {
  var p = props_()["SHEET_SECRET"] || SECRET;
  return String(p || "");
}
function openSs_() {
  if (SHEET_ID) return SpreadsheetApp.openById(SHEET_ID);
  return SpreadsheetApp.getActiveSpreadsheet();
}
function ensureSheets_(ss, names) {
  (names || []).forEach(function (n) { if (!ss.getSheetByName(n)) ss.insertSheet(n); });
  return ss;
}
function headers_(tab) {
  var map = {
    PLAYERS:   ["id","name","username","league","elo","elo_avg","pp","wo_count","status"],
    SCHEDULES: ["id","league","round","player1_id","player2_id","date","time","status"],
    RESULTS:   ["id","schedule_id","score1","score2","pgn"],
    SEASON:    ["season"]
  };
  return map[tab] || [];
}
function writeRows_(ss, tab, headers, rows) {
  var sh = ss.getSheetByName(tab); ensureSheets_(ss, [tab]); sh = ss.getSheetByName(tab);
  var matrix = [headers].concat((rows || []).map(function (r) {
    return headers.map(function (h) { return r[h] == null ? "" : r[h]; });
  }));
  sh.clearContents().clearFormats();
  if (matrix.length) sh.getRange(1, 1, matrix.length, headers.length).setValues(matrix);
  sh.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#0b1522").setFontColor("#00d9ff");
  sh.setFrozenRows(1);
  return rows.length;
}
function callJson_(path, options) {
  var req = {
    method: (options && options.method) || "GET",
    contentType: "application/json",
    headers: {},
    muteHttpExceptions: true,
    followRedirects: true
  };
  if (options && options.method === "POST") req.payload = JSON.stringify(options.body || {});
  var s = secret_(); if (s) req.headers["x-sheet-secret"] = s;
  var res = UrlFetchApp.fetch(siteUrl_() + path, req);
  var code = res.getResponseCode(), text = res.getContentText();
  if (code < 200 || code >= 300) throw new Error("HTTP " + code + ": " + text);
  return JSON.parse(text);
}

// ══ SINKRONISASI ═════════════════════════════════════════════════════════════════
// PULL: Website → Spreadsheet (semua tab ditulis ulang dari /api/liga)
function pullFromWebsite(ss) {
  var body = (callJson_("/api/liga").data || {});
  var players = (body.players || []).map(function (p) {
    return { id: p.id, name: p.name, username: p.username, league: p.league,
             elo: p.elo, elo_avg: p.elo_avg || "", pp: p.pp || "",
             wo_count: p.wo_count || 0, status: p.status };
  });
  var schedules = (body.schedules || []).map(function (s) {
    return { id: s.id, league: s.league, round: s.round,
             player1_id: s.player1_id, player2_id: s.player2_id,
             date: s.date || "", time: s.time || "", status: s.status };
  });
  var results = (body.results || []).map(function (r) {
    return { id: r.id, schedule_id: r.schedule_id,
             score1: r.score1, score2: r.score2, pgn: r.pgn || "" };
  });
  writeRows_(ss, "PLAYERS", headers_("PLAYERS"), players);
  writeRows_(ss, "SCHEDULES", headers_("SCHEDULES"), schedules);
  writeRows_(ss, "RESULTS", headers_("RESULTS"), results);
  writeRows_(ss, "SEASON", headers_("SEASON"), [{ season: body.season || "" }]);
  return players.length;
}

// IMPORT: Spreadsheet → Website (butuh x-sheet-secret dibolehkan admin)
function importFromSheet(ss) {
  return callJson_("/api/admin/liga/sheet-sync", { method: "POST", body: {
    action: "import",
    players: rowsFromSheet_(ss, "PLAYERS"),
    schedules: rowsFromSheet_(ss, "SCHEDULES"),
    results: rowsFromSheet_(ss, "RESULTS")
  }});
}

function rowsFromSheet_(ss, tab) {
  var sh = ss.getSheetByName(tab);
  if (!sh) return [];
  var last = sh.getLastRow(); if (last < 2) return [];
  var headers = headers_(tab);
  var values = sh.getRange(1, 1, last, headers.length).getValues();
  var rows = [];
  for (var r = 1; r < values.length; r++) {
    if (values[r].join("").trim() === "") continue;
    var o = {};
    for (var c = 0; c < headers.length; c++) o[headers[c]] = values[r][c];
    rows.push(o);
  }
  return rows;
}

// ══ WEB APP ══════════════════════════════════════════════════════════════════════
function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, message: "TCO bridge aktif" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var out = { ok: true };
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (secret_() && body.token !== secret_())
      return ContentService.createTextOutput(JSON.stringify({ ok: false, message: "token salah" }))
        .setMimeType(ContentService.MimeType.JSON);
    var ss = openSs_();
    ensureSheets_(ss, ["PLAYERS", "SCHEDULES", "RESULTS", "SEASON"]);
    var action = body.action || "pull";
    if (action === "pull") {
      out.players = pullFromWebsite(ss); out.message = "Pull website → sheet selesai.";
    } else if (action === "import") {
      out.imported = importFromSheet(ss); out.message = "Import sheet → website selesai.";
    } else if (action === "auto") {
      if (body.write_players) writeRows_(ss, "PLAYERS", headers_("PLAYERS"), body.write_players);
      if (body.write_schedules) writeRows_(ss, "SCHEDULES", headers_("SCHEDULES"), body.write_schedules);
      if (body.write_results) writeRows_(ss, "RESULTS", headers_("RESULTS"), body.write_results);
      if (body.season) writeRows_(ss, "SEASON", headers_("SEASON"), [{ season: body.season }]);
      out.message = "Auto-sync website → sheet berjalan.";
    }
  } catch (err) {
    out.ok = false; out.message = String(err.message || err);
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

// ══ AUTO-SYNC TRIGGER (tanpa klik menu) ══════════════════════════════════════════
// Jalankan ENABLE_AUTO_SYNC sekali di editor → spreadsheet auto-sync tiap 5 menit.
function enableAutoSync() { return ENABLE_AUTO_SYNC(); }
function ENABLE_AUTO_SYNC() {
  DELETE_AUTO_SYNC();
  ScriptApp.newTrigger("autoSync_").timeBased().everyMinutes(5).create();
  return "Auto-sync aktif: spreadsheet diperbarui dari website tiap 5 menit.";
}
function DELETE_AUTO_SYNC() {
  var trigs = ScriptApp.getProjectTriggers();
  for (var i = 0; i < trigs.length; i++)
    if (trigs[i].getHandlerFunction() === "autoSync_") ScriptApp.deleteTrigger(trigs[i]);
  return "Semua trigger auto-sync dihapus.";
}
function autoSync_() {
  var ss = openSs_();
  if (!ss) throw new Error("Spreadsheet tidak dapat dibuka. Periksa SHEET_ID / active spreadsheet.");
  return pullFromWebsite(ss);
}
