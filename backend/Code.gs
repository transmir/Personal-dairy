// User management
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    switch(action) {
      case 'register':
        return registerUser(data);
      case 'login':
        return loginUser(data);
      case 'updateProfile':
        return updateUserProfile(data);
      case 'saveUserData':
        return saveUserData(data);
      case 'getUserData':
        return getUserData(data);
      case 'saveVideo':
        return saveVideo(data);
      default:
        return createResponse(false, 'Invalid action');
    }
  } catch (error) {
    return createResponse(false, error.toString());
  }
}

function registerUser(data) {
  try {
    const usersSheet = getOrCreateSheet('Users', [
      'ID', 'Username', 'Email', 'Password', 'DisplayName', 
      'Avatar', 'DailyGoal', 'CreatedAt', 'LastLogin'
    ]);
    
    // Check if username exists
    const users = usersSheet.getDataRange().getValues();
    for (let i = 1; i < users.length; i++) {
      if (users[i][1] === data.username) {
        return createResponse(false, 'Username already exists');
      }
      if (users[i][2] === data.email) {
        return createResponse(false, 'Email already registered');
      }
    }
    
    const userId = Utilities.getUuid();
    const hashedPassword = Utilities.base64Encode(data.password); // Simple encoding
    
    usersSheet.appendRow([
      userId,
      data.username,
      data.email,
      hashedPassword,
      data.username, // Default display name
      '', // Avatar
      '', // Daily goal
      new Date().toISOString(),
      new Date().toISOString()
    ]);
    
    // Create user-specific sheets
    createUserDataSheets(userId);
    
    return createResponse(true, 'Registration successful', {
      user: {
        id: userId,
        username: data.username,
        email: data.email,
        displayName: data.username,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    return createResponse(false, error.toString());
  }
}

function loginUser(data) {
  try {
    const usersSheet = getOrCreateSheet('Users', [
      'ID', 'Username', 'Email', 'Password', 'DisplayName', 
      'Avatar', 'DailyGoal', 'CreatedAt', 'LastLogin'
    ]);
    
    const users = usersSheet.getDataRange().getValues();
    const hashedPassword = Utilities.base64Encode(data.password);
    
    for (let i = 1; i < users.length; i++) {
      if (users[i][1] === data.username && users[i][3] === hashedPassword) {
        // Update last login
        usersSheet.getRange(i + 1, 9).setValue(new Date().toISOString());
        
        return createResponse(true, 'Login successful', {
          user: {
            id: users[i][0],
            username: users[i][1],
            email: users[i][2],
            displayName: users[i][4] || users[i][1],
            avatar: users[i][5] || '',
            dailyGoal: users[i][6] || '',
            createdAt: users[i][7]
          }
        });
      }
    }
    
    return createResponse(false, 'Invalid username or password');
  } catch (error) {
    return createResponse(false, error.toString());
  }
}

function updateUserProfile(data) {
  try {
    const usersSheet = getOrCreateSheet('Users', [
      'ID', 'Username', 'Email', 'Password', 'DisplayName', 
      'Avatar', 'DailyGoal', 'CreatedAt', 'LastLogin'
    ]);
    
    const users = usersSheet.getDataRange().getValues();
    
    for (let i = 1; i < users.length; i++) {
      if (users[i][0] === data.userId) {
        if (data.displayName) usersSheet.getRange(i + 1, 5).setValue(data.displayName);
        if (data.email) usersSheet.getRange(i + 1, 3).setValue(data.email);
        if (data.dailyGoal) usersSheet.getRange(i + 1, 7).setValue(data.dailyGoal);
        if (data.password) {
          usersSheet.getRange(i + 1, 4).setValue(Utilities.base64Encode(data.password));
        }
        break;
      }
    }
    
    return createResponse(true, 'Profile updated');
  } catch (error) {
    return createResponse(false, error.toString());
  }
}

function createUserDataSheets(userId) {
  // Create habits sheet for user
  const habitsSheet = getOrCreateSheet(`User_${userId}_Habits`, [
    'Date', 'Time', 'HabitData'
  ]);
  
  // Create notes sheet for user
  const notesSheet = getOrCreateSheet(`User_${userId}_Notes`, [
    'Date', 'Time', 'Mood', 'Gratitude1', 'Gratitude2', 
    'Gratitude3', 'Journal'
  ]);
}

function saveUserData(data) {
  try {
    const habitsSheet = getOrCreateSheet(`User_${data.userId}_Habits`, [
      'Date', 'Time', 'HabitData'
    ]);
    
    habitsSheet.appendRow([
      data.date,
      new Date().toLocaleTimeString(),
      JSON.stringify(data.data)
    ]);
    
    return createResponse(true, 'Data saved');
  } catch (error) {
    return createResponse(false, error.toString());
  }
}

function getUserData(data) {
  try {
    const habitsSheet = getOrCreateSheet(`User_${data.userId}_Habits`, [
      'Date', 'Time', 'HabitData'
    ]);
    
    const rows = habitsSheet.getDataRange().getValues();
    const userData = {};
    
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === data.date) {
        userData[rows[i][0]] = JSON.parse(rows[i][2]);
      }
    }
    
    return createResponse(true, 'Data loaded', { data: userData });
  } catch (error) {
    return createResponse(false, error.toString());
  }
}

function saveVideo(data) {
  try {
    const folderName = `User_${data.userId}_Videos`;
    const folder = getOrCreateFolder(folderName);
    const decoded = Utilities.base64Decode(data.data);
    const blob = Utilities.newBlob(decoded, 'video/webm', data.filename);
    const file = folder.createFile(blob);
    
    return createResponse(true, 'Video saved', { fileId: file.getId() });
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
    spreadsheet.getActiveSheet().appendRow(headers);
  }
  
  return spreadsheet.getActiveSheet();
}

function getOrCreateFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
}

function createResponse(success, message, data = {}) {
  return ContentService
    .createTextOutput(JSON.stringify({ success, message, ...data }))
    .setMimeType(ContentService.MimeType.JSON);
}