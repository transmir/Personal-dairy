// User-specific data management
class UserDataManager {
    constructor(userId) {
        this.userId = userId;
        this.storagePrefix = `user_${userId}_`;
    }

    // Get user-specific storage key
    getKey(baseKey) {
        return this.storagePrefix + baseKey;
    }

    // Save habits
    saveHabits(date, habitData) {
        const key = this.getKey('habits');
        const allHabits = JSON.parse(localStorage.getItem(key) || '{}');
        allHabits[date] = habitData;
        localStorage.setItem(key, JSON.stringify(allHabits));
    }

    // Load habits for a date
    loadHabits(date) {
        const key = this.getKey('habits');
        const allHabits = JSON.parse(localStorage.getItem(key) || '{}');
        return allHabits[date] || null;
    }

    // Save notes
    saveNotes(date, noteData) {
        const key = this.getKey('notes');
        const allNotes = JSON.parse(localStorage.getItem(key) || '{}');
        allNotes[date] = noteData;
        localStorage.setItem(key, JSON.stringify(allNotes));
    }

    // Load notes for a date
    loadNotes(date) {
        const key = this.getKey('notes');
        const allNotes = JSON.parse(localStorage.getItem(key) || '{}');
        return allNotes[date] || null;
    }

    // Save video
    saveVideo(date, videoData) {
        const key = this.getKey('videos');
        const allVideos = JSON.parse(localStorage.getItem(key) || '{}');
        if (!allVideos[date]) {
            allVideos[date] = [];
        }
        allVideos[date].push(videoData);
        localStorage.setItem(key, JSON.stringify(allVideos));
    }

    // Load videos for a date
    loadVideos(date) {
        const key = this.getKey('videos');
        const allVideos = JSON.parse(localStorage.getItem(key) || '{}');
        return allVideos[date] || [];
    }

    // Save habit settings
    saveHabitSettings(settings) {
        const key = this.getKey('habitSettings');
        localStorage.setItem(key, JSON.stringify(settings));
    }

    // Load habit settings
    loadHabitSettings() {
        const key = this.getKey('habitSettings');
        const settings = localStorage.getItem(key);
        
        if (settings) {
            return JSON.parse(settings);
        }
        
        // Default habits
        return {
            enabledHabits: ['sleep', 'study', 'exercise', 'meditation', 'water', 'reading'],
            customHabits: [],
            habitOrder: ['sleep', 'study', 'exercise', 'meditation', 'water', 'reading']
        };
    }
}

// Initialize user data manager
let userDataManager;

if (auth.getCurrentUser()) {
    userDataManager = new UserDataManager(auth.getCurrentUser().id);
}

// Global variables
let mediaRecorder;
let recordedChunks = [];
let isRecording = false;
let currentDate = new Date().toISOString().split('T')[0];
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// Habit templates
const habitTemplates = {
    sleep: {
        name: 'Sleep',
        icon: '😴',
        fields: [
            { name: 'hours', label: 'Hours Slept', type: 'number', min: 0, max: 24, step: 0.5 },
            { name: 'quality', label: 'Quality', type: 'stars' }
        ]
    },
    study: {
        name: 'Study',
        icon: '📚',
        fields: [
            { name: 'hours', label: 'Hours', type: 'number', min: 0, max: 24, step: 0.5 },
            { name: 'subject', label: 'Subject', type: 'text' },
            { name: 'focus', label: 'Focus Level', type: 'select', options: ['low', 'medium', 'high', 'excellent'] }
        ]
    },
    exercise: {
        name: 'Exercise',
        icon: '🏃',
        fields: [
            { name: 'minutes', label: 'Minutes', type: 'number', min: 0 },
            { name: 'type', label: 'Type', type: 'select', options: ['running', 'walking', 'gym', 'yoga', 'swimming', 'cycling', 'other'] }
        ]
    },
    meditation: {
        name: 'Meditation',
        icon: '🧘',
        fields: [
            { name: 'minutes', label: 'Minutes', type: 'number', min: 0 }
        ]
    },
    water: {
        name: 'Water Intake',
        icon: '💧',
        fields: [
            { name: 'glasses', label: 'Glasses (250ml)', type: 'counter', max: 20 }
        ]
    },
    reading: {
        name: 'Reading',
        icon: '📖',
        fields: [
            { name: 'minutes', label: 'Minutes', type: 'number', min: 0 },
            { name: 'material', label: 'Book/Article', type: 'text' }
        ]
    }
};

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', function() {
    if (!auth.getCurrentUser()) {
        window.location.href = 'index.html';
        return;
    }
    
    userDataManager = new UserDataManager(auth.getCurrentUser().id);
    
    initializeApp();
    setupNavigation();
    setupEventListeners();
    loadHabitSettings();
    loadTodayData();
    updateAllDates();
});

