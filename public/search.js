/**
 * This is the script for the / search page.
 * it allows teachers to search for students by name to check them in /out.
 * @module Search
 */

"use strict";

import { searchForStudents, submitStudent as submitStudentToServer } from "./lib.mjs";

async function submit() {
    const name = document.getElementById("studentName").value.trim();
    displayLoading();

    const response = await searchForStudents(name);

    clearStudents();

    if (response.error) {
        displayError(response.error);
    } else {
        displayStudents(response.data);
    }
}

function displayLoading() {
    clearStudents();

    const ele = createDiv("Loading...", "loading-text");

    document.getElementById("submission-data").appendChild(ele);
}

function displayError(text) {
    const errorMsg = document.createElement("div");
    errorMsg.class = "error-message";
    errorMsg.textContent = text;

    document.getElementById("submission-data").appendChild(errorMsg);
}

/**
 * Takes an array of student objects and displays
 * them to the screen
 * @param {Student[]} students 
 */
function displayStudents(students) {
    const result = document.createElement("div");
    result.className = "students-search-list";
    for (const student of students) {
        result.appendChild(createStudentEle(student))
    }
    document.getElementById("submission-data").appendChild(result);
}

/**
 * Creates a div element with text easily
 * @param {string} text
 * @param {string} className - Defaults to ""
 * @returns {HTMLElement} - A div with the specified text
 */
function createDiv(text, className = "") {
    const ele = document.createElement("div");
    ele.textContent = text;
    ele.className = className;
    return ele;
}

/**
 * Creates an html element with text easily
 * @param {string} text
 * @param {string} className - Defaults to ""
 * @returns {HTMLElement} - A div with the specified text
 */
function createEle(eleName, text, className = "") {
    const ele = document.createElement(eleName);
    ele.textContent = text;
    ele.className = className;
    return ele;
}

/**
 * Adds a student to the students displayed
 * @param {Student} student
 * @returns {HTMLElement} - A div with all fo the student data.
 */
function createStudentEle(student) {
    const result = document.createElement("div");

    // add button to choose student
    const button = document.createElement("button");
    button.textContent = "select";
    button.addEventListener("click", async () =>
        selectStudent(student.id, "IN")
        // TODO: remove "IN" and create proper state management
    );
    result.appendChild(button);

    // add the student data
    const ele = document.createElement("div");
    ele.className = "student-data";

    ele.appendChild(createEle("h4", student.fullName, "student-full-name"))
    ele.appendChild(createDiv(student.gradYear, "student-grad-year"))
    ele.appendChild(createDiv(student.id, "student-id"))

    result.appendChild(ele);

    return result;
}

function clearStudents() {
    clearAllChildren(document.getElementById("submission-data"))
}

function clearAllChildren(element) {
    while (element.firstChild) {
        element.firstChild.remove()
    }
}

/**
 * This sends the data to the server
 * TODO: add student name to queue/history
 * TODO: clear students afterwards
 * @param {string} studentId
 * @param {"IN"|"OUT"} direction
 */
async function selectStudent(studentId, direction) {
    try {
        const resp = await submitStudentToServer(studentId, direction);
        // clearStudents();
    } catch (err) {
        // handle error
    }
}

document.getElementById("submit").addEventListener("click", submit);
