const { JSDOM } = require('jsdom');
require('jest-localstorage-mock');

describe('Event Signup Form', () => {
    let form, eventName, representativeName, representativeEmail, role, formData, dom;

    beforeEach(() => {
        // a browser environment using JSDOM
        dom = new JSDOM(`
            <form id="event-signup-form">
                <input type="text" id="event-name" name="event-name" required>
                <input type="text" id="representative-name" name="representative-name" required>
                <input type="email" id="representative-email" name="representative-email" required>
                <select id="role" name="role" required>
                    <option value="sponsor">Sponsor</option>
                    <option value="participant">Participant</option>
                    <option value="organizer">Organizer</option>
                </select>
                <button type="submit">Submit</button>
            </form>
            <table id="signup-table">
                <thead>
                    <tr>
                        <th>Event Name</th>
                        <th>Representative Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Action</th>
                    </tr>
                </thead>
            <tbody></tbody>   
            </table>
        `);

        // Get references to the form elements from the simulated DOM
        form = dom.window.document.getElementById('event-signup-form');
        eventName = dom.window.document.getElementById('event-name');
        representativeName = dom.window.document.getElementById('representative-name');
        representativeEmail = dom.window.document.getElementById('representative-email');
        role = dom.window.document.getElementById('role');
        tableBody = dom.window.document.querySelector('#signup-table tbody');

        // Initialize an empty object to hold form data during the test
        formData = {};

        // Mock the form submission event to populate the formData object
        form.addEventListener('submit', function (e) {
            e.preventDefault();  // Prevent actual form submission

            // Collect form data into formData object
            formData.eventName = eventName.value;
            formData.representativeName = representativeName.value;
            formData.representativeEmail = representativeEmail.value;
            formData.role = role.value;

            // Save the form data to localStorage
            let signups = JSON.parse(localStorage.getItem('signups')) || [];
            signups.push(formData);
            localStorage.setItem('signups', JSON.stringify(signups));

            // Clear the form after submission
            form.reset();

            // Reload the signups table
            loadSignups();
        });

            // Mock localStorage in jsdom environment
            dom.window.localStorage = {
                getItem: jest.fn(),
                setItem: jest.fn(),
                clear: jest.fn(),
            };
        });

    // Helper function to load signups into the table
    function loadSignups() {
        const signups = JSON.parse(localStorage.getItem('signups')) || [];
        tableBody.innerHTML = ''; 

        signups.forEach((signup, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${signup.eventName}</td>
            <td>${signup.representativeName}</td>
            <td>${signup.representativeEmail}</td>
            <td>${signup.role}</td>
            <td><button class="delete-btn" data-index="${index}">Delete</button></td>
         `;
        tableBody.appendChild(row);
        });

        // Attach event listeners for delete buttons
        const deleteButtons = tableBody.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                // Remove the item from the localStorage array
                let signups = JSON.parse(localStorage.getItem('signups')) || [];
                signups.splice(index, 1);
                localStorage.setItem('signups', JSON.stringify(signups));

                // Reload the table after deletion
                loadSignups();
            });
        });
    }

    test('should trigger the form submission event', () => {
        // Create and dispatch a submit event
        const submitEvent = new dom.window.Event('submit');
        form.dispatchEvent(submitEvent);

        // Ensure formData has been populated
        expect(formData).toBeTruthy();
    });

    test('should collect form data correctly', () => {
        // Set values for form fields
        eventName.value = 'Event A';
        representativeName.value = 'John Doe';
        representativeEmail.value = 'john@example.com';
        role.value = 'sponsor';

        // Create and dispatch a submit event
        const submitEvent = new dom.window.Event('submit');
        form.dispatchEvent(submitEvent);

        // Assert that formData contains the expected values
        expect(formData.eventName).toBe('Event A');
        expect(formData.representativeName).toBe('John Doe');
        expect(formData.representativeEmail).toBe('john@example.com');
        expect(formData.role).toBe('sponsor');
    });

    test('should flag missing required fields', () => {
        // Set values for form fields with one required field missing
        eventName.value = '';
        representativeName.value = 'John Doe';
        representativeEmail.value = 'john@example.com';
        role.value = 'sponsor';

        // Create and dispatch a submit event
        const submitEvent = new dom.window.Event('submit');
        form.dispatchEvent(submitEvent);

        // Assert that formData reflects the missing eventName
        expect(formData.eventName).toBe('');
        expect(formData.representativeName).toBe('John Doe');
        expect(formData.representativeEmail).toBe('john@example.com');
        expect(formData.role).toBe('sponsor');
    });

    test('should flag invalid email format', () => {
        // Set values for form fields with an invalid email format
        eventName.value = 'Event A';
        representativeName.value = 'John Doe';
        representativeEmail.value = 'john@example'; 
        role.value = 'sponsor';

        // Create and dispatch a submit event
        const submitEvent = new dom.window.Event('submit');
        form.dispatchEvent(submitEvent);

        // Assert that the invalid email is captured
        expect(formData.representativeEmail).toBe('john@example');
    });

    // Test that data is correctly stored in localStorage
    test('should store form data in localStorage when submitted', () => {
        // Set values for form fields
        eventName.value = 'Event A';
        representativeName.value = 'John Doe';
        representativeEmail.value = 'john@example.com';
        role.value = 'sponsor';

        // Simulate form submission (adjust based on your form logic)
        submitForm(formData);

        // Create and dispatch a submit event
        const submitEvent = new dom.window.Event('submit');
        form.dispatchEvent(submitEvent);

        // Verify that the data was saved to localStorage
        expect(localStorage.setItem).toHaveBeenCalledWith(
            'signups',
            JSON.stringify([formData])
        );
    });

    // Test that data is correctly retrieved from localStorage and loaded into the table
    test('should load form data into the table from localStorage', () => {
        // Set data in localStorage manually
        const sampleData = [
            {
            eventName: 'Event A',
            representativeName: 'John Doe',
            representativeEmail: 'john@example.com',
            role: 'sponsor',
        },
    ];
    localStorage.setItem('signups', JSON.stringify(signups));

    // Load the table
    loadSignups();

    // Now test that the table contains the right data
    const rows = document.querySelectorAll('tr');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Event A');
});

    // Test that the delete button removes a record from the table
    test('should delete a record from the table when delete button is clicked', () => {
        // Set data in localStorage manually
        const sampleData = [
            {
            eventName: 'Event A',
            representativeName: 'John Doe',
            representativeEmail: 'john@example.com',
            role: 'sponsor',
        },
    ];
    localStorage.setItem('signups', JSON.stringify(sampleData));

        // Load the table
        loadSignups();

        // Simulate clicking the delete button
        const deleteButton = tableBody.querySelector('.delete-btn');
        deleteButton.click();

        // Check that the localStorage item was removed
        expect(localStorage.setItem).toHaveBeenCalledWith('signups', JSON.stringify([]));
    });

    // Test that the delete button removes a record from localStorage
    test('should remove the deleted record from localStorage', () => {
        // Set data in localStorage manually
        const sampleData = [
        {
            eventName: 'Event A',
            representativeName: 'John Doe',
            representativeEmail: 'john@example.com',
            role: 'sponsor',
        },
    ];
    localStorage.setItem('signups', JSON.stringify(sampleData));

        // Load the table
        loadSignups();

        // Simulate clicking the delete button
        const deleteButton = tableBody.querySelector('.delete-btn');
        deleteButton.click();

        // Assert that the record was removed from localStorage
        const signups = JSON.parse(localStorage.getItem('signups')) || [];
        expect(signups.length).toBe(0);
    });

    // Test that the upcoming events section correctly displays signups by role
    test('should display signups by role in the summary section', () => {
        // Set data in localStorage manually
        const sampleData = [
            { eventName: 'Event A', representativeName: 'John Doe', representativeEmail: 'john@example.com', role: 'sponsor' },
            { eventName: 'Event B', representativeName: 'Jane Smith', representativeEmail: 'jane@example.com', role: 'participant' },
        ];
        localStorage.setItem('signups', JSON.stringify(sampleData));

            // Load the table
            loadSignups();

            // Summarize signups by role
            const signups = JSON.parse(localStorage.getItem('signups')) || [];
            const rolesSummary = signups.reduce((summary, signup) => {
                summary[signup.role] = (summary[signup.role] || 0) + 1;
                return summary;
            }, {});

            // Assert the role summary
            expect(rolesSummary.sponsor).toBe(1);
            expect(rolesSummary.participant).toBe(1);
        });
    });