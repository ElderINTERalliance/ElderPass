
/**
 * @module Results
 */

import { getAnalysis } from "./lib.mjs";

/**
 * gets the user's selection as a boolean
 * @returns {boolean}
 */
function shouldFilterByDate() {
    return document.getElementById("should-filter-date").checked
}

/**
 * converts the user's chosen date into an iso timestamp
 * @returns {string}
 */
function getSelectedDate() {
    const dateStamp = document.getElementById("date-filter").value;
    console.log(dateStamp)
    return dateStamp;
}

function displayResults(results) {
    document.getElementById("output").textContent =
        JSON.stringify(results, null, 4);
}

async function submit() {
    const response = await getAnalysis(getSelectedDate(), shouldFilterByDate())
    displayResults(response);
}

document.getElementById("submit").addEventListener("click", submit);
