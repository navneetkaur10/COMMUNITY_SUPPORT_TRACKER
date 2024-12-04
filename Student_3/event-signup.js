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
        return; // Stop the function if email format is invalid
    }

    // If all validations pass, log the form data to the console (for now)
    console.log('Form Data:', formData);

    // Additional actions can be taken here, such as submitting the data to a server
});
