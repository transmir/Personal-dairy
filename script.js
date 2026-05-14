// ============================================================
// script.js  –  User Data Manager (Google Sheets backend)
// All habits / notes / settings are read from and written to
// Google Sheets so data persists across browsers / devices.
// ============================================================

const DEFAULT_HABITS_SETTINGS = {
  enabledHabits: ['sleep', 'study', 'exercise', 'meditation', 'water', 'reading'],
  customHabits:  [],
  habitOrder:    ['sleep', 'study', 'exercise', 'meditation', 'water', 'reading']
};

class UserDataManager {
  constructor(userId) {
    this.userId     = userId;
    this.scriptUrl  = GOOGLE_SCRIPT_URL; // defined in auth.js
    this._cache     = {};                // in-memory cache for this session
    this._loaded    = false;
  }

  // ── Internal helpers ──────────────────────────────────────

  /** POST to Google Apps Script */
  async _post(body) {
    const res = await fetch(this.scriptUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body)
    });
    return res.json();
  }

  /**
   * Load all data types at once from Sheets (called once on init).
   * Subsequent reads use the in-memory cache.
   */
  async loadAll() {
    if (this._loaded) return;
    try {
      const result = await this._post({ action: 'load', userId: this.userId });
      if (result.success && result.data) {
        this._cache  = result.data;
        this._loaded = true;
      }
    } catch (err) {
      console.warn('Could not load data from Sheets:', err);
    }
  }

  /** Save a single type back to Sheets and update the cache */
  async _save(type, data) {
    this._cache[type] = data;
    try {
      await this._post({ action: 'save', userId: this.userId, type, data });
    } catch (err) {
      console.warn('Could not save to Sheets:', err);
    }
  }

  // ── Habits ────────────────────────────────────────────────

  getHabits() {
    return this._cache.habits || {};
  }

  async saveHabits(date, habitData) {
    const all     = this.getHabits();
    all[date]     = habitData;
    await this._save('habits', all);
  }

  loadHabits(date) {
    return this.getHabits()[date] || null;
  }

  // ── Notes ─────────────────────────────────────────────────

  getNotes() {
    return this._cache.notes || {};
  }

  async saveNotes(date, noteData) {
    const all  = this.getNotes();
    all[date]  = noteData;
    await this._save('notes', all);
  }

  loadNotes(date) {
    return this.getNotes()[date] || null;
  }

  // ── Habit Settings ────────────────────────────────────────

  loadHabitSettings() {
    return this._cache.settings || DEFAULT_HABITS_SETTINGS;
  }

  async saveHabitSettings(settings) {
    await this._save('settings', settings);
  }
}

// ── Global init ───────────────────────────────────────────────

let userDataManager;

// Global variables
let mediaRecorder;
let recordedChunks = [];
let isRecording    = false;
let currentDate    = new Date().toISOString().split('T')[0];
let currentMonth   = new Date().getMonth();
let currentYear    = new Date().getFullYear();

// Habit templates (unchanged from original)
const habitTemplates = {
  sleep: {
    name: 'Sleep', icon: '😴',
    fields: [
      { name: 'hours',   label: 'Hours Slept', type: 'number', min: 0, max: 24, step: 0.5 },
      { name: 'quality', label: 'Quality',     type: 'stars' }
    ]
  },
  study: {
    name: 'Study', icon: '📚',
    fields: [
      { name: 'hours',   label: 'Hours',       type: 'number', min: 0, max: 24, step: 0.5 },
      { name: 'subject', label: 'Subject',     type: 'text' },
      { name: 'focus',   label: 'Focus Level', type: 'select', options: ['low','medium','high','excellent'] }
    ]
  },
  exercise: {
    name: 'Exercise', icon: '🏃',
    fields: [
      { name: 'minutes', label: 'Minutes', type: 'number', min: 0 },
      { name: 'type',    label: 'Type',    type: 'select', options: ['running','walking','gym','yoga','swimming','cycling','other'] }
    ]
  },
  meditation: {
    name: 'Meditation', icon: '🧘',
    fields: [
      { name: 'minutes', label: 'Minutes', type: 'number', min: 0 }
    ]
  },
  water: {
    name: 'Water Intake', icon: '💧',
    fields: [
      { name: 'glasses', label: 'Glasses (250ml)', type: 'counter', max: 20 }
    ]
  },
  reading: {
    name: 'Reading', icon: '📖',
    fields: [
      { name: 'minutes',  label: 'Minutes',      type: 'number', min: 0 },
      { name: 'material', label: 'Book/Article', type: 'text' }
    ]
  }
};

