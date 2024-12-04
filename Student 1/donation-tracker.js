document.getElementById('donationForm').addEventListener('submit', function (event) {
    event.preventDefault(); 
    
    // Collect form data
    const charity = document.getElementById('charity').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('date').value;
    const message = document.getElementById('message').value;
    
    // Validation
    if (!charity || !amount || !date) {
        alert("Please fill in all required fields.");
        return;
    }

    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid donation amount.");
        return;
    }

    // Temporary data object to store donation info
    const donationData = {
        charity: charity,
        amount: amount,
        date: date,
        message: message
    };

    // Add donation to table and localStorage
    addDonationToTable(donationData);
    storeDonationInLocalStorage(donationData);

    // Reset form
    document.getElementById('donationForm').reset();
});

function addDonationToTable(donation) {
    const table = document.getElementById('donationTable').getElementsByTagName('tbody')[0];

    const row = table.insertRow();
    row.innerHTML = ` 
        <td>${donation.charity}</td>
        <td>${donation.amount}</td>
        <td>${donation.date}</td>
        <td>${donation.message}</td>
        <td><button onclick="deleteDonation(this)">Delete</button></td>
    `;

    updateTotalDonations();
}

function storeDonationInLocalStorage(donation) {
    let donations = JSON.parse(localStorage.getItem('donations')) || [];
    donations.push(donation);
    localStorage.setItem('donations', JSON.stringify(donations));
}

function loadDonationsFromLocalStorage() {
    let donations = JSON.parse(localStorage.getItem('donations')) || [];
    donations.forEach(donation => addDonationToTable(donation));
}

function updateTotalDonations() {
    const rows = document.querySelectorAll('#donationTable tbody tr');
    let totalAmount = 0;
    rows.forEach(row => {
        totalAmount += parseFloat(row.cells[1].textContent);
    });
    document.getElementById('totalAmount').textContent = totalAmount.toFixed(2); 
}

function deleteDonation(button) {
    const row = button.closest('tr');
    const amount = parseFloat(row.cells[1].textContent);
    const charity = row.cells[0].textContent; 

    // Remove from table
    row.remove();

    // Remove from localStorage
    let donations = JSON.parse(localStorage.getItem('donations')) || [];
    donations = donations.filter(donation => donation.charity !== charity || donation.amount !== amount);
    localStorage.setItem('donations', JSON.stringify(donations));

    // Update total donations
    updateTotalDonations();
}

// Load donations when the page is loaded
window.onload = loadDonationsFromLocalStorage;
