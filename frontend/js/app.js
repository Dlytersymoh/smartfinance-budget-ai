console.log("app.js is working")
// 1. Configuration
const API_BASE = "http://127.0.0.1:5000";
const MOCK_TOKEN = "Bearer mock-token";
const AUTH_DOMAIN="https://127.0.0.1:5000"; 

// 2. Load/Show Expenses (GET)
async function loadExpenses() {
    try {
        const response = await fetch(`${API_BASE}/budget/summary`, {
            headers: { 'Authorization': MOCK_TOKEN }
        });
        const data = await response.json();
        
        const list = document.getElementById('expense-list');
        const totalDisplay = document.getElementById('total-spent');
        
        let total = 0;

        if (!data || data.length === 0) {
            list.innerHTML = `<p class="text-gray-500 italic text-center">No transactions yet. Add one above!</p>`;
            totalDisplay.innerText = `$0.00`;
            return;
        }

        // Generate HTML and calculate total at the same time
        list.innerHTML = data.map(ex => {
            total += parseFloat(ex.amount);
            return `
                <div class="flex justify-between items-center p-3 bg-gray-700 rounded-lg border-l-4 border-green-500 group">
                    <div>
                        <span class="block text-xs text-gray-400 uppercase tracking-widest">${ex.category}</span>
                        <span class="font-bold text-white text-lg">$${parseFloat(ex.amount).toFixed(2)}</span>
                    </div>
                    <button onclick="deleteExpense(${ex.id})" class="text-gray-500 hover:text-red-500 transition-colors p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            `;
        }).join('');

        // Update the big total card at the top
        totalDisplay.innerText = `$${total.toLocaleString(undefined, {minimumFractionDigits: 2})}`;

    } catch (err) {
        console.error("Failed to load budget:", err);
        document.getElementById('expense-list').innerHTML = `<p class="text-red-400 text-center">Backend unreachable. Check terminal!</p>`;
    }
}

// 3. Save New Expense (POST)
async function addExpense() {
    const categoryInput = document.getElementById('ex-category');
    const amountInput = document.getElementById('ex-amount');
    
    const category = categoryInput.value;
    const amount = amountInput.value;

    if (!category || !amount) {
        alert("Please enter both a category and an amount!");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/budget/add`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': MOCK_TOKEN 
            },
            body: JSON.stringify({ category, amount })
        });

        if (response.ok) {
            categoryInput.value = '';
            amountInput.value = '';
            await loadExpenses(); // Refresh the list and total
        }
    } catch (err) {
        console.error("Error adding expense:", err);
    }
}

// 4. Delete Expense (DELETE)
async function deleteExpense(id) {
    if (!confirm("Delete this transaction?")) return;

    try {
        const response = await fetch(`${API_BASE}/budget/delete/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': MOCK_TOKEN }
        });

        if (response.ok) {
            await loadExpenses();
        }
    } catch (err) {
        console.error("Delete failed:", err);
    }
}

// 5. Talk to AI Agent (POST)
async function askAI() {
    const input = document.getElementById('chat-input');
    const window = document.getElementById('chat-window');
    const message = input.value;
    
    if (!message) return;

    // Show User Message
    window.innerHTML += `
        <div class="flex justify-end">
            <div class="bg-blue-600 text-white p-2 rounded-lg max-w-[80%] shadow">
                ${message}
            </div>
        </div>
    `;
    input.value = "";
    window.scrollTop = window.scrollHeight;

    try {
        const response = await fetch(`${API_BASE}/agent/chat`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': MOCK_TOKEN 
            },
            body: JSON.stringify({ message: message })
        });
        const data = await response.json();
        
        // Show AI Response
        window.innerHTML += `
            <div class="flex justify-start">
                <div class="bg-gray-700 text-green-300 p-2 rounded-lg max-w-[80%] border border-gray-600 shadow">
                    <b>AI:</b> ${data.reply}
                </div>
            </div>
        `;
        window.scrollTop = window.scrollHeight;
    } catch (err) {
        window.innerHTML += `<div class="text-red-400 text-xs italic text-center">AI connection failed...</div>`;
    }
}

// Initial Load
loadExpenses();