// ── App Initialisation ────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async function () {
  if (!auth.getCurrentUser()) {
    window.location.href = 'index.html';
    return;
  }

  userDataManager = new UserDataManager(auth.getCurrentUser().id);

  // Show a loading indicator while we pull data from Sheets
  showLoadingOverlay(true);
  await userDataManager.loadAll();
  showLoadingOverlay(false);

  setupNavigation();
  setupEventListeners();
  loadHabitSettings();
  loadTodayData();
  updateAllDates();
});

function showLoadingOverlay(show) {
  let overlay = document.getElementById('_loadingOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = '_loadingOverlay';
    overlay.innerHTML = `
      <div style="
        position:fixed;inset:0;background:rgba(255,255,255,0.85);
        display:flex;flex-direction:column;align-items:center;
        justify-content:center;z-index:9999;font-family:sans-serif;">
        <div style="font-size:2rem;animation:spin 1s linear infinite">⏳</div>
        <p style="margin-top:12px;color:#555;font-size:0.9rem">Loading your data…</p>
      </div>
      <style>
        @keyframes spin { to { transform: rotate(360deg); } }
      </style>`;
    document.body.appendChild(overlay);
  }
  overlay.style.display = show ? 'block' : 'none';
}

// ── Habit Settings ────────────────────────────────────────────

function loadHabitSettings() {
  const settings  = userDataManager.loadHabitSettings();
  const container = document.getElementById('habitsContainer');
  let html = '';

  settings.habitOrder.forEach(habitKey => {
    if (settings.enabledHabits.includes(habitKey) && habitTemplates[habitKey]) {
      html += generateHabitCard(habitKey, habitTemplates[habitKey]);
    }
  });

  settings.customHabits.forEach(customHabit => {
    html += generateCustomHabitCard(customHabit);
  });

  container.innerHTML = html;
  setupHabitEventListeners();
  loadHabitToggleList(settings);
  loadHabitOrderList(settings);
}

// ── Save / Load ───────────────────────────────────────────────

async function saveHabits() {
  const settings  = userDataManager.loadHabitSettings();
  const habitData = {};

  settings.enabledHabits.forEach(habitKey => {
    if (habitTemplates[habitKey]) {
      habitData[habitKey] = {};
      const template = habitTemplates[habitKey];
      template.fields.forEach(field => {
        const elementId = `${habitKey}_${field.name}`;
        switch (field.type) {
          case 'number':
            habitData[habitKey][field.name] = document.getElementById(elementId)?.value || 0; break;
          case 'text':
            habitData[habitKey][field.name] = document.getElementById(elementId)?.value || ''; break;
          case 'select':
            habitData[habitKey][field.name] = document.getElementById(elementId)?.value || ''; break;
          case 'stars':
            habitData[habitKey][field.name] =
              document.querySelectorAll(`#${elementId} .fa-star.active`).length; break;
          case 'counter':
            habitData[habitKey][field.name] =
              document.getElementById(elementId + '_count')?.textContent || '0'; break;
        }
      });
    }
  });

  settings.customHabits.forEach(customHabit => {
    const elementId = `custom_${customHabit.name}`;
    let value = 0;
    switch (customHabit.unit) {
      case 'minutes': case 'hours': case 'count':
        value = document.getElementById(elementId)?.value || 0; break;
      case 'yesno':
        value = document.querySelector(`#${elementId} .yesno-btn.active`)?.dataset.value === 'yes' ? 1 : 0; break;
    }
    habitData[`custom_${customHabit.name}`] = { value, unit: customHabit.unit, icon: customHabit.icon };
  });

  showSaveMessage('Saving…', 'info');
  await userDataManager.saveHabits(currentDate, habitData);
  showSaveMessage('Habits saved! ✓', 'success');
}

async function saveNotes() {
  const notes = {
    mood:      document.querySelector('.mood.selected')?.dataset.mood || null,
    gratitude: [
      document.getElementById('gratitude1').value,
      document.getElementById('gratitude2').value,
      document.getElementById('gratitude3').value
    ],
    journal: document.getElementById('journalEntry').value
  };

  showSaveMessage('Saving…', 'info');
  await userDataManager.saveNotes(currentDate, notes);
  showSaveMessage('Notes saved! ✓', 'success');
}