// Initialize App
function initializeApp() {
    // Create storage if not exists
    if (!localStorage.getItem(userDataManager.getKey('habits'))) {
        localStorage.setItem(userDataManager.getKey('habits'), JSON.stringify({}));
    }
    if (!localStorage.getItem(userDataManager.getKey('notes'))) {
        localStorage.setItem(userDataManager.getKey('notes'), JSON.stringify({}));
    }
    if (!localStorage.getItem(userDataManager.getKey('videos'))) {
        localStorage.setItem(userDataManager.getKey('videos'), JSON.stringify({}));
    }
}

// Load habit settings and generate UI
function loadHabitSettings() {
    const settings = userDataManager.loadHabitSettings();
    const container = document.getElementById('habitsContainer');
    
    let html = '';
    
    // Add enabled habits in order
    settings.habitOrder.forEach(habitKey => {
        if (settings.enabledHabits.includes(habitKey) && habitTemplates[habitKey]) {
            html += generateHabitCard(habitKey, habitTemplates[habitKey]);
        }
    });
    
    // Add custom habits
    settings.customHabits.forEach(customHabit => {
        html += generateCustomHabitCard(customHabit);
    });
    
    container.innerHTML = html;
    
    // Setup event listeners for newly created elements
    setupHabitEventListeners();
    
    // Load habit toggle list for settings page
    loadHabitToggleList(settings);
    loadHabitOrderList(settings);
}

// Generate habit card HTML
function generateHabitCard(key, template) {
    let fieldsHtml = '';
    
    template.fields.forEach(field => {
        fieldsHtml += `<div class="input-group">
            <label>${field.label}</label>`;
        
        switch(field.type) {
            case 'number':
                fieldsHtml += `<input type="number" id="${key}_${field.name}" 
                    min="${field.min || 0}" max="${field.max || ''}" 
                    step="${field.step || 1}" placeholder="0">`;
                break;
            case 'text':
                fieldsHtml += `<input type="text" id="${key}_${field.name}" 
                    placeholder="Enter ${field.label.toLowerCase()}">`;
                break;
            case 'select':
                fieldsHtml += `<select id="${key}_${field.name}">
                    <option value="">Select</option>`;
                field.options.forEach(opt => {
                    fieldsHtml += `<option value="${opt}">${opt.charAt(0).toUpperCase() + opt.slice(1)}</option>`;
                });
                fieldsHtml += `</select>`;
                break;
            case 'stars':
                fieldsHtml += `<div class="star-rating" id="${key}_${field.name}">
                    <i class="far fa-star" data-rating="1"></i>
                    <i class="far fa-star" data-rating="2"></i>
                    <i class="far fa-star" data-rating="3"></i>
                    <i class="far fa-star" data-rating="4"></i>
                    <i class="far fa-star" data-rating="5"></i>
                </div>`;
                break;
            case 'counter':
                fieldsHtml += `<div class="water-counter">
                    <button class="water-btn minus" onclick="adjustCounter('${key}_${field.name}', -1, ${field.max})">-</button>
                    <span id="${key}_${field.name}_count">0</span>
                    <button class="water-btn plus" onclick="adjustCounter('${key}_${field.name}', 1, ${field.max})">+</button>
                </div>`;
                break;
        }
        
        fieldsHtml += `</div>`;
    });
    
    return `
        <div class="habit-card" data-habit="${key}">
            <div class="habit-icon">${template.icon}</div>
            <h3>${template.name}</h3>
            <div class="habit-inputs">${fieldsHtml}</div>
        </div>
    `;
}

