// ─── Configuration ────────────────────────────────────────────────────────────
const API_BASE = "http://127.0.0.1:5000";

// ─── Sanitize user input before injecting into DOM (prevent XSS) ─────────────
function sanitize(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str ?? '')));
    return div.innerHTML;
}

// ─── Show inline feedback messages ────────────────────────────────────────────
function showFeedback(elementId, message, isError = false) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = message;
    el.style.display = 'block';
    el.className = isError
        ? 'text-red-400 text-sm mt-2'
        : 'text-green-400 text-sm mt-2';
    setTimeout(() => { el.style.display = 'none'; }, 4000);
}

// ─── API Helper ───────────────────────────────────────────────────────────────
async function apiRequest(endpoint, options = {}) {
    const token = typeof Auth !== 'undefined' ? Auth.getToken() : '';

    const defaultHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    const mergedOptions = {
        ...options,
        headers: { ...defaultHeaders, ...(options.headers || {}) },
    };

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, mergedOptions);

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error(`[dashboard] API Error (${endpoint}):`, error.message);
        showStatus(false);
        return null;
    }
}

// ─── Load Dashboard Data ──────────────────────────────────────────────────────
async function loadDashboardData() {
    const data = await apiRequest('/budget/summary');

    if (!data) {
        const list = document.getElementById('expense-list');
        if (list) {
            list.innerHTML = '<p class="text-red-400 italic text-sm text-center py-10">Backend unreachable. Check your terminal!</p>';
        }
        const incomeList = document.getElementById('income-list');
        if (incomeList) {
            incomeList.innerHTML = '<p class="text-red-400 italic text-sm text-center py-10">Backend unreachable.</p>';
        }
        return;
    }

    // Update all 3 summary cards
    const totalSpentEl = document.getElementById('total-spent');
    if (totalSpentEl) totalSpentEl.innerText = `$${parseFloat(data.total_expenses || 0).toFixed(2)}`;

    const totalIncomeEl = document.getElementById('total-income');
    if (totalIncomeEl) totalIncomeEl.innerText = `$${parseFloat(data.total_income || 0).toFixed(2)}`;

    const remainingEl = document.getElementById('remaining-balance');
    if (remainingEl) remainingEl.innerText = `$${parseFloat(data.remaining_balance || 0).toFixed(2)}`;

    renderExpenseBreakdown(data.expense_breakdown || []);
    renderIncomeBreakdown(data.income_breakdown || []);

    showStatus(true);
}

