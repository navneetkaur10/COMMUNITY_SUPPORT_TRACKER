// Add an event listener to the form for the 'submit' event
document.getElementById('event-signup-form').addEventListener('submit', function (e) {
    // Prevent the form from submitting immediately (default behavior)
    e.preventDefault();

    // Get the values entered in the form fields
    const eventName = document.getElementById('event-name').value;
    const representativeName = document.getElementById('representative-name').value;
    const representativeEmail = document.getElementById('representative-email').value;
    const role = document.getElementById('role').value;

    // temporary object to store the form data
    const formData = {
        eventName,
        representativeName,
        representativeEmail,
        role
    };

    // Input validation to ensure all required fields are filled
    if (!eventName || !representativeName || !representativeEmail || !role) {
        // Alert the user if any required field is missing
        alert("Please fill in all required fields.");
        return; // Stop the function if validation fails
    }

    // Validate the email format using a regular expression pattern
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(representativeEmail)) {
        // Alert the user if the email format is invalid
        alert("Please enter a valid email address.");
        return; 
    }

    // If all validations pass, log the form data to the console (for now)
    const signups = JSON.parse(localStorage.getItem('signups')) || [];
    signups.push(formData);
    localStorage.setItem('signups', JSON.stringify(signups));

    // Reload the table to display the new signup
    loadSignups();
});

// Function to load signups from localStorage and display them in the table
function loadSignups() {
    // Get the signups from localStorage or an empty array if nothing is saved
    const signups = JSON.parse(localStorage.getItem('signups')) || [];

    // Select the table body where the signups will be displayed
    const tableBody = document.querySelector('#signup-table tbody');

    // Clear any previous table rows
    tableBody.innerHTML = '';

    // Loop through each signup and create a table row for it
    signups.forEach((signup, index) => {
        // Create a new row
        const row = document.createElement('tr');

        // Add the signup data to the row
        row.innerHTML = `
            <td>${signup.eventName}</td>
            <td>${signup.repName}</td>
            <td>${signup.repEmail}</td>
            <td>${signup.role}</td>
            <td><button class="delete-btn" data-index="${index}">Delete</button></td>
        `;

        // Add the row to the table body
        tableBody.appendChild(row);
    });
}

// Handle the deletion of a signup
document.querySelector('#signup-table').addEventListener('click', function (e) {
    if (e.target && e.target.classList.contains('delete-btn')) {
        const index = e.target.getAttribute('data-index');
        deleteSignup(index);
    }
});

function deleteSignup(index) {
    // Get signups from localStorage
    const signups = JSON.parse(localStorage.getItem('signups')) || [];
    
    // Remove the signup at the specified index
    signups.splice(index, 1);
    
    // Save the updated signups back to localStorage
    localStorage.setItem('signups', JSON.stringify(signups));
    
    // Reload the table
    loadSignups();
}