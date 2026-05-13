// Configuration - Replace with your Google Apps Script URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxGuKMsxDzNz_Rm2coaRorfnpWgdV10--9eC5HloxF0nZIrWbI19jL15LdonsTL8eNC/exec';

// Global variables
let mediaRecorder;
let recordedChunks = [];
let isRecording = false;

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    updateCurrentDate();
    setupVideoRecording();
    setupEventListeners();
    requestCameraPermission();
});

// Update current date display
function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);
    document.getElementById('historyDate').value = now.toISOString().split('T')[0];
}

// Setup video recording
async function setupVideoRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        const preview = document.getElementById('preview');
        preview.srcObject = stream;

        mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm'
        });

        mediaRecorder.ondataavailable = function (event) {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = function () {
            const blob = new Blob(recordedChunks, {
                type: 'video/webm'
            });
            const url = URL.createObjectURL(blob);
            const recordedVideo = document.getElementById('recordedVideo');
            recordedVideo.src = url;
            recordedVideo.style.display = 'block';
            document.getElementById('preview').style.display = 'none';

            // Store blob for upload
            window.recordedBlob = blob;
            document.getElementById('saveVideo').disabled = false;
        };

    } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Unable to access camera. Please make sure you have granted camera permissions.');
    }
}

// Request camera permission
function requestCameraPermission() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
            stream.getTracks().forEach(track => track.stop());
        })
        .catch(error => {
            console.log('Camera permission not granted yet');
        });
}

// Setup event listeners
function setupEventListeners() {
    // Video recording controls
    document.getElementById('startRecording').addEventListener('click', startRecording);
    document.getElementById('stopRecording').addEventListener('click', stopRecording);
    document.getElementById('saveVideo').addEventListener('click', saveVideoToDrive);

    // Habit saving
    document.getElementById('saveHabits').addEventListener('click', saveHabits);

    // History loading
    document.getElementById('loadHistory').addEventListener('click', loadHistory);
}

// Start recording
function startRecording() {
    recordedChunks = [];
    mediaRecorder.start();
    isRecording = true;

    document.getElementById('startRecording').disabled = true;
    document.getElementById('stopRecording').disabled = false;
    document.getElementById('saveVideo').disabled = true;

    const status = document.getElementById('recordingStatus');
    status.textContent = '🔴 Recording...';
    status.className = 'recording-status active';

    document.getElementById('recordedVideo').style.display = 'none';
    document.getElementById('preview').style.display = 'block';
}

// Stop recording
function stopRecording() {
    mediaRecorder.stop();
    isRecording = false;

    document.getElementById('startRecording').disabled = false;
    document.getElementById('stopRecording').disabled = true;

    const status = document.getElementById('recordingStatus');
    status.textContent = '';
    status.className = 'recording-status';
}

// Save video to Google Drive
async function saveVideoToDrive() {
    if (!window.recordedBlob) {
        alert('No video recorded yet!');
        return;
    }

    const progressBar = document.getElementById('uploadProgress');
    const progress = progressBar.querySelector('.progress');
    progressBar.style.display = 'block';
    progress.style.width = '0%';

    try {
        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(window.recordedBlob);

        reader.onload = async function () {
            const base64Data = reader.result.split(',')[1];
            const date = new Date().toISOString().split('T')[0];
            const filename = `video_diary_${date}_${Date.now()}.webm`;

            // Update progress
            progress.style.width = '50%';

            // Send to Google Apps Script
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'saveVideo',
                    filename: filename,
                    data: base64Data,
                    date: date
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            progress.style.width = '100%';

            if (result.success) {
                alert('Video saved successfully!');
                // Reset UI
                document.getElementById('recordedVideo').style.display = 'none';
                document.getElementById('preview').style.display = 'block';
                document.getElementById('saveVideo').disabled = true;
                window.recordedBlob = null;
            } else {
                alert('Error saving video: ' + result.error);
            }

            setTimeout(() => {
                progressBar.style.display = 'none';
                progress.style.width = '0%';
            }, 2000);
        };

    } catch (error) {
        console.error('Error uploading video:', error);
        alert('Error uploading video. Please check your connection and try again.');
        progressBar.style.display = 'none';
    }
}