// ─── Add Expense ──────────────────────────────────────────────────────────────
async function addExpense() {
    const categoryInput    = document.getElementById('ex-category');
    const amountInput      = document.getElementById('ex-amount');
    const descriptionInput = document.getElementById('ex-description');
    const addBtn           = document.getElementById('add-btn');

    const category    = categoryInput?.value.trim();
    const amount      = amountInput?.value.trim();
    const description = descriptionInput?.value.trim() || '';

    // Client-side validation
    if (!category) {
        showFeedback('expense-feedback', 'Category is required.', true);
        categoryInput?.focus();
        return;
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        showFeedback('expense-feedback', 'Enter a valid positive amount.', true);
        amountInput?.focus();
        return;
    }

    // Disable button during request
    if (addBtn) { addBtn.disabled = true; addBtn.textContent = 'Adding...'; }

    try {
        const response = await fetch(`${API_BASE}/budget/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${typeof Auth !== 'undefined' ? Auth.getToken() : ''}`,
            },
            body: JSON.stringify({
                category,
                amount: parseFloat(amount),
                description,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            // Clear inputs
            if (categoryInput)    categoryInput.value    = '';
            if (amountInput)      amountInput.value      = '';
            if (descriptionInput) descriptionInput.value = '';

            showFeedback('expense-feedback', '✓ Expense added successfully!');
            await loadDashboardData(); // Refresh all cards and lists
        } else {
            showFeedback('expense-feedback', data.error || 'Failed to add expense.', true);
        }

    } catch (err) {
        console.error('[addExpense] Error:', err);
        showFeedback('expense-feedback', 'Could not reach the server.', true);
    } finally {
        // Re-enable button regardless of outcome
        if (addBtn) {
            addBtn.disabled    = false;
            addBtn.innerHTML   = 'Add Expense <i class="fa-solid fa-arrow-right text-xs"></i>';
        }
    }
}

// ─── Render Expense Breakdown ─────────────────────────────────────────────────
function renderExpenseBreakdown(breakdown) {
    const list = document.getElementById('expense-list');
    if (!list) return;

    list.innerHTML = '';

    if (breakdown.length === 0) {
        list.innerHTML = '<p class="text-slate-500 italic text-center py-20">No transactions yet. Add one above!</p>';
        return;
    }

    breakdown.forEach(item => {
        const div = document.createElement('div');
        div.className = "flex justify-between items-center p-4 bg-slate-900/40 border border-slate-700/50 rounded-xl mb-3 hover:border-blue-500/30 transition";
        div.innerHTML = `
            <div>
                <p class="font-bold text-slate-200">${sanitize(item.category)}</p>
                <p class="text-[10px] uppercase tracking-wider text-slate-500">Category Total</p>
            </div>
            <span class="text-red-400 font-mono font-bold text-lg">-$${parseFloat(item.total).toFixed(2)}</span>
        `;
        list.appendChild(div);
    });
}

// ─── Render Income Breakdown ──────────────────────────────────────────────────
function renderIncomeBreakdown(breakdown) {
    const list = document.getElementById('income-list');
    if (!list) return;

    list.innerHTML = '';

    if (breakdown.length === 0) {
        list.innerHTML = '<p class="text-slate-500 italic text-center py-10">No income records yet.</p>';
        return;
    }

    breakdown.forEach(item => {
        const div = document.createElement('div');
        div.className = "flex justify-between items-center p-4 bg-slate-900/40 border border-slate-700/50 rounded-xl mb-3 hover:border-green-500/30 transition";
        div.innerHTML = `
            <div>
                <p class="font-bold text-slate-200">${sanitize(item.source)}</p>
                <p class="text-[10px] uppercase tracking-wider text-slate-500">Income Source</p>
            </div>
            <span class="text-green-400 font-mono font-bold text-lg">+$${parseFloat(item.total).toFixed(2)}</span>
        `;
        list.appendChild(div);
    });
}

// ─── AI Agent Chat ────────────────────────────────────────────────────────────
async function askAI() {
    const chatInput     = document.getElementById('chat-input');
    const chatContainer = document.getElementById('chat-window');
    if (!chatInput || !chatContainer) return;

    const message = chatInput.value.trim();
    if (!message) return;

    appendMessage('user', message);
    chatInput.value = '';

    const loadingId = appendMessage('ai', 'Thinking...');

    const data = await apiRequest('/agent/chat', {
        method: 'POST',
        body: JSON.stringify({ message }),
    });

    const loadingEl = document.getElementById(loadingId);
    if (!loadingEl) return;

    if (data && data.reply) {
        loadingEl.textContent = data.reply;
    } else {
        loadingEl.textContent = "AI quota exceeded. Please try again in a few minutes.";
        loadingEl.classList.add('text-red-400');
    }
}

// ─── Append Chat Message ──────────────────────────────────────────────────────
function appendMessage(sender, text) {
    const chatContainer = document.getElementById('chat-window');
    if (!chatContainer) return null;

    const id     = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const msgDiv = document.createElement('div');

    msgDiv.className = sender === 'user'
        ? "bg-blue-600/10 border border-blue-500/20 p-4 rounded-2xl rounded-tr-none ml-12 text-slate-200 mb-4"
        : "bg-slate-700/30 border border-slate-700/50 p-4 rounded-2xl rounded-tl-none mr-12 text-slate-200 mb-4";

    const p       = document.createElement('p');
    p.id          = id;
    p.className   = "text-sm leading-relaxed";
    p.textContent = text;
    msgDiv.appendChild(p);

    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return id;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function showStatus(online) {
    const badge = document.getElementById('status');
    if (!badge) return;
    badge.innerText = online ? 'Backend Online' : 'Backend Offline';
    badge.className = online
        ? "text-[10px] uppercase font-bold bg-green-900/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30"
        : "text-[10px] uppercase font-bold bg-red-900/20 text-red-400 px-3 py-1 rounded-full border border-red-500/30";
}

// ─── Initialize ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Auth shield — redirect to login if no token
    if (typeof Auth !== 'undefined') {
        const valid = Auth.checkAuth();
        if (!valid) return;
    }

    // Load all dashboard data
    loadDashboardData();

    // Enter key sends AI message — Shift+Enter allows newline
    const chatInput = document.getElementById('chat-input');
    chatInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            askAI();
        }
    });
});