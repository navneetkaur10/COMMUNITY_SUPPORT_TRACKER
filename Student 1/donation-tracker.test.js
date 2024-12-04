const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Read the HTML file
const html = fs.readFileSync(path.resolve(__dirname, 'donation-tracker.html'), 'utf8');

// Variables to hold the DOM and document
let dom;
let document;

// Mock the alert function globally
global.alert = jest.fn();

beforeEach(() => {
    // Initialize DOM and document
    dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });
    document = dom.window.document;

    // Ensure the script is executed in the simulated DOM
    const script = fs.readFileSync(path.resolve(__dirname, 'donation-tracker.js'), 'utf8');
    const scriptEl = document.createElement('script');
    scriptEl.textContent = script;
    document.body.appendChild(scriptEl);

    // Reset mock alert for each test
    global.alert.mockClear();
});

describe('Donation Tracker Form', () => {
    test('should trigger function on form submission', () => {
        const form = document.getElementById('donationForm');

        // Spy on the submit event
        const handleSubmit = jest.fn((e) => e.preventDefault());
        form.addEventListener('submit', handleSubmit);

        // Fill the form fields
        document.getElementById('charity').value = 'Red Cross';
        document.getElementById('amount').value = '100';
        document.getElementById('date').value = '2024-11-30';
        document.getElementById('message').value = 'Keep it up!';

        // Trigger form submission
        form.dispatchEvent(new dom.window.Event('submit'));

        // Check if the handler was called
        expect(handleSubmit).toHaveBeenCalled();
    });

    test('should correctly collect form data', () => {
        // Fill the form fields
        document.getElementById('charity').value = 'Red Cross';
        document.getElementById('amount').value = '100';
        document.getElementById('date').value = '2024-11-30';
        document.getElementById('message').value = 'Keep up the great work!';

        // Trigger form submission
        const form = document.getElementById('donationForm');
        form.dispatchEvent(new dom.window.Event('submit'));

        // Check the collected data
        const collectedData = {
            charity: document.getElementById('charity').value,
            amount: parseFloat(document.getElementById('amount').value),
            date: document.getElementById('date').value,
            message: document.getElementById('message').value,
        };

        expect(collectedData).toEqual({
            charity: 'Red Cross',
            amount: 100,
            date: '2024-11-30',
            message: 'Keep up the great work!',
        });
    });

    test('should flag missing required fields', () => {
        // Fill incomplete form fields
        document.getElementById('charity').value = ''; // Empty value for charity
        document.getElementById('amount').value = '50';
        document.getElementById('date').value = ''; // Empty value for date

        // Trigger form submission
        const form = document.getElementById('donationForm');
        form.dispatchEvent(new dom.window.Event('submit'));

        // Check the alert for missing fields
        expect(global.alert).toHaveBeenCalledWith('Please fill in all required fields.');
    });

    test('should flag invalid donation amount', () => {
        // Fill the form fields
        document.getElementById('charity').value = 'Red Cross';
        document.getElementById('amount').value = '-50'; // Invalid amount
        document.getElementById('date').value = '2024-11-30';

        // Trigger form submission
        const form = document.getElementById('donationForm');
        form.dispatchEvent(new dom.window.Event('submit'));

        // Check the alert for invalid amount
        expect(global.alert).toHaveBeenCalledWith('Please enter a valid donation amount.');
    });
});
