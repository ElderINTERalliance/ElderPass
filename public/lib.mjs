/*
 * Library of functions to be reused.
 */

"use strict";

// modified from https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// TODO: add jsdoc
async function sendData(url, method = 'POST') {
    const options = {
        method: method,
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
    };
    if (method === 'POST')
        options["body"] = "";
    const response = await fetch(url, options);
    return response.json(); // parses JSON response into native JavaScript objects
}

// TODO: add jsdoc
async function searchForStudents(str) {
    return await sendData(`/api/search?name=${str}`, "GET");
}

/**
 * submits a student to the server
 * @param {string} studentId 
 * @param {string} direction 
 * @throws {StudentNotFoundError} - The student was not found
 * @returns {StudentResponse}
 */
async function submitStudent(studentId, direction) {
    const url = `/api/submitstudent?id=${studentId}&sign=${direction}`;
    const response = await sendData(url, "POST");
    if (response.error) {
        throw new StudentNotFoundError("I'm sorry. An error has occurred. Please try again.");
    } else {
        return response;
    }
}

/**
 * Clears all the children of an element
 * @param {HTMLElement} element 
 */
function clearAllChildren(element) {
    while (element.firstChild) {
        element.firstChild.remove();
    }
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

class StudentNotFoundError extends Error {
    /**
     * Creates a new StudentNotFoundError
     * @param {string} text - The text to display
     */
    constructor(text) {
        super(text);
        this.name = "StudentNotFoundError";
    }
}

export { searchForStudents, submitStudent, clearAllChildren, createDiv, createEle };
