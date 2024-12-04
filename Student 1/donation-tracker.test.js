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
global.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
};

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
    global.localStorage.getItem.mockClear();
    global.localStorage.setItem.mockClear();
    global.localStorage.clear.mockClear();
});

describe('Donation Tracker Form (Stage One)', () => {
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

        // Collect data after form submission
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
        document.getElementById('charity').value = '';
        document.getElementById('amount').value = '50';
        document.getElementById('date').value = ''; 

        // Trigger form submission
        const form = document.getElementById('donationForm');
        form.dispatchEvent(new dom.window.Event('submit'));

        // Check the alert for missing fields
        expect(global.alert).toHaveBeenCalledWith('Please fill in all required fields.');
    });

    test('should flag invalid donation amount', () => {
        // Fill the form fields
        document.getElementById('charity').value = 'Red Cross';
        document.getElementById('amount').value = '-50'; 
        document.getElementById('date').value = '2024-11-30';

        // Trigger form submission
        const form = document.getElementById('donationForm');
        form.dispatchEvent(new dom.window.Event('submit'));

        // Check the alert for invalid amount
        expect(global.alert).toHaveBeenCalledWith('Please enter a valid donation amount.');
    });

    test('should store donation data in temporary data object', () => {
        // Fill the form fields
        document.getElementById('charity').value = 'Red Cross';
        document.getElementById('amount').value = '100';
        document.getElementById('date').value = '2024-11-30';
        document.getElementById('message').value = 'Keep up the great work!';

        // Trigger form submission
        const form = document.getElementById('donationForm');
        form.dispatchEvent(new dom.window.Event('submit'));

        // Check if the temporary data object contains the correct data
        const tempData = window.tempData; 
        expect(tempData).toEqual({
            charity: 'Red Cross',
            amount: 100,
            date: '2024-11-30',
            message: 'Keep up the great work!',
        });
    });
});

describe('Donation Tracker Table and Persistence (Stage Two)', () => {
    test('should store data in localStorage', () => {
        // Fill the form fields
        document.getElementById('charity').value = 'Red Cross';
        document.getElementById('amount').value = '100';
        document.getElementById('date').value = '2024-11-30';
        document.getElementById('message').value = 'Keep up the great work!';

        // Trigger form submission
        const form = document.getElementById('donationForm');
        form.dispatchEvent(new dom.window.Event('submit'));

        // Check if data is stored in localStorage
        const storedData = JSON.parse(localStorage.getItem('donations'));
        expect(storedData).toEqual([{
            charity: 'Red Cross',
            amount: 100,
            date: '2024-11-30',
            message: 'Keep up the great work!',
        }]);
    });

    test('should retrieve data from localStorage and load into table', () => {
        // Simulate existing data in localStorage
        const existingData = [
            { charity: 'Red Cross', amount: 100, date: '2024-11-30', message: 'Keep it up!' },
        ];
        localStorage.setItem('donations', JSON.stringify(existingData));

        // Reload the page (simulate page load)
        window.location.reload();

        // Check if the data is displayed in the table
        const tableRows = document.querySelectorAll('#donations-table tbody tr');
        expect(tableRows.length).toBe(1);
        expect(tableRows[0].cells[0].textContent).toBe('Red Cross');
        expect(tableRows[0].cells[1].textContent).toBe('$100');
        expect(tableRows[0].cells[2].textContent).toBe('2024-11-30');
        expect(tableRows[0].cells[3].textContent).toBe('Keep it up!');
    });

    test('should correctly calculate total donation amount in summary section', () => {
        // Simulate existing data in localStorage
        const existingData = [
            { charity: 'Red Cross', amount: 100, date: '2024-11-30', message: 'Keep it up!' },
            { charity: 'Food Bank', amount: 50, date: '2024-12-01', message: 'Great work!' },
        ];
        localStorage.setItem('donations', JSON.stringify(existingData));

        // Trigger form submission
        const form = document.getElementById('donationForm');
        form.dispatchEvent(new dom.window.Event('submit'));

        // Call function to update totalAmount display
        window.updateTotalAmount(); // Ensure this function updates the total amount in your UI

        // Check if the total amount is calculated correctly
        const totalAmount = document.getElementById('totalAmount').textContent;
        expect(totalAmount).toBe('$150');
    });

    test('should remove donation data from localStorage after deletion', () => {
        // Simulate existing data in localStorage
        const existingData = [
            { charity: 'Red Cross', amount: 100, date: '2024-11-30', message: 'Keep it up!' },
        ];
        localStorage.setItem('donations', JSON.stringify(existingData));

        // Simulate deleting a row
        const deleteButton = document.querySelector('.delete-button'); 
        deleteButton.click();

        // Check if localStorage has been updated
        const updatedData = JSON.parse(localStorage.getItem('donations'));
        expect(updatedData).toEqual([]);
    });
});