// Save habits
async function saveHabits() {
    const habitData = {
        date: new Date().toISOString().split('T')[0],
        sleep: {
            hours: document.getElementById('sleepHours').value,
            quality: document.getElementById('sleepQuality').value
        },
        study: {
            hours: document.getElementById('studyHours').value,
            subject: document.getElementById('studySubject').value
        },
        exercise: {
            minutes: document.getElementById('exerciseMinutes').value,
            type: document.getElementById('exerciseType').value
        },
        water: {
            glasses: document.getElementById('waterGlasses').value
        },
        meditation: {
            minutes: document.getElementById('meditationMinutes').value
        },
        journal: document.getElementById('journalEntry').value
    };

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'saveHabits',
                data: habitData
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.success) {
            alert('Habits saved successfully!');
            // Clear form
            clearHabitForm();
        } else {
            alert('Error saving habits: ' + result.error);
        }

    } catch (error) {
        console.error('Error saving habits:', error);
        alert('Error saving habits. Please try again.');
    }
}

// Clear habit form
function clearHabitForm() {
    document.getElementById('sleepHours').value = '';
    document.getElementById('sleepQuality').value = '';
    document.getElementById('studyHours').value = '';
    document.getElementById('studySubject').value = '';
    document.getElementById('exerciseMinutes').value = '';
    document.getElementById('exerciseType').value = '';
    document.getElementById('waterGlasses').value = '';
    document.getElementById('meditationMinutes').value = '';
    document.getElementById('journalEntry').value = '';
}

// Load history
async function loadHistory() {
    const date = document.getElementById('historyDate').value;

    if (!date) {
        alert('Please select a date');
        return;
    }

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'getHistory',
                date: date
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.success) {
            displayVideoHistory(result.videos);
            displayHabitHistory(result.habits);
        } else {
            alert('Error loading history: ' + result.error);
        }

    } catch (error) {
        console.error('Error loading history:', error);
        alert('Error loading history. Please try again.');
    }
}

// Display video history
function displayVideoHistory(videos) {
    const container = document.getElementById('videoHistory');

    if (!videos || videos.length === 0) {
        container.innerHTML = '<p>No videos found for this date.</p>';
        return;
    }

    let html = '';
    videos.forEach(video => {
        html += `
            <div class="video-history-item">
                <p><strong>${video.date} - ${video.time}</strong></p>
                <video controls src="${video.url}"></video>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Display habit history
function displayHabitHistory(habits) {
    const container = document.getElementById('habitHistory');

    if (!habits) {
        container.innerHTML = '<p>No habits recorded for this date.</p>';
        return;
    }

    let html = '<div class="habits-grid">';

    if (habits.sleep) {
        html += `
            <div class="habit-card">
                <h3>😴 Sleep</h3>
                <p>Hours: ${habits.sleep.hours || 'N/A'}</p>
                <p>Quality: ${habits.sleep.quality || 'N/A'}</p>
            </div>
        `;
    }

    if (habits.study) {
        html += `
            <div class="habit-card">
                <h3>📚 Study</h3>
                <p>Hours: ${habits.study.hours || 'N/A'}</p>
                <p>Subject: ${habits.study.subject || 'N/A'}</p>
            </div>
        `;
    }

    if (habits.exercise) {
        html += `
            <div class="habit-card">
                <h3>🏃 Exercise</h3>
                <p>Minutes: ${habits.exercise.minutes || 'N/A'}</p>
                <p>Type: ${habits.exercise.type || 'N/A'}</p>
            </div>
        `;
    }

    if (habits.water) {
        html += `
            <div class="habit-card">
                <h3>💧 Water</h3>
                <p>Glasses: ${habits.water.glasses || 'N/A'}</p>
            </div>
        `;
    }

    if (habits.meditation) {
        html += `
            <div class="habit-card">
                <h3>🧘 Meditation</h3>
                <p>Minutes: ${habits.meditation.minutes || 'N/A'}</p>
            </div>
        `;
    }

    if (habits.journal) {
        html += `
            <div class="habit-card">
                <h3>📝 Journal</h3>
                <p>${habits.journal || 'N/A'}</p>
            </div>
        `;
    }

    html += '</div>';
    container.innerHTML = html;
}