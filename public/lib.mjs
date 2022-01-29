/*
 * Library of functions to be reused.
 */

"use strict";

// modified from https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// TODO: add jsdoc
async function sendData(url, method = 'POST') {
    const response = await fetch(url, {
        method: method,
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
    });
    if (method === 'POST')
        response["body"] = "";
    return response.json(); // parses JSON response into native JavaScript objects
}

// TODO: add jsdoc
async function searchForStudents(str) {
    return await sendData(`/api/search?name=${str}`, "GET");
}

// TODO: add jsdoc
async function submitStudent(studentId, direction) {
    // TODO: Implement
    console.log({ studentId, direction })
}

export { searchForStudents, submitStudent };