function loadTodayData() {
  const habits = userDataManager.loadHabits(currentDate);
  const notes  = userDataManager.loadNotes(currentDate);

  if (habits) loadHabitDataToForm(habits);

  if (notes) {
    if (notes.mood) {
      const moodEl = document.querySelector(`.mood[data-mood="${notes.mood}"]`);
      if (moodEl) moodEl.classList.add('selected');
    }
    if (notes.gratitude) {
      document.getElementById('gratitude1').value = notes.gratitude[0] || '';
      document.getElementById('gratitude2').value = notes.gratitude[1] || '';
      document.getElementById('gratitude3').value = notes.gratitude[2] || '';
    }
    document.getElementById('journalEntry').value = notes.journal || '';
  }
}

// ── Habit Settings CRUD ───────────────────────────────────────

function toggleHabit(habitKey, enabled) {
  const settings = userDataManager.loadHabitSettings();
  if (enabled) {
    if (!settings.enabledHabits.includes(habitKey)) settings.enabledHabits.push(habitKey);
    if (!settings.habitOrder.includes(habitKey))    settings.habitOrder.push(habitKey);
  } else {
    settings.enabledHabits = settings.enabledHabits.filter(h => h !== habitKey);
  }
  userDataManager.saveHabitSettings(settings);
}

function addCustomHabit() {
  const name = document.getElementById('customHabitName').value.trim();
  const icon = document.getElementById('customHabitIcon').value.trim() || '✨';
  const unit = document.getElementById('customHabitUnit').value;

  if (!name) { alert('Please enter a habit name'); return; }

  const settings = userDataManager.loadHabitSettings();
  if (settings.customHabits.find(h => h.name === name)) {
    alert('A habit with this name already exists!'); return;
  }

  const newHabit = { name, icon, unit };
  settings.customHabits.push(newHabit);
  settings.enabledHabits.push(`custom_${name}`);
  settings.habitOrder.push(`custom_${name}`);

  userDataManager.saveHabitSettings(settings);

  document.getElementById('customHabitName').value = '';
  document.getElementById('customHabitIcon').value = '';

  loadHabitSettings();
  alert('Custom habit added!');
}

function deleteCustomHabit(index) {
  if (!confirm('Delete this habit?')) return;
  const settings = userDataManager.loadHabitSettings();
  const habit    = settings.customHabits[index];
  settings.customHabits  = settings.customHabits.filter((_, i) => i !== index);
  settings.enabledHabits = settings.enabledHabits.filter(h => h !== `custom_${habit.name}`);
  settings.habitOrder    = settings.habitOrder.filter(h => h !== `custom_${habit.name}`);
  userDataManager.saveHabitSettings(settings);
  loadHabitSettings();
}

async function saveHabitSettings() {
  const settings   = userDataManager.loadHabitSettings();
  const orderItems = document.querySelectorAll('#habitOrderList .habit-order-item');
  settings.habitOrder = Array.from(orderItems).map(item => item.dataset.habit);
  await userDataManager.saveHabitSettings(settings);
  loadHabitSettings();
  showSaveMessage('Habit settings saved! ✓', 'success');
}

function toggleCustomHabit(index, enabled) {
  const settings    = userDataManager.loadHabitSettings();
  const habit       = settings.customHabits[index];
  const key         = `custom_${habit.name}`;
  if (enabled) {
    if (!settings.enabledHabits.includes(key)) settings.enabledHabits.push(key);
  } else {
    settings.enabledHabits = settings.enabledHabits.filter(h => h !== key);
  }
  userDataManager.saveHabitSettings(settings);
}

// ── UI Helpers (unchanged logic) ──────────────────────────────

function generateHabitCard(key, template) {
  let fieldsHtml = '';
  template.fields.forEach(field => {
    fieldsHtml += `<div class="input-group"><label>${field.label}</label>`;
    switch (field.type) {
      case 'number':
        fieldsHtml += `<input type="number" id="${key}_${field.name}"
          min="${field.min || 0}" max="${field.max || ''}"
          step="${field.step || 1}" placeholder="0">`; break;
      case 'text':
        fieldsHtml += `<input type="text" id="${key}_${field.name}"
          placeholder="Enter ${field.label.toLowerCase()}">`; break;
      case 'select':
        fieldsHtml += `<select id="${key}_${field.name}"><option value="">Select</option>`;
        field.options.forEach(opt => {
          fieldsHtml += `<option value="${opt}">${opt.charAt(0).toUpperCase()+opt.slice(1)}</option>`;
        });
        fieldsHtml += `</select>`; break;
      case 'stars':
        fieldsHtml += `<div class="star-rating" id="${key}_${field.name}">
          <i class="far fa-star" data-rating="1"></i>
          <i class="far fa-star" data-rating="2"></i>
          <i class="far fa-star" data-rating="3"></i>
          <i class="far fa-star" data-rating="4"></i>
          <i class="far fa-star" data-rating="5"></i></div>`; break;
      case 'counter':
        fieldsHtml += `<div class="water-counter">
          <button class="water-btn minus" onclick="adjustCounter('${key}_${field.name}',-1,${field.max})">-</button>
          <span id="${key}_${field.name}_count">0</span>
          <button class="water-btn plus" onclick="adjustCounter('${key}_${field.name}',1,${field.max})">+</button>
        </div>`; break;
    }
    fieldsHtml += `</div>`;
  });
  return `<div class="habit-card" data-habit="${key}">
    <div class="habit-icon">${template.icon}</div>
    <h3>${template.name}</h3>
    <div class="habit-inputs">${fieldsHtml}</div>
  </div>`;
}

