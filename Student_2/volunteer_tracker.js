document.getElementById('volunteer-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // // Gathering the form data.
    let charityName = document.getElementById('charity-name').value;
    let hoursVolunteered = parseFloat(document.getElementById('hours-volunteered').value);
    let volunteerDate = document.getElementById('volunteer-date').value;
    let experienceRating = parseInt(document.getElementById('experience-rating').value);

    //  Verify the input for accuracy
    if (!charityName || !volunteerDate || isNaN(hoursVolunteered) || isNaN(experienceRating) || experienceRating < 1 || experienceRating > 5) {
        alert("Please fill out all fields correctly. Ensure that hours volunteered is a valid number, and experience rating is between 1-5.");
        return;
    }

    // Temporary object to hold the form data.
    const volunteerData = {
        charityName: charityName,
        hoursVolunteered: hoursVolunteered,
        volunteerDate: volunteerDate,
        experienceRating: experienceRating
    };

    // Output the data to the console (this can later be sent to a server).
    console.log(volunteerData);

    // Put the data on the window object so it can be accessed during testing.
    window.volunteerData = volunteerData;  

    // Reset the form after it is submitted.
    document.getElementById('volunteer-form').reset();
    alert("Volunteer hours successfully submitted!");
});
