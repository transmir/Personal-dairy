// ============================================================
// Personal Diary – Google Apps Script Backend
// Open via: Google Sheet → Extensions → Apps Script
// ============================================================

function doPost(e) {
  try {
    const raw    = e.postData ? e.postData.contents : '{}';
    const data   = JSON.parse(raw);
    const action = data.action;

    if (action === 'getConfig')      return getConfig();
    if (action === 'setPassword')    return setPassword(data);
    if (action === 'verifyPassword') return verifyPassword(data);
    if (action === 'updateUserName') return updateUserName(data);
    if (action === 'save')           return saveData(data);
    if (action === 'load')           return loadData(data);
    if (action === 'saveVideoToDrive') return saveVideoToDrive(data);

    return respond(false, 'Unknown action: ' + action);
  } catch (err) {
    return respond(false, 'Server error: ' + err.message);
  }
}

function doGet(e) {
  return respond(true, 'Diary backend is running ✅');
}

// ── Spreadsheet helper ───────────────────────────────────────
function getSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Script must be opened from Google Sheets → Extensions → Apps Script');
  return ss;
}

// ── Config sheet ─────────────────────────────────────────────
function getConfigSheet() {
  const ss    = getSpreadsheet();
  let   sheet = ss.getSheetByName('Config');
  if (!sheet) {
    sheet = ss.insertSheet('Config');
    sheet.getRange(1, 1, 2, 4).setValues([
      ['password', 'user1Name', 'user2Name', 'version'],
      ['',         'Person 1',  'Person 2',  '1'      ]
    ]);
  }
  return sheet;
}

function getConfig() {
  const sheet  = getConfigSheet();
  const row    = sheet.getRange(2, 1, 1, 4).getValues()[0];
  return respond(true, 'ok', {
    hasPassword: String(row[0]).trim() !== '',
    user1Name:   row[1] || 'Person 1',
    user2Name:   row[2] || 'Person 2'
  });
}

function setPassword(data) {
  const pw = String(data.password || '').trim();
  if (pw.length < 4) return respond(false, 'Password must be at least 4 characters');
  getConfigSheet().getRange(2, 1).setValue(pw);
  return respond(true, 'Password saved');
}

function verifyPassword(data) {
  const stored  = String(getConfigSheet().getRange(2, 1).getValue()).trim();
  const entered = String(data.password || '').trim();
  if (!stored)            return respond(false, 'No password set yet');
  if (entered === stored) return respond(true, 'ok');
  return respond(false, 'Incorrect password');
}

function updateUserName(data) {
  const col  = data.userId === 'user1' ? 2 : 3;
  const name = String(data.name || '').trim();
  if (!name) return respond(false, 'Name cannot be empty');
  getConfigSheet().getRange(2, col).setValue(name);
  return respond(true, 'Name updated');
}

// ── Per-user data ─────────────────────────────────────────────
// All data types stored: habits, notes, todos, settings, papers, notesfiles
function saveData(payload) {
  const { userId, type, data } = payload;
  if (!userId || !type) return respond(false, 'Missing userId or type');
  const sheet = getOrCreateSheet(userId + '_' + type);
  sheet.clearContents();
  sheet.getRange(1, 1).setValue(JSON.stringify(data));
  return respond(true, 'Saved');
}

function loadData(payload) {
  if (!payload.userId) return respond(false, 'Missing userId');
  const types  = ['habits', 'notes', 'todos', 'settings', 'papers', 'notesfiles'];
  const result = {};
  types.forEach(function(type) {
    const sheet = getOrCreateSheet(payload.userId + '_' + type);
    const raw   = sheet.getRange(1, 1).getValue();
    try {
      result[type] = raw ? JSON.parse(raw) : defaultFor(type);
    } catch(e) {
      result[type] = defaultFor(type);
    }
  });
  return respond(true, 'Loaded', { data: result });
}

function defaultFor(type) {
  if (type === 'settings') return null;
  if (type === 'papers')   return [];
  if (type === 'notesfiles') return {};
  return {};
}

// ── Video → Google Drive ──────────────────────────────────────
function saveVideoToDrive(data) {
  try {
    const { userId, title, note, date, base64, mimeType } = data;

    // Decode base64 video
    const decoded = Utilities.base64Decode(base64);
    const blob    = Utilities.newBlob(decoded, mimeType || 'video/webm', title + '.webm');

    // Find or create "My Diary Videos" folder in Drive
    let folder;
    const folders = DriveApp.getFoldersByName('My Diary Videos');
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder('My Diary Videos');
    }

    // Save sub-folder per user
    let userFolder;
    const userFolders = folder.getFoldersByName(userId);
    if (userFolders.hasNext()) {
      userFolder = userFolders.next();
    } else {
      userFolder = folder.createFolder(userId);
    }

    const file    = userFolder.createFile(blob);
    const fileUrl = file.getUrl();

    // Also log entry to notes sheet
    const notesSheet = getOrCreateSheet(userId + '_notes');
    const raw        = notesSheet.getRange(1, 1).getValue();
    let   notesData  = {};
    try { notesData = raw ? JSON.parse(raw) : {}; } catch(e) {}
    if (!notesData._videoEntries) notesData._videoEntries = [];
    notesData._videoEntries.unshift({
      title:    title,
      note:     note || '',
      date:     date,
      driveUrl: fileUrl,
      savedAt:  new Date().toISOString()
    });
    notesSheet.clearContents();
    notesSheet.getRange(1, 1).setValue(JSON.stringify(notesData));

    return respond(true, 'Video saved to Google Drive', { driveUrl: fileUrl });
  } catch(err) {
    return respond(false, 'Drive save failed: ' + err.message);
  }
}

// ── Helpers ───────────────────────────────────────────────────
function getOrCreateSheet(name) {
  const ss    = getSpreadsheet();
  let   sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

function respond(success, message, extra) {
  const payload = Object.assign({ success: success, message: message }, extra || {});
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}