function generateCustomHabitCard(customHabit) {
  let fieldsHtml = '';
  switch (customHabit.unit) {
    case 'minutes': case 'hours':
      fieldsHtml = `<div class="input-group">
        <label>${customHabit.unit.charAt(0).toUpperCase()+customHabit.unit.slice(1)}</label>
        <input type="number" id="custom_${customHabit.name}" min="0" step="0.5" placeholder="0">
      </div>`; break;
    case 'count':
      fieldsHtml = `<div class="input-group"><label>Count</label>
        <input type="number" id="custom_${customHabit.name}" min="0" placeholder="0">
      </div>`; break;
    case 'yesno':
      fieldsHtml = `<div class="input-group"><label>Completed?</label>
        <div class="yesno-toggle" id="custom_${customHabit.name}">
          <button class="btn btn-secondary yesno-btn" data-value="no">No</button>
          <button class="btn btn-secondary yesno-btn" data-value="yes">Yes</button>
        </div></div>`; break;
  }
  return `<div class="habit-card custom-habit" data-habit="custom_${customHabit.name}">
    <div class="habit-icon">${customHabit.icon}</div>
    <h3>${customHabit.name}</h3>
    <div class="habit-inputs">${fieldsHtml}</div>
  </div>`;
}

function setupHabitEventListeners() {
  document.querySelectorAll('.star-rating').forEach(starContainer => {
    const stars = starContainer.querySelectorAll('i');
    stars.forEach(star => {
      star.addEventListener('click', function () {
        const rating = this.dataset.rating;
        stars.forEach(s => { s.classList.remove('fas','active'); s.classList.add('far'); });
        for (let i = 0; i < rating; i++) { stars[i].classList.remove('far'); stars[i].classList.add('fas','active'); }
      });
    });
  });
  document.querySelectorAll('.yesno-toggle').forEach(toggle => {
    const buttons = toggle.querySelectorAll('.yesno-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', function () {
        buttons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
      });
    });
  });
}

function adjustCounter(id, change, max) {
  const el  = document.getElementById(id + '_count');
  let count = parseInt(el.textContent) + change;
  if (count < 0)   count = 0;
  if (count > max) count = max;
  el.textContent = count;
}

function loadHabitDataToForm(habitData) {
  Object.keys(habitData).forEach(key => {
    if (key.startsWith('custom_')) {
      const elementId = `custom_${key.replace('custom_','')}`;
      const data      = habitData[key];
      if (data.unit === 'yesno') {
        const btn = document.querySelector(`#${elementId} .yesno-btn[data-value="${data.value==1?'yes':'no'}"]`);
        if (btn) btn.click();
      } else {
        const input = document.getElementById(elementId);
        if (input) input.value = data.value;
      }
    } else if (habitTemplates[key]) {
      const template = habitTemplates[key];
      const data     = habitData[key];
      template.fields.forEach(field => {
        const elementId = `${key}_${field.name}`;
        switch (field.type) {
          case 'number': case 'text':
            const inp = document.getElementById(elementId); if (inp) inp.value = data[field.name] || ''; break;
          case 'select':
            const sel = document.getElementById(elementId); if (sel) sel.value = data[field.name] || ''; break;
          case 'stars':
            document.querySelectorAll(`#${elementId} i`).forEach((s, i) => {
              if (i < (data[field.name]||0)) { s.classList.remove('far'); s.classList.add('fas','active'); }
            }); break;
          case 'counter':
            const ctr = document.getElementById(elementId+'_count'); if (ctr) ctr.textContent = data[field.name]||'0'; break;
        }
      });
    }
  });
}

