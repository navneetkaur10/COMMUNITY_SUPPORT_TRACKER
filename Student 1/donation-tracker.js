document.getElementById('donationForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form submission
    
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

    console.log("Donation Data:", donationData); // For testing purposes, can remove in production
    alert("Donation submitted successfully!");
});
