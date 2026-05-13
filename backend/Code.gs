// Simple backend for Personal Diary
// Stores data in Google Sheets, one sheet per user

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'save') {
      return saveData(data);
    } else if (action === 'load') {
      return loadData(data);
    }
    
    return response(false, 'Invalid action');
  } catch (error) {
    return response(false, error.toString());
  }
}

function doGet() {
  return response(true, 'Diary backend is running');
}

function saveData(payload) {
  const userId = payload.userId;   // 'user1' or 'user2'
  const type = payload.type;       // 'habits', 'notes', 'todos', 'settings'
  const data = payload.data;
  
  const sheetName = userId + '_' + type;
  const sheet = getOrCreateSheet(sheetName);
  
  // Clear existing content (simple approach – replace all)
  sheet.clear();
  if (data && typeof data === 'object') {
    // Store as JSON string in a single cell (easy)
    sheet.getRange(1, 1).setValue(JSON.stringify(data));
  }
  
  return response(true, 'Saved');
}

function loadData(payload) {
  const userId = payload.userId;
  const types = ['habits', 'notes', 'todos', 'settings'];
  const result = {};
  
  types.forEach(type => {
    const sheetName = userId + '_' + type;
    const sheet = getOrCreateSheet(sheetName);
    const val = sheet.getRange(1, 1).getValue();
    if (val) {
      try {
        result[type] = JSON.parse(val);
      } catch (e) {
        result[type] = {};
      }
    } else {
      result[type] = (type === 'settings') ? null : {};
    }
  });
  
  return response(true, 'Loaded', { data: result });
}

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function response(success, message, extra = {}) {
  return ContentService
    .createTextOutput(JSON.stringify({ success, message, ...extra }))
    .setMimeType(ContentService.MimeType.JSON);
}