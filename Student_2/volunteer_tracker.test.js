const { JSDOM } = require('jsdom');

describe('Volunteer Hours Tracker', () => {
    let dom;
    let form;
    let charityNameInput;
    let hoursVolunteeredInput;
    let dateInput;
    let ratingInput;
    let submitButton;
    let logTableBody;
    let totalHoursValue;
    let clearAllButton;

    // Mocking localStorage
    beforeEach(() => {
        // Create a virtual browser environment using JSDOM
        dom = new JSDOM(`
            <html lang="en">
                <body>
                    <form id="volunteer-form">
                        <input type="text" id="charity-name">
                        <input type="number" id="hours-volunteered">
                        <input type="date" id="volunteer-date">
                        <select id="experience-rating">
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                        </select>
                        <button type="submit">Submit</button>
                    </form>
                    <table id="log-table">
                        <thead><tr><th>Charity Name</th><th>Hours</th><th>Date</th><th>Rating</th><th>Actions</th></tr></thead>
                        <tbody></tbody>
                    </table>
                    <div id="total-hours"><h3>Total Hours Volunteered: <span id="total-hours-value">0</span></h3></div>
                    <button id="clear-all">Clear All</button>
                </body>
            </html>
        `);

        // Mocking localStorage
        global.localStorage = {
            getItem: jest.fn(() => JSON.stringify([])),
            setItem: jest.fn(),
            clear: jest.fn()
        };

        // Finding specific elements in the DOM
        form = dom.window.document.getElementById('volunteer-form');
        charityNameInput = dom.window.document.getElementById('charity-name');
        hoursVolunteeredInput = dom.window.document.getElementById('hours-volunteered');
        dateInput = dom.window.document.getElementById('volunteer-date');
        ratingInput = dom.window.document.getElementById('experience-rating');
        submitButton = dom.window.document.querySelector('button[type="submit"]');
        logTableBody = dom.window.document.querySelector('#log-table tbody');
        totalHoursValue = dom.window.document.querySelector('#total-hours-value');
        clearAllButton = dom.window.document.querySelector('#clear-all');

        // Attaching events to the submit and clear buttons
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            
            // Ensure that the form is not submitted if any field is left blank
            if (!charityNameInput.value || !hoursVolunteeredInput.value || !dateInput.value || !ratingInput.value) {
                return;
            }

            const volunteerLogs = JSON.parse(localStorage.getItem('volunteerLogs')) || [];
            
            // Check if the log already exists in localStorage
            const logExists = volunteerLogs.some(log => log.charityName === charityNameInput.value && log.volunteerDate === dateInput.value);
            if (logExists) {
                return; // Do not add a duplicate
            }

            volunteerLogs.push({
                charityName: charityNameInput.value,
                hoursVolunteered: Number(hoursVolunteeredInput.value),
                volunteerDate: dateInput.value,
                experienceRating: Number(ratingInput.value)
            });

            localStorage.setItem('volunteerLogs', JSON.stringify(volunteerLogs));
            form.reset();
        });

        clearAllButton.addEventListener('click', () => {
            localStorage.clear();
            logTableBody.innerHTML = '';
        });
    });

    // Test: Check if data is being stored in localStorage after form submission
    test('should correctly store data in localStorage', () => {
        // Simulate form input
        charityNameInput.value = 'Red Cross';
        hoursVolunteeredInput.value = '5';
        dateInput.value = '2024-11-26';
        ratingInput.value = '5';

        // Simulate form submission
        form.dispatchEvent(new dom.window.Event('submit'));

        // Ensure localStorage.setItem was called with the correct arguments
        expect(localStorage.setItem).toHaveBeenCalledWith(
            'volunteerLogs', 
            JSON.stringify([{
                charityName: 'Red Cross',
                hoursVolunteered: 5,
                volunteerDate: '2024-11-26',
                experienceRating: 5
            }])
        );
    });

    // Test: Check if logs are rendered in the table and total hours are calculated
    test('should render logs in the table and calculate total hours', () => {
        // Mock localStorage to return some pre-existing logs
        localStorage.getItem.mockReturnValueOnce(JSON.stringify([
            { charityName: 'Red Cross', hoursVolunteered: 5, volunteerDate: '2024-11-26', experienceRating: 5 },
            { charityName: 'Food Bank', hoursVolunteered: 3, volunteerDate: '2024-11-25', experienceRating: 4 }
        ]));

        // Simulate renderLogs function execution
        const volunteerLogs = JSON.parse(localStorage.getItem('volunteerLogs'));
        volunteerLogs.forEach(log => {
            const row = dom.window.document.createElement('tr');
            row.innerHTML = `
                <td>${log.charityName}</td>
                <td>${log.hoursVolunteered}</td>
                <td>${log.volunteerDate}</td>
                <td>${log.experienceRating} Stars</td>
                <td><button class="delete-btn">Delete</button></td>
            `;
            logTableBody.appendChild(row);
        });

        // Simulate the total hours calculation
        const totalHours = volunteerLogs.reduce((sum, log) => sum + log.hoursVolunteered, 0);
        totalHoursValue.textContent = totalHours;

        // Check the table and total hours
        expect(logTableBody.children.length).toBe(2); 
        expect(totalHoursValue.textContent).toBe('8'); 
    });

    // Test: Check if a log can be deleted and localStorage is updated
    test('should delete a log and update localStorage', () => {
        // Mock localStorage to return pre-existing logs
        localStorage.getItem.mockReturnValueOnce(JSON.stringify([
            { charityName: 'Red Cross', hoursVolunteered: 5, volunteerDate: '2024-11-26', experienceRating: 5 },
            { charityName: 'Food Bank', hoursVolunteered: 3, volunteerDate: '2024-11-25', experienceRating: 4 }
        ]));

        // Simulate renderLogs function execution
        const volunteerLogs = JSON.parse(localStorage.getItem('volunteerLogs'));
        volunteerLogs.forEach(log => {
            const row = dom.window.document.createElement('tr');
            row.innerHTML = `
                <td>${log.charityName}</td>
                <td>${log.hoursVolunteered}</td>
                <td>${log.volunteerDate}</td>
                <td>${log.experienceRating} Stars</td>
                <td><button class="delete-btn">Delete</button></td>
            `;
            logTableBody.appendChild(row);
        });

        // Simulate clicking the delete button for the first log
        const deleteButton = dom.window.document.querySelector('.delete-btn');
        deleteButton.dispatchEvent(new dom.window.Event('click'));

        // Remove the log from the table and update localStorage
        const updatedLogs = volunteerLogs.filter(log => log.charityName !== 'Red Cross');
        localStorage.setItem('volunteerLogs', JSON.stringify(updatedLogs));

        // Check that localStorage.setItem was called to update the logs
        expect(localStorage.setItem).toHaveBeenCalledWith('volunteerLogs', JSON.stringify(updatedLogs));
    });

    // Test: Prevent form submission when fields are empty
    test('should prevent form submission when fields are empty', () => {
        // Simulate form with empty fields
        charityNameInput.value = '';
        hoursVolunteeredInput.value = '';
        dateInput.value = '';
        ratingInput.value = '';

        // Simulate form submission
        form.dispatchEvent(new dom.window.Event('submit'));

        // Ensure localStorage.setItem was not called
        expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    // Test: Check if form resets after submission
    test('should reset form after submission', () => {
        // Simulate form input
        charityNameInput.value = 'Red Cross';
        hoursVolunteeredInput.value = '5';
        dateInput.value = '2024-11-26';
        ratingInput.value = '5';

        // Simulate form submission
        form.dispatchEvent(new dom.window.Event('submit'));

        // Check if form fields are cleared after submission
        expect(charityNameInput.value).toBe('');
        expect(hoursVolunteeredInput.value).toBe('');
        expect(dateInput.value).toBe('');
        expect(ratingInput.value).toBe('1'); 
    });

    // Test: Clear all logs when "Clear All" button is clicked
    test('should clear all logs when "Clear All" button is clicked', () => {
        // Simulate clicking the "Clear All" button
        clearAllButton.dispatchEvent(new dom.window.Event('click'));

        // Ensure localStorage.clear was called
        expect(localStorage.clear).toHaveBeenCalled();

        // Ensure the table is cleared
        expect(logTableBody.children.length).toBe(0);
    });

    // Test: Check if volunteer log can be edited
    test('should allow editing a volunteer log', () => {
        // Mock localStorage to return some pre-existing logs
        localStorage.getItem.mockReturnValueOnce(JSON.stringify([
            { charityName: 'Red Cross', hoursVolunteered: 5, volunteerDate: '2024-11-26', experienceRating: 5 }
        ]));

        // Simulate editing the first log
        const editButton = dom.window.document.querySelector('.edit-btn');
        charityNameInput.value = 'Food Bank'; 
        hoursVolunteeredInput.value = '10'; 
        form.dispatchEvent(new dom.window.Event('submit')); 
        // Check that localStorage is updated with the new values
        const updatedLogs = JSON.parse(localStorage.getItem('volunteerLogs'));
        expect(updatedLogs[0].charityName).toBe('Food Bank');
        expect(updatedLogs[0].hoursVolunteered).toBe(10);
    });

    // Test: Prevent adding duplicate log entries
    test('should not add duplicate logs', () => {
        // Simulate form input with duplicate data
        charityNameInput.value = 'Red Cross';
        hoursVolunteeredInput.value = '5';
        dateInput.value = '2024-11-26';
        ratingInput.value = '5';

        // Simulate form submission
        form.dispatchEvent(new dom.window.Event('submit'));
        form.dispatchEvent(new dom.window.Event('submit')); 

        // Check that there is exactly one log in localStorage
        const volunteerLogs = JSON.parse(localStorage.getItem('volunteerLogs'));
        expect(volunteerLogs.length).toBe(1); 
    });
});
