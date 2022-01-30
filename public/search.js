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
 * this function should be used to make numbers plural.
 * @param {number} num - the number to be formatted
 * @returns {"s" | ""}
 */
function s(num) {
    if (num === 1) {
        return "";
    } else {
        return "s";
    }
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
        result.appendChild(createStudentEle(student));
    }
    const dataContainer = document.getElementById("submission-data");
    dataContainer.appendChild(createEle("h5", `${students.length} student${s(students.length)} found.`, "students-count"))
    dataContainer.appendChild(result);
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
    result.className = "student-data-container";

    // add button to choose student
    const button = document.createElement("button");
    button.addEventListener("click", async () =>
        selectStudent(student.id, "IN")
        // TODO: remove "IN" and create proper state management
    );

    // add the student data
    const ele = document.createElement("div");
    ele.className = "student-data";

    ele.appendChild(createEle("h4", student.fullName, "student-full-name"));
    ele.appendChild(createDiv(`(${student.gradYear})`, "student-grad-year"));

    button.appendChild(ele);
    result.appendChild(button);

    return result;
}

function clearStudents() {
    clearAllChildren(document.getElementById("submission-data"));
}

function clearAllChildren(element) {
    while (element.firstChild) {
        element.firstChild.remove();
    }
}

function clearInput() {
    const input = document.getElementById("studentName")
    input.value = "";
    input.select();
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
        await submitStudentToServer(studentId, direction);
        clearStudents();
        clearInput();
    } catch (err) {
        displayError("Could not select student. Please try again, or contact support if this is a frequent issue.");
    }
}

document.getElementById("studentName").addEventListener("keydown", (key) => {
    if (key.code === "Enter")
        submit();
});

document.getElementById("submit").addEventListener("click", submit);
