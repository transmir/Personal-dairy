// ============================================================
// Personal Diary – Google Apps Script Backend
// Stores users in a "Users" sheet; data in per-user sheets.
// ============================================================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === 'login')         return loginUser(data);
    if (action === 'register')      return registerUser(data);
    if (action === 'updateProfile') return updateProfile(data);
    if (action === 'save')          return saveData(data);
    if (action === 'load')          return loadData(data);

    return response(false, 'Invalid action');
  } catch (error) {
    return response(false, error.toString());
  }
}

function doGet() {
  return response(true, 'Diary backend is running');
}

// ── Auth ────────────────────────────────────────────────────

function getUsersSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Users');
  if (!sheet) {
    sheet = ss.insertSheet('Users');
    sheet.getRange(1, 1, 1, 8).setValues([[
      'id', 'username', 'password', 'email',
      'displayName', 'avatar', 'dailyGoal', 'createdAt'
    ]]);
  }
  return sheet;
}

function loginUser(data) {
  const { username, password } = data;
  if (!username || !password) return response(false, 'Username and password required');

  const sheet = getUsersSheet();
  const rows  = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (String(row[1]).toLowerCase() === String(username).toLowerCase()) {
      if (String(row[2]) !== String(password)) {
        return response(false, 'Incorrect password');
      }
      const user = buildUserObj(row);
      return response(true, 'Login successful', { user });
    }
  }
  return response(false, 'User not found. Please register first.');
}

function registerUser(data) {
  const { username, email, password } = data;
  if (!username || !email || !password) return response(false, 'All fields required');

  const sheet = getUsersSheet();
  const rows  = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][1]).toLowerCase() === String(username).toLowerCase()) {
      return response(false, 'Username already taken');
    }
    if (String(rows[i][3]).toLowerCase() === String(email).toLowerCase()) {
      return response(false, 'Email already registered');
    }
  }

  const id        = 'user_' + Date.now();
  const createdAt = new Date().toISOString();
  sheet.appendRow([id, username, password, email, username, '', '', createdAt]);

  const user = { id, username, email, displayName: username, avatar: '', dailyGoal: '', createdAt };
  return response(true, 'Registration successful', { user });
}

function updateProfile(data) {
  const { userId, displayName, email, password, avatar, dailyGoal } = data;
  if (!userId) return response(false, 'User ID required');

  const sheet = getUsersSheet();
  const rows  = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(userId)) {
      const rowNum = i + 1; // 1-based, skip header
      if (displayName !== undefined) sheet.getRange(rowNum, 5).setValue(displayName);
      if (email       !== undefined) sheet.getRange(rowNum, 4).setValue(email);
      if (password    && password.trim()) sheet.getRange(rowNum, 3).setValue(password);
      if (avatar      !== undefined) sheet.getRange(rowNum, 6).setValue(avatar);
      if (dailyGoal   !== undefined) sheet.getRange(rowNum, 7).setValue(dailyGoal);
      return response(true, 'Profile updated');
    }
  }
  return response(false, 'User not found');
}

function buildUserObj(row) {
  return {
    id:          row[0],
    username:    row[1],
    // password intentionally omitted
    email:       row[3],
    displayName: row[4] || row[1],
    avatar:      row[5] || '',
    dailyGoal:   row[6] || '',
    createdAt:   row[7] || ''
  };
}

// ── Data (habits / notes / todos / settings) ────────────────

function saveData(payload) {
  const { userId, type, data } = payload;
  if (!userId || !type) return response(false, 'userId and type required');

  const sheetName = userId + '_' + type;
  const sheet     = getOrCreateSheet(sheetName);

  sheet.clear();
  if (data !== undefined) {
    sheet.getRange(1, 1).setValue(JSON.stringify(data));
  }
  return response(true, 'Saved');
}

function loadData(payload) {
  const { userId } = payload;
  if (!userId) return response(false, 'userId required');

  const types  = ['habits', 'notes', 'todos', 'settings'];
  const result = {};

  types.forEach(type => {
    const sheetName = userId + '_' + type;
    const sheet     = getOrCreateSheet(sheetName);
    const val       = sheet.getRange(1, 1).getValue();
    if (val) {
      try   { result[type] = JSON.parse(val); }
      catch { result[type] = {}; }
    } else {
      result[type] = (type === 'settings') ? null : {};
    }
  });

  return response(true, 'Loaded', { data: result });
}

// ── Helpers ─────────────────────────────────────────────────

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
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