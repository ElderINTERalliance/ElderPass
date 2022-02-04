/**
 * Library of functions reusable functions
 * @module Lib
 */

"use strict";

/**
 * Sends 
 * @async 
 * @param {string} url - The URL to send data to
 * @param {string} method - The [HTTP request method](@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
 */
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

/**
 * Finds all the students whose name match the string
 * @async
 * @param {string} str 
 * @returns {Student[]}
 */
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
 * asks the server for data analysis
 * @param {string} ISOTimestamp 
 * @param {boolean} shouldFilterByDate
 * @returns {Object} - TODO: Figure this out
 */
async function getAnalysis(ISOTimestamp, shouldFilterByDate) {
    const url = `/api/analyze?shouldFilterByDate=${shouldFilterByDate}&date=${ISOTimestamp ?? ""}`;
    console.log(url);
    return await sendData(url, "GET");
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

export {
    searchForStudents,
    submitStudent,
    clearAllChildren,
    createDiv,
    createEle,
    getAnalysis
};
