/**
 * Scans the student's QR Code - Client Script
 * @module Scan
 * @see https://github.com/mebjas/html5-qrcode/tree/master/examples/html5
 */

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

// Make sure we don't scan the same QR code several times:
var lastResult = 0;
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
    if (decodedText !== lastResult) {
        lastResult = decodedText;
        // Handle on success condition with the decoded message.
        console.log(JSON.stringify(decodedResult, null, 2))
    }
}

docReady(function () {
    var html5QrcodeScanner = new Html5QrcodeScanner("qr-reader", {
        fps: 10,
        qrbox: 250,
    });
    html5QrcodeScanner.render(onScanSuccess);
});
