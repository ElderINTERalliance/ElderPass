/**
 * Scans the student's QR Code - Client Script
 * @module Scan
 * @see https://github.com/mebjas/html5-qrcode/tree/master/examples/html5
 */

import { submitStudent as submitStudentToServer } from "./lib.mjs";
import { mountHistory, addToHistory } from "./history.mjs";
import { getDirection, mountDirection } from "./direction.mjs";

/**
 * execute function when document has fully loaded
 * @param {function} fn - The callback to execute on document load
 */
function docReady(fn) {
    if (
        document.readyState === "complete" ||
        document.readyState === "interactive"
    ) {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

/**
 * Takes a student id and submits it to the server.
 * 
 * @async
 * @param {string} studentID 
 */
async function handleStudentID(studentID) {
    try {
        const direction = getDirection();
        const result = await submitStudentToServer(studentID, direction);
        addToHistory(result.data, direction);
    } catch (err) {
        console.error("Student ID was not found", studentID, err);
    }
}

// Make sure we don't scan the same QR code several times:
var lastResult = {
    lastDirection: "",
    lastSTU: ""
};
/**
 * @description The function called when a QR code is successfully scanned.
 * @param {string} decodedText - The text like "STU#######" that we actually want
 * @param {Object} decodedResult 
 * @param {string} decodedResult.decodedText - The text like "STU#######" that we actually want
 * @param {Object} decodedResult.result
 * @param {string} decodedResult.result.text - The text like "STU#######" that we actually want
 * @param {Object} decodedResult.result.format
 * @param {number} decodedResult.result.format.format - 0 = QR Code
 * @param {string} decodedResult.result.format.formatName - e.g. "QR_CODE"
 */
function onScanSuccess(decodedText, decodedResult) {
    // if either the student id or the direction has changed
    if (decodedText !== lastResult.lastSTU || getDirection() !== lastResult.lastDirection) {
        lastResult = {
                lastDirection: getDirection(),
                lastSTU: decodedText
            }
            // If the decodedText is invalid, we let the server fail to find it.
            // That way, we have logs
        handleStudentID(decodedText);
    }
}

docReady(function() {
    var html5QrcodeScanner = new Html5QrcodeScanner("qr-reader", {
        fps: 10,
        qrbox: 250,
    });
    html5QrcodeScanner.render(onScanSuccess);
});

mountHistory();
mountDirection();