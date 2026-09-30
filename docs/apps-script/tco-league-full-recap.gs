/**
 * TCO League Full Recap
 *
 * Menarik seluruh data Liga TCO dari website dan membuat rekap spreadsheet:
 *   - STANDINGS : klasemen semua liga, dihitung dari hasil pertandingan
 *   - PLAYERS   : seluruh data player dan rating Chess.com
 *   - SCHEDULES : seluruh jadwal dengan nama player
 *   - RESULTS   : seluruh hasil dengan nama player
 *   - SUMMARY   : ringkasan jumlah player, match, dan status per liga
 *   - SEASON    : season aktif
 *   - TOURNAMENTS: input manual link turnamen untuk WhatsApp bot
 *
 * Cara pakai:
 * 1. Paste file ini ke Google Apps Script spreadsheet.
 * 2. Ubah SHEET_ID bila script bukan bound ke spreadsheet tersebut.
 * 3. Jalankan RUN_FULL_RECAP satu kali dan izinkan akses.
 * 4. Jalankan ENABLE_AUTO_SYNC bila ingin update otomatis setiap 5 menit.
 *
 * Format sheet TOURNAMENTS (buat manual, jangan ditimpa RUN_FULL_RECAP):
 * id | title | start_at | chesscom_url | result_url | result_api_url | enabled
 *
 * Semua tab lain ditulis ulang penuh oleh RUN_FULL_RECAP, termasuk header-nya.
 * Kolom wo_player / game1_url / game2_url di RESULTS diisi dari panel admin Liga
 * (bukan dari PGN), jadi edit link game lewat admin, bukan lewat spreadsheet.
 *Skor dihitung dengan Model X: 2-0 = 1 menang, 1.5-0.5 = 1 menang + 1 remis,
 * 1-1 = 1 remis. MP menghitung match (2 game), bukan jumlah game.
 */

var WEBSITE_URL = "https://web-tco.vercel.app";
var SHEET_ID = "11Q3AIGofm1ZQeRomJOoEEy6YacZz_EHNsJUN-3DzYQU";
var SHEET_SECRET_PROPERTY = "SHEET_SECRET";
var LEAGUES = ["Liga 1", "Liga 2", "Liga 3", "Liga 4"];

var HEADERS = {
  STANDINGS: ["league", "position", "player_id", "name", "username", "elo_current", "elo_avg", "peak_blitz", "mp", "w", "d", "l", "points", "wo_count", "status"],
  PLAYERS: ["id", "name", "username", "league", "elo", "elo_avg", "peak_blitz", "pp", "wo_count", "status", "created_at"],
  SCHEDULES: ["id", "league", "round", "player1_id", "player1_name", "player1_username", "player2_id", "player2_name", "player2_username", "date", "time", "status"],
  RESULTS: ["id", "schedule_id", "league", "round", "date", "player1_name", "player2_name", "score1", "score2", "wo_player", "game1_url", "game2_url"],
  SUMMARY: ["league", "players", "active_players", "disqualified_players", "matches", "completed_matches", "upcoming_matches", "live_matches", "total_points"],
  SEASON: ["season"]
};

function openSs_() {
  return SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
}

function secret_() {
  return PropertiesService.getScriptProperties().getProperty(SHEET_SECRET_PROPERTY) || "";
}

function api_(path) {
  var headers = {};
  if (secret_()) headers["x-sheet-secret"] = secret_();
  var response = UrlFetchApp.fetch(WEBSITE_URL + path, {
    method: "get",
    headers: headers,
    muteHttpExceptions: true,
    followRedirects: true
  });
  var code = response.getResponseCode();
  if (code < 200 || code >= 300) throw new Error("Website API HTTP " + code + ": " + response.getContentText());
  return JSON.parse(response.getContentText());
}

function ensureSheet_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function writeSheet_(ss, name, headers, rows) {
  var sheet = ensureSheet_(ss, name);
  sheet.clearContents().clearFormats();
  var values = [headers].concat(rows);
  if (values.length > 0) sheet.getRange(1, 1, values.length, headers.length).setValues(values);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight("bold")
    .setBackground("#0b1522")
    .setFontColor("#00d9ff");
  sheet.setFrozenRows(1);
  if (sheet.getMaxColumns() > headers.length) {
    sheet.deleteColumns(headers.length + 1, sheet.getMaxColumns() - headers.length);
  }
  for (var c = 1; c <= headers.length; c++) sheet.autoResizeColumn(c);
  return rows.length;
}