function loadHabitToggleList(settings) {
  const container = document.getElementById('habitToggleList');
  let html = '';
  Object.keys(habitTemplates).forEach(key => {
    const habit     = habitTemplates[key];
    const isEnabled = settings.enabledHabits.includes(key);
    html += `<div class="habit-toggle-item">
      <span class="habit-toggle-icon">${habit.icon}</span>
      <span class="habit-toggle-name">${habit.name}</span>
      <label class="switch">
        <input type="checkbox" ${isEnabled?'checked':''} onchange="toggleHabit('${key}',this.checked)">
        <span class="slider"></span>
      </label>
    </div>`;
  });
  settings.customHabits.forEach((habit, index) => {
    html += `<div class="habit-toggle-item custom-habit-item">
      <span class="habit-toggle-icon">${habit.icon}</span>
      <span class="habit-toggle-name">${habit.name}</span>
      <label class="switch">
        <input type="checkbox" checked onchange="toggleCustomHabit(${index},this.checked)">
        <span class="slider"></span>
      </label>
      <button class="btn-delete-habit" onclick="deleteCustomHabit(${index})">
        <i class="fas fa-trash"></i>
      </button>
    </div>`;
  });
  container.innerHTML = html;
}

function loadHabitOrderList(settings) {
  const container = document.getElementById('habitOrderList');
  let html = '';
  settings.habitOrder.forEach(key => {
    let name, icon;
    if (habitTemplates[key]) { name = habitTemplates[key].name; icon = habitTemplates[key].icon; }
    else if (key.startsWith('custom_')) {
      const ch = settings.customHabits.find(h => `custom_${h.name}` === key);
      if (ch) { name = ch.name; icon = ch.icon; }
    }
    if (name) {
      html += `<div class="habit-order-item" data-habit="${key}">
        <span class="drag-handle">☰</span><span>${icon}</span><span>${name}</span>
      </div>`;
    }
  });
  container.innerHTML = html;
  new Sortable(container, { animation: 150, handle: '.drag-handle', ghostClass: 'sortable-ghost' });
}

function showSaveMessage(message, type) {
  const msgDiv = document.getElementById('saveMessage');
  if (msgDiv) {
    msgDiv.textContent  = message;
    msgDiv.className    = 'save-message ' + type;
    setTimeout(() => { msgDiv.className = 'save-message'; }, 3000);
  }
}

function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', function () {
      navItems.forEach(n => n.classList.remove('active'));
      this.classList.add('active');
      const tabName = this.dataset.tab;
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      document.getElementById(`${tabName}-tab`).classList.add('active');
    });
  });
}

function setupEventListeners() {
  document.getElementById('saveHabits')?.addEventListener('click', saveHabits);
  document.getElementById('saveNotes')?.addEventListener('click', saveNotes);
  document.getElementById('startRecording')?.addEventListener('click', startRecording);
  document.getElementById('stopRecording')?.addEventListener('click', stopRecording);
  document.getElementById('saveVideo')?.addEventListener('click', saveVideoToDrive);
  document.querySelectorAll('.mood').forEach(mood => {
    mood.addEventListener('click', function () {
      document.querySelectorAll('.mood').forEach(m => m.classList.remove('selected'));
      this.classList.add('selected');
    });
  });
}

function updateAllDates() {
  const now         = new Date();
  const options     = { weekday:'long', year:'numeric', month:'long', day:'numeric' };
  const dateString  = now.toLocaleDateString('en-US', options);
  document.getElementById('currentDate').textContent = dateString;
  document.getElementById('notesDate').textContent   = dateString;
}

// ── Video recording ────────────────────────────────────────────

async function setupVideoRecording() {
  try {
    const stream  = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    document.getElementById('preview').srcObject = stream;
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = e => { if (e.data.size > 0) recordedChunks.push(e.data); };
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      document.getElementById('recordedVideo').src          = URL.createObjectURL(blob);
      document.getElementById('recordedVideo').style.display = 'block';
      document.getElementById('preview').style.display       = 'none';
      document.getElementById('saveVideo').disabled          = false;
    };
  } catch (err) { console.error('Camera error:', err); }
}

function startRecording() {
  recordedChunks = [];
  mediaRecorder.start();
  isRecording = true;
  document.getElementById('startRecording').disabled = true;
  document.getElementById('stopRecording').disabled  = false;
}

function stopRecording() {
  mediaRecorder.stop();
  isRecording = false;
  document.getElementById('startRecording').disabled = false;
  document.getElementById('stopRecording').disabled  = true;
}

function saveVideoToDrive() {
  showSaveMessage('Video saved successfully! ✓', 'success');
}