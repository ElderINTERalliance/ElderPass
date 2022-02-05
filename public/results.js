
/**
 * @module Results
 */

import { clearAllChildren, createEle, getAnalysis } from "./lib.mjs";

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
    return document.getElementById("date-filter").value;
}

// TODO: JSDOC
function createStudentEle(data) {
    const row = document.createElement("tr");
    row.className = "student-row";

    // we are guaranteed to have at least one entry
    const studentName = data.entries[0].fullName;

    console.log(data);

    row.appendChild(createEle("td", studentName));

    const entries = document.createElement("table");
    const heading = document.createElement("tr");
    heading.className = "student-data-headings";
    heading.appendChild(createEle("th", "Direction", "direction subheading"));
    heading.appendChild(createEle("th", "Teacher Name", "teacher-name subheading"));
    heading.appendChild(createEle("th", "Time", "time subheading"));
    entries.appendChild(heading);

    for (const entry of data.entries) {
        const info = document.createElement("tr");
        // TODO: Format time
        info.appendChild(createEle("td", entry.checkIn));
        info.appendChild(createEle("td", entry.teacherName));
        info.appendChild(createEle("td", entry.time));
        entries.appendChild(info);
    }
    row.appendChild(entries);

    return row;
}

// TODO: JSDOC
function displayResults(results) {
    const output = document.getElementById("output");
    clearAllChildren(output);
    if (results.error !== "") {
        output.appendChild(createEle("tr", "An unexpected error has occurred."))
    } else if (Object.keys(results.data).length === 0) {
        // if our object is empty
        output.appendChild(createEle("tr", "No students found"));
    } else {
        const row = document.createElement("tr");
        row.className = "main-heading";
        row.appendChild(createEle("th", "Student Name"));
        row.appendChild(createEle("th", "Student Data"));
        output.appendChild(row);

        for (const id in results.data) {
            output.appendChild(createStudentEle(results.data[id]));
        }
    }
}

// TODO: JSDOC
function displayLoading() {
    const output = document.getElementById("output");
    const result = document.createElement("tr")

    result.appendChild(createEle("td", "Loading..."));

    clearAllChildren(output);
    output.appendChild(result);
}

async function submit() {
    displayLoading();
    const response = await getAnalysis(getSelectedDate(), shouldFilterByDate());
    displayResults(response);
}

document
    .getElementById("submit")
    .addEventListener("click", submit);
