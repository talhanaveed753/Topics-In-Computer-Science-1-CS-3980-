document.addEventListener('DOMContentLoaded', () => {
    getExpenses(); // Load the expenses when the DOM is fully loaded.
});

const api = 'http://127.0.0.1:8000/expenses';
const form = document.getElementById('expenseForm');
const expensesTable = document.getElementById('expensesTable').getElementsByTagName('tbody')[0];
let data = []; // Make sure this is accessible where needed

form.addEventListener('submit', function (event) {
    event.preventDefault();
    const expense = {
        date: form.date.value, // ISO format is okay for backend
        category: form.category.value,
        amount: parseFloat(form.amount.value),
        description: form.description.value
    };
    
    addExpense(expense);
});

function addExpense(expense) {
    fetch(api, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(expense),
    })
    .then(response => response.json())
    .then(newExpense => {
        console.log('Success:', newExpense);
        form.reset();
        getExpenses(); // Refresh the list
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function getExpenses() {
    fetch(api)
    .then(response => response.json())
    .then(fetchedData => {
        data = fetchedData; // Update the global data array
        refreshExpenses(data); // Pass the data to the refresh function
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function refreshExpenses(data) {
    expensesTable.innerHTML = '';
    data.forEach(expense => {
        const row = expensesTable.insertRow();
        row.setAttribute('id', `expense-${expense.id}`);
        row.innerHTML = `
            <td>${formatDateFromISO(expense.date)}</td>
            <td>${expense.category}</td>
            <td>$${parseFloat(expense.amount).toFixed(2)}</td>
            <td>${expense.description}</td>
            <td>
                <button class="edit-button" onclick="editExpense(${expense.id})">Edit</button>
                <button class="delete-button" onclick="deleteExpense(${expense.id})">Delete</button>
            </td>
        `;
    });
}

function deleteExpense(id) {
    fetch(`${api}/${id}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (response.ok) {
            getExpenses(); // Refresh the list after deletion
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function editExpense(id) {
    console.log('Editing expense with ID:', id);
    const expense = data.find(x => x.id === id);
    const expenseRow = document.querySelector(`#expense-${id}`);
    const cells = expenseRow.querySelectorAll('td');

    cells[0].innerHTML = `<input type="date" value="${expense.date}" id="edit-date-${id}">`;
    cells[1].innerHTML = `<input type="text" value="${expense.category}" id="edit-category-${id}">`;
    cells[2].innerHTML = `<input type="number" value="${expense.amount}" id="edit-amount-${id}" step="0.01">`;
    cells[3].innerHTML = `<input type="text" value="${expense.description}" id="edit-description-${id}">`;
    cells[4].innerHTML = `
        <button class="save-button" onclick="saveExpense(${id})">Save</button>
        <button class="cancel-button" onclick="getExpenses()">Cancel</button>
    `;
}

function saveExpense(id) {
    const updatedExpense = {
        date: document.getElementById(`edit-date-${id}`).value,
        category: document.getElementById(`edit-category-${id}`).value,
        amount: parseFloat(document.getElementById(`edit-amount-${id}`).value),
        description: document.getElementById(`edit-description-${id}`).value,
    };

    fetch(`${api}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedExpense),
    })
    .then(response => {
        if (response.ok) {
            getExpenses(); // Refresh the list after saving
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function formatDateFromISO(isoString) {
    if (!isoString) return '';
    const [year, month, day] = isoString.split('-');
    return `${month}/${day}/${year}`; // MM/DD/YYYY format
}
