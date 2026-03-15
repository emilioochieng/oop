// Expense Model
class Expense {
  constructor(description, amount, category) {
    this.id = Date.now() + Math.random(); // simple unique id
    this.description = description;
    this.amount = Number(amount);
    this.category = category;
    this.date = new Date().toLocaleDateString();
  }
}

// Expense Tracker Manager
class ExpenseTracker {
  constructor() {
    this.expenses = this.loadFromStorage();
  }

  loadFromStorage() {
    const data = localStorage.getItem('expenses');
    return data ? JSON.parse(data) : [];
  }

  saveToStorage() {
    localStorage.setItem('expenses', JSON.stringify(this.expenses));
  }

  addExpense({ description, amount, category }) { // destructuring
    const expense = new Expense(description, amount, category);
    this.expenses = [...this.expenses, expense]; // spread
    this.saveToStorage();
    return expense;
  }

  removeExpense(id) {
    this.expenses = this.expenses.filter(exp => exp.id !== id);
    this.saveToStorage();
  }

  getTotal() {
    return this.expenses.reduce((sum, { amount }) => sum + amount, 0); 
  }

  getFilteredExpenses(category = 'all') {
    if (category === 'all') return [...this.expenses]; // spread → new copy
    return this.expenses.filter(exp => exp.category === category);
  }

  // Example of rest operator 
  addMultipleExpenses(...newExpenses) {
    const mapped = newExpenses.map(data => new Expense(data.description, data.amount, data.category));
    this.expenses = [...this.expenses, ...mapped];
    this.saveToStorage()}
// DOM Elements & Logic
const tracker = new ExpenseTracker();

const form         = document.getElementById('expenseForm');
const descInput    = document.getElementById('description');
const amountInput  = document.getElementById('amount');
const catSelect    = document.getElementById('category');
const filterSelect = document.getElementById('filter');
const list         = document.getElementById('expenseList');
const totalEl      = document.getElementById('total');
const message      = document.getElementById('message');

function showMessage(text, isError = false) {
  message.textContent = text;
  message.className = `px-4 py-3 rounded-lg text-center font-medium ${
    isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
  }`;
  message.classList.remove('hidden');
  setTimeout(() => message.classList.add('hidden'), 2800);
}

function renderExpenses(expensesToShow = tracker.getFilteredExpenses(filterSelect.value)) {
  list.innerHTML = '';

  if (expensesToShow.length === 0) {
    list.innerHTML = `<li class="px-6 py-10 text-center text-gray-500">No expenses added yet — start tracking!</li>`;
    return;
  }

  expensesToShow.forEach(exp => {
    const { id, description, amount, category, date } = exp; // destructuring

    const li = document.createElement('li');
    li.className = 'px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition';
    li.innerHTML = `
      <div>
        <p class="font-medium text-gray-900">${description}</p>
        <p class="text-sm text-gray-600">${category} • ${date}</p>
      </div>
      <div class="flex items-center gap-6">
        <span class="font-semibold text-red-600">$${amount.toFixed(2)}</span>
        <button data-id="${id}"
                class="text-red-500 hover:text-red-700 font-medium transition">
          Delete
        </button>
      </div>
    `;
    list.appendChild(li);
  });
}

function updateTotal() {
  totalEl.textContent = `$${tracker.getTotal().toFixed(2)}`;
}

// Add expense
form.addEventListener('submit', e => {
  e.preventDefault();

  const description = descInput.value.trim();
  const amount = amountInput.value.trim();
  const category = catSelect.value;

  if (!description || !amount || Number(amount) <= 0) {
    showMessage('Please fill all fields correctly', true);
    return;
  }

  tracker.addExpense({ description, amount, category });
  renderExpenses();
  updateTotal();
  form.reset();
  descInput.focus();
  showMessage('Expense added!');
});

// Delete expense
list.addEventListener('click', e => {
  if (e.target.tagName === 'BUTTON' && e.target.textContent.includes('Delete')) {
    const id = Number(e.target.dataset.id);
    tracker.removeExpense(id);
    renderExpenses();
    updateTotal();
    showMessage('Expense removed');
  }
});

// Filter change
filterSelect.addEventListener('change', () => {
  renderExpenses();
});

// Initial render
renderExpenses();
updateTotal();