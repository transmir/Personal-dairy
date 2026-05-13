function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    switch(action) {
      case 'saveVideo':
        return saveVideo(data);
      case 'saveHabits':
        return saveHabits(data);
      case 'saveNotes':
        return saveNotes(data);
      case 'getHistory':
        return getHistory(data);
      default:
        return createResponse(false, 'Invalid action');
    }
  } catch (error) {
    return createResponse(false, error.toString());
  }
}

function saveVideo(data) {
  try {
    const folderName = 'PersonalDiary_Videos';
    const folder = getOrCreateFolder(folderName);
    const decoded = Utilities.base64Decode(data.data);
    const blob = Utilities.newBlob(decoded, 'video/webm', data.filename);
    const file = folder.createFile(blob);
    storeVideoMetadata(data.filename, data.date, file.getId());
    return createResponse(true, 'Video saved', { fileId: file.getId() });
  } catch (error) {
    return createResponse(false, error.toString());
  }
}

function saveHabits(data) {
  try {
    const sheet = getOrCreateSheet('PersonalDiary_Habits', [
      'Date', 'Time', 'Sleep Hours', 'Sleep Quality',
      'Study Hours', 'Study Subject', 'Study Focus',
      'Exercise Minutes', 'Exercise Type', 'Meditation Minutes',
      'Water Glasses', 'Reading Minutes', 'Reading Material'
    ]);
    
    const row = [
      data.data.date,
      new Date().toLocaleTimeString(),
      data.data.sleep?.hours || '',
      data.data.sleep?.quality || '',
      data.data.study?.hours || '',
      data.data.study?.subject || '',
      data.data.study?.focus || '',
      data.data.exercise?.minutes || '',
      data.data.exercise?.type || '',
      data.data.meditation?.minutes || '',
      data.data.water?.glasses || '',
      data.data.reading?.minutes || '',
      data.data.reading?.material || ''
    ];
    
    sheet.appendRow(row);
    return createResponse(true, 'Habits saved');
  } catch (error) {
    return createResponse(false, error.toString());
  }
}

function saveNotes(data) {
  try {
    const sheet = getOrCreateSheet('PersonalDiary_Notes', [
      'Date', 'Time', 'Mood', 'Gratitude 1', 'Gratitude 2', 
      'Gratitude 3', 'Journal'
    ]);
    
    const row = [
      data.data.date,
      new Date().toLocaleTimeString(),
      data.data.mood || '',
      data.data.gratitude?.[0] || '',
      data.data.gratitude?.[1] || '',
      data.data.gratitude?.[2] || '',
      data.data.journal || ''
    ];
    
    sheet.appendRow(row);
    return createResponse(true, 'Notes saved');
  } catch (error) {
    return createResponse(false, error.toString());
  }
}

function getOrCreateSheet(name, headers) {
  const files = DriveApp.getFilesByName(name);
  let spreadsheet;
  
  if (files.hasNext()) {
    spreadsheet = SpreadsheetApp.openByUrl(files.next().getUrl());
  } else {
    spreadsheet = SpreadsheetApp.create(name);
    const sheet = spreadsheet.getActiveSheet();
    sheet.appendRow(headers);
  }
  
  return spreadsheet.getActiveSheet();
}

function getOrCreateFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
}

function storeVideoMetadata(filename, date, fileId) {
  const sheet = getOrCreateSheet('PersonalDiary_VideoMetadata', 
    ['Date', 'Time', 'Filename', 'File ID', 'URL']);
  const file = DriveApp.getFileById(fileId);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  sheet.appendRow([
    date,
    new Date().toLocaleTimeString(),
    filename,
    fileId,
    `https://drive.google.com/uc?export=download&id=${fileId}`
  ]);
}

function createResponse(success, message, data = {}) {
  return ContentService
    .createTextOutput(JSON.stringify({ success, message, ...data }))
    .setMimeType(ContentService.MimeType.JSON);
}