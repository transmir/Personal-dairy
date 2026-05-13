// Google Apps Script for Personal Diary Backend

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    switch(action) {
      case 'saveVideo':
        return saveVideo(data);
      case 'saveHabits':
        return saveHabits(data);
      case 'getHistory':
        return getHistory(data);
      default:
        return createResponse(false, 'Invalid action');
    }
  } catch (error) {
    return createResponse(false, error.toString());
  }
}

function doGet(e) {
  return ContentService.createTextOutput('Personal Diary API is running!');
}

function saveVideo(data) {
  try {
    const folderName = 'PersonalDiary_Videos';
    const folder = getOrCreateFolder(folderName);
    
    // Decode base64 data
    const decoded = Utilities.base64Decode(data.data);
    const blob = Utilities.newBlob(decoded, 'video/webm', data.filename);
    
    // Create file in Google Drive
    const file = folder.createFile(blob);
    
    // Store metadata in a spreadsheet
    storeVideoMetadata(data.filename, data.date, file.getId());
    
    return createResponse(true, 'Video saved successfully', { fileId: file.getId() });
  } catch (error) {
    return createResponse(false, error.toString());
  }
}

function saveHabits(data) {
  try {
    const habitsData = data.data;
    const sheet = getOrCreateHabitsSheet();
    
    // Create a row with habit data
    const row = [
      habitsData.date,
      new Date().toLocaleTimeString(),
      habitsData.sleep.hours || '',
      habitsData.sleep.quality || '',
      habitsData.study.hours || '',
      habitsData.study.subject || '',
      habitsData.exercise.minutes || '',
      habitsData.exercise.type || '',
      habitsData.water.glasses || '',
      habitsData.meditation.minutes || '',
      habitsData.journal || ''
    ];
    
    sheet.appendRow(row);
    
    return createResponse(true, 'Habits saved successfully');
  } catch (error) {
    return createResponse(false, error.toString());
  }
}

function getHistory(data) {
  try {
    const date = data.date;
    const videos = getVideosForDate(date);
    const habits = getHabitsForDate(date);
    
    return createResponse(true, 'History loaded', {
      videos: videos,
      habits: habits
    });
  } catch (error) {
    return createResponse(false, error.toString());
  }
}

// Helper Functions

function getOrCreateFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return DriveApp.createFolder(folderName);
  }
}

function getOrCreateHabitsSheet() {
  const spreadsheetName = 'PersonalDiary_Habits';
  const files = DriveApp.getFilesByName(spreadsheetName);
  
  let spreadsheet;
  if (files.hasNext()) {
    spreadsheet = SpreadsheetApp.openByUrl(files.next().getUrl());
  } else {
    spreadsheet = SpreadsheetApp.create(spreadsheetName);
    const sheet = spreadsheet.getActiveSheet();
    sheet.appendRow([
      'Date', 'Time', 'Sleep Hours', 'Sleep Quality',
      'Study Hours', 'Study Subject', 'Exercise Minutes',
      'Exercise Type', 'Water Glasses', 'Meditation Minutes',
      'Journal Entry'
    ]);
  }
  
  return spreadsheet.getActiveSheet();
}

function storeVideoMetadata(filename, date, fileId) {
  const spreadsheetName = 'PersonalDiary_VideoMetadata';
  const files = DriveApp.getFilesByName(spreadsheetName);
  
  let spreadsheet;
  if (files.hasNext()) {
    spreadsheet = SpreadsheetApp.openByUrl(files.next().getUrl());
  } else {
    spreadsheet = SpreadsheetApp.create(spreadsheetName);
    const sheet = spreadsheet.getActiveSheet();
    sheet.appendRow(['Date', 'Time', 'Filename', 'File ID', 'URL']);
  }
  
  const sheet = spreadsheet.getActiveSheet();
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

function getVideosForDate(date) {
  const spreadsheetName = 'PersonalDiary_VideoMetadata';
  const files = DriveApp.getFilesByName(spreadsheetName);
  
  if (!files.hasNext()) return [];
  
  const spreadsheet = SpreadsheetApp.openByUrl(files.next().getUrl());
  const sheet = spreadsheet.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  const videos = [];
  // Skip header row
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === date) {
      videos.push({
        date: data[i][0],
        time: data[i][1],
        filename: data[i][2],
        url: data[i][4]
      });
    }
  }
  
  return videos;
}

function getHabitsForDate(date) {
  const spreadsheetName = 'PersonalDiary_Habits';
  const files = DriveApp.getFilesByName(spreadsheetName);
  
  if (!files.hasNext()) return null;
  
  const spreadsheet = SpreadsheetApp.openByUrl(files.next().getUrl());
  const sheet = spreadsheet.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  // Find the row for the given date
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === date) {
      return {
        sleep: { hours: data[i][2], quality: data[i][3] },
        study: { hours: data[i][4], subject: data[i][5] },
        exercise: { minutes: data[i][6], type: data[i][7] },
        water: { glasses: data[i][8] },
        meditation: { minutes: data[i][9] },
        journal: data[i][10]
      };
    }
  }
  
  return null;
}

function createResponse(success, message, data = {}) {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: success,
      message: message,
      ...data
    }))
    .setMimeType(ContentService.MimeType.JSON);
}