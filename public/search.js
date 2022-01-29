/**
 * This is the script for the / search page.
 * it allows teachers to search for students by name to check them in /out.
 * @module Search
 */

"use strict";

import { searchForStudents } from "./lib.mjs";

async function submit() {
    const name = document.getElementById("studentName").value.trim();
    const response = await searchForStudents(name);

    clearStudents();

    if (response.error) {
        displayError(response.error);
    } else {
        displayStudents(response.data);
    }
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
    const ele = document.createElement("div");
    ele.className = "student";

    ele.appendChild(createEle("h4", student.fullName, "student-full-name"))
    ele.appendChild(createDiv(student.gradYear, "student-grad-year"))
    ele.appendChild(createDiv(student.id, "student-id"))

    return ele;
}

function clearStudents() {
    clearAllChildren(document.getElementById("submission-data"))
}

function clearAllChildren(element) {
    while (element.firstChild) {
        element.firstChild.remove()
    }
}

document.getElementById("submit").addEventListener("click", submit);
