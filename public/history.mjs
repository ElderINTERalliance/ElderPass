"use strict";

/**
 * @module History
 * @description The list of students that have already been checked in.
 */

// TODO: add undo button for history
// TODO: develop delete endpoint for undo button

import { searchForStudents, submitStudent as submitStudentToServer, clearAllChildren, createDiv, createEle } from "./lib.mjs";

function clearHistory() {
    clearAllChildren(document.getElementById("history"));
    clearAllChildren(document.getElementById("history-list"));
}

function mountHistory() {
    clearHistory();
}

/**
 * generates a history element
 * @param {Student} student 
 * @param {string} direction
 * @returns {HTMLElement} - an "li" element with the student's name
 */
function createHistoryEle(student, direction) {
    const message = `${student.fullName} ${direction}`;
    return createEle("li", message, "history-entry");
}

/**
 * adds a student to the history of students checked in/out
 * @param {Student} student 
 * @param {"IN"|"OUT"} direction
 */
function addToHistory(student, direction) {
    document
        .getElementById("history")
        .prepend(createHistoryEle(student, direction));
    document
        .getElementById("history-list")
        .prepend(createHistoryEle(student, direction));
}

export { mountHistory, addToHistory, clearHistory };