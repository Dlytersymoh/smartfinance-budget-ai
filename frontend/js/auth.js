// --- AUTH CONFIG ---
const AUTH_TOKEN_KEY = "smart_finance_token";
const MOCK_VALID_TOKEN = "Bearer mock-token"; // Must match your Flask middleware
const AUTH_DOMAIN="https://127.0.0.1:5000"; 
const Auth = {
    // 1. Simulate Login
    login: (username, password) => {
        // In a real app, you'd fetch /auth/login from Flask
        console.log("Logging in as:", username);
        
        // Save the mock token to the browser
        localStorage.setItem(AUTH_TOKEN_KEY, MOCK_VALID_TOKEN);
        
        // Redirect to dashboard
        window.location.href = "dashboard.html";
    },

    // 2. Logout
    logout: () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        window.location.href = "index.html";
    },

    // 3. Check if user is logged in (used on dashboard)
    checkAuth: () => {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (!token || token !== MOCK_VALID_TOKEN) {
            console.warn("Unauthorized access! Redirecting to login...");
            window.location.href = "index.html";
            return false;
        }
        return token;
    },

    // 4. Get the token for API headers
    getToken: () => localStorage.getItem(AUTH_TOKEN_KEY)
};

// Export for use in other files
window.Auth = Auth;