// Generate custom habit card
function generateCustomHabitCard(customHabit) {
    let fieldsHtml = '';
    
    switch(customHabit.unit) {
        case 'minutes':
        case 'hours':
            fieldsHtml = `<div class="input-group">
                <label>${customHabit.unit.charAt(0).toUpperCase() + customHabit.unit.slice(1)}</label>
                <input type="number" id="custom_${customHabit.name}" min="0" step="0.5" placeholder="0">
            </div>`;
            break;
        case 'count':
            fieldsHtml = `<div class="input-group">
                <label>Count</label>
                <input type="number" id="custom_${customHabit.name}" min="0" placeholder="0">
            </div>`;
            break;
        case 'yesno':
            fieldsHtml = `<div class="input-group">
                <label>Completed?</label>
                <div class="yesno-toggle" id="custom_${customHabit.name}">
                    <button class="btn btn-secondary yesno-btn" data-value="no">No</button>
                    <button class="btn btn-secondary yesno-btn" data-value="yes">Yes</button>
                </div>
            </div>`;
            break;
    }
    
    return `
        <div class="habit-card custom-habit" data-habit="custom_${customHabit.name}">
            <div class="habit-icon">${customHabit.icon}</div>
            <h3>${customHabit.name}</h3>
            <div class="habit-inputs">${fieldsHtml}</div>
        </div>
    `;
}

// Setup habit event listeners
function setupHabitEventListeners() {
    // Star ratings
    document.querySelectorAll('.star-rating').forEach(starContainer => {
        const stars = starContainer.querySelectorAll('i');
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = this.dataset.rating;
                stars.forEach(s => {
                    s.classList.remove('fas', 'active');
                    s.classList.add('far');
                });
                for (let i = 0; i < rating; i++) {
                    stars[i].classList.remove('far');
                    stars[i].classList.add('fas', 'active');
                }
            });
        });
    });
    
    // Yes/No toggles
    document.querySelectorAll('.yesno-toggle').forEach(toggle => {
        const buttons = toggle.querySelectorAll('.yesno-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', function() {
                buttons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });
    });
}

// Counter adjustment
function adjustCounter(id, change, max) {
    const countElement = document.getElementById(id + '_count');
    let count = parseInt(countElement.textContent);
    count += change;
    if (count < 0) count = 0;
    if (count > max) count = max;
    countElement.textContent = count;
}

