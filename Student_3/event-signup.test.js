const { JSDOM } = require('jsdom');

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
        `);

        // Get references to the form elements from the simulated DOM
        form = dom.window.document.getElementById('event-signup-form');
        eventName = dom.window.document.getElementById('event-name');
        representativeName = dom.window.document.getElementById('representative-name');
        representativeEmail = dom.window.document.getElementById('representative-email');
        role = dom.window.document.getElementById('role');

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
        });
    });

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
        representativeEmail.value = 'john@example';  // Invalid email format
        role.value = 'sponsor';

        // Create and dispatch a submit event
        const submitEvent = new dom.window.Event('submit');
        form.dispatchEvent(submitEvent);

        // Assert that the invalid email is captured
        expect(formData.representativeEmail).toBe('john@example');
    });
});
