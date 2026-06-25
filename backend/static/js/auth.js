// ─── Auth Configuration ───────────────────────────────────────────────────────
const AUTH_TOKEN_KEY = "smart_finance_token";
//const API_BASE       = "http://127.0.0.1:5000";

// TODO: Replace with real Auth0 domain when going live
// const AUTH_DOMAIN = "https://YOUR_TENANT.auth0.com";

// ─── Auth Object ──────────────────────────────────────────────────────────────
const Auth = {

    /**
     * Login — sends credentials to Flask /auth/login
     * On success, saves the JWT token and redirects to dashboard
     */
    login: async (token) => {
        // Validate token exists before hitting the server
        if (!token || !token.trim()) {
            Auth._showError("Token is required to login.");
            return;
        }

        Auth._setLoading(true);

        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: token.trim() })
            });

            const data = await response.json();

            if (response.ok) {
                // Save real token from server response
                localStorage.setItem(AUTH_TOKEN_KEY, token.trim());
                window.location.href = "dashboard.html";
            } else {
                Auth._showError(data.error || "Login failed. Please try again.");
            }

        } catch (err) {
            console.error("[Auth] Login error:", err);
            Auth._showError("Could not reach the server. Check your connection.");
        } finally {
            Auth._setLoading(false);
        }
    },

    /**
     * Logout — clears token locally and calls server logout endpoint
     */
    logout: async () => {
        const token = Auth.getToken();

        if (token) {
            try {
                await fetch(`${API_BASE}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
            } catch (err) {
                console.warn("[Auth] Logout request failed:", err);
                // Continue with local cleanup regardless
            }
        }

        localStorage.removeItem(AUTH_TOKEN_KEY);
        window.location.href = "index.html";
    },

    /**
     * Check if user is authenticated — call this at the top of dashboard.js
     * Redirects to login if no token found
     */
    checkAuth: () => {
        const token = Auth.getToken();
        if (!token) {
            console.warn("[Auth] No token found. Redirecting to login...");
            window.location.href = "index.html";
            return false;
        }
        return token;
    },

    /**
     * Get the stored token for API request headers
     */
    getToken: () => localStorage.getItem(AUTH_TOKEN_KEY) || "",

    /**
     * Build Authorization headers for API calls
     */
    getHeaders: () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Auth.getToken()}`
    }),

    // ─── Internal Helpers ─────────────────────────────────────────────────────

    _showError: (message) => {
        const el = document.getElementById('auth-error');
        if (el) {
            el.textContent = message;
            el.style.display = 'block';
        } else {
            console.error("[Auth]", message);
        }
    },

    _setLoading: (isLoading) => {
        const btn = document.getElementById('login-btn');
        if (!btn) return;
        btn.disabled = isLoading;
        btn.textContent = isLoading ? "Logging in..." : "Login";
    }
};

// Make Auth globally available
window.Auth = Auth;

// ─── Login Form Handler ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const tokenInput = document.getElementById('auth-token');
        if (!tokenInput) return;

        const token = tokenInput.value.trim();
        if (!token) {
            Auth._showError("Please enter your Auth0 token.");
            return;
        }

        await Auth.login(token);
    });
});