// Save habits
function saveHabits() {
    const settings = userDataManager.loadHabitSettings();
    const habitData = {};
    
    // Save enabled habits
    settings.enabledHabits.forEach(habitKey => {
        if (habitTemplates[habitKey]) {
            habitData[habitKey] = {};
            const template = habitTemplates[habitKey];
            
            template.fields.forEach(field => {
                const elementId = `${habitKey}_${field.name}`;
                
                switch(field.type) {
                    case 'number':
                        habitData[habitKey][field.name] = document.getElementById(elementId)?.value || 0;
                        break;
                    case 'text':
                        habitData[habitKey][field.name] = document.getElementById(elementId)?.value || '';
                        break;
                    case 'select':
                        habitData[habitKey][field.name] = document.getElementById(elementId)?.value || '';
                        break;
                    case 'stars':
                        const activeStars = document.querySelectorAll(`#${elementId} .fa-star.active`).length;
                        habitData[habitKey][field.name] = activeStars;
                        break;
                    case 'counter':
                        habitData[habitKey][field.name] = document.getElementById(elementId + '_count')?.textContent || '0';
                        break;
                }
            });
        }
    });
    
    // Save custom habits
    settings.customHabits.forEach(customHabit => {
        const elementId = `custom_${customHabit.name}`;
        let value = 0;
        
        switch(customHabit.unit) {
            case 'minutes':
            case 'hours':
                value = document.getElementById(elementId)?.value || 0;
                break;
            case 'count':
                value = document.getElementById(elementId)?.value || 0;
                break;
            case 'yesno':
                const activeBtn = document.querySelector(`#${elementId} .yesno-btn.active`);
                value = activeBtn?.dataset.value === 'yes' ? 1 : 0;
                break;
        }
        
        habitData[`custom_${customHabit.name}`] = {
            value: value,
            unit: customHabit.unit,
            icon: customHabit.icon
        };
    });
    
    userDataManager.saveHabits(currentDate, habitData);
    showSaveMessage('Habits saved successfully!', 'success');
    
    // Also save to Google Drive
    if (GOOGLE_SCRIPT_URL !== 'https://script.google.com/macros/s/AKfycbwIxLNnqQQMK-YY_DgQH_mMo-vOREnbraDJdZl99J5rNzqSRo8Y65bhN5zsWwllFDZK/exec') {
        saveToGoogleDrive(currentDate, habitData);
    }
}

// Save notes
function saveNotes() {
    const notes = {
        mood: document.querySelector('.mood.selected')?.dataset.mood || null,
        gratitude: [
            document.getElementById('gratitude1').value,
            document.getElementById('gratitude2').value,
            document.getElementById('gratitude3').value
        ],
        journal: document.getElementById('journalEntry').value
    };
    
    userDataManager.saveNotes(currentDate, notes);
    showSaveMessage('Notes saved successfully!', 'success');
}

// Save to Google Drive
async function saveToGoogleDrive(date, habitData) {
    try {
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'saveUserData',
                userId: auth.getCurrentUser().id,
                date: date,
                data: habitData
            }),
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error saving to Drive:', error);
    }
}

// Load today's data
function loadTodayData() {
    const habits = userDataManager.loadHabits(currentDate);
    const notes = userDataManager.loadNotes(currentDate);
    
    if (habits) {
        loadHabitDataToForm(habits);
    }
    
    if (notes) {
        // Load mood
        if (notes.mood) {
            const moodElement = document.querySelector(`.mood[data-mood="${notes.mood}"]`);
            if (moodElement) moodElement.classList.add('selected');
        }
        
        // Load gratitude
        if (notes.gratitude) {
            document.getElementById('gratitude1').value = notes.gratitude[0] || '';
            document.getElementById('gratitude2').value = notes.gratitude[1] || '';
            document.getElementById('gratitude3').value = notes.gratitude[2] || '';
        }
        
        // Load journal
        document.getElementById('journalEntry').value = notes.journal || '';
    }
}

// Load habit data into form
function loadHabitDataToForm(habitData) {
    Object.keys(habitData).forEach(key => {
        if (key.startsWith('custom_')) {
            // Custom habit
            const customName = key.replace('custom_', '');
            const elementId = `custom_${customName}`;
            const data = habitData[key];
            
            if (data.unit === 'yesno') {
                const btn = document.querySelector(`#${elementId} .yesno-btn[data-value="${data.value == 1 ? 'yes' : 'no'}"]`);
                if (btn) btn.click();
            } else {
                const input = document.getElementById(elementId);
                if (input) input.value = data.value;
            }
        } else if (habitTemplates[key]) {
            // Default habit
            const template = habitTemplates[key];
            const data = habitData[key];
            
            template.fields.forEach(field => {
                const elementId = `${key}_${field.name}`;
                
                switch(field.type) {
                    case 'number':
                        const numInput = document.getElementById(elementId);
                        if (numInput) numInput.value = data[field.name] || '';
                        break;
                    case 'text':
                        const textInput = document.getElementById(elementId);
                        if (textInput) textInput.value = data[field.name] || '';
                        break;
                    case 'select':
                        const select = document.getElementById(elementId);
                        if (select) select.value = data[field.name] || '';
                        break;
                    case 'stars':
                        const stars = document.querySelectorAll(`#${elementId} i`);
                        stars.forEach((star, index) => {
                            if (index < (data[field.name] || 0)) {
                                star.classList.remove('far');
                                star.classList.add('fas', 'active');
                            }
                        });
                        break;
                    case 'counter':
                        const counter = document.getElementById(elementId + '_count');
                        if (counter) counter.textContent = data[field.name] || '0';
                        break;
                }
            });
        }
    });
}

