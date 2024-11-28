const { JSDOM } = require('jsdom');

describe('Donation Tracker', () => {
  let dom;
  let form;
  let charityNameInput;
  let donationAmountInput;
  let donationDateInput;
  let donorCommentInput;
  let submitButton;

  beforeEach(() => {
    // Set up the JSDOM environment to simulate the browser
    dom = new JSDOM(`<!DOCTYPE html>
      <html>
        <body>
          <form id="donation-form">
            <input type="text" id="charity-name" name="charity-name">
            <input type="number" id="donation-amount" name="donation-amount">
            <input type="date" id="donation-date" name="donation-date">
            <textarea id="donor-comment" name="donor-comment"></textarea>
            <button type="submit">Submit Donation</button>
          </form>
        </body>
      </html>
    `);

    // Mock DOM elements
    form = dom.window.document.getElementById('donation-form');
    charityNameInput = dom.window.document.getElementById('charity-name');
    donationAmountInput = dom.window.document.getElementById('donation-amount');
    donationDateInput = dom.window.document.getElementById('donation-date');
    donorCommentInput = dom.window.document.getElementById('donor-comment');
    submitButton = dom.window.document.querySelector('button[type="submit"]');

    // Mock alert function
    global.alert = jest.fn();

    // Attach the event handler (as in the original JavaScript)
    const script = dom.window.document.createElement('script');
    script.textContent = `
      document.getElementById('donation-form').addEventListener('submit', function(event) {
        event.preventDefault();

        const charityName = document.getElementById('charity-name').value;
        const donationAmount = parseFloat(document.getElementById('donation-amount').value);
        const donationDate = document.getElementById('donation-date').value;
        const donorComment = document.getElementById('donor-comment').value;

        if (!charityName || !donationDate || isNaN(donationAmount) || donationAmount <= 0) {
          alert("Please fill out all required fields correctly. Ensure that the donation amount is a valid number greater than 0.");
          return;
        }

        window.donationData = { charityName, donationAmount, donationDate, donorComment };
        document.getElementById('donation-form').reset();
        alert("Donation successfully submitted!");
      });
    `;
    dom.window.document.body.appendChild(script);
  });

  test('should trigger the function on form submission', () => {
    charityNameInput.value = 'Red Cross';
    donationAmountInput.value = '100';
    donationDateInput.value = '2024-11-26';
    donorCommentInput.value = 'Keep up the good work!';

    form.submit(); // Using form.submit() instead of button click to trigger the form submission directly

    expect(dom.window.donationData).toEqual({
      charityName: 'Red Cross',
      donationAmount: 100,
      donationDate: '2024-11-26',
      donorComment: 'Keep up the good work!'
    });
  });

  test('should validate required fields', () => {
    charityNameInput.value = '';
    donationAmountInput.value = '100';
    donationDateInput.value = '2024-11-26';
    donorCommentInput.value = '';

    form.submit();

    expect(dom.window.donationData).toBeUndefined();
    expect(global.alert).toHaveBeenCalledWith('Please fill out all required fields correctly. Ensure that the donation amount is a valid number greater than 0.');
  });

  test('should validate donation amount', () => {
    charityNameInput.value = 'Red Cross';
    donationAmountInput.value = '-50'; // Invalid donation amount
    donationDateInput.value = '2024-11-26';
    donorCommentInput.value = 'Good cause!';

    form.submit();

    expect(dom.window.donationData).toBeUndefined();
    expect(global.alert).toHaveBeenCalledWith('Please fill out all required fields correctly. Ensure that the donation amount is a valid number greater than 0.');
  });

  test('should correctly populate the donation data object', () => {
    charityNameInput.value = 'Red Cross';
    donationAmountInput.value = '100';
    donationDateInput.value = '2024-11-26';
    donorCommentInput.value = 'Great cause, happy to help!';

    form.submit();

    expect(dom.window.donationData).toEqual({
      charityName: 'Red Cross',
      donationAmount: 100,
      donationDate: '2024-11-26',
      donorComment: 'Great cause, happy to help!'
    });
  });
});
