/**
 * Authentication JavaScript
 * Handles login, signup, and token management
 */

const API_BASE = 'http://localhost:8000';

// Helper function to show error messages
function showError(elementId, message) {
    const errorEl = document.getElementById(elementId);
    errorEl.textContent = message;
    errorEl.classList.remove('d-none');
}

// Helper function to hide error messages
function hideError(elementId) {
    const errorEl = document.getElementById(elementId);
    errorEl.classList.add('d-none');
}

// Helper function to show loading spinner
function showLoading(textId, spinnerId) {
    document.getElementById(textId).classList.add('d-none');
    document.getElementById(spinnerId).classList.remove('d-none');
}

// Helper function to hide loading spinner
function hideLoading(textId, spinnerId) {
    document.getElementById(textId).classList.remove('d-none');
    document.getElementById(spinnerId).classList.add('d-none');
}

// Save token to localStorage
function saveToken(token) {
    localStorage.setItem('access_token', token);
}

// Get token from localStorage
function getToken() {
    return localStorage.getItem('access_token');
}

// Remove token from localStorage
function removeToken() {
    localStorage.removeItem('access_token');
}

// Check if user is authenticated
function isAuthenticated() {
    return getToken() !== null;
}

// Handle Login Form
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError('errorMessage');

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        showLoading('loginText', 'loginSpinner');

        try {
            // FastAPI OAuth2 expects form data with 'username' and 'password' fields
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const response = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                // Save token
                saveToken(data.access_token);

                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                showError('errorMessage', data.detail || 'Login failed');
            }
        } catch (error) {
            showError('errorMessage', 'Network error. Please try again.');
        } finally {
            hideLoading('loginText', 'loginSpinner');
        }
    });
}

// Handle Signup Form
if (document.getElementById('signupForm')) {
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError('errorMessage');

        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        showLoading('signupText', 'signupSpinner');

        try {
            const response = await fetch(`${API_BASE}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    full_name: fullName,
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Show success message
                const successEl = document.getElementById('successMessage');
                successEl.textContent = 'Account created! Redirecting to login...';
                successEl.classList.remove('d-none');

                // Redirect to login after 2 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                showError('errorMessage', data.detail || 'Signup failed');
            }
        } catch (error) {
            showError('errorMessage', 'Network error. Please try again.');
        } finally {
            hideLoading('signupText', 'signupSpinner');
        }
    });
}

// Logout function
function logout() {
    removeToken();
    window.location.href = 'login.html';
}

// Check authentication on protected pages
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
    }
}

// Get current user info
async function getCurrentUser() {
    const token = getToken();

    if (!token) {
        return null;
    }

    try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            return await response.json();
        } else {
            // Token invalid, logout
            removeToken();
            return null;
        }
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}
