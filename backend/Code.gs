// ============================================================
// Personal Diary – Google Apps Script Backend
// ⚠️  This script MUST be opened via:
//     Google Sheets → Extensions → Apps Script
// It will NOT work as a standalone script.
// ============================================================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === 'getConfig')      return getConfig();
    if (action === 'setPassword')    return setPassword(data);
    if (action === 'verifyPassword') return verifyPassword(data);
    if (action === 'updateUserName') return updateUserName(data);
    if (action === 'save')           return saveData(data);
    if (action === 'load')           return loadData(data);

    return response(false, 'Invalid action');
  } catch (error) {
    return response(false, error.toString());
  }
}

function doGet(e) {
  return response(true, 'Diary backend running');
}

// ── Spreadsheet helper (with clear error if not bound) ──────

function getSpreadsheet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) throw new Error('No spreadsheet found');
    return ss;
  } catch (e) {
    throw new Error(
      'Script is not linked to a Google Sheet. ' +
      'Open your Google Sheet → Extensions → Apps Script, ' +
      'paste this code there, and redeploy.'
    );
  }
}

// ── Config Sheet (password + user names) ────────────────────

function getConfigSheet() {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName('Config');
  if (!sheet) {
    sheet = ss.insertSheet('Config');
    sheet.getRange(1,1,1,4).setValues([['password','user1Name','user2Name','version']]);
    sheet.getRange(2,1,1,4).setValues([['','Person 1','Person 2','1']]);
  }
  return sheet;
}

function getConfig() {
  const sheet  = getConfigSheet();
  const values = sheet.getRange(2,1,1,4).getValues()[0];
  return response(true, 'ok', {
    hasPassword: values[0] !== '',
    user1Name:   values[1] || 'Person 1',
    user2Name:   values[2] || 'Person 2'
  });
}

function setPassword(data) {
  if (!data.password || data.password.trim().length < 4)
    return response(false, 'Password must be at least 4 characters');
  const sheet = getConfigSheet();
  sheet.getRange(2,1).setValue(data.password.trim());
  return response(true, 'Password set');
}

function verifyPassword(data) {
  const sheet  = getConfigSheet();
  const stored = sheet.getRange(2,1).getValue();
  if (!stored) return response(false, 'No password set');
  if (String(stored) === String(data.password)) return response(true, 'ok');
  return response(false, 'Incorrect password');
}

function updateUserName(data) {
  const sheet = getConfigSheet();
  const col   = data.userId === 'user1' ? 2 : 3;
  if (!data.name || !data.name.trim()) return response(false, 'Name required');
  sheet.getRange(2, col).setValue(data.name.trim());
  return response(true, 'Name updated');
}

// ── Data (habits / notes / todos / settings) ────────────────

function saveData(payload) {
  const { userId, type, data } = payload;
  if (!userId || !type) return response(false, 'userId and type required');
  const sheet = getOrCreateSheet(userId + '_' + type);
  sheet.clear();
  if (data !== undefined) sheet.getRange(1,1).setValue(JSON.stringify(data));
  return response(true, 'Saved');
}

function loadData(payload) {
  const { userId } = payload;
  if (!userId) return response(false, 'userId required');

  const types  = ['habits', 'notes', 'todos', 'settings'];
  const result = {};
  types.forEach(type => {
    const sheet = getOrCreateSheet(userId + '_' + type);
    const val   = sheet.getRange(1,1).getValue();
    if (val) {
      try   { result[type] = JSON.parse(val); }
      catch { result[type] = {};              }
    } else {
      result[type] = (type === 'settings') ? null : {};
    }
  });
  return response(true, 'Loaded', { data: result });
}

// ── Helpers ─────────────────────────────────────────────────

function getOrCreateSheet(name) {
  const ss    = getSpreadsheet();
  let   sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

function response(success, message, extra = {}) {
  const output = ContentService.createTextOutput(
    JSON.stringify({ success, message, ...extra })
  );
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}