function readObjects_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet || sheet.getLastRow() < 2) return [];
  var values = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  var headers = values.shift().map(function (header) { return String(header).trim(); });
  return values.filter(function (row) { return row.some(function (value) { return value !== ""; }); }).map(function (row) {
    var item = {};
    headers.forEach(function (header, index) { item[header] = row[index] == null ? "" : row[index]; });
    item.enabled = !(item.enabled === false || String(item.enabled).toLowerCase() === "false");
    return item;
  });
}

function number_(value) {
  var n = Number(value);
  return isNaN(n) ? 0 : n;
}

function text_(value) {
  return value == null ? "" : String(value);
}

function playerMaps_(players) {
  var byId = {};
  players.forEach(function (p) { byId[p.id] = p; });
  return byId;
}

function woPenalty_(woCount) {
  var count = number_(woCount);
  return count >= 1 ? (count >= 2 ? 3 : 1) : 0;
}

// Match = 2 game, jadi skor split (x.5) berarti 1 menang + 1 remis.
//   2-0 -> W | 1.5-0.5 -> W + D | 1-1 -> D | 0.5-1.5 -> D | 0-2 -> L
function isSplitScore_(score) {
  return Math.abs(score - Math.round(score)) > 0.001;
}

function outcomeFromScore_(score, opponent) {
  if (score === opponent) return "D";
  if (score > opponent) return isSplitScore_(score) ? "WD" : "W";
  return isSplitScore_(score) ? "D" : "L";
}

function applyOutcome_(side, outcome) {
  if (outcome.indexOf("W") >= 0) side.w++;
  if (outcome.indexOf("D") >= 0) side.d++;
  if (outcome.indexOf("L") >= 0) side.l++;
}

function buildRows_(data) {
  var players = data.players || [];
  var schedules = data.schedules || [];
  var results = data.results || [];
  var byId = playerMaps_(players);
  var resultBySchedule = {};
  results.forEach(function (r) { resultBySchedule[r.schedule_id] = r; });

  var stats = {};
  players.forEach(function (p) {
    stats[p.id] = { mp: 0, w: 0, d: 0, l: 0, points: 0 };
  });

  schedules.forEach(function (s) {
    if (s.status !== "completed" || !resultBySchedule[s.id]) return;
    var r = resultBySchedule[s.id];
    var score1 = number_(r.score1);
    var score2 = number_(r.score2);
    var a = stats[s.player1_id];
    var b = stats[s.player2_id];
    if (!a || !b) return;
    a.mp++; b.mp++;
    a.points += score1; b.points += score2;
    applyOutcome_(a, outcomeFromScore_(score1, score2));
    applyOutcome_(b, outcomeFromScore_(score2, score1));
  });

  var standings = [];
  LEAGUES.forEach(function (league) {
    var leaguePlayers = players.filter(function (p) { return p.league === league; });
    leaguePlayers.sort(function (a, b) {
      var sa = stats[a.id] || { points: 0, w: 0 };
      var sb = stats[b.id] || { points: 0, w: 0 };
      var pa = Math.max(0, sa.points - woPenalty_(a.wo_count));
      var pb = Math.max(0, sb.points - woPenalty_(b.wo_count));
      return pb - pa || sb.w - sa.w || number_(b.elo) - number_(a.elo) || text_(a.name).localeCompare(text_(b.name));
    });
    leaguePlayers.forEach(function (p, index) {
      var s = stats[p.id] || { mp: 0, w: 0, d: 0, l: 0, points: 0 };
      standings.push([
        league, index + 1, text_(p.id), text_(p.name), text_(p.username), number_(p.elo), number_(p.elo_avg), number_(p.peak_blitz),
        s.mp, s.w, s.d, s.l, Math.max(0, s.points - woPenalty_(p.wo_count)), number_(p.wo_count), text_(p.status)
      ]);
    });
  });

  var playerRows = players.map(function (p) {
    return [text_(p.id), text_(p.name), text_(p.username), text_(p.league), number_(p.elo), number_(p.elo_avg), number_(p.peak_blitz), text_(p.pp), number_(p.wo_count), text_(p.status), text_(p.created_at)];
  });

  var scheduleRows = schedules.map(function (s) {
    var p1 = byId[s.player1_id] || {};
    var p2 = byId[s.player2_id] || {};
    return [text_(s.id), text_(s.league), number_(s.round), text_(s.player1_id), text_(p1.name), text_(p1.username), text_(s.player2_id), text_(p2.name), text_(p2.username), text_(s.date), text_(s.time), text_(s.status)];
  });

  var resultRows = results.map(function (r) {
    var s = schedules.filter(function (item) { return item.id === r.schedule_id; })[0] || {};
    var p1 = byId[s.player1_id] || {};
    var p2 = byId[s.player2_id] || {};
    return [text_(r.id), text_(r.schedule_id), text_(s.league), number_(s.round), text_(s.date), text_(p1.name), text_(p2.name), number_(r.score1), number_(r.score2), number_(r.wo_player), text_(r.game1_url), text_(r.game2_url)];
  });

  var summaryRows = LEAGUES.map(function (league) {
    var lp = players.filter(function (p) { return p.league === league; });
    var ls = schedules.filter(function (s) { return s.league === league; });
    var completed = ls.filter(function (s) { return s.status === "completed"; }).length;
    var totalPoints = standings.filter(function (row) { return row[0] === league; }).reduce(function (sum, row) { return sum + number_(row[12]); }, 0);
    return [league, lp.length, lp.filter(function (p) { return p.status === "active"; }).length, lp.filter(function (p) { return p.status === "disqualified"; }).length, ls.length, completed, ls.filter(function (s) { return s.status === "upcoming"; }).length, ls.filter(function (s) { return s.status === "live"; }).length, totalPoints];
  });

  return { standings: standings, players: playerRows, schedules: scheduleRows, results: resultRows, summary: summaryRows };
}

