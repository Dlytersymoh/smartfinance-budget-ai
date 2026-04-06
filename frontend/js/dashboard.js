// --- CONFIGURATION ---
const API_BASE = "http://127.0.0.1:5000";

// --- DOM ELEMENTS (Matched to your specific HTML IDs) ---
const elements = {
    balance: document.getElementById('total-spent'), // Updated ID
    expenseList: document.getElementById('expense-list'),
    chatInput: document.getElementById('chat-input'),
    chatContainer: document.getElementById('chat-window'), // Updated ID
    statusBadge: document.getElementById('status') // Updated ID
};

// --- AUTH SHIELD ---
// This runs as soon as the file loads
const token = Auth.checkAuth(); 

if (token) {
    console.log("🚀 Access Granted. Initializing Dashboard...");
}

// --- API HELPER ---
async function apiRequest(endpoint, options = {}) {
    const currentToken = Auth.getToken();

    const url = `${API_BASE}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Authorization': currentToken,
            'Content-Type': 'application/json'
        }
    };
    
    try {
        const response = await fetch(url, { ...defaultOptions, ...options });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`❌ API Error (${endpoint}):`, error);
        showStatus(false);
        return null;
    }
}

// --- CORE FUNCTIONS ---

// 1. Fetch and Display Budget Summary
async function loadDashboardData() {
    const data = await apiRequest('/budget/summary');
    if (data) {
        // Update the big number at the top
        elements.balance.innerText = `$${data.total_expenses.toFixed(2)}`;
        renderExpenses(data.recent_expenses);
        showStatus(true);
    } else {
        elements.expenseList.innerHTML = '<p class="text-red-400 italic">Backend unreachable. Check terminal!</p>';
    }
}

// 2. Render Expense List to UI
function renderExpenses(expenses) {
    elements.expenseList.innerHTML = ''; 
    if (!expenses || expenses.length === 0) {
        elements.expenseList.innerHTML = '<p class="text-gray-500 italic">No recent transactions found.</p>';
        return;
    }

    expenses.forEach(exp => {
        const item = document.createElement('div');
        item.className = "flex justify-between items-center p-3 bg-gray-900/50 border border-gray-700 rounded-lg mb-2";
        item.innerHTML = `
            <div>
                <p class="font-bold text-gray-200">${exp.description}</p>
                <p class="text-xs text-gray-500">${exp.category || 'General'}</p>
            </div>
            <span class="text-red-400 font-mono">-$${exp.amount.toFixed(2)}</span>
        `;
        elements.expenseList.appendChild(item);
    });
}

// 3. Send Message to AI Agent (Connected to your 'Send' button)
async function askAI() {
    const message = elements.chatInput.value.trim();
    if (!message) return;

    // Add user message to UI
    appendMessage('user', message);
    elements.chatInput.value = '';

    // Show "thinking" state
    const loadingId = appendMessage('ai', 'Thinking...');

    const data = await apiRequest('/agent/chat', {
        method: 'POST',
        body: JSON.stringify({ message: message })
    });

    // Replace "thinking" with real response
    const loadingEl = document.getElementById(loadingId);
    if (data && data.reply) {
        loadingEl.innerText = data.reply;
    } else {
        loadingEl.innerText = "Error: Backend unreachable. Is Flask running?";
        loadingEl.classList.add('text-red-400');
    }
}

// --- UTILS ---

function appendMessage(sender, text) {
    const id = `msg-${Date.now()}`;
    const msgDiv = document.createElement('div');
    
    // Style matches your gray-800 dashboard theme
    if (sender === 'user') {
        msgDiv.className = "bg-blue-600/20 border border-blue-500/30 p-3 rounded-lg ml-8 text-blue-100 mb-4";
    } else {
        msgDiv.className = "bg-gray-800 border border-gray-700 p-3 rounded-lg mr-8 text-gray-200 mb-4";
    }

    msgDiv.innerHTML = `<p id="${id}">${text}</p>`;
    elements.chatContainer.appendChild(msgDiv);
    elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight;
    return id;
}

function showStatus(online) {
    if (elements.statusBadge) {
        elements.statusBadge.innerText = online ? 'Backend Online' : 'Backend Offline';
        elements.statusBadge.className = online 
            ? "text-xs bg-green-900 text-green-300 px-3 py-1 rounded-full border border-green-700"
            : "text-xs bg-red-900 text-red-300 px-3 py-1 rounded-full border border-red-700";
    }
}

// --- INITIALIZE ---
document.addEventListener('DOMContentLoaded', () => {
    // Start fetching data only if we have a token
    if (Auth.getToken()) {
        loadDashboardData();
    }
}); 