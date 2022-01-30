"use strict";

/**
 * @module History
 * @description The list of students that have already been checked in.
 */

import { searchForStudents, submitStudent as submitStudentToServer, clearAllChildren, createDiv, createEle } from "./lib.mjs";

function clearHistory() {
    clearAllChildren(document.getElementById("history"));
}

function mountHistory() {
    clearHistory();
}

/**
 * generates a history element
 * @param {Student} student 
 * @returns {HTMLElement} - an "li" element with the student's name
 */
function createHistoryEle(student) {
    return createEle("li", student.fullName, "history-entry");
}

/**
 * adds a student to the history of students checked in/out
 * @param {Student} student 
 */
function addToHistory(student) {
    document
        .getElementById("history")
        .prepend(createHistoryEle(student));
}

export { mountHistory, addToHistory, clearHistory };
