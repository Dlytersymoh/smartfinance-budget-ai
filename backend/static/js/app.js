console.log("app.js loaded");

// ─── Configuration ────────────────────────────────────────────────────────────
const API_BASE    = "http://127.0.0.1:5000";
const AUTH_DOMAIN = "https://YOUR_TENANT.auth0.com"; // Replace with real Auth0 domain

// Token management — replace getToken() with real Auth0 SDK call when ready
function getToken() {
    // TODO: return real Auth0 access token e.g. await auth0Client.getTokenSilently()
    return localStorage.getItem("access_token") || "";
}

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
    };
}

// ─── Sanitize user input before injecting into DOM (prevent XSS) ─────────────
function sanitize(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str)));
    return div.innerHTML;
}

// ─── Show inline error/success messages ──────────────────────────────────────
function showFeedback(elementId, message, isError = false) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = message;
    el.className = isError
        ? 'text-red-400 text-sm mt-2'
        : 'text-green-400 text-sm mt-2';
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 4000);
}

// ─── Load Budget Summary (GET) ────────────────────────────────────────────────
async function loadExpenses() {
    const list         = document.getElementById('expense-list');
    const totalDisplay = document.getElementById('total-spent');

    try {
        const response = await fetch(`${API_BASE}/budget/summary`, {
            headers: authHeaders()
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();

        // Update summary cards
        if (totalDisplay) {
            totalDisplay.innerText = `$${(data.total_expenses || 0).toFixed(2)}`;
        }

        const balanceDisplay = document.getElementById('remaining-balance');
        if (balanceDisplay) {
            balanceDisplay.innerText = `$${(data.remaining_balance || 0).toFixed(2)}`;
        }

        const incomeDisplay = document.getElementById('total-income');
        if (incomeDisplay) {
            incomeDisplay.innerText = `$${(data.total_income || 0).toFixed(2)}`;
        }

        // Render expense breakdown list
        const breakdown = data.expense_breakdown || [];

        if (!list) return;

        if (breakdown.length === 0) {
            list.innerHTML = `<p class="text-gray-500 italic text-center">No transactions yet. Add one above!</p>`;
            return;
        }

        list.innerHTML = breakdown.map(ex => `
            <div class="flex justify-between items-center p-3 bg-gray-700 rounded-lg border-l-4 border-green-500 group">
                <div>
                    <span class="block text-xs text-gray-400 uppercase tracking-widest">
                        ${sanitize(ex.category)}
                    </span>
                    <span class="font-bold text-white text-lg">
                        $${parseFloat(ex.total).toFixed(2)}
                    </span>
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error("Failed to load budget:", err);
        if (list) {
            list.innerHTML = `<p class="text-red-400 text-center">Backend unreachable. Check terminal!</p>`;
        }
    }
}

// ─── Add New Expense (POST) ───────────────────────────────────────────────────
async function addExpense() {
    const categoryInput    = document.getElementById('ex-category');
    const amountInput      = document.getElementById('ex-amount');
    const descriptionInput = document.getElementById('ex-description');

    const category    = categoryInput?.value.trim();
    const amount      = amountInput?.value.trim();
    const description = descriptionInput?.value.trim() || '';

    if (!category || !amount) {
        showFeedback('expense-feedback', 'Please enter both a category and an amount.', true);
        return;
    }

    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        showFeedback('expense-feedback', 'Amount must be a positive number.', true);
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/budget/add`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ category, amount: parseFloat(amount), description })
        });

        const data = await response.json();

        if (response.ok) {
            if (categoryInput)    categoryInput.value    = '';
            if (amountInput)      amountInput.value      = '';
            if (descriptionInput) descriptionInput.value = '';
            showFeedback('expense-feedback', 'Expense added successfully!');
            await loadExpenses();
        } else {
            showFeedback('expense-feedback', data.error || 'Failed to add expense.', true);
        }

    } catch (err) {
        console.error("Error adding expense:", err);
        showFeedback('expense-feedback', 'Could not reach the server.', true);
    }
}

// ─── Talk to AI Agent (POST) ──────────────────────────────────────────────────
async function askAI() {
    const input     = document.getElementById('chat-input');
    const chatWindow = document.getElementById('chat-window'); // renamed from 'window'
    const message   = input?.value.trim();

    if (!message) return;

    // Show user message — sanitized
    chatWindow.innerHTML += `
        <div class="flex justify-end">
            <div class="bg-blue-600 text-white p-2 rounded-lg max-w-[80%] shadow">
                ${sanitize(message)}
            </div>
        </div>
    `;
    input.value = "";
    chatWindow.scrollTop = chatWindow.scrollHeight;

    // Show typing indicator
    const typingId = `typing-${Date.now()}`;
    chatWindow.innerHTML += `
        <div id="${typingId}" class="flex justify-start">
            <div class="bg-gray-700 text-gray-400 p-2 rounded-lg text-sm italic">
                AI is thinking...
            </div>
        </div>
    `;
    chatWindow.scrollTop = chatWindow.scrollHeight;

    try {
        const response = await fetch(`${API_BASE}/agent/chat`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ message })
        });

        const data = await response.json();

        // Remove typing indicator
        document.getElementById(typingId)?.remove();

        const replyText = data.reply || data.error || "No response received.";

        chatWindow.innerHTML += `
            <div class="flex justify-start">
                <div class="bg-gray-700 text-green-300 p-2 rounded-lg max-w-[80%] border border-gray-600 shadow">
                    <b>AI:</b> ${sanitize(replyText)}
                </div>
            </div>
        `;
        chatWindow.scrollTop = chatWindow.scrollHeight;

    } catch (err) {
        document.getElementById(typingId)?.remove();
        chatWindow.innerHTML += `
            <div class="text-red-400 text-xs italic text-center">
                AI connection failed. Check your server.
            </div>
        `;
        console.error("AI request failed:", err);
    }
}

// ─── Allow Enter key to send AI message ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                askAI();
            }
        });
    }

    // Initial load
    loadExpenses();
});