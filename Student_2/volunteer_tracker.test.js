const { JSDOM } = require("jsdom");

describe("Volunteer Hours Tracker", () => {
    let dom;
    let form;
    let charityNameInput;
    let hoursVolunteeredInput;
    let dateInput;
    let ratingInput;
    let submitButton;

    beforeEach(() => {
        // Initialize JSDOM to mimic a browser environment.
        dom = new JSDOM(`
            <form id="volunteer-form">
                <input type="text" id="charity-name" name="charity-name">
                <input type="number" id="hours-volunteered" name="hours-volunteered">
                <input type="date" id="date" name="date">
                <input type="number" id="rating" name="rating">
                <button type="submit">Submit</button>
            </form>
        `);
        
       // Create mock DOM elements.
        form = dom.window.document.getElementById("volunteer-form");
        charityNameInput = dom.window.document.getElementById("charity-name");
        hoursVolunteeredInput = dom.window.document.getElementById("hours-volunteered");
        dateInput = dom.window.document.getElementById("date");
        ratingInput = dom.window.document.getElementById("rating");
        submitButton = dom.window.document.querySelector("button[type='submit']");

        // Add the submit event handler.
        const script = dom.window.document.createElement("script");
        script.textContent = `
            document.getElementById("volunteer-form").addEventListener("submit", function(event) {
                event.preventDefault();
                const charityName = document.getElementById("charity-name").value;
                const hoursVolunteered = parseFloat(document.getElementById("hours-volunteered").value);
                const date = document.getElementById("date").value;
                const rating = parseInt(document.getElementById("rating").value, 10);
                window.volunteerData = { charityName, hoursVolunteered, date, rating };
            });
        `;
        dom.window.document.body.appendChild(script);
    });

    test("should trigger the function on form submission", () => {
        charityNameInput.value = "Red Cross";
        hoursVolunteeredInput.value = "5";
        dateInput.value = "2024-11-26";
        ratingInput.value = "5";

        submitButton.click();

        expect(dom.window.volunteerData).toEqual({
            charityName: "Red Cross",
            hoursVolunteered: 5,
            date: "2024-11-26",
            rating: 5
        });
    });

    test("should validate required fields", () => {
        charityNameInput.value = "";
        hoursVolunteeredInput.value = "5";
        dateInput.value = "2024-11-26";
        ratingInput.value = "5";

        submitButton.click();
        expect(dom.window.volunteerData).toBeUndefined(); // Should not store data due to missing charity name
    });

    test("should validate hours volunteered", () => {
        charityNameInput.value = "Red Cross";
        hoursVolunteeredInput.value = "-1";  // Invalid hours
        dateInput.value = "2024-11-26";
        ratingInput.value = "5";

        submitButton.click();
        expect(dom.window.volunteerData).toBeUndefined(); // Data should not be saved because the hours are invalid.
    });

    test("should validate experience rating", () => {
        charityNameInput.value = "Red Cross";
        hoursVolunteeredInput.value = "5";
        dateInput.value = "2024-11-26";
        ratingInput.value = "6";  // Rating is invalid.

        submitButton.click();
        expect(dom.window.volunteerData).toBeUndefined(); // Data should not be saved because the rating is invalid.
    });
});