function pullFullRecap() {
  var ss = openSs_();
  var data = (api_("/api/liga").data || {});
  var rows = buildRows_(data);
  writeSheet_(ss, "STANDINGS", HEADERS.STANDINGS, rows.standings);
  writeSheet_(ss, "PLAYERS", HEADERS.PLAYERS, rows.players);
  writeSheet_(ss, "SCHEDULES", HEADERS.SCHEDULES, rows.schedules);
  writeSheet_(ss, "RESULTS", HEADERS.RESULTS, rows.results);
  writeSheet_(ss, "SUMMARY", HEADERS.SUMMARY, rows.summary);
  writeSheet_(ss, "SEASON", HEADERS.SEASON, [[text_(data.season)]]);
  return "Rekap selesai: " + rows.players.length + " player, " + rows.schedules.length + " jadwal, " + rows.results.length + " hasil.";
}

function RUN_FULL_RECAP() {
  return pullFullRecap();
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu("TCO League")
    .addItem("Tarik Rekap Lengkap", "RUN_FULL_RECAP")
    .addItem("Aktifkan Auto Sync 5 Menit", "ENABLE_AUTO_SYNC")
    .addItem("Hapus Auto Sync", "DELETE_AUTO_SYNC")
    .addToUi();
}

function ENABLE_AUTO_SYNC() {
  DELETE_AUTO_SYNC();
  ScriptApp.newTrigger("autoSync_").timeBased().everyMinutes(5).create();
  return "Auto-sync aktif setiap 5 menit.";
}

function DELETE_AUTO_SYNC() {
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (trigger.getHandlerFunction() === "autoSync_") ScriptApp.deleteTrigger(trigger);
  });
  return "Auto-sync dihapus.";
}

function autoSync_() {
  return pullFullRecap();
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, message: "TCO full recap aktif" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (!secret_() || body.token !== secret_()) throw new Error("token salah atau SHEET_SECRET belum diatur");
    if (body.action === "tournaments") {
      return ContentService.createTextOutput(JSON.stringify({ ok: true, rows: readObjects_(openSs_(), "TOURNAMENTS") }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ ok: true, message: pullFullRecap() }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, message: String(err.message || err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
