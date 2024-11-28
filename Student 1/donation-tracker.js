document.getElementById('donation-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Collect form data
    let charityName = document.getElementById('charity-name').value;
    let donationAmount = parseFloat(document.getElementById('donation-amount').value);
    let donationDate = document.getElementById('donation-date').value;
    let donorComment = document.getElementById('donor-comment').value;

    // Input validation
    if (!charityName || !donationDate || isNaN(donationAmount) || donationAmount <= 0) {
        alert("Please fill out all required fields correctly. Ensure that the donation amount is a valid number greater than 0.");
        return;
    }

    // Create temporary data object to store the form data
    const donationData = {
        charityName: charityName,
        donationAmount: donationAmount,
        donationDate: donationDate,
        donorComment: donorComment
    };

    // Log the donation data (for now, we just log it to the console)
    console.log(donationData);

    // Attach the data to the window object for testing purposes
    window.donationData = donationData;

    // Clear the form after submission
    document.getElementById('donation-form').reset();

    // Display success alert
    alert("Donation successfully submitted!");
});