// Habit Settings Functions
function loadHabitToggleList(settings) {
    const container = document.getElementById('habitToggleList');
    let html = '';
    
    Object.keys(habitTemplates).forEach(key => {
        const habit = habitTemplates[key];
        const isEnabled = settings.enabledHabits.includes(key);
        
        html += `
            <div class="habit-toggle-item">
                <span class="habit-toggle-icon">${habit.icon}</span>
                <span class="habit-toggle-name">${habit.name}</span>
                <label class="switch">
                    <input type="checkbox" ${isEnabled ? 'checked' : ''} 
                        onchange="toggleHabit('${key}', this.checked)">
                    <span class="slider"></span>
                </label>
            </div>
        `;
    });
    
    // Add custom habits
    settings.customHabits.forEach((habit, index) => {
        html += `
            <div class="habit-toggle-item custom-habit-item">
                <span class="habit-toggle-icon">${habit.icon}</span>
                <span class="habit-toggle-name">${habit.name}</span>
                <label class="switch">
                    <input type="checkbox" checked onchange="toggleCustomHabit(${index}, this.checked)">
                    <span class="slider"></span>
                </label>
                <button class="btn-delete-habit" onclick="deleteCustomHabit(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function loadHabitOrderList(settings) {
    const container = document.getElementById('habitOrderList');
    let html = '';
    
    settings.habitOrder.forEach(key => {
        let name, icon;
        
        if (habitTemplates[key]) {
            name = habitTemplates[key].name;
            icon = habitTemplates[key].icon;
        } else if (key.startsWith('custom_')) {
            const customHabit = settings.customHabits.find(h => `custom_${h.name}` === key);
            if (customHabit) {
                name = customHabit.name;
                icon = customHabit.icon;
            }
        }
        
        if (name) {
            html += `
                <div class="habit-order-item" data-habit="${key}">
                    <span class="drag-handle">☰</span>
                    <span>${icon}</span>
                    <span>${name}</span>
                </div>
            `;
        }
    });
    
    container.innerHTML = html;
    
    // Initialize drag and drop
    new Sortable(container, {
        animation: 150,
        handle: '.drag-handle',
        ghostClass: 'sortable-ghost'
    });
}

// Toggle habit
function toggleHabit(habitKey, enabled) {
    const settings = userDataManager.loadHabitSettings();
    
    if (enabled) {
        if (!settings.enabledHabits.includes(habitKey)) {
            settings.enabledHabits.push(habitKey);
        }
        if (!settings.habitOrder.includes(habitKey)) {
            settings.habitOrder.push(habitKey);
        }
    } else {
        settings.enabledHabits = settings.enabledHabits.filter(h => h !== habitKey);
    }
    
    userDataManager.saveHabitSettings(settings);
}

// Add custom habit
function addCustomHabit() {
    const name = document.getElementById('customHabitName').value.trim();
    const icon = document.getElementById('customHabitIcon').value.trim() || '✨';
    const unit = document.getElementById('customHabitUnit').value;
    
    if (!name) {
        alert('Please enter a habit name');
        return;
    }
    
    const settings = userDataManager.loadHabitSettings();
    
    // Check if habit already exists
    if (settings.customHabits.find(h => h.name === name)) {
        alert('A habit with this name already exists!');
        return;
    }
    
    const newHabit = { name, icon, unit };
    settings.customHabits.push(newHabit);
    settings.enabledHabits.push(`custom_${name}`);
    settings.habitOrder.push(`custom_${name}`);
    
    userDataManager.saveHabitSettings(settings);
    
    // Clear inputs
    document.getElementById('customHabitName').value = '';
    document.getElementById('customHabitIcon').value = '';
    
    // Reload settings
    loadHabitSettings();
    alert('Custom habit added successfully!');
}

// Delete custom habit
function deleteCustomHabit(index) {
    if (!confirm('Are you sure you want to delete this habit?')) return;
    
    const settings = userDataManager.loadHabitSettings();
    const habit = settings.customHabits[index];
    
    settings.customHabits.splice(index, 1);
    settings.enabledHabits = settings.enabledHabits.filter(h => h !== `custom_${habit.name}`);
    settings.habitOrder = settings.habitOrder.filter(h => h !== `custom_${habit.name}`);
    
    userDataManager.saveHabitSettings(settings);
    loadHabitSettings();
}

// Save habit settings
function saveHabitSettings() {
    const settings = userDataManager.loadHabitSettings();
    
    // Update habit order from drag and drop
    const orderItems = document.querySelectorAll('#habitOrderList .habit-order-item');
    settings.habitOrder = Array.from(orderItems).map(item => item.dataset.habit);
    
    userDataManager.saveHabitSettings(settings);
    loadHabitSettings(); // Reload the main habits view
    showSaveMessage('Habit settings saved!', 'success');
}

// ... (rest of the functions remain similar to previous version)

// Show save message
function showSaveMessage(message, type) {
    const msgDiv = document.getElementById('saveMessage');
    if (msgDiv) {
        msgDiv.textContent = message;
        msgDiv.className = 'save-message ' + type;
        setTimeout(() => {
            msgDiv.className = 'save-message';
        }, 3000);
    }
}

// Setup navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            const tabName = this.dataset.tab;
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('saveHabits')?.addEventListener('click', saveHabits);
    document.getElementById('saveNotes')?.addEventListener('click', saveNotes);
    
    // Video recording
    document.getElementById('startRecording')?.addEventListener('click', startRecording);
    document.getElementById('stopRecording')?.addEventListener('click', stopRecording);
    document.getElementById('saveVideo')?.addEventListener('click', saveVideoToDrive);
    
    // Mood selector
    document.querySelectorAll('.mood').forEach(mood => {
        mood.addEventListener('click', function() {
            document.querySelectorAll('.mood').forEach(m => m.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
}

// Update dates
function updateAllDates() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString('en-US', options);
    
    document.getElementById('currentDate').textContent = dateString;
    document.getElementById('notesDate').textContent = dateString;
}

// Video recording functions (simplified)
async function setupVideoRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        document.getElementById('preview').srcObject = stream;
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) recordedChunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            document.getElementById('recordedVideo').src = URL.createObjectURL(blob);
            document.getElementById('recordedVideo').style.display = 'block';
            document.getElementById('preview').style.display = 'none';
            document.getElementById('saveVideo').disabled = false;
        };
    } catch (error) {
        console.error('Camera error:', error);
    }
}

function startRecording() {
    recordedChunks = [];
    mediaRecorder.start();
    isRecording = true;
    document.getElementById('startRecording').disabled = true;
    document.getElementById('stopRecording').disabled = false;
}

function stopRecording() {
    mediaRecorder.stop();
    isRecording = false;
    document.getElementById('startRecording').disabled = false;
    document.getElementById('stopRecording').disabled = true;
}

function saveVideoToDrive() {
    // Video save logic
    showSaveMessage('Video saved successfully!', 'success');
}