/**
 * This is the script for the / search page.
 * it allows teachers to search for students by name to check them in /out.
 * @module Search
 */

"use strict";

import { searchForStudents, submitStudent as submitStudentToServer, clearAllChildren, createDiv, createEle } from "./lib.mjs";
import { mountHistory, addToHistory } from "./history.mjs";
import { getDirection, mountDirection } from "./direction.mjs";

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
    result.className = "students-search-list d-grid gap-1";
    for (const student of students) {
        result.appendChild(createStudentEle(student));
    }
    const dataContainer = document.getElementById("submission-data");
    dataContainer.appendChild(createEle("h5", `${students.length} student${s(students.length)} found.`, "students-count"))
    dataContainer.appendChild(result);
}

/**
 * Adds a student to the students displayed
 * @param {Student} student
 * @returns {HTMLElement} - A div with all fo the student data.
 */
function createStudentEle(student) {
    const result = document.createElement("div");
    result.className = "student-data-container d-inline-block";

    // add button to choose student
    const button = document.createElement("button");
    button.addEventListener("click", async () =>
        selectStudent(student, getDirection())
    );
    button.className = "btn btn-outline-primary btn-sm w-100"

    // add the student data
    const ele = document.createElement("div");
    ele.className = "student-data";

    ele.appendChild(createEle("h4", student.fullName, "student-full-name my-0 mx-auto px-auto d-inline-block me-1"));
    ele.appendChild(createDiv(`(${student.gradYear})`, "student-grad-year fs-6 d-inline-block"));

    button.appendChild(ele);
    result.appendChild(button);

    return result;
}

function clearStudents() {
    clearAllChildren(document.getElementById("submission-data"));
}

function clearInput() {
    const input = document.getElementById("studentName")
    input.value = "";
    input.select();
}

/**
 * This selects a student as signing in/out of a flex period.
 * @async
 * @param {Student} student
 * @param {"IN"|"OUT"} direction
 */
async function selectStudent(student, direction) {
    try {
        await submitStudentToServer(student.id, direction);
        clearStudents();
        clearInput();
        addToHistory(student, direction);
    } catch (err) {
        console.error(err);
        displayError("Could not select student. Please try again, or contact support if this is a frequent issue.");
    }
}

document.getElementById("studentName").addEventListener("keydown", (key) => {
    if (key.code === "Enter")
        submit();
});

document.getElementById("submit").addEventListener("click", submit);

mountHistory();
mountDirection();
