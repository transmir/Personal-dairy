// Google Apps Script URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwIxLNnqQQMK-YY_DgQH_mMo-vOREnbraDJdZl99J5rNzqSRo8Y65bhN5zsWwllFDZK/exec';

// Authentication Manager
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.checkAuth();
    }

    // Check if user is authenticated
    checkAuth() {
        const userData = localStorage.getItem('currentUser');
        const rememberMe = localStorage.getItem('rememberMe');
        
        if (userData) {
            this.currentUser = JSON.parse(userData);
            
            // If on login page and authenticated, redirect to dashboard
            if (window.location.pathname.includes('index.html') || 
                window.location.pathname === '/' ||
                window.location.pathname === '') {
                window.location.href = 'dashboard.html';
            }
            
            // If on dashboard, load user data
            if (window.location.pathname.includes('dashboard.html')) {
                this.loadUserDashboard();
            }
        } else {
            // If not authenticated and not on login page, redirect to login
            if (window.location.pathname.includes('dashboard.html')) {
                window.location.href = 'index.html';
            }
        }
    }

    // Login
    async login(username, password, rememberMe = false) {
        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'login',
                    username: username,
                    password: password
                }),
                headers: { 'Content-Type': 'application/json' }
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.currentUser = result.user;
                localStorage.setItem('currentUser', JSON.stringify(result.user));
                
                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                }
                
                window.location.href = 'dashboard.html';
                return { success: true };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            return { success: false, message: 'Connection error. Please try again.' };
        }
    }

    // Register
    async register(username, email, password) {
        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'register',
                    username: username,
                    email: email,
                    password: password
                }),
                headers: { 'Content-Type': 'application/json' }
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Auto login after registration
                return await this.login(username, password);
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            return { success: false, message: 'Connection error. Please try again.' };
        }
    }

    // Logout
    logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberMe');
        this.currentUser = null;
        window.location.href = 'index.html';
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Update profile
    async updateProfile(profileData) {
        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'updateProfile',
                    userId: this.currentUser.id,
                    ...profileData
                }),
                headers: { 'Content-Type': 'application/json' }
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Update local user data
                Object.assign(this.currentUser, profileData);
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                return { success: true };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            return { success: false, message: 'Connection error.' };
        }
    }

    // Load user dashboard
    loadUserDashboard() {
        if (!this.currentUser) return;
        
        // Display user info
        const displayName = this.currentUser.displayName || this.currentUser.username;
        document.getElementById('displayUsername').textContent = displayName;
        document.getElementById('displayEmail').textContent = this.currentUser.email;
        document.getElementById('greetingName').textContent = displayName;
        
        // Set avatar
        const avatar = this.currentUser.avatar || displayName.charAt(0).toUpperCase();
        document.getElementById('userAvatar').textContent = avatar;
        document.getElementById('profileAvatar').textContent = avatar;
        document.getElementById('profileUsername').textContent = displayName;
        document.getElementById('profileEmail').textContent = this.currentUser.email;
        
        // Load profile data
        document.getElementById('profileDisplayName').value = this.currentUser.displayName || '';
        document.getElementById('profileNewEmail').value = this.currentUser.email || '';
        document.getElementById('profileGoal').value = this.currentUser.dailyGoal || '';
        
        // Set member since
        if (this.currentUser.createdAt) {
            document.getElementById('profileMemberSince').textContent = 
                new Date(this.currentUser.createdAt).toLocaleDateString();
        }
    }
}

// Initialize Auth Manager
const auth = new AuthManager();

// Event Listeners for Login/Register Page
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        const result = await auth.login(username, password, rememberMe);
        
        if (!result.success) {
            document.getElementById('loginError').textContent = result.message;
            document.getElementById('loginError').style.display = 'block';
        }
    });
    
    document.getElementById('registerForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        
        // Validation
        if (password !== confirmPassword) {
            document.getElementById('registerError').textContent = 'Passwords do not match!';
            document.getElementById('registerError').style.display = 'block';
            return;
        }
        
        if (password.length < 6) {
            document.getElementById('registerError').textContent = 'Password must be at least 6 characters!';
            document.getElementById('registerError').style.display = 'block';
            return;
        }
        
        const result = await auth.register(username, email, password);
        
        if (!result.success) {
            document.getElementById('registerError').textContent = result.message;
            document.getElementById('registerError').style.display = 'block';
        }
    });
}

// Toggle between login and register forms
function showRegister() {
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('registerForm').classList.add('active');
    document.getElementById('loginError').style.display = 'none';
    document.getElementById('registerError').style.display = 'none';
}

function showLogin() {
    document.getElementById('registerForm').classList.remove('active');
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('loginError').style.display = 'none';
    document.getElementById('registerError').style.display = 'none';
}

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Logout function (global)
function logout() {
    auth.logout();
}

// Update profile function (global)
async function updateProfile() {
    const profileData = {
        displayName: document.getElementById('profileDisplayName').value,
        email: document.getElementById('profileNewEmail').value,
        dailyGoal: document.getElementById('profileGoal').value
    };
    
    const newPassword = document.getElementById('profileNewPassword').value;
    if (newPassword) {
        profileData.password = newPassword;
    }
    
    const result = await auth.updateProfile(profileData);
    
    if (result.success) {
        alert('Profile updated successfully!');
        auth.loadUserDashboard();
    } else {
        alert('Error: ' + result.message);
    }
}

// Change avatar (simple implementation)
function changeAvatar() {
    const avatars = ['😊', '😎', '🤗', '😇', '🥳', '😄', '🤓', '😌', '🙂', '💪'];
    const currentAvatar = auth.getCurrentUser().avatar;
    
    const avatarGrid = avatars.map(emoji => 
        `<span class="avatar-option ${emoji === currentAvatar ? 'selected' : ''}" 
              onclick="selectAvatar('${emoji}')">${emoji}</span>`
    ).join('');
    
    const modal = document.createElement('div');
    modal.className = 'avatar-modal';
    modal.innerHTML = `
        <div class="avatar-modal-content">
            <h3>Choose Avatar</h3>
            <div class="avatar-grid">${avatarGrid}</div>
            <button onclick="closeAvatarModal()" class="btn btn-secondary">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function selectAvatar(emoji) {
    auth.getCurrentUser().avatar = emoji;
    localStorage.setItem('currentUser', JSON.stringify(auth.getCurrentUser()));
    auth.loadUserDashboard();
    closeAvatarModal();
}

function closeAvatarModal() {
    const modal = document.querySelector('.avatar-modal');
    if (modal) modal.remove();
}