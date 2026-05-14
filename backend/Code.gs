// ============================================================
//  Personal Diary – Google Apps Script Backend
//  Sheets created automatically on first run:
//    "Config"          → password | user1Name | user2Name
//    "user1_habits"    → JSON blob
//    "user1_notes"     → JSON blob
//    "user1_todos"     → JSON blob
//    "user1_settings"  → JSON blob
//    "user2_*"         → same pattern
// ============================================================

function doPost(e) {
  try {
    const data   = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === 'getConfig') return getConfig();
    if (action === 'setConfig') return setConfig(data);
    if (action === 'save')      return saveData(data);
    if (action === 'load')      return loadData(data);

    return resp(false, 'Unknown action: ' + action);
  } catch (err) {
    return resp(false, 'Server error: ' + err.toString());
  }
}

function doGet() {
  return resp(true, 'Diary backend is running');
}

// ── Config sheet ─────────────────────────────────────────────
// Row 1: [ password, user1DisplayName, user2DisplayName ]

function getConfigSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Config');
  if (!sheet) {
    sheet = ss.insertSheet('Config');
    sheet.getRange(1, 1, 1, 3).setValues([['', 'Person 1', 'Person 2']]);
  }
  return sheet;
}

function getConfig() {
  const sheet  = getConfigSheet();
  const row    = sheet.getRange(1, 1, 1, 3).getValues()[0];
  const config = {
    password: (row[0] === '' || row[0] === null) ? null : String(row[0]),
    users: {
      user1: { displayName: String(row[1] || 'Person 1') },
      user2: { displayName: String(row[2] || 'Person 2') }
    }
  };
  return resp(true, 'OK', { config: config });
}

function setConfig(data) {
  const sheet = getConfigSheet();
  if (data.password  !== undefined) sheet.getRange(1, 1).setValue(String(data.password));
  if (data.user1Name !== undefined) sheet.getRange(1, 2).setValue(data.user1Name);
  if (data.user2Name !== undefined) sheet.getRange(1, 3).setValue(data.user2Name);
  return resp(true, 'Config saved');
}

// ── User data ─────────────────────────────────────────────────

function saveData(payload) {
  const userId = payload.userId;
  const type   = payload.type;
  const data   = payload.data;

  if (!userId || !type) return resp(false, 'userId and type are required');

  const sheet = getOrCreateSheet(userId + '_' + type);
  sheet.clear();
  sheet.getRange(1, 1).setValue(JSON.stringify(data));
  return resp(true, 'Saved');
}

function loadData(payload) {
  const userId = payload.userId;
  if (!userId) return resp(false, 'userId is required');

  const types  = ['habits', 'notes', 'todos', 'settings'];
  const result = {};

  types.forEach(function(type) {
    const sheet = getOrCreateSheet(userId + '_' + type);
    const val   = sheet.getRange(1, 1).getValue();
    if (val) {
      try   { result[type] = JSON.parse(val); }
      catch (err) { result[type] = type === 'settings' ? null : {}; }
    } else {
      result[type] = type === 'settings' ? null : {};
    }
  });

  return resp(true, 'Loaded', { data: result });
}

// ── Helpers ───────────────────────────────────────────────────

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function resp(success, message, extra) {
  var payload = { success: success, message: message };
  if (extra) {
    Object.keys(extra).forEach(function(k) { payload[k] = extra[k]; });
  }
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}