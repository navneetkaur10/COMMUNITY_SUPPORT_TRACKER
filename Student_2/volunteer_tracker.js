document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('volunteer-form');
    const charityNameInput = document.getElementById('charity-name');
    const hoursVolunteeredInput = document.getElementById('hours-volunteered');
    const volunteerDateInput = document.getElementById('volunteer-date');
    const experienceRatingInput = document.getElementById('experience-rating');
    const logTableBody = document.querySelector('#log-table tbody');
    const totalHoursValue = document.getElementById('total-hours-value');

    // Get saved volunteer logs from localStorage
    let volunteerLogs = JSON.parse(localStorage.getItem('volunteerLogs')) || [];
    renderLogs();  

    // Take action when the form is submitted
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        // Gather form data
        const charityName = charityNameInput.value;
        const hoursVolunteered = parseFloat(hoursVolunteeredInput.value);
        const volunteerDate = volunteerDateInput.value;
        const experienceRating = parseInt(experienceRatingInput.value);

        // Validate form data
        if (!charityName || !volunteerDate || isNaN(hoursVolunteered) || isNaN(experienceRating) || experienceRating < 1 || experienceRating > 5) {
            alert("Please fill out all fields correctly.");
            return;
        }

        // Create the volunteer data object
        const volunteerData = { charityName, hoursVolunteered, volunteerDate, experienceRating };
        volunteerLogs.push(volunteerData);

        // Store data in localStorage
        localStorage.setItem('volunteerLogs', JSON.stringify(volunteerLogs));

        // Reset form and re-render table
        form.reset();
        renderLogs();
    });

    // Function to render logs in the table
    function renderLogs() {
        logTableBody.innerHTML = '';  
        let totalHours = 0;

        volunteerLogs.forEach((log, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${log.charityName}</td>
                <td>${log.hoursVolunteered}</td>
                <td>${log.volunteerDate}</td>
                <td>${log.experienceRating} Stars</td>
                <td><button class="delete-btn" data-index="${index}">Delete</button></td>
            `;
            logTableBody.appendChild(row);
            totalHours += log.hoursVolunteered;
        });

        // Refresh the total hours
        totalHoursValue.textContent = totalHours;

        // Attach click events to delete buttons

        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const index = button.getAttribute('data-index');
                deleteLog(index);
            });
        });
    }

    // Function to delete a log from localStorage and re-render
    function deleteLog(index) {
        volunteerLogs.splice(index, 1);  // Remove the log
        localStorage.setItem('volunteerLogs', JSON.stringify(volunteerLogs));  
        renderLogs();  
    }
});
